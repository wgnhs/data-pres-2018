import { LitElement, html, css } from 'lit-element';

export class FilterSummary extends LitElement {
  static get properties() {
    return {
      counts: {
        type: Array,
        attribute: false
      },
      sitesCount: {
        type: Object,
        attribute: false
      }
    };
  }

  constructor() {
    super();
  }

  static get styles() {
    return css`
    li[disabled] {
      color: var(--palette-dark);
    }
    .name {
      text-transform: capitalize;
    }
    `;
  }

  render() {
    return (!this.counts)?html``:html`
    <div>
      <span>Showing
        ${this.sitesCount.current}
        of
        ${this.sitesCount.total}
        total sites and 
        ${this.counts.reduce((prev, count) => (count.current + prev), 0)}
        of
        ${this.counts.reduce((prev, count) => (count.total + prev), 0)}
        total records
      </span>
      <ul>
        ${this.counts.reduceRight((prev, el) => prev.concat(html`
        <li ?disabled=${!el.included}>
          ${el.current} of ${el.total} <span class="name">${el.name}</span> records
          ${(el.filteredBy.length > 0)?html`
          (filtered by ${el.filteredBy.join(', ')})
          `:''}
        </li>
        `),[])}
      </ul>
    </div>
    `;
  }

  handleFiltered(e) {
    if (e.detail) {
      this.counts = e.detail.counts;
      this.sitesCount = this.counts.find(count => count.name == "site information");
      let siteInfoIndex = this.counts.findIndex(count => count.name == "site information");
      if (siteInfoIndex !== -1) {
        this.counts.splice(siteInfoIndex, 1);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.__filteredHandler = this.handleFiltered.bind(this);
    document.addEventListener('filtered', this.__filteredHandler);
  }

  disconnectedCallback() {
    document.removeEventListener('filtered', this.__filteredHandler);
    super.disconnectedCallback();
  }
}
customElements.define('filter-summary', FilterSummary);