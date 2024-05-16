import { filterLookup } from '../site-data.js';
import { RestylingCircleMarker } from './restyling-circle-marker.js';

const api_key = "AAPK2e0a5cf929c34c46a7e4272f2ead6aa4ilvTW75nWcHxARC1ZF--cRIhmfhAJcsRkjdmZQr6C2CDqUxeqMF1yu6E7qzaEq_q"; 

export class SiteMap extends window.L.Evented {
  constructor() {
    super();
    this.selected = false;
    this._highlight = null;

    /* ~~~~~~~~ Map ~~~~~~~~ */
    //create a map, center it, and set the zoom level. 
    //set zoomcontrol to false because we will add it in a different corner. 
    const map = this.map = L.map('map', {zoomControl:false}).setView([44.25, -89.9], 7);
    this.el = document.querySelector('#map');
     
     /* ~~~~~~~~ Zoom Control ~~~~~~~~ */
    //place a zoom control in the top right: 
    new L.Control.Zoom({position: 'topright'}).addTo(map);

     
    /* ~~~~~~~~ Basemap Layers ~~~~~~~~ */

    // Esri basemaps     
    // other basemap options can be found here: https://developers.arcgis.com/esri-leaflet/maps/change-the-basemap-style-v2/ 

    //stage any basemap from Esri: 
    function esriBasemap(style){
      return L.esri.Vector.vectorBasemapLayer(style, {
        apiKey: api_key,  
        version:2
      })
    }
    
    const basemapLayers = {

      "Streets Basemap": esriBasemap("arcgis/streets").addTo(map), 
      "Topographic Basemap": esriBasemap("arcgis/topographic"),
      "Imagery Basemap": esriBasemap("arcgis/imagery") 

  }

  //add a basemap controller to the map. 
  L.control.layers(basemapLayers, null, {collapsed:true}).addTo(map); 

    let sources = filterLookup.reduceRight((result, curr) => {
      if (curr.source && curr.source.geojson) {
        result.push(
          window.fetch(curr.source.geojson)
          .then((res) => res.json())
          .then((geojson)=>({
            name: curr[curr.prop],
            color: curr.color,
            data: geojson})))
      }
      return result;
    }, []);

    Promise.all(sources).then((responses) => {
        this.layers = responses.map((res) => {
          return L.geoJSON(res.data, {
            name: res.name,
            pointToLayer: function(geoJsonPoint, latlon) {
              return new RestylingCircleMarker(latlon, {
                weight: 2,
                color: res.color,
                radius: RestylingCircleMarker.calcRadius(map.getZoom()),
                stroke: false,
                fill: false
              });
            }
          });
        });
        this.layers.forEach(l => l.on('click', (e) => {
          if (this._highlight !== e.propagatedFrom) {
            this.fire('interaction', e.propagatedFrom.feature.properties);
          } else {
            this.fire('interaction');
          }
        }))
        this.layers.forEach(l => l.addTo(map));
      let lookup = {};
      this.layers.forEach(function(layer, idx, arr) {
        layer.eachLayer(function(obj) {
          let wid = obj.feature.properties['Wid'] || obj.feature.properties['WID'] || obj.feature.properties['WGNHS_ID'];
          let siteCode = SiteMap.getSiteCode(obj.feature.properties);
          let siteName = obj.feature.properties['Site_Name'] || obj.feature.properties['SiteName'];
          let latLon = obj.getLatLng();
          let cache = lookup[siteCode] || {
            'Site_Code': siteCode,
            'Site_Name': siteName,
            'WID': wid,
            'Latitude': latLon['lat'].toFixed(6),
            'Longitude': latLon['lng'].toFixed(6),
            point: obj,
            datas: new Array(arr.length)
          };
          obj.feature.properties['Site_Code'] = siteCode;
          obj.feature.properties['Site_Name'] = siteName;
          obj.feature.properties['Data_Type'] = layer.options.name;

          cache.datas[idx] = obj.feature.properties;
          lookup[siteCode] = cache;
        });
      });
      this._lookup = lookup;
      this.fire('init');
    });
  }

  static getDataType(params) {
    return params['Data_Type'];
  }

  static getSiteCode(params) {
    let keys = ['WID','Wid', 'WGNHS_ID', 'ID', 'Site_Code'];
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

  updatePoints(activePoints) {
    this.map.fire('filterpoints', {
      detail: {
        resolve: (props) => {
          const activeSet = activePoints[SiteMap.getDataType(props)];
          const result = activeSet.has('' + SiteMap.getSiteCode(props));
          return result;
        }
      }
    });
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