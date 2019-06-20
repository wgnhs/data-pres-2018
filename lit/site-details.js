import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';

export class SiteDetails extends LitElement {
  static get properties() {
    return {
      siteinfo: {
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
        grid-template-columns: 30% 70%;
        grid-gap: 0.5em;
      }

      td {
        padding: 0.5em;
      }

      .label {
        background-color: var(--palette-dark);
        font-weight: var(--font-weight-bold);
      }

      .detail {
        background-color: var(--palette-light);
      }

      .header {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        background-color: var(--palette-white);
        padding: 1em;
        z-index: 10;
        width: 100%;
      }
    `;
  }

  get renderTable() {
    let key = 0, value = 1;
    return Object.entries(this.siteinfo).filter((el, index) => {
      return !ignoredKeys.includes(el[key]);
    }).map((el, index) => html`
    <td class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
      <label for="${this.genId(index)}" >
        ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
      </label>
    </td>
    <td class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
      <span id="${this.genId(index)}">
        ${el[value]}
      </span>
    </td>
  `)
  }

  render() {
    return html`
      <style>
        @import url("./css/typography.css");
      </style>

      ${(!this.siteinfo)? '' : html`
        <h1 class="header">${this.siteinfo.Wid}: ${this.siteinfo.SiteName}</h1>
        <div data-element="table">
          ${this.renderTable}
        </div>
      `}
    `;
  }
}
customElements.define('site-details', SiteDetails);

let ignoredKeys = [
];
let keyLookup = {
};