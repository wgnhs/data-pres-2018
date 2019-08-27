import { LitElement, html, css } from 'lit-element';

export class ButtonLink extends LitElement {
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
    return css`
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
    return html`
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