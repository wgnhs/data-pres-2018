import { SiteMap } from './map/site-map.js';
import { SiteData } from './site-data.js';
import { SiteRouter } from 'wgnhs-router';
import { Visualizer } from '@uirouter/visualizer';
export { SiteDetails } from './details/site-details.js';
export { MapFilter } from './filter/map-filter.js';

window.siteMap = new SiteMap();
window.sidebar = document.querySelector('#sidebar');
window.pdfPanel = document.querySelector('#sketch');
document.querySelectorAll('site-details').forEach(function(details) {
  details['pdfpanel'] = window.pdfPanel;
});
window.filter = document.querySelector('#filter');

window.siteMap.once('init', function() {
  window.siteData = new SiteData(window.siteMap.layers);
  window.filter.init(window.siteMap.layers);

  var deselectFeature = function() {
    window.pdfPanel.hide();
    document.querySelectorAll('site-details').forEach(function(details) {
      details['siteinfo'] = null;
    });
  }

  async function selectFeature(info) {
    deselectFeature();
    document.querySelectorAll('site-details').forEach(function(details) {
      details['siteinfo'] = info;
    });
    return true;
  };

  window.router = new SiteRouter();
  window.router.router.plugin(Visualizer);
  window.router.addRoute({
    name: 'entry',
    url: '?source',
    params: {
      'source': {
        type: 'query',
        array: true,
        value: []
      }
    },
    redirectTo: 'filter'
  });
  window.router.addRoute({
    parent: 'entry',
    name: 'filter',
    url: '/',
    onEnter: function(trans, state) {
      let params = trans.params();
      console.log('route-entry', params);
      window.siteMap.clearSelection();
      deselectFeature();
      document.querySelector('#app').setAttribute('data-view', 'app');
      window.sidebar.switchTab('default');
      window.siteMap.setVisibility(true);
    },
    onExit: function(trans, state) {

    },
  });
  window.router.addRoute({
    parent: 'entry',
    name: 'view',
    url: '/view/:Site_Code',
    // params: {
    //   'Site_Code': {
    //   }
    // },
    onEnter: function(trans, state) {
      // console.log('route-view');
      let params = trans.params();
      let attr = window.siteMap.selectSite(params);
      if (attr) {
        document.querySelectorAll('site-details').forEach(function(details) {
          details['printLayout'] = false;
        });
        selectFeature(attr).then(() => {
          document.querySelector('#app').setAttribute('data-view', 'app');
          window.sidebar.switchTab('details');
          window.siteMap.setVisibility(true);
        })
      } else {
        window.router.clearRoute();
      }
    },
    onExit: function(trans, state) {

    },
  });

  window.router.router.transitionService.onEnter({}, ()=>{
    document.querySelector('#spinner').setAttribute('data-closed', true);
  });
  // Start the router
  window.router.router.trace.enable(1);
  // window.router.start();
  window.router.router.urlService.listen();
  window.router.router.urlService.sync();

  window.siteMap.on('interaction', (params) => {
    if (params['Site_Code']) {
      window.router.setRoute('view', params);
    } else {
      window.router.clearRoute();
    }
  });
});

document.addEventListener('clear-selection', function(e) {
  window.router.clearRoute();
});

document.addEventListener('zoom-to-site', function(e) {
  window.siteMap.zoomToPoint(e.detail.params);
});

document.addEventListener('toggle-pdf-panel', function(e) {
  window.siteMap.setVisibility(e.detail.closed);
  if (e.detail.closed) {
    window.pdfPanel.setAttribute('data-closed', true);
  } else {
    window.pdfPanel.removeAttribute('data-closed');
  }
});

document.addEventListener('filtered', function(e) {
  window.siteMap.updatePoints(e.detail.activePoints);
});