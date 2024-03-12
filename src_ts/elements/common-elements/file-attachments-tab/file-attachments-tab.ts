import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';

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
import './share-documents-dialog';
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
import {getHeadingLabel, getOptionsChoices, isValidCollection} from '../../mixins/permission-controller';
import {checkNonField, refactorErrorObject} from '../../mixins/error-handler';
import {RequestEndpoint, sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import './file-attachment-doc-dialog.js';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

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
              <sl-tooltip content="Share Documents">
                <etools-icon-button
                  id="share-icon"
                  class="panel-button"
                  @click="${this._openShareDialog}"
                  name="open-in-browser"
                >
                </etools-icon-button>
              </sl-tooltip>
            </div>
            <div ?hidden="${this.hideAddAttachments}">
              <sl-tooltip content="Add">
                <etools-icon-button id="add-icon" class="panel-button" @click="${this._openAddDialog}" name="add-box">
                </etools-icon-button>
              </sl-tooltip>
            </div>
          </div>
        </div>
        <etools-loading .active="${this.requestInProcess}" loading-text="Loading data"></etools-loading>

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
            <etools-data-table-row no-collapse secondary-bg-on-hover>
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
                    <etools-icon name="attachment" class="download-icon"> </etools-icon>
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

  @property({type: Boolean})
  isUnicefUser!: boolean;

  @property({type: Boolean})
  shareDialogOpened = false;

  @property({type: Object})
  shareParams: GenericObject = {};

  @property({type: Object})
  auditLinksOptions: RequestEndpoint = {url: ''};

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

  @property({type: Boolean})
  isTabReadonly = true;

  @property({type: Boolean})
  hideAddAttachments = true;

  @property({type: Boolean})
  uploadInProgress = false;

  readonly sharedDialogKey = 'share-documents-dialog';

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'file-attachment-doc-dialog';
    this._requestCompleted = this._requestCompleted.bind(this);
    this.addEventListener('attachments-request-completed', this._requestCompleted as any);
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditAttachDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('attachments-request-completed', this._requestCompleted as any);
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditAttachDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this._onPermissionsLoaded(this.optionsData);
    }
    if (changedProperties.has('engagement')) {
      this._handleLinksInDetailsView(this.engagement);
    }
    if (changedProperties.has('errorObject')) {
      this.filesTabErrorHandler(this.errorObject);
    }
    if (changedProperties.has('isUnicefUser') || changedProperties.has('engagement')) {
      this._shouldHideShare(this.isUnicefUser, this.engagement?.id);
    }
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
      })
      .catch(this.filesTabErrorHandler.bind(this))
      .finally(() => (this.requestInProcess = false));
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

  openAddEditAttachDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        fileTypes: this.fileTypes,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        originalEditedObj: this.originalEditedObj,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText
      }
    }).then(({confirmed, response}) => {
      if (confirmed && response) {
        this.requestData = clone(response);
      }
    });
  }

  openConfirmDeleteDialog() {
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete this attachment?',
        confirmBtnText: 'Delete',
        cancelBtnText: 'Cancel'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this._deleteAttachment();
      }
      setTimeout(() => {
        this.isConfirmDialogOpen = false;
      }, 1000);
    });
  }

  _deleteAttachment() {
    if (!this.engagement?.id) {
      return;
    }
    this.requestInProcess = true;

    this.requestData = {
      method: 'DELETE',
      attachmentData: {id: this.editedItem.id}
    };
  }

  _getAttachmentType(attachment) {
    const file = (this.fileTypes || []).find((f) => f.value === attachment.file_type);
    return file ? file.display_name : '';
  }

  _requestCompleted(event, detail) {
    detail = detail || event.detail;
    this.requestInProcess = false;
    if (detail?.success) {
      this.isAddDialogOpen = false;
    }
  }

  _openAddDialog() {
    this.editedItem = clone(this.itemModel);
    this.openAddDialog();
  }

  filesTabErrorHandler(errorData) {
    this.requestInProcess = false;

    if (!errorData || !Object.keys(errorData).length) {
      return;
    }
    this.closeDialogLoading();

    const mainProperty = this.errorProperty;
    if (!errorData[mainProperty]) {
      return;
    }
    const refactoredData = refactorErrorObject(errorData[mainProperty]);
    const nonField = checkNonField(errorData[mainProperty]);

    if (this.isAddDialogOpen && typeof refactoredData[0] === 'object') {
      this.errors = refactoredData[0];
    }
    if (typeof errorData[mainProperty] === 'string') {
      fireEvent(this, 'toast', {text: `Attachments: ${errorData[mainProperty]}`});
    }
    if (nonField) {
      fireEvent(this, 'toast', {text: `Attachments: ${nonField}`});
    }

    if (!this.isAddDialogOpen) {
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
    openDialog({
      dialog: this.sharedDialogKey,
      dialogData: {
        opener: this,
        partnerName: this.engagement?.partner?.name,
        optionsData: this.optionsData
      }
    });
  }

  _saveSharedDocsRequest(shareParams: GenericObject) {
    this.shareParams = cloneDeep(shareParams);
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
        this.shareDialogOpened = false;
        this.closeEditDialog(this.sharedDialogKey);
        this._getLinkedAttachments(); // refresh the list
      })
      .catch(this._handleShareError.bind(this))
      .finally(() => {
        this.shareParams = [];
        this.requestInProcess = false;
      });
  }

  _handleShareError(err) {
    this.closeDialogLoading(this.sharedDialogKey);
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

    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: 'Are you sure you want to delete the shared document?',
        confirmBtnText: 'Delete',
        cancelBtnText: 'Cancel'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this._removeLink(id);
      }
      setTimeout(() => {
        this.isConfirmDialogOpen = false;
      }, 1000);
    });
  }

  _removeLink(id) {
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
