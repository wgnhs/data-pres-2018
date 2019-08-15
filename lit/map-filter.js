import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
import { keyLookup, filterLookup } from '../app/site-data.js';
export { AppCollapsible } from './app-collapsible.js';
export { InRadio } from './in-radio.js';
export { ToggleSwitch } from './toggle-switch.js';
export { FilterSummary } from './filter-summary.js';

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
        <filter-summary .counts="${this.counts}"></filter-summary>
      </div>
      <div>
        Show sites that have <in-radio choices='["ALL", "ANY"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
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
            ?checked=${group.active}
            @change=${this._handleGroup(group, this.include)}
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
                    @change="${this._handleControl(group, control, this.filter)}">
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
      }
    }
  }

  _handle(context) {
    return (e) => {
      const handler = this._eventHandlers[e.type];
      if (handler) {
        handler(context, e);
        this.requestUpdate();
      }
    }
  }

  _handleGroup(group, filter) {
    const id = group.id;
    const handle = group.activate.bind(group);
    return (e) => {
      const context = {};
      context.id = id;
      context.toggleable = group.toggleable;
      context.detail = e.detail;
      context.prop = group.prop;
      context.value = group[group.prop];
      removeFromFilter(filter, id);
      let resolver = handle(context);
      if (resolver) {
        filter.push(resolver);
      }
      this.requestUpdate();
    }
  }

  _handleControl(group, control, filter) {
    const id = control.id;
    const handle = control.handle.bind(control);
    return (e) => {
      const context = {};
      context.id = id;
      context.group = group;
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;
      removeFromFilter(filter, id);
      let resolver = handle(context);
      if (resolver) {
        filter.push(resolver);
      }
      this.requestUpdate();
    }
  }

  updated(changed) {
    let matchClass = this.matchClass;
    let incl = this.include;
    let filt = this.filter;
    console.log(changed, matchClass, incl, filt);
    if (window.siteMap) {
      window.siteMap.runFilter({matchClass, incl, filt});
    }
  }

  firstUpdated() {
    this.$summary = this.renderRoot.querySelector('filter-summary');
  }

  init(uniques) {
    this.filterGroups.forEach((group) => {
      group.sections.forEach((section) => {
        Object.entries(section.fields).forEach((field) => {
          field[1].controls.forEach((control) => {
            if (control.init) {
              control.init(uniques[field[0]]);
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
    this.filterGroups = filterLookup;
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

