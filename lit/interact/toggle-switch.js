import { LitElement, html, css } from 'lit-element';
import { genId, dispatch } from 'wgnhs-common';

export class ToggleSwitch extends LitElement {
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
      this.switchId = genId();
    }
  }

  static get styles() {
    return css`
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
    return html`
    <input type="checkbox" id="${this.switchId}" .checked=${this.checked} @change=${this.handleChange} /><label for="${this.switchId}">Toggle</label>
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