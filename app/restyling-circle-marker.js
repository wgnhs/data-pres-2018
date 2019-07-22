
const colorRange = [
  '#e0ecf4',
  '#bfd3e6',
  '#9ebcda',
  '#8c96c6',
  '#8c6bb1',
  '#88419d',
  '#810f7c'
];
export const RestylingCircleMarker = L.CircleMarker.extend({
  getEvents: function() {
    return {
      zoomend: this._restyle,
      filterpoints: this._filter
    }
  }, 
  _restyle: function(e){
    this.setRadius(RestylingCircleMarker.calcRadius(e.target.getZoom()))
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
  },
  highlight: function() {
    this._activeBackup = this.options.color;
    this.setStyle({'color': 'orange'})
  },
  removeHighlight: function() {
    if (this._activeBackup) {
      this.setStyle({'color': this._activeBackup})
      this._activeBackup = null;
    }
  }
});

RestylingCircleMarker.calcRadius = (a) => Math.max(a/1.5,3);