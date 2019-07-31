(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('@uirouter/core')) :
  typeof define === 'function' && define.amd ? define(['@uirouter/core'], factory) :
  (global = global || self, factory(global.common));
}(this, function (core) { 'use strict';

  const RestylingCircleMarker = L.CircleMarker.extend({
    getEvents: function() {
      return {
        zoomend: this._restyle,
        filterpoints: this._filter
      }
    }, 
    _restyle: function(e){
      this.setRadius(RestylingCircleMarker.calcRadius(e.target.getZoom()));
    },
    _filter: function(e) {
      let isDisplayable = e.detail.resolve(this.feature.properties);
      if (isDisplayable) {
        this.setStyle({
          stroke: true,
          fill: true
        });
      } else {
        this.setStyle({
          stroke: false,
          fill: false
        });
      }
    },
    highlight: function() {
      this._activeBackup = this.options.color;
      this.setStyle({'color': 'orange'});
    },
    removeHighlight: function() {
      if (this._activeBackup) {
        this.setStyle({'color': this._activeBackup});
        this._activeBackup = null;
      }
    }
  });

  RestylingCircleMarker.calcRadius = (a) => Math.max(a/1.5,3);

  class SiteMap extends window.L.Evented {
    constructor() {
      super();
      this.selected = false;
      this._highlight = null;

      /* ~~~~~~~~ Map ~~~~~~~~ */
      //create a map, center it, and set the zoom level. 
      //set zoomcontrol to false because we will add it in a different corner. 
      const map = this.map = L.map('map', {zoomControl:false}).setView([45, -89.623861], 7);
      this.el = document.querySelector('#map');
       
       /* ~~~~~~~~ Zoom Control ~~~~~~~~ */
      //place a zoom control in the top right: 
      new L.Control.Zoom({position: 'topright'}).addTo(map);

       
      /* ~~~~~~~~ Basemap Layers ~~~~~~~~ */
       
      // basemaps from Open Street Map
      const osmhot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors', 
        label: "OpenStreetMap Humanitarian"
      }).addTo(map);

      // Esri basemaps 
      const esrisat = L.esri.basemapLayer('Imagery', {label: "Esri Satellite"});
      
      // add the basemap control to the map  
      var basemaps = [osmhot, esrisat]; 
      map.addControl(L.control.basemaps({
         basemaps: basemaps, 
         tileX: 0, 
         tileY: 0, 
         tileZ: 1
      })); 

      /* +++++++++++ Borehole Geophysical Logs layer +++++++++++ */ 
      let bore = this.bore = L.esri.featureLayer({
        url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0",
        pointToLayer: function(geoJsonPoint, latlon) {
          return new RestylingCircleMarker(latlon, {
            weight: 2,
            radius: RestylingCircleMarker.calcRadius(map.getZoom())
          });
        }
      }).on('click', (function(e) {
        if (this._highlight !== e.propagatedFrom) {
          this.fire('interaction', e.propagatedFrom.feature.properties);
        } else {
          this.fire('interaction');
        }
      }).bind(this));

      /* +++++++++++ Sediment Core layer +++++++++++ */ 
      let quat = this.quat = L.esri.featureLayer({
        url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0",
        pointToLayer: function(geoJsonPoint, latlon) {
          return new RestylingCircleMarker(latlon, {
            weight: 2,
            color: '#33AA44',
            radius: RestylingCircleMarker.calcRadius(map.getZoom())
          });
        }
      }).on('click', (function(e) {
        if (this._highlight !== e.propagatedFrom) {
          this.fire('interaction', e.propagatedFrom.feature.properties);
        } else {
          this.fire('interaction');
        }
      }).bind(this));

      this.layers = [bore, quat];

      Promise.all([new Promise(function(resolve, reject) {
        bore.once('load', (function() {
          resolve();
        }));
      }),new Promise(function(resolve, reject) {
        quat.once('load', (function() {
          resolve();
        }));
      })]).then(function() {
        let lookup = {};
        this.layers.forEach(function(layer) {
          layer.eachFeature(function(obj) {
            let siteCode = SiteMap.getSiteCode(obj.feature.properties);
            obj.feature.properties['Site_Code'] = siteCode;
            obj.feature.properties.Latitude = obj.getLatLng()['lat'];
            obj.feature.properties.Longitude = obj.getLatLng()['lng'];
            lookup[siteCode] = obj;
          });
        });
        this._lookup = lookup;
        this.fire('init');
      }.bind(this));

      bore.addTo(map);
      quat.addTo(map);
    }

    static getSiteCode(params) {
      let keys = ['Wid', 'ID', 'Site_Code'];
      let result = keys.reduce((prev, curr) => {
        return prev || params[curr];
      }, undefined);
      return result;
    }

    getPoint(params) {
      let result = this._lookup[SiteMap.getSiteCode(params)];
      return result;
    }

    zoomToPoint(site) {
      let point = this.getPoint(site);
      if (point) {
        this.map.setZoomAround(point.getLatLng(), 15);
      }
    }

    getHighlightPoint() {
      // console.log('retrieve highlight point');
      let result = this._highlight;
      return result;
    }

    setHighlightPoint(point) {
      if (point) {
        // console.log('set highlight point');
        this._highlight = point;
        this._highlight.bringToFront();
        this._highlight.highlight();
      } else {
        this.clearSelection();
      }
    }

    selectPoint(params) {
      let result = null;
      // console.log('select point on map:', site);
      let point = this.getPoint(params);
      if (point) {
        result = point.feature.properties;
        let highlightPoint = this.getHighlightPoint();
        if (point !== highlightPoint) {
          this.clearSelection();
          this.setHighlightPoint(point);
        }
      }
      return result;
    }

    clearSelection() {
      // console.log('clear highlight group');
      if (this._highlight) {
        this._highlight.bringToBack();
        this._highlight.removeHighlight();
      }
      this._highlight = null;
    }

    setVisibility(isVisible) {
      if (isVisible) {
        this.el.removeAttribute('data-closed');
        this.map.invalidateSize();
      } else {
        this.el.setAttribute('data-closed', true);
      }
    }


  }

  class SiteData {
    constructor(...layer) {

      // Define aggregated data for visualization
      this._aggrKeys = [];
      this.aggrData = [];
      for (let l of layer) {
        this.aggrData.push(SiteData._gatherAggrData(l, this._aggrKeys));
      }
    }

    static _gatherAggrData(layer, aggrKeys) {
      const aggrData = {
        aggr: {},
        data: []
      };

      // Collect datasets and aggregates
      layer.eachFeature(function(obj, l) {
        let result = {};
        aggrKeys.forEach(function(key) {
          result[key] = obj.feature.properties[key];
          if (!aggrData.aggr[key]) {
            aggrData.aggr[key] = {};
          }
          if (result[key] && 'number' === typeof result[key]) {
            if (!aggrData.aggr[key].max || aggrData.aggr[key].max < result[key]) {
              aggrData.aggr[key].max = result[key];
            }
            if (!aggrData.aggr[key].min || aggrData.aggr[key].min > result[key]) {
              aggrData.aggr[key].min = result[key];
            }
          }
        });
        aggrData.data.push(result);
      });

      return aggrData;
    }
  }

  const DEFAULT_ROUTE = 'entry';

  class SiteRouter extends window.L.Evented {

    constructor() {
      super();
      this.router = new core.UIRouter();
      this.router.plugin(core.pushStateLocationPlugin);
      this.router.plugin(core.servicesPlugin);
      this.routes = {};
    }

    start() {
      this.router.urlService.rules.initial({ state: DEFAULT_ROUTE });
      this.router.urlService.rules.otherwise({ state: DEFAULT_ROUTE });
      // this.router.trace.enable(1);
      this.router.urlService.listen();
      this.router.urlService.sync();
    }

    addRoute(config) {
      if (config && config.name) {
        this.routes[config.name] = config;
        this.router.stateRegistry.register(config);
      }
    }

    /**
     * clear selection
     */
    clearRoute() {
      this.setRoute();
    }

    setRoute(name, params) {
      if (arguments.length > 0 && this.routes[name]) {
        this.router.stateService.go(name, params);
      } else {
        this.router.stateService.go(DEFAULT_ROUTE);
      }
    }

    link(name, params) {
      let result = '';
      if (params) {
        result = this.router.stateService.href(name, params);
      } else {
        result = this.router.stateService.href(name);
      }
      return result;
    }

  }

  window.siteMap = new SiteMap();
  window.sidebar = document.querySelector('#sidebar');

  window.siteMap.once('init', function() {
    window.siteData = new SiteData(window.siteMap.bore, window.siteMap.quat);
    window.aggrData = siteData.aggrData;

    var deselectFeature = function() {
      document.dispatchEvent(new CustomEvent('toggle-pdf', {bubbles: true, detail: {closed: true}}));
      document.querySelectorAll('site-details').forEach(function(details) {
        details['siteinfo'] = null;
      });
      document.querySelectorAll('pdf-view').forEach(function(sketch) {
        sketch['pdfsrc'] = null;
      });
    };

    async function selectFeature(info) {
      deselectFeature();
      document.querySelectorAll('site-details').forEach(function(details) {
        details['siteinfo'] = info;
      });
      document.querySelectorAll('pdf-view').forEach(function(sketch) {
        sketch['pdfsrc'] = (info.Wid)?'https://data.wgnhs.wisc.edu/geophysical-logs/'+info.Wid+'.pdf':null;
      });
      return true;
    }
    window.router = new SiteRouter();
    window.router.addRoute({
      name: 'entry',
      url: '/',
      onEnter: function(trans, state) {
        // console.log('route-entry');
        window.siteMap.clearSelection();
        deselectFeature();
        document.querySelector('#app').setAttribute('data-view', 'app');
        window.sidebar.switchTab('default');
        window.siteMap.setVisibility(true);
      },
      onExit: function(trans, state) {

      },
    });
    window.router.addRoute({
      name: 'view',
      url: '/view/:Site_Code',
      // params: {
      //   'Site_Code': {
      //     array: true
      //   }
      // },
      onEnter: function(trans, state) {
        // console.log('route-view');
        let params = trans.params();
        let attr = window.siteMap.selectPoint(params);
        if (attr) {
          document.querySelectorAll('site-details').forEach(function(details) {
            details['printLayout'] = false;
          });
          selectFeature(attr).then(() => {
            document.querySelector('#app').setAttribute('data-view', 'app');
            window.sidebar.switchTab('details');
            window.siteMap.setVisibility(true);
          });
        } else {
          window.router.clearRoute();
        }
      },
      onExit: function(trans, state) {

      },
    });
    window.router.addRoute({
      name: 'print',
      url: '/print/:Site_Code',
      // params: {
      //   'Site_Code': {
      //     array: true
      //   }
      // },
      onEnter: function(trans, state) {
        // console.log('route-print');
        let params = trans.params();
        let attr = window.siteMap.selectPoint(params);
        if (attr) {
          document.querySelectorAll('site-details').forEach(function(details) {
            details['printLayout'] = true;
          });
          selectFeature(attr).then(() => {
            document.querySelector('#app').removeAttribute('data-view');
            window.sidebar.switchTab('details');
            window.siteMap.setVisibility(false);
          });
        } else {
          window.router.clearRoute();
        }
      },
      onExit: function(trans, state) {

      },
    });
    // Start the router
    window.router.start();

    window.siteMap.on('interaction', (params) => {
      if (params['Site_Code']) {
        window.router.setRoute('view', params);
      } else {
        window.router.clearRoute();
      }
    });
  });

  document.addEventListener('clear-selection', function(e) {
    window.router.clearRoute();
  });

  document.addEventListener('toggle-print', function(e) {
    if (e.detail.on) {
      window.router.setRoute('print', e.detail.params);
    } else {
      window.router.setRoute('view', e.detail.params);
    }
  });

  document.addEventListener('toggle-pdf', function(e) {
    window.siteMap.setVisibility(e.detail.closed);
  });

}));
