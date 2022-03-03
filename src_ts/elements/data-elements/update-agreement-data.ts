import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../utils/fire-custom-event';

class UpdateAgreementData extends PolymerElement {
  @property({type: String, observer: '_dateChanged'})
  newDate!: string;

  @property({type: Object})
  agreement!: GenericObject;

  @property({type: Boolean})
  poUpdating = false;

  _dateChanged(date) {
    if (
      typeof date === 'undefined' ||
      !this.agreement ||
      !this.agreement.id ||
      this.agreement.contract_end_date === date
    ) {
      return;
    }

    this.poUpdating = true;
    fireEvent(this, 'loading-state-changed', {state: this.poUpdating});
    const url = getEndpoint('purchaseOrder', {id: this.agreement.id}).url;
    sendRequest({
      method: 'PATCH',
      endpoint: {url},
      body: {contract_end_date: date}
    })
      .then((resp) => this._handleResponse(resp))
      .catch((err) => this._handleError(err))
      .finally(() => {
        this.poUpdating = false;
        fireEvent(this, 'loading-state-changed', {state: this.poUpdating});
      });
  }

  _handleResponse(detail) {
    this.agreement = Object.assign({}, detail);
    fireEvent(this, 'agreement-loaded', {success: true, agreement: this.agreement});
  }

  _handleError(error) {
    let response = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }
    fireEvent(this, 'agreement-loaded', {success: false, errors: response});
  }
}
window.customElements.define('update-agreement-data', UpdateAgreementData);
