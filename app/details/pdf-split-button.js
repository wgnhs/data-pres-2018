import { LitElement, html, css } from 'lit-element';
import { styles } from 'wgnhs-styles';
export { AppCollapsible } from 'wgnhs-layout';
export { DownloadButton } from './download-button.js';

const TOGGLE_EVENT = 'toggle-pdf-panel';

export class PDFSplitButton extends LitElement {
  static get properties() {
    return {
      src: {
        type: String
      },
      panel: {
        type: Object,
        attribute: false
      },
      closed: {
        type: Boolean,
        attribute: false
      }
    };
  }

  constructor() {
    super();
    this.closed=true;
  }

  static get styles() {
    return [
      ...styles,
      css`
      .container {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: var(--border-radius);
      }

      .dl-button:not([exists]), .dl-button:not([exists]) + .view-button {
        visibility: hidden;
      }
      `
    ];
  }

  render() {
    return html`
    <div class="container">
      <download-button class="dl-button" src="${this.src}">
        <span slot="label"><slot name="download-text">Download</slot></span>
        <span slot="detail"></span>
      </download-button>
      <app-collapsible class="view-button" @open="${this.toggle}" button>
        <span slot="header"><slot name="view-text">View</slot></span>
        <i slot="header-after" class="material-icons" title="View">${
          (this.alt)?'chevron_left':'chevron_right'
        }</i>
      </app-collapsible>
    </div>
    `;
  }

  updated(prev) {
    if ((prev.has('panel') || prev.has('src'))) {
      if (this.panel && this.src) {
        this.panel.request(this.src)
      }
    }
  }

  toggle(e) {
    if (!this.closed) {
      this.panel.hide();
    } else {
      this.panel.show(this.src);
    }
  }

  handleAlt(e) {
    if (e.detail.url === this.src) {
      this.closed = false;
    } else {
      this.closed = true;
    }
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    this.__altHandler = this.handleAlt.bind(this);
    document.addEventListener(TOGGLE_EVENT, this.__altHandler);
  }

  disconnectedCallback() {
    document.removeEventListener(TOGGLE_EVENT, this.__altHandler);
    super.disconnectedCallback();
  }
}
customElements.define('pdf-split-button', PDFSplitButton);
