import { LitElement, html, css } from 'lit-element';
import { genId, dispatch } from 'wgnhs-common';
export { InRadio, ToggleSwitch } from 'wgnhs-layout';
export { AppCollapsible } from 'wgnhs-layout';
import { styles } from 'wgnhs-styles';
export { FilterSummary } from './filter-summary.js';
import { SiteData, filterLookup } from '../site-data.js';
import { SiteMap } from '../map/site-map.js';

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
      },
      sources: {
        type: Array,
        attribute: false
      }
    };
  }

  static get styles() {
    return [
      ...styles,
      css`
      .field {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        color: var(--palette-900);
        font-weight: var(--font-weight-bold);
      }

      .selector {
      }

      .section-title {
        margin: var(--line-height) 0 0 0;
        padding: var(--border-radius);
        background-color: var(--palette-light);
      }

      [data-closed] {
        display: none;
      }

      in-radio {
        display: inline-grid;
        grid-template-columns: auto auto;
      }

      .collapse-icon::before {
        content: "expand_more"
      }

      [open] > .collapse-icon::before {
        content: "expand_less"
      }

      .raw-source-button {
        display: flex;
        margin-top: var(--line-height);
      }
      .raw-source-button > * {
        font-size: var(--font-size);
      }
    `];
  }

  updateMatchClass(e) {
    this.matchClass = e.target.choice;
  }

  render() {
    return html`
      <div data-closed>
        Show sites that have <in-radio choices='["ALL", "ANY"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
      </div>
      <div>
        ${this.renderFilterGroups()}
      </div>
    `;
  }

  renderFilterGroups() {
    return this.filterGroups.map((group, index) => html`
      <slot name="${index}"></slot>
      <app-collapsible class="group"
        ?open=${group.open}>
        <i slot="header-before" class="material-icons collapse-icon"></i>
        <span slot="header">${group.title}</span>
        ${(!group.toggleable)?'':html`
          <toggle-switch
            name="${group.title}"
            slot="header-after"
            ?checked=${group.active}
            @change=${this._handleGroup(group, 'include')}
            style="--palette-active: ${group.color}"
          ></toggle-switch>
        `}
        <div slot="content">
          ${group.sections.map((section, index) => html`
            ${!(section.title)?'':html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map(([name, config], index) => (!config.controls)?'':html`
              <div class="field">
              ${(config.controls.length === 0)?'':config.controls.map(control => html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${config.title}
                  </label>
                </td>
                <td class="selector" 
                    @change="${this._handleControl(group, control, 'filter')}">
                  <input
                    type="hidden"
                    id="${control.id}"
                    name="${config.fieldKey}">
                  ${control.next}
                </td>
              `)}
              </div>
            `)}
          `)}
          ${(group.source && group.source.user)?html`
          <button-link href="${group.source.user}" class="raw-source-button">
            <span slot="content">View data source</span>
            <i slot="content-after" class="material-icons">open_in_new</i>
          </button-link>
          `:''}
        </div>
      </app-collapsible>
    `);
  }

  _handleGroup(group, type) {
    const id = group.id;
    const handle = group.activate.bind(group);
    const filter = this[type];
    const callback = this.requestUpdate.bind(this);
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
      callback(type);
    }
  }

  _handleControl(group, control, type) {
    const id = control.id;
    const handle = control.handle.bind(control);
    const filter = this[type];
    const callback = this.requestUpdate.bind(this);
    return (e) => {
      const context = {};
      context.id = id;
      context.group = group;
      context.target = e.currentTarget.querySelector('#'+id);
      const lookup = SiteData.getFieldConfiguration(context.target.name);
      const mappings = {};
      if (group.prop && group[group.prop]) {
        mappings[group[group.prop]] = lookup.field;
      }
      if (lookup.members) {
        lookup.members.forEach(({source, field}) => {
          mappings[source] = field;
        })
      }
      context.prop = mappings;
      removeFromFilter(filter, id);
      let resolver = handle(context);
      if (resolver) {
        filter.push(resolver);
      }
      callback(type);
    }
  }

  handleRouteChange() {
    const activePoints = MapFilter.runFilter({
      matchClass: this.matchClass,
      incl: this.include,
      filt: this.filter,
      sources: this.sources
    });
    const counts = MapFilter.getResultsInfo(
      this.matchClass,
      this.include,
      this.filter,
      this.sources,
      activePoints
      );
    dispatch(this, 'filtered', {activePoints, counts}, true, true);
  }

  updated(changed) {
    const isNeeded = (
      changed.has('matchClass') ||
      changed.has('include') ||
      changed.has('filter') ||
      changed.has('sources'));

    if (this.sources && isNeeded) {
      dispatch(this, 'filter-change', {
        matchClass: this.matchClass,
        incl: this.include,
        filt: this.filter,
        sources: this.sources
      }, true, true);
      this.handleRouteChange();
    }
  }

  init(layers) {
    this.filterGroups.forEach((group) => {
      let source = (group.prop && group[group.prop])?group[group.prop]:undefined;
      group.sections.forEach((section) => {
        Object.entries(section.fields).forEach(([key, field]) => {
          if (field.controls) {
            field.controls.forEach((control) => {
              if (control.init) {
                const context = Object.assign({}, SiteData.getFieldConfiguration(key, source));
                context.layers = layers;
                control.init(context);
              }
            })
          }
        })
      })
    });

    this.sources = layers;
  }

  static runFilter({matchClass, incl, filt, sources}) {
    const resolve = function runPointThroughFilters(props) {
      let included = incl.length > 0 && incl.reduce((prev, curr) => {
        return prev || curr.resolve(props);
      }, false);
      let spec = filt.filter((rule) => rule.resolveGroup(props));
      let result = included && spec.length < 1;
      if (included && !result) {
        if ("ALL" === matchClass) {
          result = spec.reduce((prev, curr) => {
            return prev && curr.resolve(props);
          }, true);
        } else {
          result = spec.reduce((prev, curr) => {
            return prev || curr.resolve(props);
          }, false);
        }
      }
      return result;
    }

    const result = sources.reduce((result, layer) => {
      const activePoints = new Set();
      Object.entries(layer._layers).forEach(([key, point]) => {
        if (resolve(point.feature.properties)) {
          activePoints.add('' + SiteMap.getSiteCode(point.feature.properties));
        }
      });
      result[layer.options.name] = activePoints;
      return result;
    }, {});

    return result;
  }

  static getResultsInfo(matchClass, include, filter, sources, activePoints) {
    const result = sources.map((layer) => {
      let stats = {};
      stats.name = layer.options.name;
      stats.included = include.some((el) => {
        return el.context.value === layer.options.name;
      });
      stats.filteredBy = filter.reduce((result, el) => {
        if (el.context.group[el.context.group.prop] === layer.options.name) {
          result.push(SiteData.getFieldTitle(el.context.prop[layer.options.name], layer.options.name));
        }
        return result;
      }, []);
      stats.matchClass = matchClass;

      let entries = Object.entries(layer._layers);
      stats.total = entries.length;
      stats.current = activePoints[layer.options.name].size;

      return stats;
    });
    return result;
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

