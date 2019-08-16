import { LitElement, html, css } from 'lit-element';

export class CoreLayout extends LitElement {
  static get layoutName() {
    return 'Quaternary Core Data';
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
    `;
  }
  render() {
    return html``;
  }
}
customElements.define('core-layout', CoreLayout);
