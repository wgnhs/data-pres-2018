import { pushStateLocationPlugin, servicesPlugin, UIRouter } from '@uirouter/core';
const DEFAULT_ROUTE = 'entry';

export class SiteRouter extends window.L.Evented {

  constructor() {
    super();
    this.router = new UIRouter();
    this.router.plugin(pushStateLocationPlugin);
    this.router.plugin(servicesPlugin);
    this.routes = {};
  }

  start() {
    this.router.urlService.rules.initial({ state: DEFAULT_ROUTE });
    this.router.urlService.rules.otherwise({ state: DEFAULT_ROUTE });
    // this.router.trace.enable(1);
    this.router.urlService.listen();
    this.router.urlService.sync();
  }

  addRoute(config) {
    if (config && config.name) {
      this.routes[config.name] = config;
      this.router.stateRegistry.register(config);
    }
  }

  /**
   * clear selection
   */
  clearRoute() {
    this.setRoute();
  }

  setRoute(name, params) {
    if (arguments.length > 0 && this.routes[name]) {
      this.router.stateService.go(name, params);
    } else {
      this.router.stateService.go(DEFAULT_ROUTE);
    }
  }

  link(name, params) {
    let result = '';
    if (params) {
      result = this.router.stateService.href(name, params);
    } else {
      result = this.router.stateService.href(name);
    }
    return result;
  }

}