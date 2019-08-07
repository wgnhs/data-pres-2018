import { LitElement, html, css } from 'lit-element';
import AppCollapsible from './app-collapsible.js';
import ButtonLink from './button-link.js';

let pdfjsLib = window['pdfjs-dist/build/pdf'];

const TOGGLE_EVENT = 'toggle-pdf';
const LOADED_EVENT = 'loaded-pdf';
const MISSING_EVENT = 'missing-pdf';

export class PDFView extends LitElement {
  static get properties() {
    return {
      pdfsrc: {
        type: String
      },
      imgsrc: {
        type: String
      }
    };
  }

  buildImgSrc() {
    let dispatch = this.dispatchEvent.bind(this);
    if (this.pdfsrc) {
      let canvasEl = document.createElement('canvas');
      let loadingTask = pdfjsLib.getDocument(this.pdfsrc);
      return loadingTask.promise.then(function(pdf) {
        // console.log('PDF Loaded');
        var pageNumber = 1;
        return pdf.getPage(pageNumber).then(function(page) {
          // console.log('Page loaded');
          
          var scale = 1.0;
          var viewport = page.getViewport({scale: scale});

          // Prepare canvas using PDF page dimensions
          var canvas = canvasEl;
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          var renderTask = page.render(renderContext);
          return renderTask.promise.then(function () {
            // console.log('Page rendered');
            let durl = canvasEl.toDataURL();
            dispatch(new CustomEvent(LOADED_EVENT, {bubbles: true, composed: true}));
            return durl;
          });
        });
      }, function (reason) {
        if (reason.name === 'MissingPDFException') {
          dispatch(new CustomEvent(MISSING_EVENT, {bubbles: true, composed: true}));
        } else {
          console.error(reason);
        }
      });
    }
    return Promise.resolve(null);
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
      div {
        min-height: 10em;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      img {
        max-width: 45vw;
      }
    `;
  }

  render() {
    return html`
    <div>
      ${(!this.imgsrc)?'':html`
      <img src="${this.imgsrc}" />
      `}
    </div>
    `;
  }

  updated(old) {
    var el = this;
    if (old.has('pdfsrc')) {
      if (el.pdfsrc) {
        el.buildImgSrc().then(function(url) {
          el.imgsrc = url;
        })
      } else {
        el.imgsrc = null;
      }
    }
  }
}
customElements.define('pdf-view', PDFView);

export class PDFViewPanel extends LitElement {
  static get properties() {
    return {

    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
    :host {
      overflow: auto;
    }
    div {
      min-height: 10em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    `;
  }

  render() {
    return html`
    <div>
      <slot></slot>
    </div>
    `;
  }

  handleSketchToggle(e) {
    if (e.detail.closed) {
      this.setAttribute('data-closed', true);
    } else {
      this.removeAttribute('data-closed');
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(TOGGLE_EVENT, this.handleSketchToggle.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener(TOGGLE_EVENT, this.handleSketchToggle.bind(this));
    super.disconnectedCallback();
  }
}
customElements.define('pdf-view-panel', PDFViewPanel);

export class PDFViewButton extends LitElement {
  static get properties() {
    return {
      buttonText: {
        type: String,
        attribute: 'button-text'
      },
      closedText: {
        type: String,
        attribute: 'closed-text'
      },
      openedText: {
        type: String,
        attribute: 'opened-text'
      },
      closed: {
        type: Boolean,
        attribute: false
      },
      missing: {
        type: Boolean,
        attribute: false
      }
    };
  }

  constructor() {
    super();
    this.closed = true;
    this.missing = true;
  }

  static get styles() {
    return css`
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: var(--border-radius);
    }

    [data-closed] {
      display: none;
    }
    `;
  }

  render() {
    return html`
    <style>
      @import url("./css/typography.css");
    </style>
    <div class="container" ?data-closed=${this.missing}>
      <button-link href="" target="_blank" download>
        <i slot="content-before" class="material-icons" title="Download">save_alt</i>
        <span slot="content">Download</span>
      </button-link>
      <app-collapsible @open="${this.toggle}" button>
        <span slot="header">View</span>
        <i slot="header-after" class="material-icons" title="View">chevron_right</i>
      </app-collapsible>
    </div>
    `;
  }

  firstUpdated() {
    if (this.closedText && this.openedText) {
      this.buttonText = (this.closed)?this.closedText: this.openedText;
    } else {
      if (!this.buttonText) {
        this.buttonText = "toggle";
      }
    }
  }

  toggle(e) {
    this.closed = !this.closed;
    if (this.closedText && this.openedText) {
      this.buttonText = (this.closed)?this.closedText:this.openedText;
    }
    this.dispatchEvent(new CustomEvent(TOGGLE_EVENT, {bubbles: true, composed: true, detail: {closed: this.closed}}));
  }


  handleMissingPDF(e) {
    this.missing = true;
    this.requestUpdate();
  }

  handleLoadedPDF(e) {
    this.missing = false;
    this.requestUpdate();
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener(MISSING_EVENT, this.handleMissingPDF.bind(this));
    document.addEventListener(LOADED_EVENT, this.handleLoadedPDF.bind(this));
  }

  disconnectedCallback() {
    document.removeEventListener(MISSING_EVENT, this.handleMissingPDF.bind(this));
    document.removeEventListener(LOADED_EVENT, this.handleLoadedPDF.bind(this));
    super.disconnectedCallback();
  }
}
customElements.define('pdf-view-button', PDFViewButton);