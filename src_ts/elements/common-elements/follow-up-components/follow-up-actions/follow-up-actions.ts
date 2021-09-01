import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '../../list-tab-elements/list-header/list-header';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

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
import {property} from '@polymer/decorators';

import '../../../data-elements/get-action-points';
import '../../../data-elements/update-action-points';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '../../../utils/fire-custom-event';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {getEndpoint} from '../../../app-config/endpoints-controller';
import TableElementsMixin from '../../../app-mixins/table-elements-mixin';
import {getStaticData} from '../../../app-mixins/static-data-controller';
import DateMixin from '../../../app-mixins/date-mixin';
import {
  collectionExists,
  addToCollection,
  updateCollection,
  getChoices,
  readonlyPermission,
  actionAllowed
} from '../../../app-mixins/permission-controller';
import {checkNonField} from '../../../app-mixins/error-handler';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import clone from 'lodash-es/clone';
import famEndpoints from '../../../app-config/endpoints';

/**
 * @polymer
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
class FollowUpActions extends CommonMethodsMixin(TableElementsMixin(DateMixin(PolymerElement))) {
  static get template() {
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style>
        :host .repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
          overflow: auto;
        }
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
          padding-left: 12px;
          box-sizing: border-box;
          height: 34px;
          padding-top: 6px;
        }
        .input-container paper-button {
          height: 34px;
          color: rgba(0, 0, 0, .54);
          font-weight: 500;
          z-index: 5;
          border: 1px solid rgba(0, 0, 0, .54);
          padding: 6px 13px;
        }
        datepicker-lite::part(dp-calendar) {
          position: fixed;
        }
      </style>

        <get-action-points engagement-id="[[engagementId]]" action-points="{{dataItems}}"></get-action-points>
        <update-action-points engagement-id="[[engagementId]]"
                              request-in-process="{{requestInProcess}}"
                              request-data="{{requestData}}"
                              errors="{{errors}}"
                              action-points="{{dataItems}}"></update-action-points>
        <get-partner-data partner="{{fullPartner}}" partner-id="{{partnerId}}"></get-partner-data>

        <etools-content-panel panel-title="UNICEF Follow-Up Actions" list>
            <div slot="panel-btns">
                <div hidden$="[[!canBeChanged]]">
                    <paper-icon-button
                            class="panel-button"
                            on-tap="_openAddDialog"
                            icon="add-box">
                    </paper-icon-button>
                    <paper-tooltip offset="0">Add</paper-tooltip>
                </div>
            </div>

            <list-header data="[[columns]]"
                         order-by="{{orderBy}}"
                         no-additional
                         base-permission-path="[[basePermissionPath]]"></list-header>

            <template is="dom-repeat" items="[[itemsToDisplay]]" filter="_showItems">
                <list-element
                        class="list-element"
                        data="[[item]]"
                        base-permission-path="[[basePermissionPath]]"
                        headings="[[columns]]"
                        no-additional
                        no-animation>
                    <div slot="checkbox" class="checkbox">
                        <paper-checkbox
                                disabled="disabled"
                                checked="{{item.high_priority}}"
                                label="">
                        </paper-checkbox>
                    </div>
                    <div slot="hover" class="edit-icon-slot">
                        <paper-icon-button
                            icon="icons:content-copy"
                            class="edit-icon"
                            on-tap="_openCopyDialog"></paper-icon-button>
                        <paper-icon-button
                            icon="icons:create"
                            class="edit-icon"
                            on-tap="_openEditDialog"
                            hidden$="[[!canBeEdited(item.status)]]"></paper-icon-button>
                    </div>
                </list-element>
            </template>

            <template is="dom-if" if="[[!dataItems.length]]">
                <list-element
                        class="list-element"
                        data="[[itemModel]]"
                        headings="[[columns]]"
                        no-additional
                        no-animation>
                    <div slot="checkbox" class="checkbox">
                        <span>–</span>
                    </div>
                </list-element>
            </template>
        </etools-content-panel>

        <etools-dialog no-padding keep-dialog-open size="md"
                opened="{{dialogOpened}}"
                dialog-title="[[dialogTitle]]"
                ok-btn-text="[[confirmBtnText]]"
                hide-confirm-btn="[[!confirmBtnText]]"
                show-spinner="{{requestInProcess}}"
                disable-confirm-btn="{{requestInProcess}}"
                on-confirm-btn-clicked="_addActionPoint">
            <template is="dom-if" if="[[notTouched]]">
                <div class="copy-warning">
                    It is required to change at least one of the fields below.
                </div>
            </template>

            <div class="row-h repeatable-item-container" without-line>
                <div class="repeatable-item-content">

                    <div class="row-h group">
                        <div class="input-container input-container-ms">
                            <!-- Partner -->
                            <etools-dropdown
                                    class$="[[_setRequired('partner', editedApBase)]]
                                              disabled-as-readonly validate-input fua-person"
                                    selected="{{selectedPartnerId}}"
                                    label="[[getLabel('partner', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('partner', editedApBase, 'select')]]"
                                    options="[[partners]]"
                                    load-data-method="[[loadPartnersDropdownOptions]]"
                                    preserve-search-on-close
                                    option-label="name"
                                    option-value="id"
                                    required$="[[_setRequired('partner', editedApBase)]]"
                                    disabled$="{{isReadOnly('partner', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('partner', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.partner}}"
                                    error-message="{{errors.partner}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>
                        <div class="input-container input-container-ms">
                            <!-- PD/SSFA -->
                            <etools-dropdown
                                    class$="[[_setRequired('intervention', editedApBase)]]
                                            disabled-as-readonly validate-input fua-person"
                                    selected="{{editedItem.intervention.id}}"
                                    label="[[getLabel('intervention', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('intervention', editedApBase, 'select')]]"
                                    options="[[fullPartner.interventions]]"
                                    option-label="title"
                                    option-value="id"
                                    required$="[[_setRequired('intervention', editedApBase)]]"
                                    disabled$="{{isReadOnly('intervention', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('intervention', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.intervention}}"
                                    error-message="{{errors.intervention}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>
                    </div>
                </div>

                    <div class="row-h group">
                        <div class="input-container input-container-ms">
                            <!-- Category -->
                            <etools-dropdown
                                    class$="[[_setRequired('category', editedApBase)]]
                                            disabled-as-readonly validate-input fua-person"
                                    selected="{{editedItem.category}}"
                                    label="[[getLabel('category', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('category', editedApBase, 'select')]]"
                                    options="[[categories]]"
                                    option-label="display_name"
                                    option-value="value"
                                    required$="[[_setRequired('category', editedApBase)]]"
                                    disabled$="{{isReadOnly('category', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('category', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.category}}"
                                    error-message="{{errors.category}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-l">
                            <!-- Description -->
                            <paper-textarea
                                    class$="validate-input {{_setRequired('description', editedApBase)}}"
                                    value="{{editedItem.description}}"
                                    allowed-pattern="[\d\s]"
                                    label="[[getLabel('description', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('description', editedApBase)]]"
                                    required$="{{_setRequired('description', editedApBase)}}"
                                    disabled="{{isReadOnly('description', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('description', editedApBase, requestInProcess)}}"
                                    max-rows="4"
                                    invalid="{{errors.description}}"
                                    error-message="{{errors.description}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </paper-textarea>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-ms">
                            <!-- Assigned To -->

                            <etools-dropdown
                                    class$="[[_setRequired('assigned_to', editedApBase)]]
                                            disabled-as-readonly validate-input fua-person"
                                    selected="{{editedItem.assigned_to.id}}"
                                    label="[[getLabel('assigned_to', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('assigned_to', editedApBase, 'select')]]"
                                    options="[[users]]"
                                    option-label="full_name"
                                    option-value="id"
                                    required$="[[_setRequired('assigned_to', editedApBase)]]"
                                    disabled$="{{isReadOnly('assigned_to', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('assigned_to', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.assigned_to}}"
                                    error-message="{{errors.assigned_to}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>

                        <div class="input-container input-container-ms">
                            <!-- Sections -->

                            <etools-dropdown
                                    class$="[[_setRequired('section', editedApBase)]]
                                            disabled-as-readonly validate-input fua-person"
                                    selected="{{editedItem.section.id}}"
                                    label="[[getLabel('section', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('section', editedApBase, 'select')]]"
                                    options="[[sections]]"
                                    option-label="name"
                                    option-value="id"
                                    required$="[[_setRequired('section', editedApBase)]]"
                                    disabled$="{{isReadOnly('section', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('section', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.section}}"
                                    error-message="{{errors.section}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-ms">
                            <!-- Offices -->

                            <etools-dropdown
                                    class$="[[_setRequired('office', editedApBase)]]
                                            disabled-as-readonly validate-input fua-person"
                                    selected="{{editedItem.office.id}}"
                                    label="[[getLabel('office', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('office', editedApBase, 'select')]]"
                                    options="[[offices]]"
                                    option-label="name"
                                    option-value="id"
                                    required$="[[_setRequired('office', editedApBase)]]"
                                    disabled$="{{isReadOnly('office', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('office', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.office}}"
                                    error-message="{{errors.office}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </etools-dropdown>
                        </div>

                        <div class="input-container input-container-40">
                            <!-- Due Date -->
                            <datepicker-lite
                                    id="deadlineAction"
                                    class$="[[_setRequired('due_date', editedApBase)]]
                                            disabled-as-readonly validate-input"
                                    value="{{editedItem.due_date}}"
                                    label="[[getLabel('due_date', editedApBase)]]"
                                    placeholder="[[getPlaceholderText('due_date', editedApBase, 'select')]]"
                                    required$="[[_setRequired('due_date', editedApBase)]]"
                                    disabled$="{{isReadOnly('due_date', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('due_date', editedApBase, requestInProcess)}}"
                                    invalid="{{errors.due_date}}"
                                    error-message="{{errors.due_date}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError"
                                    selected-date-display-format="D MMM YYYY">
                            </datepicker-lite>
                        </div>
                    </div>

                    <div class="row-h group">
                        <!-- High Priority -->
                        <div class="input-container checkbox-container input-container-l">
                            <paper-checkbox
                                    class="disabled-as-readonly"
                                    checked="{{editedItem.high_priority}}"
                                    disabled="{{isReadOnly('high_priority', editedApBase, requestInProcess)}}"
                                    readonly$="{{isReadOnly('high_priority', editedApBase, requestInProcess)}}">
                                    This action point is high priority
                            </paper-checkbox>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-complete" hidden$="[[!_allowComplete(editedApBase)]]">
                <paper-button>
                    <a href$="[[editedItem.url]]" target="_blank">Go To action points to complete
                        <iron-icon icon="icons:launch"></iron-icon>
                    </a>
                </paper-button>
            </div>
        </etools-dialog>

            `;
  }
  static get observers() {
    return [
      '_resetDialog(dialogOpened)',
      '_errorHandler(errorObject)',
      '_checkNonField(errorObject)',
      'setPermissionPath(baseEngagementPath)',
      'updateStyles(editedApBase)',
      '_addComputedField(dataItems.*)',
      '_orderChanged(orderBy, columns, dataItems.*)',
      '_requestPartner(partnerData, selectedPartnerId, partners)'
    ];
  }

  @property({type: Array})
  dataItems!: [];

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

  @property({type: Array})
  columns: GenericObject[] = [
    {
      size: 18,
      label: 'Reference Number #',
      name: 'reference_number',
      link: '*ap_link*',
      ordered: 'desc',
      path: 'reference_number',
      target: '_blank',
      class: 'with-icon',
      orderBy: 'id'
    },
    {
      size: 32,
      label: 'Action Point Category',
      labelPath: 'category',
      path: 'ap_category.display_name',
      name: 'category'
    },
    {
      size: 20,
      label: 'Assignee (Section / Office)',
      htmlLabel: 'Assignee<br/>(Section / Office)',
      path: 'computed_field',
      html: true,
      class: 'no-order'
    },
    {
      size: 10,
      label: 'Status',
      labelPath: 'status',
      align: 'center',
      property: 'status',
      path: 'status',
      class: 'caps',
      name: 'status'
    },
    {
      size: 10,
      label: 'Due Date',
      labelPath: 'due_date',
      path: 'due_date',
      name: 'date',
      align: 'center'
    },
    {
      size: 10,
      label: 'Priority',
      labelPath: 'high_priority',
      path: 'priority',
      align: 'center',
      name: 'high_priority'
    }
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
  partners: GenericObject[] = [];

  @property({type: Array})
  sections: GenericObject[] = [];

  @property({type: Array})
  offices: GenericObject[] = [];

  @property({type: String})
  orderBy = '-reference_number';

  @property({type: Boolean, computed: '_checkNotTouched(copyDialog, editedItem.*)'})
  notTouched = false;

  @property({type: Object})
  requestData!: GenericObject;

  @property({type: Number})
  _selectedAPIndex!: number | null;

  @property({type: Boolean})
  copyDialog!: boolean;

  @property({type: String})
  editedApBase!: string;

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

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  @property({type: Object})
  loadPartnersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  public connectedCallback() {
    super.connectedCallback();

    this.set('users', getStaticData('users') || []);
    this.watchForAllUsersLoaded();

    this.set('offices', getStaticData('offices') || []);
    this.set('sections', getStaticData('sections') || []);
    this.set('partners', getStaticData('partners') || []);
    this.watchForAllPartnersLoaded();

    if (!collectionExists('edited_ap_options')) {
      addToCollection('edited_ap_options', {});
    }

    this._requestCompleted = this._requestCompleted.bind(this);
    this.addEventListener('ap-request-completed', this._requestCompleted as any);
    if (!getStaticData('allUsersAreLoaded')) {
      this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
    }
    if (!getStaticData('allPartnersAreLoaded')) {
      this.loadPartnersDropdownOptions = this._loadPartnersDropdownOptions.bind(this);
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
      this.set('users', data);
    });
  }
  _loadPartnersDropdownOptions(search: string, page: number, shownOptionsLimit: number) {
    const endpoint = clone(famEndpoints.partnerOrganisations);
    endpoint.url += `?page_size=${shownOptionsLimit}&page=${page}&search=${search || ''}`;
    sendRequest({
      method: 'GET',
      endpoint: endpoint
    }).then((resp: GenericObject) => {
      const data = page > 1 ? [...this.partners, ...resp.results] : resp.results;
      this.set('partners', data);
    });
  }

  public disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('ap-request-completed', this._requestCompleted as any);
  }

  watchForAllUsersLoaded() {
    const interval = setInterval(() => {
      if (getStaticData('allUsersAreLoaded')) {
        clearInterval(interval);
        this.set('users', getStaticData('users') || []);
        this.loadUsersDropdownOptions = undefined;
      }
    }, 400);
  }
  watchForAllPartnersLoaded() {
    const interval = setInterval(() => {
      if (getStaticData('allPartnersAreLoaded')) {
        clearInterval(interval);
        this.set('partners', getStaticData('partners') || []);
        this.loadPartnersDropdownOptions = undefined;
      }
    }, 400);
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
    this.resetDialog(dialogOpened);
  }

  _orderChanged(newOrder, columns) {
    if (!newOrder || !(columns instanceof Array)) {
      return false;
    }

    let direction = 'asc';
    let name = newOrder;
    let orderBy;

    if (name.startsWith('-')) {
      direction = 'desc';
      name = name.slice(1);
    }

    columns.forEach((column, index) => {
      if (column.name === name) {
        this.set(`columns.${index}.ordered`, direction);
        orderBy = column.orderBy || name;
      } else {
        this.set(`columns.${index}.ordered`, false);
      }
    });

    const sorted = sortBy(this.dataItems, (item) => item[orderBy]);
    this.itemsToDisplay = direction === 'asc' ? sorted : sorted.reverse();
  }

  _addComputedField() {
    this.itemsToDisplay = this.dataItems.map((item: any) => {
      item.priority = (item.high_priority && 'High') || ' ';
      const assignedTo = get(item, 'assigned_to.name', '--');
      const section = get(item, 'section.name', '--');
      const office = get(item, 'office.name', '--');
      item.computed_field = `<b>${assignedTo}</b> <br>(${section} / ${office})`;
      item.ap_category = find(this.categories, (category) => category.value === item.category);
      return item;
    });
  }

  setPermissionPath(basePath) {
    this.basePermissionPath = basePath ? `${basePath}_ap` : '';
    this.set('categories', getChoices(`${this.basePermissionPath}.category`) || []);
    this.canBeChanged = !readonlyPermission(`${this.basePermissionPath}.POST`);
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
        return +value.id !== +get(this, `originalEditedObj.${fieldName}.id`, 0);
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
    if (!this.validate() || this.notTouched) {
      return;
    }

    this.requestInProcess = true;
    const apData = this.getActionsData();
    if (apData) {
      const method = apData.id ? 'PATCH' : 'POST';
      this.requestData = {method, apData};
    } else {
      this._requestCompleted({detail: {success: true}});
    }
  }

  _requestCompleted(event) {
    if (!event || !event.detail) {
      return;
    }
    const detail = event.detail;
    this.requestInProcess = false;
    if (detail && detail.success) {
      this.dialogOpened = false;
    }
  }

  _openAddDialog() {
    this.originalEditedObj = {};
    each(['assigned_to', 'office', 'section', 'intervention'], (field) => {
      this.editedItem[field] = {id: null};
    });
    this.editedApBase = this.basePermissionPath;
    this.openAddDialog();
  }

  _openEditDialog(event) {
    this.editedApBase = '';
    fireEvent(this, 'global-loading', {type: 'get-ap-options', active: true, message: 'Loading data...'});

    const index = this._getIndex(event);
    this._selectedAPIndex = index;

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

  _openCopyDialog(event) {
    this.dialogTitle = (this.copyDialogTexts && this.copyDialogTexts.title) || 'Add New Item';
    this.confirmBtnText = 'Save';
    this.cancelBtnText = 'Cancel';
    const index = this._getIndex(event);
    const data = omit(this.dataItems[index], ['id']);
    this.editedItem = data;
    this.originalEditedObj = cloneDeep(data);
    this.editedApBase = this.basePermissionPath;

    this.copyDialog = true;
    this.dialogOpened = true;
  }

  _checkNotTouched(copyDialog) {
    if (!copyDialog || isEmpty(this.originalEditedObj)) {
      return false;
    }
    return every(this.originalEditedObj, (value, key) => {
      const isObj = isObject(value);
      if (isObj) {
        return !value.id || +value.id === +get(this, `editedItem.${key}.id`);
      } else {
        return value === this.editedItem[key];
      }
    });
  }

  _handleOptionResponse(detail) {
    fireEvent(this, 'global-loading', {type: 'get-ap-options'});
    if (detail && detail.actions) {
      updateCollection('edited_ap_options', detail.actions);
    }
    this.editedApBase = 'edited_ap_options';
    const itemIndex = this._selectedAPIndex;
    this._selectedAPIndex = null;

    if (collectionExists('edited_ap_options.PUT')) {
      this.openEditDialog({itemIndex});
    } else {
      this.dialogTitle = get(this, 'viewDialogTexts.title');
      this.confirmBtnText = '';
      this.cancelBtnText = 'Cancel';
      // @ts-ignore Defined in tableElementsMixin, not visible because of EtoolsAjaxRequestMixin
      this._openDialog(itemIndex);
    }
  }

  canBeEdited(status) {
    return status !== 'completed';
  }
}
window.customElements.define('follow-up-actions', FollowUpActions);
export default FollowUpActions;
