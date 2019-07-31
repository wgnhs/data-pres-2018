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
      }))
    }),new Promise(function(resolve, reject) {
      quat.once('load', (function() {
        resolve();
      }))
    })]).then(function() {
      let lookup = {};
      this.layers.forEach(function(layer) {
        layer.eachFeature(function(obj) {
          obj.feature.properties.Latitude = obj.getLatLng()['lat'];
          obj.feature.properties.Longitude = obj.getLatLng()['lng'];
          lookup[SiteMap.getSiteCode(obj.feature.properties)] = obj;
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
    }, undefined)
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