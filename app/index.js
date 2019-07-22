import { SiteMap } from './site-map.js';
import { SiteData } from './site-data.js';
import { SiteRouter } from './site-router.js';

window.siteMap = new SiteMap();
window.sidebar = document.querySelector('#sidebar');

window.siteMap.once('init', function() {
  window.siteData = new SiteData(window.siteMap.bore, window.siteMap.quat);
  window.aggrData = siteData.aggrData;

  var deselectFeature = function() {
    document.dispatchEvent(new CustomEvent('toggle-pdf', {bubbles: true, detail: {closed: true}}));
    document.querySelectorAll('site-details').forEach(function(details) {
      details['siteinfo'] = null;
    });
    document.querySelectorAll('pdf-view').forEach(function(sketch) {
      sketch['pdfsrc'] = null;
    });
  }

  async function selectFeature(info) {
    deselectFeature();
    document.querySelectorAll('site-details').forEach(function(details) {
      details['siteinfo'] = info;
    });
    document.querySelectorAll('pdf-view').forEach(function(sketch) {
      sketch['pdfsrc'] = (info.Wid)?'https://data.wgnhs.wisc.edu/geophysical-logs/'+info.Wid+'.pdf':null;
    });
    return true;
  };

  window.router = new SiteRouter();
  window.router.on('route-entry', () => {
    // console.log('route-entry');
    window.siteMap.clearSelection();
    deselectFeature();
    document.querySelector('#app').setAttribute('data-view', 'app');
    window.sidebar.switchTab('default');
    window.siteMap.setVisibility(true);
  });
  window.router.on('route-view', (params) => {
    // console.log('route-view');
    let attr = window.siteMap.selectPoint(params);
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
  });
  window.router.on('route-print', (params) => {
    // console.log('route-print');
    let attr = window.siteMap.selectPoint(params);
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
  });
  window.router.resolve();

  window.siteMap.on('interaction', (params) => {
    if (SiteRouter.getSiteCode(params)) {
      window.router.setRoute('view', params);
    } else {
      window.router.clearRoute();
    }
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

document.addEventListener('toggle-pdf', function(e) {
  window.siteMap.setVisibility(e.detail.closed);
});
