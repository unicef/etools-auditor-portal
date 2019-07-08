import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
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

import {sharedStyles} from '../../styles-elements/shared-styles';
import {tabInputsStyles} from '../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../styles-elements/module-styles';
import {fileAttachmentsTabStyles} from './file-attachments-tab-styles';
import '../../data-elements/get-attachments';
import '../../data-elements/update-attachments';
import '../list-tab-elements/list-header/list-header';
import '../list-tab-elements/list-element/list-element';
import '../simple-list-item/simple-list-item';
import '../share-documents/share-documents';
import DateMixin from '../../app-mixins/date-mixin';
import UserControllerMixin from '../../app-mixins/user-controller-mixin';
import EngagementMixin from '../../app-mixins/engagement-mixin';
import ErrorHandlerMixin from '../../app-mixins/error-handler-mixin';
import CommonMethodsMixin from '../../app-mixins/common-methods-mixin';
import TableElementsMixin from '../../app-mixins/table-elements-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';

import get from 'lodash-es/get';
import uniqueId from 'lodash-es/uniqueId';
import clone from 'lodash-es/clone';
import {fireEvent} from "../../utils/fire-custom-event";
import EndpointsMixin from '../../app-config/endpoints-mixin';
import uniqBy from 'lodash-es/uniqBy';
import pickBy from 'lodash-es/pickBy';
import isEmpty from 'lodash-es/isEmpty';

/**
 * @customElement
 * @polymer
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin UserControllerMixin
 * @appliesMixin DateMixin
 */
class FileAttachmentsTab extends EndpointsMixin(
    TableElementsMixin(
      CommonMethodsMixin(
        ErrorHandlerMixin(
         EngagementMixin(
             DateMixin(
              UserControllerMixin(
                EtoolsAjaxRequestMixin(PolymerElement)))))))) {

  static get template() {
    // language=HTML
    return html`
      ${sharedStyles} ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles} ${fileAttachmentsTabStyles}
      <get-attachments base-id="[[baseId]]" attachments="{{dataItems}}"
                       endpoint-name="[[endpointName]]"></get-attachments>
      <update-attachments
          base-id="[[baseId]]"
          attachments="{{dataItems}}"
          request-data="{{requestData}}"
          endpoint-name="[[endpointName]]"
          request-in-process="{{requestInProcess}}"
          errors="{{errors}}"></update-attachments>

      <etools-content-panel class="content-section clearfix" panel-title="[[tabTitle]]">
        <div slot="panel-btns">
          <div class="layout horizontal">
            <div hidden$="[[_hideShare]]">
              <paper-icon-button class="panel-button"
                                 on-tap="_openShareDialog"
                                 icon="open-in-browser">
              </paper-icon-button>
              <paper-tooltip offset="0">Share Documents</paper-tooltip>
            </div>
            <div hidden$="[[_hideAddAttachments(basePermissionPath, baseId)]]">
              <paper-icon-button class="panel-button"
                                 on-tap="_openAddDialog"
                                 icon="add-box">
              </paper-icon-button>
              <paper-tooltip offset="0">Add</paper-tooltip>
            </div>
          </div>

        </div>
        <list-header
            id="list-header"
            no-additional
            no-ordered
            data="[[headings]]"
            base-permission-path="[[basePermissionPath]]">
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <simple-list-item>
            <div class="row-data">
              <span class$="[[_getClassFor('date')]]">[[prettyDate(item.created)]]</span>
              <span class$="[[_getClassFor('documentType')]]">[[_getAttachmentType(item)]]</span>
              <div class$="[[_getClassFor('document')]]">
                <iron-icon icon="icons:attachment"
                           class="download-icon">
                </iron-icon>
                <a href$="[[item.file]]"
                   class="truncate"
                   target="_blank">[[item.filename]]
                </a>
                <paper-tooltip offset="0">[[item.filename]]</paper-tooltip>

              </div>
              <span class="delete-icon" hidden$="[[isTabReadonly(basePermissionPath)]]">
                                        <paper-icon-button icon="icons:create" class="edit-icon"
                                                           on-tap="openEditDialog"></paper-icon-button>

                                        <paper-icon-button icon="icons:delete" class="edit-icon"
                                                           on-tap="openDeleteDialog"></paper-icon-button>
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
                  <iron-icon icon="icons:attachment" class="download-icon">
                  </iron-icon>
                  <a href$="[[linkedAttachment.url]]"
                     class="truncate"
                     target="_blank">[[linkedAttachment.filename]]
                  </a>
                  <paper-tooltip offset="0">[[linkedAttachment.filename]]</paper-tooltip>

                </div>
                <a on-click="_openDeleteLinkDialog"
                   class="delete-icon">
                  <iron-icon
                      hidden$="[[isTabReadonly(basePermissionPath)]]"
                      icon="icons:cancel"></iron-icon>

                  <paper-tooltip offset="0">Remove</paper-tooltip>
                </a>
                <span>PMP</span>
              </div>
            </simple-list-item>
          </template>
        </template>

        <template is="dom-if" if="[[_showEmptyRow(dataItems.length, linkedAttachments.length)]]">
          <list-element
              class="list-element"
              no-additional
              data="[[emptyObj]]"
              headings="[[headings]]">
          </list-element>
        </template>
        <div class="row" hidden$="[[!_isNewEngagement(baseId)]]">
          You can add attachments after you create the engagement.
        </div>

      </etools-content-panel>

      <etools-dialog theme="confirmation" size="md"
                     opened="{{confirmDialogOpened}}"
                     on-close="_deleteAttachment"
                     ok-btn-text="Delete">
        Are you sure you want to delete this attachment?
      </etools-dialog>

      <etools-dialog id="attachDoc" no-padding keep-dialog-open size="md"
                     opened="{{dialogOpened}}"
                     dialog-title="[[dialogTitle]]"
                     ok-btn-text="[[confirmBtnText]]"
                     show-spinner="{{requestInProcess}}"
                     disable-confirm-btn="{{requestInProcess}}"
                     on-confirm-btn-clicked="_saveAttachment">

        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <template is="dom-if" if="[[showFileTypes(basePermissionPath)]]">
              <div class="row-h group">
                <div class="input-container input-container-ms">
                  <etools-dropdown-multi
                      id="fileType"
                      class$="validate-input disabled-as-readonly [[_setRequired('file_type', basePermissionPath)]]"
                      selected-values="{{editedItem.type}}"
                      label="[[getLabel('file_type', basePermissionPath)]]"
                      placeholder="[[getPlaceholderText('file_type', basePermissionPath)]]"
                      options="[[fileTypes]]"
                      option-label="display_name"
                      option-value="value"
                      required$="[[_setRequired('file_type', basePermissionPath)]]"
                      disabled$="[[requestInProcess]]"
                      readonly$="[[requestInProcess]]"
                      invalid="{{errors.file_type}}"
                      error-message="{{errors.file_type}}"
                      on-focus="_resetFieldError"
                      on-tap="_resetFieldError"
                      hide-search>
                  </etools-dropdown-multi>
                </div>
              </div>
            </template>

            <div class="row-h group">
              <div class="input-container input-container-ms">
                <template is="dom-if" if="[[!editedItem.filename]]">
                  <!-- File Upload -->
                  <paper-input-container
                      class="validate-input"
                      always-float-label
                      disabled$="[[requestInProcess]]"
                      readonly$="[[requestInProcess]]"
                      invalid="{{errors.file}}">
                    <label aria-hidden="true" for="uploadButton">[[uploadLabel]]</label>

                    <paper-button id="uploadButton" class="upload-button" on-tap="_openFileChooser">
                      <iron-icon icon="file-upload"></iron-icon>
                      [[uploadLabel]]
                    </paper-button>

                    <template is="dom-if" if="[[errors.file]]">
                      <paper-input-error aria-live="assertive">[[errors.file]]</paper-input-error>
                    </template>

                    <input id="fileInput"
                           class="validate-input"
                           type="file"
                           hidden
                           required
                           disabled$="[[requestInProcess]]"
                           readonly$="[[requestInProcess]]"
                           on-change="_fileSelected">
                  </paper-input-container>
                </template>

                <template is="dom-if" if="[[editedItem.filename]]">
                  <paper-input
                      class="disabled-as-readonly validate-input"
                      value="{{editedItem.filename}}"
                      label="[[uploadLabel]]"
                      required
                      disabled$="[[requestInProcess]]"
                      readonly
                      invalid="{{_checkInvalid(errors.file)}}"
                      error-message="{{errors.file}}"
                      on-tap="_openFileChooser">
                    <iron-icon prefix icon="icons:attachment"></iron-icon>
                  </paper-input>
                </template>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>

      <etools-dialog id="deleteLinks"
                     theme="confirmation" size="md"
                     link-id$="[[linkToDeleteId]]"
                     opened="{{deleteLinkOpened}}"
                     on-close="_removeLink"
                     ok-btn-text="Delete"
                     cancel-btn-text="Cancel">
        Are you sure you want to delete the shared document?
      </etools-dialog>


      <template is="dom-if" if="[[_isUnicefUser]]">
        <etools-dialog no-padding keep-dialog-open size="lg"
                       opened="{{shareDialogOpened}}"
                       dialog-title="Share Documents"
                       id="share-documents"
                       ok-btn-text="Share"
                       on-confirm-btn-clicked="_SendShareRequest"
                       show-spinner="{{requestInProcess}}"
                       disable-confirm-btn="{{requestInProcess}}">
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
  basePermissionPath: string = '';

  @property({type: String})
  dataBasePath: string = '';

  @property({type: String})
  pathPostfix: string = '';

  @property({type: Number})
  baseId: number = 0;

  @property({type: Object})
  itemModel: GenericObject = {
    file: undefined,
    file_name: undefined,
    file_type: undefined,
    type: {}
  };

  @property({type: Array, notify: true})
  headings: GenericObject[] = [{
    'size': 18,
    'name': 'date',
    'label': 'Date Uploaded!',
    'labelPath': `created`,
    'path': 'created'
  }, {
    'size': 30,
    'name': 'documentType',
    'label': 'Document Type!',
    'labelPath': `file_type`,
    'path': 'display_name'
  }, {
    'size': 30,
    'name': 'document',
    'label': 'File Attachment!',
    'labelPath': `file`,
    'property': 'filename',
    'custom': true,
    'doNotHide': false
  }, {
    'size': 12,
    'label': 'Source',
    'labelPath': 'tpm_activities.date',
    'path': 'source'
  }];

  @property({type: Object})
  ENGAGEMENT_TYPE_ENDPOINT_MAP: GenericObject = {
    'micro-assessments': 'micro-assessment',
    'spot-checks': 'spot-check',
    'staff-spot-checks': 'spot-check',
    'audits': 'audit',
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
  uploadLabel: string = 'Upload File';

  @property({type: Boolean})
  shareDialogOpened: boolean = false;

  @property({type: Object})
  shareParams: GenericObject = {};

  @property({type: Object})
  auditLinksOptions: GenericObject = {};

  @property({type: Array, notify: true})
  linkedAttachments: any[] = [];

  @property({type: Array})
  fileTypes: any[] = [];

  @property({type: String})
  deleteTitle: string = 'Are you sure that you want to delete this attachment?';

  @property({type: String})
  errorProperty: string = '';

  @property({type: Boolean})
  isReportTab: boolean = false;

  @property({type: Boolean, computed: '_shouldHideShare(_isUnicefUser, baseId)'})
  _hideShare: boolean = false;

  @property({type: Boolean, computed: '_checkIsUnicefUser(dataBasePath)'})
  _isUnicefUser: boolean = false;

  static get observers() {
    return [
      '_setBasePath(dataBasePath, pathPostfix)',
      '_filesChange(dataItems.*, fileTypes.*)',
      '_resetDialog(dialogOpened)',
      '_errorHandler(errorObject)',
      'updateStyles(requestInProcess, editedItem, basePermissionPath)',
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._requestCompleted = this._requestCompleted.bind(this);
    this.addEventListener('attachments-request-completed', this._requestCompleted);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('attachments-request-completed', this._requestCompleted);
  }

  _checkIsUnicefUser() {
    const user = this.getUserData();
    return Boolean(user.groups.find(({name}) => name === 'UNICEF User'));
  }


  _hanldeLinksForEngagement() {
    this._setLinksEndpoint();
    this._getLinkedAttachments();
  }

  _setLinksEndpoint() {
    const {details: engagement, type: engagementType} = this.getCurrentEngagement();
    this.set('engagement', engagement);
    this.set('auditLinksOptions', {
      endpoint: this.getEndpoint('auditLinks', {
        type: this.ENGAGEMENT_TYPE_ENDPOINT_MAP[engagementType],
        id: engagement.id
      })
    });
  }

  _getLinkedAttachments() {
    this.set('requestInProcess', true);
    const options = Object.assign(this.auditLinksOptions, {method: 'GET'});
    this.sendRequest(options)
        .then(res => {
          this.set('linkedAttachments', uniqBy(res, 'attachment'));
          this.set('requestInProcess', false);
        })
        .catch(this._errorHandler.bind(this));
  }

  _setBasePath(dataBase, pathPostfix) {
    this._handleLinksInDetailsView(dataBase);
    let base = dataBase && pathPostfix ? `${dataBase}_${pathPostfix}` : '';
    this.set('basePermissionPath', base);
    if (base) {
      let title = this.getFieldAttribute(base, 'title');
      this.set('tabTitle', title);
      this.fileTypes = this.getChoices(`${base}.file_type`);
    }
  }

  _handleLinksInDetailsView(dataBase) {
    if (!dataBase) { //null check
      dataBase = '';
    }
    const isEngagementDetailsView = !dataBase.includes('new');
    if (isEngagementDetailsView && !this.isReportTab) {
      this._hanldeLinksForEngagement();
    }
  }

  isTabReadonly(basePath) {
    return !basePath || (!this.collectionExists(`${basePath}.PUT`) &&
        !this.collectionExists(`${basePath}.POST`));
  }

  _hideShare_(basePermissionPath) { // TODO -is this still used?
    return this.isTabReadonly(basePermissionPath) || basePermissionPath.includes('new');
  }

  showFileTypes(basePath) {
    return !!basePath && this.collectionExists(`${basePath}.file_type`, 'GET');
  }

  _resetDialog(dialogOpened) {
    if (!dialogOpened) {
      this.originalEditedObj = null;
    }
    this.resetDialog(dialogOpened);
  }

  _getFileType(fileType) {
    let length = get(this, 'fileTypes.length');
    if (!length) {
      return;
    }

    let type = this.fileTypes.find((type) => parseInt(type.value, 10) === parseInt(fileType, 10));
    return type || null;
  }

  _openFileChooser() {
    let elem = this.shadowRoot.querySelector('#fileInput');
    if (elem && document.createEvent) {
      let evt = document.createEvent('MouseEvents');
      evt.initEvent('click', true, false);
      elem.dispatchEvent(evt);
      this.set('errors.file', '');
    }
  }

  _fileSelected(e) {
    if (!e || !e.currentTarget) {
      return false;
    }

    let files = e.currentTarget.files || {};
    let file = files[0];

    if (file && file instanceof File) {
      this.set('editedItem.filename', file.name);
      this.editedItem.file = file;

      return !this._fileAlreadySelected();
    }
  }


  _filesChange() {
    if (!this.dataItems) {
      return false;
    }

    this.dataItems.forEach((file) => {
      if (file.file_type !== undefined && !file.display_name) {
        let type = this._getFileType(file.file_type) || {};
        file.type = type;
        file.display_name = type.display_name;
      }
    });
  }

  _saveAttachment(e) {
    if (!this.validate()) {
      return;
    }

    this.requestInProcess = true;

    let attachmentsData = this._getFileData();
    let method = attachmentsData.id ? 'PATCH' : 'POST';

    attachmentsData = method === 'PATCH' ? this._getChanges(attachmentsData) : attachmentsData;
    if (!attachmentsData) {
      this._requestCompleted(null, {success: true});
      return;
    }
    this.requestData = {method, attachmentsData};
  }

  _deleteAttachment(event) {
    if (this.deleteCanceled(event)) {
      return;
    }
    if (!this.baseId) {
      this._processDelayedRequest();
      return;
    }
    this.requestInProcess = true;

    this.requestData = {
      method: 'DELETE',
      attachmentsData: {id: this.editedItem.id}
    };
  }

  _getChanges(attachmentsData) {
    let original = this.originalEditedObj && this._getFileData(false, this.originalEditedObj);
    if (!original) {
      return attachmentsData;
    }

    let data = pickBy(attachmentsData, (value, key) => original[key] !== value);
    if (data.file && this._fileAlreadySelected()) {
      delete data.file;
    }

    if (isEmpty(data)) {
      return null;
    } else {
      data.id = attachmentsData.id;
      return data;
    }
  }

  _getFileData(addName, fileData) {
    if (!this.dialogOpened && !fileData) {
      return {};
    }
    let {id, file, type} = fileData || this.editedItem;
    let data: GenericObject = {file};

    if (id) {
      data.id = id;
    }

    if (type) {
      data.file_type = type.value;
    }

    if (addName) {
      data.filename = this.editedItem.filename;
      data.unique_id = uniqueId();
    }

    return data;
  }

  _getAttachmentType(attachment) {
    return this.fileTypes.find(fileType => fileType.value === attachment.file_type).display_name;
  }

  _requestCompleted(event, detail = {}) {
    this.requestInProcess = false;
    if (detail.success) {
      this.dialogOpened = false;
    }
  }

  _fileAlreadySelected() {
    if (!this.dataItems) {
      return false;
    }

    let alreadySelectedIndex = this.dataItems.findIndex((file) => {
      return file.filename === this.editedItem.filename;
    });

    if (alreadySelectedIndex !== -1) {
      this.set('errors.file', 'File already selected');
      return true;
    }

    this.set('errors.file', '');
    return false;
  }

  validate() {
    let dropdown = this.shadowRoot.querySelector('#fileType');
    let editedItem = this.editedItem;
    let valid = true;

    let fileTypeRequired = this._setRequired('file_type', this.basePermissionPath);
    if (fileTypeRequired && (!this.fileTypes || !this.fileTypes.length)) {
      this.set('errors.file_type', 'File types are not defined');
      valid = false;
    } else {
      this.set('errors.file_type', false);
    }

    if (fileTypeRequired && !dropdown.validate()) {
      this.set('errors.file_type', 'This field is required');
      valid = false;
    }

    if (this.addDialog && this._fileAlreadySelected()) {
      valid = false;
    }

    if (this.addDialog && !editedItem.file) {
      this.set('errors.file', 'File is not selected');
      valid = false;
    }

    return valid;
  }

  _openAddDialog() {
    this.editedItem = clone(this.itemModel);
    this.openAddDialog();
  }

  _errorHandler(errorData) {
    let mainProperty = this.errorProperty;
    this.requestInProcess = false;
    if (!errorData || !errorData[mainProperty]) {
      return;
    }
    let refactoredData = this.refactorErrorObject(errorData[mainProperty]);
    let nonField = this.checkNonField(errorData[mainProperty]);

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
      let filesErrors = this.getFilesErrors(refactoredData);

      filesErrors.forEach((fileError) => {
        fireEvent(this, 'toast', {text: `${fileError.fileName}: ${fileError.error}`});
      });
    }
  }

  getFilesErrors(errors) {
    if (this.dataItems instanceof Array && errors instanceof Array && errors.length === this.dataItems.length) {
      let filesErrors = [];

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
    return this.dataItems.map((file) => this._getFileData(false, file));
  }

  resetData() {
    this.set('dataItems', []);
  }

  _openShareDialog() {
    this.shareDialogOpened = true;
    const shareModal = this.shadowRoot.querySelector('#shareDocuments');
    shareModal.updateShareParams();
  }

  _SendShareRequest() {
    const {attachments} = this.shareParams;
    const options = Object.assign(this.auditLinksOptions, {
      csrf: true,
      body: {attachments},
      method: 'POST'
    });
    this.set('requestInProcess', true);
    this.sendRequest(options)
        .then(() => {
          fireEvent(this, 'toast', {
            text: 'Documents shared successfully.'
          });

          this.set('requestInProcess', false);
          this.set('shareDialogOpened', false);
          this._getLinkedAttachments(); // refresh the list
        })
        .catch(this._handleShareError.bind(this))

  }

  _handleShareError(err) {
    let nonField = this.checkNonField(err);
    let message;
    if (nonField) {
      message = `Nonfield error: ${nonField}`
    } else {
      message = err.response && err.response.detail ? `Error: ${err.response.detail}`
          : 'Error sharing documents.';
    }
    fireEvent(this, 'toast', {
      text: message
    });

    this.set('requestInProcess', false);
    this.set('shareDialogOpened', false);
    this._getLinkedAttachments(); // refresh the list
  }

  _getClassFor(field) {
    return `w${this.headings.find(
        heading => heading.name === field
    ).size}`
  }

  _openDeleteLinkDialog(e) {
    const {linkedAttachment} = e.model;
    this.set('linkToDeleteId', linkedAttachment.id);
    this.deleteLinkOpened = true;
  }

  _removeLink(event) {
    if (this.deleteCanceled(event)) {
      return;
    }

    this.deleteLinkOpened = false;
    const id = event.currentTarget.getAttribute('link-id');

    this.sendRequest({
      method: 'DELETE',
      endpoint: this.getEndpoint('linkAttachment', {id})
    }).then(this._getLinkedAttachments.bind(this))
        .catch(err => this._errorHandler(err));
  }

  _shouldHideShare(isUnicefUser, baseId) {
    return this.isReportTab || !isUnicefUser || this._isNewEngagement();
  }

  _isNewEngagement() {
    return !this.baseId;
  }

  _hideAddAttachments(basePermissionPath, _baseId) {
    return this.isTabReadonly(basePermissionPath) || this._isNewEngagement();
  }

  _showEmptyRow(length1, length2) {
    return !length1 && !length2 && !this._isNewEngagement();
  }

}

window.customElements.define('file-attachments-tab', FileAttachmentsTab);
