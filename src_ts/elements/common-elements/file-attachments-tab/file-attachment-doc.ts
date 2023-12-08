import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../styles/tab-layout-styles';
import {moduleStyles} from '../../styles/module-styles';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {fileAttachmentsTabStyles} from './file-attachments-tab-styles';
import {_showDialogSpinner} from '../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-types';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import get from 'lodash-es/get';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isEmpty from 'lodash-es/isEmpty';
import pickBy from 'lodash-es/pickBy';
import famEndpoints from '../../config/endpoints';

@customElement('file-attachment-doc')
export class FileAttachmentDoc extends TableElementsMixin(CommonMethodsMixin(LitElement)) {
  static get styles() {
    return [moduleStyles, tabLayoutStyles, tabInputsStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles} ${fileAttachmentsTabStyles}
      <etools-dialog
        id="attachDoc"
        no-padding
        keep-dialog-open
        size="md"
        keep-dialog-open
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${_showDialogSpinner(this.requestInProcess, this.uploadInProgress)}"
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._saveAttachment}"
        @close="${this._onClose}"
      >
        <div class="container">
          ${this.showFileTypes(this.optionsData)
            ? html` <div class="layout-horizontal row-padding-v">
                <div class="col col-6">
                  <etools-dropdown
                    id="fileType"
                    class="validate-input ${this._setRequired('file_type', this.optionsData)}"
                    .selected="${this.editedItem.file_type}"
                    label="${this.getLabel('file_type', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('file_type', this.optionsData)}"
                    .options="${this.fileTypes || []}"
                    option-label="display_name"
                    option-value="value"
                    ?required="${this._setRequired('file_type', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.file_type}"
                    .errorMessage="${this.errors.file_type}"
                    trigger-value-change-event
                    @etools-selected-item-changed="${({detail}: CustomEvent) => {
                      this.editedItem.file_type = detail.selectedItem ? detail.selectedItem.value : null;
                    }}"
                    @focus="${this._resetFieldError}"
                    hide-search
                    disable-on-focus-handling
                  >
                  </etools-dropdown>
                </div>
              </div>`
            : ``}

          <div class="layout-horizontal row-padding-v">
            <etools-upload
              label="Upload File"
              .fileUrl="${this.editedItem.attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              @upload-started="${this._onUploadStarted}"
              @upload-finished="${this._attachmentUploadFinished}"
              ?invalid="${this.errors.file}"
              .errorMessage="${this.errors.file}"
              .showDeleteBtn="${this.showDeleteBtn}"
              .currentAttachmentId="${this.editedItem.id}"
              required
            >
              <!-- Here editedItem.id is the same as the uploaded attachment id -->
            </etools-upload>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  fileTypes: {value: string; display_name: string}[] = [];

  @property({type: String})
  uploadEndpoint: string = famEndpoints.attachmentsUpload.url;

  @property({type: Boolean})
  showDeleteBtn = false;

  @property({type: Boolean})
  uploadInProgress = false;

  set dialogData(data: any) {
    const {fileTypes, optionsData, editedItem, dialogTitle, confirmBtnText, originalEditedObj}: any = data;

    this.fileTypes = fileTypes;
    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.confirmBtnText = confirmBtnText;
    this.originalEditedObj = originalEditedObj;
  }

  showFileTypes(options: AnyObject) {
    return !!options && !!get(options, 'actions.GET.file_type');
  }

  _saveAttachment() {
    if (!this.validate()) {
      return;
    }

    this.requestInProcess = true;

    let attachmentData = this._getFileData();
    const method = attachmentData.id ? 'PATCH' : 'POST';

    let confirmed = true;
    attachmentData = method === 'PATCH' ? this._getChanges(attachmentData) : attachmentData;
    if (!attachmentData) {
      confirmed = false;
    }
    fireEvent(this, 'dialog-closed', {
      confirmed: confirmed,
      response: {method, attachmentData}
    });
  }

  validate() {
    let valid = true;

    valid = this._validateFileType();

    if (this.addDialog && this._fileAlreadySelected()) {
      valid = false;
    }

    if (this.addDialog && !this.editedItem.attachment) {
      this.errors.file = 'File is not selected';
      this.errors = {...this.errors};
      valid = false;
    }

    return valid;
  }

  _validateFileType() {
    let valid = true;
    const dropdown = this.shadowRoot!.querySelector('#fileType') as EtoolsDropdownEl;

    const fileTypeRequired = dropdown.required;

    if (fileTypeRequired) {
      if (!this.fileTypes || !this.fileTypes.length) {
        this.errors = {...this.errors, file_type: 'File types are not defined'};
        valid = false;
      } else {
        this.errors.file_type = false;
      }

      if (!dropdown.validate()) {
        this.errors = {...this.errors, file_type: 'This field is required'};
        valid = false;
      }
    }

    return valid;
  }

  _onUploadStarted() {
    this.requestInProcess = true;
    this.uploadInProgress = true;
  }

  _attachmentUploadFinished(e) {
    this.requestInProcess = false;
    this.uploadInProgress = false;

    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.editedItem.attachment = uploadResponse.id;
      this.editedItem.filename = uploadResponse.filename;
    } else if (e.detail.error && e.detail.error.error) {
      fireEvent(this, 'toast', {text: e.detail.error.error.message});
    }
  }

  _getChanges(attachmentData) {
    const original = this.originalEditedObj && this._getFileData(this.originalEditedObj);
    if (!original) {
      return attachmentData;
    }

    const data = pickBy(attachmentData, (value, key) => original[key] !== value);
    if (data.attachment && this._fileAlreadySelected()) {
      delete data.attachment;
    }

    if (isEmpty(data)) {
      return null;
    } else {
      data.id = attachmentData.id;
      return data;
    }
  }

  _fileAlreadySelected() {
    if (!this.dataItems) {
      return false;
    }

    const alreadySelectedIndex = this.dataItems.findIndex((item) => {
      return this.getFileNameFromURL(item.attachment) === this.editedItem.filename;
    });

    if (alreadySelectedIndex !== -1) {
      this.errors = {...this.errors, file: 'File already selected'};
      return true;
    }

    this.errors = {...this.errors, file: ''};
    return false;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
