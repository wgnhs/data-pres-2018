import { LitElement, html, css } from 'lit-element';
import { filterLookup, keyLookup } from '../../site-data.js';

export class QuatCoreLayout extends LitElement {
  static get layoutName() {
    return 'quaternary core';
  }

  static include(info, context) {
    return html`<quat-core-layout .info=${info} .context=${context}></quat-core-layout>`;
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
    <table-layout .info=${this.prepInfo()}></table-layout>
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
      .map(kv => (keyLookup[kv[0]])?keyLookup[kv[0]].title:kv[0])
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
customElements.define('quat-core-layout', QuatCoreLayout);
