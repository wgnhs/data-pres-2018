import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
import { keyLookup } from '../app/key-lookups.js';
export { AppCollapsible } from './app-collapsible.js';
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

  static get styles() {
    return css`
      :host {
        display
      }

      .field {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        /* background-color: var(--palette-dark); */
        font-weight: var(--font-weight-bold);
      }

      .selector {
        /* background-color: var(--palette-light); */
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
    `;
  }

  updateMatchClass(e) {
    this.matchClass = e.target.choice;
  }

  render() {
    return html`
      <style>
        @import url("./css/typography.css");
      </style>
      <div>
        Show sites that have <in-radio choices='["ANY", "ALL"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
      </div>
      <div>
        ${this.renderFilterSections()}
      </div>
    `;
  }

  resolveKeyLookup(field) {
    let result = (!keyLookup[field])?field:keyLookup[field].title;
    return result;
  }

  renderFilterSections() {
    let name=0, config=1;
    return this.filterSections.map((el) => html`
      <app-collapsible open>
        <i slot="header-before" class="material-icons">expand_more</i>
        <span slot="header">${el.title}</span>
        <div slot="content">
          ${el.sections.map((section, index) => html`
            ${!(section.title)?'':html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map((entry, index) => html`
              <div class="field">
              ${(entry[config].controls.length === 0)?'':entry[config].controls.map(el => html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${this.resolveKeyLookup(entry[name])}
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
              </div>
            `)}
          `)}
        </div>
      </app-collapsible>
    `);
  }

  updated() {
    let matchClass = this.matchClass;
    let filt = this.filter;
    if (window.siteMap) {
      window.siteMap.map.fire('filterpoints', {
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
    this.filterSections = [
      {
        title: "Site Information",
        sections: [
          {
            fields: {
              "County": {
                controls: [
                  new SelectControl(this, "County")
                ]
              },
              "SiteName": {
                controls: [
                  new TextControl(this)
                ]
              },
              "Site_Name": {
                controls: [
                  new TextControl(this)
                ]
              },
              "Wid": {
                controls: [
                  new TextControl(this)
                ]
              },
            }
          }
        ]
      },
      {
        title: "Geophysical Logs",
        sections: [
          {
            fields: {
              "RecentLog": {
                controls: [
                  new GTLTControl(this, true)
                ]
              },
              "MaxDepth": {
                controls: [
                  new GTLTControl(this)
                ]
              }
            }
          },
          {
            title: "Geologic",
            fields: {
              "Norm_Res": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "Caliper": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "Gamma": {
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
              "Spec_Gamma": {
                controls: [
                  new CheckboxControl(this)
                ]
              },

            }
          },
          {
            title: "Hydrogeologic",
            fields: {
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
              "Fluid_Temp": {
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

            }
          },
          {
            title: "Image",
            fields: {
              "OBI": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "ABI": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "Video": {
                controls: [
                  new CheckboxControl(this)
                ]
              },

            }
          }
        ]
      },
      {
        title: "Quaternary Core Data",
        sections: [
          {
            fields: {
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
          },
          {
            title: "Analyses available",
            fields: {
              "Subsamples": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "Photos": {
                controls: [
                  new CheckboxControl(this)
                ]
              },
              "Grainsize": {
                controls: [
                  new CheckboxControl(this)
                ]
              }
            }
          }
        ]
      }
    ];
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
      this.options = Array.from(Object.entries(window.siteMap.map._layers).reduce(((prev, ent) => (ent[1].feature && ent[1].feature.properties[context.prop])?prev.add(ent[1].feature.properties[context.prop]):prev), new Set()));
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