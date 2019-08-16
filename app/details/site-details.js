import { LitElement, html, css } from 'lit-element';
import { genId } from 'wgnhs-common';
export { PDFViewButton } from 'wgnhs-viz';
import { layoutResolver } from './layout-resolver.js';

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

  renderData(info, layoutName) {
    const layout = layoutResolver.getLayout(layoutName);
    return layout(info, this);
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
        ${this.renderData({
          Latitude, Longitude, WID
        })}
        <h2>Data Available:</h2>
        ${this.siteinfo.datas.map((props) => html`
          <app-collapsible open>
            <span slot="header">${props['Data_Type']}</span>
            <div slot="content">
              ${this.renderData(props, props['Data_Type'])}
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