import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-app-selector/etools-app-selector';
import '@unicef-polymer/etools-unicef/src/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-accesibility/etools-accesibility';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/countries-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/organizations-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/buttons/support-button';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import famEndpoints from '../../config/endpoints';
import {DexieRefresh} from '@unicef-polymer/etools-utils/dist/singleton/dexie-refresh';

/**
 * page header element
 * @LitElement
 * @customElement
 * @appliesMixin GestureEventListeners
 */
@customElement('page-header')
export class PageHeader extends MatomoMixin(LitElement) {
  static get styles() {
    return [layoutStyles];
  }

  @property({type: Object})
  user!: GenericObject;

  render() {
    return html`
      <style>
        etools-accesibility {
          display: none;
        }
      </style>

      <app-toolbar
        id="toolbar"
        responsive-width="1101px"
        sticky
        class="content-align  layout-horizontal"
        @menu-button-clicked="${this.menuBtnClicked}"
        .profile="${this.user}"
      >
        <div slot="dropdowns">
          <countries-dropdown
            id="countries"
            .profile="${this.user}"
            .changeCountryEndpoint="${famEndpoints.changeCountry}"
            @country-changed="${this.countryOrOrganizationChanged}"
          >
          </countries-dropdown>
          <organizations-dropdown
            .profile="${this.user}"
            .changeOrganizationEndpoint="${famEndpoints.changeOrganization}"
            @organization-changed="${this.countryOrOrganizationChanged}"
          ></organizations-dropdown>
        </div>

        <div slot="icons">
          <support-btn></support-btn>

          <etools-profile-dropdown title="Profile and Sign out" .profile="${this.user}" @sign-out="${this._signOut}">
          </etools-profile-dropdown>

          <etools-icon-button
            title="Refresh"
            id="pageRefresh"
            name="refresh"
            label="refresh"
            tracker="Refresh"
            @click="${this.refreshBtnclicked}"
          >
          </etools-icon-button>

          <etools-accesibility></etools-accesibility>
        </div>
      </app-toolbar>
    `;
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  public countryOrOrganizationChanged() {
    DexieRefresh.refreshInProgress = true;
    DexieRefresh.clearDexieDbs();
    DexieRefresh.refreshInProgress = false;
    document.location.assign(window.location.origin + Environment.basePath);
  }

  public menuBtnClicked() {
    fireEvent(this, 'change-drawer-state');
  }

  protected _signOut() {
    this._clearDexieDb();
    this._clearLocalStorage();
    window.location.href = window.location.origin + '/social/unicef-logout/';
  }

  protected _clearDexieDb() {
    return window.EtoolsFamApp.DexieDb.delete();
  }

  protected refreshBtnclicked(e) {
    this.trackAnalytics(e);
    this._clearDexieDb().then(() => {
      location.reload();
    });
  }

  protected _clearLocalStorage() {
    localStorage.clear();
  }
}
