import {html, PolymerElement} from '@polymer/polymer';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';

import isUndefined from 'lodash-es/isUndefined';
import each from 'lodash-es/each';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
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
import {checkNonField, refactorErrorObject} from '../../../mixins/error-handler';
import {getStaffCollectionName} from '../../../data-elements/get-staff-members-list';
import {PaperToggleButtonElement} from '@polymer/paper-toggle-button/paper-toggle-button.js';

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
        organisation-id="[[organizationId]]"
        queries="[[listQueries]]"
        page-type="[[pageType]]"
        on-data-loaded="listLoaded"
        on-loading-state-changed="listLoadingStateChanged"
      >
      </get-staff-members-list>

      <!--end requests-->

      <etools-content-panel
        panel-title="[[getLabel('staff_members', basePermissionPath)]] ([[_staffLength(datalength,
                            dataItems.length, searchQuery)]])"
        list
      >
        <div slot="panel-btns">
          <div class="panel-btns-container">
            <div class="search-input-container" hidden$="[[!_showPagination(datalength)]]">
              <paper-input
                id="searchInput"
                class$="search-input [[_getSearchInputClass(searchString)]]"
                value="[[searchString]]"
                placeholder="Search"
                on-blur="searchBlur"
                on-input="_searchChanged"
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
              checked="[[showInactive]]"
              on-change="onShowInactiveChanged"
            >
              Show Inactive
            </paper-toggle-button>
            <div class="add-button-container">
              <a
                class="white"
                href="[[_getAMPLink(engagement.agreement.auditor_firm.organization_id)]]"
                target="_blank"
              >
                <iron-icon id="information-icon" icon="icons:open-in-new"></iron-icon>
              </a>
              <paper-tooltip offset="0">Access Management Portal</paper-tooltip>
            </div>
          </div>
        </div>

        <div class="panel-content group">
          <etools-loading active="[[listLoading]]" loading-text="Loading list data..." class="loading">
          </etools-loading>

          <list-header no-additional no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]">
          </list-header>

          <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
            <list-element
              class="list-element"
              data="[[item]]"
              no-additional
              headings="[[columns]]"
              no-animation
              hidden$="[[!_isVisible(item.user.has_active_realm, showInactive)]]"
            >
              <div slot="checkbox" class="checkbox">
                <paper-checkbox
                  disabled="[[_isCheckboxReadonly(item.hasAccess, engagementStaffs, saveWithButton)]]"
                  on-tap="_isActive"
                  checked="[[item.hasAccess]]"
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
            page-size="[[listSize]]"
            page-number="[[listPage]]"
            datalength="[[_staffLength(datalength, dataItems.length, searchQuery)]]"
            without-queries
            hidden$="[[!_showPagination(datalength)]]"
            showing-results="[[showingResults]]"
            on-pagination-changed="updatePagination"
          >
          </list-pagination>
        </div>
      </etools-content-panel>
    `;
  }

  static get observers() {
    return [
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

  @property({type: String})
  staffsBase = '';

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
      size: 10,
      label: 'Has Access',
      name: 'hasAccess',
      align: 'center',
      property: 'hasAccess',
      checkbox: true
    },
    {
      size: 16,
      label: 'Position',
      labelPath: 'staff_members.user.profile.job_title',
      name: 'user.profile.job_title',
      customCss: 'wrap-text'
    },
    {
      size: 16,
      label: 'First Name',
      labelPath: 'staff_members.user.first_name',
      name: 'user.first_name',
      customCss: 'wrap-text'
    },
    {
      size: 16,
      label: 'Last Name',
      labelPath: 'staff_members.user.last_name',
      name: 'user.last_name',
      customCss: 'wrap-text'
    },
    {
      size: 16,
      label: 'Phone Number',
      labelPath: 'staff_members.user.profile.phone_number',
      name: 'user.profile.phone_number',
      customCss: 'wrap-text'
    },
    {
      size: 16,
      label: 'E-mail Address',
      labelPath: 'staff_members.user.email',
      name: 'user.email',
      customCss: 'wrap-text'
    },
    {
      size: 10,
      label: 'Active',
      labelPath: 'staff_members.user.has_active_realm',
      name: 'user.has_active_realm',
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

  changePermission(basePermissionPath) {
    if (!basePermissionPath) {
      return;
    }
    const editObj = this.columns && this.columns[0];
    if (this._canBeChanged() && editObj && editObj.name !== 'hasAccess') {
      each(this.columns, (_value, index) => {
        this.set(`columns.${index}.size`, 16);
      });
      this.set(`columns.${this.columns.length - 1}.size`, 10);
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
        this.set(`columns.${index}.size`, 18);
      });
      this.set(`columns.${this.columns.length - 1}.size`, 10);
    }
  }

  listLoadingStateChanged(event: CustomEvent): void {
    this.listLoading = event.detail.state;
  }

  listLoaded(event: CustomEvent): void {
    const data = event.detail;
    this.staffsBase = getStaffCollectionName(this.organizationId);
    this.dataItems = data.results;

    if (!this.listQueries?.search) {
      this.datalength = data.count;
    }
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

    this.set('listQueries', {
      page_size: listSize,
      page: listPage,
      search: searchQuery || ''
    });
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

  _searchChanged(e: any) {
    this._setField(e);
    setTimeout(() => {
      const value = (this.shadowRoot?.querySelector('#searchInput') as any).value || '';

      if (value.length - 1) {
        this._newRequestDebouncer = Debouncer.debounce(this._newRequestDebouncer, timeOut.after(500), () => {
          this.set('searchQuery', value);
        });
      }
    });
  }

  _isCheckboxReadonly(checked, staffs, buttonSave) {
    return !buttonSave && checked && Object.keys(staffs || {}).length === 1;
  }
}
window.customElements.define('engagement-staff-members-tab', EngagementStaffMembersTab);
