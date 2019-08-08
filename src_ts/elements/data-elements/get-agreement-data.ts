import {PolymerElement} from "@polymer/polymer/polymer-element";
import {property} from "@polymer/decorators";
import {fireEvent} from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class GetAgreementData extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {

  @property({type: Number, notify: true, observer: '_orderNumberChanged'})
  orderNumber!: number;

  @property({type: Object, notify: true})
  agreement!: {};

  _handleResponse(data) {
    this.agreement = data;
    fireEvent(this, 'agreement-loaded', {success: true});
  }

  _handleError() {
    fireEvent(this, 'agreement-loaded');
  }

  _orderNumberChanged(orderNumber, oldNumber) {
    if (!orderNumber || orderNumber === oldNumber) {
      return;
    }
    this.sendRequest({
      endpoint: {url: this.getEndpoint('agreementData', {id: orderNumber}).url}
    }).then(resp => {
      this._handleResponse(resp);
    }).catch(err => {
      this._handleError();
    });
  }
}
window.customElements.define("get-agreement-data", GetAgreementData);
