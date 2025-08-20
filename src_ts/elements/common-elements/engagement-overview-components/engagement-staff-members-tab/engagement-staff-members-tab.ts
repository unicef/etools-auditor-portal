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
import findIndex from 'lodash-es/findIndex';
import cloneDeep from 'lodash-es/cloneDeep';
import isString from 'lodash-es/isString';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../types/global';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import '../../../data-elements/get-staff-members-list';
import '../engagement-staff-members-tab/engagement-purchase-details';
import {checkNonField, refactorErrorObject} from '../../../mixins/error-handler';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {AnyObject, EtoolsUser} from '@unicef-polymer/etools-types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {getOptionsChoices, readonlyPermission} from '../../../mixins/permission-controller';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import {getObjectsIDs} from '../../../utils/utils';
import {CommonDataState} from '../../../../redux/reducers/common-data';
import famEndpoints from '../../../config/endpoints';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import clone from 'lodash-es/clone';
import assign from 'lodash-es/assign';

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
        .table-staff-header {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: space-between;
          width: 100%;
          background-color: var(--primary-color);
          color: var(--header-color, #ffffff);
          align-items: center;
        }
        .table-staff-title {
          font-weight: 500;
          font-size: var(--etools-font-size-18, 18px);
          color: var(--header-color, #ffffff);
          padding-inline-start: 15px;
        }
        .table-staff-filter {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: flex-end;
          column-gap: 20px;
          line-height: 48px;
          padding-inline-end: 15px;
        }
        sl-switch {
          --sl-input-label-color: #ffffff;
        }
        .center-align {
          justify-content: center !important;
        }
        .section-title {
          color: var(--primary-color);
          font-weight: 500;
          font-size: var(--etools-font-size-18, 18px);
          padding-inline-start: 12px !important;
        }
        .section-bottom {
          border-bottom: solid 2px var(--primary-color);
          margin-block-start: 8px;
          margin-block-end: 16px;
        }
        .mt-24 {
          margin-block-start: 24px;
        }
        .mt-8 {
          margin-block-start: 8px;
        }
        @media(max-width: 576px) {
          .panel-btns-container {
            flex-wrap: wrap;
          }
          .search-input-container {
            width: 110px;
          }
        }
        .pad-lr {
          padding: 0 12px;
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
        class="content-section clearfix"
        panel-title="Selecting Service Provider"
        show-expand-btn
      >
        <div>
          <engagement-purchase-details
              id="engagementPurchaseDetails"
              .data="${this.engagement}"
              .originalData="${this.originalData}"
              .errorObject="${this.errorObject}"
              .optionsData="${this.optionsData}">
          </engagement-purchase-details>
          <div class="col-12 section-bottom"></div>
        </div>

        <div class="panel-content group padding-v">
          <div class="row padding-v">
            <etools-loading .active="${this.listLoading}" loading-text="Loading list data..." class="loading">
            </etools-loading>
            <div class="col-12">
              <div class="table-staff-header">
                <div class="table-staff-title">
                  <label>${this._getTitle(
                    'staff_members',
                    this.optionsData,
                    this.datalength,
                    this.dataItems.length,
                    this.listQueries?.search
                  )}</label>
                </div>
                 <div class="table-staff-filter">
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
              </div>
            <div class="col-12">

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
              (item) =>
                html` <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
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
                    <span class="col-data col-2 wrap-text" data-col-header-label="Last Name"
                      >${item.user.last_name}</span
                    >
                    <span class="col-data col-2 wrap-text" data-col-header-label="Phone Number"
                      >${item.user.profile.phone_number || '–'}</span
                    >
                    <span class="col-data col-2 wrap-text" data-col-header-label="E-mail Address"
                      >${item.user.email}</span
                    >
                    <span
                      class="col-data col-1 wrap-text ${!this.lowResolutionLayout ? 'center-align' : ''}"
                      data-col-header-label="Active"
                      >${this.computeStaffMembActiveColumn(item) ||
                      html`<etools-icon name="check"></etools-icon>`}</span
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
          <div class="col-12 section-bottom mt-24"></div>
          </div>
        </div>
      </div>
      
        <div class="panel-content group">
           <div class="row">
            <div class="col-12">
                <label class="section-title">Partner Contact</label>
            </div>
            <div class="col-12 col-md-12 col-lg-6 input-container">
            <!-- Partner Address -->
            <etools-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this._setPartnerAddress(this.partner)}"
              label="Partner Address"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </etools-input>
          </div>
          <div class="col-12 col-md-6 col-lg-3 input-container">
            <!-- Partner Phone Number -->
            <etools-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this.partner?.phone_number}"
              label="${this.getLabel('partner.phone_number', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </etools-input>
          </div>

          <div class="col-12 col-md-6 col-lg-3 input-container">
            <!-- Partner E-mail Address -->
            <etools-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this.partner?.email}"
              label="${this.getLabel('partner.email', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </etools-input>
          </div>
      
             <div class="col-12 col-lg-6 col-md-6 input-container">
            <!-- Partner  Officers-->
            <etools-dropdown
              id="authorizedOfficer"
              class="${this._setRequired('authorized_officers', this.optionsData)} ${this._setPlaceholderColor(
                this.partner
              )}"
              .selected="${this.authorizedOfficer?.id}"
              label="${this.getLabel('authorized_officers', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              .options="${this.partner?.partnerOfficers}"
              option-label="fullName"
              option-value="id"
              ?required="${this._setRequired('authorized_officers', this.optionsData)}"
              ?invalid="${this._checkInvalid(this.errors.authorized_officers)}"
              ?readonly="${this.isOfficersReadonly(this.optionsData, this.requestInProcess, this.partner)}"
              .errorMessage="${this.errors.authorized_officers}"
              @focus="${this._resetFieldError}"
              dynamic-align
              @etools-selected-item-changed="${(event: CustomEvent) => {
                if (this.authorizedOfficer) {
                  this.authorizedOfficer = event.detail.selectedItem;
                }
              }}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
          ${
            this._showActivePd(this.partner?.partner_type, this.specialPartnerTypes)
              ? html`<div class="col-1 col-lg-6 col-md-6 input-container">
                  <!-- Active PD -->
                  <etools-dropdown-multi
                    id="activePd"
                    class="${this._setPlaceholderColor(this.partner)}"
                    .selectedValues="${this.activePdIds}"
                    label="${this.getLabel('active_pd', this.optionsData)}"
                    placeholder="${this.activePdPlaceholder(this.optionsData, this.partner)}"
                    .options="${this.partner?.interventions}"
                    option-label="number"
                    option-value="id"
                    ?readonly="${this.isPdReadonly(this.optionsData, this.requestInProcess, this.partner)}"
                    ?invalid="${this.errors.active_pd}"
                    .errorMessage="${this.errors.active_pd}"
                    @focus="${this._resetFieldError}"
                    dynamic-align
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      const newIds = detail.selectedItems.map((i: any) => i.id);
                      this.activePdIds = newIds;
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>`
              : ``
          }

          </div>
          <div class="col-12 section-bottom"></div>
        </div>
        
        <div class="panel-content group">
           <div class="row padding-v">
            <div class="col-12 mt-8">
                <label class="section-title">Unicef Contact</label>
            </div>
               ${
                 this.showSharedAuditField(this.engagement.engagement_type)
                   ? html` <!-- Shared Audit with-->
                       <div
                         class="col-12 col-lg-4 col-md-6 input-container"
                         ?hidden="${this._hideField('shared_ip_with', this.optionsData)}"
                       >
                         <etools-dropdown-multi
                           id="sharedWith"
                           class="w100 validate-input ${this._setRequired('shared_ip_with', this.optionsData)}"
                           label="${this.getLabel('shared_ip_with', this.optionsData)}"
                           placeholder="${this.getPlaceholderText('shared_ip_with', this.optionsData)}"
                           .options="${this.sharedIpWithOptions}"
                           option-label="display_name"
                           option-value="value"
                           .selectedValues="${this.engagement.shared_ip_with || []}"
                           ?required="${this._setRequired('shared_ip_with', this.optionsData)}"
                           ?readonly="${this.itIsReadOnly('shared_ip_with', this.optionsData)}"
                           ?invalid="${this.errors.shared_ip_with}"
                           .errorMessage="${this.errors.shared_ip_with}"
                           @focus="${(event: any) => this._resetFieldError(event)}"
                           dynamic-align
                           hide-search
                           trigger-value-change-event
                           @etools-selected-items-changed="${({detail}: CustomEvent) => {
                             const selected = (detail.selectedItems || []).map((x) => x.value);
                             if (!isJsonStrMatch(this.engagement.shared_ip_with, selected)) {
                               this.engagement.shared_ip_with = selected;
                             }
                           }}"
                         >
                         </etools-dropdown-multi>
                       </div>`
                   : ``
               }    
                ${
                  this.showAdditionalField(this.engagement.engagement_type)
                    ? html` <!-- Sections -->
                        <div
                          class="col-12 col-md-6 col-lg-4 input-container"
                          ?hidden="${this._hideField('sections', this.optionsData)}"
                        >
                          <etools-dropdown-multi
                            class="w100 validate-input ${this._setRequired('sections', this.optionsData)}"
                            label="${this.getLabel('sections', this.optionsData)}"
                            placeholder="${this.getPlaceholderText('sections', this.optionsData)}"
                            .options="${this.sectionOptions}"
                            option-label="name"
                            option-value="id"
                            .selectedValues="${getObjectsIDs(this.engagement?.sections)}"
                            ?required="${this._setRequired('sections', this.optionsData)}"
                            ?readonly="${this.itIsReadOnly('sections', this.optionsData)}"
                            ?invalid="${this.errors.sections}"
                            .errorMessage="${this.errors.sections}"
                            @focus="${(event: any) => this._resetFieldError(event)}"
                            dynamic-align
                            hide-search
                            trigger-value-change-event
                            @etools-selected-items-changed="${({detail}: CustomEvent) => {
                              if (!isJsonStrMatch(this.engagement.sections, detail.selectedItems)) {
                                this.engagement.sections = detail.selectedItems;
                                this.requestUpdate();
                              }
                            }}"
                          >
                          </etools-dropdown-multi>
                        </div>
                        <!-- Offices -->
                        <div
                          class="col-12 col-lg-4 col-md-6 input-container"
                          ?hidden="${this._hideField('offices', this.optionsData)}"
                        >
                          <etools-dropdown-multi
                            class="w100 validate-input ${this._setRequired('offices', this.optionsData)}"
                            label="${this.getLabel('offices', this.optionsData)}"
                            placeholder="${this.getPlaceholderText('offices', this.optionsData)}"
                            .options="${this.officeOptions}"
                            option-label="name"
                            option-value="id"
                            .selectedValues="${getObjectsIDs(this.engagement?.offices)}"
                            ?required="${this._setRequired('offices', this.optionsData)}"
                            ?readonly="${this.itIsReadOnly('offices', this.optionsData)}"
                            ?invalid="${this.errors.offices}"
                            .errorMessage="${this.errors.offices}"
                            @focus="${(event: any) => this._resetFieldError(event)}"
                            dynamic-align
                            hide-search
                            trigger-value-change-event
                            @etools-selected-items-changed="${({detail}: CustomEvent) => {
                              if (!isJsonStrMatch(this.engagement.offices, detail.selectedItems)) {
                                this.engagement.offices = detail.selectedItems;
                                this.requestUpdate();
                              }
                            }}"
                          >
                          </etools-dropdown-multi>
                        </div>`
                    : ``
                }
                      <!-- Notified when completed -->
                      <div
                        class="col-12 col-lg-4 col-md-6 input-container"
                        ?hidden="${this._hideField('users_notified', this.optionsData)}"
                      >
                        <etools-dropdown-multi
                          class="w100 validate-input ${this._setRequired('users_notified', this.optionsData)}"
                          label="${this.getLabel('users_notified', this.optionsData)}"
                          placeholder="${this.getPlaceholderText('users_notified', this.optionsData)}"
                          .options="${this.usersNotifiedOptions}"
                          .loadDataMethod="${this.loadUsersDropdownOptions}"
                          preserve-search-on-close
                          option-label="name"
                          option-value="id"
                          ?hidden="${this.itIsReadOnly('users_notified', this.optionsData)}"
                          .selectedValues="${getObjectsIDs(this.engagement?.users_notified)}"
                          ?required="${this._setRequired('users_notified', this.optionsData)}"
                          ?invalid="${this.errors.users_notified}"
                          .errorMessage="${this.errors.users_notified}"
                          @focus="${(event: any) => this._resetFieldError(event)}"
                          trigger-value-change-event
                          @etools-selected-items-changed="${({detail}: CustomEvent) => {
                            if (!isJsonStrMatch(this.engagement.users_notified, detail.selectedItems)) {
                              this.engagement.users_notified = detail.selectedItems;
                              this.requestUpdate();
                            }
                          }}"
                        >
                        </etools-dropdown-multi>
                        <div class="pad-lr" ?hidden="${!this.itIsReadOnly('users_notified', this.optionsData)}">
                          <label for="notifiedLbl" class="paper-label">
                            ${this.getLabel('users_notified', this.optionsData)}
                          </label>
                          <div class="input-label" ?empty="${this._emptyArray(this.engagement.users_notified)}">
                            ${(this.engagement?.users_notified || []).map(
                              (item, index) => html`
                                <div>
                                  ${item.name}
                                  <span class="separator"
                                    >${this.getSeparator(this.engagement?.users_notified, index)}</span
                                  >
                                </div>
                              `
                            )}
                          </div>
            
          </div>
        </div>
        <div class="row-padding-v"></div>
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
  partner!: AnyObject;

  @property({type: Object})
  listQueries: GenericObject = {
    page: 1,
    page_size: 5,
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

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Number})
  organizationId!: number;

  @property({type: Boolean})
  showInactive!: boolean;

  @property({type: Array})
  activePdIds!: any[];

  @property({type: Object})
  authorizedOfficer: GenericObject | null = null;

  @property({type: String})
  pageType = '';

  @property({type: String})
  searchString = '';

  @property({type: Object})
  user!: EtoolsUser;

  @property({type: Array})
  sectionOptions!: GenericObject[];

  @property({type: Array})
  sectionIDs: number[] = [];

  @property({type: Array})
  users!: GenericObject[];

  @property({type: Object})
  reduxCommonData!: CommonDataState;

  @property({type: Array})
  officeOptions!: GenericObject[];

  @property({type: Array})
  specialPartnerTypes = ['Bilateral / Multilateral', 'Government'];

  @property({type: Array})
  sharedIpWithOptions: [] = [];

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  connectedCallback() {
    super.connectedCallback();

    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
    this._searchChanged = debounce(this._searchChanged.bind(this), 400) as any;
  }

  stateChanged(state: RootState) {
    if (state.commonData.loadedTimestamp) {
      this.reduxCommonData = state.commonData;
    }
    if (state.user?.data && !isJsonStrMatch(state.user.data, this.user)) {
      this.user = state.user.data;
      this.populateDropdownsAndSetSelectedValues();
    }
    if (state.engagement?.partner && !isJsonStrMatch(this.partner, state.engagement?.partner)) {
      this.partner = cloneDeep(state.engagement?.partner);
      this.partnerLoaded();
    }
    if (state.engagement?.originalData && !isJsonStrMatch(this.originalData, state.engagement.originalData)) {
      this.originalData = cloneDeep(state.engagement.originalData);
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this.setPermission(this.optionsData);
      this._setSharedIpWith(this.optionsData);
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

  _setSharedIpWith(optionsData: AnyObject) {
    const sharedIpWithOptions = getOptionsChoices(optionsData, 'shared_ip_with.child');
    this.sharedIpWithOptions = sharedIpWithOptions || [];
  }

  partnerLoaded() {
    this.setOfficers(this.partner, this.engagement);
    this.setActivePd(this.engagement, this.partner?.interventions);
  }

  setOfficers(partner, engagement) {
    if (!partner || !partner.id) {
      this.authorizedOfficer = null;
      return;
    }
    const engagementOfficer = engagement && engagement.authorized_officers && engagement.authorized_officers[0];
    const partnerOfficer = partner && partner.partnerOfficers && partner.partnerOfficers[0];
    if (engagementOfficer) {
      engagementOfficer.fullName = `${engagementOfficer.first_name} ${engagementOfficer.last_name}`;
    }

    if (this.isReadOnly('partner', this.optionsData) && engagementOfficer) {
      this.partner.partnerOfficers = [engagementOfficer];
      this.authorizedOfficer = engagementOfficer;
    } else if (partner.partnerOfficers && partner.partnerOfficers.length) {
      const officerIndex = !!(
        engagementOfficer &&
        ~findIndex(partner.partnerOfficers, (officer: any) => {
          return officer.id === engagementOfficer.id;
        })
      );

      this.authorizedOfficer = officerIndex ? engagementOfficer : partnerOfficer;
    }
  }

  getAuthorizedOfficer() {
    if (this.isReadOnly('partner', this.optionsData) || !this.authorizedOfficer || !this.authorizedOfficer.id) {
      return null;
    }
    const engagementOfficer = get(this, 'engagement.authorized_officers[0].id');
    return this.authorizedOfficer.id === engagementOfficer ? null : this.authorizedOfficer.id;
  }

  setActivePd(engagement, partnerInterv) {
    if (!engagement || !partnerInterv) {
      this.activePdIds = [];
      return;
    }

    const originalPartnerId = this.originalData?.partner?.id;
    const partnerId = this.partner.id;

    if (!Number.isInteger(originalPartnerId) || !Number.isInteger(partnerId) || originalPartnerId !== partnerId) {
      this.activePdIds = [];
      this.validateActivePd();
      return false;
    }

    const activePd = this.engagement.active_pd || [];
    this.activePdIds = activePd.map((pd) => pd.id);
    this.validateActivePd();
    return true;
  }

  validateActivePd() {
    // TODO - this logic doesn't seem to be needed, because activePdInput.required is always false, confirm & remove
    const activePdInput = this.shadowRoot?.querySelector('#activePd') as EtoolsDropdownMultiEl;
    const partnerType = this.engagement.partner?.partner_type;
    const partnerRequiresActivePd = this.specialPartnerTypes.indexOf(partnerType) === -1;

    if (activePdInput && activePdInput.required && partnerRequiresActivePd && !activePdInput.validate()) {
      activePdInput.invalid = true;
      activePdInput.errorMessage = 'Active PD is required';
      return false;
    }

    return true;
  }

  validate() {
    const el: any = this.shadowRoot?.querySelector('#engagementPurchaseDetails');
    const purchaseValid = el ? el.validate() : false;

    return purchaseValid;
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
    this.paginator = {...this.paginator, page_size: 5, count: data.count};
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

  _emptyArray(arr) {
    return !arr || !arr.length;
  }

  getSeparator(collection, index) {
    if (!collection) {
      return '';
    }
    if (index < collection.length - 1) {
      return '|';
    }
    return '';
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

  populateDropdownsAndSetSelectedValues() {
    // For firm staff auditors certain endpoints return 403
    const userIsFirmStaffAuditor = !this.user.is_unicef_user;

    const savedSections = this.engagement.sections || [];
    this.sectionOptions = (userIsFirmStaffAuditor ? savedSections : this.reduxCommonData?.sections) || [];

    const savedOffices = this.engagement.offices || [];
    this.officeOptions = (userIsFirmStaffAuditor ? savedOffices : this.reduxCommonData?.offices) || [];

    if (!this.users) {
      this.users = this.reduxCommonData?.users || [];
    }
    this.setUsersNotifiedOptions();

    this.requestUpdate();
  }

  _loadUsersDropdownOptions(search: string, page: number, shownOptionsLimit: number) {
    const endpoint = clone(famEndpoints.users);
    endpoint.url += `?page_size=${shownOptionsLimit}&page=${page}&search=${search || ''}`;
    return sendRequest({
      method: 'GET',
      endpoint: {
        url: endpoint.url
      }
    }).then((resp: GenericObject) => {
      this.users = page > 1 ? [...this.users, ...resp.results] : resp.results;
      this.setUsersNotifiedOptions();
      return resp;
    });
  }

  setUsersNotifiedOptions() {
    const availableUsers = [...this.users];
    const notifiedUsers = this.engagement.users_notified || [];
    this.handleUsersNoLongerAssignedToCurrentCountry(availableUsers, notifiedUsers);
    this.usersNotifiedOptions = availableUsers;
  }

  populateUsersNotifiedDropDown() {
    this.usersNotifiedOptions = [...this.users];
  }

  itIsReadOnly(field: string, permissions: AnyObject) {
    return !this.engagement.partner?.id || this.isReadOnly(field, permissions);
  }

  _setPartnerAddress(partner) {
    if (!partner) {
      return '';
    }

    return [partner.address, partner.postal_code, partner.city, partner.country].filter((info) => !!info).join(', ');
  }

  _setPlaceholderColor(partner) {
    return !partner || !partner.id ? 'no-data-fetched' : '';
  }

  _checkInvalid(value) {
    return !!value;
  }

  _hideField(fieldName: any, optionsData: AnyObject) {
    if (!fieldName || !optionsData) {
      return false;
    }
  }

  isOfficersReadonly(permissions: AnyObject, requestInProcess, partner) {
    return (
      this.isReadOnly('authorized_officers', permissions, requestInProcess) ||
      !partner ||
      !partner.partnerOfficers ||
      !partner.partnerOfficers.length ||
      partner.partnerOfficers.length < 2
    );
  }

  _showActivePd(partnerType, types) {
    return typeof partnerType === 'string' && types.every((type) => !~partnerType.indexOf(type));
  }

  isPdReadonly(permissions: AnyObject, requestInProcess, partner) {
    return this.isReadOnly('active_pd', permissions, requestInProcess) || !partner.id;
  }

  activePdPlaceholder(permissions: AnyObject, partner) {
    if (!partner || !partner.id) {
      return '–';
    }
    return readonlyPermission('active_pd', permissions) ? '–' : 'Select Relevant PD(s) or SSFA(s)';
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
    return !!(+dataItemsCount && +dataItemsCount > 5);
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

  showSharedAuditField(engagement_type: string) {
    return !!engagement_type && engagement_type !== 'sc';
  }

  showAdditionalField(engagement_type: string) {
    return ['sa', 'audit', 'sc'].includes(engagement_type);
  }

  resetList() {
    this.dataItems = [];
    this.listQueries = {page: 1, page_size: 5, search: ''};
    this.searchString = '';
    this.engagementStaffs = {};
    this.datalength = 0;
  }

  getTabData() {
    const data: any = {};

    const originalUsersNotifiedIDs = (this.originalData?.users_notified || []).map((user) => +user.id);
    const usersNotifiedIDs = (this.engagement?.users_notified || []).map((user) => +user.id);
    if (this.collectionChanged(originalUsersNotifiedIDs, usersNotifiedIDs)) {
      data.users_notified = usersNotifiedIDs;
    }

    if (!this._canBeChanged(this.optionsData)) {
      return data?.users_notified ? data : null;
    }

    const el: any = this.shadowRoot?.querySelector('#engagementPurchaseDetails');
    if (el) {
      assign(data, el.getEngagementData());
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
    if (dataChanged) {
      data.staff_members = staffs;
    }

    const authorizedOfficer = this.getAuthorizedOfficer();

    if (authorizedOfficer) {
      data.authorized_officers = [authorizedOfficer];
    }

    const originalSharedIpWith = this.originalData?.shared_ip_with || [];
    const sharedIpWith = this.engagement.shared_ip_with || [];
    if (sharedIpWith.length && sharedIpWith.filter((x) => !originalSharedIpWith.includes(x)).length > 0) {
      data.shared_ip_with = sharedIpWith;
    }

    const originalOfficeIDs = (this.originalData?.offices || []).map((office) => +office.id);
    const officeIDs = (this.engagement?.offices || []).map((office) => +office.id);
    if (this.collectionChanged(originalOfficeIDs, officeIDs)) {
      data.offices = officeIDs;
    }

    const originalSectionIDs = (this.originalData.sections || []).map((section) => +section.id);
    const sectionIDs = (this.engagement?.sections || []).map((section) => +section.id);
    if (this.collectionChanged(originalSectionIDs, sectionIDs)) {
      data.sections = sectionIDs;
    }

    const activePds = (this.originalData.active_pd || []).map((pd) => pd.id);
    if (this.collectionChanged(this.activePdIds, activePds)) {
      data.active_pd = this.activePdIds;
    }

    return data;
  }

  collectionChanged(originalCollection: any[], newCollection: any[]) {
    return (
      this.collectionsHaveDifferentLength(originalCollection, newCollection) ||
      this.collectionsAreDifferent(originalCollection, newCollection)
    );
  }

  collectionsHaveDifferentLength(originalCollection: any[], newCollection: any[]) {
    return originalCollection.length !== newCollection.length;
  }

  collectionsAreDifferent(originalCollection: any[], newCollection: any[]) {
    return newCollection.filter((id) => !originalCollection.includes(+id)).length > 0;
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
