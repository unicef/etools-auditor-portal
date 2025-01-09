import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import findIndex from 'lodash-es/findIndex';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {GenericObject} from '../../types/global.js';

/**
 * @customElement
 */
@customElement('update-action-points')
export class UpdateActionPoints extends LitElement {
  @property({type: String})
  requestData!: string;

  @property({type: Array})
  actionPoints!: any[];

  @property({type: Object})
  errors!: GenericObject;

  @property({type: Number})
  engagementId!: number;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('requestData')) {
      this._dataChanged(this.requestData);
    }
  }

  _dataChanged(data = {}) {
    const {method, apData, complete} = data as any;
    if (!method || !apData) {
      return;
    }

    const apBaseUrl = getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url;
    let url = `${apBaseUrl}action-points/`;

    if (apData.id) {
      url += `${apData.id}/`;
    }
    if (complete) {
      url += 'complete/';
    }

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
      .then((resp) => this._handleResponse(resp))
      .catch((err) => this._handleError(err));
  }

  _handleResponse(detail) {
    const index = findIndex(this.actionPoints, (item: any) => item.id === detail.id);

    if (~index) {
      this.actionPoints.splice(index, 1, detail);
    } else {
      this.actionPoints.push(detail);
    }

    fireEvent(this, 'ap-request-completed', {success: true, data: this.actionPoints});
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

    this.errors = response;
    fireEvent(this, 'ap-request-completed', {success: false, errors: this.errors});
  }
}
