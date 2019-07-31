export { LitElement, html, css } from 'lit-element';
export { pushStateLocationPlugin, servicesPlugin, UIRouter } from '@uirouter/core';

// https://gist.github.com/gordonbrander/2230317
export const genId = function() {
  return '_' + Math.random().toString(36).substr(2, 9);
}