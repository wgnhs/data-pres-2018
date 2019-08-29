import { LitElement, html, css } from 'lit-element';
import { genId } from 'wgnhs-common';
import { ignoredKeys, keyLookup } from '../../site-data.js';

export class TableLayout extends LitElement {

  static get layoutName() {
    return undefined;
  }

  static include(info, context) {
    return html`<table-layout .info=${info} .context=${context}></table-layout>`;
  }

  static get properties() {
    return {
      info: {
        type: Object
      },
      context: {
        type: Object
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
  }

  static get styles() {
    return css`
      [data-element="table"] {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }
      .label {
        font-weight: var(--font-weight-bold);
      }
    `;
  }

  render() {
    let key = 0, value = 1;
    let entries = Object.entries(this.info).filter((el) => {
      return !ignoredKeys.includes(el[key]);
    }).filter((el) => {
      return !!el[value];
    }).map((el, index) => html`
      <dt class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <label for="${this.genId(index)}" >
          ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
        </label>
      </dt>
      <dd class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <span id="${this.genId(index)}">
          ${el[value]}
        </span>
      </dd>
    `);
    return html`
      <dl data-element="table">
        ${entries}
      </dl>
    `;
  }
}
customElements.define('table-layout', TableLayout);
