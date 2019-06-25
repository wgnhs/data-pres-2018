/* JAVASCRIPT */

var sidebar = document.querySelector('#sidebar');
var details = document.querySelector('site-details');
var pdfView = document.querySelector('pdf-view');
var selectFeature = function(info) {
  details.siteinfo = null;
  details.siteinfo = info;
  sidebar.switchTab('details');
  pdfView['pdfsrc'] = null;
  pdfView['pdfsrc'] = (info.Wid)?'https://data.wgnhs.wisc.edu/geophysical-logs/'+info.Wid+'.pdf':null;

};
var deselectFeature = function() {
  details.siteinfo = null;
  sidebar.switchTab('default');

  pdfView['pdfsrc'] = null;
}

/* ~~~~~~~~ Map ~~~~~~~~ */
//create a map, center it, and set the zoom level. 
//set zoomcontrol to false because we will add it in a different corner. 
var map = L.map('map', {zoomControl:false}).setView([45, -89.623861], 6);

/* ~~~~~~~~ Map Layers ~~~~~~~~ */
//basemap from Open Street Map
var osm = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

/* ~~~~~~~~ Zoom Control ~~~~~~~~ */
//place a zoom control in the top right: 
new L.Control.Zoom({position: 'topright'}).addTo(map);

var calcRadius = (a) => Math.max(Math.floor(a/1.5),3);
var RestylingCircleMarker = L.CircleMarker.extend({ 
  getEvents: function() {
    return {
      zoomend: this._restyle,
      filterpoints: this._filter
    }
  }, 
  _restyle: function(e){
    this.setRadius(calcRadius(e.target.getZoom()))
  },
  _filter: function(e) {
    let isDisplayable = e.detail.resolve(this.feature.properties);
    if (isDisplayable) {
      this.setStyle({
        stroke: true,
        fill: true
      })
    } else {
      this.setStyle({
        stroke: false,
        fill: false
      })
    }
  }
});
/* +++++++++++ Borehole Geophysical Logs layer +++++++++++ */ 
var bore = L.esri.featureLayer({
    url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0",
    pointToLayer: function(geoJsonPoint, latlon) {
      return new RestylingCircleMarker(latlon, {
        weight: 2,
        radius: calcRadius(map.getZoom())
      });
    }
}).addTo(map);
bore.bindPopup(function(e){
    return L.Util.template("<h3>{SiteName}</h3>", e.feature.properties); 
});
bore.on('popupopen', function(e) {
  var info = e.propagatedFrom.feature.properties;
  selectFeature(info);
});
bore.on('popupclose', function(e) {
  deselectFeature();
});

/* +++++++++++ Sediment Core layer +++++++++++ */ 
var quat = L.esri.featureLayer({
  url: "https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0",
  pointToLayer: function(geoJsonPoint, latlon) {
    return new RestylingCircleMarker(latlon, {
      weight: 2,
      color: '#33AA44',
      radius: calcRadius(map.getZoom())
    });
  }
}).addTo(map);
quat.bindPopup(function(e){
    return L.Util.template("<h3>{Site_Name}</h3>", e.feature.properties); 
});
quat.on('popupopen', function(e) {
  var info = e.propagatedFrom.feature.properties;
  selectFeature(info);
});
quat.on('popupclose', function(e) {
  deselectFeature();
});




document.addEventListener('toggle-pdf', function(e) {
  var mapEl = document.querySelector('#map');
  if (!e.detail.closed) {
    mapEl.setAttribute('data-closed', true);
  } else {
    mapEl.removeAttribute('data-closed');
    map.invalidateSize();
  }
});