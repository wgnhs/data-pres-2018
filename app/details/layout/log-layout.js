import { html } from 'lit-element';
import { TableLayout } from './table-layout.js';

export class LogLayout {
  get layoutName() {
    return 'Geophysical Log Data';
  }

  render(info, context) {
    return html`
    ${new TableLayout().render(info, context)}
    <pdf-view-button
      .panel=${context.pdfpanel}
      src="${'https://data.wgnhs.wisc.edu/geophysical-logs/' + info.Wid + '.pdf'}">
    </pdf-view-button>
    `;
  }
}
