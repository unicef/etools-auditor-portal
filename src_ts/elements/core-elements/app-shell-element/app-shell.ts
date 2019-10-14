
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

import '@polymer/iron-pages/iron-pages';
import get from 'lodash-es/get';
import some from 'lodash-es/some';

import LoadingMixin from '@unicef-polymer/etools-loading/etools-loading-mixin';
import '@unicef-polymer/etools-loading';

import './../app-sidebar-menu/app-menu.js';
import './../app-main-header/page-header.js'
import './../app-footer/page-footer.js'

import './../../styles-elements/app-theme.js';
import '../../data-elements/static-data';


// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {property} from '@polymer/decorators';
import {AppMenuMixin} from '../app-sidebar-menu/mixins/app-menu-mixin.js';
import {fireEvent} from '../../utils/fire-custom-event.js';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer.js';
import {getUserData} from '../../app-mixins/user-controller';
import {GenericObject} from '../../../types/global.js';
import {getDomainByEnv} from '../../app-config/config.js';
import {appDrawerStyles} from '../app-sidebar-menu/styles/app-drawer-styles';
import '../../common-elements/multi-notifications/multi-notification-list';
import {BASE_PATH} from '../../app-config/config';

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
      <app-location route="{{route}}" query-params="{{queryParams}}" url-space-regex="^[[rootPath]]"></app-location>

      <app-route
              route="{{route}}"
              pattern="[[rootPath]]:page"
              data="{{routeData}}"
              tail="{{subroute}}">
      </app-route>

      <etools-loading id="global-loading" absolute></etools-loading>

      <app-drawer-layout id="layout" responsive-width="1200px"
                        fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" transition-duration="350"
                    opened="[[_drawerOpened]]"
                    swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
          <app-menu root-path="[[rootPath]]"
            selected-option="[[page]]"
            small-menu$="[[smallMenu]]"
            show-ssc-page="[[_checkSSCPage(user)]]"></app-menu>
            <iron-overlay-backdrop id="drawerOverlay"></iron-overlay-backdrop>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <iron-overlay-backdrop id="appHeaderOverlay"></iron-overlay-backdrop>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader" title="eTools" user="[[user]]"></page-header>
          </app-header>

          <main role="main" class="main-content">
            <iron-pages
                id="pages"
                selected="[[page]]"
                attr-for-selected="name"
                fallback-selection="not-found"
                role="main">

              <engagements-page-main
                      name="engagements"
                      id="engagements"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </engagements-page-main>

              <staff-sc-page-main
                      selected-page="[[page]]"
                      name="staff-sc"
                      id="staff-sc"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </staff-sc-page-main>

              <audits-page-main
                      name="audits"
                      id="audits"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </audits-page-main>

              <special-audits-page-main
                      name="special-audits"
                      id="special-audits"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </special-audits-page-main>

              <micro-assessments-page-main
                      name="micro-assessments"
                      id="micro-assessments"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </micro-assessments-page-main>

              <spot-checks-page-main
                      name="spot-checks"
                      id="spot-checks"
                      route="{{subroute}}"
                      query-params="{{queryParams}}">
              </spot-checks-page-main>

              <spot-checks-page-main
                      name="staff-spot-checks"
                      id="staff-spot-checks"
                      route="{{subroute}}"
                      query-params="{{queryParams}}"
                      is-staff-sc>
              </spot-checks-page-main>

              <not-found-page-view name="not-found" id="not-found"></not-found-page-view>
            </iron-pages>

          </main>
          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>
      <multi-notification-list></multi-notification-list>

    `;
  }

  static get observers() {
    return [
      '_routePageChanged(route.path)'
    ];
  }

  @property({type: String, observer: '_pageChanged'})
  page: string = '';

  @property({type: Boolean, reflectToAttribute: true})
  narrow: boolean = false;

  @property({type: Object})
  _toast: PolymerElement | null = null;

  @property({type: Array})
  _toastQueue = [];

  @property({type: Array})
  globalLoadingQueue = [];

  @property({type: Object})
  user = {};

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData: GenericObject = {};

  @property({type: Object})
  queryParams!: GenericObject;

  public connectedCallback() {
    super.connectedCallback();

    fireEvent(this, 'global-loading', {message: 'Loading...', active: true, type: 'initialisation'});

    if (this.initLoadingComplete && this.route.path === `/${BASE_PATH}/`) {
      this._setDefaultLandingPage();
    }

    (this.$.drawer as AppDrawerElement).$.scrim.remove();

    this.addEventListener('global-loading', this.handleLoading);
    this.addEventListener('toast', this.queueToast as any);
    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('static-data-loaded', this._initialDataLoaded);

    this.addEventListener('iron-overlay-opened', this._dialogOpening);
    this.addEventListener('iron-overlay-closed', this._dialogClosing);
  }

  _dialogOpening(event) {
    let dialogOverlay = document.querySelector("iron-overlay-backdrop.opened");
    if (!dialogOverlay) {return;}

    dialogOverlay.classList.remove("opened");

    const zIndex = (dialogOverlay as any).style.zIndex;
    event.target.$.drawerOverlay.style.zIndex = zIndex;
    event.target.$.appHeaderOverlay.style.zIndex = zIndex;
    event.target.$.pageheader.$.toolBarOverlay.style.zIndex = zIndex;

    event.target.$.drawerOverlay.classList.add("opened");
    event.target.$.appHeaderOverlay.classList.add("opened");
    event.target.$.pageheader.$.toolBarOverlay.classList.add("opened");
  }
  _dialogClosing(event) {
    // chrome
    if (event.path && event.path[0] && event.path[0].tagName.toLowerCase().indexOf('dropdown') > -1) {return;}
    // edge
    if (event.__target && event.__target.is && event.__target.is.toLowerCase().indexOf('dropdown') > -1) {return;}

    event.target.$.drawerOverlay.style.zIndex = '';
    event.target.$.appHeaderOverlay.style.zIndex = '';
    event.target.$.pageheader.$.toolBarOverlay.style.zIndex = '';

    event.target.$.drawerOverlay.classList.remove("opened");
    event.target.$.appHeaderOverlay.classList.remove("opened");
    event.target.$.pageheader.$.toolBarOverlay.classList.remove("opened");
  }

  queueToast(e) {
    let detail = e.detail;
    let notificationList = this.shadowRoot!.querySelector('multi-notification-list');
    if (!notificationList) {return;}

    if (detail && detail.reset) {
      fireEvent(notificationList, 'reset-notifications');
    } else {
      fireEvent(notificationList, 'notification-push', detail);
    }
  }

  allowPageChange() {
    const urlSpaceRegex = new RegExp(`^${this.rootPath}`);
    return urlSpaceRegex.test(this.route.path);
  }

  _routePageChanged() {
    if (!this.initLoadingComplete || !this.routeData.page || !this.allowPageChange()) {
      return;
    }

    // clear url params(filters from previous page) on navigate between pages
    const clearQueryParams = this.page !== this.routeData.page && Object.keys(this.queryParams).length > 0;
    this.page = this.routeData.page || 'engagements';

    if (clearQueryParams) {
      this.set('queryParams', {});
    }
    if (this.scroll) {
      this.scroll(0, 0);
    }
  }

  _pageChanged(page) {
    if (!page) {
      return;
    }
    if (page === 'staff-spot-checks') {
      page = 'spot-checks';
    }

    if (this.$[`${page}`] instanceof PolymerElement) {
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
      resolvedPageUrl = `${getDomainByEnv()}/src/elements/pages/${page}-page-components/${page}-page-main/${page}-page-main.js`;
    }

    import(resolvedPageUrl).then(() => {
      if (!this.initLoadingComplete) {this.initLoadingComplete = true;}

      fireEvent(this, 'global-loading', {type: 'initialisation'});

      if (this.route.path === this.rootPath) {this._setDefaultLandingPage();}
    })
      .catch((_err) => {console.error(_err); this._pageNotFound()});
  }

  _checkSSCPage(user) {
    let groups = get(user, 'groups', []);
    return some(groups, group => group.name === 'UNICEF Audit Focal Point' || group.name === 'UNICEF User');
  }

  _pageNotFound(event?) {
    this.page = 'not-found';
    let message = event && event.detail && event.detail.message ?
      `${event.detail.message}` :
      'Oops you hit a 404!';

    fireEvent(this, 'toast', {text: message});
    fireEvent(this, 'global-loading', {type: 'initialisation'});
  }

  _initialDataLoaded(e) {
    if (this.routeData) {
      this.user = getUserData();
      this.page = this.routeData.page || this._setDefaultLandingPage();
    }
  }

  handleLoading(event) {
    if (!event.detail || !event.detail.type) {
      console.error('Bad details object', JSON.stringify(event.detail));
      return;
    }
    let loadingElement = this.shadowRoot!.querySelector('etools-loading#global-loading')! as any;

    if (event.detail.active && loadingElement.active) {
      this.globalLoadingQueue.push(event);
    } else if (event.detail.active && typeof event.detail.message === 'string' && event.detail.message !== '') {
      loadingElement.loadingText = event.detail.message;
      loadingElement.active = true;
    } else {
      loadingElement.active = false;
      this.globalLoadingQueue = this.globalLoadingQueue.filter((element) => {return element.detail.type !== event.detail.type;});
      if (this.globalLoadingQueue.length) {
        this.handleLoading(this.globalLoadingQueue.shift());
      }
    }
  }

  _setDefaultLandingPage() {// _configPath
    let path = `${this.rootPath}engagements/list`;
    this.set('route.path', path);
    return 'engagements';
  }

}

window.customElements.define('app-shell', AppShell);
