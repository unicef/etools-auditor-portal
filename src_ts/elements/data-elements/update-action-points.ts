import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import findIndex from 'lodash-es/findIndex';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getEndpoint} from '../app-config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

class UpdateActionPoints extends PolymerElement {

  @property({type: String, observer: '_dataChanged'})
  requestData!: string;

  @property({type: Array, notify: true})
  actionPoints!: [];

  @property({type: Boolean, notify: true})
  requestInProcess!: boolean;

  @property({type: Object, notify: true})
  errors!: {};

  @property({type: Number})
  engagementId!: number;

  _dataChanged(data = {}) {
    const {method, apData, complete} = data as any;
    if (!method || !apData) {
      return;
    }

    const apBaseUrl = getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url;
    let url = `${apBaseUrl}action-points/`;

    if (apData.id) {url += `${apData.id}/`;}
    if (complete) {url += 'complete/';}

    this._sendUpdateRequest(url, apData, method);
  }

  _sendUpdateRequest(url, body, method) {
    const requestOptions = {
      method: method,
      endpoint: {
        url
      },
      body
    };

    sendRequest(requestOptions)
      .then(resp => this._handleResponse(resp))
      .catch(err => this._handleError(err));
  }

  _handleResponse(detail) {
    const index = findIndex(this.actionPoints, (item: any) => item.id === detail.id);

    if (~index) {
      this.splice('actionPoints', index, 1, detail);
    } else {
      this.push('actionPoints', detail);
    }

    fireEvent(this, 'ap-request-completed', {success: true});
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

    this.set('errors', response);
    fireEvent(this, 'ap-request-completed');
  }

}
window.customElements.define('update-action-points', UpdateActionPoints);
