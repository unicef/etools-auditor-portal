import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-button/paper-button';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import '@unicef-polymer/etools-upload/etools-upload';

import {sharedStyles} from '../../styles/shared-styles';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../styles/tab-layout-styles';
import {moduleStyles} from '../../styles/module-styles';
import {fileAttachmentsTabStyles} from './file-attachments-tab-styles';
import '../../data-elements/get-attachments';
import '../../data-elements/update-attachments';
import '../list-tab-elements/list-header/list-header';
import '../list-tab-elements/list-element/list-element';
import '../simple-list-item/simple-list-item';
import '../share-documents/share-documents';
import DateMixin from '../../mixins/date-mixin';
import {getUserData} from '../../mixins/user-controller';
import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';

import get from 'lodash-es/get';
import clone from 'lodash-es/clone';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../../config/endpoints-controller';
import uniqBy from 'lodash-es/uniqBy';
import pickBy from 'lodash-es/pickBy';
import isEmpty from 'lodash-es/isEmpty';
import {getChoices, collectionExists, getFieldAttribute} from '../../mixins/permission-controller';
import famEndpoints from '../../config/endpoints';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown';
import {ShareDocumentsEl} from '../share-documents/share-documents';
import {EtoolsUpload} from '@unicef-polymer/etools-upload/etools-upload';
import {checkNonField, refactorErrorObject} from '../../mixins/error-handler';
import {EtoolsRequestEndpoint, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * @customElement
 * @polymer
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin DateMixin
 */
class FileAttachmentsTab extends CommonMethodsMixin(TableElementsMixin(EngagementMixin(DateMixin(PolymerElement)))) {
  static get template() {
    // language=HTML
    return html`
      <style include="iron-flex">
        .padd-top {
          padding-top: 26px;
        }
      </style>
      ${sharedStyles} ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles} ${fileAttachmentsTabStyles}
      <get-attachments base-id="[[baseId]]" attachments="{{dataItems}}" endpoint-name="[[endpointName]]">
      </get-attachments>

      <update-attachments
        base-id="[[baseId]]"
        attachments="{{dataItems}}"
        request-data="{{requestData}}"
        endpoint-name="[[endpointName]]"
        request-in-process="{{requestInProcess}}"
        edited-item="[[editedItem]]"
        errors="{{errors}}"
      >
      </update-attachments>

      <etools-content-panel class="content-section clearfix" panel-title="[[tabTitle]]" list>
        <div slot="panel-btns">
          <div class="layout horizontal">
            <div hidden$="[[_hideShare]]">
              <paper-icon-button class="panel-button" on-tap="_openShareDialog" icon="open-in-browser">
              </paper-icon-button>
              <paper-tooltip offset="0">Share Documents</paper-tooltip>
            </div>
            <div hidden$="[[hideAddAttachments]]">
              <paper-icon-button class="panel-button" on-tap="_openAddDialog" icon="add-box"> </paper-icon-button>
              <paper-tooltip offset="0">Add</paper-tooltip>
            </div>
          </div>
        </div>
        <list-header
          id="list-header"
          no-additional
          no-ordered
          data="[[headings]]"
          base-permission-path="[[basePermissionPath]]"
        >
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <simple-list-item>
            <div class="row-data">
              <span class$="[[_getClassFor('date')]]">[[prettyDate(item.created)]]</span>
              <span class$="[[_getClassFor('documentType')]]">[[_getAttachmentType(item)]]</span>
              <div class$="[[_getClassFor('document')]]">
                <div class="wrap-text">
                  <iron-icon icon="icons:attachment" class="download-icon"> </iron-icon>
                  <a
                    href$="[[item.attachment]]"
                    class="truncate"
                    title$="[[getFileNameFromURL(item.attachment)]]"
                    target="_blank"
                    >[[getFileNameFromURL(item.attachment)]]
                  </a>
                </div>
              </div>
              <span class="delete-icon" hidden$="[[isTabReadonly]]">
                <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>

                <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"></paper-icon-button>
              </span>
              <span>FAM</span>
            </div>
          </simple-list-item>
        </template>

        <template is="dom-if" if="[[!isReportTab]]">
          <template is="dom-repeat" items="[[linkedAttachments]]" as="linkedAttachment">
            <simple-list-item>
              <div class="row-data">
                <span class$="[[_getClassFor('date')]]">[[prettyDate(linkedAttachment.created)]]</span>
                <span class$="[[_getClassFor('documentType')]]">[[linkedAttachment.file_type]]</span>
                <div class$="[[_getClassFor('document')]]">
                  <div class="wrap-text">
                    <iron-icon icon="icons:attachment" class="download-icon"> </iron-icon>
                    <a
                      href$="[[linkedAttachment.url]]"
                      title$="[[linkedAttachment.filename]]"
                      class="truncate"
                      target="_blank"
                      >[[linkedAttachment.filename]]
                    </a>
                  </div>
                </div>
                <a on-click="_openDeleteLinkDialog" class="delete-icon">
                  <iron-icon hidden$="[[isTabReadonly]]" icon="icons:cancel"></iron-icon>

                  <paper-tooltip offset="0">Remove</paper-tooltip>
                </a>
                <span>PMP</span>
              </div>
            </simple-list-item>
          </template>
        </template>

        <template is="dom-if" if="[[_showEmptyRow(dataItems.length, linkedAttachments.length)]]">
          <list-element class="list-element" no-additional data="[[emptyObj]]" headings="[[headings]]"> </list-element>
        </template>
        <div class="row" hidden$="[[!_isNewEngagement(baseId)]]">
          You can add attachments after you create the engagement.
        </div>
      </etools-content-panel>

      <etools-dialog
        theme="confirmation"
        size="md"
        opened="[[confirmDialogOpened]]"
        on-close="_deleteAttachment"
        ok-btn-text="Delete"
      >
        Are you sure you want to delete this attachment?
      </etools-dialog>

      <etools-dialog
        id="attachDoc"
        no-padding
        keep-dialog-open
        size="md"
        opened="[[dialogOpened]]"
        dialog-title="[[dialogTitle]]"
        ok-btn-text="[[confirmBtnText]]"
        show-spinner="[[_showDialogSpinner(requestInProcess, uploadInProgress)]]"
        disable-confirm-btn="{{requestInProcess}}"
        on-confirm-btn-clicked="_saveAttachment"
        openFlag="dialogOpened"
        on-close="_resetDialogOpenedFlag"
      >
        <div class="repeatable-item-container" without-line>
          <div class="repeatable-item-content row-h">
            <template is="dom-if" if="[[showFileTypes(basePermissionPath)]]">
              <div class="row-h group">
                <div class="input-container input-container-ms">
                  <etools-dropdown
                    id="fileType"
                    class$="validate-input [[_setRequired('file_type', basePermissionPath)]]"
                    selected="{{editedItem.file_type}}"
                    label="[[getLabel('file_type', basePermissionPath)]]"
                    placeholder="[[getPlaceholderText('file_type', basePermissionPath)]]"
                    options="[[fileTypes]]"
                    option-label="display_name"
                    option-value="value"
                    required$="[[_setRequired('file_type', basePermissionPath)]]"
                    disabled$="[[requestInProcess]]"
                    invalid="{{errors.file_type}}"
                    error-message="{{errors.file_type}}"
                    on-focus="_resetFieldError"
                    on-tap="_resetFieldError"
                    hide-search
                    disable-on-focus-handling
                  >
                  </etools-dropdown>
                </div>
              </div>
            </template>

            <div class="row-h group padd-top">
              <etools-upload
                label="[[uploadLabel]]"
                file-url="[[editedItem.attachment]]"
                upload-endpoint="[[uploadEndpoint]]"
                on-upload-started="_onUploadStarted"
                on-upload-finished="_attachmentUploadFinished"
                invalid="[[errors.file]]"
                error-message="[[errors.file]]"
                show-delete-btn="[[showDeleteBtn]]"
                current-attachment-id="[[editedItem.id]]"
                required
              >
                <!-- Here editedItem.id is the same as the uploaded attachment id -->
              </etools-upload>
            </div>
          </div>
        </div>
      </etools-dialog>

      <etools-dialog
        id="deleteLinks"
        theme="confirmation"
        size="md"
        link-id$="[[linkToDeleteId]]"
        opened="[[deleteLinkOpened]]"
        on-close="_removeLink"
        ok-btn-text="Delete"
        cancel-btn-text="Cancel"
      >
        Are you sure you want to delete the shared document?
      </etools-dialog>

      <template is="dom-if" if="[[_isUnicefUser]]">
        <etools-dialog
          no-padding
          keep-dialog-open
          size="lg"
          opened="[[shareDialogOpened]]"
          dialog-title="Share Documents"
          id="share-documents"
          ok-btn-text="Share"
          on-confirm-btn-clicked="_SendShareRequest"
          openFlag="shareDialogOpened"
          on-close="_resetDialogOpenedFlag"
          show-spinner="[[_showDialogSpinner(requestInProcess, uploadInProgress)]]"
          disable-confirm-btn="{{requestInProcess}}"
        >
          <share-documents
            id="shareDocuments"
            data-base-path="[[dataBasePath]]"
            base-permission-path="[[basePermissionPath]]"
            partner-name="[[engagement.partner.name]]"
            share-params="{{shareParams}}"
            confirm-disabled="{{confirmDisabled}}"
          >
          </share-documents>
        </etools-dialog>
      </template>
    `;
  }

  @property({type: String})
  basePermissionPath = '';

  @property({type: String}) // ex. engagement_57
  dataBasePath = '';

  @property({type: String})
  pathPostfix = '';

  @property({type: Number})
  baseId = 0;

  @property({type: Object})
  itemModel: GenericObject = {
    attachment: null,
    file_type: null,
    id: null
  };

  @property({type: Array, notify: true})
  headings: GenericObject[] = [
    {
      size: 18,
      name: 'date',
      label: 'Date Uploaded!',
      labelPath: `created`,
      path: 'created'
    },
    {
      size: 30,
      name: 'documentType',
      label: 'Document Type!',
      labelPath: `file_type`,
      path: 'display_name'
    },
    {
      size: 30,
      name: 'document',
      label: 'File Attachment!',
      labelPath: `file`,
      property: 'filename',
      custom: true,
      doNotHide: false
    },
    {
      size: 12,
      label: 'Source',
      labelPath: 'tpm_activities.date',
      path: 'source'
    }
  ];

  @property({type: Object})
  ENGAGEMENT_TYPE_ENDPOINT_MAP: GenericObject = {
    'micro-assessments': 'micro-assessment',
    'spot-checks': 'spot-check',
    'staff-spot-checks': 'spot-check',
    audits: 'audit',
    'special-audits': 'special-audit'
  };

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: Object})
  engagement: GenericObject = {};

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
  shareDialogOpened = false;

  @property({type: Object})
  shareParams: GenericObject = {};

  @property({type: Object})
  auditLinksOptions: EtoolsRequestEndpoint = {url: ''};

  @property({type: Array, notify: true})
  linkedAttachments: any[] = [];

  @property({type: Array})
  fileTypes: {value: string; display_name: string}[] = [];

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this attachment?';

  @property({type: String})
  errorProperty = '';

  @property({type: Boolean})
  isReportTab = false;

  @property({type: Boolean, computed: '_shouldHideShare(_isUnicefUser, baseId)'})
  _hideShare = false;

  @property({type: Boolean, computed: '_checkIsUnicefUser(dataBasePath)'})
  _isUnicefUser = false;

  @property({type: String, reflectToAttribute: true})
  endpointName!: string;

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

  static get observers() {
    return [
      '_setBasePath(dataBasePath, pathPostfix)',
      '_resetDialog(dialogOpened)',
      'filesTabErrorHandler(errorObject)',
      'updateStyles(requestInProcess, editedItem, basePermissionPath)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._requestCompleted = this._requestCompleted.bind(this);
    this.addEventListener('attachments-request-completed', this._requestCompleted as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('attachments-request-completed', this._requestCompleted as any);
  }

  _showDialogSpinner(requestInProcess: boolean, uploadInProgress: boolean) {
    // When the upload is in progress do not show the dialog spinner
    if (uploadInProgress) {
      return false;
    }
    return requestInProcess;
  }

  _checkIsUnicefUser() {
    const user = getUserData();
    return Boolean(user.groups.find(({name}) => name === 'UNICEF User'));
  }

  _hanldeLinksForEngagement() {
    this._setLinksEndpoint();
    this._getLinkedAttachments();
  }

  _setLinksEndpoint() {
    const currEngagement = this.getCurrentEngagement();
    if (!currEngagement || !Object.keys(currEngagement).length) {
      return;
    }
    const {details: engagement, type: engagementType} = currEngagement;
    this.set('engagement', engagement);
    this.set(
      'auditLinksOptions',
      getEndpoint('auditLinks', {
        type: this.ENGAGEMENT_TYPE_ENDPOINT_MAP[engagementType!],
        id: engagement!.id
      })
    );
  }

  _getLinkedAttachments() {
    this.set('requestInProcess', true);
    const options = Object.assign({endpoint: this.auditLinksOptions}, {method: 'GET'});
    sendRequest(options)
      .then((res) => {
        this.set('linkedAttachments', uniqBy(res, 'attachment'));
        this.set('requestInProcess', false);
      })
      .catch(this.filesTabErrorHandler.bind(this));
  }

  _setBasePath(dataBase, pathPostfix) {
    this._handleLinksInDetailsView(dataBase);
    const base = dataBase && pathPostfix ? `${dataBase}_${pathPostfix}` : '';
    this.set('basePermissionPath', base);
    if (base) {
      const title = getFieldAttribute(base, 'title');
      this.set('tabTitle', title);
      this.fileTypes = getChoices(`${base}.file_type`);
    }
    this.setReadOnly();
  }

  _handleLinksInDetailsView(dataBase) {
    if (!dataBase) {
      // null check
      dataBase = '';
    }
    const isEngagementDetailsView = !dataBase.includes('new');
    if (isEngagementDetailsView && !this.isReportTab) {
      this._hanldeLinksForEngagement();
    }
  }

  setReadOnly() {
    this.isTabReadonly =
      !this.basePermissionPath ||
      (!collectionExists(`${this.basePermissionPath}.PUT`) && !collectionExists(`${this.basePermissionPath}.POST`));
    this.hideAddAttachments = this.isTabReadonly || this._isNewEngagement();
  }

  showFileTypes(basePath) {
    return !!basePath && collectionExists(`${basePath}.file_type`, 'GET');
  }

  _resetDialog(dialogOpened) {
    if (!dialogOpened) {
      this.originalEditedObj = null;
    }
    const etoolUpload = this.shadowRoot!.querySelector('etools-upload') as EtoolsUpload;
    etoolUpload.invalid = false;
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

  _openFileChooser() {
    const elem = this.shadowRoot!.querySelector('#fileInput');
    if (elem && document.createEvent) {
      const evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, false);
      elem.dispatchEvent(evt);
      this.set('errors.file', '');
    }
  }

  _onUploadStarted() {
    this.setProperties({
      requestInProcess: true,
      uploadInProgress: true
    });
  }

  _attachmentUploadFinished(e) {
    this.setProperties({
      requestInProcess: false,
      uploadInProgress: false
    });
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.set('editedItem.attachment', uploadResponse.id);
      this.set('editedItem.filename', uploadResponse.filename);
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
    if (!this.baseId) {
      // function does not exists
      // this._processDelayedRequest();
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
    return this.fileTypes.find((f) => f.value === attachment.file_type)!.display_name;
  }

  _requestCompleted(event, detail) {
    detail = detail || event.detail;
    this.requestInProcess = false;
    if (detail.success) {
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
      this.set('errors.file', 'File already selected');
      return true;
    }

    this.set('errors.file', '');
    return false;
  }

  validate() {
    let valid = true;

    valid = this._validateFileType();

    if (this.addDialog && this._fileAlreadySelected()) {
      valid = false;
    }

    if (this.addDialog && !this.editedItem.attachment) {
      this.set('errors.file', 'File is not selected');
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
        this.set('errors.file_type', 'File types are not defined');
        valid = false;
      } else {
        this.set('errors.file_type', false);
      }

      if (!dropdown.validate()) {
        this.set('errors.file_type', 'This field is required');
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
      this.set('errors', refactoredData[0]);
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
    this.set('dataItems', []);
  }

  _openShareDialog() {
    this.shareDialogOpened = true;
    const shareModal = this.shadowRoot!.querySelector('#shareDocuments') as ShareDocumentsEl;
    shareModal.updateShareParams();
  }

  _SendShareRequest() {
    const {attachments} = this.shareParams;
    const options = Object.assign(
      {endpoint: this.auditLinksOptions},
      {
        csrf: true,
        body: {attachments},
        method: 'POST'
      }
    );
    this.set('requestInProcess', true);
    sendRequest(options)
      .then(() => {
        fireEvent(this, 'toast', {
          text: 'Documents shared successfully.'
        });

        this.set('requestInProcess', false);
        this.set('shareDialogOpened', false);
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

    this.set('requestInProcess', false);
    this.set('shareDialogOpened', false);
    this._getLinkedAttachments(); // refresh the list
  }

  _getClassFor(field) {
    return `w${this.headings.find((heading) => heading.name === field)!.size}`;
  }

  _openDeleteLinkDialog(e) {
    const {linkedAttachment} = e.model;
    this.set('linkToDeleteId', linkedAttachment.id);
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

  // @ts-ignore
  _shouldHideShare(isUnicefUser, _baseId) {
    return this.isReportTab || !isUnicefUser || this._isNewEngagement();
  }

  _isNewEngagement() {
    return !this.baseId;
  }

  _showEmptyRow(length1, length2) {
    return !length1 && !length2 && !this._isNewEngagement();
  }
}

window.customElements.define('file-attachments-tab', FileAttachmentsTab);

export {FileAttachmentsTab as FileAttachmentsTabEl};
