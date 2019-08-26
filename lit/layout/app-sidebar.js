import { LitElement, html, css } from 'lit-element';

export class AppSidebar extends LitElement {
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
    return css`
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
        el.setAttribute('data-closed', true)
      }
    });
  }

  handleChoiceChange(e) {
    this.switchTab(e.detail.choice);
  }

  render() {
    return html`
      ${(!this.title)?'':html`<h1 class="header">${this.title}</h1>`}
      <div class="slot-container">
        <slot></slot>
      </div>
      ${!(this.tabs)?'':this.tabs.map((el) => html`
      <div name='${el}' class="slot-container" data-closed>
        <slot name='${el}'></slot>
      </div>
      `)}
    `;
  }
}

customElements.define('app-sidebar', AppSidebar);