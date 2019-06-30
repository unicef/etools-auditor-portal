
import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
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
import UserControllerMixin from '../../app-mixins/user-controller-mixin.js';
import {GenericObject} from '../../../types/global.js';
import {getDomainByEnv} from '../../app-config/config.js';


setRootPath('/ap_poly3/');

/**
 * @customElement
 * @polymer
 */
class AppShell extends UserControllerMixin(LoadingMixin(AppMenuMixin(PolymerElement))) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <static-data></static-data>

      <app-location route="{{route}}" query-params="{{queryParams}}"></app-location>

      <app-route
              route="{{route}}"
              pattern="[[baseUrl]]:page"
              data="{{routeData}}"
              query-params="{{queryParams}}"
              tail="{{subroute}}">
      </app-route>

      <etools-loading id="global-loading" absolute></etools-loading>

      <app-drawer-layout id="layout" responsive-width="850px"
                        fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
        <!-- Drawer content -->
        <app-drawer id="drawer" slot="drawer" transition-duration="350"
                    opened="[[_drawerOpened]]"
                    swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
          <app-menu root-path="[[rootPath]]"
            selected-option="[[_page]]"
            small-menu$="[[smallMenu]]"></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>

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

        </app-header-layout>
      </app-drawer-layout>
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
  narrow: Boolean = false

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

  public connectedCallback() {
    super.connectedCallback();

    fireEvent(this, 'global-loading', {message: 'Loading...', active: true, type: 'initialisation'});

    if (this.initLoadingComplete && this.route.path === '/ap/') {
      this._configPath();
    }

    (this.$.drawer as AppDrawerElement).$.scrim.remove();

    this.addEventListener('global-loading', this.handleLoading);
    this.addEventListener('toast', this.queueToast as any);
    // this.addEventListener('drawer-toggle-tap', this._toggleDrawer as any); TODO
    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('static-data-loaded', this._initialDataLoaded);

  }

  queueToast(e, detail) {
    let notificationList = this.shadowRoot!.querySelector('multi-notification-list');
    if (!notificationList) {return;}

    if (detail && detail.reset) {
      fireEvent(notificationList, 'reset-notifications');
    } else {
      fireEvent(notificationList, 'notification-push', detail);
    }
  }

  _routePageChanged() {
    if (!this.initLoadingComplete || !this.routeData.page) {return;}
    this.page = this.routeData.page || 'engagements';
    this.scroll(0, 0);
  }

  _pageChanged(page) {
    if (!page) { // TODO
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
      resolvedPageUrl = 'elements/pages/not-found-page-view/not-found-page-view.html';
    } else if (page === 'staff-sc' && !this._checkSSCPage(this.user)) {
      this._pageNotFound();
      return;
    } else {
      resolvedPageUrl = `${getDomainByEnv()}/src/elements/pages/${page}-page-components/${page}-page-main/${page}-page-main.js`;
    }

    import(resolvedPageUrl).then(() => {
      if (!this.initLoadingComplete) {this.initLoadingComplete = true;}

      fireEvent(this, 'global-loading', {type: 'initialisation'});

      if (this.route.path === '/ap/') {this._configPath();}
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
    this.staticDataLoaded = true;// TODO -what is this flag doing???
    if (this.routeData && this.staticDataLoaded) {
      this.user = this.getUserData();
      this.page = this.routeData.page || this._configPath();
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

  _configPath() {// TODO ???
    let path = `${(window.location.port === '8080') ? '/' : '/ap/'}engagements/list`;
    this.set('route.path', path);
    return 'engagements';
  }

}

window.customElements.define('app-shell', AppShell);