import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class GetAttachments extends EtoolsAjaxRequestMixin(PolymerElement) {

  @property({type: Number, notify: true, observer: '_baseIdChanged'})
  baseId!: number;

  @property({type: String})
  endpointName!: string;

  @property({type: Array, notify: true})
  attachments!: [];

  _handleResponse(detail) {
    this.attachments = detail && detail.results || [];
    fireEvent(this, 'attachments-loaded', {success: true});
  }

  _handleError() {
    fireEvent(this, 'attachments-loaded');
  }

  _baseIdChanged(baseId) {
    if (!baseId || !this.endpointName) {return;}
    let url = getEndpoint(this.endpointName, {id: baseId}).url;

    this.sendRequest({
      endpoint: {url}
    }).then(resp => {
      this._handleResponse(resp);
    }).catch(() => {
      this._handleError();
    });
  }
}
window.customElements.define('get-attachments', GetAttachments);
