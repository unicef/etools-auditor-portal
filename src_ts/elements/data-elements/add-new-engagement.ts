import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {GenericObject} from '../../types/global.js';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {setEngagementError} from '../../redux/actions/engagement';

@customElement('add-new-engagement')
export class AddNewEngagement extends LitElement {
  @property({type: Object})
  newEngagementData!: GenericObject;

  @property({type: Object})
  errorObject = {};

  @property({type: String})
  endpointName = '';

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('newEngagementData') || changedProperties.has('endpointName')) {
      this._newEngagementChanged(this.newEngagementData, this.endpointName);
    }
  }

  _handleResponse(data) {
    fireEvent(this, 'engagement-created', {success: true, data: data});
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
      getStore().dispatch(setEngagementError(response));
    } else if (status === 413) {
      this.errorObject = {};
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
