import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
import { keyLookup } from '../app/key-lookups.js';
export { AppCollapsible } from './app-collapsible.js';
export { InRadio } from './in-radio.js';
export { ToggleSwitch } from './toggle-switch.js';

export class MapFilter extends LitElement {
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
      }
    };
  }

  static get styles() {
    return css`
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
    return this.filterGroups.map((group) => html`
      <app-collapsible
        ?open=${group.open} @open=${this._handle(group)}>
        <i slot="header-before" class="material-icons">expand_more</i>
        <span slot="header">${group.title}</span>
        ${(!group.toggleable)?'':html`
          <toggle-switch
            name="${group.mapName}"
            slot="header-after"
            ?checked=${group.open}
            @change=${group.activate}
          ></toggle-switch>
        `}
        <div slot="content">
          ${group.sections.map((section, index) => html`
            ${!(section.title)?'':html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map((entry, index) => html`
              <div class="field">
              ${(entry[config].controls.length === 0)?'':entry[config].controls.map(control => html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${this.resolveKeyLookup(entry[name])}
                  </label>
                </td>
                <td class="selector" 
                    @change="${control.handle.bind(control)}">
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
        this.requestUpdate();
      }
    }
  }

  _handle(context) {
    return (e) => {
      const handler = this._eventHandlers[e.type];
      if (handler) {
        handler(context, e);
      }
    }

  }

  updated(changed) {
    let matchClass = this.matchClass;
    let incl = this.include;
    let filt = this.filter;
    if (window.siteMap) {
      window.siteMap.map.fire('filterpoints', {
        detail: {
          resolve: function(props) {
            let included = incl.length > 0 && incl.reduce((prev, curr) => {
              return prev || curr.resolve(props);
            }, false);
            let result = included && filt.length < 1;
            if (included && !result) {
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
    this.include = [];
    this.filter = [];
    this.filterGroups = [
      {
        title: "Site Information",
        open: true,
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
                  new ContainsControl(this)
                ]
              },
              "Site_Name": {
                controls: [
                  new ContainsControl(this)
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
        mapName: 'Geophysical Log',
        toggleable: true,
        activate: (e) => {
          const id = e.target.id;
          const isOn = e.detail.checked;

          removeFromFilter(this.include, id)
          if (isOn) {
            this.include.push({
              id: id,
              resolve: function(el) {
                return el['Data_Type'] === 'Geophysical Log';
              }
            });
          }
          this.requestUpdate();
        },
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
        mapName: 'Quaternary Core',
        toggleable: true,
        activate: (e) => {
          const id = e.target.id;
          const isOn = e.detail.checked;

          removeFromFilter(this.include, id)
          if (isOn) {
            this.include.push({
              id: id,
              resolve: function(el) {
                return el['Data_Type'] === 'Quaternary Core';
              }
            });
          }
          this.requestUpdate();
        },
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

const removeFromFilter = (filter, id) => {
  for (
    var idx = filter.findIndex(el => el.id === id); 
    idx >= 0;
    idx = filter.findIndex(el => el.id === id)
  ) {
    filter.splice(idx, 1);
  }
}

class CheckboxControl {
  constructor(element) {
    this.id = genId();
    this.filter = element.filter;
    this.postHandle = element.requestUpdate.bind(element);
  }
  get next() {
    return html`
      <input type="checkbox">
    `;
  }
  handle(e) {
    let id = this.id;
    let context = {};
    context.target = e.currentTarget.querySelector('#'+id);
    context.prop = context.target.name;

    removeFromFilter(this.filter, id);

    let isOn = context.target.nextElementSibling.checked;
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

    removeFromFilter(this.filter, id);

    let isOn = context.target.nextElementSibling.nextElementSibling.value;
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
      this.options = Array.from(Object.entries(window.siteMap.map._layers).reduce(((prev, ent) => (ent[1].feature && ent[1].feature.properties[context.prop])?prev.add(ent[1].feature.properties[context.prop]):prev), new Set())).sort();
    }

    removeFromFilter(this.filter, id);

    let isOn = context.target.nextElementSibling.value;
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

    removeFromFilter(this.filter, id);

    let isOn = context.target.nextElementSibling.value;
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

class ContainsControl {
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

    removeFromFilter(this.filter, id);

    let isOn = context.target.nextElementSibling.value;
    if (isOn) {
      this.filter.push({
        id: id,
        resolve: function(feature) {
          // filter out features without the property
          let result = !!feature[context.prop];
          if (result) {
            let input = context.target.nextElementSibling.value;
            // blank filter selects all
            if (input) {
              let cleanInput = input.trim().toUpperCase();
              let cleanProp = feature[context.prop].toUpperCase();
              result = cleanProp.includes(cleanInput);
            }
          }
          return result;
        }
      })
    }
    this.postHandle();
  }
}