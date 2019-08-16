import { html } from 'lit-element';
import { ignoredKeys, keyLookup } from '../../site-data.js';

export class TableLayout {

  get layoutName() {
    return undefined;
  }

  render(info, context) {
    let key = 0, value = 1;
    let entries = Object.entries(info).filter((el) => {
      return !ignoredKeys.includes(el[key]);
    }).map((el, index) => html`
      <td class="label" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <label for="${context.genId(index)}" >
          ${(keyLookup[el[key]])?keyLookup[el[key]].title:el[key]}
        </label>
      </td>
      <td class="detail" title="${(keyLookup[el[key]])?keyLookup[el[key]].desc:el[key]}">
        <span id="${context.genId(index)}">
          ${el[value]}
        </span>
      </td>
    `);
    return html`
      <div data-element="table">
        ${entries}
      </div>
    `;
  }

}