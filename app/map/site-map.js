import { filterLookup } from '../site-data.js';
import { RestylingCircleMarker } from './restyling-circle-marker.js';

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
     
    // // basemaps from Open Street Map
    // const osmhot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors', 
    //   label: "OpenStreetMap Humanitarian"
    // });

    // // CARTO Positron
    // const positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    //   attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
    //   label: 'CARTO Positron'
    // });

    //AAPTa-EOHNZi39GdL6MxFWRr78w..0s1wiKhEOA3b5rNVgkP8jMLehM9J-f4QVVAgp1p-xuoxkqzjjZ0gsRgpxDDLNU9Cqsat6uN6Rsz4RKmXh_kJXIneN9RgRhoTV6N9dJGiXuP4NThWjF49AOZBDRu3t97IiZbwfKdgCRHB0M_eI0JKyNNLG5-md6b38SHkQOCZOedI6scobacowoZnz4lqUucVLmQLgp5FrA45WpuCeh-khTLzVJz_UWRA5gZIg6IBj6kymQ..AT1_cYN0QnG4

    // CARTO Voyager
    const voyager = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_284f_1_da1246c5eee298ee0185c526', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      label: 'CARTO Voyager'
    })

    // Esri basemaps 
    //const esristreets = L.esri.basemapLayer('Streets', {label: "Esri Streets"});
    //const esrisat = L.esri.basemapLayer('Imagery', {label: "Esri Satellite"});

    const accessToken = encodeURI("AAPTafv2pzFw0A5c3IPLLdagYew..BxCuR6l0wL6UBxKgmjs7pxTQdCSCU_kMP0QT3zJ9ON1Y_ZEV1kfxI9VYg-WGNvrFF6XoYnGMVyyYoaJBb-I2cQuHBChYVfOkFxxXmOHIQNIZUxe5TISbwlQnJkxvJ4r4YTd6dljwu-haBTKnVynjx-gjBm0KVREg3Ol8XxCt5qkUb5GwcAlfGKKnukyGVQs5UoSLnRYjM3DGq6_61tuUhq4ScO_aQGJFjc0gN1WYvf-vnA..AT1_cYN0QnG4");
    const esristreets = L.esri.Vector.vectorBasemapLayer("arcgis/streets", {
      token: accessToken
    });
    const esrisat = L.esri.Vector.vectorBasemapLayer("arcgis/imagery", {
      token: accessToken
    });
    
    // add the basemap control to the map  
    var basemaps = {
      "Esri Streets": esristreets,
      "Esri Satellite": esrisat
    };
    basemaps["Esri Streets"].addTo(map);
    L.control.layers(basemaps).addTo(map);

    let sources = filterLookup.reduceRight((result, curr) => {
      //console.log("sources filterLookup");
      //console.log(curr.source);
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

    // data retrieved from arc map server here
    Promise.all(sources).then((responses) => {
      console.log("Responses");
      console.log(responses);
      var combinedData = SiteMap.filterCombineResponses(responses);
      this.layers = [];
      this.layers.push(L.geoJSON(combinedData, {
            name: 'site information',
            pointToLayer: function(geoJsonPoint, latlon) {
              return new RestylingCircleMarker(latlon, {
                weight: 2,
                color: 'var(--palette-brand)',
                radius: RestylingCircleMarker.calcRadius(map.getZoom()),
                stroke: false,
                fill: false
              });
            }
          }));
        this.layers.push(...responses.map((res) => {
          //console.log("Getting data");
          console.log(res.name);
          console.log(res.data);

          // create 1 geoJson dataset with coords, county, WID, name

          // create map layer from that dataset

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
        }));
        console.log(this.layers);

        this.layers.forEach(l => l.on('click', (e) => {
          if (this._highlight !== e.propagatedFrom) {
            this.fire('interaction', e.propagatedFrom.feature.properties);
          } else {
            this.fire('interaction');
          }
        }))
        this.layers[0].addTo(map);
      let lookup = {};
      console.log(this.layers.length);
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
            datas: []
          };
          obj.feature.properties['Site_Code'] = siteCode;
          obj.feature.properties['Site_Name'] = siteName;
          obj.feature.properties['Data_Type'] = layer.options.name;
          // some WIDs have multiple records per layer
          // this code only gets the last one in each layer
          cache.datas.push(obj.feature.properties);
          lookup[siteCode] = cache;
          
        });
      });
      for (const [k, v] of Object.entries(lookup)) {
        if (v['datas'].length > 2) {
          }
      }
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

  static filterCombineResponses (responses) {
      var combinedData = {
        type: "FeatureCollection",
        features: []
      }
      var uniqueWids = []
      var missingCounty = {}
      var missingWid = {}

      responses.map((res) => {
          let allWidsInLayer = [];
          let uniqueWidsInLayer = [];
          let dupWidsInLayer = {};
          missingCounty[res.name] = [];
          missingWid[res.name] = [];
          res.data.features.forEach(f => {
            let wid = f.properties['Wid'] ?? f.properties['WID'] ?? f.properties['WGNHS_ID'] ?? undefined;
            if (!wid) {
              missingWid[res.name].push(f);
            }
            let county = f.properties['County'] || f.properties['CountyName'];
            if (!county) {
              missingCounty[res.name].push(f);
            }
            let siteName = f.properties['Site_name'] || f.properties['SiteName'];
            if (!uniqueWids.includes(wid)){
              uniqueWids.push(wid);
              let newFeature = {
                geometry: structuredClone(f.geometry),
                id: wid,
                properties: {
                  WID: wid,
                  County: county ? county.toLowerCase() : null,
                  SiteName: siteName

                },
                type: "Feature"
              }
              combinedData.features.push(newFeature);
            }
            allWidsInLayer.push(wid);
            if (!uniqueWidsInLayer.includes(wid)){
                uniqueWidsInLayer.push(wid);
            } else {
              dupWidsInLayer[wid] = allWidsInLayer.filter(w => w ===  wid).length;
            }
        });
        console.log(res.name);
        console.log(res.data.features.length);
        console.log("All WIDs in layer");
        console.log(allWidsInLayer);
        console.log("Unique WIDs in layer");
        console.log(uniqueWidsInLayer);
        console.log("Duplicate WIDs in layer");
        console.log(dupWidsInLayer);
      });
      console.log("Unique WIDs");
      console.log(uniqueWids);
      console.log(uniqueWids.length);
      console.log("Combined data");
      console.log(combinedData);
      console.log(combinedData.features.length);
      console.log("Missing county");
      console.log(missingCounty);
      console.log("Missing WID");
      console.log(missingWid);
      //console.log("Dup WIDS");
      //console.log(dupWids);
      return combinedData;
    }

  //TODO HACK
  getPoint(params) {
    let result = null;
    let cache = this._lookup[SiteMap.getSiteCode(params)];
    //console.log(cache)
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
    console.log("Update points");
    console.log(activePoints);
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