import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../styles/tab-layout-styles';
import {moduleStyles} from '../../styles/module-styles';
import {fileAttachmentsTabStyles} from './file-attachments-tab-styles';
import '../../data-elements/get-attachments';
import '../../data-elements/update-attachments';
import '../share-documents/share-documents';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import DateMixin from '../../mixins/date-mixin';

import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {GenericObject} from '../../../types/global';

import get from 'lodash-es/get';
import clone from 'lodash-es/clone';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../../config/endpoints-controller';
import uniqBy from 'lodash-es/uniqBy';
import pickBy from 'lodash-es/pickBy';
import isEmpty from 'lodash-es/isEmpty';
import {getHeadingLabel, getOptionsChoices, isValidCollection} from '../../mixins/permission-controller';
import famEndpoints from '../../config/endpoints';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {ShareDocuments} from '../share-documents/share-documents';
import {checkNonField, refactorErrorObject} from '../../mixins/error-handler';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
/**
 * @customElement
 * @LitElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin DateMixin
 */

@customElement('file-attachments-tab')
export class FileAttachmentsTab extends CommonMethodsMixin(TableElementsMixin(EngagementMixin(DateMixin(LitElement)))) {
  static get styles() {
    return [moduleStyles, tabLayoutStyles, tabInputsStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles} ${fileAttachmentsTabStyles}
      <style>
        ${dataTableStylesLit} .padd-top {
          padding-top: 26px;
        }
        etools-icon-button {
          --iron-icon-fill-color: #ffffff;
        }
        etools-icon-button[name='add-box'] {
          margin-inline-start: 0px;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          height: 48px;
        }
      </style>
      <get-attachments
        .baseId="${this.engagement?.id}"
        .attachments="${this.dataItems}"
        @attachments-loaded="${(e) => {
          this.dataItems = e.detail;
        }}"
        .endpointName="${this.endpointName}"
      >
      </get-attachments>

      <update-attachments
        .baseId="${this.engagement?.id}"
        .attachments="${this.dataItems}"
        .requestData="${this.requestData}"
        .endpointName="${this.endpointName}"
        .editedItem="${this.editedItem}"
        @attachments-request-completed="${(e) => {
          this.dataItems = e.detail.data;
        }}"
        @attachments-request-error="${(e) => (this.errors = e.detail.data)}"
      >
      </update-attachments>

      <etools-content-panel class="content-section clearfix" .panelTitle="${this.tabTitle}" list>
        <div slot="panel-btns">
          <div class="layout-horizontal">
            <div ?hidden="${this._hideShare}">
              <etools-icon-button
                id="share-icon"
                class="panel-button"
                @click="${this._openShareDialog}"
                name="open-in-browser"
              >
              </etools-icon-button>
              <paper-tooltip for="share-icon" offset="0">Share Documents</paper-tooltip>
            </div>
            <div ?hidden="${this.hideAddAttachments}">
              <etools-icon-button id="add-icon" class="panel-button" @click="${this._openAddDialog}" name="add-box">
              </etools-icon-button>
              <paper-tooltip for="add-icon" offset="0">Add</paper-tooltip>
            </div>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-2"
            >${getHeadingLabel(this.optionsData, 'created', 'Created')}</etools-data-table-column
          >
          <etools-data-table-column class="col-2"
            >${getHeadingLabel(this.optionsData, 'file_type', 'Document Type')}</etools-data-table-column
          >
          <etools-data-table-column class="col-5"
            >${getHeadingLabel(this.optionsData, 'file', ' File Attachment')}</etools-data-table-column
          >
          <etools-data-table-column class="col-3 center-align"
            >${getHeadingLabel(this.optionsData, 'tpm_activities.date', 'Source')}</etools-data-table-column
          >
        </etools-data-table-header>
        ${this.dataItems.map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2">${this.prettyDate(String(item.created), '') || '-'}</span>
                <span class="col-data col-2">${this._getAttachmentType(item)}</span>
                <span class="col-data col-5 wrap-text">
                  <etools-icon name="attachment" class="download-icon"> </etools-icon>
                  <a
                    href="${item.attachment}"
                    class="truncate"
                    title="${this.getFileNameFromURL(item.attachment)}"
                    target="_blank"
                    >${this.getFileNameFromURL(item.attachment)}
                  </a>
                </span>
                <span class="col-data col-3 center-align">
                  <span>FAM</span>
                </span>
                <div class="hover-block" ?hidden="${this.isTabReadonly}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        ${this.isReportTab
          ? ``
          : this.linkedAttachments.map(
              (item, _index) => html` <etools-data-table-row no-collapse>
                <div slot="row-data" class="layout-horizontal editable-row">
                  <span class="col-data col-2">${this.prettyDate(String(item.created), '') || '-'}</span>
                  <span class="col-data col-2">${item.file_type}</span>
                  <span class="col-data col-5 wrap-text">
                    <etools-icon name="icons:attachment" class="download-icon"> </etools-icon>
                    <a href="${item.url}" class="truncate" title="${item.filename}" target="_blank"
                      >${item.filename}
                    </a>
                  </span>
                  <span class="col-data col-3 center-align">
                    <span>PMP</span>
                  </span>
                  <div class="hover-block" ?hidden="${this.isTabReadonly}">
                    <etools-icon-button
                      name="cancel"
                      @click="${() => this._openDeleteLinkDialog(item.id)}"
                    ></etools-icon-button>
                  </div>
                </div>
              </etools-data-table-row>`
            )}

        <div class="row-v" ?hidden="${!this._isNewEngagement()}">
          You can add attachments after you create the engagement.
        </div>
        <etools-data-table-row
          no-collapse
          ?hidden="${this._isNewEngagement() || this.dataItems?.length || this.linkedAttachments?.length}"
        >
          <div slot="row-data" class="layout-horizontal editable-row">
            <span class="col-data col-2">–</span>
            <span class="col-data col-2">–</span>
            <span class="col-data col-5">–</span>
            <span class="col-data col-3 center-align">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>

      <etools-dialog
        theme="confirmation"
        size="md"
        .opened="${this.confirmDialogOpened}"
        @close="${this._deleteAttachment}"
        ok-btn-text="Delete"
      >
        Are you sure you want to delete this attachment?
      </etools-dialog>

      <etools-dialog
        id="attachDoc"
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this._showDialogSpinner(this.requestInProcess, this.uploadInProgress)}"
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._saveAttachment}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
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
              label="${this.uploadLabel}"
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

      <etools-dialog
        id="deleteLinks"
        theme="confirmation"
        size="md"
        link-id="${this.linkToDeleteId}"
        .opened="${this.deleteLinkOpened}"
        @close="${this._removeLink}"
        ok-btn-text="Delete"
        cancel-btn-text="Cancel"
      >
        Are you sure you want to delete the shared document?
      </etools-dialog>

      ${this.isUnicefUser
        ? html` <etools-dialog
            no-padding
            keep-dialog-open
            size="lg"
            .opened="${this.shareDialogOpened}"
            dialog-title="Share Documents"
            id="share-documents"
            ok-btn-text="Share"
            @confirm-btn-clicked="${this._SendShareRequest}"
            openFlag="shareDialogOpened"
            @close="${this._resetDialogOpenedFlag}"
            ?show-spinner="${this._showDialogSpinner(this.requestInProcess, this.uploadInProgress)}"
            ?disableConfirmBtn="${this.requestInProcess || !this.shareParams?.attachments?.length}"
          >
            <share-documents
              id="shareDocuments"
              .partnerName="${this.engagement?.partner?.name}"
              .shareParams="${this.shareParams}"
              .optionsData="${this.optionsData}"
              @share-params-changed="${({detail}) => {
                this.shareParams = detail;
              }}"
            >
            </share-documents>
          </etools-dialog>`
        : ``}
    `;
  }

  @property({type: String})
  linkToDeleteId = '';

  @property({type: Object})
  itemModel: GenericObject = {
    attachment: null,
    file_type: null,
    id: null
  };

  @property({type: Object})
  ENGAGEMENT_TYPE_ENDPOINT_MAP: GenericObject = {
    'micro-assessments': 'micro-assessment',
    ma: 'micro-assessment',
    'spot-checks': 'spot-check',
    'staff-spot-checks': 'spot-check',
    sc: 'spot-check',
    audit: 'audit',
    'special-audits': 'special-audit',
    sa: 'special-audit'
  };

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Attach File',
    confirmBtn: 'Attach'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Attachment',
    confirmBtn: 'Edit'
  };

  @property({type: String})
  uploadLabel = 'Upload File';

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  shareDialogOpened = false;

  @property({type: Object})
  shareParams: GenericObject = {};

  @property({type: Object})
  auditLinksOptions: EtoolsRequestEndpoint = {url: ''};

  @property({type: Array})
  linkedAttachments: any[] = [];

  @property({type: Array})
  fileTypes: {value: string; display_name: string}[] = [];

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this attachment?';

  @property({type: String, reflect: true, attribute: 'error-property'})
  errorProperty = '';

  @property({type: Boolean, attribute: 'is-report-tab'})
  isReportTab = false;

  @property({type: Boolean})
  _hideShare = false;

  @property({type: String, reflect: true, attribute: 'endpoint-name'})
  endpointName!: string;

  @property({type: String})
  tabTitle = '';

  @property({type: Object})
  requestData!: GenericObject;

  @property({type: String})
  uploadEndpoint: string = famEndpoints.attachmentsUpload.url;

  @property({type: Boolean})
  showDeleteBtn = false;

  @property({type: Boolean})
  isTabReadonly = true;

  @property({type: Boolean})
  hideAddAttachments = true;

  @property({type: Boolean})
  deleteLinkOpened = false;

  @property({type: Boolean})
  uploadInProgress = false;

  connectedCallback() {
    super.connectedCallback();
    this._requestCompleted = this._requestCompleted.bind(this);
    this.addEventListener('attachments-request-completed', this._requestCompleted as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('attachments-request-completed', this._requestCompleted as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this._onPermissionsLoaded(this.optionsData);
    }
    if (changedProperties.has('engagement')) {
      this._handleLinksInDetailsView(this.engagement);
    }
    if (changedProperties.has('dialogOpened')) {
      this._resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this.filesTabErrorHandler(this.errorObject);
    }
    if (changedProperties.has('isUnicefUser') || changedProperties.has('engagement')) {
      this._shouldHideShare(this.isUnicefUser, this.engagement?.id);
    }
  }

  _showDialogSpinner(requestInProcess: boolean, uploadInProgress: boolean) {
    // When the upload is in progress do not show the dialog spinner
    if (uploadInProgress) {
      return false;
    }
    return requestInProcess;
  }

  _handleLinksForEngagement() {
    this._setLinksEndpoint();
    this._getLinkedAttachments();
  }

  _setLinksEndpoint() {
    this.auditLinksOptions = getEndpoint('auditLinks', {
      type: this.ENGAGEMENT_TYPE_ENDPOINT_MAP[this.engagement.engagement_type!],
      id: this.engagement!.id
    });
  }

  _getLinkedAttachments() {
    this.requestInProcess = true;
    const options = Object.assign({endpoint: this.auditLinksOptions}, {method: 'GET'});
    sendRequest(options)
      .then((res) => {
        this.linkedAttachments = uniqBy(res, 'attachment');
        this.requestInProcess = false;
      })
      .catch(this.filesTabErrorHandler.bind(this));
  }

  _onPermissionsLoaded(optionsData: AnyObject) {
    if (optionsData) {
      const title = get(optionsData, 'name');
      this.tabTitle = title;
      this.fileTypes = getOptionsChoices(optionsData, 'file_type');
      this.setReadOnly();
    }
  }

  _handleLinksInDetailsView(engagement: AnyObject) {
    if (!engagement) {
      return;
    }
    const isEngagementDetailsView = engagement?.id;
    if (isEngagementDetailsView && !this.isReportTab) {
      this._handleLinksForEngagement();
    }
  }

  setReadOnly() {
    this.isTabReadonly =
      !this.optionsData ||
      (!isValidCollection(get(this.optionsData, 'actions.POST')) &&
        !isValidCollection(get(this.optionsData, 'actions.PUT')));
    this.hideAddAttachments = this.isTabReadonly || this._isNewEngagement();
  }

  showFileTypes(options: AnyObject) {
    return !!options && !!get(options, 'actions.GET.file_type');
  }

  _resetDialog(dialogOpened) {
    if (!dialogOpened) {
      this.originalEditedObj = null;
    }
    this.errors = {};
    this.resetDialog(dialogOpened);
  }

  _getFileType(fileType) {
    const length = get(this, 'fileTypes.length');
    if (!length) {
      return;
    }

    const type = this.fileTypes.find((type) => parseInt(type.value, 10) === parseInt(fileType, 10));
    return type || null;
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

  getFileNameFromURL(url: string) {
    if (!url) {
      return '';
    }
    const urlSplit = url.split('?');
    if (urlSplit.length) {
      return urlSplit.shift()!.split('/').pop();
    }
  }

  _saveAttachment() {
    if (!this.validate()) {
      return;
    }

    this.requestInProcess = true;

    let attachmentData = this._getFileData();
    const method = attachmentData.id ? 'PATCH' : 'POST';

    attachmentData = method === 'PATCH' ? this._getChanges(attachmentData) : attachmentData;
    if (!attachmentData) {
      this._requestCompleted(null, {success: true});
      return;
    }
    this.requestData = {method, attachmentData};
  }

  _deleteAttachment(event) {
    this.confirmDialogOpened = false;
    if (this.deleteCanceled(event)) {
      return;
    }
    if (!this.engagement?.id) {
      return;
    }
    this.requestInProcess = true;

    this.requestData = {
      method: 'DELETE',
      attachmentData: {id: this.editedItem.id}
    };
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

  _getFileData(fileData?) {
    if (!this.dialogOpened && !fileData && !this.editedItem) {
      return {};
    }
    const {id, attachment, file_type} = fileData || this.editedItem;
    const data: GenericObject = {attachment};

    if (id) {
      data.id = id;
    }
    data.file_type = file_type;

    return data;
  }

  _getAttachmentType(attachment) {
    const file = (this.fileTypes || []).find((f) => f.value === attachment.file_type);
    return file ? file.display_name : '';
  }

  _requestCompleted(event, detail) {
    detail = detail || event.detail;
    this.requestInProcess = false;
    if (detail?.success) {
      this.dialogOpened = false;
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

  _openAddDialog() {
    this.editedItem = clone(this.itemModel);
    this.openAddDialog();
  }

  filesTabErrorHandler(errorData) {
    const mainProperty = this.errorProperty;
    this.requestInProcess = false;
    if (!errorData || !errorData[mainProperty]) {
      return;
    }
    const refactoredData = refactorErrorObject(errorData[mainProperty]);
    const nonField = checkNonField(errorData[mainProperty]);

    if (this.dialogOpened && typeof refactoredData[0] === 'object') {
      this.errors = refactoredData[0];
    }
    if (typeof errorData[mainProperty] === 'string') {
      fireEvent(this, 'toast', {text: `Attachments: ${errorData[mainProperty]}`});
    }
    if (nonField) {
      fireEvent(this, 'toast', {text: `Attachments: ${nonField}`});
    }

    if (!this.dialogOpened) {
      const filesErrors = this.getFilesErrors(refactoredData);

      filesErrors.forEach((fileError: any) => {
        fireEvent(this, 'toast', {text: `${fileError.fileName}: ${fileError.error}`});
      });
    }
  }

  getFilesErrors(errors) {
    if (this.dataItems instanceof Array && errors instanceof Array && errors.length === this.dataItems.length) {
      const filesErrors: {fileName: string; error: any}[] = [];

      errors.forEach((error, index) => {
        let fileName = this.dataItems[index].filename;
        fileName = this._cutFileName(fileName);

        if (fileName && typeof error.file === 'string') {
          filesErrors.push({
            fileName: fileName,
            error: error.file
          });
        }
      });

      return filesErrors;
    }

    return [];
  }

  _cutFileName(fileName) {
    if (typeof fileName !== 'string') {
      return;
    }

    if (fileName.length <= 20) {
      return fileName;
    } else {
      return fileName.slice(0, 10) + '...' + fileName.slice(-7);
    }
  }

  getFiles() {
    return this.dataItems.map((file) => this._getFileData(file));
  }

  resetData() {
    this.dataItems = [];
  }

  _openShareDialog() {
    this.shareDialogOpened = true;
    const shareModal = this.shadowRoot!.querySelector('#shareDocuments') as ShareDocuments;
    shareModal.updateShareParams();
  }

  _SendShareRequest() {
    const {attachments} = this.shareParams;
    if (!(attachments || []).length) {
      fireEvent(this, 'toast', {
        text: 'Please select Documents to be shared.'
      });
      return;
    }

    const options = Object.assign(
      {endpoint: this.auditLinksOptions},
      {
        csrf: true,
        body: {attachments},
        method: 'POST'
      }
    );
    this.requestInProcess = true;
    sendRequest(options)
      .then(() => {
        fireEvent(this, 'toast', {
          text: 'Documents shared successfully.'
        });

        this.requestInProcess = false;
        this.shareDialogOpened = false;
        this._getLinkedAttachments(); // refresh the list
      })
      .catch(this._handleShareError.bind(this));
  }

  _handleShareError(err) {
    const nonField = checkNonField(err);
    let message;
    if (nonField) {
      message = `Nonfield error: ${nonField}`;
    } else {
      message = err.response && err.response.detail ? `Error: ${err.response.detail}` : 'Error sharing documents.';
    }
    fireEvent(this, 'toast', {
      text: message
    });

    this.requestInProcess = false;
    this.shareDialogOpened = false;
    this._getLinkedAttachments(); // refresh the list
  }

  _openDeleteLinkDialog(id) {
    this.linkToDeleteId = id;
    this.deleteLinkOpened = true;
  }

  _removeLink(event) {
    this.deleteLinkOpened = false;
    if (this.deleteCanceled(event)) {
      return;
    }
    const id = event.currentTarget.getAttribute('link-id');

    sendRequest({
      method: 'DELETE',
      endpoint: getEndpoint('linkAttachment', {id})
    })
      .then(this._getLinkedAttachments.bind(this))
      .catch((err) => this.filesTabErrorHandler(err));
  }

  _shouldHideShare(isUnicefUser, _engagementId) {
    this._hideShare = this.isReportTab || !isUnicefUser || this._isNewEngagement();
  }

  _isNewEngagement() {
    return !this.engagement?.id;
  }

  _showEmptyRow(length1, length2) {
    return !length1 && !length2 && !this._isNewEngagement();
  }
}
