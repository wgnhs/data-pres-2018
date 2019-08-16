import { LitElement, html, css } from 'lit-element';

export class LogLayout extends LitElement {
  static get layoutName() {
    return 'Geophysical Log Data';
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
    <table-layout .info=${this.info} .context=${this.context}></table-layout>
    <pdf-view-button
      .panel=${this.context.pdfpanel}
      src="${'https://data.wgnhs.wisc.edu/geophysical-logs/' + this.info.Wid + '.pdf'}">
    </pdf-view-button>
    `;
  }
}
customElements.define('log-layout', LogLayout);
