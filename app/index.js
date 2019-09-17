(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lit-element'), require('wgnhs-common'), require('wgnhs-router'), require('wgnhs-styles'), require('wgnhs-pdf'), require('wgnhs-layout')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lit-element', 'wgnhs-common', 'wgnhs-router', 'wgnhs-styles', 'wgnhs-pdf', 'wgnhs-layout'], factory) :
  (global = global || self, factory(global.app = {}, global['wgnhs-common'], global['wgnhs-common'], global['wgnhs-router'], global['wgnhs-common'], global['wgnhs-pdf'], global['wgnhs-layout']));
}(this, function (exports, litElement, wgnhsCommon, wgnhsRouter, wgnhsStyles, wgnhsPdf, wgnhsLayout) { 'use strict';

  class FilterGroup {
    constructor(config) {
      Object.assign(this, config);
      if (!this.id) {
        this.id = wgnhsCommon.genId();
      }
    }
    activate(context) {
      let result = null;
      const input = context.detail.checked;
      if (context.toggleable && input) {
        result = {
          id: context.id,
          context,
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
      this.id = wgnhsCommon.genId();
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
          context,
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
      this.id = wgnhsCommon.genId();
      this.gtName = (isDate)?'after':'at least';
      this.eqName = (isDate)?'exactly':'equal to';
      this.ltName = (isDate)?'before':'less than';
    }
    get next() {
      return litElement.html`
      <select>
        <option value="gt">${this.gtName}</option>
        <option value="eq">${this.eqName}</option>
        <option value="lt">${this.ltName}</option>
      </select>
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;
      context['gt'] = (a, b) => (a >= b);
      context['eq'] = (a, b) => (a == b);
      context['lt'] = (a, b) => (a < b);

      const predicate = context[context.target.nextElementSibling.value];
      const input = context.target.nextElementSibling.nextElementSibling.value;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          context,
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
      this.id = wgnhsCommon.genId();
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
          context,
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
      this.id = wgnhsCommon.genId();
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
          context,
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
      this.id = wgnhsCommon.genId();
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
          context,
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
    constructor(layers) {

      // Define aggregated data for visualization
      this._aggrKeys = [
        'County',
        'Drill_Method',
        'Project'
      ];
      this.aggrData = [];
      for (let l of layers) {
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
      layer.eachLayer(function(obj, l) {
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

  const ignoredKeys = [
    'Site_Code',
    'Data_Type',
    'SiteName',
    'Site_Name',
    'Wid',
    'ID',
    'County'
  ];
  const keyLookup = {
    'Site_Name': {title: 'Name', desc: ''},
    'Wid': {title: 'WGNHS ID', desc: ''},
    'WID': {title: 'WGNHS ID', desc: ''},
    'RecentLog': {title: 'Most recent log (year)', desc: ''},
    'MaxDepth': {title: 'Max depth (ft)', desc: ''},
    'Norm_Res': {title: 'Normal Resistivity', desc: ''},
    'Caliper': {title: 'Caliper', desc: ''},
    'Gamma': {title: 'Natural Gamma', desc: ''},
    'SP': {title: 'Spontaneous (Self) Potential', desc: ''},
    'SPR': {title: 'Single Point Resistivity', desc: ''},
    'Spec_Gamma': {title: 'Spectral Gamma', desc: ''},
    'Fluid_Cond': {title: 'Fluid Conductivity', desc: ''},
    'Flow_Spin': {title: 'Spinner Flow Meter', desc: ''},
    'Flow_HP': {title: 'HeatPulse Flow Meter', desc: ''},
    'Fluid_Temp': {title: 'Fluid Temperature', desc: ''},
    'Fluid_Res': {title: 'Fluid Resistivity', desc: ''},
    'OBI': {title: 'Optical Borehole Image (OBI)', desc: ''},
    'ABI': {title: 'Acoustic Borehole Image (ABI)', desc: ''},
    'Video': {title: 'Video', desc: ''},
    'Field_ID': {title: 'Field ID', desc: ''},
    'Project': {title: 'Project', desc: ''},
    'Drill_Year': {title: 'Drill year', desc: ''},
    'Depth_Ft': {title: 'Depth (ft)', desc: ''},
    'Drill_Method': {title: 'Drill Method', desc: ''},
    'Subsamples': {title: 'Subsamples', desc: ''},
    'Photos': {title: 'Core Photos', desc: ''},
    'Grainsize': {title: 'Grainsize', desc: ''},
    'Age_Data': {title: 'Age data', desc: ''},
    'Proxy_Data': {title: 'Proxy data', desc: ''},
  };

  const filterLookup = [
    new FilterGroup({
      title: "Site information",
      open: true,
      sections: [
        {
          fields: {
            "County": {
              controls: [
                new SelectControl()
              ]
            },
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
      title: "Geophysical Log data",
      prop: 'Data_Type',
      'Data_Type': 'geophysical log',
      source: {
        geojson: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0/query?where=1%3D1&inSR=4326&outFields=*&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson',
        user: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0'
      },
      color: 'var(--map-symbol-0)',
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
          bundled: true,
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
          bundled: true,
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
          bundled: true,
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
      title: "Quaternary Core data",
      prop: 'Data_Type',
      'Data_Type': 'quaternary core',
      source: {
        geojson: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0/query?where=1%3D1&inSR=4326&outFields=*&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson',
        user: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0'
      },
      color: 'var(--map-symbol-1)',
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
            "Project": {
              controls: [
                new SelectControl()
              ]
            },
            "Depth_Ft": {
              controls: [
                new GTLTControl()
              ]
            },
            "Drill_Method": {
              controls: [
                new SelectControl()
              ]
            },
          }
        },
        {
          title: "Analyses available",
          bundled: true,
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
            },
            "Age_Data": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Proxy_Data": {
              controls: [
                new CheckboxControl()
              ]
            }
          }
        }
      ]
    })
  ];

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
        color: 'var(--map-symbol-active)',
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

  RestylingCircleMarker.calcRadius = (a) => Math.max(Math.floor(a/1.5),3);

  class SiteMap extends window.L.Evented {
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

      let sources = filterLookup.reduce((result, curr) => {
        if (curr.source && curr.source.geojson) {
          result.push(
            window.fetch(curr.source.geojson)
            .then((res) => res.json())
            .then((geojson)=>({
              name: curr[curr.prop],
              color: curr.color,
              data: geojson})));
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
          }));
          this.layers.forEach(l => l.addTo(map));
        let lookup = {};
        this.layers.forEach(function(layer, idx, arr) {
          layer.eachLayer(function(obj) {
            let wid = obj.feature.properties['Wid'] || obj.feature.properties['WGNHS_ID'];
            let siteCode = SiteMap.getSiteCode(obj.feature.properties);
            let siteName = obj.feature.properties['Site_Name'] || obj.feature.properties['SiteName'];
            let latLon = obj.getLatLng();
            let cache = lookup[siteCode] || {
              'Site_Code': siteCode,
              'Site_Name': siteName,
              'Wid': wid,
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

    static getSiteCode(params) {
      let keys = ['Wid', 'WGNHS_ID', 'ID', 'Site_Code'];
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

    updatePoints(activePoints) {
      this.map.fire('filterpoints', {
        detail: {
          resolve: (props) => {
            return activePoints.reduce((prev, activeSet) => {
              const code = SiteMap.getSiteCode(props);
              const has = activeSet.has('' + code);
              const result = prev || has;
              return result;
            }, false);
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

  class TableLayout extends litElement.LitElement {

    static get layoutName() {
      return undefined;
    }

    static include(info, context) {
      return litElement.html`<table-layout .info=${info} .context=${context}></table-layout>`;
    }

    static get properties() {
      return {
        info: {
          type: Object
        },
        context: {
          type: Object
        }
      };
    }

    constructor() {
      super();
      this.genId = (function() {
        const memo = {};
        return function(index) {
          if (!memo[index]) {
            memo[index] = wgnhsCommon.genId();
          }
          return memo[index];
        }
      })();
    }

    static get styles() {
      return litElement.css`
      [data-element="table"] {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }
      .label {
        font-weight: var(--font-weight-bold);
      }
    `;
    }

    render() {
      let key = 0, value = 1;
      let entries = Object.entries(this.info).filter((el) => {
        return !ignoredKeys.includes(el[key]);
      }).filter((el) => {
        return !!el[value];
      }).map((el, index) => litElement.html`
      <dt class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <label for="${this.genId(index)}" >
          ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
        </label>
      </dt>
      <dd class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <span id="${this.genId(index)}">
          ${el[value]}
        </span>
      </dd>
    `);
      return litElement.html`
      <dl data-element="table">
        ${entries}
      </dl>
    `;
    }
  }
  customElements.define('table-layout', TableLayout);

  class LogLayout extends litElement.LitElement {
    static get layoutName() {
      return 'geophysical log';
    }

    static include(info, context) {
      return litElement.html`<log-layout .info=${info} .context=${context}></log-layout>`;
    }

    static get properties() {
      return {
        info: {
          type: Object
        },
        context: {
          type: Object
        }
      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
    `;
    }

    render() {
      return litElement.html`
    <table-layout .info=${this.prepInfo()} .context=${this.context}></table-layout>
    <pdf-view-button
      .panel=${this.context.pdfpanel}
      src="${'https://data.wgnhs.wisc.edu/geophysical-logs/' + this.info.Wid + '.pdf'}">
    </pdf-view-button>
    `;
    }

    prepInfo() {
      return Object.assign(this.topFields, this.bottomFields);
    }

    get topFields() {
      return this.getFields(el => !el.bundled);
    }

    get bottomFields() {
      const fields = this.getFields(el => el.bundled);
      const names = Object.entries(fields)
        .filter(kv => !!kv[1])
        .map(kv => (keyLookup[kv[0]])?keyLookup[kv[0]].title:kv[0]);
      return {
        'Data available:': names.map(val => litElement.html`${val}<br>`)
      };
    }

    get group() {
      return filterLookup.find(el => (el.prop && el[el.prop] === this.info[el.prop]));
    }

    getFields(fn) {
      const result = {};
      const sections = this.group.sections.filter(fn);
    
      sections.forEach(section => {
        Object.entries(section.fields).forEach(kv => {
          result[kv[0]] = this.info[kv[0]];
        });
      });
    
      return result;
    }
  }
  customElements.define('log-layout', LogLayout);

  class CoreLayout extends litElement.LitElement {
    static get layoutName() {
      return 'quaternary core';
    }

    static include(info, context) {
      return litElement.html`<core-layout .info=${info} .context=${context}></core-layout>`;
    }

    static get properties() {
      return {
        info: {
          type: Object
        },
        context: {
          type: Object
        }
      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
    `;
    }
    render() {
      return litElement.html`
    <table-layout .info=${this.prepInfo()}></table-layout>
    `;
    }

    prepInfo() {
      return Object.assign(this.topFields, this.bottomFields);
    }

    get topFields() {
      return this.getFields(el => !el.bundled);
    }

    get bottomFields() {
      const fields = this.getFields(el => el.bundled);
      let names = Object.entries(fields)
        .filter(kv => !!kv[1])
        .map(kv => (keyLookup[kv[0]])?keyLookup[kv[0]].title:kv[0])
        .map(val => litElement.html`${val}<br>`);
      if (names.length < 1) {
        names = null;
      }
      return {
        'Analyses available:': names
      };
    }

    get group() {
      return filterLookup.find(el => (el.prop && el[el.prop] === this.info[el.prop]));
    }

    getFields(fn) {
      const result = {};
      const sections = this.group.sections.filter(fn);
    
      sections.forEach(section => {
        Object.entries(section.fields).forEach(kv => {
          result[kv[0]] = this.info[kv[0]];
        });
      });
    
      return result;
    }
  }
  customElements.define('core-layout', CoreLayout);

  const defaultLayout = TableLayout;
  const availableLayouts = [
    defaultLayout,
    LogLayout,
    CoreLayout
  ];

  const layoutResolver = {
    getLayout: function getLayout(layoutName) {
      let layout = availableLayouts.find((el) => {
        return el.layoutName === layoutName;
      });
      if (!layout) {
        layout = defaultLayout;
      }
      return layout.include;
    }
  };

  class SiteDetails extends litElement.LitElement {
    static get properties() {
      return {
        siteinfo: {
          type: Object
        },
        pdfpanel: {
          type: Object
        }
      };
    }

    constructor() {
      super();

    }

    static get styles() {
      return [
        ...wgnhsStyles.styles,
        litElement.css`
      .header {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        background-color: var(--palette-white);
        padding: var(--font-size-extra-large) var(--border-radius);
        z-index: 10;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
      }
      .header h1 {
        padding: 0;
        max-width: 70%;
        text-align: center;
      }
      .header i {
        font-size: var(--icon-size-large);
        color: var(--palette-accent);
        cursor: pointer;
      }

      .name {
        text-transform: capitalize;
      }

      [data-closed] {
        display: none;
      }
    `];
    }

    renderData(info, layoutName) {
      const layout = layoutResolver.getLayout(layoutName);
      return layout(info, this);
    }

    render() {
      let Latitude = (this.siteinfo)?this.siteinfo['Latitude']:null;
      let Longitude = (this.siteinfo)?this.siteinfo['Longitude']:null;
      let WID = (this.siteinfo)?this.siteinfo['Wid']:null;
      return litElement.html`
      ${(!this.siteinfo)? '' : litElement.html`
        <div class="header">
          <span>
            <a href="${window.router.link('entry')}" onclick="event.preventDefault()"><i class="material-icons clear-selection" title="Clear selection" @click="${this.fireClearSelection}" >arrow_back</i></a>
          </span>
          <h1>${this.siteinfo.Site_Name}</h1>
          <span>
            <i class="material-icons zoom-to-site" title="Zoom to site" @click="${this.fireZoomToSite}">my_location</i>
          </span>
        </div>
        ${this.renderData({
          Latitude, Longitude, WID
        })}
        ${this.siteinfo.datas.map((props) => litElement.html`
          <app-collapsible open>
            <span slot="header" class="name">${props['Data_Type']}</span>
            <div slot="content">
              ${this.renderData(props, props['Data_Type'])}
            </div>
          </app-collapsible>
        `)}
      `}
    `;
    }

    fireClearSelection() {
      wgnhsCommon.dispatch(this, 'clear-selection', {}, true, true);
    }

    fireZoomToSite() {
      wgnhsCommon.dispatch(this, 'zoom-to-site', {params: this.siteinfo}, true, true);
    }
  }
  customElements.define('site-details', SiteDetails);

  class FilterSummary extends litElement.LitElement {
    static get properties() {
      return {
        counts: {
          type: Array,
          attribute: false
        }
      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
    li[disabled] {
      color: var(--palette-dark);
    }
    .name {
      text-transform: capitalize;
    }
    `;
    }

    render() {
      return (!this.counts)?litElement.html``:litElement.html`
    <div>
      <span>Showing
        ${this.counts.reduce((prev, count) => (count.current + prev), 0)}
        of
        ${this.counts.reduce((prev, count) => (count.total + prev), 0)}
        total sites
      </span>
      <ul>
        ${this.counts.map((el) => litElement.html`
        <li ?disabled=${!el.included}>
          ${el.current} of ${el.total} <span class="name">${el.name}</span> sites
          ${(el.filteredBy.length > 0)?litElement.html`
          (filtered by ${el.filteredBy.join(', ')})
          `:''}
        </li>
        `)}
      </ul>
    </div>
    `;
    }

    handleFiltered(e) {
      if (e.detail) {
        this.counts = e.detail.counts;
      }
    }

    connectedCallback() {
      super.connectedCallback();
      this.__filteredHandler = this.handleFiltered.bind(this);
      document.addEventListener('filtered', this.__filteredHandler);
    }

    disconnectedCallback() {
      document.removeEventListener('filtered', this.__filteredHandler);
      super.disconnectedCallback();
    }
  }
  customElements.define('filter-summary', FilterSummary);

  class MapFilter extends litElement.LitElement {
    static get properties() {
      return {
        include: {
          type: Array,
          attribute: false
        },
        filter: {
          type: Array,
          attribute: false
        },
        matchClass: {
          type: String,
          attribute: false
        },
        sources: {
          type: Array,
          attribute: false
        }
      };
    }

    static get styles() {
      return [
        ...wgnhsStyles.styles,
        litElement.css`
      .field {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        font-weight: var(--font-weight-bold);
      }

      .selector {
      }

      .section-title {
        margin: var(--line-height) 0 0 0;
        padding: var(--border-radius);
        background-color: var(--palette-light);
      }

      in-radio {
        display: inline-grid;
        grid-template-columns: auto auto;
      }
    `];
    }

    updateMatchClass(e) {
      this.matchClass = e.target.choice;
    }

    render() {
      return litElement.html`
      <div>
        Show sites that have <in-radio choices='["ALL", "ANY"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
      </div>
      <div>
        ${this.renderFilterGroups()}
      </div>
    `;
    }

    resolveKeyLookup(field) {
      let result = (!keyLookup[field])?field:keyLookup[field].title;
      return result;
    }

    renderFilterGroups() {
      let name=0, config=1;
      return this.filterGroups.map((group) => litElement.html`
      <app-collapsible
        ?open=${group.open} @open=${this._handle(group)}>
        <i slot="header-before" class="material-icons">expand_more</i>
        <span slot="header">${group.title}</span>
        ${(!group.toggleable)?'':litElement.html`
          <toggle-switch
            name="${group.title}"
            slot="header-after"
            ?checked=${group.active}
            @change=${this._handleGroup(group, 'include')}
            style="--palette-active: ${group.color}"
          ></toggle-switch>
        `}
        <div slot="content">
          ${group.sections.map((section, index) => litElement.html`
            ${!(section.title)?'':litElement.html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map((entry, index) => litElement.html`
              <div class="field">
              ${(entry[config].controls.length === 0)?'':entry[config].controls.map(control => litElement.html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${this.resolveKeyLookup(entry[name])}
                  </label>
                </td>
                <td class="selector" 
                    @change="${this._handleControl(group, control, 'filter')}">
                  <input
                    type="hidden"
                    id="${control.id}"
                    name="${entry[name]}">
                  ${control.next}
                </td>
              `)}
              </div>
            `)}
          `)}
        </div>
      </app-collapsible>
    `);
    }

    get _eventHandlers() {
      return {
        'open' : (context, e) => {
          context.open = e.detail.value;
        }
      }
    }

    _handle(context) {
      return (e) => {
        const handler = this._eventHandlers[e.type];
        if (handler) {
          handler(context, e);
          this.requestUpdate('handle_'+e.type);
        }
      }
    }

    _handleGroup(group, type) {
      const id = group.id;
      const handle = group.activate.bind(group);
      const filter = this[type];
      const callback = this.requestUpdate.bind(this);
      return (e) => {
        const context = {};
        context.id = id;
        context.toggleable = group.toggleable;
        context.detail = e.detail;
        context.prop = group.prop;
        context.value = group[group.prop];
        removeFromFilter(filter, id);
        let resolver = handle(context);
        if (resolver) {
          filter.push(resolver);
        }
        callback(type);
      }
    }

    _handleControl(group, control, type) {
      const id = control.id;
      const handle = control.handle.bind(control);
      const filter = this[type];
      const callback = this.requestUpdate.bind(this);
      return (e) => {
        const context = {};
        context.id = id;
        context.group = group;
        context.target = e.currentTarget.querySelector('#'+id);
        context.prop = context.target.name;
        removeFromFilter(filter, id);
        let resolver = handle(context);
        if (resolver) {
          filter.push(resolver);
        }
        callback(type);
      }
    }

    updated(changed) {
      const isNeeded = (
        changed.has('matchClass') ||
        changed.has('include') ||
        changed.has('filter') ||
        changed.has('sources'));

      if (this.sources && isNeeded) {
        const activePoints = MapFilter.runFilter({
          matchClass: this.matchClass,
          incl: this.include,
          filt: this.filter,
          sources: this.sources
        });
        const counts = MapFilter.getResultsInfo(
          this.matchClass,
          this.include,
          this.filter,
          this.sources,
          activePoints
          );
        wgnhsCommon.dispatch(this, 'filtered', {activePoints, counts}, true, true);
      }
    }

    init(uniques, layers) {
      this.filterGroups.forEach((group) => {
        group.sections.forEach((section) => {
          Object.entries(section.fields).forEach((field) => {
            field[1].controls.forEach((control) => {
              if (control.init) {
                control.init(uniques[field[0]]);
              }
            });
          });
        });
      });

      this.sources = layers;
    }

    static runFilter({matchClass, incl, filt, sources}) {
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
      };

      const result = sources.map((layer) => {
        const activePoints = new Set();
        Object.entries(layer._layers).forEach((ent) => {
          if (resolve(ent[1].feature.properties)) {
            activePoints.add('' + SiteMap.getSiteCode(ent[1].feature.properties));
          }
        });
        return activePoints;
      });

      return result;
    }

    static getResultsInfo(matchClass, include, filter, sources, activePoints) {
      const result = sources.map((layer, i) => {
        let stats = {};
        stats.name = layer.options.name;
        stats.included = include.some((el) => {
          return el.context.value === layer.options.name;
        });
        stats.filteredBy = filter.reduce((result, el) => {
          if (el.context.group[el.context.group.prop] === layer.options.name) {
            result.push((keyLookup[el.context.prop])?keyLookup[el.context.prop].title:el.context.prop);
          }
          return result;
        }, []);
        stats.matchClass = matchClass;

        let entries = Object.entries(layer._layers);
        stats.total = entries.length;
        stats.current = activePoints[i].size;

        return stats;
      });
      return result;
    }

    constructor() {
      super();
      this.genId = (function() {
        const memo = {};
        return function(index) {
          if (!memo[index]) {
            memo[index] = wgnhsCommon.genId();
          }
          return memo[index];
        }
      })();
      this.include = [];
      this.filter = [];
      this.filterGroups = filterLookup;
    }
  }
  customElements.define('map-filter', MapFilter);

  const removeFromFilter = (filter, id) => {
    for (
      var idx = filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = filter.findIndex(el => el.id === id)
    ) {
      filter.splice(idx, 1);
    }
  };

  window.siteMap = new SiteMap();
  window.sidebar = document.querySelector('#sidebar');
  window.pdfPanel = document.querySelector('#sketch');
  document.querySelectorAll('site-details').forEach(function(details) {
    details['pdfpanel'] = window.pdfPanel;
  });
  window.filter = document.querySelector('#filter');

  window.siteMap.once('init', function() {
    window.siteData = new SiteData(window.siteMap.layers);
    window.aggrData = siteData.aggrData;
    filter.init(window.siteData.uniques, window.siteMap.layers);

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
    window.router = new wgnhsRouter.SiteRouter();
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

  document.addEventListener('zoom-to-site', function(e) {
    window.siteMap.zoomToPoint(e.detail.params);
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
    if (e.detail.closed) {
      window.pdfPanel.setAttribute('data-closed', true);
    } else {
      window.pdfPanel.removeAttribute('data-closed');
    }
  });

  document.addEventListener('filtered', function(e) {
    window.siteMap.updatePoints(e.detail.activePoints);
  });

  exports.MapFilter = MapFilter;
  exports.SiteDetails = SiteDetails;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
