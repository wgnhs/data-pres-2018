import { LitElement, html, css } from 'lit-element';

let pdfjsLib = window['pdfjs-dist/build/pdf'];

const TOGGLE_EVENT = 'toggle-pdf';

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
    if (this.pdfsrc) {
      let renderRoot = this.renderRoot;
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
            return durl;
          });
        });
      }, function (reason) {
        console.error(reason);
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
      }
    };
  }

  constructor() {
    super();
    this.closed=true;
  }

  static get styles() {
    return css`
    `;
  }

  render() {
    return html`
    <button @click="${this.toggle}">${this.buttonText}</button>
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

  toggle() {
    this.closed = !this.closed;
    if (this.closedText && this.openedText) {
      this.buttonText = (this.closed)?this.closedText:this.openedText;
    }
    this.dispatchEvent(new CustomEvent(TOGGLE_EVENT, {bubbles: true, detail: {closed: this.closed}}));
  }
}
customElements.define('pdf-view-button', PDFViewButton);