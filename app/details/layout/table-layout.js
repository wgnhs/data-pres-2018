import { LitElement, html, css } from 'lit-element';
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
    }).map((el, index) => html`
      <td class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <label for="${this.context.genId(index)}" >
          ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
        </label>
      </td>
      <td class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <span id="${this.context.genId(index)}">
          ${el[value]}
        </span>
      </td>
    `);
    return html`
      <div data-element="table">
        ${entries}
      </div>
    `;
  }
}
customElements.define('table-layout', TableLayout);
