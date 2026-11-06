import { LitElement, html, css } from 'lit-element';
import { filterLookup, SiteData } from '../../site-data.js';

export class ThinSectionLayout extends LitElement {
  static get layoutName() {
    return 'thin sections';
  }

  static include(info, context) {
    return html`<thin-section-layout .info=${info} .context=${context}></thin-section-layout>`;
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
    ${this.context.slidepanel}
    <table-layout .info=${this.prepInfo()} .context=${this.context}></table-layout>
    <slide-view-button
      .panel=${this.context.slidepanel}
      src="${'https://data.wgnhs.wisc.edu/thin-section-photos/1ppl.jpg'}"
      preview="${'https://data.wgnhs.wisc.edu/thin-section-photos/1ppl_thumb.jpg'}">
      <span slot="download-text">View thin section images</span>
    </slide-view-button>
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
    let names = Object.entries(fields)
      .filter(kv => !!kv[1])
      .map(kv => SiteData.getFieldTitle(kv[0], this.context.layoutName))
      .map(val => html`${val}<br>`);
    if (names.length < 1) {
      names = null;
    }
    return {
      'Analyses available:': names
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
customElements.define('thin-section-layout', ThinSectionLayout);
