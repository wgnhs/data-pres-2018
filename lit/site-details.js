import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';
import { ignoredKeys, keyLookup } from '../app/site-data.js';
export { PDFViewButton } from './pdf-view.js';

export class SiteDetails extends LitElement {
  static get properties() {
    return {
      siteinfo: {
        type: Object
      },
      pdfpanel: {
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
        /* background-color: var(--palette-dark); */
        font-weight: var(--font-weight-bold);
      }

      .detail {
        /* background-color: var(--palette-light); */
      }

      .header {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        background-color: var(--palette-white);
        padding: var(--font-size-extra-large) var(--border-radius);
        z-index: 10;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
      }
      .header h1 {
        padding: 0;
        max-width: 70%;
        text-align: center;
      }
      .header i {
        font-size: var(--icon-size-large);
        color: var(--palette-accent);
        cursor: pointer;
      }
      
      [data-closed] {
        display: none;
      }
    `;
  }

  renderTable(info) {
    let key = 0, value = 1;
    return Object.entries(info).filter((el, index) => {
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
    let Latitude = (this.siteinfo)?this.siteinfo['Latitude']:null;
    let Longitude = (this.siteinfo)?this.siteinfo['Longitude']:null;
    let WID = (this.siteinfo)?this.siteinfo['Wid']:null;
    return html`
      <style>
        @import url("./css/typography.css");
      </style>

      ${(!this.siteinfo)? '' : html`
        <div class="header">
          <span>
            <a href="${window.router.link('entry')}" onclick="event.preventDefault()"><i class="material-icons clear-selection" title="Clear selection" @click="${this.fireClearSelection}" >arrow_back</i></a>
          </span>
          <h1>${this.siteinfo.Site_Name}</h1>
          <span></span>
        </div>
        <div data-element="table">
          ${this.renderTable({
            Latitude, Longitude, WID
          })}
        </div>
        <h2>Data Available:</h2>
        ${this.siteinfo.datas.map((props) => html`
          <app-collapsible open>
            <span slot="header">${props['Data_Type']}</span>
            <div slot="content">
              <div data-element="table">
                ${this.renderTable(props)}
              </div>
              ${(!props.Wid)?'':html`
                <pdf-view-button
                  .panel=${this.pdfpanel}
                  src="${'https://data.wgnhs.wisc.edu/geophysical-logs/' + props.Wid + '.pdf'}"
                  ></pdf-view-button>
              `}
            </div>
          </app-collapsible>
        `)}
      `}
    `;
  }

  fireClearSelection() {
    let event = new CustomEvent('clear-selection', {
      bubbles: true,
      detail: {}
    });
    this.dispatchEvent(event);
  }
}
customElements.define('site-details', SiteDetails);