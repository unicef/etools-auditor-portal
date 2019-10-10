import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class GetActionPoints extends EtoolsAjaxRequestMixin(PolymerElement) {

  @property({type: Number, notify: true, observer: '_engagementIdChanged'})
  engagementId!: number;

  @property({type: Array, notify: true})
  actionPoints!: [];

  _handleResponse(data) {
    this.actionPoints = data.length && data || [];
    fireEvent(this, 'ap-loaded', {success: true});
  }

  _handleError() {
    fireEvent(this, 'ap-loaded');
  }

  _engagementIdChanged(engagementId) {
    if (!engagementId) {return;}
    const apBaseUrl = getEndpoint('engagementInfo', {id: engagementId, type: 'engagements'}).url;
    const url = `${apBaseUrl}action-points/?page_size=all`;

    this._getActionPoints(url);
  }

  _getActionPoints(url) {
    const requestOptions = {
      endpoint: {
        url
      }
    };

    this.sendRequest(requestOptions)
      .then(resp => this._handleResponse(resp))
      .catch((() => this._handleError()));
  }
}
window.customElements.define('get-action-points', GetActionPoints);
