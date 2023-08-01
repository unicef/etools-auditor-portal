import {LitElement, PropertyValues, property, customElement} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import findIndex from 'lodash-es/findIndex';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('update-attachments')
export class UpdateAttachments extends LitElement {
  @property({type: String})
  requestData!: string;

  @property({type: Array})
  attachments: any[] = [];

  @property({type: Number})
  baseId!: number;

  @property({type: String})
  endpointName!: string;

  @property({type: Object})
  requestOptions!: GenericObject;

  @property({type: String})
  method!: string;

  @property({type: Object})
  postData!: GenericObject;

  @property({type: Object})
  editedItem!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('requestData')) {
      this._requestDataChanged(this.requestData);
    }
  }

  _requestDataChanged(data = {}) {
    const {method, attachmentData} = data as any;
    if (!method || !attachmentData || !this.baseId) {
      return;
    }

    let url = getEndpoint(this.endpointName, {id: this.baseId}).url;
    if (attachmentData.id) {
      if (url.includes('?')) {
        url = url.substring(0, url.indexOf('?'));
      }
      url += `${attachmentData.id}/`;
    }
    this.postData = JSON.parse(JSON.stringify(attachmentData));
    this.method = method;

    const options = {
      method: method,
      endpoint: {url},
      body: attachmentData
    };

    if (method === 'PATCH' && !!attachmentData.attachment) {
      // file was changed
      this._handleExitingFileWasChanged(attachmentData, url);
    } else {
      sendRequest(options)
        .then((resp) => {
          this._handleResponse(resp);
        })
        .catch((error) => {
          this._handleError(error);
        });
    }
  }

  /**
   * Handle weird behavior on bk, where when you edit and attachment it just duplicates
   * the edited attachment giving it the id of the newly uploaded file
   */
  _handleExitingFileWasChanged(attachmentData: any, url: string) {
    // DELETE currently edited attachment object
    sendRequest({method: 'DELETE', endpoint: {url}})
      .then(() => {
        // POST to create new attachment object
        url = url.replace(`${attachmentData.id}/`, '');
        delete attachmentData.id;
        attachmentData.file_type = this.editedItem.file_type;
        const options = {
          method: 'POST',
          endpoint: {url},
          body: attachmentData
        };
        this.method = 'POST';
        sendRequest(options)
          .then((resp) => {
            this._handleChangedFileResponse(resp);
          })
          .catch((error) => {
            this._handleError(error);
          });
      })
      .catch((error) => {
        this._handleError(error);
      });
  }

  _handleResponse(detail) {
    this._updateAttachmentsList(detail);
    fireEvent(this, 'attachments-request-completed', {success: true, data: this.attachments});
  }

  _handleChangedFileResponse(response) {
    this._updateAttachmentsList(response);
    this.method = 'DELETE';
    this._updateAttachmentsList(response);
    fireEvent(this, 'attachments-request-completed', {success: true, data: this.attachments});
  }

  _updateAttachmentsList(detail) {
    const wasDeleteRequest = this.method === 'DELETE';
    const id = wasDeleteRequest ? this.postData.id : detail.id;
    const index = findIndex(this.attachments, (item: any) => item.id === id);

    if (wasDeleteRequest && ~index) {
      this.attachments.splice(index, 1);
    } else if (~index) {
      this.attachments.splice(index, 1, detail);
    } else if (!wasDeleteRequest) {
      this.attachments.push(detail);
    }
  }

  _handleError(error) {
    let {response} = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    fireEvent(this, 'attachments-request-error', {data: response});
  }
}
