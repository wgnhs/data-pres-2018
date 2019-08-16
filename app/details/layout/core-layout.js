import { html } from 'lit-element';
import { TableLayout } from './table-layout.js';

export class CoreLayout {
  get layoutName() {
    return 'Quaternary Core Data';
  }

  render(info, context) {
    return new TableLayout().render(info, context);
  }
}