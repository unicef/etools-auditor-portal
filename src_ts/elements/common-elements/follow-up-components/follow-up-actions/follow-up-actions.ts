import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import find from 'lodash-es/find';
import sortBy from 'lodash-es/sortBy';
import pickBy from 'lodash-es/pickBy';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import omit from 'lodash-es/omit';
import each from 'lodash-es/each';
import './follop-up-actions-dialog';
import '../../../data-elements/get-action-points';
import '../../../data-elements/update-action-points';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getEndpoint} from '../../../config/endpoints-controller';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {getHeadingLabel, getOptionsChoices, readonlyPermission} from '../../../mixins/permission-controller';
import {checkNonField} from '../../../mixins/error-handler';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {AnyObject} from '@unicef-polymer/etools-types';
import {RootState, store} from '../../../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @LitElement
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('follow-up-actions')
export class FollowUpActions extends connect(store)(CommonMethodsMixin(TableElementsMixin(DateMixin(LitElement)))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host .confirm-text {
          padding: 5px 86px 0 23px !important;
        }
        div.action-complete {
          padding: 10px 0 9px 20px;
        }
        div.action-complete etools-button {
          height: 38px;
          font-weight: 500;
          padding-right: 0;
        }
        div.action-complete etools-icon {
          width: 20px;
          color: var(--gray-mid);
          margin-left: 5px;
        }
        div.action-complete a {
          color: var(--gray-mid);
          text-decoration: none;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        .launch-icon {
          --iron-icon-height: 16px;
          --iron-icon-width: 16px;
        }
      </style>
      <etools-media-query
        query="(max-width: 1180px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <get-action-points
        .engagementId="${this.engagementId}"
        @ap-loaded="${({detail}: CustomEvent) => {
          if (detail?.success) {
            this.dataItems = detail.data;
          }
        }}"
      ></get-action-points>

      <update-action-points
        .engagementId="${this.engagementId}"
        .requestData="${this.requestData}"
        .errors="${this.errors}"
        .actionPoints="${this.dataItems}"
        @ap-request-completed="${this._apRequestCompleted}"
      >
      </update-action-points>
      <get-partner-data
        .partnerId="${this.partnerId}"
        @partner-loaded="${({detail}) => {
          this.fullPartner = detail;
        }}"
      >
      </get-partner-data>

      <etools-content-panel panel-title="UNICEF Follow-Up Actions" list show-expand-btn>
        <div slot="panel-btns">
          <div ?hidden="${!this.canBeChanged}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this._openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
          <etools-data-table-column class="col-2" field="reference_number" sortable
            >${getHeadingLabel(this.optionsData, 'reference_number', 'Reference Number #')}</etools-data-table-column
          >
          <etools-data-table-column class="col-3" field="ap_category.display_name" sortable
            >${getHeadingLabel(this.optionsData, 'category', 'Action Point Category')}</etools-data-table-column
          >
          <etools-data-table-column class="col-3">Assignee (Section / Office)</etools-data-table-column>
          <etools-data-table-column class="col-1" field="status" sortable
            >${getHeadingLabel(this.optionsData, 'status', 'Status')}</etools-data-table-column
          >
          <etools-data-table-column class="col-1" field="due_date" sortable
            >${getHeadingLabel(this.optionsData, 'due_date', 'Due Date')}</etools-data-table-column
          >
          <etools-data-table-column class="col-2" field="priority" sortable
            >${getHeadingLabel(this.optionsData, 'high_priority', 'Priority')}</etools-data-table-column
          >
        </etools-data-table-header>

        ${(this.itemsToDisplay || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse secondary-bg-on-hover .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <span
                  class="col-data col-2"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'reference_number', 'Reference Number #')}"
                >
                  <a href="${item.url}" class="truncate" title="${item.reference_number}" target="_blank">
                    ${item.reference_number} <etools-icon class="launch-icon" name="launch"></etools-icon>
                  </a>
                </span>
                <span
                  class="col-data col-3"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'category', 'Action Point Category')}"
                  >${item.ap_category?.display_name || '-'}</span
                >
                <span class="col-data col-3" data-col-header-label="Assignee (Section / Office)"
                  >${item.computed_field}</span
                >
                <span
                  class="col-data col-1 caps"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'status', 'Status')}"
                  >${item.status}</span
                >
                <span
                  class="col-data col-1"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'due_date', 'Due Date')}"
                  >${this.prettyDate(String(item.due_date), '') || '-'}</span
                >
                <span
                  class="col-data col-2 caps"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'high_priority', 'Priority')}"
                  >${item.priority}</span
                >
                <div class="hover-block">
                  <etools-icon-button
                    name="content-copy"
                    @click="${() => this._openCopyDialog(index)}"
                  ></etools-icon-button>
                  <etools-icon-button
                    name="create"
                    ?hidden="${!this.canBeEdited(item.status)}"
                    @click="${() => this._openEditDialog(index)}"
                  ></etools-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.itemsToDisplay?.length}">
          <div slot="row-data" class="layout-horizontal editable-row padding-v">
            <span class="col-data col-12">No records found.</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems!: GenericObject[];

  @property({type: Object})
  itemModel: GenericObject = {
    assigned_to: '',
    due_date: undefined,
    description: '',
    high_priority: false
  };

  @property({type: Array})
  modelFields: string[] = [
    'assigned_to',
    'category',
    'description',
    'section',
    'office',
    'due_date',
    'high_priority',
    'intervention'
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add Action Point', confirmBtn: 'Save'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Action Point'};

  @property({type: Object})
  copyDialogTexts: GenericObject = {title: 'Duplicate Action Point'};

  @property({type: Array})
  viewDialogTexts: GenericObject = {title: 'View Action Point'};

  @property({type: Array})
  users: GenericObject[] = [];

  @property({type: Array})
  sections: GenericObject[] = [];

  @property({type: Array})
  offices: GenericObject[] = [];

  @property({type: Object})
  partnerData!: GenericObject;

  @property({type: Array})
  partners!: GenericObject[];

  @property({type: String})
  orderBy = '-reference_number';

  @property({type: Boolean})
  notTouched = false;

  @property({type: Object})
  requestData!: GenericObject;

  @property({type: Number})
  _selectedAPIndex!: number | null;

  @property({type: Boolean})
  copyDialog!: boolean;

  @property({type: Object})
  editedApBase!: AnyObject;

  @property({type: Array})
  itemsToDisplay!: GenericObject[];

  @property({type: Boolean})
  canBeChanged!: boolean;

  @property({type: Array})
  categories!: GenericObject[];

  @property({type: Number})
  engagementId!: number;

  @property({type: Number})
  partnerId!: number | null;

  @property({type: Number})
  selectedPartnerId!: number | null;

  @property({type: Number})
  selectedPartnerIdAux!: number | null;

  @property({type: Object})
  fullPartner!: any;

  public connectedCallback() {
    super.connectedCallback();

    this.dialogKey = 'follow-up-actions-dialog';
    this.addEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  stateChanged(state: RootState) {
    if (state.commonData.loadedTimestamp) {
      this.users = [...state.commonData.users];
      this.offices = [...state.commonData.offices];
      this.sections = [...state.commonData.sections];
      this.partners = [...state.commonData.partners];
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this.setPermissionPath(this.optionsData);
    }
    if (changedProperties.has('dataItems')) {
      this._addComputedField();
    }
    if (changedProperties.has('partnerData')) {
      this._requestPartner(this.partnerData);
    }
  }

  openAddEditDialog() {
    this.isAddDialogOpen = true;
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        editedItem: this.editedItem,
        editedApBase: this.editedApBase,
        users: this.users,
        sections: this.sections,
        offices: this.offices,
        categories: this.categories,
        partners: this.partners,
        interventions: this.fullPartner?.interventions || [],
        selectedPartnerIdAux: this.selectedPartnerIdAux,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText,
        copyDialog: this.copyDialog,
        originalEditedObj: this.originalEditedObj
      }
    }).then(() => (this.isAddDialogOpen = false));
  }

  _requestPartner(partner) {
    const id = (partner && +partner.id) || null;
    this.partnerId = id;
    this.selectedPartnerId = id;
  }

  _sortOrderChanged(e: CustomEvent) {
    const sorted = sortBy(this.dataItems, (item) => item[e.detail.field]);
    this.itemsToDisplay = e.detail.direction === 'asc' ? sorted : sorted.reverse();
  }

  _addComputedField() {
    this.itemsToDisplay = this.dataItems.map((item: any) => {
      item.priority = (item.high_priority && 'High') || ' ';
      const assignedTo = get(item, 'assigned_to.name', '--');
      const section = get(item, 'section.name', '--');
      const office = get(item, 'office.name', '--');
      item.computed_field = html`<b>${assignedTo}</b> <br /><span class="truncate"
          >(${section} / ${office})<span></span
        ></span>`;
      item.ap_category = find(this.categories, (category) => category.value === item.category);
      return item;
    });
  }

  setPermissionPath(optionsData) {
    if (!optionsData) {
      return;
    }
    this.categories = getOptionsChoices(optionsData, 'category') || [];
    this.canBeChanged = !readonlyPermission('POST', this.optionsData);
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Follow-Up Actions: ${nonField}`});
    }
  }

  getActionsData() {
    if (!this.isAddDialogOpen) {
      return null;
    }
    if (this.copyDialog) {
      this.originalEditedObj = {};
    }
    const data = pickBy(this.editedItem, (value, fieldName) => {
      if (!~this.modelFields.indexOf(fieldName)) {
        return false;
      }
      const isObj = isObject(value) && !isArray(value);
      if (isObj) {
        return +(value as AnyObject).id !== +get(this, `originalEditedObj.${fieldName}.id`, 0);
      } else {
        return !isEqual(value, this.originalEditedObj![fieldName]);
      }
    });
    each(['assigned_to', 'office', 'section', 'intervention'], (field) => {
      if (data[field] && data[field].id) {
        data[field] = data[field].id;
      }
    });
    if (this.editedItem.id && !isEmpty(data)) {
      data.id = this.editedItem.id;
    }

    return isEmpty(data) ? null : data;
  }

  _addActionPoint(editedItem: GenericObject) {
    this.requestInProcess = true;
    this.editedItem = cloneDeep(editedItem);
    const apData = this.getActionsData();
    if (apData) {
      const method = apData.id ? 'PATCH' : 'POST';
      this.requestData = {method, apData};
    } else {
      this._apRequestCompleted({detail: {success: true}});
    }
  }

  _apRequestCompleted(event) {
    if (!event || !event.detail) {
      return;
    }
    const detail = event.detail;
    this.requestInProcess = false;
    if (detail && detail.success) {
      this.isAddDialogOpen = false;
      this._closeEditDialog();
      if (event.detail.data) {
        this.dataItems = [...event.detail.data];
      }
    } else {
      this.closeDialogLoading();
      this.errors = event.detail.errors;
    }
  }

  _openAddDialog() {
    this.copyDialog = false;
    this.originalEditedObj = {};
    each(['assigned_to', 'office', 'section', 'intervention'], (field) => {
      this.editedItem[field] = {id: null};
    });
    this.editedApBase = {...this.optionsData};
    this.selectedPartnerIdAux = this.selectedPartnerId;
    this.openAddDialog();
  }

  _openEditDialog(index) {
    this.copyDialog = false;
    this.editedApBase = {};
    fireEvent(this, 'global-loading', {type: 'get-ap-options', active: true, message: 'Loading data...'});

    this._selectedAPIndex = index;
    this.selectedPartnerIdAux = this.selectedPartnerId;

    const id = get(this, `dataItems.${index}.id`);
    const apBaseUrl = getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url;
    const url = `${apBaseUrl}action-points/${id}/`;

    this._sendOptionsRequest(url);
  }

  _sendOptionsRequest(url) {
    const requestOptions = {
      method: 'OPTIONS',
      endpoint: {
        url
      }
    };
    sendRequest(requestOptions)
      .then(this._handleOptionResponse.bind(this))
      .catch(this._handleOptionResponse.bind(this));
  }

  _openCopyDialog(index) {
    this.dialogTitle = (this.copyDialogTexts && this.copyDialogTexts.title) || 'Add New Item';
    this.confirmBtnText = 'Save';
    this.cancelBtnText = 'Cancel';
    const data = cloneDeep(omit(this.dataItems[index], ['id']));
    this.editedItem = data;
    this.originalEditedObj = cloneDeep(data);
    this.editedApBase = this.optionsData;
    this.selectedPartnerIdAux = this.selectedPartnerId;
    this.copyDialog = true;
    this.handleUsersNoLongerAssignedToCurrentCountry(
      this.users,
      this.editedItem.assigned_to ? [this.editedItem.assigned_to] : []
    );
    this.users = [...this.users];
    this.openAddEditDialog();
  }

  _handleOptionResponse(detail) {
    fireEvent(this, 'global-loading', {type: 'get-ap-options'});
    if (detail) {
      const allowed_actions = (detail.actions.allowed_FSM_transitions as any) || [];
      detail.actions.allowed_actions = (detail.actions.allowed_actions || []).concat(allowed_actions);
      this.editedApBase = detail;
    }
    const itemIndex = this._selectedAPIndex;
    this._selectedAPIndex = null;
    if (get(this.editedApBase, 'actions.PUT')) {
      this.openEditDialog(itemIndex);
    } else {
      this.dialogTitle = String(get(this, 'viewDialogTexts.title') || '');
      this.confirmBtnText = '';
      this.cancelBtnText = 'Cancel';

      // @ts-ignore Defined in tableElementsMixin, not visible because of EtoolsAjaxRequestMixin
      this._openDialog(itemIndex);
    }
    this.handleUsersNoLongerAssignedToCurrentCountry(
      this.users,
      this.editedItem.assigned_to ? [this.editedItem.assigned_to] : []
    );
    this.users = [...this.users];
  }

  canBeEdited(status) {
    return status !== 'completed';
  }
}
