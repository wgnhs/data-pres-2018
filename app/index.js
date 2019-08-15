import { SiteMap } from './site-map.js';
import { SiteData } from './site-data.js';
import { SiteRouter } from './site-router.js';

window.siteMap = new SiteMap();
window.sidebar = document.querySelector('#sidebar');
window.pdfPanel = document.querySelector('#sketch');
document.querySelectorAll('site-details').forEach(function(details) {
  details['pdfpanel'] = window.pdfPanel;
});

window.siteMap.once('init', function() {
  window.siteData = new SiteData(window.siteMap.bore, window.siteMap.quat);
  window.aggrData = siteData.aggrData;
  document.querySelector('#filter').init(window.siteData.uniques);

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
  window.router.addRoute({
    name: 'entry',
    url: '/',
    onEnter: function(trans, state) {
      // console.log('route-entry');
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
    name: 'view',
    url: '/view/:Site_Code',
    // params: {
    //   'Site_Code': {
    //     array: true
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
  window.router.addRoute({
    name: 'print',
    url: '/print/:Site_Code',
    // params: {
    //   'Site_Code': {
    //     array: true
    //   }
    // },
    onEnter: function(trans, state) {
      // console.log('route-print');
      let params = trans.params();
      let attr = window.siteMap.selectSite(params);
      if (attr) {
        document.querySelectorAll('site-details').forEach(function(details) {
          details['printLayout'] = true;
        });
        selectFeature(attr).then(() => {
          document.querySelector('#app').removeAttribute('data-view');
          window.sidebar.switchTab('details');
          window.siteMap.setVisibility(false);
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
  window.router.start();

  window.siteMap.on('interaction', (params) => {
    if (params['Site_Code']) {
      window.router.setRoute('view', params);
    } else {
      window.router.clearRoute();
    }
  });
  window.siteMap.on('filtered', ()=>{
    console.log('ooh');
    document.querySelector('#filter').$summary.setCounts(window.siteMap.getResultsInfo());
  });
});

document.addEventListener('clear-selection', function(e) {
  window.router.clearRoute();
});

document.addEventListener('toggle-print', function(e) {
  if (e.detail.on) {
    window.router.setRoute('print', e.detail.params);
  } else {
    window.router.setRoute('view', e.detail.params);
  }
});

document.addEventListener('toggle-pdf-panel', function(e) {
  window.siteMap.setVisibility(e.detail.closed);
});
