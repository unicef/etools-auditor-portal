import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/paper-item';
import '@polymer/paper-listbox';
import '@polymer/paper-menu-button';
import {property} from '@polymer/decorators';
import {DomRepeat} from '@polymer/polymer/lib/elements/dom-repeat.js';
import famEndpoints from '../../../config/endpoints';
import {HeaderStyles} from './header-styles';
import {PaperMenuButton} from '@polymer/paper-menu-button';
import {GenericObject} from '../../../../types/global';
import {BASE_PATH} from '../../../config/config';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {DexieRefresh} from '@unicef-polymer/etools-utils/dist/singleton/dexie-refresh';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsPageRefreshMixin
 */
class CountriesDropdown extends PolymerElement {
  public static get template() {
    return html`
      ${HeaderStyles}
      <paper-menu-button
                id="dropdown" vertical-align="top"
                vertical-offset="56"
                horizontal-align="right"
                title="[[country.name]]">
            <paper-button slot="dropdown-trigger" on-tap="_toggleOpened">
                <div class="layout-horizontal">
                   <span class="dropdown-text">[[country.name]]</span>

                   <iron-icon class="arrow-down" icon="icons:arrow-drop-down"></iron-icon>
                   <iron-icon class="arrow-up" icon="icons:arrow-drop-up"></iron-icon>
                </div>
            </paper-button>

            <paper-listbox slot="dropdown-content" selected="[[countryIndex]]" on-iron-select="_countrySelected">
                <template is="dom-repeat" id="repeat" items="[[countries]]">
                    <paper-item on-tap="_changeCountry">
                        [[item.name]]
                    </paper-item>
                </template>
            </paper-lstbox>
      </paper-menu-button>
    `;
  }

  @property({type: Array})
  countries = [];

  @property({type: Number})
  countryId!: number;

  @property({type: Number})
  countryIndex!: number;

  @property({type: Object})
  country!: GenericObject;

  public static get observers() {
    return ['_setCountryIndex(countries, countryId)'];
  }

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('paper-dropdown-close', this._toggleOpened);
    this.addEventListener('paper-dropdown-open', this._toggleOpened);
  }

  _setCountryIndex(countries, countryId) {
    if (!(countries instanceof Array)) {
      return;
    }

    this.countryIndex = countries.findIndex((country) => {
      return country.id === countryId;
    });
  }

  _toggleOpened() {
    if ((this.shadowRoot!.querySelector('#dropdown') as PaperMenuButton).opened) {
      this.setAttribute('opened', '');
    } else {
      this.removeAttribute('opened');
    }
  }

  _countrySelected(e) {
    this.country = (this.shadowRoot!.querySelector('#repeat') as DomRepeat).itemForElement(e.detail.item);
  }

  _changeCountry(event) {
    const country = event && event.model && event.model.item;
    const id = country && country.id;

    if (Number(parseFloat(id)) !== id) {
      throw new Error('Can not find country id!');
    }
    fireEvent(this, 'global-loading', {
      type: 'change-country',
      active: true,
      message: 'Please wait while country is changing...'
    });

    this._sendChangeCountryRequest(id);
  }

  _sendChangeCountryRequest(countryId) {
    const options = {
      method: 'POST',
      body: {country: countryId},
      endpoint: famEndpoints.changeCountry
    };
    sendRequest(options).then(this._handleResponse.bind(this)).catch(this._handleError.bind(this));
  }

  _handleError() {
    fireEvent(this, 'global-loading', {type: 'change-country'});
    fireEvent(this, 'toast', {text: 'Can not change country. Please, try again later'});
  }

  _handleResponse() {
    DexieRefresh.refreshInProgress = true;
    DexieRefresh.clearDexieDbs();
    DexieRefresh.refreshInProgress = false;
    window.location.href = `${window.location.origin}/${BASE_PATH}/`;
  }
}

window.customElements.define('countries-dropdown', CountriesDropdown);
