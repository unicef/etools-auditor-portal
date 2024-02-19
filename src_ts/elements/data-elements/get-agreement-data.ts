import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {GenericObject} from '../../types/global';

/**
 * @customElement
 */
@customElement('get-agreement-data')
export class GetAgreementData extends LitElement {
  @property({type: Number})
  orderNumber!: number;

  @property({type: Object})
  agreement!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('orderNumber')) {
      this._orderNumberChanged(this.orderNumber, changedProperties.get('orderNumber'));
    }
  }

  _handleResponse(data) {
    this.agreement = data;
    fireEvent(this, 'agreement-loaded', {success: true, agreement: data});
  }

  _handleError() {
    fireEvent(this, 'agreement-loaded');
  }

  _orderNumberChanged(orderNumber, oldNumber) {
    if (!orderNumber || orderNumber === oldNumber) {
      return;
    }
    sendRequest({
      endpoint: {url: getEndpoint('agreementData', {id: orderNumber}).url}
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch(() => {
        this._handleError();
      });
  }
}
