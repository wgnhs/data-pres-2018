import { LitElement, html, css } from 'lit-element';
import { genId, dispatch } from 'wgnhs-common';

/**
 * Code use and modified from
 * https://alligator.io/css/collapsible/
 */
export class AppCollapsible extends LitElement {
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
    this.genId = genId();
  }

  static get styles() {
    return css`
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

    .wrap-collapsible:not([button]) > .toggle:checked ~ .collapsible-content {
      max-height: var(--el-max-height, 3000px);
      visibility: visible;
    }

    .wrap-collapsible:not([button]) > .toggle:checked ~ .lbl-toggle {
      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
      transition: border 0s;
    }

    .collapsible-content > .content-inner {
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
    return html`
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
        };
      });
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