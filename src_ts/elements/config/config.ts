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
export const SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY = 'etoolsAppSmallMenuIsActive';
