(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lit-element'), require('@uirouter/core')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lit-element', '@uirouter/core'], factory) :
  (global = global || self, factory(global.index = {}, global.common, global.common));
}(this, function (exports, litElement, core) { 'use strict';

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
    `;
    }

    switchTab(choice) {
      this.shadowRoot.querySelectorAll('slot').forEach((el) => {
        if ((choice === 'default' && !el.getAttribute('name')) || (el.getAttribute('name') === choice)) {
          el.hidden = false;
        } else {
          el.hidden = true;
        }
      });
    }

    handleChoiceChange(e) {
      this.switchTab(e.detail.choice);
    }

    render() {
      return litElement.html`
      <style>
        @import url("./css/typography.css");
      </style>

      ${(!this.title)?'':litElement.html`<h1 class="header">${this.title}</h1>`}
      <slot></slot>
      ${!(this.tabs)?'':this.tabs.map((el) => litElement.html`
      <slot name='${el}' hidden></slot>
      `)}
    `;
    }
  }

  customElements.define('app-sidebar', AppSidebar);

  // https://gist.github.com/gordonbrander/2230317
  function genId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * @param {HTMLElement} context element to dispatch event from
   * @param {String} eventName custom event name
   * @param {Object} detail 
   * @param {Boolean} bubbles does the event bubble up the elements
   * @param {Boolean} composed does the event bubble up through ShadowDOM?
   */
  function dispatch(context, eventName, detail, bubbles, composed) {
    context.dispatchEvent(
      new CustomEvent(
        eventName, 
        {
          bubbles,
          composed,
          detail
        }
      )
    );
  }

  class FilterGroup {
    constructor(config) {
      Object.assign(this, config);
      if (!this.id) {
        this.id = genId();
      }
    }
    activate(context) {
      let result = null;
      const input = context.detail.checked;
      if (context.toggleable && input) {
        result = {
          id: context.id,
          resolve: function(feature) {
            return feature[context.prop] === context.value;
          }
        };
      }
      return result;
    }
  }

  class CheckboxControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="checkbox">
    `;
    }
    handle(context) {
      let result = null;

      let input = context.target.nextElementSibling.checked;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class GTLTControl {
    constructor(isDate) {
      this.id = genId();
      this.gtName = (isDate)?'after':'at least';
      this.ltName = (isDate)?'before':'less than';
    }
    get next() {
      return litElement.html`
      <select>
        <option value="gt">${this.gtName}</option>
        <option value="lt">${this.ltName}</option>
      </select>
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;
      context['gt'] = (a, b) => (a >= b);
      context['lt'] = (a, b) => (a < b);

      const predicate = context[context.target.nextElementSibling.value];
      const input = context.target.nextElementSibling.nextElementSibling.value;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              isValid = predicate(feature[context.prop], input);
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class SelectControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <select ?disabled="${!this.options}">
        <option></option>
        ${(!this.options)?'':this.options.map((el) => litElement.html`
        <option value="${el}">${el}</option>
        `)}
      </select>
    `;
    }
    init(uniques) {
      if (!this.options) {
        this.options = Array.from(uniques).sort();
      }
    }
    handle(context) {
      let result = null;

      const input = context.target.nextElementSibling.value;
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = feature[context.prop];
              isValid = value === input;
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class TextControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;

      const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = ('' + feature[context.prop]).trim().toUpperCase();
              isValid = value === input;
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  class ContainsControl {
    constructor() {
      this.id = genId();
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(context) {
      let result = null;

      const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
      // blank selects all, apply filter if non-blank
      if (input) {
        result = {
          id: context.id,
          resolveGroup: function(feature) {
            return !context.group.prop || context.group[context.group.prop] === feature[context.group.prop]
          },
          resolve: function(feature) {
            // filter out features without the property
            let isValid = !!feature[context.prop];
            if (isValid) {
              const value = ('' + feature[context.prop]).trim().toUpperCase();
              isValid = value.includes(input);
            }
            return isValid;
          }
        };
      }
      return result;
    }
  }

  const ignoredKeys = [
    'Site_Code',
    'Data_Type',
    'SiteName',
    'Site_Name',
    'Wid',
    'ID'
  ];
  const keyLookup = {
    'SiteName': {title: 'Site Name', desc: ''},
    'Site_Name': {title: 'Site Name', desc: ''},
    'Wid': {title: 'WID', desc: ''},
    'ID': {title: 'ID', desc: ''},
    'RecentLog': {title: 'Most recent log (year)', desc: ''},
    'MaxDepth': {title: 'Max depth (ft)', desc: ''},
    'Norm_Res': {title: 'Normal Resistivity', desc: ''},
    'Caliper': {title: 'Caliper', desc: ''},
    'Gamma': {title: 'Natural Gamma', desc: ''},
    'SP': {title: 'Spontaneous (Self) Potential', desc: ''},
    'SPR': {title: 'Single Point Resistivity', desc: ''},
    'Spec_Gamma': {title: 'Spectral Gamma', desc: ''},
    'Fluid_Cond': {title: 'Fluid Conductivity', desc: ''},
    'Flow_Spin': {title: 'Spinner Flow Meter', desc: ''},
    'Fluid_Temp': {title: 'Fluid Temperature', desc: ''},
    'Fluid_Res': {title: 'Fluid Resistivity', desc: ''},
    'OBI': {title: 'Optical Borehole Image (OBI)', desc: ''},
    'ABI': {title: 'Acoustic Borehole Image (ABI)', desc: ''},
    'Video': {title: 'Video', desc: ''},
    'Drill_Year': {title: 'Drill year', desc: ''},
    'Depth_Ft': {title: 'Depth (ft)', desc: ''},
    'Drill_Meth': {title: 'Drill Method', desc: ''},
    'Subsamples': {title: 'Subsamples', desc: ''},
    'Photos': {title: 'Core Photos', desc: ''},
    'Grainsize': {title: 'Grainsize', desc: ''},
  };

  const filterLookup = [
    new FilterGroup({
      title: "Site Information",
      open: true,
      sections: [
        {
          fields: {
            "County": {
              controls: [
                new SelectControl()
              ]
            },
            // "SiteName": {
            //   controls: [
            //     new ContainsControl()
            //   ]
            // },
            "Site_Name": {
              controls: [
                new ContainsControl()
              ]
            },
            "Wid": {
              controls: [
                new TextControl()
              ]
            },
          }
        }
      ]
    }),
    new FilterGroup({
      title: "Geophysical Log Data",
      prop: 'Data_Type',
      'Data_Type': 'Geophysical Log Data',
      toggleable: true,
      sections: [
        {
          fields: {
            "RecentLog": {
              controls: [
                new GTLTControl(true)
              ]
            },
            "MaxDepth": {
              controls: [
                new GTLTControl()
              ]
            }
          }
        },
        {
          title: "Geologic",
          fields: {
            "Norm_Res": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Caliper": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Gamma": {
              controls: [
                new CheckboxControl()
              ]
            },
            "SP": {
              controls: [
                new CheckboxControl()
              ]
            },
            "SPR": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Spec_Gamma": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        },
        {
          title: "Hydrogeologic",
          fields: {
            "Fluid_Cond": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Flow_Spin": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Fluid_Temp": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Fluid_Res": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Flow_HP": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        },
        {
          title: "Image",
          fields: {
            "OBI": {
              controls: [
                new CheckboxControl()
              ]
            },
            "ABI": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Video": {
              controls: [
                new CheckboxControl()
              ]
            },

          }
        }
      ]
    }),
    new FilterGroup({
      title: "Quaternary Core Data",
      prop: 'Data_Type',
      'Data_Type': 'Quaternary Core Data',
      toggleable: true,
      sections: [
        {
          fields: {
            "Drill_Year": {
              controls: [
                new GTLTControl(true)
              ]
            },
            "Depth_Ft": {
              controls: [
                new GTLTControl()
              ]
            },
            "Drill_Meth": {
              controls: [
                new SelectControl()
              ]
            },
          }
        },
        {
          title: "Analyses available",
          fields: {
            "Subsamples": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Photos": {
              controls: [
                new CheckboxControl()
              ]
            },
            "Grainsize": {
              controls: [
                new CheckboxControl()
              ]
            }
          }
        }
      ]
    })
  ];

  let pdfjsLib = window['pdfjs-dist/build/pdf'];

  const TOGGLE_EVENT = 'toggle-pdf';

  class PDFView extends litElement.LitElement {
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
      return litElement.css`
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
      return litElement.html`
    <div>
      ${(!this.imgsrc)?'':litElement.html`
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
          });
        } else {
          el.imgsrc = null;
        }
      }
    }
  }
  customElements.define('pdf-view', PDFView);

  class PDFViewPanel extends litElement.LitElement {
    static get properties() {
      return {

      };
    }

    constructor() {
      super();
    }

    static get styles() {
      return litElement.css`
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
      return litElement.html`
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

  class PDFViewButton extends litElement.LitElement {
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
      return litElement.css`
    `;
    }

    render() {
      return litElement.html`
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

  class SiteDetails extends litElement.LitElement {
    static get properties() {
      return {
        siteinfo: {
          type: Object
        }
      };
    }

    constructor() {
      super();
      this.genId = (function() {
        const memo = {};
        return function(index) {
          if (!memo[index]) {
            memo[index] = genId();
          }
          return memo[index];
        }
      })();
    }

    static get styles() {
      return litElement.css`
      [data-element="table"] {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        /* background-color: var(--palette-dark); */
        font-weight: var(--font-weight-bold);
      }

      .detail {
        /* background-color: var(--palette-light); */
      }

      .header {
        position: -webkit-sticky;
        position: sticky;
        top: 0px;
        background-color: var(--palette-white);
        padding: var(--font-size-extra-large);
        z-index: 10;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
      }
      .header h1 {
        padding: 0;
        max-width: 70%;
        text-align: center;
      }
      .header i {
        font-size: var(--icon-size-large);
        color: var(--palette-accent);
        cursor: pointer;
      }
      
      [data-closed] {
        display: none;
      }
    `;
    }

    renderTable(info) {
      let key = 0, value = 1;
      return Object.entries(info).filter((el, index) => {
        return !ignoredKeys.includes(el[key]);
      }).map((el, index) => litElement.html`
    <td class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
      <label for="${this.genId(index)}" >
        ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
      </label>
    </td>
    <td class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
      <span id="${this.genId(index)}">
        ${el[value]}
      </span>
    </td>
  `)
    }

    render() {
      let Latitude = (this.siteinfo)?this.siteinfo['Latitude']:null;
      let Longitude = (this.siteinfo)?this.siteinfo['Longitude']:null;
      let WID = (this.siteinfo)?this.siteinfo['Wid']:null;
      return litElement.html`
      <style>
        @import url("./css/typography.css");
      </style>

      ${(!this.siteinfo)? '' : litElement.html`
        <div class="header">
          <span>
            <a href="${window.router.link('entry')}" onclick="event.preventDefault()"><i class="material-icons clear-selection" title="Clear selection" @click="${this.fireClearSelection}" >arrow_back</i></a>
          </span>
          <h1>${this.siteinfo.SiteName || this.siteinfo.Site_Name}</h1>
          <span></span>
        </div>
        <div data-element="table">
          ${this.renderTable({
            Latitude, Longitude, WID
          })}
        </div>
        <h2>Data Available:</h2>
        <app-collapsible open>
          <span slot="header">${this.siteinfo['Data_Type']}</span>
          <div slot="content">
            <div data-element="table">
              ${this.renderTable(this.siteinfo)}
            </div>
            <slot name="sketch"></slot>
          </div>
        </app-collapsible>
      `}
    `;
    }

    fireClearSelection() {
      let event = new CustomEvent('clear-selection', {
        bubbles: true,
        detail: {}
      });
      this.dispatchEvent(event);
    }
  }
  customElements.define('site-details', SiteDetails);

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
          type: Boolean
        }
      };
    }

    constructor() {
      super();
      this.genId = genId();
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
      transition: all 0.3s cubic-bezier(0.755, 0.05, 0.855, 0.06);
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
      transition: max-height 0.3s cubic-bezier(0.86, 0, 0.07, 1);
    }

    .toggle:checked + .lbl-toggle + .collapsible-content {
      max-height: var(--collapsible-max-height, 3000px);
    }

    .toggle:checked + .lbl-toggle {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
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
    <div class="wrap-collapsible">
      <input id="${this.genId}" class="toggle" type="checkbox" ?checked="${this.open}" @change=${this._handleChange}>
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
        dispatch(this, eventName, { value: this[eventName] });
      }
    }

    _handleChange(e) {
      this.open = e.target.checked;
    }
  }
  customElements.define('app-collapsible', AppCollapsible);

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
            memo[index] = genId();
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
        this.id = genId();
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
        dispatch(this, 'change', {checked: this.checked}, true);
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

  class MapFilter extends litElement.LitElement {
    static get properties() {
      return {
        include: {
          type: Array,
          attribute: false
        },
        filter: {
          type: Array,
          attribute: false
        },
        matchClass: {
          type: String,
          attribute: false
        }
      };
    }

    static get styles() {
      return litElement.css`
      .field {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        font-weight: var(--font-weight-bold);
      }

      .selector {
      }

      .section-title {
        margin: var(--line-height) 0 0 0;
        padding: var(--border-radius);
        background-color: var(--palette-light);
      }

      in-radio {
        display: inline-grid;
        grid-template-columns: auto auto;
      }
    `;
    }

    updateMatchClass(e) {
      this.matchClass = e.target.choice;
    }

    render() {
      return litElement.html`
      <style>
        @import url("./css/typography.css");
      </style>
      <div>
        Show sites that have <in-radio choices='["ALL", "ANY"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
      </div>
      <div>
        ${this.renderFilterGroups()}
      </div>
    `;
    }

    resolveKeyLookup(field) {
      let result = (!keyLookup[field])?field:keyLookup[field].title;
      return result;
    }

    renderFilterGroups() {
      let name=0, config=1;
      return this.filterGroups.map((group) => litElement.html`
      <app-collapsible
        ?open=${group.open} @open=${this._handle(group)}>
        <i slot="header-before" class="material-icons">expand_more</i>
        <span slot="header">${group.title}</span>
        ${(!group.toggleable)?'':litElement.html`
          <toggle-switch
            name="${group.mapName}"
            slot="header-after"
            ?checked=${group.open}
            @change=${this._handleGroup(group, this.include)}
          ></toggle-switch>
        `}
        <div slot="content">
          ${group.sections.map((section, index) => litElement.html`
            ${!(section.title)?'':litElement.html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map((entry, index) => litElement.html`
              <div class="field">
              ${(entry[config].controls.length === 0)?'':entry[config].controls.map(control => litElement.html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${this.resolveKeyLookup(entry[name])}
                  </label>
                </td>
                <td class="selector" 
                    @change="${this._handleControl(group, control, this.filter)}">
                  <input
                    type="hidden"
                    id="${control.id}"
                    name="${entry[name]}">
                  ${control.next}
                </td>
              `)}
              </div>
            `)}
          `)}
        </div>
      </app-collapsible>
    `);
    }

    get _eventHandlers() {
      return {
        'open' : (context, e) => {
          context.open = e.detail.value;
        }
      }
    }

    _handle(context) {
      return (e) => {
        const handler = this._eventHandlers[e.type];
        if (handler) {
          handler(context, e);
          this.requestUpdate();
        }
      }
    }

    _handleGroup(group, filter) {
      const id = group.id;
      const handle = group.activate.bind(group);
      return (e) => {
        const context = {};
        context.id = id;
        context.toggleable = group.toggleable;
        context.detail = e.detail;
        context.prop = group.prop;
        context.value = group[group.prop];
        removeFromFilter(filter, id);
        let resolver = handle(context);
        if (resolver) {
          filter.push(resolver);
        }
        this.requestUpdate();
      }
    }

    _handleControl(group, control, filter) {
      const id = control.id;
      const handle = control.handle.bind(control);
      return (e) => {
        const context = {};
        context.id = id;
        context.group = group;
        context.target = e.currentTarget.querySelector('#'+id);
        context.prop = context.target.name;
        removeFromFilter(filter, id);
        let resolver = handle(context);
        if (resolver) {
          filter.push(resolver);
        }
        this.requestUpdate();
      }
    }

    updated(changed) {
      let matchClass = this.matchClass;
      let incl = this.include;
      let filt = this.filter;
      if (window.siteMap) {
        window.siteMap.map.fire('filterpoints', {
          detail: {
            resolve: function(props) {
              let included = incl.length > 0 && incl.reduce((prev, curr) => {
                return prev || curr.resolve(props);
              }, false);
              let spec = filt.filter((rule) => rule.resolveGroup(props));
              let result = included && spec.length < 1;
              if (included && !result) {
                if ("ALL" === matchClass) {
                  result = spec.reduce((prev, curr) => {
                    return prev && curr.resolve(props);
                  }, true);
                } else {
                  result = spec.reduce((prev, curr) => {
                    return prev || curr.resolve(props);
                  }, false);
                }
              }
              return result;
            }
          }
        });
      }
    }

    init(uniques) {
      this.filterGroups.forEach((group) => {
        group.sections.forEach((section) => {
          Object.entries(section.fields).forEach((field) => {
            field[1].controls.forEach((control) => {
              if (control.init) {
                control.init(uniques[field[0]]);
              }
            });
          });
        });
      });
      this.requestUpdate();
    }

    constructor() {
      super();
      this.genId = (function() {
        const memo = {};
        return function(index) {
          if (!memo[index]) {
            memo[index] = genId();
          }
          return memo[index];
        }
      })();
      this.include = [];
      this.filter = [];
      this.filterGroups = filterLookup;
    }
  }
  customElements.define('map-filter', MapFilter);

  const removeFromFilter = (filter, id) => {
    for (
      var idx = filter.findIndex(el => el.id === id); 
      idx >= 0;
      idx = filter.findIndex(el => el.id === id)
    ) {
      filter.splice(idx, 1);
    }
  };

  exports.AppSidebar = AppSidebar;
  exports.AppSpinner = AppSpinner;
  exports.MapFilter = MapFilter;
  exports.SiteDetails = SiteDetails;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
