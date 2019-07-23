import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@unicef-polymer/etools-app-selector';
import '@unicef-polymer/etools-profile-dropdown';
import './countries-dropdown/countries-dropdown';
import './support-btn';

import {isProductionServer, checkEnvironment} from '../../app-config/config.js';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../types/global';

/**
 * page header element
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class PageHeader extends GestureEventListeners(PolymerElement) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style>
        app-toolbar {
          padding: 0 16px 0 0;
          height: 60px;
          background-color: var(--header-bg-color);
        }

        .titlebar {
          color: var(--header-color);
        }

        support-btn {
          color: var(--light-secondary-text-color);
        }

        #menuButton {
          display: block;
          color: var(--header-color);
        }

        .titlebar {
          @apply --layout-flex;
          font-size: 28px;
          font-weight: 300;
        }

        .titlebar img {
          width: 34px;
          margin: 0 8px 0 24px;
        }

        .content-align {
          @apply --layout-horizontal;
          @apply --layout-center;
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

        @media (min-width: 850px) {
          #menuButton {
            display: none;
          }
        }
      </style>

      <app-toolbar sticky class="content-align">
        <paper-icon-button id="menuButton" icon="menu" on-tap="menuBtnClicked"></paper-icon-button>

        <div class="titlebar content-align">
          <etools-app-selector id="selector" user="[[user]]"></etools-app-selector>
          <img id="app-logo" src$="[[rootPath]]/../assets/images/etools_logo.svg">

          <template is="dom-if" if="[[environment]]">
            <div class="envWarning"> - [[environment]] TESTING ENVIRONMENT</div>
          </template>
        </div>

        <div class="content-align">
          <countries-dropdown id="countries"
                              countries="[[user.countries_available]]"
                              country-id="[[user.country.id]]"></countries-dropdown>

          <support-btn></support-btn>

          <etools-profile-dropdown profile="[[user]]"></etools-profile-dropdown>

          <!--<paper-icon-button id="refresh" icon="refresh" on-tap="_openDataRefreshDialog"></paper-icon-button>-->
        </div>
      </app-toolbar>
    `;
  }


  @property({type: Object})
  user!: GenericObject;

  @property({type: String})
  environment: string | null = checkEnvironment();

  public connectedCallback() {
    super.connectedCallback();
    this._setBgColor();
  }

  public menuBtnClicked() {
    // store.dispatch(updateDrawerState(true));
    // fireEvent(this, 'drawer');
  }

  public _setBgColor() {
    // If not production environment, changing header color to red
    if (!isProductionServer()) {
      this.updateStyles({'--header-bg-color': 'var(--nonprod-header-color)'});
    }
  }
}

window.customElements.define('page-header', PageHeader);
