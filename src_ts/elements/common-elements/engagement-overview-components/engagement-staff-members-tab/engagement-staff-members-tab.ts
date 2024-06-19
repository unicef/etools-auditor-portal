import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import each from 'lodash-es/each';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../types/global';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../../data-elements/get-staff-members-list';
import {checkNonField, refactorErrorObject} from '../../../mixins/error-handler';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {AnyObject, EtoolsUser} from '@unicef-polymer/etools-types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @LitElement
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-staff-members-tab')
export class EngagementStaffMembersTab extends connect(store)(
  PaginationMixin(TableElementsMixin(CommonMethodsMixin(LitElement)))
) {
  static get styles() {
    return [moduleStyles, tabInputsStyles, layoutStyles];
  }
  render() {
    return html`
      <style>
        ${dataTableStylesLit}
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
          width: 140px;          
        }
        .search-input-container .search-input {
          float: right;
          box-sizing: border-box;
          margin-top: -6px;
          transition: 0.35s;
          cursor: pointer;
        }
        .search-input-container .search-input,
        .search-input-container .search-input:focus {
          --sl-input-color: var(--light-secondary-text-color);
          --primary-color: var(--light-primary-text-color);
        }
        .search-input-container .search-input::part(form-control-input)::after {
          --secondary-text-color: var(--light-primary-text-color);
        }
        .search-input-container .search-input::part(input):focus {
          --primary-color: var(--light-primary-text-color);
           color: var(--light-primary-text-color);
        }
        .search-input-container .search-input::part(input)::placeholder {
          color: var(--light-primary-text-color);
        }
        .search-input-container .search-input[focused] {
          width: 100%;
        }
        .search-input-container .search-input:not(.empty) {
          width: 100% !important;
        }
        .search-input-container .search-input etools-icon {
          top: -1px;
          color: #fff;
        }
        .panel-content {
          position: relative;
          margin-bottom: -7px;
          padding-bottom: 0;
        }
        .etools-checkbox {
          margin-left: 15px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        .editable-row {
          margin-top: 0;
          margin-bottom: 0;
          padding: 4px 0;
        }
        .editable-row etools-icon-button {
          --iron-icon-fill-color: var(--gray-mid);
        }
        etools-loading {
          --etools-loading-overlay-transparency: 0.4;
        }
        .white {
          color: #ffffff;
        }
        #toggleActive::part(control){
          background-color: var(--sl-color-neutral-400) !important;
        }
        #toggleActive[checked]::part(control){
          background-color: #eeeeee !important;
        }
        .panel-btns-container {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          column-gap: 20px;
          line-height: 48px;
        }
        sl-switch {
          --sl-input-label-color: #ffffff;
        }
        .center-align {
          justify-content: center !important;
        }
        @media(max-width: 576px) {
          .panel-btns-container {
            flex-wrap: wrap;
          }
          .search-input-container {
            width: 110px;
          }
        }
      </style>

      <etools-media-query
        query="(max-width: 1180px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
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
              <etools-input
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
                <etools-icon id="searchIcon" name="search" class="panel-button" slot="prefix"></etools-icon>
              </etools-input>
            </div>
            <sl-switch
              class="white"
              id="toggleActive"
              ?checked="${this.showInactive}"
              @sl-change="${this.onShowInactiveChanged}"
            >
              Show Inactive
            </sl-switch>
            <div class="add-button-container">
              <a
                class="white"
                ?hidden="${!this.engagement.agreement?.auditor_firm?.organization_id}"
                href="${this._getAMPLink(this.user, this.engagement.agreement?.auditor_firm?.organization_id)}"
                target="_blank"
              >
               <sl-tooltip content="Access Management Portal">
                <etools-icon id="information-icon" name="open-in-new"></etools-icon>
               </sl-tooltip>
              </a>
            </div>
          </div>
        </div>

        <div class="panel-content group">
          <etools-loading .active="${this.listLoading}" loading-text="Loading list data..." class="loading">
          </etools-loading>

          <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
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
              (item) => html` <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                <div slot="row-data" class="layout-horizontal editable-row">
                  ${this.showHasAccess
                    ? html` <span
                        class="col-data col-1"
                        data-col-header-label="Has Access"
                        ?hidden="${!this.showHasAccess}"
                      >
                        <etools-checkbox
                          class="checkbox"
                          ?checked="${item.hasAccess}"
                          ?disabled="${this._isCheckboxReadonly(
                            item.hasAccess,
                            this.engagementStaffs,
                            this.saveWithButton
                          )}"
                          @click="${(e) => this._isActive(e, item)}"
                        >
                        </etools-checkbox>
                      </span>`
                    : ``}
                  <span class="col-data col-2 wrap-text" data-col-header-label="Position"
                    >${item.user.profile.job_title || '–'}</span
                  >
                  <span
                    class="col-data ${this.showHasAccess ? 'col-2' : 'col-3'} wrap-text"
                    data-col-header-label="First Name"
                    >${item.user.first_name}</span
                  >
                  <span class="col-data col-2 wrap-text" data-col-header-label="Last Name">${item.user.last_name}</span>
                  <span class="col-data col-2 wrap-text" data-col-header-label="Phone Number"
                    >${item.user.profile.phone_number || '–'}</span
                  >
                  <span class="col-data col-2 wrap-text" data-col-header-label="E-mail Address"
                    >${item.user.email}</span
                  >
                  <span
                    class="col-data col-1 wrap-text ${!this.lowResolutionLayout ? 'center-align' : ''}"
                    data-col-header-label="Active"
                    >${this.computeStaffMembActiveColumn(item) || html`<etools-icon name="check"></etools-icon>`}</span
                  >
                </div>
              </etools-data-table-row>`
            )}
          <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}" .lowResolutionLayout="${
      this.lowResolutionLayout
    }">
            <div slot="row-data" class="layout-horizontal editable-row padding-v">
              <span class="col-data col-12">No records found.</span>
            </div>
          </etools-data-table-row>
        ${
          this._showPagination(this.datalength)
            ? html`<etools-data-table-footer
                .lowResolutionLayout="${this.lowResolutionLayout}"
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

  @property({type: Object})
  user!: EtoolsUser;

  connectedCallback() {
    super.connectedCallback();

    this._searchChanged = debounce(this._searchChanged.bind(this), 400) as any;
  }

  stateChanged(state: RootState) {
    if (state.user?.data && !isJsonStrMatch(state.user.data, this.user)) {
      this.user = state.user.data;
    }
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
    this.showInactive = Boolean((e.target as SlSwitch).checked);
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

  _getAMPLink(user: EtoolsUser, organizationId: number) {
    if (!user || !organizationId) {
      return '';
    }
    let url = `/amp/users/`;
    if (this.user && this.user.is_unicef_user) {
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

    const me = this.user || {};
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
    if ((this.engagement.staff_members?.length || 0) !== staffs.length) {
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
