(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('lit-element'), require('@uirouter/core')) :
  typeof define === 'function' && define.amd ? define(['exports', 'lit-element', '@uirouter/core'], factory) :
  (global = global || self, factory(global.index = {}, global.common, global.common));
}(this, function (exports, litElement, core) { 'use strict';

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
  const genId = function() {
    return '_' + Math.random().toString(36).substr(2, 9);
  };

  const ignoredKeys = [
    'Site_Code',
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
    'RecentLog': {title: 'Most recent log', desc: ''},
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
        grid-template-columns: 30% 1fr;
        grid-gap: 0.5em;
        width: 100%;
      }

      td {
        padding: 0.5em;
      }

      .label {
        background-color: var(--palette-dark);
        font-weight: var(--font-weight-bold);
      }

      .detail {
        background-color: var(--palette-light);
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

    get renderTable() {
      let key = 0, value = 1;
      return Object.entries(this.siteinfo).filter((el, index) => {
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
      return litElement.html`
      <style>
        @import url("./css/typography.css");
      </style>

      ${(!this.siteinfo)? '' : litElement.html`
        <div class="header">
          <span>
            <a href="${window.router.link('entry')}" onclick="event.preventDefault()"><i class="material-icons clear-selection" title="Clear selection" @click="${this.fireClearSelection}" >arrow_back</i></a>
          </span>
          ${(!this.siteinfo.Wid)?'':litElement.html`
            <h1>${this.siteinfo.Wid}: ${this.siteinfo.SiteName}</h1>
          `}
          ${(!this.siteinfo.ID)?'':litElement.html`
            <h1>${this.siteinfo.ID}: ${this.siteinfo.Site_Name}</h1>
          `}
          <span></span>
        </div>

        <div data-element="table">
          ${this.renderTable}
        </div>
        <slot name="sketch"></slot>
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
      <input id="${this.genId}" class="toggle" type="checkbox" ?checked="${this.open}">
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

    inChange(e) {
      this.choice = e.target.value;

      let event = new CustomEvent('choice-change', {
        detail: {
          choice: this.choice
        }
      });
      this.dispatchEvent(event);
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

  class MapFilter extends litElement.LitElement {
    static get properties() {
      return {
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
      :host {
        display
      }

      .field {
        display: grid;
        grid-template-columns: 40% 1fr;
        grid-gap: var(--border-radius);
        margin: 0 var(--border-radius);
      }

      .label {
        /* background-color: var(--palette-dark); */
        font-weight: var(--font-weight-bold);
      }

      .selector {
        /* background-color: var(--palette-light); */
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
        Show sites that have <in-radio choices='["ANY", "ALL"]' @choice-change="${this.updateMatchClass}"></in-radio> of the following:
      </div>
      <div>
        ${this.renderFilterSections()}
      </div>
    `;
    }

    resolveKeyLookup(field) {
      let result = (!keyLookup[field])?field:keyLookup[field].title;
      return result;
    }

    renderFilterSections() {
      let name=0, config=1;
      return this.filterSections.map((el) => litElement.html`
      <app-collapsible open>
        <i slot="header-before" class="material-icons">expand_more</i>
        <span slot="header">${el.title}</span>
        <div slot="content">
          ${el.sections.map((section, index) => litElement.html`
            ${!(section.title)?'':litElement.html`
              <h2 class="section-title">${section.title}</h2>
            `}
            ${Object.entries(section.fields).map((entry, index) => litElement.html`
              <div class="field">
              ${(entry[config].controls.length === 0)?'':entry[config].controls.map(el => litElement.html`
                <td class="label">
                  <label for="${this.genId(index)}" >
                    ${this.resolveKeyLookup(entry[name])}
                  </label>
                </td>
                <td class="selector" 
                    @change="${el.handle.bind(el)}">
                  <input
                    id="${el.id}"
                    type="checkbox"
                    name="${entry[name]}">
                  ${el.next}
                </td>
              `)}
              </div>
            `)}
          `)}
        </div>
      </app-collapsible>
    `);
    }

    updated() {
      let matchClass = this.matchClass;
      let filt = this.filter;
      if (window.siteMap) {
        window.siteMap.map.fire('filterpoints', {
          detail: {
            resolve: function(props) {
              let result = filt.length < 1;
              if (!result) {
                if ("ALL" === matchClass) {
                  result = filt.reduce((prev, curr) => {
                    return prev && curr.resolve(props);
                  }, true);
                } else {
                  result = filt.reduce((prev, curr) => {
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
      this.filter = [];
      this.filterSections = [
        {
          title: "Site Information",
          sections: [
            {
              fields: {
                "County": {
                  controls: [
                    new SelectControl(this, "County")
                  ]
                },
                "SiteName": {
                  controls: [
                    new ContainsControl(this)
                  ]
                },
                "Site_Name": {
                  controls: [
                    new ContainsControl(this)
                  ]
                },
                "Wid": {
                  controls: [
                    new TextControl(this)
                  ]
                },
              }
            }
          ]
        },
        {
          title: "Geophysical Logs",
          sections: [
            {
              fields: {
                "RecentLog": {
                  controls: [
                    new GTLTControl(this, true)
                  ]
                },
                "MaxDepth": {
                  controls: [
                    new GTLTControl(this)
                  ]
                }
              }
            },
            {
              title: "Geologic",
              fields: {
                "Norm_Res": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Caliper": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Gamma": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "SP": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "SPR": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Spec_Gamma": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },

              }
            },
            {
              title: "Hydrogeologic",
              fields: {
                "Fluid_Cond": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Flow_Spin": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Fluid_Temp": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Fluid_Res": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Flow_HP": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },

              }
            },
            {
              title: "Image",
              fields: {
                "OBI": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "ABI": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Video": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },

              }
            }
          ]
        },
        {
          title: "Quaternary Core Data",
          sections: [
            {
              fields: {
                "Drill_Year": {
                  controls: [
                    new GTLTControl(this, true)
                  ]
                },
                "Depth_Ft": {
                  controls: [
                    new GTLTControl(this)
                  ]
                },
                "Drill_Meth": {
                  controls: [
                    new SelectControl(this, 'Drill_Meth')
                  ]
                },
              }
            },
            {
              title: "Analyses available",
              fields: {
                "Subsamples": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Photos": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                },
                "Grainsize": {
                  controls: [
                    new CheckboxControl(this)
                  ]
                }
              }
            }
          ]
        }
      ];
    }
  }
  customElements.define('map-filter', MapFilter);



  class CheckboxControl {
    constructor(element) {
      this.id = genId();
      this.filter = element.filter;
      this.postHandle = element.requestUpdate.bind(element);
    }
    handle(e) {
      let id = this.id;
      let context = {};
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = e.target.name;

      for (
        var idx = this.filter.findIndex(el => el.id === id); 
        idx >= 0;
        idx = this.filter.findIndex(el => el.id === id)
      ) {
        this.filter.splice(idx, 1);
      }
      let isOn = context.target.checked;
      if (isOn) {
        this.filter.push({
          id: id,
          resolve: function(el) {
            return !!el[context.prop];
          }
        });
      }
      this.postHandle();
    }
  }

  class GTLTControl {
    constructor(element, isDate) {
      this.id = genId();
      this.filter = element.filter;
      this.postHandle = element.requestUpdate.bind(element);
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
    handle(e) {
      let id = this.id;
      let context = {};
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;
      context['gt'] = (a, b) => (a >= b);
      context['lt'] = (a, b) => (a < b);

      for (
        var idx = this.filter.findIndex(el => el.id === id); 
        idx >= 0;
        idx = this.filter.findIndex(el => el.id === id)
      ) {
        this.filter.splice(idx, 1);
      }
      let isOn = context.target.checked;
      if (isOn) {
        this.filter.push({
          id: id,
          resolve: function(el) {
            let result = !!el[context.prop];
            if (result) {
              result = context[context.target.nextElementSibling.value](el[context.prop], context.target.nextElementSibling.nextElementSibling.value);
            }
            return result;
          }
        });
      }
      this.postHandle();
    }
  }

  class SelectControl {
    constructor(element) {
      this.id = genId();
      this.filter = element.filter;
      this.postHandle = element.requestUpdate.bind(element);
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
    handle(e) {
      let id = this.id;
      let context = {};
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;

      if (!this.options) {
        this.options = Array.from(Object.entries(window.siteMap.map._layers).reduce(((prev, ent) => (ent[1].feature && ent[1].feature.properties[context.prop])?prev.add(ent[1].feature.properties[context.prop]):prev), new Set())).sort();
      }

      for (
        var idx = this.filter.findIndex(el => el.id === id); 
        idx >= 0;
        idx = this.filter.findIndex(el => el.id === id)
      ) {
        this.filter.splice(idx, 1);
      }
      let isOn = context.target.checked;
      if (isOn) {
        this.filter.push({
          id: id,
          resolve: function(el) {
            let result = !!el[context.prop];
            if (result) {
              result = !context.target.nextElementSibling.value || el[context.prop] === context.target.nextElementSibling.value;
            }
            return result;
          }
        });
      }
      this.postHandle();
    }
  }

  class TextControl {
    constructor(element) {
      this.id = genId();
      this.filter = element.filter;
      this.postHandle = element.requestUpdate.bind(element);
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(e) {
      let id = this.id;
      let context = {};
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;

      for (
        var idx = this.filter.findIndex(el => el.id === id); 
        idx >= 0;
        idx = this.filter.findIndex(el => el.id === id)
      ) {
        this.filter.splice(idx, 1);
      }
      let isOn = context.target.checked;
      if (isOn) {
        this.filter.push({
          id: id,
          resolve: function(el) {
            let result = !!el[context.prop];
            if (result) {
              result = !context.target.nextElementSibling.value || el[context.prop] == context.target.nextElementSibling.value;
            }
            return result;
          }
        });
      }
      this.postHandle();
    }
  }

  class ContainsControl {
    constructor(element) {
      this.id = genId();
      this.filter = element.filter;
      this.postHandle = element.requestUpdate.bind(element);
    }
    get next() {
      return litElement.html`
      <input type="text">
    `;
    }
    handle(e) {
      let id = this.id;
      let context = {};
      context.target = e.currentTarget.querySelector('#'+id);
      context.prop = context.target.name;

      for (
        var idx = this.filter.findIndex(filterEl => filterEl.id === id); 
        idx >= 0;
        idx = this.filter.findIndex(filterEl => filterEl.id === id)
      ) {
        this.filter.splice(idx, 1);
      }
      let isOn = context.target.checked;
      if (isOn) {
        this.filter.push({
          id: id,
          resolve: function(feature) {
            // filter out features without the property
            let result = !!feature[context.prop];
            if (result) {
              let input = context.target.nextElementSibling.value;
              // blank filter selects all
              if (input) {
                let cleanInput = input.trim().toUpperCase();
                let cleanProp = feature[context.prop].toUpperCase();
                result = cleanProp.includes(cleanInput);
              }
                
            }
            return result;
          }
        });
      }
      this.postHandle();
    }
  }

  exports.AppSidebar = AppSidebar;
  exports.MapFilter = MapFilter;
  exports.SiteDetails = SiteDetails;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
