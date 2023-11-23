import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import famEndpoints from '../../../config/endpoints';
import {HeaderStyles} from './header-styles';
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

@customElement('countries-dropdown')
export class CountriesDropdown extends LitElement {
  render() {
    return html`
      ${HeaderStyles}
      <etools-dropdown
        id="countrySelector"
        class="w100"
        .selected="${this.currentCountry?.id}"
        allow-outside-scroll
        no-label-float
        .options="${this.countries}"
        option-label="name"
        option-value="id"
        trigger-value-change-event
        @etools-selected-item-changed="${this._countrySelected}"
        .shownOptionsLimit="${250}"
        hide-search
        auto-width
      ></etools-dropdown>
    `;
  }

  @property({type: Array})
  countries = [];

  @property({type: Object})
  currentCountry!: GenericObject;

  connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      const fitInto = document.querySelector('app-shell')!.shadowRoot!.querySelector('#appHeadLayout');
      (this.shadowRoot?.querySelector('#countrySelector') as EtoolsDropdownEl).fitInto = fitInto;
    }, 0);
  }

  _countrySelected(e) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedCountryId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedCountryId !== this.currentCountry.id) {
      // send post request to change_country endpoint
      this._triggerCountryChangeRequest(selectedCountryId);
    }
  }

  _triggerCountryChangeRequest(id) {
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
    window.location.href = `${window.location.origin}${BASE_PATH}`;
  }
}
