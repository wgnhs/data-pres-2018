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
    .link:hover {
      color: var(--palette-900);
    }
    .link:focus {
      outline: thin dotted;
    }
    .link {
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
    <a class="link"
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
      if (!this.switchId) {
        this.switchId = wgnhsCommon.genId();
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
    <input type="checkbox" id="${this.switchId}" .checked=${this.checked} @change=${this.handleChange} /><label for="${this.switchId}">Toggle</label>
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
      box-sizing: border-box;
      margin: var(--border-radius) 0;
      border: var(--el-border, none);
      border-radius: var(--border-radius);
    }

    input[type='checkbox'] {
      display: none;
    }

    .lbl-toggle {
      display: block;

      font-weight: var(--el-header-font-weight, var(--font-weight-bold));
      font-size: var(--el-header-font-size, var(--font-size-extra-large));
      text-align: center;

      padding: var(--el-header-padding, var(--border-radius));

      color: var(--el-header-color, var(--palette-accent));
      background: var(--el-header-background, var(--palette-light));

      cursor: pointer;

      border-radius: var(--border-radius);
      transition: border-radius var(--transition-duration, 0.3s) cubic-bezier(0.755, 0.05, 0.855, 0.06);
    }

    .lbl-toggle:hover {
      color: var(--el-color-hover, var(--palette-900));
    }

    .lbl-toggle:focus {
      outline: thin dotted;
    }

    .collapsible-content {
      overflow: hidden;
      max-height: 0px;
      visibility: hidden;
      transition: max-height var(--transition-duration, 0.3s) cubic-bezier(0.86, 0, 0.07, 1), visibility var(--transition-duration, 0.3s) linear;
    }

    .wrap-collapsible:not([button]) .toggle:checked ~ .collapsible-content {
      max-height: var(--el-max-height, 3000px);
      visibility: visible;
    }

    .wrap-collapsible:not([button]) .toggle:checked ~ .lbl-toggle {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      transition: border 0s;
    }

    .collapsible-content .content-inner {
      background: var(--el-content-background, var(--palette-white));
      border-bottom: 1px solid var(--el-header-background, var(--palette-light));
      border-right: 1px solid var(--el-header-background, var(--palette-light));
      border-left: 1px solid var(--el-header-background, var(--palette-light));
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

  const reset = litElement.css`
/* http://meyerweb.com/eric/tools/css/reset/
   v2.0-modified | 20110126
   License: none (public domain)
*/
/* https://gist.github.com/DavidWells/18e73022e723037a50d6
*/

html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed,
figure, figcaption, footer, header, hgroup,
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
  margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}

/* make sure to set some focus styles for accessibility */
:focus {
    outline: 0;
}

/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure,
footer, header, hgroup, menu, nav, section {
	display: block;
}

body {
	line-height: 1;
}

ol, ul {
	list-style: none;
}

blockquote, q {
	quotes: none;
}

blockquote:before, blockquote:after,
q:before, q:after {
	content: '';
	content: none;
}

table {
	border-collapse: collapse;
	border-spacing: 0;
}

input[type=search]::-webkit-search-cancel-button,
input[type=search]::-webkit-search-decoration,
input[type=search]::-webkit-search-results-button,
input[type=search]::-webkit-search-results-decoration {
    -webkit-appearance: none;
    -moz-appearance: none;
}

input[type=search] {
    -webkit-appearance: none;
    -moz-appearance: none;
    -webkit-box-sizing: content-box;
    -moz-box-sizing: content-box;
    box-sizing: content-box;
}

textarea {
    overflow: auto;
    vertical-align: top;
    resize: vertical;
}

/**
 * Correct 'inline-block' display not defined in IE 6/7/8/9 and Firefox 3.
 */

audio,
canvas,
video {
    display: inline-block;
    *display: inline;
    *zoom: 1;
    max-width: 100%;
}

/**
 * Prevent modern browsers from displaying 'audio' without controls.
 * Remove excess height in iOS 5 devices.
 */

audio:not([controls]) {
    display: none;
    height: 0;
}

/**
 * Address styling not present in IE 7/8/9, Firefox 3, and Safari 4.
 * Known issue: no IE 6 support.
 */

[hidden] {
    display: none;
}

/**
 * 1. Correct text resizing oddly in IE 6/7 when body 'font-size' is set using
 *    'em' units.
 * 2. Prevent iOS text size adjust after orientation change, without disabling
 *    user zoom.
 */

html {
    font-size: 100%; /* 1 */
    -webkit-text-size-adjust: 100%; /* 2 */
    -ms-text-size-adjust: 100%; /* 2 */
}

/**
 * Address 'outline' inconsistency between Chrome and other browsers.
 */

a:focus {
    outline: thin dotted;
}

/**
 * Improve readability when focused and also mouse hovered in all browsers.
 */

a:active,
a:hover {
    outline: 0;
}

/**
 * 1. Remove border when inside 'a' element in IE 6/7/8/9 and Firefox 3.
 * 2. Improve image quality when scaled in IE 7.
 */

img {
    border: 0; /* 1 */
    -ms-interpolation-mode: bicubic; /* 2 */
}

/**
 * Address margin not present in IE 6/7/8/9, Safari 5, and Opera 11.
 */

figure {
    margin: 0;
}

/**
 * Correct margin displayed oddly in IE 6/7.
 */

form {
    margin: 0;
}

/**
 * Define consistent border, margin, and padding.
 */

fieldset {
    border: 1px solid #c0c0c0;
    margin: 0 2px;
    padding: 0.35em 0.625em 0.75em;
}

/**
 * 1. Correct color not being inherited in IE 6/7/8/9.
 * 2. Correct text not wrapping in Firefox 3.
 * 3. Correct alignment displayed oddly in IE 6/7.
 */

legend {
    border: 0; /* 1 */
    padding: 0;
    white-space: normal; /* 2 */
    *margin-left: -7px; /* 3 */
}

/**
 * 1. Correct font size not being inherited in all browsers.
 * 2. Address margins set differently in IE 6/7, Firefox 3+, Safari 5,
 *    and Chrome.
 * 3. Improve appearance and consistency in all browsers.
 */

button,
input,
select,
textarea {
    font-size: 100%; /* 1 */
    margin: 0; /* 2 */
    vertical-align: baseline; /* 3 */
    *vertical-align: middle; /* 3 */
}

/**
 * Address Firefox 3+ setting 'line-height' on 'input' using '!important' in
 * the UA stylesheet.
 */

button,
input {
    line-height: normal;
}

/**
 * Address inconsistent 'text-transform' inheritance for 'button' and 'select'.
 * All other form control elements do not inherit 'text-transform' values.
 * Correct 'button' style inheritance in Chrome, Safari 5+, and IE 6+.
 * Correct 'select' style inheritance in Firefox 4+ and Opera.
 */

button,
select {
    text-transform: none;
}

/**
 * 1. Avoid the WebKit bug in Android 4.0.* where (2) destroys native 'audio'
 *    and 'video' controls.
 * 2. Correct inability to style clickable 'input' types in iOS.
 * 3. Improve usability and consistency of cursor style between image-type
 *    'input' and others.
 * 4. Remove inner spacing in IE 7 without affecting normal text inputs.
 *    Known issue: inner spacing remains in IE 6.
 */

button,
html input[type="button"], /* 1 */
input[type="reset"],
input[type="submit"] {
    -webkit-appearance: button; /* 2 */
    cursor: pointer; /* 3 */
    *overflow: visible;  /* 4 */
}

/**
 * Re-set default cursor for disabled elements.
 */

button[disabled],
html input[disabled] {
    cursor: default;
}

/**
 * 1. Address box sizing set to content-box in IE 8/9.
 * 2. Remove excess padding in IE 8/9.
 * 3. Remove excess padding in IE 7.
 *    Known issue: excess padding remains in IE 6.
 */

input[type="checkbox"],
input[type="radio"] {
    box-sizing: border-box; /* 1 */
    padding: 0; /* 2 */
    *height: 13px; /* 3 */
    *width: 13px; /* 3 */
}

/**
 * 1. Address 'appearance' set to 'searchfield' in Safari 5 and Chrome.
 * 2. Address 'box-sizing' set to 'border-box' in Safari 5 and Chrome
 *    (include '-moz' to future-proof).
 */

input[type="search"] {
    -webkit-appearance: textfield; /* 1 */
    -moz-box-sizing: content-box;
    -webkit-box-sizing: content-box; /* 2 */
    box-sizing: content-box;
}

/**
 * Remove inner padding and search cancel button in Safari 5 and Chrome
 * on OS X.
 */

input[type="search"]::-webkit-search-cancel-button,
input[type="search"]::-webkit-search-decoration {
    -webkit-appearance: none;
}

/**
 * Remove inner padding and border in Firefox 3+.
 */

button::-moz-focus-inner,
input::-moz-focus-inner {
    border: 0;
    padding: 0;
}

/**
 * 1. Remove default vertical scrollbar in IE 6/7/8/9.
 * 2. Improve readability and alignment in all browsers.
 */

textarea {
    overflow: auto; /* 1 */
    vertical-align: top; /* 2 */
}

/**
 * Remove most spacing between table cells.
 */

table {
    border-collapse: collapse;
    border-spacing: 0;
}

html,
button,
input,
select,
textarea {
    color: #222;
}


::-moz-selection {
    background: #b3d4fc;
    text-shadow: none;
}

::selection {
    background: #b3d4fc;
    text-shadow: none;
}

img {
    vertical-align: middle;
}

fieldset {
    border: 0;
    margin: 0;
    padding: 0;
}

textarea {
    resize: vertical;
}

.chromeframe {
    margin: 0.2em 0;
    background: #ccc;
    color: #000;
    padding: 0.2em 0;
}
`;

  /**
   * @import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
   */
  const opensans = litElement.css`
/* cyrillic-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFWJ0bbck.woff2) format('woff2');
  unicode-range: U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F;
}
/* cyrillic */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFUZ0bbck.woff2) format('woff2');
  unicode-range: U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116;
}
/* greek-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFWZ0bbck.woff2) format('woff2');
  unicode-range: U+1F00-1FFF;
}
/* greek */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVp0bbck.woff2) format('woff2');
  unicode-range: U+0370-03FF;
}
/* vietnamese */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFWp0bbck.woff2) format('woff2');
  unicode-range: U+0102-0103, U+0110-0111, U+1EA0-1EF9, U+20AB;
}
/* latin-ext */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFW50bbck.woff2) format('woff2');
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'Open Sans';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: local('Open Sans Regular'), local('OpenSans-Regular'), url(https://fonts.gstatic.com/s/opensans/v17/mem8YaGs126MiZpBA-UFVZ0b.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

  /**
   * @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
   */
  const materialIcons = litElement.css`
 /* fallback */
@font-face {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/materialicons/v48/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2) format('woff2');
}

.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
`;

  const structure = litElement.css`
body {
    font-family: var(--font-family);
    font-size: var(--font-size);
    line-height: var(--line-height);
    background-color: var(--palette-white);
}

body,
p,
h1,
h2,
h3,
h4,
h5 {
    color: var(--palette-black);
    font-family: var(--font-family);
    padding: 0;
    margin: 0;
    box-sizing: border-box;
}

h1,
h2,
h3,
h4,
h5 {
    padding: var(--border-radius) 0 var(--font-size-small) 0;
    font-weight: var(--font-weight-bold);
}

h1 {
    font-size: var(--font-size-extra-large);
    color: var(--palette-accent);
}

h2 {
    font-size: var(--font-size-large);
}

p {
    line-height: var(--line-height);
    margin: 0 0 var(--font-size) 0;
}

a {
    color: var(--palette-900);
    cursor: pointer;
    text-decoration-line: underline;
    text-decoration-style: dashed;
    text-decoration-color: var(--palette-900);
}
`;

  const typography = [
      opensans,
      materialIcons,
      structure
  ];

  const styles = [
    reset,
    ...typography
  ];

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
        pdfsrc: {
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
      return [
        ...styles,
        litElement.css`
    .container {
      min-height: 10em;
      width: 100%;
      display: grid;
      grid-column-template: 1fr;
      grid-gap: var(--border-radius);
      justify-content: center;
      overflow: auto;
    }
    .content {
      max-width: 100%;
      padding: var(--border-radius);
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
    .control:hover {
      color: var(--el-color-hover, var(--palette-900));
    }
    [data-closed] {
      display: none;
    }
    `];
    }

    render() {
      return litElement.html`
    <div class="controls">
      <button class="control" @click=${this.hide}><i class="material-icons" title="Hide">close</i></button>
      <button class="control" @click=${this.zoomIn} ?disabled=${this.isMaxZoom}><i class="material-icons" title="Zoom In">zoom_in</i></button>
      <button class="control" @click=${this.zoomOut} ?disabled=${this.isMinZoom}><i class="material-icons" title="Zoom Out">zoom_out</i></button>
      <button class="control" @click=${this.rotateLeft}><i class="material-icons" title="Rotate Left">rotate_left</i></button>
      <button class="control" @click=${this.rotateRight}><i class="material-icons" title="Rotate Right">rotate_right</i></button>
    </div>
    <app-spinner ?data-closed=${this.imgsrc}></app-spinner>
    <div class="container" ?data-closed=${!this.imgsrc}>
      ${this.imageTag}
      <slot></slot>
    </div>
    `;
    }

    get imgsrc() {
      return this.cache[this.pdfsrc];
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
      return 3;
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
      this.pdfsrc = url;
    }

    hide() {
      // console.log('hide');
      this.pdfsrc = null;
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
          this.requestUpdate('cache');
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
      return [
        ...styles,
        litElement.css`
    .container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-gap: var(--border-radius);
    }

    [data-closed] {
      visibility: hidden;
    }
    `];
    }

    render() {
      return litElement.html`
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
  exports.styles = styles;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
