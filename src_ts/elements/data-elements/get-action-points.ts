import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * @customElement
 */
@customElement('get-action-points')
export class GetActionPoints extends LitElement {
  @property({type: Number})
  engagementId!: number;

  _handleResponse(data) {
    fireEvent(this, 'ap-loaded', {success: true, data: data || []});
  }

  _handleError() {
    fireEvent(this, 'ap-loaded');
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('engagementId')) {
      this._engagementIdChanged(this.engagementId);
    }
  }

  _engagementIdChanged(engagementId) {
    if (!engagementId) {
      return;
    }
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

    sendRequest(requestOptions)
      .then((resp) => this._handleResponse(resp))
      .catch(() => this._handleError());
  }
}
