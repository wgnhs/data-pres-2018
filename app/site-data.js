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
    filterLookup.forEach((fg, fgIndex) => {
      fg.sections.forEach((section, sectionIndex) => {
        Object.entries(section.fields).forEach(([field, config], fieldIndex) => {
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
          result[fieldKey].sortOrder = (fgIndex * 100000) + (sectionIndex * 1000) + (fieldIndex * 1);
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

  static getFieldConfiguration(key, layoutName) {
    let fieldKey = SiteData.buildFieldKey(layoutName, key);
    return SiteData.propLookup[fieldKey];
  }

  static getFieldTitle(key, layoutName) {
    let result = key;
    let config = SiteData.getFieldConfiguration(key, layoutName);
    if (!config) {
      result += '*';
    } else if (config.title) {
      result = config.title;
    }
    return result;
  }

  static getFieldDescription(key, layoutName) {
    let result = ''
    let config = SiteData.getFieldConfiguration(key, layoutName);
    if (config && config.desc) {
      result = config.desc
    }
    return result;
  }

  static getFieldHidden(key, layoutName) {
    let result = false;
    let config = SiteData.getFieldConfiguration(key, layoutName);
    if (!config || config.hidden) {
      result = true;
    }
    return result;
  }
}

export const ignoredKeys = [
  'Site_Code',
  'Data_Type',
  'Site_Name'
];

export const filterLookup = [
  new FilterGroup({
    title: "Site Information",
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
          "Latitude": {
            title: 'Latitude',
            // controls: [
            //   new ContainsControl()
            // ]
          },
          "Longitude": {
            title: 'Longitude',
            // controls: [
            //   new ContainsControl()
            // ]
          },
          // "LocConf": {
          //   title: 'Location Confidence'
          // },
          // "Elevation": {
          //   title: 'Elevation'
          // },
          // "ElevAcc": {
          //   title: 'Elevation Accuracy'
          // },
          // "ElevMeth": {
          //   title: 'Elevation Method'
          // }
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
          "WID": {
            alias: 'WID',
            hidden: true
          },
          "SiteName": {
            alias: 'Site_Name',
            hidden: true
          },
          "County": {
            alias: 'County',
            hidden: true
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
      },
      {
        fields: {
          "Data available:": {}
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
          "WGNHS_ID": {
            alias: 'WID',
            hidden: true
          },
          "Site_Name": {
            alias: 'Site_Name',
            hidden: true
          },
          "County": {
            alias: 'County',
            hidden: true
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
      },
      {
        fields: {
          "Analyses available:": {}
        }
      }
    ]
  }),
  new FilterGroup({
    title: "Rock Core data",
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
          alias: 'WID',
          hidden: true
        },
        // "Type": {},
        // "WUWN": {},
        "CountyName": {
          alias: 'County',
          hidden: true
        },
        // "CountyCode": {},
        // "CountySeqID ": {},
        "SiteName": {
          alias: 'Site_Name',
          hidden: true
        },
        "SiteOwner": {
          title: 'Site Owner',
          controls: [
            new ContainsControl()
          ]
        },
        "Elevation": {
          title: 'Elevation (ft)',
        },
        "ElevMeth": {
          title: 'Elevation Method'
        },
        // "ElevAcc": {
        //   title: 'Elevation Accuracy (ft)'
        // },
        // "SiteDate": {},
        // "LocConf": {},
        "CoreTop": {
          title: 'Top of Core Depth (ft)'
        },
        // "TopStratCode": {},
        "TopStratName": {
          title: 'Top Stratigraphic Name',
          controls: [
            new SelectControl()
          ]
        },
        "CoreBot": {
          title: 'Bottom of Core Depth (ft)'
        },
        // "BotStratCode": {},
        "BotStratName": {
          title: 'Bottom Stratigraphic Name',
          controls: [
            new SelectControl()
          ]
        },
        
        "CoreLen": {
          title: 'Length of Core (ft)'
        },
        "BoxCount": {
          title: 'Box Count'
        },
        "ShelfID": {
          title: 'Shelf'
        },
        "Skeletonized": {
          title: 'Skeletonized'
        },
        "BHGAvail": {
          title: 'Borehole Geophysical Log Available',
          hidden: true,
          controls: [
            new CheckboxControl()
          ]
        },
        // "GeoLogAvail ": {},
        // "GeoLogType": {},
        // "Notes": {},
        "Status": {
          title: 'Status'
        },
        // "Assessment": {},
        // "Condition": {},
        // "Completeness": {},
        // "LonDD": {},
        // "LatDD": {},
      }
    }]
  })
];