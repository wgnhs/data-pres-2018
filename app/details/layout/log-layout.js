import { LitElement, html, css } from 'lit-element';
import { SiteData, filterLookup } from '../../site-data.js';
export { DownloadButton } from '../download-button.js';

export class LogLayout extends LitElement {
  static get layoutName() {
    return 'geophysical log';
  }

  static include(info, context) {
    return html`<log-layout .info=${info} .context=${context}></log-layout>`;
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
    `;
  }

  render() {
    return html`
    <table-layout .info=${this.prepInfo()} .context=${this.context}></table-layout>
    <pdf-view-button
      .panel=${this.context.pdfpanel}
      src="${'https://data.wgnhs.wisc.edu/borehole-geophysics/pdf/' + this.info.WID + '.pdf'}">
      <span slot="download-text">Download PDF</span>
    </pdf-view-button>
    <download-button
      src="${'https://data.wgnhs.wisc.edu/borehole-geophysics/las/' + this.info.WID + '.las'}">
      Download LAS
    </download-button>
    `;
  }

  prepInfo() {
    return Object.assign(this.topFields, this.bottomFields);
  }

  get topFields() {
    return this.getFields(el => !el.bundled);
  }

  get bottomFields() {
    const fields = this.getFields(el => el.bundled);
    const names = Object.entries(fields)
      .filter(kv => !!kv[1])
      .map(kv => SiteData.getFieldTitle(kv[0], this.context.layoutName));
    return {
      'Data available:': names.map(val => html`${val}<br>`)
    };
  }

  get group() {
    return filterLookup.find(el => (el.prop && el[el.prop] === this.info[el.prop]));
  }

  getFields(fn) {
    const result = {};
    const sections = this.group.sections.filter(fn);
  
    sections.forEach(section => {
      Object.entries(section.fields).forEach(kv => {
        result[kv[0]] = this.info[kv[0]];
      })
    });
  
    return result;
  }
}
customElements.define('log-layout', LogLayout);
