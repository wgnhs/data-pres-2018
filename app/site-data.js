import {
  FilterGroup,
  CheckboxControl,
  GTLTControl,
  SelectControl,
  TextControl,
  ContainsControl
} from './filter/filter-controls.js';

export class SiteData {
  constructor(layers) {
    // // Define aggregated data for visualization
    // this._aggrKeys = [
    //   'County',
    //   'Drill_Method',
    //   'Project'
    // ];
    // this.aggrData = [];
    // for (let l of layers) {
    //   this.aggrData.push(SiteData._gatherAggrData(l, this._aggrKeys));
    // }

    // this.datas = this.aggrData.values().map((el)=>el.data).reduce((prev, curr)=>prev.concat(curr),[]);
    this.uniques = {};
    // this._aggrKeys.forEach((key) => this.uniques[key] = new Set(this.datas.map((el)=>el[key]).filter((el)=>!!el)));
  }

  static buildFieldKey(source, field) {
    let result = [];
    if (field) {
      if (source) {
        result.push(source);
      }
      result.push(field);
    }
    return result.join('.');
  }

  static splitFieldKey(fieldKey) {
    let result = {};
    if (fieldKey) {
      let split = fieldKey.split('.');
      if (split.length > 1) {
        result.source = split.shift();
      }
      result.field = split.shift();
    }
    return result;
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
        result[key] = obj.feature.properties[key]
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

  static get propLookup() {
    let result = {}
    filterLookup.forEach((fg) => {
      fg.sections.forEach((section) => {
        Object.entries(section.fields).forEach(([field, config]) => {
          let source = (fg.prop && fg[fg.prop])?fg[fg.prop]:undefined;
          let fieldKey = SiteData.buildFieldKey(source, field);
          if (!result[fieldKey]) {
            result[fieldKey] = {};
          }
          config.fieldKey = fieldKey;
          Object.assign(result[fieldKey], config);
          result[fieldKey].source = source;
          result[fieldKey].field = field;
          let alias = result[fieldKey].alias;
          if (alias) {
            if (!result[alias]) {
              result[alias] = {};
            }
            if (!result[alias].members) {
              result[alias].members = [];
            }
            result[alias].members.push(result[fieldKey]);
          }
          // result[fieldKey].assist = {};
          // if (config.controls) {
          //   for (let control of config.controls) {
          //     Object.assign(result[fieldKey], SiteData.splitFieldKey(fieldKey))
          //     if (control.createAssist) {
          //       Object.assign(result[fieldKey].assist, control.createAssist(layers,fieldKey))
          //     }
          //   }
          // }
        })
      })
    })
    return result;
  }
}

export const ignoredKeys = [
  'Site_Code',
  'Data_Type',
  'SiteName',
  'Site_Name',
  'Wid',
  'ID',
  'OBJECTID',
  'County'
];
export const keyLookup = {
  'Site_Name': {title: 'Name', desc: ''}, //
  'Wid': {title: 'WGNHS ID', desc: ''}, //
  'WID': {title: 'WGNHS ID', desc: ''}, //Not sure how this is used yet.
  // Log
  'RecentLog': {title: 'Most recent log (year)', desc: ''}, //
  'MaxDepth': {title: 'Max depth (ft)', desc: ''}, //
  'Norm_Res': {title: 'Normal Resistivity', desc: ''}, //
  'Caliper': {title: 'Caliper', desc: ''}, //
  'Gamma': {title: 'Natural Gamma', desc: ''}, //
  'SP': {title: 'Spontaneous (Self) Potential', desc: ''}, //
  'SPR': {title: 'Single Point Resistivity', desc: ''}, //
  'Spec_Gamma': {title: 'Spectral Gamma', desc: ''}, //
  'Fluid_Cond': {title: 'Fluid Conductivity', desc: ''}, //
  'Flow_Spin': {title: 'Spinner Flow Meter', desc: ''}, //
  'Flow_HP': {title: 'HeatPulse Flow Meter', desc: ''}, //
  'Fluid_Temp': {title: 'Fluid Temperature', desc: ''}, //
  'Fluid_Res': {title: 'Fluid Resistivity', desc: ''}, //
  'OBI': {title: 'Optical Borehole Image (OBI)', desc: ''}, //
  'ABI': {title: 'Acoustic Borehole Image (ABI)', desc: ''}, //
  'Video': {title: 'Video', desc: ''}, //
  // Quat
  'Field_ID': {title: 'Field ID', desc: ''}, //Not Displayed
  'Project': {title: 'Project', desc: ''}, //
  'Drill_Year': {title: 'Drill year', desc: ''}, //
  'Depth_Ft': {title: 'Depth (ft)', desc: ''}, //
  'Drill_Method': {title: 'Drill Method', desc: ''}, //
  'Subsamples': {title: 'Subsamples', desc: ''}, //
  'Photos': {title: 'Core Photos', desc: ''}, //
  'Grainsize': {title: 'Grainsize', desc: ''}, //
  'Age_Data': {title: 'Age data', desc: ''}, //
  'Proxy_Data': {title: 'Proxy data', desc: ''}, //Nothing Actually Has Proxy Data
};

export const filterLookup = [
  new FilterGroup({
    title: "Site information",
    open: true,
    sections: [
      {
        fields: {
          "County": {
            title: 'County',
            controls: [
              new SelectControl()
            ]
          },
          "Site_Name": {
            title: 'Name',
            controls: [
              new ContainsControl()
            ]
          },
          "WID": {
            title: 'WGNHS ID',
            controls: [
              new TextControl()
            ]
          },
          "Lat_Lon": {
            //TODO!
          }
        }
      }
    ]
  }),
  new FilterGroup({
    title: "Geophysical Log",
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
          "Wid": {
            alias: 'WID'
          },
          "SiteName": {
            alias: 'Site_Name'
          },
          "County": {
            alias: 'County'
          },
          "RecentLog": {
            title: 'Most recent log (year)',
            controls: [
              new GTLTControl(true)
            ]
          },
          "MaxDepth": {
            title: 'Max depth (ft)',
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
            title: 'Normal Resistivity',
            controls: [
              new CheckboxControl()
            ]
          },
          "Caliper": {
            title: 'Caliper',
            controls: [
              new CheckboxControl()
            ]
          },
          "Gamma": {
            title: 'Natural Gamma',
            controls: [
              new CheckboxControl()
            ]
          },
          "SP": {
            title: 'Spontaneous (Self) Potential',
            controls: [
              new CheckboxControl()
            ]
          },
          "SPR": {
            title: 'Single Point Resistivity',
            controls: [
              new CheckboxControl()
            ]
          },
          "Spec_Gamma": {
            title: 'Spectral Gamma',
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
            title: 'Fluid Conductivity',
            controls: [
              new CheckboxControl()
            ]
          },
          "Flow_Spin": {
            title: 'Spinner Flow Meter',
            controls: [
              new CheckboxControl()
            ]
          },
          "Fluid_Temp": {
            title: 'Fluid Temperature',
            controls: [
              new CheckboxControl()
            ]
          },
          "Fluid_Res": {
            title: 'Fluid Resistivity',
            controls: [
              new CheckboxControl()
            ]
          },
          "Flow_HP": {
            title: 'HeatPulse Flow Meter',
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
            title: 'Optical Borehole Image (OBI)',
            controls: [
              new CheckboxControl()
            ]
          },
          "ABI": {
            title: 'Acoustic Borehole Image (ABI)',
            controls: [
              new CheckboxControl()
            ]
          },
          "Video": {
            title: 'Video',
            controls: [
              new CheckboxControl()
            ]
          },

        }
      }
    ]
  }),
  new FilterGroup({
    title: "Quaternary Core",
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
          "WGNHS_ID": {
            alias: 'WID'
          },
          "Site_Name": {
            alias: 'Site_Name'
          },
          "County": {
            alias: 'County'
          },
          "Drill_Year": {
            title: 'Drill year',
            controls: [
              new GTLTControl(true)
            ]
          },
          "Project": {
            title: 'Project',
            controls: [
              new SelectControl()
            ]
          },
          "Depth_Ft": {
            title: 'Depth (ft)',
            controls: [
              new GTLTControl()
            ]
          },
          "Drill_Method": {
            title: 'Drill Method',
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
            title: 'Subsamples',
            controls: [
              new CheckboxControl()
            ]
          },
          "Photos": {
            title: 'Core Photos',
            controls: [
              new CheckboxControl()
            ]
          },
          "Grainsize": {
            title: 'Grainsize',
            controls: [
              new CheckboxControl()
            ]
          },
          "Age_Data": {
            title: 'Age data',
            controls: [
              new CheckboxControl()
            ]
          },
          "Proxy_Data": {
            hidden: true
          }
        }
      }
    ]
  }),
  new FilterGroup({
    title: "Rock Core",
    prop: 'Data_Type',
    'Data_Type': 'rock core',
    source: {
      geojson: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/dev/rock_core/MapServer/0/query?where=LonDD+is+not+null&inSR=4326&outFields=*&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson',
      user: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/dev/rock_core/MapServer/0'
    },
    color: 'var(--map-symbol-2)',
    toggleable: true,
    active: true,
    sections: [{
      fields: {
        // "OBJECTID": {},
        // "Shape": {},
        "WID": {
          alias: 'WID'
        },
        // "Type": {},
        // "WUWN": {},
        "CountyName": {
          alias: 'County'
        },
        // "CountyCode": {},
        // "CountySeqID ": {},
        "SiteName": {
          alias: 'Site_Name'
        },
        // "SiteOwner": {},
        // "SiteDate": {},
        // "LocConf": {},
        // "Elevation": {},
        // "ElevAcc": {},
        // "ElevMeth": {},
        // "Notes": {},
        // "Status": {},
        // "Assessment": {},
        // "Condition": {},
        // "Completeness": {},
        // "CoreTop": {},
        // "CoreBot": {},
        // "CoreLen": {},
        // "BoxCount": {},
        // "TopStratCode": {},
        // "TopStratName": {},
        // "BotStratCode": {},
        // "BotStratName": {},
        // "Skeletonized": {},
        // "ShelfID": {},
        // "BHGAvail": {},
        // "GeoLogAvail ": {},
        // "GeoLogType": {},
        // "LonDD": {},
        // "LatDD": {},
      }
    }]
  })
];