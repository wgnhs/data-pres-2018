import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
import { keyLookup } from '../app/site-data.js';
import { CheckboxControl, GTLTControl, SelectControl, TextControl, ContainsControl } from './filter-controls.js';
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
                    @change="${this._controlHandle(control, this.filter)}">
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

  _controlHandle(control, filter) {
    const id = control.id;
    const handle = control.handle.bind(control);
    return (e) => {
      let context = {};
      context.id = id;
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;
      removeFromFilter(filter, id);
      let item = handle(context);
      if (item) {
        filter.push(item);
      }
      this.requestUpdate();
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

  init(uniques) {
    this.filterGroups.forEach((group) => {
      group.sections.forEach((section) => {
        Object.entries(section.fields).forEach((field) => {
          field[1].controls.forEach((control) => {
            if (control.init && control.prop) {
              control.init(uniques[control.prop]);
            }
          })
        })
      })
    });
    this.requestUpdate();
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
                  new SelectControl("County")
                ]
              },
              "SiteName": {
                controls: [
                  new ContainsControl()
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
                  new GTLTControl(true)
                ]
              },
              "Depth_Ft": {
                controls: [
                  new GTLTControl()
                ]
              },
              "Drill_Meth": {
                controls: [
                  new SelectControl('Drill_Meth')
                ]
              },
            }
          },
          {
            title: "Analyses available",
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

