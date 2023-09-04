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

import each from 'lodash-es/each';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../types/global';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {getUserData} from '../../../mixins/user-controller';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import '../../../data-elements/get-staff-members-list';
import {checkNonField, refactorErrorObject} from '../../../mixins/error-handler';
import {getStaffCollectionName} from '../../../data-elements/get-staff-members-list';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @LitElement
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-staff-members-tab')
export class EngagementStaffMembersTab extends PaginationMixin(TableElementsMixin(CommonMethodsMixin(LitElement))) {
  static get styles() {
    return [moduleStyles, tabInputsStyles, gridLayoutStylesLit];
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
        .panel-content {
          position: relative;
          margin-bottom: -7px;
          padding-bottom: 0;
        }
        .checkbox {
          margin-left: 15px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        .editable-row {
          margin-top: 0;
          margin-bottom: 0;
          padding: 12px 0;
        }
        .editable-row paper-icon-button {
          --iron-icon-fill-color: var(--gray-mid);
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
        .organizationId="${this.organizationId}"
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
          this.optionsData,
          this.datalength,
          this.dataItems.length,
          this.listQueries?.search
        )}"
        list
      >
        <div slot="panel-btns">
          <div class="panel-btns-container">
            <div class="search-input-container" ?hidden="${!this._showPagination(this.datalength)}">
              <paper-input
                id="searchInput"
                class="search-input  ${this._getSearchInputClass(this.searchString)}"
                placeholder="Search"
                .value="${this.searchString}"
                @value-changed="${({detail}) => {
                  if (detail.value !== this.searchString) {
                    this.searchString = detail.value;
                    this._searchChanged(this.searchString);
                  }
                }}"
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
                href="${this._getAMPLink(this.engagement.agreement?.auditor_firm?.organization_id)}"
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

          <etools-data-table-header no-collapse no-title>
          ${
            this.showHasAccess
              ? html`<etools-data-table-column class="col-1">Has Access</etools-data-table-column>`
              : ``
          }
            <etools-data-table-column class="col-2">Position</etools-data-table-column>
            <etools-data-table-column class="${
              this.showHasAccess ? 'col-2' : 'col-3'
            }">First Name</etools-data-table-column>
            <etools-data-table-column class="col-2">Last Name</etools-data-table-column>
            <etools-data-table-column class="col-2">Phone Number</etools-data-table-column>
            <etools-data-table-column class="col-2">E-mail Address</etools-data-table-column>
            <etools-data-table-column class="col-1 center-align">Active</etools-data-table-column>
          </etools-data-table-header>
          ${(this.dataItems || [])
            .filter((x) => this._isVisible(x.has_active_realm, this.showInactive))
            .map(
              (item) => html` <etools-data-table-row no-collapse>
                <div slot="row-data" class="layout-horizontal editable-row">
                  ${this.showHasAccess
                    ? html` <span class="col-data col-1" ?hidden="${!this.showHasAccess}">
                        <paper-checkbox
                          class="checkbox"
                          ?checked="${item.hasAccess}"
                          ?disabled="${this._isCheckboxReadonly(
                            item.hasAccess,
                            this.engagementStaffs,
                            this.saveWithButton
                          )}"
                          @click="${(e) => this._isActive(e, item)}"
                        >
                        </paper-checkbox>
                      </span>`
                    : ``}
                  <span class="col-data col-2 wrap-text">${item.user.profile.job_title || '–'}</span>
                  <span class="col-data ${this.showHasAccess ? 'col-2' : 'col-3'} wrap-text"
                    >${item.user.first_name}</span
                  >
                  <span class="col-data col-2 wrap-text">${item.user.last_name}</span>
                  <span class="col-data col-2 wrap-text">${item.user.profile.phone_number || '–'}</span>
                  <span class="col-data col-2 wrap-text">${item.user.email}</span>
                  <span class="col-data col-1 wrap-text center-align"
                    >${this.computeStaffMembActiveColumn(item) || html`<iron-icon icon="check"></iron-icon>`}</span
                  >
                </div>
              </etools-data-table-row>`
            )}
        ${
          this._showPagination(this.datalength)
            ? html`<etools-data-table-footer
                .pageSize="${this.paginator.page_size}"
                .pageNumber="${this.paginator.page}"
                .totalResults="${this.paginator.count}"
                .visibleRange="${this.paginator.visible_range}"
                @page-size-changed="${this.pageSizeChange}"
                @page-number-changed="${this.pageNumberChange}"
              >
              </etools-data-table-footer>`
            : ``
        }

      </etools-content-panel>
    `;
  }

  @property({type: String})
  mainProperty = 'staff_members';

  @property({type: Boolean})
  showHasAccess = false;

  @property({type: String})
  staffsBase = '';

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: Object})
  listQueries: GenericObject = {
    page: 1,
    page_size: 10,
    search: ''
  };

  @property({type: Object})
  engagementStaffs: GenericObject = {};

  @property({type: Boolean})
  listLoading = false;

  @property({type: Number})
  datalength = 0;

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this Audit Staff Team Member?';

  @property({type: Boolean, attribute: 'save-with-button'})
  saveWithButton = false;

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Number})
  organizationId!: number;

  @property({type: Boolean})
  showInactive!: boolean;

  @property({type: String})
  pageType = '';

  @property({type: String})
  searchString = '';

  connectedCallback() {
    super.connectedCallback();

    this._searchChanged = debounce(this._searchChanged.bind(this), 400) as any;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this.setPermission(this.optionsData);
    }
    if (changedProperties.has('errorObject')) {
      this._handleUpdateError(this.errorObject?.staff_members);
    }
    if (changedProperties.has('engagement') || changedProperties.has('optionsData')) {
      this._organizationChanged(this.engagement.agreement?.auditor_firm?.id);
      this._selectedStaffsChanged(this.engagement.staff_members);
    }
    if (changedProperties.has('dataItems') || changedProperties.has('engagementStaffs')) {
      this._staffMembersListChanged(this.dataItems, this.engagementStaffs);
    }
    if (changedProperties.has('dataItems')) {
      this._dataItemsChanged(this.dataItems);
    }
  }

  setPermission(optionsData: AnyObject) {
    if (!optionsData) {
      return;
    }
    this.showHasAccess = this._canBeChanged(optionsData);
  }

  listLoadingStateChanged(event: CustomEvent): void {
    this.listLoading = event.detail.state;
  }

  listLoaded(event: CustomEvent): void {
    const data = event.detail;
    this.staffsBase = getStaffCollectionName(this.organizationId);

    if (!this.listQueries?.search) {
      this.datalength = data.count;
    }
    this.paginator = {...this.paginator, count: data.count};
    this.dataItems = data.results;
  }

  pageSizeChange(e: CustomEvent) {
    this.paginator = {...this.paginator, page_size: e.detail.value};
    this.updateListQueries();
  }

  pageNumberChange(e: CustomEvent) {
    this.paginator = {...this.paginator, page: e.detail.value};
    this.updateListQueries();
  }

  updateListQueries() {
    this.listQueries = {...this.listQueries, page: this.paginator.page, page_size: this.paginator.page_size};
  }

  computeStaffMembActiveColumn(item) {
    return !item.user.is_active ? 'Inactive' : !item.has_active_realm ? 'No Access' : null;
  }

  onShowInactiveChanged(e: CustomEvent) {
    this.showInactive = Boolean((e.target as PaperToggleButtonElement).checked);
  }

  _isVisible(active: boolean, showInactive: boolean) {
    return active || showInactive;
  }

  _organizationChanged(id) {
    if (!this.optionsData || !this._canBeChanged(this.optionsData)) {
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
    if (!this._canBeChanged(this.optionsData)) {
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

  _isActive(event, item) {
    if (!item) {
      throw new Error('Can not get item model!');
    }
    item.hasAccess = event.target.checked;

    const me = getUserData() || {};
    const updateOptions = get(item, 'user.email') === me.email;

    this.manageEngagementStaff(item);
    this._updateEngagement(true, updateOptions);
  }

  _showPagination(dataItemsCount) {
    return !!(+dataItemsCount && +dataItemsCount > 10);
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
    this.listQueries = {page: 1, page_size: 10, search: ''};
    this.searchString = '';
    this.engagementStaffs = {};
    this.datalength = 0;
  }

  getTabData() {
    if (!this._canBeChanged(this.optionsData)) {
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

  _searchChanged(searchString) {
    this.paginator = {...this.paginator, page: 1};
    this.listQueries = {...this.listQueries, search: searchString, page: 1};
  }

  _isCheckboxReadonly(checked, staffs, buttonSave) {
    return !buttonSave && checked && Object.keys(staffs || {}).length === 1;
  }

  _getSearchInputClass(searchString) {
    return searchString ? 'filled' : 'empty';
  }
}
