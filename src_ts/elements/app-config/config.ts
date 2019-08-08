import Dexie from 'dexie';

declare global {
  interface Window {EtoolsFamApp: any; EtoolsRequestCacheDb: any;}
}

window.EtoolsFamApp = window.EtoolsFamApp || {};

//------------Dexie------------
var etoolsCustomDexieDb = new Dexie('AP');

etoolsCustomDexieDb.version(1).stores({
  collectionsList: '&name, expire',
  partners: '&id',
  sections: '&id',
  offices: '&id'
});

// configure app dexie db to be used for caching
window.EtoolsRequestCacheDb = etoolsCustomDexieDb;
window.EtoolsFamApp.DexieDb = etoolsCustomDexieDb;


//-----------Environment------
const PROD_DOMAIN = 'etools.unicef.org';
const STAGING_DOMAIN = 'etools-staging.unicef.org';
const DEV_DOMAIN = 'etools-dev.unicef.org';
const DEMO_DOMAIN = 'etools-demo.unicef.org';
const LOCAL_DOMAIN = 'localhost:8082';

export const AP_DOMAIN = '/ap/';

export const isProductionServer = () => {
  const location = window.location.href;
  return location.indexOf(PROD_DOMAIN) > -1;
};

export const isStagingServer = () => {
  const location = window.location.href;
  return location.indexOf(STAGING_DOMAIN) > -1;
};

export const isDevServer = () => {
  return window.location.href.indexOf(DEV_DOMAIN) > -1;
};
export const isDemoServer = () => {
  return window.location.href.indexOf(DEMO_DOMAIN) > -1;
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

export const resetOldUserData = () => {
  localStorage.removeItem('userId');
  (etoolsCustomDexieDb as any).collectionsList.clear();
  (etoolsCustomDexieDb as any).partners.clear();
};

export const getDomainByEnv = () => {
  if (window.location.port === '8082') {
    return 'http://localhost:8082' + AP_DOMAIN;
  }
  if (isStagingServer()) {
    return 'https://etools-staging.unicef.org/ap';
  }
  if (isDevServer()) {
    return 'https://etools-dev.unicef.org/ap';
  }
  if (isDemoServer()) {
    return 'https://etools-demo.unicef.org/ap';
  }
  if (isProductionServer()) {
    return 'https://etools.unicef.org/ap';
  }
  return 'https://etools-dev.unicef.org/ap';
};
