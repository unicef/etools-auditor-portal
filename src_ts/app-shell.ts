import {LitElement, html} from 'lit';
import {property} from 'lit/decorators.js';
import {setPassiveTouchGestures} from '@polymer/polymer/lib/utils/settings.js';

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
import {AppMenuMixin} from './elements/app-shell-components/sidebar-menu/mixins/app-menu-mixin.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AppDrawer} from '@unicef-polymer/etools-unicef/src/etools-app-layout/app-drawer';
import {GenericObject} from './types/global';
import {appDrawerStyles} from './elements/app-shell-components/sidebar-menu/styles/app-drawer-styles';
import {BASE_PATH} from './elements/config/config';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-toasts/etools-toasts';
import './elements/utils/routes.js';
import {store, RootState} from './redux/store';
import {handleUrlChange} from './redux/actions/app.js';
import {setStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installRouter} from 'pwa-helpers/router';
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
import {EtoolsIconSet, initializeIcons} from '@unicef-polymer/etools-unicef/src/etools-icons/etools-icons';
import {apIcons} from './elements/styles/ap-icons';

setStore(store as any);
store.addReducers({
  user,
  commonData,
  engagement
});

declare const dayjs: any;
declare const dayjs_plugin_utc: any;
dayjs.extend(dayjs_plugin_utc);
window.EtoolsLanguage = 'en';

setBasePath('/ap/');
initializeIcons(
  [
    EtoolsIconSet.communication,
    EtoolsIconSet.device,
    EtoolsIconSet.social,
    EtoolsIconSet.av,
    EtoolsIconSet.image,
    EtoolsIconSet.maps
  ],
  apIcons
);
/**
 * @customElement
 * @LitElement
 */
class AppShell extends connect(store)(LoadingMixin(AppMenuMixin(LitElement))) {
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
        responsive-width="1200px"
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
            <engagements-page-main
              name="engagements"
              id="engagements"
              ?hidden="${!this.isActivePage(this.page, 'engagements')}"
            >
            </engagements-page-main>

            <staff-sc-page-main name="staff-sc" id="staff-sc" ?hidden="${!this.isActivePage(this.page, 'staff-sc')}">
            </staff-sc-page-main>

            <audits-page-main name="audits" id="audits" ?hidden="${!this.isActivePage(this.page, 'audits')}">
            </audits-page-main>

            <special-audits-page-main
              name="special-audits"
              id="special-audits"
              ?hidden="${!this.isActivePage(this.page, 'special-audits')}"
            >
            </special-audits-page-main>

            <micro-assessments-page-main
              name="micro-assessments"
              id="micro-assessments"
              ?hidden="${!this.isActivePage(this.page, 'micro-assessments')}"
            >
            </micro-assessments-page-main>

            <spot-checks-page-main
              name="spot-checks"
              id="spot-checks"
              ?hidden="${!this.isActivePage(this.page, 'spot-checks|staff-spot-checks')}"
            >
            </spot-checks-page-main>

            <not-found-page-view
              name="not-found"
              id="not-found"
              ?hidden="${!this.isActivePage(this.page, 'not-found')}"
            >
            </not-found-page-view>
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

  constructor() {
    super();
    // Gesture events like tap and track generated from touch will not be
    // preventable, allowing for better scrolling performance.
    setPassiveTouchGestures(true);
  }

  public connectedCallback() {
    super.connectedCallback();

    this.checkAppVersion();
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

  loadinitialData() {
    getCurrentUser().then((user?: EtoolsUser) => {
      if (user) {
        // @ts-ignore
        Promise.allSettled([
          getPartners(),
          getUsers(),
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

  onDrawerClick(e) {
    const appDrawer = this.shadowRoot!.querySelector('#drawer') as AppDrawer;
    if (e.target === appDrawer && appDrawer.opened) {
      appDrawer.close();
    }
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
    this.page = 'not-found';
    const message = event && event.detail && event.detail.message ? `${event.detail.message}` : 'Oops you hit a 404!';

    fireEvent(this, 'toast', {text: message});
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
