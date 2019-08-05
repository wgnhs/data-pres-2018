import { html } from 'lit-element';
import { genId } from '../js/common.js';

export class CheckboxControl {
  constructor() {
    this.id = genId();
  }
  get next() {
    return html`
      <input type="checkbox">
    `;
  }
  handle(context) {
    let result = null;

    let input = context.target.nextElementSibling.checked;
    // blank selects all, apply filter if non-blank
    if (input) {
      result = {
        id: context.id,
        resolve: function(feature) {
          // filter out features without the property
          let isValid = !!feature[context.prop]
          return isValid;
        }
      };
    }
    return result;
  }
}

export class GTLTControl {
  constructor(isDate) {
    this.id = genId();
    this.gtName = (isDate)?'after':'at least';
    this.ltName = (isDate)?'before':'less than';
  }
  get next() {
    return html`
      <select>
        <option value="gt">${this.gtName}</option>
        <option value="lt">${this.ltName}</option>
      </select>
      <input type="text">
    `;
  }
  handle(context) {
    let result = null;
    context['gt'] = (a, b) => (a >= b);
    context['lt'] = (a, b) => (a < b);

    const predicate = context[context.target.nextElementSibling.value];
    const input = context.target.nextElementSibling.nextElementSibling.value;
    // blank selects all, apply filter if non-blank
    if (input) {
      result = {
        id: context.id,
        resolve: function(feature) {
          // filter out features without the property
          let isValid = !!feature[context.prop];
          if (isValid) {
            isValid = predicate(feature[context.prop], input);
          }
          return isValid;
        }
      };
    }
    return result;
  }
}

export class SelectControl {
  constructor() {
    this.id = genId();
  }
  get next() {
    return html`
      <select ?disabled="${!this.options}">
        <option></option>
        ${(!this.options)?'':this.options.map((el) => html`
        <option value="${el}">${el}</option>
        `)}
      </select>
    `;
  }
  handle(context) {
    let result = null;

    if (!this.options) {
      this.options = Array.from(Object.entries(window.siteMap.map._layers).reduce(((prev, ent) => (ent[1].feature && ent[1].feature.properties[context.prop])?prev.add(ent[1].feature.properties[context.prop]):prev), new Set())).sort();
    }

    const input = context.target.nextElementSibling.value;
    // blank selects all, apply filter if non-blank
    if (input) {
      result = {
        id: context.id,
        resolve: function(feature) {
          // filter out features without the property
          let isValid = !!feature[context.prop];
          if (isValid) {
            const value = feature[context.prop]
            isValid = value === input;
          }
          return isValid;
        }
      };
    }
    return result;
  }
}

export class TextControl {
  constructor() {
    this.id = genId();
  }
  get next() {
    return html`
      <input type="text">
    `;
  }
  handle(context) {
    let result = null;

    const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
    // blank selects all, apply filter if non-blank
    if (input) {
      result = {
        id: context.id,
        resolve: function(feature) {
          // filter out features without the property
          let isValid = !!feature[context.prop];
          if (isValid) {
            const value = ('' + feature[context.prop]).trim().toUpperCase();
            isValid = value === input;
          }
          return isValid;
        }
      };
    }
    return result;
  }
}

export class ContainsControl {
  constructor() {
    this.id = genId();
  }
  get next() {
    return html`
      <input type="text">
    `;
  }
  handle(context) {
    let result = null;

    const input = ('' + context.target.nextElementSibling.value).trim().toUpperCase();
    // blank selects all, apply filter if non-blank
    if (input) {
      result = {
        id: context.id,
        resolve: function(feature) {
          // filter out features without the property
          let isValid = !!feature[context.prop];
          if (isValid) {
            const value = ('' + feature[context.prop]).trim().toUpperCase();
            isValid = value.includes(input);
          }
          return isValid;
        }
      };
    }
    return result;
  }
}