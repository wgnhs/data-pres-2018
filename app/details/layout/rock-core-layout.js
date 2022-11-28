import { LitElement, html, css } from 'lit-element';
import { SiteData, filterLookup } from '../../site-data.js';
export { DownloadButton } from '../download-button.js';

export class RockCoreLayout extends LitElement {
  static get layoutName() {
    return 'rock core';
  }

  static include(info, context) {
    return html`<rock-core-layout .info=${info} .context=${context}></rock-core-layout>`;
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
      src="${'https://data.wgnhs.wisc.edu/core-photos/' + this.info.WID + '.pdf'}">
      <span slot="download-text">Download Photos</span>
    </pdf-view-button>
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
customElements.define('rock-core-layout', RockCoreLayout);
