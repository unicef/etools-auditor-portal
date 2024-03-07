import {LitElement, html} from 'lit';
import {property, query} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer-layout';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-header-layout';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-header';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';
import {createDynamicDialog} from '@unicef-polymer/etools-unicef/src/etools-dialog/dynamic-dialog';
import get from 'lodash-es/get';
import {LoadingMixin} from '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading-mixin';

import './elements/app-shell-components/sidebar-menu/app-menu.js';
import './elements/app-shell-components/main-header/page-header.js';
import './elements/app-shell-components/footer/page-footer.js';

import {
  getPartners,
  getUsers,
  getStaffUsers,
  getOffices,
  getSections,
  getStaticDropdownData,
  getEngagementOptions,
  getNewStaffSCOptions,
  getFilterAuditors,
  getFilterPartners,
  getNewAttachOptions
} from './redux/actions/common-data';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AppDrawer} from '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer';
import {GenericObject} from './types/global';
import {appDrawerStyles} from './elements/app-shell-components/sidebar-menu/styles/app-drawer-styles';
import {BASE_PATH, SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from './elements/config/config';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-toasts/etools-toasts';
import './elements/utils/routes.js';
import {store, RootState} from './redux/store';
import {handleUrlChange} from './redux/actions/app.js';
import {setStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {connect, installMediaQueryWatcher, installRouter} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {getCurrentUser} from './elements/data-elements/user-data.js';
import {EtoolsUser} from '@unicef-polymer/etools-types/dist/user.types.js';
import commonData, {CommonDataState} from './redux/reducers/common-data.js';
import user from './redux/reducers/user.js';
import engagement from './redux/reducers/engagement.js';
import {SET_ALL_STATIC_DATA} from './redux/actions/actionsConstants.js';
import {getValueFromResponse, setUsersFullName} from './elements/utils/utils.js';
import {RouteDetails} from '@unicef-polymer/etools-types';
import {addAllowedActions} from './elements/mixins/permission-controller.js';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util.js';
import cloneDeep from 'lodash-es/cloneDeep.js';
import {setBasePath} from '@shoelace-style/shoelace/dist/utilities/base-path.js';
import {initializeIcons} from '@unicef-polymer/etools-unicef/src/etools-icons/etools-icons';

setStore(store as any);
store.addReducers({
  user,
  commonData,
  engagement
});

window.EtoolsLanguage = 'en';

setBasePath(BASE_PATH);
initializeIcons();
/**
 * @customElement
 * @LitElement
 */
class AppShell extends connect(store)(LoadingMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    // main template
    // language=HTML
    return html`
      ${appDrawerStyles}
      <etools-piwik-analytics
        .page="${this.page}"
        .user="${this.user}"
        .toast="${this.currentToastMessage}"
      ></etools-piwik-analytics>

      <etools-toasts></etools-toasts>

      <app-drawer-layout
        id="layout"
        responsive-width="850px"
        fullbleed
        .narrow="${this.narrow}"
        ?small-menu="${this.smallMenu}"
      >
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          @app-drawer-transitioned="${this.onDrawerToggle}"
          ?opened="${this.drawerOpened}"
          ?swipe-open="${this.narrow}"
          ?small-menu="${this.smallMenu}"
        >
          <app-menu
            .selectedPage="${this.page}"
            ?small-menu="${this.smallMenu}"
            ?showSscPage="${this.showSscPage}"
          ></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader" .user="${this.user}"></page-header>
          </app-header>

          <main role="main" class="main-content">
            ${this.isActivePage(this.page, 'engagements')
              ? html`<engagements-page-main name="engagements" id="engagements"> </engagements-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'staff-sc')
              ? html` <staff-sc-page-main name="staff-sc" id="staff-sc"> </staff-sc-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'audits')
              ? html`<audits-page-main name="audits" id="audits"> </audits-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'special-audits')
              ? html` <special-audits-page-main name="special-audits" id="special-audits"> </special-audits-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'micro-assessments')
              ? html` <micro-assessments-page-main name="micro-assessments" id="micro-assessments">
                </micro-assessments-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'spot-checks|staff-spot-checks')
              ? html` <spot-checks-page-main name="spot-checks" id="spot-checks"> </spot-checks-page-main>`
              : html``}
            ${this.isActivePage(this.page, 'not-found')
              ? html`<not-found-page-view name="not-found" id="not-found"> </not-found-page-view>`
              : html``}
          </main>
          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>
    `;
  }

  @property({type: String})
  page = '';

  @property({type: Boolean, reflect: true})
  narrow = false;

  @property({type: Boolean})
  smallMenu = false;

  @property({type: Boolean})
  drawerOpened = false;

  @property({type: String})
  currentToastMessage!: string;

  @property({type: Array})
  globalLoadingQueue: any[] = [];

  @property({type: Object})
  user!: EtoolsUser;

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: Boolean})
  initLoadingComplete!: boolean;

  @property({type: Boolean})
  showSscPage!: boolean;

  @property({type: Object})
  reduxRouteDetails?: RouteDetails;

  @query('#drawer') private drawer!: AppDrawer;

  constructor() {
    super();

    const menuTypeStoredVal: string | null = localStorage.getItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY);
    if (!menuTypeStoredVal) {
      this.smallMenu = false;
    } else {
      this.smallMenu = !!parseInt(menuTypeStoredVal, 10);
    }
  }

  public connectedCallback() {
    super.connectedCallback();

    this.addEventListener('change-drawer-state', this.changeDrawerState);
    this.addEventListener('toggle-small-menu', this.toggleMenu as any);
    installMediaQueryWatcher(`(min-width: 460px)`, () => fireEvent(this, 'change-drawer-state'));

    setTimeout(() => {
      window.EtoolsEsmmFitIntoEl = this._getContentContainer();
      this.etoolsLoadingContainer = window.EtoolsEsmmFitIntoEl as any;
    }, 100);

    fireEvent(this, 'global-loading', {message: 'Loading...', active: true, loadingSource: 'initialisation'});

    this.addEventListener('404', this._pageNotFound);

    installRouter((location) =>
      store.dispatch(handleUrlChange(decodeURIComponent(location.pathname + location.search)))
    );

    this.loadinitialData();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change-drawer-state', this.changeDrawerState);
  }

  loadinitialData() {
    getCurrentUser().then((user?: EtoolsUser) => {
      if (user) {
        // @ts-ignore
        Promise.allSettled([
          user.is_unicef_user ? getPartners() : [],
          user.is_unicef_user ? getUsers() : [],
          getSections(),
          getOffices(),
          getStaffUsers(),
          getStaticDropdownData(),
          getFilterAuditors(),
          getFilterPartners(),
          getEngagementOptions(),
          getNewStaffSCOptions(),
          getNewAttachOptions()
        ]).then((response: any[]) => {
          store.dispatch({
            type: SET_ALL_STATIC_DATA,
            staticData: this.formatResponse(response)
          });
        });
      }
    });
  }

  private formatResponse(response: any[]) {
    const data: Partial<CommonDataState> = {};
    data.partners = getValueFromResponse(response[0]);
    data.users = get(getValueFromResponse(response[1]), 'results') || [];
    data.sections = getValueFromResponse(response[2]);
    data.offices = getValueFromResponse(response[3]);
    data.staffMembersUsers = setUsersFullName(getValueFromResponse(response[4]));
    data.staticDropdown = getValueFromResponse(response[5]);
    data.filterAuditors = getValueFromResponse(response[6]);
    data.filterPartners = getValueFromResponse(response[7]);
    data.new_engagementOptions = addAllowedActions(getValueFromResponse(response[8]));
    data.new_staff_scOptions = addAllowedActions(getValueFromResponse(response[9]));
    data.new_attachOptions = addAllowedActions(getValueFromResponse(response[10]));
    return data;
  }

  public stateChanged(state: RootState) {
    if (!state.app.routeDetails?.routeName || !state.user?.data) {
      return;
    }
    if (!isJsonStrMatch(this.user, state.user.data)) {
      this.user = state.user.data;
      this._checkSSCPage(this.user);
    }
    if (!isJsonStrMatch(this.reduxRouteDetails, state.app.routeDetails)) {
      if (this.canAccessPage(state.app.routeDetails.routeName)) {
        if (
          state.app.routeDetails.path.includes('/new') &&
          (!this.reduxRouteDetails || !this.reduxRouteDetails.path.includes('/new'))
        )
          fireEvent(this, 'global-loading', {
            active: true,
            loadingSource: state.app.routeDetails.routeName
          });
        this.page = state.app.routeDetails.routeName;
        this.reduxRouteDetails = cloneDeep(state.app.routeDetails);
      } else {
        this._pageNotFound();
      }
    }
  }

  canAccessPage(page: string) {
    if (page === 'staff-sc' && !this.showSscPage) {
      return false;
    }
    return true;
  }

  isActivePage(activeModule: string, expectedModule: string) {
    const pagesToMatch = expectedModule.split('|');
    return pagesToMatch.indexOf(activeModule) > -1;
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

  allowPageChange() {
    const urlSpaceRegex = new RegExp(`^${BASE_PATH}`);
    return urlSpaceRegex.test(this.reduxRouteDetails?.path || '');
  }

  public onDrawerToggle() {
    if (this.drawerOpened !== this.drawer.opened) {
      this.drawerOpened = this.drawer.opened;
    }
  }

  public changeDrawerState() {
    this.drawerOpened = !this.drawerOpened;
  }

  private toggleMenu(e: CustomEvent): void {
    this.smallMenu = e.detail.value;
  }

  _checkSSCPage(user) {
    if (!user) {
      return;
    }
    this.showSscPage = (user.groups || []).some(
      (group) => group.name === 'UNICEF Audit Focal Point' || group.name === 'UNICEF User'
    );
  }

  _pageNotFound(event?) {
    const message = event && event.detail && event.detail.message ? `${event.detail.message}` : 'Oops you hit a 404!';
    fireEvent(this, 'toast', {text: message});
    this.goToPageNotFound();
  }

  goToPageNotFound() {
    history.pushState(window.history.state, '', 'not-found');
    window.dispatchEvent(new CustomEvent('popstate'));
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
