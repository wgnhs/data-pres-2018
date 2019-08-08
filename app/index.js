(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('lit-element'), require('@uirouter/core')) :
  typeof define === 'function' && define.amd ? define(['lit-element', '@uirouter/core'], factory) :
  (global = global || self, factory(global.common, global.common));
}(this, function (litElement, core) { 'use strict';

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
      this._activeBackup = {
        color: this.options.color,
        stroke: this.options.stroke,
        fill: this.options.fill
      };
      this.setStyle({
        color: 'var(--palette-active)',
        stroke: true,
        fill: true
      });
    },
    removeHighlight: function() {
      if (this._activeBackup) {
        this.setStyle(this._activeBackup);
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
        name: 'Geophysical Log Data',
        url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0",
        pointToLayer: function(geoJsonPoint, latlon) {
          return new RestylingCircleMarker(latlon, {
            weight: 2,
            color: 'var(--palette-blue)',
            radius: RestylingCircleMarker.calcRadius(map.getZoom()),
            stroke: false,
            fill: false
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
        name: 'Quaternary Core Data',
        url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0",
        pointToLayer: function(geoJsonPoint, latlon) {
          return new RestylingCircleMarker(latlon, {
            weight: 2,
            color: 'var(--palette-green)',
            radius: RestylingCircleMarker.calcRadius(map.getZoom()),
            stroke: false,
            fill: false
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
      })]).then(() => {
        let lookup = {};
        this.layers.forEach(function(layer, idx, arr) {
          layer.eachFeature(function(obj) {
            let wid = obj.feature.properties['Wid'];
            let siteCode = SiteMap.getSiteCode(obj.feature.properties);
            let siteName = obj.feature.properties['Site_Name'] || obj.feature.properties['SiteName'];
            let latLon = obj.getLatLng();
            let cache = lookup[siteCode] || {
              'Site_Code': siteCode,
              'Site_Name': siteName,
              'Wid': wid,
              'Latitude': latLon['lat'],
              'Longitude': latLon['lng'],
              point: obj,
              datas: new Array(arr.length)
            };
            obj.feature.properties['Site_Code'] = siteCode;
            obj.feature.properties['Data_Type'] = layer.options.name;

            cache.datas[idx] = obj.feature.properties;
            lookup[siteCode] = cache;
          });
        });
        this._lookup = lookup;
        this.fire('init');
      });

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

    //TODO HACK
    getPoint(params) {
      let result = null;
      let cache = this._lookup[SiteMap.getSiteCode(params)];
      if (cache) {
        result = cache.point;
      }
      return result;
    }

    getSite(params) {
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

    selectSite(params) {
      let result = this.getSite(params);
      this.selectPoint(params);
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

  // https://gist.github.com/gordonbrander/2230317
  function genId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  class FilterGroup {
    constructor(config) {
      Object.assign(this, config);
      if (!this.id) {
        this.id = genId();
      }
    }
    activate(context) {
      let result = null;
      const input = context.detail.checked;
      if (context.toggleable && input) {
        result = {
          id: context.id,
          resolve: function(feature) {
            return feature[context.prop] === context.value;
          }
        };
      }
      return result;
    }
  }

  class CheckboxControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="checkbox">
    `;
    }
    handle(context) {
      let result = null;

      let input = context.target.nextElementSibling.checked;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class GTLTControl {
    constructor(isDate) {
      this.id = genId();
      this.gtName = (isDate)?'after':'at least';
      this.ltName = (isDate)?'before':'less than';
    }
    get next() {
      return litElement.html`
      <select>
        <option value="gt">${this.gtName}</option>
        <option value="lt">${this.ltName}</option>
      </select>
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;
      context['gt'] = (a, b) => (a >= b);
      context['lt'] = (a, b) => (a < b);

      const predicate = context[context.target.nextElementSibling.value];
      const input = context.target.nextElementSibling.nextElementSibling.value;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              isValid = predicate(feature[context.prop], input);
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class SelectControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <select ?disabled="${!this.options}">
        <option></option>
        ${(!this.options)?'':this.options.map((el) => litElement.html`
        <option value="${el}">${el}</option>
        `)}
      </select>
    `;
    }
    init(uniques) {
      if (!this.options) {
        this.options = Array.from(uniques).sort();
      }
    }
    handle(context) {
      let result = null;

      const input = context.target.nextElementSibling.value;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = feature[context.prop];
              isValid = value === input;
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class TextControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;

      const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = ('' + feature[context.prop]).trim().toUpperCase();
              isValid = value === input;
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class ContainsControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;

      const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = ('' + feature[context.prop]).trim().toUpperCase();
              isValid = value.includes(input);
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class SiteData {
    constructor(...layer) {

      // Define aggregated data for visualization
      this._aggrKeys = [
        'County',
        'Drill_Meth'
      ];
      this.aggrData = [];
      for (let l of layer) {
        this.aggrData.push(SiteData._gatherAggrData(l, this._aggrKeys));
      }

      this.datas = this.aggrData.map((el)=>el.data).reduce((prev, curr)=>prev.concat(curr),[]);
      this.uniques = {};
      this._aggrKeys.forEach((key) => this.uniques[key] = new Set(this.datas.map((el)=>el[key]).filter((el)=>!!el)));
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
          let group = aggrData.aggr[key];
          if (result[key] && 'number' === typeof result[key]) {
            if (!group.max || group.max < result[key]) {
              group.max = result[key];
            }
            if (!group.min || group.min > result[key]) {
              group.min = result[key];
            }
          }
        });
        aggrData.data.push(result);
      });

      return aggrData;
    }
  }

  const filterLookup = [
    new FilterGroup({
      title: "Site Information",
      open: true,
      sections: [
        {
          fields: {
            "County": {
              controls: [
                new SelectControl()
              ]
            },
            // "SiteName": {
            //   controls: [
            //     new ContainsControl()
            //   ]
            // },
            "Site_Name": {
              controls: [
                new ContainsControl()
              ]
            },
            "Wid": {
              controls: [
                new TextControl()
              ]
            },
          }
        }
      ]
    }),
    new FilterGroup({
      title: "Geophysical Log Data",
      prop: 'Data_Type',
      'Data_Type': 'Geophysical Log Data',
      toggleable: true,
      active: true,
      sections: [
        {
          fields: {
            "RecentLog": {
              controls: [
                new GTLTControl(true)
              ]
            },
            "MaxDepth": {
              controls: [
                new GTLTControl()
              ]
            }
          }
        },
        {
          title: "Geologic",
          fields: {
            "Norm_Res": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Caliper": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Gamma": {
              controls: [
                new CheckboxControl()
              ]
            },
            "SP": {
              controls: [
                new CheckboxControl()
              ]
            },
            "SPR": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Spec_Gamma": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        },
        {
          title: "Hydrogeologic",
          fields: {
            "Fluid_Cond": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Flow_Spin": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Fluid_Temp": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Fluid_Res": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Flow_HP": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        },
        {
          title: "Image",
          fields: {
            "OBI": {
              controls: [
                new CheckboxControl()
              ]
            },
            "ABI": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Video": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        }
      ]
    }),
    new FilterGroup({
      title: "Quaternary Core Data",
      prop: 'Data_Type',
      'Data_Type': 'Quaternary Core Data',
      toggleable: true,
      active: true,
      sections: [
        {
          fields: {
            "Drill_Year": {
              controls: [
                new GTLTControl(true)
              ]
            },
            "Depth_Ft": {
              controls: [
                new GTLTControl()
              ]
            },
            "Drill_Meth": {
              controls: [
                new SelectControl()
              ]
            },
          }
        },
        {
          title: "Analyses available",
          fields: {
            "Subsamples": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Photos": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Grainsize": {
              controls: [
                new CheckboxControl()
              ]
            }
          }
        }
      ]
    })
  ];

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
  window.pdfPanel = document.querySelector('#sketch');
  document.querySelectorAll('site-details').forEach(function(details) {
    details['pdfpanel'] = window.pdfPanel;
  });

  window.siteMap.once('init', function() {
    window.siteData = new SiteData(window.siteMap.bore, window.siteMap.quat);
    window.aggrData = siteData.aggrData;
    document.querySelector('#filter').init(window.siteData.uniques);

    var deselectFeature = function() {
      window.pdfPanel.hide();
      document.querySelectorAll('site-details').forEach(function(details) {
        details['siteinfo'] = null;
      });
    };

    async function selectFeature(info) {
      deselectFeature();
      document.querySelectorAll('site-details').forEach(function(details) {
        details['siteinfo'] = info;
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
        let attr = window.siteMap.selectSite(params);
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
        let attr = window.siteMap.selectSite(params);
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
    window.router.router.transitionService.onEnter({}, ()=>{
      document.querySelector('#spinner').setAttribute('data-closed', true);
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

  document.addEventListener('toggle-pdf-panel', function(e) {
    window.siteMap.setVisibility(e.detail.closed);
  });

}));
