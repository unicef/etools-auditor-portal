import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';
import findIndex from 'lodash-es/findIndex';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {GenericObject} from '../../types/global';

class UpdateAttachments extends EtoolsAjaxRequestMixin(PolymerElement) {

  @property({type: String, observer: '_requestDataChanged'})
  requestData!: string;

  @property({type: Array, notify: true})
  attachments!: [];

  @property({type: Object, notify: true})
  errors!: GenericObject;

  @property({type: Number})
  baseId!: number;

  @property({type: String})
  endpointName!: string;

  @property({type: Object, notify: true})
  requestOptions!: GenericObject;

  @property({type: String})
  method!: string;

  @property({type: Object})
  postData!: GenericObject;

  @property({type: Object})
  editedItem!: GenericObject;

  _requestDataChanged(data = {}) {
    const {method, attachmentData} = data as any;
    if (!method || !attachmentData || !this.baseId) {
      return;
    }

    let url = getEndpoint(this.endpointName, {id: this.baseId}).url;
    if (attachmentData.id) {
      url += `${attachmentData.id}/`;
    }
    this.postData = JSON.parse(JSON.stringify(attachmentData));
    this.method = method;

    const options = {
      method: method,
      endpoint: {url},
      body: attachmentData
    };

    if (method === 'PATCH' && !!(attachmentData.attachment)) {// file was changed
      this._handleExitingFileWasChanged(attachmentData, url);
    } else {
      this.sendRequest(options)
        .then((resp) => {
          this._handleResponse(resp);
        }).catch((error) => {
          this._handleError(error);
        });
    }
  }

  /**
    * Handle weird behavior on bk, where when you edit and attachment it just duplicates
    * the edited attachment giving it the id of the newly uploaded file
    */
  _handleExitingFileWasChanged(attachmentData: any, url: string) {
    //DELETE currently edited attachment object
    this.sendRequest({method: 'DELETE', endpoint: {url}})
      .then(() => {
        //POST to create new attachment object
        url = url.replace(`${attachmentData.id}/`, '');
        delete attachmentData.id;
        attachmentData.file_type = this.editedItem.file_type;
        let options = {
          method: 'POST',
          endpoint: {url},
          body: attachmentData
        }
        this.method = 'POST';
        this.sendRequest(options)
          .then((resp) => {
            this._handleChangedFileResponse(resp);
          }).catch((error) => {
            this._handleError(error);
          });
      })
      .catch((error) => {
        this._handleError(error);
      });

  }

  _handleResponse(detail) {
    this._updateAttachmentsList(detail);
    fireEvent(this, 'attachments-request-completed', {success: true});
  }

  _handleChangedFileResponse(response) {
    this._updateAttachmentsList(response);
    this.method = 'DELETE';
    this._updateAttachmentsList(response);
    fireEvent(this, 'attachments-request-completed', {success: true});
  }

  _updateAttachmentsList(detail) {
    const wasDeleteRequest = this.method === 'DELETE';
    const id = wasDeleteRequest ? this.postData.id : detail.id;
    const index = findIndex(this.attachments, (item: any) => item.id === id);

    if (wasDeleteRequest && ~index) {
      this.splice('attachments', index, 1);
    } else if (~index) {
      this.splice('attachments', index, 1, detail);
    } else if (!wasDeleteRequest) {
      this.push('attachments', detail);
    }
  }

  _handleError(error) {
    let {status, response} = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    this.set('errors', response);
    fireEvent(this, 'attachments-request-completed', {success: false});
  }
}
window.customElements.define('update-attachments', UpdateAttachments);
