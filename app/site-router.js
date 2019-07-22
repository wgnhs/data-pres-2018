
export class SiteRouter extends window.L.Evented {

  constructor() {
    super();
    let router = this.router = new Navigo(window.location.origin + '/core-data/');
    Object.entries(this.route).forEach(function(el) {
      if (el[1].signature) {
        router.on(el[1].signature, el[1].handler);
      } else {
        router.notFound(el[1].handler);
      }
    });
  }

  resolve() {
    this.router.resolve();
  }

  get route() {
    return {
      'entry': {
        handler: this._entryRoute.bind(this)
      },
      'view': {
        signature: '/view/:Site_Code',
        handler: this._viewSite.bind(this)
      },
      'print': {
        signature: '/print/:Site_Code',
        handler: this._printSite.bind(this)
      }
    };
  }

  static getSiteCode(params) {
    let keys = ['Wid', 'ID', 'Site_Code'];
    let result = keys.reduce((prev, curr) => {
      return prev || params[curr];
    }, undefined)
    return result;
  }

  _updateLocation(path) {
    this.router.pause();
    this.router.navigate(path);
    this.router.resume();
  }

  /**
   * Non-selected Site
   */
  _entryRoute() {
    this._updateLocation('/');
    this.fire('route-entry');
  }

  /**
   * Selected Site, View Layout
   */
  _viewSite(params) {
    let code = SiteRouter.getSiteCode(params);
    if (code) {
      this._updateLocation('/view/' + code);
      this.fire('route-view', params);
    } else {
      console.error('bad viewSite call');
    }
  }

  /**
   * Selected Site, Print Layout
   */
  _printSite(params) {
    let code = SiteRouter.getSiteCode(params);
    if (code) {
      this._updateLocation('/print/' + code);
      this.fire('route-print', params);
    } else {
      console.error('bad printSite call');
    }
  }

  /**
   * clear selection
   */
  clearRoute() {
    this.setRoute();
  }

  setRoute(name, params) {
    if (arguments.length > 0 && this.route[name]) {
      this.route[name].handler(params);
    } else {
      this._entryRoute();
    }
  }

}