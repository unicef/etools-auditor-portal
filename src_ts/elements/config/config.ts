import Dexie from 'dexie';

declare global {
  interface Window {
    EtoolsFamApp: any;
    EtoolsRequestCacheDb: any;
    EtoolsEsmmFitIntoEl: Element | null;
    EtoolsLanguage: any;
  }
}

window.EtoolsFamApp = window.EtoolsFamApp || {};

// ------------Dexie------------
var etoolsCustomDexieDb = new Dexie('AP');
// Static data (agency_choices, agreement_amendment_types, attachment_types, cso_types, etc)
// is stored in the 'ajaxDefaultDataTable'
etoolsCustomDexieDb.version(1).stores({
  partners: '&id',
  sections: '&id',
  offices: '&id',
  listsExpireMapTable: '&name, expire',
  ajaxDefaultDataTable: '&cacheKey, data, expire'
});

// configure app dexie db to be used for caching
window.EtoolsRequestCacheDb = etoolsCustomDexieDb;
window.EtoolsFamApp.DexieDb = etoolsCustomDexieDb;

// -----------Environment------
const PROD_DOMAIN = 'etools.unicef.org';
const STAGING_DOMAIN = 'etools-staging';
const DEV_DOMAIN = 'etools-dev';
const DEMO_DOMAIN = 'etools-demo';
const LOCAL_DOMAIN = 'localhost';

export const BASE_PATH = '/ap/';
export const BASE_URL = '/' + getBasePath().replace(window.location.origin, '').slice(1, -1) + '/';

export const isProductionServer = () => {
  const location = window.location.href;
  return location.indexOf(PROD_DOMAIN) > -1;
};

export const checkEnvironment = () => {
  const location = window.location.href;
  if (location.indexOf(STAGING_DOMAIN) > -1) {
    return 'STAGING';
  }
  if (location.indexOf(DEMO_DOMAIN) > -1) {
    return 'DEMO';
  }
  if (location.indexOf(DEV_DOMAIN) > -1) {
    return 'DEVELOPMENT';
  }
  if (location.indexOf(LOCAL_DOMAIN) > -1) {
    return 'LOCAL';
  }
  return null;
};

function getBasePath() {
  return document.getElementsByTagName('base')[0].href;
}

export const getDomainByEnv = () => {
  return getBasePath().slice(0, -1);
};
