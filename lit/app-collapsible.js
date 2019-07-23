import { LitElement, html, css } from 'lit-element';
import { genId } from '../js/common.js';

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
    return html`
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
        };
      });
    });
  }
}
customElements.define('app-collapsible', AppCollapsible);