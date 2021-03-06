import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getEndpoint} from '../app-config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {GenericObject} from '../../types/global.js';

class AddNewEngagement extends PolymerElement {
  @property({type: Object})
  newEngagementData!: GenericObject;

  @property({type: Object, notify: true})
  errorObject = {};

  @property({type: String})
  endpointName = '';

  static get observers() {
    return ['_newEngagementChanged(newEngagementData, endpointName)'];
  }

  _handleResponse(data) {
    fireEvent(this, 'engagement-created', {success: true, data});
  }

  _handleError(error) {
    let {status, response} = error;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    if (status === 400) {
      this.set('errorObject', response);
    } else if (status === 413) {
      this.set('errorObject', {});
      fireEvent(this, 'toast', {
        text: `Error: Exceeded the maximum size of uploaded file(s).`
      });
    }

    fireEvent(this, 'engagement-created');
    fireEvent(this, 'global-loading', {type: 'create-engagement'});
  }

  _newEngagementChanged(engagement, endpointName) {
    if (!engagement || !endpointName) {
      return;
    }

    fireEvent(this, 'global-loading', {
      type: 'create-engagement',
      active: true,
      message: 'Creating new engagement...'
    });
    this._makeRequest(endpointName, engagement.data);
  }

  _makeRequest(endpointName: any, postData: any) {
    const options = {
      method: 'POST',
      body: postData,
      endpoint: getEndpoint(endpointName)
    };
    sendRequest(options).then(this._handleResponse.bind(this)).catch(this._handleError.bind(this));
  }
}

window.customElements.define('add-new-engagement', AddNewEngagement);
