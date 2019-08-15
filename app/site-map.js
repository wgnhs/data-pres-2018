import { RestylingCircleMarker } from './restyling-circle-marker.js';

export class SiteMap extends window.L.Evented {
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
      }))
    }),new Promise(function(resolve, reject) {
      quat.once('load', (function() {
        resolve();
      }))
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
    }, undefined)
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
      this._highlight.bringToFront()
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

  runFilter({matchClass, incl, filt}) {
    const resolve = function runPointThroughFilters(props) {
      let included = incl.length > 0 && incl.reduce((prev, curr) => {
        return prev || curr.resolve(props);
      }, false);
      let spec = filt.filter((rule) => rule.resolveGroup(props));
      let result = included && spec.length < 1;
      if (included && !result) {
        if ("ALL" === matchClass) {
          result = spec.reduce((prev, curr) => {
            return prev && curr.resolve(props);
          }, true);
        } else {
          result = spec.reduce((prev, curr) => {
            return prev || curr.resolve(props);
          }, false);
        }
      }
      return result;
    }

    console.log('eh');
    this.layers.forEach((layer) => {
      layer._d_activePoints = new Set();
      Object.entries(layer._layers).forEach((ent) => {
        if (resolve(ent[1].feature.properties)) {
          layer._d_activePoints.add('' + ent[0]);
        }
      })
    });
    this.map.fire('filterpoints', {
      detail: {
        resolve: (props) => {
          return this.layers.reduce((prev, layer) => {
            const code = SiteMap.getSiteCode(props);
            const has = (layer._d_activePoints)?layer._d_activePoints.has('' + code): false;
            const result = prev || has;
            return result;
          }, false);
        }
      }
    });
    this.fire('filtered');
  }

  getResultsInfo() {
    const stats = ()=>{
      let result = [];
      this.layers.forEach((layer) => {
        let stats = {};
        stats.name = layer.options.name;
  
        let entries = Object.entries(layer._layers);
        stats.total = entries.length;
        stats.current = (layer._d_activePoints)?layer._d_activePoints.size:0;

        result.push(stats);
      })
      return result;
    }
    return stats();
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