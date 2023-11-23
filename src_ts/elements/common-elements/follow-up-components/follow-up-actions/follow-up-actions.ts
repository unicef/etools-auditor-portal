import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-tooltip/paper-tooltip';
import cloneDeep from 'lodash-es/cloneDeep';
import get from 'lodash-es/get';
import find from 'lodash-es/find';
import sortBy from 'lodash-es/sortBy';
import pickBy from 'lodash-es/pickBy';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import every from 'lodash-es/every';
import omit from 'lodash-es/omit';
import each from 'lodash-es/each';

import '../../../data-elements/get-action-points';
import '../../../data-elements/update-action-points';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getEndpoint} from '../../../config/endpoints-controller';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {
  actionAllowed,
  getHeadingLabel,
  getOptionsChoices,
  readonlyPermission
} from '../../../mixins/permission-controller';
import {checkNonField} from '../../../mixins/error-handler';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import clone from 'lodash-es/clone';
import famEndpoints from '../../../config/endpoints';
import {AnyObject} from '@unicef-polymer/etools-types';
import {RootState, store} from '../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';

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
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host .confirm-text {
          padding: 5px 86px 0 23px !important;
        }
        :host .copy-warning {
          position: relative;
          margin-bottom: 10px;
          padding: 20px 24px;
          background-color: #ededee;
          color: #212121;
          font-size: 15px;
        }
        div.action-complete {
          padding: 10px 0 9px 20px;
        }
        div.action-complete paper-button {
          height: 38px;
          font-weight: 500;
          padding-right: 0;
        }
        div.action-complete iron-icon {
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
        etools-dropdown.fua-category {
          --paper-listbox: {
                max-height: 340px;
                -ms-overflow-style: auto;
            };
        }
        etools-dropdown.fua-person {
          --paper-listbox: {
                max-height: 140px;
                -ms-overflow-style: auto;
            };
        }
        .checkbox-container {
          padding-inline-start: 14px;
          padding-top: 14px;
        }
        .input-container paper-button {
          height: 34px;
          color: rgba(0, 0, 0, .54);
          font-weight: 500;
          z-index: 5;
          border: 1px solid rgba(0, 0, 0, .54);
          padding: 6px 13px;
        }
        paper-tooltip {
          --paper-tooltip: {
            font-size: 12px;
          }
        }
        datepicker-lite::part(dp-calendar) {
          position: fixed;
        }
        .launch-icon {
          --iron-icon-height: 16px;
          --iron-icon-width: 16px;
          }
      </style>

      <get-action-points .engagementId="${this.engagementId}" @ap-loaded="${({detail}: CustomEvent) => {
      if (detail?.success) {
        this.dataItems = detail.data;
      }
    }}"></get-action-points>

        <update-action-points .engagementId="${this.engagementId}"
                              .requestData="${this.requestData}"
                              .errors="${this.errors}"
                              .actionPoints="${this.dataItems}"
                              @ap-request-completed="${this._apRequestCompleted}">
        </update-action-points>
        <get-partner-data .partnerId="${this.partnerId}"
            @partner-loaded="${({detail}) => {
              this.fullPartner = detail;
            }}">
        </get-partner-data>

        <etools-content-panel panel-title="UNICEF Follow-Up Actions" list>
            <div slot="panel-btns">
                <div ?hidden="${!this.canBeChanged}">
                    <paper-icon-button
                            class="panel-button"
                            @tap="${this._openAddDialog}"
                            icon="add-box">
                    </paper-icon-button>
                    <paper-tooltip offset="0">Add</paper-tooltip>
                </div>
            </div>

          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-2" field="reference_number" sortable>${getHeadingLabel(
              this.optionsData,
              'reference_number',
              'Reference Number #'
            )}</etools-data-table-column>
            <etools-data-table-column class="col-3" field="ap_category.display_name" sortable>${getHeadingLabel(
              this.optionsData,
              'category',
              'Action Point Category'
            )}</etools-data-table-column>
            <etools-data-table-column class="col-3">Assignee (Section / Office)</etools-data-table-column>
            <etools-data-table-column class="col-2" field="status" sortable>${getHeadingLabel(
              this.optionsData,
              'status',
              'Status'
            )}</etools-data-table-column>
            <etools-data-table-column class="col-1" field="due_date" sortable>${getHeadingLabel(
              this.optionsData,
              'due_date',
              'Due Date'
            )}</etools-data-table-column>
            <etools-data-table-column class="col-1" field="priority" sortable>${getHeadingLabel(
              this.optionsData,
              'high_priority',
              'Priority'
            )}</etools-data-table-column>
          </etools-data-table-header>

          ${(this.itemsToDisplay || []).map(
            (item, index) => html`
              <etools-data-table-row no-collapse>
                <div slot="row-data" class="layout-horizontal editable-row">
                  <span class="col-data col-2 truncate">
                    <a href="${item.url}" class="truncate" title="${item.reference_number}" target="_blank">
                      ${item.reference_number} <iron-icon class="launch-icon" icon="launch"></iron-icon>
                    </a>
                  </span>
                  <span class="col-data col-3 truncate">${item.ap_category?.display_name || '-'}</span>
                  <span class="col-data col-3 truncate">${item.computed_field}</span>
                  <span class="col-data col-2 truncate caps">${item.status}</span>
                  <span class="col-data col-1 truncate">${this.prettyDate(String(item.due_date), '') || '-'}</span>
                  <span class="col-data col-1 truncate caps">${item.priority}</span>
                  <div class="hover-block">
                    <paper-icon-button
                      icon="content-copy"
                      @click="${() => this._openCopyDialog(index)}"
                    ></paper-icon-button>
                    <paper-icon-button
                      icon="create"
                      ?hidden="${!this.canBeEdited(item.status)}"
                      @click="${() => this._openEditDialog(index)}"
                    ></paper-icon-button>
                  </div>
                </div>
              </etools-data-table-row>
            `
          )}
        <etools-data-table-row no-collapse ?hidden="${this.itemsToDisplay?.length}">
          <div slot="row-data" class="layout-horizontal editable-row">
            <span class="col-data col-2">–</span>
            <span class="col-data col-3">–</span>
            <span class="col-data col-3">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-2">–</span>
            <span class="col-data col-1">–</span>
          </div>
        </etools-data-table-row>

        <etools-dialog no-padding keep-dialog-open size="md"
                ?opened="${this.dialogOpened}"
                .dialogTitle="${this.dialogTitle}"
                .okBtnText="${this.confirmBtnText}"
                .hideConfirmBtn="${!this.confirmBtnText}"
                ?show-spinner="${this.requestInProcess}"
                ?disable-confirm-btn="${this.requestInProcess}"
                @confirm-btn-clicked="${this._addActionPoint}"
                openFlag="dialogOpened"
                @close="${this._resetDialogOpenedFlag}">
            ${
              this.notTouched
                ? html`<div class="copy-warning">It is required to change at least one of the fields below.</div>`
                : ``
            }
                  <div class="container">
                    <div class="layout-horizontal">
                        <div class="col col-6">
                            <!-- Partner -->
                            <etools-dropdown
                                    class="${this._setRequired('partner', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.selectedPartnerIdAux}"
                                    label="${this.getLabel('partner', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('partner', this.editedApBase, 'select')}"
                                    .options="${this.partners}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('partner', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('partner', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.partner}"
                                    .errorMessage="${this.errors.partner}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                        <div class="col col-6">
                            <!-- PD/SSFA -->
                            <etools-dropdown
                                    class="${this._setRequired(
                                      'intervention',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.intervention?.id}"
                                    label="${this.getLabel('intervention', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText(
                                      'intervention',
                                      this.editedApBase,
                                      'select'
                                    )}"
                                    .options="${this.fullPartner?.interventions}"
                                    option-label="title"
                                    option-value="id"
                                    ?required="${this._setRequired('intervention', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'intervention',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    ?invalid="${this.errors.intervention}"
                                    .errorMessage="${this.errors.intervention}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.intervention = detail.selectedItem?.id
                                        ? {id: detail.selectedItem?.id}
                                        : null)}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                    </div>
                    <div class="layout-horizontal">
                        <div class="col col-6">
                            <!-- Category -->
                            <etools-dropdown
                                    class="${this._setRequired(
                                      'category',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.category}"
                                    label="${this.getLabel('category', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('category', this.editedApBase, 'select')}"
                                    .options="${this.categories}"
                                    option-label="display_name"
                                    option-value="value"
                                    ?required="${this._setRequired('category', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('category', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.category}"
                                    .errorMessage="${this.errors.category}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.category = detail.selectedItem?.value)}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                    </div>

                    <div class="layout-horizontal">
                        <div class="col col-12">
                            <!-- Description -->
                            <paper-textarea
                                    class="w100 validate-input ${this._setRequired('description', this.editedApBase)}"
                                    .value="${this.editedItem.description}"
                                    allowed-pattern="[\d\s]"
                                    label="${this.getLabel('description', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('description', this.editedApBase)}"
                                    ?required="${this._setRequired('description', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'description',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    max-rows="4"
                                    ?invalid="${this.errors.description}"
                                    .errorMessage="${this.errors.description}"
                                    @value-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.description = detail.value)}"
                                    @focus="${this._resetFieldError}">
                            </paper-textarea>
                        </div>
                    </div>

                    <div class="layout-horizontal">
                        <div class="col col-6">
                            <!-- Assigned To -->

                            <etools-dropdown
                                    class="${this._setRequired(
                                      'assigned_to',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.assigned_to?.id}"
                                    label="${this.getLabel('assigned_to', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('assigned_to', this.editedApBase, 'select')}"
                                    .options="${this.users}"
                                    option-label="name"
                                    option-value="id"
                                    .loadDataMethod="${this.loadUsersDropdownOptions}"
                                    preserve-search-on-close
                                    ?required="${this._setRequired('assigned_to', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'assigned_to',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    ?invalid="${this.errors.assigned_to}"
                                    .errorMessage="${this.errors.assigned_to}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        assigned_to: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>

                        <div class="col col-6">
                            <!-- Sections -->

                            <etools-dropdown
                                    class="${this._setRequired('section', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.editedItem.section?.id}"
                                    label="${this.getLabel('section', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('section', this.editedApBase, 'select')}"
                                    .options="${this.sections}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('section', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('section', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.section}"
                                    .errorMessage="${this.errors.section}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        section: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                    </div>

                    <div class="layout-horizontal">
                        <div class="col col-6">
                            <!-- Offices -->

                            <etools-dropdown
                                    class="${this._setRequired('office', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.editedItem.office?.id}"
                                    label="${this.getLabel('office', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('office', this.editedApBase, 'select')}"
                                    .options="${this.offices}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('office', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('office', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.office}"
                                    .errorMessage="${this.errors.office}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        office: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>

                        <div class="col col-6">
                            <!-- Due Date -->
                            <datepicker-lite
                                    id="deadlineAction"
                                    class="${this._setRequired('due_date', this.editedApBase)} validate-input"
                                    .value="${this.editedItem.due_date}"
                                    label="${this.getLabel('due_date', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('due_date', this.editedApBase, 'select')}"
                                    ?required="${this._setRequired('due_date', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('due_date', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.due_date}"
                                    .errorMessage="${this.errors.due_date}"
                                    @focus="${this._resetFieldError}"
                                    selected-date-display-format="D MMM YYYY"
                                    fire-date-has-changed
                                    @date-has-changed="${(e: CustomEvent) => {
                                      this.editedItem.due_date = e.detail.date;
                                    }}"
                                    >
                            </datepicker-lite>
                        </div>
                    </div>

                    <div class="layout-horizontal">
                        <!-- High Priority -->
                        <div class="col col-12 checkbox-container">
                            <paper-checkbox
                                    ?checked="${this.editedItem.high_priority}"
                                    ?disabled="${this.isReadOnly(
                                      'high_priority',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    @checked-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.high_priority = detail.value)}">
                                    This action point is high priority
                            </paper-checkbox>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-complete" ?hidden="${!this._allowComplete(this.editedApBase)}">
                <paper-button>
                    <a href="${this.editedItem.url}" target="_blank">Go To action points to complete
                        <iron-icon icon="icons:launch"></iron-icon>
                    </a>
                </paper-button>
            </div>
          </div>
        </etools-dialog>
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

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  public connectedCallback() {
    super.connectedCallback();

    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
    this.addEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
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

    if (changedProperties.has('dialogOpened')) {
      this._resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('optionsData')) {
      this.setPermissionPath(this.optionsData);
    }
    if (changedProperties.has('dataItems')) {
      this._addComputedField();
    }
    if (changedProperties.has('partnerData')) {
      this._requestPartner(this.partnerData);
    }
    if (changedProperties.has('copyDialog') || changedProperties.has('editedItem')) {
      this._checkNotTouched(this.copyDialog, this.editedItem);
    }
  }

  _loadUsersDropdownOptions(search: string, page: number, shownOptionsLimit: number) {
    const endpoint = clone(famEndpoints.users);
    endpoint.url += `?page_size=${shownOptionsLimit}&page=${page}&search=${search || ''}`;
    sendRequest({
      method: 'GET',
      endpoint: {
        url: endpoint.url
      }
    }).then((resp: GenericObject) => {
      const data = page > 1 ? [...this.users, ...resp.results] : resp.results;
      this.handleUsersNoLongerAssignedToCurrentCountry(
        data,
        this.editedItem.assigned_to ? [this.editedItem.assigned_to] : []
      );
      this.users = data;
    });
  }

  _allowComplete(editedApBase) {
    return actionAllowed(editedApBase, 'complete');
  }

  _requestPartner(partner) {
    const id = (partner && +partner.id) || null;
    this.partnerId = id;
    this.selectedPartnerId = id;
  }

  _resetDialog(dialogOpened) {
    if (dialogOpened) {
      return;
    }
    this.copyDialog = false;
    this.originalEditedObj = {};
    this.selectedPartnerIdAux = null;
    this.resetDialog(dialogOpened);
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
    if (!this.dialogOpened) {
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

  _addActionPoint() {
    this._checkNotTouched(this.copyDialog, this.editedItem);
    if (!this.validate() || this.notTouched) {
      return;
    }

    this.requestInProcess = true;
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
      this.dialogOpened = false;
      if (event.detail.data) {
        this.dataItems = [...event.detail.data];
      }
    } else {
      this.errors = event.detail.errors;
    }
  }

  _openAddDialog() {
    this.originalEditedObj = {};
    each(['assigned_to', 'office', 'section', 'intervention'], (field) => {
      this.editedItem[field] = {id: null};
    });
    this.editedApBase = {...this.optionsData};
    this.selectedPartnerIdAux = this.selectedPartnerId;
    this.openAddDialog();
  }

  _openEditDialog(index) {
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
    this.dialogOpened = true;
  }

  _checkNotTouched(copyDialog, editedItem) {
    if (!copyDialog || isEmpty(this.originalEditedObj)) {
      this.notTouched = false;
      return;
    }
    this.notTouched = every(this.originalEditedObj, (value, key) => {
      const isObj = isObject(value);
      if (isObj) {
        return !(value as AnyObject).id || +(value as AnyObject).id === +get(this, `editedItem.${key}.id`);
      } else {
        return value === editedItem[key];
      }
    });
  }

  _handleOptionResponse(detail) {
    fireEvent(this, 'global-loading', {type: 'get-ap-options'});
    if (detail) {
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
