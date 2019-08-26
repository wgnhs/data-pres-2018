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
    this.shadowRoot.querySelectorAll('slot').forEach((el) => {
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
      <slot></slot>
      ${!(this.tabs)?'':this.tabs.map((el) => html`
      <slot name='${el}' data-closed></slot>
      `)}
    `;
  }
}

customElements.define('app-sidebar', AppSidebar);