
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
    this._activeBackup = {
      color: this.options.color,
      stroke: this.options.stroke,
      fill: this.options.fill
    };
    this.setStyle({
      color: 'var(--map-symbol-active)',
      stroke: true,
      fill: true
    })
  },
  removeHighlight: function() {
    if (this._activeBackup) {
      this.setStyle(this._activeBackup);
      this._activeBackup = null;
    }
  }
});

RestylingCircleMarker.calcRadius = (a) => Math.max(Math.floor(a/1.5),3);