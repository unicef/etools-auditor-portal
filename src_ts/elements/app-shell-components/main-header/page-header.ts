import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-app-selector/etools-app-selector';
import '@unicef-polymer/etools-unicef/src/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-accesibility/etools-accesibility';
import './header-elements/countries-dropdown';
import './header-elements/organizations-dropdown';
import './support-btn';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {HeaderStyles} from '../main-header/header-elements/header-styles';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {isProductionServer, checkEnvironment, BASE_PATH} from '../../config/config';
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
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      ${HeaderStyles}
      <style>
        app-toolbar {
          padding: 0px;
          background-color: ${this.headerColor};
          flex-wrap: wrap;
          height: 100%;
          justify-content: space-between;
        }

        countries-dropdown {
          --countries-dropdown-color: var(--light-secondary-text-color);
        }

        etools-profile-dropdown,
        #refresh {
          color: var(--light-secondary-text-color);
        }

        #menuButton {
          display: block;
          color: var(--light-secondary-text-color);
        }

        #pageRefresh::part(base) {
          color: var(--light-secondary-text-color);
        }

        .content-align {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        #app-logo {
          height: 32px;
          width: auto;
          padding: 0px 10px 0px 20px;
        }

        .dropdowns {
          padding-block-start: 6px;
          display: flex;
          margin-inline-end: 20px;
        }

        etools-accesibility {
          margin-inline-end: 10px;
        }
        
        .nav-menu-button {
          min-width: 70px;
        }

        .header__item {
          display: flex;
          align-items: center;
        }

        .header__right-group {
          justify-content: space-evenly;
        }

        .envWarning {
          color: #000;
          background-color: #ffffff;
          font-weight: 700;
          padding: 5px 10px;
          font-size: var(--etools-font-size-14, 14px);
          line-height: 1;
          border-radius: 10px;
        }

        support-btn {
          color: var(--header-color);
        }

        @media (min-width: 850px) {
          #menuButton {
            display: none;
          }
        }
        @media (max-width: 920px) {
          .envWarning {
            font-size: var(--etools-font-size-14, 14px);
            line-height: 16px;
          }
        }
        @media (max-width: 768px) {
          #app-logo {
            width: 90px;
          }
          .envLong {
            display: none;
          }
          etools-app-selector {
            width: 42px;
          }
          etools-profile-dropdown {
            margin-inline-start: 0px;
            width: 40px;
          }
        }
        @media (max-width: 576px) {
          etools-app-selector {
            --app-selector-button-padding: 18px 8px;
          }
          #app-logo {
            display: none;
          }
          .envWarning {
            font-size: var(--etools-font-size-10, 10px);
            margin-inline-start: 2px;
          }
          #refresh {
            width: 24px;
            padding: 0px;
          }
        }
      </style>

      <app-toolbar id="toolbar" sticky class="content-align">
        <div class="layout-horizontal align-items-center">
          <etools-icon-button id="menuButton" name="menu" @click="${this.menuBtnClicked}"></etools-icon-button>
          <etools-app-selector id="selector" .user="${this.user}"></etools-app-selector>
          <img id="app-logo" src="${BASE_PATH}assets/images/etools_logo.svg" alt="Etools" />
          <div class="envWarning" .hidden="${!this.environment}" title="${this.environment} TESTING ENVIRONMENT">
            ${this.environment}
          </div>
        </div>
        <div class="layout-horizontal align-items-center">
          <div class="dropdowns">
            <countries-dropdown
              id="countries"
              .countries="${this.user?.countries_available}"
              .currentCountry="${this.user?.country}"
            >
            </countries-dropdown>

            <organizations-dropdown .user="${this.user}"></organizations-dropdown>
          </div>

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

  @property({type: String})
  environment: string | null = checkEnvironment();

  @property({type: String})
  headerColor = 'var(--header-bg-color)';

  public connectedCallback() {
    super.connectedCallback();
    this._setBgColor();
  }

  public menuBtnClicked() {
    fireEvent(this, 'drawer');
  }

  public _setBgColor() {
    // If not production environment, changing header color to red
    if (!isProductionServer()) {
      this.headerColor = 'var(--nonprod-header-color)';
    }
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
