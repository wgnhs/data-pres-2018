import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
export { InRadio } from './in-radio.js';

export class MapFilter extends LitElement {
  static get properties() {
    return {
      filter: {
        type: Array,
        attribute: false
      },
      matchClass: {
        type: String,
        attribute: false
      }
    };
  }

  constructor() {
    super();
    this.genId = (function() {
      const memo = {};
      return function(index) {
        if (!memo[index]) {
          memo[index] = genId();
        }
        return memo[index];
      }
    })();
    this.filter = [];
    this.filterFields = {
      "SiteName": {
        controls: []
      },
      "Wid": {
        controls: [
          new TextControl(this)
        ]
      },
      "RecentLog": {
        controls: [
          new GTLTControl(this, true)
        ]
      },
      "MaxDepth": {
        controls: [
          new GTLTControl(this)
        ]
      },
      "Norm_Res": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "OBI": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Caliper": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Fluid_Cond": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Flow_Spin": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Gamma": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "ABI": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Fluid_Temp": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "SP": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "SPR": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Fluid_Res": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Flow_HP": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Spec_Gamma": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Video": {
        controls: [
          new CheckboxControl(this)
        ]
      },
      "Drill_Year": {
        controls: [
          new GTLTControl(this, true)
        ]
      },
      "Depth_Ft": {
        controls: [
          new GTLTControl(this)
        ]
      },
      "Drill_Meth": {
        controls: [
          new SelectControl(this, 'Drill_Meth')
        ]
      },
    }
  }

  static get styles() {
    return css`
      [data-element="table"] {
        display: grid;
        grid-template-columns: 30% 1fr;
        grid-gap: 0.5em;
      }

      td {
        padding: 0.5em;
      }

      .label {
        background-color: var(--palette-dark);
        font-weight: var(--font-weight-bold);
      }

      .selector {
        background-color: var(--palette-light);
      }

      in-radio {
        display: inline-grid;
        grid-template-columns: auto auto;
      }
    `;
  }

  updateMatchClass(e) {
    this.matchClass = e.target.choice;
  }

  render() {
    let name=0, config=1
    return html`
      <div>
        <h4>Filter Map:</h4>
        <div>
          Show sites that have <in-radio choices='["ANY", "ALL"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
        </div>
        <div data-element="table">
        ${Object.entries(this.filterFields).map((entry, index) => html`
          ${(entry[config].controls.length === 0)?'':entry[config].controls.map(el => html`
          <td class="label">
            <label for="${this.genId(index)}" >
              ${entry[name]}
            </label>
          </td>
          <td class="selector" 
              @change="${el.handle.bind(el)}">
            <input
              id="${el.id}"
              type="checkbox"
              name="${entry[name]}">
            ${el.next}
          </td>
          `)}
        `)}
        </div>
      </div>
    `;
  }

  updated() {
    let matchClass = this.matchClass;
    let filt = this.filter;
    if (window.map) {
      window.map.fire('filterpoints', {
        detail: {
          resolve: function(props) {
            let result = filt.length < 1;
            if (!result) {
              if ("ALL" === matchClass) {
                result = filt.reduce((prev, curr) => {
                  return prev && curr.resolve(props);
                }, true);
              } else {
                result = filt.reduce((prev, curr) => {
                  return prev || curr.resolve(props);
                }, false);
              }
            }
            return result;
          }
        }
      });
    }
  }
}
customElements.define('map-filter', MapFilter);



class CheckboxControl {
  constructor(element) {
    this.id = genId();
    this.filter = element.filter;
    this.postHandle = element.requestUpdate.bind(element);
  }
  handle(e) {
    let id = this.id;
    let context = {};
    context.target = e.currentTarget.querySelector('#'+id);
    context.prop = e.target.name;

    for (
      var idx = this.filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = this.filter.findIndex(el => el.id === id)
    ) {
      this.filter.splice(idx, 1);
    }
    let isOn = context.target.checked;
    if (isOn) {
      this.filter.push({
        id: id,
        resolve: function(el) {
          return !!el[context.prop];
        }
      })
    }
    this.postHandle();
  }
}

class GTLTControl {
  constructor(element, isDate) {
    this.id = genId();
    this.filter = element.filter;
    this.postHandle = element.requestUpdate.bind(element);
    this.gtName = (isDate)?'after':'at least';
    this.ltName = (isDate)?'before':'less than';
  }
  get next() {
    return html`
      <select>
        <option value="gt">${this.gtName}</option>
        <option value="lt">${this.ltName}</option>
      </select>
      <input type="text">
    `;
  }
  handle(e) {
    let id = this.id;
    let context = {};
    context.target = e.currentTarget.querySelector('#'+id);
    context.prop = context.target.name;
    context['gt'] = (a, b) => (a >= b);
    context['lt'] = (a, b) => (a < b);

    for (
      var idx = this.filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = this.filter.findIndex(el => el.id === id)
    ) {
      this.filter.splice(idx, 1);
    }
    let isOn = context.target.checked;
    if (isOn) {
      this.filter.push({
        id: id,
        resolve: function(el) {
          let result = !!el[context.prop];
          if (result) {
            result = context[context.target.nextElementSibling.value](el[context.prop], context.target.nextElementSibling.nextElementSibling.value);
          }
          return result;
        }
      })
    }
    this.postHandle();
  }
}

class SelectControl {
  constructor(element) {
    this.id = genId();
    this.filter = element.filter;
    this.postHandle = element.requestUpdate.bind(element);
  }
  get next() {
    return html`
      <select ?disabled="${!this.options}">
        <option></option>
        ${(!this.options)?'':this.options.map((el) => html`
        <option value="${el}">${el}</option>
        `)}
      </select>
    `;
  }
  handle(e) {
    let id = this.id;
    let context = {};
    context.target = e.currentTarget.querySelector('#'+id);
    context.prop = context.target.name;

    if (!this.options) {
      this.options = Array.from(Object.entries(map._layers).reduce(((prev, ent) => (ent[1].feature && ent[1].feature.properties[context.prop])?prev.add(ent[1].feature.properties[context.prop]):prev), new Set()));
    }

    for (
      var idx = this.filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = this.filter.findIndex(el => el.id === id)
    ) {
      this.filter.splice(idx, 1);
    }
    let isOn = context.target.checked;
    if (isOn) {
      this.filter.push({
        id: id,
        resolve: function(el) {
          let result = !!el[context.prop];
          if (result) {
            result = !context.target.nextElementSibling.value || el[context.prop] === context.target.nextElementSibling.value;
          }
          return result;
        }
      })
    }
    this.postHandle();
  }
}

class TextControl {
  constructor(element) {
    this.id = genId();
    this.filter = element.filter;
    this.postHandle = element.requestUpdate.bind(element);
  }
  get next() {
    return html`
      <input type="text">
    `;
  }
  handle(e) {
    let id = this.id;
    let context = {};
    context.target = e.currentTarget.querySelector('#'+id);
    context.prop = context.target.name;

    for (
      var idx = this.filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = this.filter.findIndex(el => el.id === id)
    ) {
      this.filter.splice(idx, 1);
    }
    let isOn = context.target.checked;
    if (isOn) {
      this.filter.push({
        id: id,
        resolve: function(el) {
          let result = !!el[context.prop];
          if (result) {
            result = !context.target.nextElementSibling.value || el[context.prop] == context.target.nextElementSibling.value;
          }
          return result;
        }
      })
    }
    this.postHandle();
  }
}