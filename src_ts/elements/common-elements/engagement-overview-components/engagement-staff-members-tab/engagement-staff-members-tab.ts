import {LitElement, html, PropertyValues, property, customElement} from 'lit-element';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';

import isUndefined from 'lodash-es/isUndefined';
import each from 'lodash-es/each';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../types/global';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {getUserData} from '../../../mixins/user-controller';
import CommonMethodsMixinLit from '../../../mixins/common-methods-mixin-lit';
import TableElementsMixinLit from '../../../mixins/table-elements-mixin-lit';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {moduleStyles} from '../../../styles/module-styles-lit';
import '../../../data-elements/get-staff-members-list';
import {checkNonField, refactorErrorObject} from '../../../mixins/error-handler';
import {getStaffCollectionName} from '../../../data-elements/get-staff-members-list';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button/paper-toggle-button.js';
import {EtoolsTableColumnType} from '@unicef-polymer/etools-table';

/**
 * @LitElement
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-staff-members-tab')
export class EngagementStaffMembersTab extends TableElementsMixinLit(CommonMethodsMixinLit(LitElement)) {
  static get styles() {
    return [moduleStyles, tabInputsStyles];
  }
  render() {
    return html`
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
          color: var(--primary-color);
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
          --paper-input-error_-_position: position: relative !important;
          --paper-input-error_-_white-space: normal;
        }
        .white {
          color: #ffffff;
        }
        .panel-btns-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          column-gap: 30px;
        }
        paper-toggle-button.white {
          --paper-toggle-button-label-color: #ffffff;
          --paper-toggle-button-checked-bar-color: #ffffff !important;
          --paper-toggle-button-checked-button-color: #ffffff;
          --paper-toggle-button-checked-ink-color: #ffffff;
          --paper-toggle-button-unchecked-button-color: #bfbfbf;
          --paper-toggle-button-unchecked-bar-color: #bfbfbf !important;
          --paper-toggle-button-unchecked-ink-color: #bfbfbf;
        }
      </style>

      <!--requests-->
      <get-staff-members-list
        .organisationId="${this.organizationId}"
        .queries="${this.listQueries}"
        .pageType="${this.pageType}"
        @data-loaded="${this.listLoaded}"
        @loading-state-changed="${this.listLoadingStateChanged}"
      >
      </get-staff-members-list>

      <!--end requests-->

      <etools-content-panel
        panel-title="${this._getTitle(
          'staff_members',
          this.basePermissionPath,
          this.datalength,
          this.dataItems.length,
          this.searchQuery
        )}"
        list
      >
        <div slot="panel-btns">
          <div class="panel-btns-container">
            <div class="search-input-container" ?hidden="${!this._showPagination(this.datalength)}">
              <paper-input
                id="searchInput"
                class="search-input ${this._getSearchInputClass(this.searchString)}"
                .value="${this.searchString}"
                placeholder="Search"
                @blur="${this.searchBlur}"
                @input="${this._searchChanged}"
                data-value-path="target.value"
                data-field-path="searchString"
              >
                <iron-icon id="searchIcon" icon="search" class="panel-button" slot="prefix"></iron-icon>
              </paper-input>
              <paper-tooltip for="searchIcon" offset="0">Search</paper-tooltip>
            </div>
            <paper-toggle-button
              class="white"
              id="toggleActive"
              ?checked="${this.showInactive}"
              @change="${this.onShowInactiveChanged}"
            >
              Show Inactive
            </paper-toggle-button>
            <div class="add-button-container">
              <a
                class="white"
                href="${this._getAMPLink(this.engagement.agreement.auditor_firm.organization_id)}"
                target="_blank"
              >
                <iron-icon id="information-icon" icon="icons:open-in-new"></iron-icon>
              </a>
              <paper-tooltip offset="0">Access Management Portal</paper-tooltip>
            </div>
          </div>
        </div>

        <div class="panel-content group">
          <etools-loading .active="${this.listLoading}" loading-text="Loading list data..." class="loading">
          </etools-loading>

          <etools-table .columns="${this.columns}" .items="${this.dataItems}" singleSort></etools-table>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  mainProperty = 'staff_members';

  @property({type: String})
  staffsBase = '';

  @property({type: Array})
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
      label: 'Has Access',
      name: 'hasAccess',
      property: 'hasAccess',
      type: EtoolsTableColumnType.Checkbox
    },
    {
      label: 'Position',
      labelPath: 'staff_members.user.profile.job_title',
      name: 'user.profile.job_title',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text'
    },
    {
      label: 'First Name',
      labelPath: 'staff_members.user.first_name',
      name: 'user.first_name',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text'
    },
    {
      label: 'Last Name',
      labelPath: 'staff_members.user.last_name',
      name: 'user.last_name',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text'
    },
    {
      label: 'Phone Number',
      labelPath: 'staff_members.user.profile.phone_number',
      name: 'user.profile.phone_number',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text'
    },
    {
      label: 'E-mail Address',
      labelPath: 'staff_members.user.email',
      name: 'user.email',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text'
    },
    {
      label: 'Active',
      path: 'computed_field',
      name: 'has_active_realm',
      type: EtoolsTableColumnType.Text,
      customCss: 'wrap-text',
      html: true
    }
  ];

  @property({type: Object})
  listQueries: GenericObject = {
    page: 1,
    page_size: 10
  };

  @property({type: Object})
  engagementStaffs: GenericObject = {};

  @property({type: Boolean})
  listLoading = false;

  @property({type: String})
  // computed: '_calcShowingResults(datalength, listSize, listPage, searchQuery, ' + 'dataItems.length)'
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
  newEmail: string | null = '';

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Number})
  listSize!: number;

  @property({type: Number})
  lastSize!: number;

  @property({type: Number})
  listPage!: number;

  @property({type: Number})
  organizationId!: number;

  @property({type: String})
  basePermissionPath = '';

  @property({type: Boolean})
  emailChecking!: boolean;

  @property({type: Boolean})
  showInactive!: boolean;

  @property({type: Object})
  newData!: GenericObject;

  @property({type: Object})
  lastSearchQuery!: GenericObject;

  @property({type: String})
  pageType = '';

  @property({type: String})
  searchString = '';

  private _newRequestDebouncer!: Debouncer;

  connectedCallback() {
    super.connectedCallback();
    this.listSize = 10;
    this.listPage = 1;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('basePermissionPath')) {
      this.changePermission(this.basePermissionPath);
    }
    if (changedProperties.has('errorObject')) {
      this._handleUpdateError(this.errorObject?.staff_members);
    }
    if (changedProperties.has('engagement') || changedProperties.has('basePermissionPath')) {
      this._organizationChanged(this.engagement.agreement.auditor_firm.id);
      this._selectedStaffsChanged(this.engagement.staff_members);
    }
    if (
      changedProperties.has('listSize') ||
      changedProperties.has('listPage') ||
      changedProperties.has('searchQuery')
    ) {
      this._queriesChanged(this.listSize, this.listPage, this.searchQuery);
    }
    if (changedProperties.has('dataItems') || changedProperties.has('engagementStaffs')) {
      this._staffMembersListChanged(this.dataItems, this.engagementStaffs);
    }
    if (changedProperties.has('dataItems')) {
      this._dataItemsChanged(this.dataItems);
    }
  }

  changePermission(basePermissionPath) {
    // @ dci need to show/hide hasAccess column
    return;
    if (!basePermissionPath) {
      return;
    }
    const editObj = this.columns && this.columns[0];
    if (this._canBeChanged() && editObj && editObj.name !== 'hasAccess') {
      // each(this.columns, (_value, index) => {
      //   this.set(`columns.${index}.size`, 16);
      // });
      // this.set(`columns.${this.columns.length - 1}.size`, 10);
      this.columns.unshift({
        size: 10,
        label: 'Has Access',
        name: 'hasAccess',
        property: 'hasAccess',
        checkbox: true
      });
    } else if (!this._canBeChanged() && editObj && editObj.name === 'hasAccess') {
      this.columns.shift();
      // each(this.columns, (_value, index) => {
      //   this.set(`columns.${index}.size`, 18);
      // });
      // this.set(`columns.${this.columns.length - 1}.size`, 10);
    }
  }

  listLoadingStateChanged(event: CustomEvent): void {
    this.listLoading = event.detail.state;
  }

  listLoaded(event: CustomEvent): void {
    const data = event.detail;
    this.staffsBase = getStaffCollectionName(this.organizationId);
    this.dataItems = data.results;
    this.computeStaffMembActiveColumn();
    if (!this.listQueries?.search) {
      this.datalength = data.count;
    }
  }

  computeStaffMembActiveColumn() {
    this.dataItems?.map((item: any) => {
      item.computed_field = !item.user.is_active ? 'Inactive' : !item.has_active_realm ? 'No Access' : `&#10003;`;
    });
  }

  onShowInactiveChanged(e: CustomEvent) {
    this.showInactive = Boolean((e.target as PaperToggleButtonElement).checked);
  }

  _isVisible(active: boolean, showInactive: boolean) {
    return active || showInactive;
  }

  _organizationChanged(id) {
    if (!this._canBeChanged() || !this.basePermissionPath) {
      return;
    }
    if (!id) {
      this.resetList();
    }
    this.organizationId = +id;
  }

  _getAMPLink(organizationId: number) {
    const user = getUserData();
    let url = `/amp/users/`;
    if (user && user.is_unicef_user) {
      url += `list?organization_type=audit&organization_id=${organizationId}`;
    }
    return url;
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

    this.listQueries = {
      page_size: listSize,
      page: listPage,
      search: searchQuery || ''
    };
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
    this.computeStaffMembActiveColumn();
  }

  _selectedStaffsChanged(data) {
    if (!data) {
      return;
    }
    if (!this._canBeChanged()) {
      this.dataItems = cloneDeep(data);
      return;
    }
    if (!this.engagementStaffs) {
      this.engagementStaffs = {};
    }
    each(data, (staff) => {
      this.engagementStaffs[staff.user.email] = staff.id;
    });
    if (this.dataItems) {
      each(this.dataItems, (staff: GenericObject, index) => {
        this.dataItems[index].hasAccess = !!this.engagementStaffs[staff.user.email];
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

  updatePagination(event: CustomEvent): void {
    this.listPage = event.detail.pageNumber;
    this.listSize = event.detail.pageSize;
  }

  _isActive(event) {
    const item = event && event.model && event.model.item;
    if (!item) {
      throw new Error('Can not get item model!');
    }
    item.hasAccess = event.target.checked;

    const me = getUserData() || {};
    const updateOptions = get(item, 'user.email') === me.email;

    this.manageEngagementStaff(item);
    this._updateEngagement(true, updateOptions);
  }

  _showPagination(dataItems) {
    return !!(+dataItems && +dataItems > 10);
  }

  _getTitle(path, basePermission, length, length2, search) {
    return `${this.getLabel(path, basePermission)} (${this._staffLength(length, length2, search)})`;
  }

  _staffLength(length, length2, search) {
    const staffLength = search ? length2 : length || length2;
    return staffLength || 0;
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

    this.errors = error;
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
    this.dataItems = [];
    this.listPage = 1;
    this.searchQuery = '';
    this.searchString = '';
    this.engagementStaffs = {};
    this.datalength = 0;
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
    // @dci can be removed ???
  }

  _searchChanged(e: any) {
    this._setField(e);
    setTimeout(() => {
      const value = (this.shadowRoot?.querySelector('#searchInput') as any).value || '';

      if (value.length - 1) {
        this._newRequestDebouncer = Debouncer.debounce(this._newRequestDebouncer, timeOut.after(500), () => {
          this.searchQuery = value;
        });
      }
    });
  }

  _isCheckboxReadonly(checked, staffs, buttonSave) {
    return !buttonSave && checked && Object.keys(staffs || {}).length === 1;
  }
}
