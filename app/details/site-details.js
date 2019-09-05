import { LitElement, html, css } from 'lit-element';
import { styles } from 'wgnhs-styles';
import { dispatch } from 'wgnhs-common';
export { PDFViewButton } from 'wgnhs-pdf';
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

  }

  static get styles() {
    return [
      ...styles,
      css`
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

      .name {
        text-transform: capitalize;
      }

      [data-closed] {
        display: none;
      }
    `];
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
      ${(!this.siteinfo)? '' : html`
        <div class="header">
          <span>
            <a href="${window.router.link('entry')}" onclick="event.preventDefault()"><i class="material-icons clear-selection" title="Clear selection" @click="${this.fireClearSelection}" >arrow_back</i></a>
          </span>
          <h1>${this.siteinfo.Site_Name}</h1>
          <span>
            <i class="material-icons zoom-to-site" title="Zoom to site" @click="${this.fireZoomToSite}">my_location</i>
          </span>
        </div>
        ${this.renderData({
          Latitude, Longitude, WID
        })}
        ${this.siteinfo.datas.map((props) => html`
          <app-collapsible open>
            <span slot="header" class="name">${props['Data_Type']}</span>
            <div slot="content">
              ${this.renderData(props, props['Data_Type'])}
            </div>
          </app-collapsible>
        `)}
      `}
    `;
  }

  fireClearSelection() {
    dispatch(this, 'clear-selection', {}, true, true);
  }

  fireZoomToSite() {
    dispatch(this, 'zoom-to-site', {params: this.siteinfo}, true, true);
  }
}
customElements.define('site-details', SiteDetails);