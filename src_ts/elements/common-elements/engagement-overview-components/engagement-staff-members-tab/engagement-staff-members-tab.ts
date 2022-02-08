import {PolymerElement, html} from '@polymer/polymer';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';

import isUndefined from 'lodash-es/isUndefined';
import each from 'lodash-es/each';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import trim from 'lodash-es/trim';
import isEqual from 'lodash-es/isEqual';
import findIndex from 'lodash-es/findIndex';
import isNumber from 'lodash-es/isNumber';
import isString from 'lodash-es/isString';
import {fireEvent} from '../../../utils/fire-custom-event';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {getUserData} from '../../../mixins/user-controller';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import '../../../data-elements/get-staff-members-list';
import '../../list-tab-elements/list-header/list-header';
import '../../list-tab-elements/list-element/list-element';
import '../../list-tab-elements/list-pagination/list-pagination';
import '../../../data-elements/check-user-existence';
import '../../../data-elements/update-staff-members';
import {refactorErrorObject, checkNonField} from '../../../mixins/error-handler';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
class EngagementStaffMembersTab extends TableElementsMixin(CommonMethodsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }
        .email-loading {
          position: absolute;
          top: 25px;
          left: auto;
          background-color: #fff;
        }
        .email-loading:not([active]) {
          display: none !important;
        }
        etools-content-panel div[slot='panel-btns'] {
          width: 100%;
          top: 0;
        }
        etools-content-panel .add-button-container {
          float: right;
          line-height: 48px;
        }
        .search-input-container {
          float: right;
          height: 48px;
          color: #fff;
          overflow: hidden;
          width: 22%;
        }
        .search-input-container .search-input {
          width: 5%;
          float: right;
          box-sizing: border-box;
          min-width: 46px;
          margin-top: -13px;
          transition: 0.35s;
          cursor: pointer;
        }
        .search-input-container .search-input[focused] {
          width: 100%;
        }
        .search-input-container .search-input:not(.empty) {
          width: 100% !important;
        }
        .search-input-container .search-input iron-icon {
          top: -1px;
          color: #fff;
        }
        .edit-icon {
          padding: 5px;
          width: 33px;
          height: 33px;
          color: var(--gray-mid);
        }
        .edit-icon-slot {
          overflow: visible !important;
          display: flex;
          align-items: center;
          height: 100%;
        }
        .check-icon {
          margin-left: -3%;
        }
        .form-title {
          position: relative;
          width: 100%;
          line-height: 40px;
          color: var(--module-primary);
          font-weight: 600;
          box-sizing: border-box;
          margin: 10px 0 0 !important;
          padding: 0 !important;
        }
        .form-title .text {
          background-color: var(--gray-06);
          border-radius: 3px;
          margin: 0 24px;
          padding: 0 24px;
        }
        .line {
          width: 'calc(100% - 48px)';
          margin-left: 24px;
          box-sizing: border-box;
          margin-bottom: 0 !important;
          border-bottom: 1px solid var(--gray-border);
        }
        .notify-box {
          padding-left: 12px;
          box-sizing: border-box;
        }
        .confirm-backdrop[opened] {
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 104;
        }
        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }
        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
        .panel-content {
          position: relative;
          margin-bottom: -7px;
          padding-bottom: 0;
        }
        .checkbox {
          overflow: visible !important;
          line-height: 48px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        list-pagination {
          --list-pagination-styles-margin-bottom: -8px;
        }
        etools-loading {
          --etools-loading-overlay-transparency: 0.4;
        }
        paper-input.search-input {
          --paper-input-container-color: rgba(255, 255, 255, 0.5);
          --paper-input-container-focus-color: #fff;
          --paper-input-container-input-color: #fff;
          --paper-input-container-underline-focus-border-bottom: 1px solid #fff;
          --paper-input-container-underline-border-bottom: none;
          --paper-input-container-underline: {
            display: none;
          }
        }
        paper-input.search-input.filled {
          --paper-input-container-underline-border-bottom: 1px solid rgba(255, 255, 255, 0.7);
        }
        paper-input.email {
          --paper-input-error: {
            position: relative !important;
            white-space: normal;
          }
        }
      </style>

      <!--requests-->
      <get-staff-members-list
        organisation-id="{{organisationId}}"
        staffs-base="{{staffsBase}}"
        datalength="{{datalength}}"
        queries="{{listQueries}}"
        data-items="{{dataItems}}"
        list-loading="{{listLoading}}"
        page-type="[[pageType]]"
      >
      </get-staff-members-list>

      <update-staff-members organisation-id="[[organisationId]]" staff-data="{{newData}}"></update-staff-members>

      <check-user-existence
        email="{{newEmail}}"
        email-checking="{{emailChecking}}"
        errors="{{errors}}"
        organisation-id="[[organisationId]]"
        edited-item="{{editedItem}}"
        unicef-users-allowed="{{engagement.agreement.auditor_firm.unicef_users_allowed}}"
      >
      </check-user-existence>
      <!--end requests-->

      <etools-content-panel
        panel-title="[[getLabel('staff_members', basePermissionPath)]] ([[_staffLength(datalength,
                            dataItems.length, searchQuery)]])"
        list
      >
        <div slot="panel-btns">
          <div class="add-button-container">
            <paper-icon-button
              class="panel-button"
              hidden$="[[!_showAddButton(basePermissionPath, engagement.agreement, listLoading)]]"
              on-tap="_openAddDialog"
              icon="add-box"
            >
            </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>

          <div class="search-input-container" hidden$="[[!_showPagination(datalength)]]">
            <paper-input
              id="searchInput"
              class$="search-input [[_getSearchInputClass(searchString)]]"
              value="{{searchString}}"
              placeholder="Search"
              on-blur="searchBlur"
              on-input="_searchChanged"
            >
              <iron-icon id="searchIcon" icon="search" class="panel-button" slot="prefix"></iron-icon>
            </paper-input>
            <paper-tooltip for="searchIcon" offset="0">Search</paper-tooltip>
          </div>
        </div>

        <div class="panel-content group">
          <etools-loading active="[[listLoading]]" loading-text="Loading list data..." class="loading">
          </etools-loading>

          <list-header no-additional no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]">
          </list-header>

          <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
            <list-element class="list-element" data="[[item]]" no-additional headings="[[columns]]" no-animation>
              <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
                <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"> </paper-icon-button>
                <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"> </paper-icon-button>
              </div>

              <div slot="checkbox" class="checkbox">
                <paper-checkbox
                  disabled="{{_isCheckboxReadonly(item.hasAccess, engagementStaffs, saveWithButton)}}"
                  on-tap="_isActive"
                  checked="{{item.hasAccess}}"
                  label=""
                >
                </paper-checkbox>
              </div>
            </list-element>
          </template>

          <template is="dom-if" if="[[!dataItems.length]]">
            <list-element class="list-element" data="[[emptyObj]]" no-additional headings="[[columns]]" no-animation>
            </list-element>
          </template>

          <list-pagination
            page-size="{{listSize}}"
            page-number="{{listPage}}"
            datalength="{{_staffLength(datalength, dataItems.length, searchQuery)}}"
            without-queries
            hidden$="[[!_showPagination(datalength)]]"
            showing-results="{{showingResults}}"
          >
          </list-pagination>
        </div>
      </etools-content-panel>

      <etools-dialog
        theme="confirmation"
        size="md"
        keep-dialog-open
        opened="{{confirmDialogOpened}}"
        on-confirm-btn-clicked="removeStaff"
        disable-confirm-btn="{{requestInProcess}}"
        ok-btn-text="Delete"
        openFlag="confirmDialogOpened"
        on-close="_resetDialogOpenedFlag"
      >
        [[deleteTitle]]
      </etools-dialog>

      <etools-dialog
        id="staff-members"
        no-padding
        opened="{{dialogOpened}}"
        dialog-title="[[dialogTitle]]"
        size="md"
        ok-btn-text="[[confirmBtnText]]"
        show-spinner="{{requestInProcess}}"
        disable-confirm-btn="{{requestInProcess}}"
        keep-dialog-open
        on-confirm-btn-clicked="_addStaffFromDialog"
        openFlag="dialogOpened"
        on-close="_resetDialogOpenedFlag"
      >
        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container">
                <!-- Email address -->
                <paper-input
                  id="emailInput"
                  class$="validate-input {{_setRequired('user.email', staffsBase)}} email"
                  value="{{editedItem.user.email}}"
                  label="[[getLabel('user.email', staffsBase)]]"
                  placeholder="Enter E-mail"
                  required="{{_setRequired('user.email', staffsBase)}}"
                  disabled="{{_emailDisabled(requestInProcess, addDialog, emailChecking)}}"
                  readonly$="{{_emailDisabled(requestInProcess, addDialog, emailChecking)}}"
                  maxlength="45"
                  invalid="{{errors.user.email}}"
                  error-message="{{errors.user.email}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                  on-blur="_checkEmail"
                >
                  <iron-icon slot="prefix" icon="communication:email"></iron-icon>
                </paper-input>
                <etools-loading active="{{emailChecking}}" no-overlay loading-text="" class="email-loading">
                </etools-loading>
              </div>

              <div class="input-container">
                <!-- First Name -->
                <paper-input
                  class$="validate-input {{_setRequired('user.first_name', staffsBase)}}"
                  value="{{editedItem.user.first_name}}"
                  label="[[getLabel('user.first_name', staffsBase)]]"
                  placeholder="Enter First Name"
                  required="{{_setRequired('user.first_name', staffsBase)}}"
                  disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  maxlength="30"
                  invalid="{{errors.user.first_name}}"
                  error-message="{{errors.user.first_name}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </paper-input>
              </div>

              <div class="input-container">
                <!-- Last Name -->
                <paper-input
                  class$="validate-input {{_setRequired('user.last_name', staffsBase)}}"
                  value="{{editedItem.user.last_name}}"
                  label="[[getLabel('user.last_name', staffsBase)]]"
                  placeholder="Enter Last Name"
                  required="{{_setRequired('user.last_name', staffsBase)}}"
                  disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  maxlength="30"
                  invalid="{{errors.user.last_name}}"
                  error-message="{{errors.user.last_name}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </paper-input>
              </div>
            </div>

            <div class="input-container">
              <!-- Position -->
              <paper-input
                class$="validate-input {{_setRequired('user.profile.job_title', staffsBase)}}"
                value="{{editedItem.user.profile.job_title}}"
                label="[[getLabel('user.profile.job_title', staffsBase)]]"
                placeholder="Enter Position"
                required="{{_setRequired('user.profile.job_title', staffsBase)}}"
                disabled="{{requestInProcess}}"
                readonly$="{{requestInProcess}}"
                maxlength="45"
                invalid="{{errors.profile.job_title}}"
                error-message="{{errors.profile.job_title}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
              >
              </paper-input>
            </div>

            <div class="row-h group">
              <div class="input-container">
                <!-- Phone number -->
                <paper-input
                  class$="validate-input {{_setRequired('user.profile.phone_number', staffsBase)}}"
                  value="{{editedItem.user.profile.phone_number}}"
                  allowed-pattern="[0-9\\ \\.\\+\\-\\(\\)]"
                  label="[[getLabel('user.profile.phone_number', staffsBase)]]"
                  placeholder="Enter Phone"
                  required="{{_setRequired('user.profile.phone_number', staffsBase)}}"
                  disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  maxlength="20"
                  invalid="{{errors.user.profile.phone_number}}"
                  error-message="{{errors.user.profile.phone_number}}"
                >
                  <iron-icon slot="prefix" icon="communication:phone"></iron-icon>
                </paper-input>
              </div>
            </div>

            <div class="row-h group">
              <!--receive notification-->
              <div class="staff-check-box notify-box input-container input-container-l">
                <paper-checkbox
                  checked="{{editedItem.hasAccess}}"
                  disabled="{{_isCheckboxReadonly(editedItem.hasAccess, engagementStaffs,
                                            saveWithButton)}}"
                  disabled$="{{_isCheckboxReadonly(editedItem.hasAccess, engagementStaffs,
                                            saveWithButton)}}"
                >
                  Has Access
                </paper-checkbox>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      'changePermission(basePermissionPath)',
      '_handleUpdateError(errorObject.staff_members)',
      '_organizationChanged(engagement.agreement.auditor_firm.id, basePermissionPath)',
      '_organizationChanged(engagement.agreement.auditor_firm.id)',
      '_queriesChanged(listSize, listPage, searchQuery)',
      '_staffMembersListChanged(dataItems, engagementStaffs)',
      '_selectedStaffsChanged(engagement.staff_members, basePermissionPath)',
      'updateStyles(emailChecking, staffsBase, addDialog)'
    ];
  }

  @property({type: String})
  mainProperty = 'staff_members';

  @property({type: Array, observer: '_dataItemsChanged'})
  dataItems: any[] = [];

  @property({type: Object})
  itemModel: GenericObject = {
    user: {
      first_name: '',
      last_name: '',
      email: '',
      profile: {
        job_title: '',
        phone_number: ''
      }
    },
    hasAccess: true
  };

  @property({type: Array})
  columns: any[] = [
    {
      size: '100px',
      label: 'Has Access',
      name: 'hasAccess',
      align: 'center',
      property: 'hasAccess',
      checkbox: true
    },
    {
      size: 20,
      label: 'Position',
      labelPath: 'staff_members.user.profile.job_title',
      name: 'user.profile.job_title',
      customCss: 'wrap-text'
    },
    {
      size: 20,
      label: 'First Name',
      labelPath: 'staff_members.user.first_name',
      name: 'user.first_name',
      customCss: 'wrap-text'
    },
    {
      size: 20,
      label: 'Last Name',
      labelPath: 'staff_members.user.last_name',
      name: 'user.last_name',
      customCss: 'wrap-text'
    },
    {
      size: 20,
      label: 'Phone Number',
      labelPath: 'staff_members.user.profile.phone_number',
      name: 'user.profile.phone_number',
      customCss: 'wrap-text'
    },
    {
      size: 20,
      label: 'E-mail Address',
      labelPath: 'staff_members.user.email',
      name: 'user.email',
      customCss: 'wrap-text'
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Audit Staff Team Member'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Audit Staff Team Member'};

  @property({type: Object})
  listQueries: GenericObject = {
    page: 1,
    page_size: 10
  };

  @property({type: Object})
  engagementStaffs: GenericObject = {};

  @property({type: Boolean})
  listLoading = false;

  @property({
    type: String,
    computed: '_calcShowingResults(datalength, listSize, listPage, searchQuery, ' + 'dataItems.length)'
  })
  showingResults!: string;

  @property({type: Number})
  datalength = 0;

  @property({type: String})
  searchQuery = '';

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this Audit Staff Team Member?';

  @property({type: Boolean})
  saveWithButton = false;

  @property({type: String})
  newEmail = '';

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Number})
  listSize!: number;

  @property({type: Number})
  lastSize!: number;

  @property({type: Number})
  listPage!: number;

  @property({type: Number})
  organisationId!: number;

  @property({type: String})
  basePermissionPath = '';

  @property({type: Boolean})
  emailChecking!: boolean;

  @property({type: Object})
  newData!: GenericObject;

  @property({type: Object})
  lastSearchQuery!: GenericObject;

  @property({type: String})
  pageType = '';

  private _newRequestDebouncer!: Debouncer;

  connectedCallback() {
    super.connectedCallback();
    this._initListeners();
    (this.$.emailInput as PaperInputElement).validate = this._validEmailAddress.bind(this, this.$.emailInput);
    this.listSize = 10;
    this.listPage = 1;
  }

  _initListeners() {
    this._staffUpdated = this._staffUpdated.bind(this);
    this.addEventListener('staff-updated', this._staffUpdated as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  _removeListeners() {
    this.removeEventListener('staff-updated', this._staffUpdated as any);
  }

  changePermission(basePermissionPath) {
    if (!basePermissionPath) {
      return;
    }
    const editObj = this.columns && this.columns[0];
    if (this._canBeChanged() && editObj && editObj.name !== 'hasAccess') {
      each(this.columns, (_value, index) => {
        this.set(`columns.${index}.size`, 18);
      });
      this.unshift('columns', {
        size: 10,
        label: 'Has Access',
        name: 'hasAccess',
        property: 'hasAccess',
        checkbox: true
      });
    } else if (!this._canBeChanged() && editObj && editObj.name === 'hasAccess') {
      this.shift('columns');
      each(this.columns, (_value, index) => {
        this.set(`columns.${index}.size`, 20);
      });
    }
  }

  _openAddDialog() {
    this.originalEditedObj = {};
    this.openAddDialog();
  }

  _organizationChanged(id) {
    if (!this._canBeChanged() || !this.basePermissionPath) {
      return;
    }
    if (!id) {
      this.resetList();
    }
    this.organisationId = +id;
  }

  _queriesChanged(listSize, listPage, searchQuery) {
    if (!listPage || !listSize) {
      return;
    }

    if (
      ((this.lastSize && this.lastSize !== listSize) ||
        (!isUndefined(this.lastSearchQuery) && this.lastSearchQuery !== searchQuery)) &&
      this.listPage !== 1
    ) {
      this.lastSearchQuery = searchQuery;
      this.lastSize = listSize;
      this.listPage = 1;
      return;
    }
    this.lastSize = listSize;
    this.lastSearchQuery = searchQuery;

    this.set('listQueries', {
      page_size: listSize,
      page: listPage,
      search: searchQuery || ''
    });
  }

  validate() {
    const emailImput = this.$.emailInput as PaperInputElement;
    const elements = this.shadowRoot!.querySelectorAll('.validate-input:not(.email)');
    let valid = true;
    const emailValid = emailImput.disabled || emailImput.validate();

    Array.prototype.forEach.call(elements, (element) => {
      if (element.required && !element.disabled && !element.validate()) {
        element.invalid = 'This field is required';
        element.errorMessage = 'This field is required';
        valid = false;
      }
    });
    return valid && emailValid;
  }

  _staffMembersListChanged(data, staffs) {
    if (!staffs) {
      return;
    }
    each(data, (staff, index) => {
      this.dataItems[index].hasAccess = !!this.engagementStaffs[staff.user.email];
    });
    if (!this.originalTableData) {
      this._dataItemsChanged(this.dataItems);
    }
  }

  _selectedStaffsChanged(data) {
    if (!data) {
      return;
    }
    if (!this._canBeChanged()) {
      this.set('dataItems', cloneDeep(data));
      return;
    }
    if (!this.engagementStaffs) {
      this.set('engagementStaffs', {});
    }
    each(data, (staff) => {
      this.engagementStaffs[staff.user.email] = staff.id;
    });
    if (this.dataItems) {
      each(this.dataItems, (staff: GenericObject, index) => {
        this.set(`dataItems.${index}.hasAccess`, !!this.engagementStaffs[staff.user.email]);
      });
    }
  }

  _calcShowingResults(datalength, listSize, listPage, searchQuery, itemsLength) {
    let last = listSize * listPage;
    let first = last - listSize + 1;
    const length = searchQuery ? itemsLength : datalength;

    if (last > length) {
      last = length;
    }
    if (first > length) {
      first = 0;
    }
    return `${first}-${last} of ${length}`;
  }

  _validEmailAddress(emailInput) {
    const value = trim(emailInput.value);
    const required = emailInput.required;

    const re =
      // eslint-disable-next-line
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (required && !value) {
      this.errors = {user: {email: 'Email is required'}};
      return false;
    }
    if (value && !re.test(value)) {
      this.errors = {user: {email: 'Email is incorrect'}};
      return false;
    }

    let valid = true;

    if (this.saveWithButton) {
      each(this.dataItems, (item: any) => {
        if (item.user && item.user.email === this.editedItem.user.email && item.id && item.id === this.editedItem.id) {
          this.errors = {user: {email: 'Email must be unique'}};
          valid = false;
        }
      });
    }

    return valid;
  }

  _isActive(event) {
    const item = event && event.model && event.model.item;
    if (!item) {
      throw new Error('Can not get item model!');
    }

    const me = getUserData() || {};
    const updateOptions = get(item, 'user.email') === me.email;

    this.manageEngagementStaff(item);
    this._updateEngagement(true, updateOptions);
  }

  _emailDisabled(request, createPopup, emailChecking) {
    return !!(!createPopup || request || emailChecking);
  }

  _checkEmail(event) {
    if (this.emailChecking) {
      return;
    }

    const input = event && event.target;
    const value = input && input.value;

    if (value && this._validEmailAddress(input)) {
      this.newEmail = value;
    }
  }

  _showAddButton(_basePath, agreement, loading) {
    const orgId = agreement && agreement.auditor_firm && agreement.auditor_firm.id;

    return !!orgId && !loading && this._canBeChanged();
  }

  _showPagination(dataItems) {
    return !!(+dataItems && +dataItems > 10);
  }

  _staffLength(length, length2, search) {
    const staffLength = search ? length2 : length || length2;
    return staffLength || 0;
  }

  _addStaffFromDialog(force) {
    if (this.requestInProcess && !force) {
      return;
    }

    // check if errors object is not already set by check-user-existence
    if (this.errors && this.errors.user && this.errors.user.email) {
      return;
    }

    this.errors = {};

    if (!this.validate()) {
      return;
    }

    this.requestInProcess = true;

    const item = cloneDeep(this.editedItem);
    if ((!this.addDialog && !isNaN(this.editedIndex)) || item.id) {
      if (isEqual(this.originalEditedObj, this.editedItem)) {
        this.requestInProcess = false;
        this.dialogOpened = false;
        this.resetDialog();
        return;
      }
      this.set('newData', {
        method: 'PATCH',
        data: item,
        staffIndex: !this.addDialog ? this.editedIndex : null,
        id: `${item.id}/`
      });
    } else {
      const data = item.user_pk ? {user_pk: item.user_pk} : item;
      this.set('newData', {
        method: 'POST',
        id: '',
        data
      });
    }
  }

  removeStaff() {
    const hasAccess = this.get('editedItem.hasAccess');
    const removalForbidden = this._isCheckboxReadonly(hasAccess, this.engagementStaffs, this.saveWithButton);

    if (removalForbidden) {
      fireEvent(this, 'toast', {text: 'Audit Staff Team Members: Please select at least one staff member.'});
      this.set('confirmDialogOpened', false);
      return false;
    }

    this.requestInProcess = true;
    this.set('newData', {
      method: 'DELETE',
      data: {},
      staffIndex: this.editedIndex,
      id: `${this.editedItem.id}/`
    });
  }

  _staffUpdated(event) {
    const details = event.detail;
    if (!details) {
      throw new Error('Detail are not provided!');
    }
    if (details.error) {
      this._handleUpdateError(details.errorData);
      return;
    }

    const me = getUserData() || {};
    const updateOptions = get(details, 'data.user.email') === me.email;

    details.data = details.data || {};
    details.data.hasAccess = this.editedItem.hasAccess;
    if (details.action === 'patch') {
      this.manageEngagementStaff(details.data, details.hasAccess);
      this._updateEngagement(false, updateOptions);
      const index = ~details.index ? details.index : findIndex(this.dataItems, (item) => item.id === details.data.id);
      if (isNumber(index) && ~index) {
        this.splice('dataItems', index, 1, details.data);
      } else {
        this.set('listPage', 0);
        this.set('listPage', 1);
      }
    } else if (details.action === 'post') {
      this.manageEngagementStaff(details.data, details.hasAccess);
      this._updateEngagement(false, updateOptions);
      this.set('listPage', 0);
      this.set('listPage', 1);
    } else if (details.action === 'delete') {
      const last = this.dataItems.length === 1 ? 1 : 0;
      const email = this.editedItem.user.email;
      this.manageEngagementStaff({user: {email: email}});
      this.set('listQueries', {
        page_size: this.listSize,
        page: this.listPage - last || 1
      });
    }

    if (this.editedItem.user_pk && !isEqual(details.data.user, this.editedItem.user)) {
      this.editedIndex = findIndex(this.dataItems, (item) => item.id === details.data.id);
      this.addDialog = false;
      delete this.editedItem.user_pk;
      this.editedItem.id = details.data.id;
      this._addStaffFromDialog(true);
      return;
    }

    this.requestInProcess = false;
    this.dialogOpened = false;
    this.confirmDialogOpened = false;
    this.resetDialog();
  }

  manageEngagementStaff(staff, hasAccess?) {
    if (hasAccess || staff.hasAccess) {
      this.engagementStaffs[staff.user.email] = staff.id;
    } else {
      delete this.engagementStaffs[staff.user.email];
    }
    this.engagementStaffs = cloneDeep(this.engagementStaffs);
  }

  _updateEngagement(quiet, forceOptions) {
    if (!this.saveWithButton) {
      fireEvent(this, 'action-activated', {type: 'save', quietAdding: quiet, forceOptionsUpdate: forceOptions});
    }
  }

  _handleUpdateError(errorData) {
    const nonField = checkNonField(errorData);
    const error = refactorErrorObject(errorData);

    this.set('errors', error);
    this.requestInProcess = false;
    if (isString(error)) {
      const text = ~error.indexOf('required') ? 'Please select at least one staff member.' : error;
      fireEvent(this, 'toast', {text: `Audit Staff Team Members: ${text}`});
    }
    if (nonField) {
      fireEvent(this, 'toast', {text: `Audit Staff Team Members: ${nonField}`});
    }
  }

  resetList() {
    this.set('dataItems', []);
    this.set('listPage', 1);
    this.set('searchQuery', '');
    this.set('searchString', '');
    this.set('engagementStaffs', {});
    this.set('datalength', 0);
    this.updateStyles();
  }

  getTabData() {
    if (!this._canBeChanged()) {
      return null;
    }
    const staffs: any[] = [];
    each(this.engagementStaffs, (value) => {
      staffs.push(value);
    });

    let dataChanged = false;
    if (this.engagement.staff_members.length !== staffs.length) {
      dataChanged = true;
    } else {
      each(this.engagement.staff_members, (staff) => {
        if (!~staffs.indexOf(staff.id)) {
          dataChanged = true;
        }
      });
    }

    return dataChanged ? staffs : null;
  }

  _getSearchInputClass(searchString) {
    if (searchString) {
      return 'filled';
    }
    return 'empty';
  }

  searchBlur() {
    this.updateStyles();
  }

  _searchChanged() {
    const value = (this.$.searchInput as any).value || '';

    if (value.length - 1) {
      this._newRequestDebouncer = Debouncer.debounce(this._newRequestDebouncer, timeOut.after(500), () => {
        this.set('searchQuery', value);
      });
    }
  }

  _isCheckboxReadonly(checked, staffs, buttonSave) {
    return !buttonSave && checked && Object.keys(staffs || {}).length === 1;
  }
}
window.customElements.define('engagement-staff-members-tab', EngagementStaffMembersTab);
