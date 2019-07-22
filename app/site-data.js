
export class SiteData {
  constructor(...layer) {

    // Define aggregated data for visualization
    this._aggrKeys = [];
    this.aggrData = [];
    for (let l of layer) {
      this.aggrData.push(SiteData._gatherAggrData(l, this._aggrKeys));
    }
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
        if (result[key] && 'number' === typeof result[key]) {
          if (!aggrData.aggr[key].max || aggrData.aggr[key].max < result[key]) {
            aggrData.aggr[key].max = result[key];
          }
          if (!aggrData.aggr[key].min || aggrData.aggr[key].min > result[key]) {
            aggrData.aggr[key].min = result[key];
          }
        }
      });
      aggrData.data.push(result);
    });

    return aggrData;
  }
}