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
}

export const ignoredKeys = [
  'Site_Code',
  'Data_Type',
  'SiteName',
  'Site_Name',
  'Wid',
  'ID',
  'County'
];
export const keyLookup = {
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

export const filterLookup = [
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
      geojson: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/borehole_geophysics/MapServer/0/query?where=1%3D1&inSR=4326&outFields=*&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson'
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
      geojson: 'https://data.wgnhs.wisc.edu/arcgis/rest/services/geologic_data/sediment_core/MapServer/0/query?where=1%3D1&inSR=4326&outFields=*&returnGeometry=true&geometryPrecision=6&outSR=4326&f=geojson'
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