import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-overlay-behavior/iron-overlay-backdrop';
import '@unicef-polymer/etools-app-selector';
import '@unicef-polymer/etools-profile-dropdown';
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
          padding: 0 16px 0 0;
          height: 60px;
          background-color: ${this.headerColor};
        }

        .titlebar {
          color: var(--header-color);
        }

        support-btn,
        #pageRefresh {
          color: var(--light-secondary-text-color);
          margin-left: 8px;
        }

        #menuButton {
          display: block;
          color: var(--light-secondary-text-color);
        }

        .titlebar {
          flex: 1;
          font-size: 28px;
          font-weight: 300;
        }

        .titlebar img {
          width: 34px;
          margin: 0 8px 0 24px;
        }

        #app-logo {
          height: 32px;
          width: auto;
        }

        .envWarning {
          color: var(--nonprod-text-warn-color);
          font-weight: 700;
          font-size: 18px;
        }

        @media (min-width: 1200px) {
          #menuButton {
            display: none;
          }
        }
      </style>

      <app-toolbar id="toolbar" sticky class="layout-horizontal align-items-center">
        <iron-overlay-backdrop id="toolBarOverlay"></iron-overlay-backdrop>
        <div class="titlebar layout-horizontal align-items-center">
          <paper-icon-button id="menuButton" icon="menu" @click="${this.menuBtnClicked}"></paper-icon-button>
          <etools-app-selector id="selector" .user="${this.user}"></etools-app-selector>
          <img id="app-logo" src="${BASE_PATH}assets/images/etools_logo.svg" />
          <div class="envWarning" .hidden="${!this.environment}">- ${this.environment} TESTING ENVIRONMENT</div>
        </div>
        <div class="layout-horizontal align-items-center">
          <countries-dropdown
            id="countries"
            .countries="${this.user?.countries_available}"
            .currentCountry="${this.user?.country}"
          >
          </countries-dropdown>

          <organizations-dropdown .user="${this.user}"></organizations-dropdown>

          <support-btn title="Support"></support-btn>

          <etools-profile-dropdown title="Profile and Sign out" .profile="${this.user}" @sign-out="${this._signOut}">
          </etools-profile-dropdown>

          <paper-icon-button
            title="Refresh"
            id="pageRefresh"
            icon="refresh"
            tracker="Refresh"
            @click="${this.refreshBtnclicked}"
          >
          </paper-icon-button>
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
