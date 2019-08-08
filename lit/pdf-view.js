import { LitElement, html, css } from 'lit-element';
export { AppCollapsible } from './app-collapsible.js';
export { ButtonLink } from './button-link.js';

let pdfjsLib = window['pdfjs-dist/build/pdf'];

const TOGGLE_EVENT = 'toggle-pdf-panel';

class PDFRenderer {
  render(url) {
    if (url) {
      let canvasEl = document.createElement('canvas');
      let loadingTask = pdfjsLib.getDocument(url);
      return loadingTask.promise.then(function(pdf) {
        // console.log('PDF Loaded');
        var pageNumber = 1;
        return pdf.getPage(pageNumber);
      }).then(function(page) {
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
        return renderTask.promise;
      }).then(function () {
        // console.log('Page rendered');
        let durl = canvasEl.toDataURL();
        return durl;
      });
    }
    return Promise.reject(null);
  }
}

export class PDFViewPanel extends LitElement {
  static get properties() {
    return {
      imgsrc: {
        type: String,
        attribute: false
      }
    };
  }

  constructor() {
    super();
    this.cache = {};
    this.renderer = new PDFRenderer();
  }

  static get styles() {
    return css`
    :host {
      overflow: auto;
    }
    .container {
      min-height: 10em;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .content {
      max-width: 45vw;
    }
    .hide {
      position: absolute;
      top: 0px;
      margin: var(--border-radius);
      z-index: 10;

      font-size: var(--icon-size-large);
      color: var(--palette-accent);
      cursor: pointer;

      padding: var(--border-radius);
      background-color: var(--palette-light);
      border-radius: 50%;
    }
    `;
  }

  render() {
    return html`
    <style>
      @import url("./css/typography.css");
    </style>
    <i class="material-icons hide" title="Hide" @click=${this.hide}>close</i>
    <div class="container">
      ${(!this.imgsrc)?'':html`
      <img class="content" src="${this.imgsrc}" />
      `}
    </div>
    `;
  }

  show(url) {
    // console.log('show', url);
    this.dispatchEvent(new CustomEvent(TOGGLE_EVENT,
      {bubbles: true, composed: true, detail: {closed: false}}));
    this.imgsrc = this.cache[url];
    this.removeAttribute('data-closed');
  }

  hide() {
    // console.log('hide');
    this.imgsrc = null;
    this.setAttribute('data-closed', true);
    this.dispatchEvent(new CustomEvent(TOGGLE_EVENT,
      {bubbles: true, composed: true, detail: {closed: true}}));
  }

  _getFromCache(url) {
    return new Promise((resolve, reject) => {
      let result = this.cache[url];
      if (result) {
        resolve(result);
      } else {
        reject('Not in cache');
      }
    });
  }

  request(url) {
    // console.log('request', url);
    return this._getFromCache(url).catch(() => {
      return this.renderer.render(url).then((value) => {
        this.cache[url] = value;
        return value;
      });
    });
  }

}
customElements.define('pdf-view-panel', PDFViewPanel);

export class PDFViewButton extends LitElement {
  static get properties() {
    return {
      src: {
        type: String
      },
      panel: {
        type: Object,
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
      <button-link href="${this.src}" target="_blank" download>
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

  updated(prev) {
    if ((prev.has('panel') || prev.has('src'))) {
      this.handleMissingPDF();
      if (this.panel && this.src) {
        this.panel.request(this.src)
          .then(this.handleLoadedPDF.bind(this), this.handleMissingPDF.bind(this));
      }
    }
  }

  toggle(e) {
    if (this.panel) {
      this.panel.show(this.src);
    }
  }

  handleMissingPDF() {
    if (!this.missing) {
      this.missing = true;
    }
  }

  handleLoadedPDF() {
    if (this.missing) {
      this.missing = false;
    }
  }
}
customElements.define('pdf-view-button', PDFViewButton);