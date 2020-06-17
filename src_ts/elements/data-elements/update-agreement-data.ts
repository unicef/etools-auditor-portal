import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {getEndpoint} from '../app-config/endpoints-controller';
import {GenericObject} from '../../types/global';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

class UpdateAgreementData extends PolymerElement {
  @property({type: String, observer: '_dateChanged'})
  newDate!: string;

  @property({type: Object, notify: true})
  agreement!: GenericObject;

  @property({type: Boolean, notify: true})
  poUpdating = false;

  @property({type: Object, notify: true})
  errors!: GenericObject;

  _dateChanged(date) {
    date = date || null;
    if (!this.agreement || !this.agreement.id || this.agreement.contract_end_date === date) {
      return;
    }

    this.poUpdating = true;
    const url = getEndpoint('purchaseOrder', {id: this.agreement.id}).url;
    sendRequest({
      method: 'PATCH',
      endpoint: {url},
      body: {contract_end_date: date}
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch((err) => {
        this._handleError(err);
      });
  }

  _handleResponse(detail) {
    this.poUpdating = false;
    this.agreement = detail;
  }

  _handleError(error) {
    this.poUpdating = false;

    let response = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    this.set('errors', response);
  }
}
window.customElements.define('update-agreement-data', UpdateAgreementData);
