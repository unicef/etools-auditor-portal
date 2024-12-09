import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @customElement
 */
@customElement('update-agreement-data')
export class UpdateAgreementData extends LitElement {
  @property({type: String})
  newDate!: string;

  @property({type: Object})
  agreement!: GenericObject;

  @property({type: Boolean})
  poUpdating = false;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('newDate')) {
      this._dateChanged(this.newDate);
    }
  }

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
      } catch {
        response = {};
      }
    }
    fireEvent(this, 'agreement-loaded', {success: false, errors: response});
  }
}
