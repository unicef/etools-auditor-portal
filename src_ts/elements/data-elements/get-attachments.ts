import {LitElement, PropertyValues, property, customElement} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('get-attachments')
export class GetAttachments extends LitElement {
  @property({type: Number})
  baseId!: number;

  @property({type: String})
  endpointName!: string;

  @property({type: Array})
  attachments!: [];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('baseId') || changedProperties.has('endpointName')) {
      this._baseIdChanged(this.baseId);
    }
  }

  _handleResponse(detail) {
    this.attachments = detail || [];
    fireEvent(this, 'attachments-loaded', this.attachments);
  }

  _handleError() {
    fireEvent(this, 'attachments-loaded');
  }

  _baseIdChanged(baseId) {
    if (!baseId || !this.endpointName) {
      return;
    }
    const url = getEndpoint(this.endpointName, {id: baseId}).url;

    sendRequest({
      endpoint: {url}
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch(() => {
        this._handleError();
      });
  }
}
