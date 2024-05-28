import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-app-selector/etools-app-selector';
import '@unicef-polymer/etools-unicef/src/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-accesibility/etools-accesibility';
import './countries-dropdown';
import './organizations-dropdown';
import './support-btn';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

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
            .countries="${this.user?.countries_available}"
            .currentCountry="${this.user?.country}"
          >
          </countries-dropdown>

          <organizations-dropdown .user="${this.user}"></organizations-dropdown>
        </div>

        <div slot="icons">
          <support-btn title="Support"></support-btn>

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

  @property({type: Object})
  user!: GenericObject;

  public connectedCallback() {
    super.connectedCallback();
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
