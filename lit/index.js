(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lit-element'), require('wgnhs-common')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lit-element', 'wgnhs-common'], factory) :
  (global = global || self, factory(global.lit = {}, global.common, global.common));
}(this, function (exports, litElement, wgnhsCommon) { 'use strict';

  class ButtonLink extends litElement.LitElement {
    static get properties() {
      return {
        href: {
          type: String
        },
        target: {
          type: String
        },
        download: {
          type: Boolean
        }
      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
    a {
      text-decoration: none;
      margin: var(--border-radius) 0;
    }
    .button-link:hover {
      color: var(--palette-900);
    }
    .button-link:focus {
      outline: thin dotted;
    }
    .button-link {
      display: block;

      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-extra-large);
      text-align: center;

      cursor: pointer;
      text-align: center;
      background: var(--palette-light);
      color: var(--palette-accent);
      border-radius: var(--border-radius);
      padding: var(--border-radius);
    }
    .wrap-content {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .icon {
      font-size: var(--icon-size-extra-large);
    }
    `;
    }

    render() {
      return litElement.html`
    <a class="button-link"
      href="${this.href}"
      target="${this.target}"
      ?download=${this.download}>
      <div class="wrap-content">
        <div><slot name="content-before"></slot></div>
        <div><slot name="content"></slot></div>
        <div><slot name="content-after"></slot></div>
      </div>
    </a>
    `;
    }
  }
  customElements.define('button-link', ButtonLink);

  class InRadio extends litElement.LitElement {
    static get properties() {
      return {
        inName: {
          type: String,
          attribute: 'in-name'
        },
        choices: {
          type: Array
        },
        choice: {
          type: String,
          reflect: true
        }
      };
    }

    constructor() {
      super();
      this.checked = [];
      this.genId = (function() {
        const memo = {};
        return function(index) {
          if (!memo[index]) {
            memo[index] = wgnhsCommon.genId();
          }
          return memo[index];
        }
      })();
    }

    firstUpdated() {
      if (!this.choice && this.choices) {
        this.choice = this.choices[0];
      }
    }

    updated() {
      let event = new CustomEvent('choice-change', {
        detail: {
          choice: this.choice
        }
      });
      this.dispatchEvent(event);
    }

    inChange(e) {
      this.choice = e.target.value;
    }

    render() {
      return litElement.html`
      ${this.choices.map((item, index) => litElement.html`
        <div class="choice">
          <input 
            type="radio" 
            name="${this.inName}" 
            id="${this.genId(index)}" 
            value="${item}" 
            .checked="${(this.choice === item)}" 
            @change="${this.inChange}"
          >
          <label for="${this.genId(index)}">${item}</label>
        </div>
      `)}
    `;
    }
  }
  customElements.define('in-radio', InRadio);

  class ToggleSwitch extends litElement.LitElement {
    static get properties() {
      return {
        checked: {
          type: Boolean
        }
      };
    }

    constructor() {
      super();
      if (!this.id) {
        this.id = wgnhsCommon.genId();
      }
    }

    static get styles() {
      return litElement.css`
    :host {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    input[type=checkbox]{
      height: 0;
      width: 0;
      margin: 0;
      visibility: hidden;
    }

    label {
      cursor: pointer;
      text-indent: -9999px;
      width: calc(2 * var(--icon-size));
      height: var(--icon-size);
      background: var(--palette-accent);
      display: block;
      border-radius: var(--icon-size);
      position: relative;
    }

    label:after {
      content: '';
      position: absolute;
      top: calc(calc(var(--icon-size) - var(--icon-size-small)) / 2);
      left: calc(calc(var(--icon-size) - var(--icon-size-small)) / 2);
      width: var(--icon-size-small);
      height: var(--icon-size-small);
      background: var(--palette-white);
      border-radius: var(--icon-size-small);
      transition: 0.3s;
    }

    input:checked + label {
      background: var(--palette-active);
    }

    input:checked + label:after {
      left: calc(100% - calc(calc(var(--icon-size) - var(--icon-size-small)) / 2));
      transform: translateX(-100%);
    }

    label:active:after {
      width: calc(var(--icon-size-small) + calc(calc(var(--icon-size) - var(--icon-size-small)) / 2));
    }
    `;
    }

    render() {
      return litElement.html`
    <input type="checkbox" id="switch" .checked=${this.checked} @change=${this.handleChange} /><label for="switch">Toggle</label>
    `;
    }

    updated(changed) {
      if (changed.has('checked')) {
        wgnhsCommon.dispatch(this, 'change', {checked: this.checked}, true);
      }
    }

    handleChange(e) {
      this.checked = e.target.checked;
    }

    toggle() {
      this.checked = !this.checked;
    }
  }
  customElements.define('toggle-switch', ToggleSwitch);

  /**
   * Code use and modified from
   * https://alligator.io/css/collapsible/
   */
  class AppCollapsible extends litElement.LitElement {
    static get properties() {
      return {
        genId: {
          type: String,
          attribute: false
        },
        open: {
          type: Boolean,
          reflect: true
        },
        button: {
          type: Boolean
        }
      };
    }

    constructor() {
      super();
      this.genId = wgnhsCommon.genId();
    }

    static get styles() {
      return litElement.css`
    .wrap-collapsible {
      margin: var(--border-radius) 0;
    }

    input[type='checkbox'] {
      display: none;
    }

    .lbl-toggle {
      display: block;

      font-weight: var(--font-weight-bold);
      font-size: var(--font-size-extra-large);
      text-align: center;

      padding: var(--border-radius);

      color: var(--palette-accent);
      background: var(--palette-light);

      cursor: pointer;

      border-radius: var(--border-radius);
      transition: border-radius var(--transition-duration, 0.3) cubic-bezier(0.755, 0.05, 0.855, 0.06);
    }

    .lbl-toggle:hover {
      color: var(--palette-900);
    }

    .lbl-toggle:focus {
      outline: thin dotted;
    }

    .collapsible-content {
      max-height: 0px;
      overflow: hidden;
      transition: max-height var(--transition-duration, 0.3) cubic-bezier(0.86, 0, 0.07, 1);
    }

    .wrap-collapsible:not([button]) .toggle:checked ~ .collapsible-content {
      max-height: var(--collapsible-max-height, 3000px);
    }

    .wrap-collapsible:not([button]) .toggle:checked ~ .lbl-toggle {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      transition: border 0s;
    }

    .collapsible-content .content-inner {
      background: var(--palette-white);
      border-bottom: 1px solid var(--palette-light);
      border-right: 1px solid var(--palette-light);
      border-left: 1px solid var(--palette-light);
      border-bottom-left-radius: var(--border-radius);
      border-bottom-right-radius: var(--border-radius);
      padding: var(--font-size);
    }
    .collapsible-header {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    `;
    }

    render() {
      return litElement.html`
    <div class="wrap-collapsible" ?button=${this.button}>
      <input id="${this.genId}" class="toggle" type="checkbox" .checked="${this.open}" @change=${this._handleChange}>
      <label for="${this.genId}" class="lbl-toggle" tabindex="0">
        <div class="collapsible-header">
          <div><slot name="header-before"></slot></div>
          <div><slot name="header"></slot></div>
          <div><slot name="header-after"></slot></div>
        </div>
      </label>
      <div class="collapsible-content">
        <div class="content-inner">
          <slot name="content"></slot>
        </div>
      </div>
    </div>
    `;
    }

    firstUpdated() {
      let myLabels = this.renderRoot.querySelectorAll('.lbl-toggle');

      Array.from(myLabels).forEach(label => {
        label.addEventListener('keydown', e => {
          // 32 === spacebar
          // 13 === enter
          if (e.which === 32 || e.which === 13) {
            e.preventDefault();
            label.click();
          }      });
      });
    }

    updated(changed) {
      let eventName = 'open';
      if (changed.has(eventName)) {
        wgnhsCommon.dispatch(this, eventName, { value: this[eventName] });
      }
    }

    _handleChange(e) {
      this.open = e.target.checked;
    }
  }
  customElements.define('app-collapsible', AppCollapsible);

  class AppSidebar extends litElement.LitElement {
    static get properties() {
      return {
        title: {
          type: String
        },
        tabs: {
          type: Array
        }
      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
      :host {
        padding: 0 var(--border-radius);
      }
      [data-closed] {
        display: none;
      }
    `;
    }

    switchTab(choice) {
      this.shadowRoot.querySelectorAll('.slot-container').forEach((el) => {
        if ((choice === 'default' && !el.getAttribute('name')) || (el.getAttribute('name') === choice)) {
          el.removeAttribute('data-closed');
        } else {
          el.setAttribute('data-closed', true);
        }
      });
    }

    handleChoiceChange(e) {
      this.switchTab(e.detail.choice);
    }

    render() {
      return litElement.html`
      ${(!this.title)?'':litElement.html`<h1 class="header">${this.title}</h1>`}
      <div class="slot-container">
        <slot></slot>
      </div>
      ${!(this.tabs)?'':this.tabs.map((el) => litElement.html`
      <div name='${el}' class="slot-container" data-closed>
        <slot name='${el}'></slot>
      </div>
      `)}
    `;
    }
  }

  customElements.define('app-sidebar', AppSidebar);

  /*
   * Code from https://github.com/lukehaas/css-loaders
  The MIT License (MIT)

  Copyright (c) 2014 Luke Haas

  Permission is hereby granted, free of charge, to any person obtaining a copy of
  this software and associated documentation files (the "Software"), to deal in
  the Software without restriction, including without limitation the rights to
  use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
  the Software, and to permit persons to whom the Software is furnished to do so,
  subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
  FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
  COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
  IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
   */
  class AppSpinner extends litElement.LitElement {
    static get properties() {
      return {

      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
    .loader {
      color: var(--palette-900);
      font-size: 90px;
      text-indent: -9999em;
      overflow: hidden;
      width: 1em;
      height: 1em;
      border-radius: 50%;
      margin: 72px auto;
      position: relative;
      -webkit-transform: translateZ(0);
      -ms-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-animation: load6 1.7s infinite ease, round 1.7s infinite ease;
      animation: load6 1.7s infinite ease, round 1.7s infinite ease;
    }
    @-webkit-keyframes load6 {
      0% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      5%,
      95% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      10%,
      59% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
      }
      20% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
      }
      38% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
      }
      100% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
    }
    @keyframes load6 {
      0% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      5%,
      95% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
      10%,
      59% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.087em -0.825em 0 -0.42em, -0.173em -0.812em 0 -0.44em, -0.256em -0.789em 0 -0.46em, -0.297em -0.775em 0 -0.477em;
      }
      20% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.338em -0.758em 0 -0.42em, -0.555em -0.617em 0 -0.44em, -0.671em -0.488em 0 -0.46em, -0.749em -0.34em 0 -0.477em;
      }
      38% {
        box-shadow: 0 -0.83em 0 -0.4em, -0.377em -0.74em 0 -0.42em, -0.645em -0.522em 0 -0.44em, -0.775em -0.297em 0 -0.46em, -0.82em -0.09em 0 -0.477em;
      }
      100% {
        box-shadow: 0 -0.83em 0 -0.4em, 0 -0.83em 0 -0.42em, 0 -0.83em 0 -0.44em, 0 -0.83em 0 -0.46em, 0 -0.83em 0 -0.477em;
      }
    }
    @-webkit-keyframes round {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    @keyframes round {
      0% {
        -webkit-transform: rotate(0deg);
        transform: rotate(0deg);
      }
      100% {
        -webkit-transform: rotate(360deg);
        transform: rotate(360deg);
      }
    }
    `;
    }

    render() {
      return litElement.html`
      <div class="loader">Loading...</div>
    `;
    }
  }
  customElements.define('app-spinner', AppSpinner);

  const pdfjsLib = window['pdfjs-dist/build/pdf'];

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

  class PDFViewPanel extends litElement.LitElement {
    static get properties() {
      return {
        imgsrc: {
          type: String,
          attribute: false
        },
        rotate: {
          type: Number
        },
        zoom: {
          type: Number
        }
      };
    }

    constructor() {
      super();
      this.cache = {};
      this.renderer = new PDFRenderer();
      this.rotate = 0;
      this.zoom = 1;
    }

    static get styles() {
      return litElement.css`
    :host {
      overflow: auto;
    }
    .container {
      min-height: 10em;
      display: grid;
      grid-column-template: 1fr;
      grid-gap: var(--border-radius);
      justify-content: center;
    }
    .content {
      max-width: 45vw;
    }
    .controls {
      display: grid;
      grid-column-template: 1fr;
      grid-gap: var(--border-radius);
      position: absolute;
      top: 0;
      right: var(--border-radius);
      margin: var(--border-radius);
      z-index: 10;
    }
    .control {
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: var(--icon-size-large);
      color: var(--palette-accent);
      text-align: center;
      cursor: pointer;
      padding: var(--border-radius);
      background-color: var(--palette-light);
      border: none;
      border-radius: 50%;
    }
    `;
    }

    render() {
      return litElement.html`
    <style>
      @import url("./css/typography.css");
    </style>
    <div class="controls">
      <button class="control" @click=${this.hide}><i class="material-icons" title="Hide">close</i></button>
      <button class="control" @click=${this.zoomIn} ?disabled=${this.isMaxZoom}><i class="material-icons" title="Zoom In">zoom_in</i></button>
      <button class="control" @click=${this.zoomOut} ?disabled=${this.isMinZoom}><i class="material-icons" title="Zoom Out">zoom_out</i></button>
      <button class="control" @click=${this.rotateLeft}><i class="material-icons" title="Rotate Left">rotate_left</i></button>
      <button class="control" @click=${this.rotateRight}><i class="material-icons" title="Rotate Right">rotate_right</i></button>
    </div>
    <div class="container">
      ${this.imageTag}
      <slot></slot>
    </div>
    `;
    }

    static get MOD_ROTATE() {
      return 4;
    }

    get rotate() {
      return this._rotate;
    }
    set rotate(val) {
      const old = this.rotate;
      let rot = Math.round(val) + PDFViewPanel.MOD_ROTATE;
      this._rotate = (rot % PDFViewPanel.MOD_ROTATE);
      this.requestUpdate('rotate', old);
    }

    rotateLeft() {
      this.rotate -= 1;
    }
    rotateRight() {
      this.rotate += 1;
    }

    static get MAX_ZOOM() {
      return 2;
    }
    get isMaxZoom() {
      return this.zoom >= PDFViewPanel.MAX_ZOOM;
    }

    static get MIN_ZOOM() {
      return 0.5;
    }
    get isMinZoom() {
      return this.zoom <= PDFViewPanel.MIN_ZOOM;
    }

    get zoom() {
      return this._zoom;
    }
    set zoom(val) {
      const old = this.zoom;
      this._zoom = Math.min(Math.max(val, PDFViewPanel.MIN_ZOOM), PDFViewPanel.MAX_ZOOM);
      this.requestUpdate('zoom', old);
    }

    zoomIn() {
      this.zoom += 0.25;
    }
    zoomOut() {
      this.zoom -= 0.25;
    }

    get translate() {
      let result = {
        x: 0,
        y: 0
      };
      if (this.rotate) {
        result.x = (this.rotate === 1)? 0 : (100 * this.zoom);
        result.y = (this.rotate === 3)? 0 : (100 * this.zoom);
      }
      return result;
    }

    get imageTag() {
      return (!this.imgsrc)?'':litElement.html`
    <img class="content"
      src="${this.imgsrc}"
      style="${this.contentTransform}" />
    `;
    }

    get contentTransform() {
      let rot = this.rotate / PDFViewPanel.MOD_ROTATE;
      let zoom = this.zoom;
      let fix = this.translate;
      let result = `
      transform-origin: top left;
      transform: rotate(${rot}turn) translate(-${fix.x}%, -${fix.y}%) scale(${zoom})
      `;

      return result;
    }

    show(url) {
      // console.log('show', url);
      this.dispatchEvent(new CustomEvent(TOGGLE_EVENT,
        {bubbles: true, composed: true, detail: {url, closed: false}}));
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

  class PDFViewButton extends litElement.LitElement {
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
      this.alt = false;
    }

    static get styles() {
      return litElement.css`
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
      return litElement.html`
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
        <i slot="header-after" class="material-icons" title="View">${
          (this.alt)?'chevron_left':'chevron_right'
        }</i>
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
      if (this.alt) {
        this.panel.hide();
      } else {
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

    handleAlt(e) {
      if (e.detail.url === this.src) {
        this.alt = true;
      } else {
        this.alt = false;
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
  customElements.define('pdf-view-button', PDFViewButton);

  exports.AppCollapsible = AppCollapsible;
  exports.AppSidebar = AppSidebar;
  exports.AppSpinner = AppSpinner;
  exports.ButtonLink = ButtonLink;
  exports.InRadio = InRadio;
  exports.PDFViewPanel = PDFViewPanel;
  exports.ToggleSwitch = ToggleSwitch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
