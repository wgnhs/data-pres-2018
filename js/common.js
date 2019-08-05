export { LitElement, html, css } from 'lit-element';
export { pushStateLocationPlugin, servicesPlugin, UIRouter } from '@uirouter/core';

// https://gist.github.com/gordonbrander/2230317
export function genId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * @param {HTMLElement} context element to dispatch event from
 * @param {String} eventName custom event name
 * @param {Object} detail 
 * @param {Boolean} bubbles does the event bubble up the elements
 * @param {Boolean} composed does the event bubble up through ShadowDOM?
 */
export function dispatch(context, eventName, detail, bubbles, composed) {
  context.dispatchEvent(
    new CustomEvent(
      eventName, 
      {
        bubbles,
        composed,
        detail
      }
    )
  );
}