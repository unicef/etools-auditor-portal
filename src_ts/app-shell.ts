import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';

import '@polymer/app-route/app-route';
import '@polymer/app-route/app-location.js';
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/iron-overlay-behavior/iron-overlay-backdrop';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';
import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import '@polymer/iron-pages/iron-pages';
import get from 'lodash-es/get';
import some from 'lodash-es/some';

import LoadingMixin from '@unicef-polymer/etools-loading/etools-loading-mixin';
import '@unicef-polymer/etools-loading';

import './elements/app-shell-components/sidebar-menu/app-menu.js';
import './elements/app-shell-components/main-header/page-header.js';
import './elements/app-shell-components/footer/page-footer.js';

import './elements/styles/app-theme.js';
import './elements/data-elements/static-data';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {property} from '@polymer/decorators';
import {AppMenuMixin} from './elements/app-shell-components/sidebar-menu/mixins/app-menu-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer.js';
import {getUserData} from './elements/mixins/user-controller';
import {GenericObject} from './types/global';
import {getDomainByEnv} from './elements/config/config';
import {appDrawerStyles} from './elements/app-shell-components/sidebar-menu/styles/app-drawer-styles';
import {BASE_PATH} from './elements/config/config';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import '@unicef-polymer/etools-toasts/src/etools-toasts';
declare const dayjs: any;
declare const dayjs_plugin_utc: any;

dayjs.extend(dayjs_plugin_utc);

setRootPath(`/${BASE_PATH}/`);

/**
 * @customElement
 * @polymer
 */
class AppShell extends LoadingMixin(AppMenuMixin(PolymerElement)) {
  public static get template() {
    // main template
    // language=HTML
    return html`
      ${appDrawerStyles}
      <static-data></static-data>
      <etools-piwik-analytics page="[[subroute.prefix]]" user="[[user]]" toast="[[_toast]]"></etools-piwik-analytics>

      <app-location route="{{route}}" query-params="{{queryParams}}" url-space-regex="^[[rootPath]]"></app-location>

      <app-route route="{{route}}" pattern="[[rootPath]]:page" data="{{routeData}}" tail="{{subroute}}"> </app-route>

      <etools-loading id="global-loading" absolute></etools-loading>

      <etools-toasts></etools-toasts>

      <app-drawer-layout
        id="layout"
        responsive-width="1200px"
        fullbleed
        narrow="{{narrow}}"
        small-menu$="[[smallMenu]]"
      >
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          on-click="onDrawerClick"
          swipe-open="[[narrow]]"
          small-menu$="[[smallMenu]]"
        >
          <app-menu
            root-path="[[rootPath]]"
            selected-page="[[page]]"
            small-menu$="[[smallMenu]]"
            show-ssc-page="[[_checkSSCPage(user)]]"
          ></app-menu>
          <iron-overlay-backdrop id="drawerOverlay"></iron-overlay-backdrop>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <iron-overlay-backdrop id="appHeaderOverlay"></iron-overlay-backdrop>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader" user="[[user]]"></page-header>
          </app-header>

          <main role="main" class="main-content">
            <iron-pages
              id="pages"
              selected="[[page]]"
              attr-for-selected="name"
              fallback-selection="not-found"
              role="main"
            >
              <engagements-page-main
                name="engagements"
                id="engagements"
                route="{{subroute}}"
                base-route="[[page]]"
                query-params="{{queryParams}}"
              >
              </engagements-page-main>

              <staff-sc-page-main
                selected-page="[[page]]"
                name="staff-sc"
                id="staff-sc"
                route="{{subroute}}"
                base-route="[[page]]"
                query-params="{{queryParams}}"
              >
              </staff-sc-page-main>

              <audits-page-main name="audits" id="audits" route="{{subroute}}" query-params="{{queryParams}}">
              </audits-page-main>

              <special-audits-page-main
                name="special-audits"
                id="special-audits"
                route="{{subroute}}"
                query-params="{{queryParams}}"
              >
              </special-audits-page-main>

              <micro-assessments-page-main
                name="micro-assessments"
                id="micro-assessments"
                route="{{subroute}}"
                query-params="{{queryParams}}"
              >
              </micro-assessments-page-main>

              <spot-checks-page-main
                name="spot-checks"
                id="spot-checks"
                route="{{subroute}}"
                query-params="{{queryParams}}"
              >
              </spot-checks-page-main>

              <spot-checks-page-main
                name="staff-spot-checks"
                id="staff-spot-checks"
                route="{{subroute}}"
                query-params="{{queryParams}}"
                is-staff-sc
              >
              </spot-checks-page-main>

              <not-found-page-view name="not-found" id="not-found"></not-found-page-view>
            </iron-pages>
          </main>
          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  static get observers() {
    return ['_routePageChanged(route.path)'];
  }

  @property({type: String, observer: '_pageChanged'})
  page = '';

  @property({type: Boolean, reflectToAttribute: true})
  narrow = false;

  @property({type: Object})
  _toast: PolymerElement | null = null;

  @property({type: Array})
  _toastQueue = [];

  @property({type: Array})
  globalLoadingQueue: any[] = [];

  @property({type: Object})
  user = {groups: []};

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData: GenericObject = {};

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: Boolean})
  initLoadingComplete!: boolean;

  public connectedCallback() {
    super.connectedCallback();

    this.checkAppVersion();
    setTimeout(() => (window.EtoolsEsmmFitIntoEl = this._getContentContainer()), 100);

    fireEvent(this, 'global-loading', {message: 'Loading...', active: true, type: 'initialisation'});

    if (this.initLoadingComplete && this.route.path === `/${BASE_PATH}/`) {
      this._setDefaultLandingPage();
    }

    this.shadowRoot!.querySelector('#drawer')?.shadowRoot?.querySelector('#scrim')?.remove();

    this.addEventListener('global-loading', this.handleLoading);
    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('static-data-loaded', this._initialDataLoaded);

    this.addEventListener('iron-overlay-opened', this._dialogOpening);
    this.addEventListener('iron-overlay-closed', this._dialogClosing);
  }

  protected _getContentContainer() {
    // @ts-ignore
    const appHeadLayout = this.shadowRoot.querySelector('#appHeadLayout');
    if (!appHeadLayout) {
      return null;
    }
    // @ts-ignore
    return appHeadLayout.shadowRoot.querySelector('#contentContainer');
  }

  _dialogOpening(event) {
    const dialogOverlay = document.querySelector('iron-overlay-backdrop.opened');
    if (!dialogOverlay) {
      return;
    }

    dialogOverlay.classList.remove('opened');

    const zIndex = (dialogOverlay as any).style.zIndex;
    const targetShadowRoot = event.target.shadowRoot;
    const appHeaderOverlay = targetShadowRoot.querySelector('#appHeaderOverlay');
    const toolBarOverlay = targetShadowRoot.querySelector('#pageheader').shadowRoot.querySelector('#toolBarOverlay');
    const drawerOverlay = targetShadowRoot.querySelector('#drawerOverlay');

    drawerOverlay.style.zIndex = zIndex;
    appHeaderOverlay.style.zIndex = zIndex;
    toolBarOverlay.style.zIndex = zIndex;

    drawerOverlay.classList.add('opened');
    appHeaderOverlay.classList.add('opened');
    toolBarOverlay.classList.add('opened');
  }
  _dialogClosing(event) {
    // chrome
    if (event.path && event.path[0] && event.path[0].tagName.toLowerCase().indexOf('dropdown') > -1) {
      return;
    }
    // edge
    if (event.__target && event.__target.is && event.__target.is.toLowerCase().indexOf('dropdown') > -1) {
      return;
    }

    const targetShadowRoot = event.target.shadowRoot;
    const appHeaderOverlay = targetShadowRoot.querySelector('#appHeaderOverlay');
    const toolBarOverlay = targetShadowRoot.querySelector('#pageheader').shadowRoot.querySelector('#toolBarOverlay');
    const drawerOverlay = targetShadowRoot.querySelector('#drawerOverlay');

    drawerOverlay.style.zIndex = '';
    appHeaderOverlay.style.zIndex = '';
    toolBarOverlay.style.zIndex = '';

    drawerOverlay.classList.remove('opened');
    appHeaderOverlay.classList.remove('opened');
    toolBarOverlay.classList.remove('opened');
  }

  allowPageChange() {
    const urlSpaceRegex = new RegExp(`^${this.rootPath}`);
    return urlSpaceRegex.test(this.route.path);
  }

  _routePageChanged() {
    if (!this.initLoadingComplete || !this.routeData.page || !this.allowPageChange()) {
      return;
    }
    this.page = this.routeData.page || 'engagements';
    if (this.scroll) {
      this.scroll(0, 0);
    }

    // Close a non-persistent drawer when the module & route are changed.
    const appDrawer = this.shadowRoot!.querySelector('#drawer') as AppDrawerElement;
    if (!appDrawer.persistent) {
      appDrawer.close();
    }
  }

  onDrawerClick(e) {
    const appDrawer = this.shadowRoot!.querySelector('#drawer') as AppDrawerElement;
    if (e.target === appDrawer && appDrawer.opened) {
      appDrawer.close();
    }
  }

  _pageChanged(page) {
    if (!page) {
      return;
    }
    if (page === 'staff-spot-checks') {
      page = 'spot-checks';
    }

    if (this.shadowRoot!.querySelector(`#${page}`) instanceof PolymerElement) {
      return;
    }

    fireEvent(this, 'global-loading', {message: 'Loading...', active: true, type: 'initialisation'});

    var resolvedPageUrl;
    if (page === 'not-found') {
      resolvedPageUrl = `${getDomainByEnv()}/src/elements/pages/not-found-page-view/not-found-page-view.js`;
    } else if (page === 'staff-sc' && !this._checkSSCPage(this.user)) {
      this._pageNotFound();
      return;
    } else {
      // eslint-disable-next-line
      resolvedPageUrl = `${getDomainByEnv()}/src/elements/pages/${page}/${page}-page-main.js`;
    }

    import(resolvedPageUrl)
      .then(() => {
        if (!this.initLoadingComplete) {
          this.initLoadingComplete = true;
        }

        fireEvent(this, 'global-loading', {type: 'initialisation'});

        if (this.route.path === this.rootPath) {
          this._setDefaultLandingPage();
        }
      })
      .catch((_err) => {
        EtoolsLogger.error(_err);
        this._pageNotFound();
      });
  }

  _checkSSCPage(user) {
    const groups = get(user, 'groups', []);
    return some(groups, (group) => group.name === 'UNICEF Audit Focal Point' || group.name === 'UNICEF User');
  }

  _pageNotFound(event?) {
    this.page = 'not-found';
    const message = event && event.detail && event.detail.message ? `${event.detail.message}` : 'Oops you hit a 404!';

    fireEvent(this, 'toast', {text: message});

    fireEvent(this, 'global-loading', {type: 'initialisation'});
  }

  _initialDataLoaded() {
    if (this.routeData) {
      this.user = getUserData();
      this.page = this.routeData.page || this._setDefaultLandingPage();
    }
  }

  handleLoading(event) {
    if (!event.detail || !event.detail.type) {
      EtoolsLogger.error(JSON.stringify(event.detail), 'Bad details object');
      return;
    }
    const loadingElement = this.shadowRoot!.querySelector('etools-loading#global-loading')! as any;

    if (event.detail.active && loadingElement.active) {
      this.globalLoadingQueue.push(event);
    } else if (event.detail.active && typeof event.detail.message === 'string' && event.detail.message !== '') {
      loadingElement.loadingText = event.detail.message;
      loadingElement.active = true;
    } else {
      loadingElement.active = false;
      this.globalLoadingQueue = this.globalLoadingQueue.filter((element) => {
        return element.detail.type !== event.detail.type;
      });
      if (this.globalLoadingQueue.length) {
        this.handleLoading(this.globalLoadingQueue.shift());
      }
    }
  }

  _setDefaultLandingPage() {
    // _configPath
    const path = `${this.rootPath}engagements/list`;
    this.set('route.path', path);
    return 'engagements';
  }

  checkAppVersion() {
    fetch('version.json')
      .then((res) => res.json())
      .then((version) => {
        if (version.revision != document.getElementById('buildRevNo')!.innerText) {
          console.log('version.json', version.revision);
          console.log('buildRevNo ', document.getElementById('buildRevNo')!.innerText);
          this._showConfirmNewVersionDialog();
        }
      });
  }

  _showConfirmNewVersionDialog() {
    const msg = document.createElement('span');
    msg.innerText = 'A new version of the app is available. Refresh page?';
    const conf: any = {
      size: 'md',
      closeCallback: this._onConfirmNewVersion.bind(this),
      content: msg
    };
    const confirmNewVersionDialog = createDynamicDialog(conf);
    setTimeout(() => {
      const dialog = confirmNewVersionDialog.shadowRoot?.querySelector('#dialog') as any;
      if (dialog) {
        dialog.style.zIndex = 9999999;
      }
    }, 0);
    confirmNewVersionDialog.opened = true;
  }

  _onConfirmNewVersion(e: CustomEvent) {
    if (e.detail.confirmed) {
      if (navigator.serviceWorker) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
          location.reload();
        });
      }
    }
  }
}

window.customElements.define('app-shell', AppShell);
