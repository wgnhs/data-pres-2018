
export class SiteData {
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
  'ID'
];
export const keyLookup = {
  'SiteName': {title: 'Site Name', desc: ''},
  'Site_Name': {title: 'Site Name', desc: ''},
  'Wid': {title: 'WID', desc: ''},
  'ID': {title: 'ID', desc: ''},
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
  'Fluid_Temp': {title: 'Fluid Temperature', desc: ''},
  'Fluid_Res': {title: 'Fluid Resistivity', desc: ''},
  'OBI': {title: 'Optical Borehole Image (OBI)', desc: ''},
  'ABI': {title: 'Acoustic Borehole Image (ABI)', desc: ''},
  'Video': {title: 'Video', desc: ''},
  'Drill_Year': {title: 'Drill year', desc: ''},
  'Depth_Ft': {title: 'Depth (ft)', desc: ''},
  'Drill_Meth': {title: 'Drill Method', desc: ''},
  'Subsamples': {title: 'Subsamples', desc: ''},
  'Photos': {title: 'Core Photos', desc: ''},
  'Grainsize': {title: 'Grainsize', desc: ''},
};

