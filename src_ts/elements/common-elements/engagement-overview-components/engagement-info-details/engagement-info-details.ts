import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/polymer/lib/elements/dom-if';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';

import get from 'lodash-es/get';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getChoices, collectionExists} from '../../../mixins/permission-controller';
import {getStaticData} from '../../../mixins/static-data-controller';
import '../../../data-elements/get-agreement-data';
import '../../../data-elements/update-agreement-data';
import famEndpoints from '../../../config/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import clone from 'lodash-es/clone';
import {getUserData} from '../../../mixins/user-controller';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-info-details')
export class EngagementInfoDetails extends CommonMethodsMixin(ModelChangedMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, tabLayoutStyles];
  }

  render() {
    if (!this.data) {
      return html``;
    }

    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;
          margin-bottom: 24px;
        }
        .po-loading {
          position: absolute;
          top: 25px;
          left: auto;
          background-color: #fff;
        }

        .etools-loading:not([active]) {
          display: none !important;
        }

        etools-info-tooltip span[slot='message'] {
          white-space: nowrap;
          line-height: 15px;
        }

        etools-info-tooltip {
          --etools-tooltip-trigger-icon-margin-left: -2px;
          --etools-tooltip-trigger-icon-margin-top: 12px;
          --etools-tooltip-trigger-icon-color: var(--gray-50);
          --etools-tooltip-trigger-icon-cursor: pointer;
        }

        .join-audit {
          padding-left: 12px;
          margin-top: 24px;
          box-sizing: border-box;
        }

        .row-h.float {
          display: flex;
          position: relative;
          width: 100%;
          flex-direction: row;
          align-items: baseline;
          justify-content: flex-start;
          flex-wrap: wrap;
          margin-bottom: 0;
        }

        .row-h.float .input-container {
          margin-bottom: 8px;
        }

        .pad-lr {
          padding: 0 12px;
        }

        etools-dropdown,
        etools-dropdown-multi {
          align-items: baseline;
          --esmm-dropdown-menu-position: absolute;
        }

        etools-dropdown-multi {
          --paper-listbox: {
            max-height: 250px;
          }
        }

        datepicker-lite {
          --paper-input-container_-_width: 100%;
        }

        .year-of-audit {
          width: 16.66%;
        }
        .year-of-audit.hide {
          visibility: hidden;
        }
      </style>

      <get-agreement-data
        .agreement="${this.data.agreement}"
        .orderNumber="${this.orderNumber}"
        @agreement-loaded="${this._agreementLoaded}"
      >
      </get-agreement-data>

      <update-agreement-data
        .agreement="${this.data.agreement}"
        .newDate="${this.contractExpiryDate}"
        @loading-state-changed="${this._poUpdatingStateChanged}"
        @agreement-changed="${this._agreementLoaded}"
      >
      </update-agreement-data>

      <etools-content-panel class="content-section clearfix" panel-title="Engagement Overview">
        <div class="row-h group  float">
          <div class="input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- Purchase Order -->
            <paper-input
              id="purchaseOrder"
              class="w100 ${this._setRequired('agreement', this.basePermissionPath)}"
              field="agreement"
              .value="${this.data.agreement?.order_number}"
              allowed-pattern="[0-9]"
              label="${this.getLabel('agreement.order_number', this.basePermissionPath)}"
              placeholder="Enter ${this.getLabel('agreement.order_number', this.basePermissionPath)}"
              ?readonly="${this.isReadOnly('agreement', this.basePermissionPath)}"
              maxlength="30"
              required
              ?invalid="${this._checkInvalid(this.errors.agreement)}"
              .errorMessage="${this.errors?.agreement}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              @keydown="${(event: any) => this.poKeydown(event)}"
              @blur="${(event: any) => this._requestAgreement(event)}"
              @value-changed="${({detail}: CustomEvent) => {
                this.valueChanged(detail, 'order_number', this.data.agreement);
              }}"
            >
            </paper-input>

            <etools-loading .active="${this.requestInProcess}" no-overlay loading-text="" class="po-loading">
            </etools-loading>
          </div>

          <div class="input-container">
            <!-- Auditor -->
            <paper-input
              id="auditorInput"
              class="w100 ${this._setReadonlyFieldClass(this.data.agreement)}"
              .value="${this.data.agreement?.auditor_firm?.name}"
              label="${this.getLabel('agreement.auditor_firm.name', this.basePermissionPath)}"
              placeholder="${this.getReadonlyPlaceholder(this.data.agreement)}"
              readonly
            >
            </paper-input>
          </div>

          <div class="input-container" ?hidden="${this._hideField('po_item', this.basePermissionPath)}">
            <!-- PO Item Number -->
            <etools-dropdown
              class="w100 validate-field ${this._setRequired('po_item', this.basePermissionPath)}"
              .selected="${this.data.po_item}"
              label="${this.getLabel('po_item', this.basePermissionPath)}"
              placeholder="&#8212;"
              .options="${this._getPoItems(this.data.agreement)}"
              option-label="number"
              option-value="id"
              ?required="${this._setRequired('po_item', this.basePermissionPath)}"
              ?readonly="${this._isDataAgreementReadonly('po_item', this.basePermissionPath, this.data.agreement)}"
              ?invalid="${this._checkInvalid(this.errors.po_item)}"
              .errorMessage="${this.errors.po_item}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'po_item', 'id', this.data)}"
              hide-search
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>

          <div class="input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- PO Date -->
            <datepicker-lite
              id="contractStartDateInput"
              class="w100 ${this._setReadonlyFieldClass(this.data.agreement)}"
              .value="${this.data.agreement?.contract_start_date}"
              label="${this.getLabel('agreement.contract_start_date', this.basePermissionPath)}"
              placeholder="${this.getReadonlyPlaceholder(this.data.agreement)}"
              readonly
              selected-date-display-format="D MMM YYYY"
              ?hidden="${!this._showPrefix(
                'contract_start_date',
                this.basePermissionPath,
                this.data.agreement?.contract_start_date,
                'readonly'
              )}"
              icon="date-range"
            >
            </datepicker-lite>
          </div>

          <div class="input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- Contract Expiry Date -->
            <datepicker-lite
              id="contractEndDateInput"
              class="w100 ${this._setRequired(
                'related_agreement.contract_end_date',
                this.basePermissionPath
              )} validate-field"
              .value="${this.data.agreement?.contract_end_date}"
              label="${this.getLabel('agreement.contract_end_date', this.basePermissionPath)}"
              placeholder="${this.getPlaceholderText(
                'agreement.contract_end_date',
                this.basePermissionPath,
                'datepicker'
              )}"
              ?required="${this._setRequired('related_agreement.contract_end_date', this.basePermissionPath)}"
              ?readonly="${this.isReadOnly('related_agreement.contract_end_date', this.basePermissionPath)}"
              ?invalid="${this._checkInvalid(this.errors.contract_end_date)}"
              .errorMessage="${this.errors.contract_end_date}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              @date-has-changed="${(e: CustomEvent) => this._contractEndDateHasChanged(e)}"
              selected-date-display-format="D MMM YYYY"
              min-date="${this._setExpiryMinDate(this.data.agreement?.contract_start_date)}"
            >
            </datepicker-lite>
            <etools-loading .active="${this.poUpdating}" no-overlay loading-text="" class="po-loading"></etools-loading>
          </div>

          <div class="input-container" ?hidden="${this._hideField('partner_contacted_at', this.basePermissionPath)}">
            <!-- Date Partner Was Contacted -->
            <datepicker-lite
              id="contactedDateInput"
              class="w100 ${this._setRequired('partner_contacted_at', this.basePermissionPath)} validate-field"
              .value="${this.data.partner_contacted_at}"
              label="${this.getLabel('partner_contacted_at', this.basePermissionPath)}"
              placeholder="${this.getPlaceholderText('partner_contacted_at', this.basePermissionPath, 'datepicker')}"
              ?required="${this._setRequired('partner_contacted_at', this.basePermissionPath)}"
              ?readonly="${this.isReadOnly('partner_contacted_at', this.basePermissionPath)}"
              ?invalid="${this._checkInvalid(this.errors.partner_contacted_at)}"
              .errorMessage="${this.errors.partner_contacted_at}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              selected-date-display-format="D MMM YYYY"
              max-date="${this.maxDate}"
              fire-date-has-changed
              property-name="partner_contacted_at"
              @date-has-changed="${({detail}: CustomEvent) =>
                this.dateHasChanged(detail, 'partner_contacted_at', this.data)}"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <etools-info-tooltip
              .hideTooltip="${this._hideTooltip(this.basePermissionPath, this.showInput, this.data.engagement_type)}"
            >
              <!-- Engagement Type -->
              <etools-dropdown
                slot="field"
                id="engagementType"
                class="w100 ${this._setRequired('engagement_type', this.basePermissionPath)} validate-field"
                .selected="${this.data.engagement_type}"
                label="${this.getLabel('engagement_type', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('engagement_type', this.basePermissionPath, 'dropdown')}"
                .options="${this.engagementTypes}"
                option-label="label"
                option-value="value"
                ?required="${this._setRequired('engagement_type', this.basePermissionPath)}"
                ?readonly="${this.isReadOnly('engagement_type', this.basePermissionPath)}"
                ?invalid="${this._checkInvalid(this.errors.engagement_type)}"
                .errorMessage="${this.errors.engagement_type}"
                @focus="${(event: any) => this._resetFieldError(event)}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) => {
                  this.selectedItemChanged(detail, 'engagement_type', 'value', this.data);
                  this.onEngagementTypeChanged();
                }}"
                hide-search
              >
              </etools-dropdown>
              <span slot="message"
                >Attach FACE Form Requesting Funding, <br />
                ICE Form, FACE Form Reporting,<br />
                Statement of Expenditure</span
              >
            </etools-info-tooltip>
          </div>

          ${this.showInput
            ? html`<div class="input-container" ?hidden="${this._hideField('start_date', this.basePermissionPath)}">
                <!-- Period Start Date -->
                <datepicker-lite
                  id="periodStartDateInput"
                  class="w100 ${this._isAdditionalFieldRequired(
                    'start_date',
                    this.basePermissionPath,
                    this.data.engagement_type
                  )} validate-field"
                  .value="${this.data.start_date}"
                  label="${this.getStartEndDateLabel(this.data.engagement_type, 'start_date', this.basePermissionPath)}"
                  placeholder="${this.getPlaceholderText('start_date', this.basePermissionPath, 'datepicker')}"
                  selected-date-display-format="D MMM YYYY"
                  ?required="${this._isAdditionalFieldRequired(
                    'start_date',
                    this.basePermissionPath,
                    this.data.engagement_type
                  )}"
                  ?readonly="${this.isReadOnly('start_date', this.basePermissionPath)}"
                  ?invalid="${this._checkInvalid(this.errors.start_date)}"
                  .errorMessage="${this.errors.start_date}"
                  @focus="${(event: any) => this._resetFieldError(event)}"
                  fire-date-has-changed
                  @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'start_date', this.data)}"
                >
                </datepicker-lite>
              </div>`
            : ``}
          ${this.showInput
            ? html` <div class="input-container" ?hidden="${this._hideField('end_date', this.basePermissionPath)}">
                  <!-- Period End Date -->
                  <datepicker-lite
                    id="periodEndDateInput"
                    class="w100 ${this._isAdditionalFieldRequired(
                      'end_date',
                      this.basePermissionPath,
                      this.data.engagement_type
                    )} validate-field"
                    .value="${this.data.end_date}"
                    label="${this.getStartEndDateLabel(this.data.engagement_type, 'end_date', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('end_date', this.basePermissionPath, 'datepicker')}"
                    data-selector="periodEndDate"
                    ?required="${this._isAdditionalFieldRequired(
                      'end_date',
                      this.basePermissionPath,
                      this.data.engagement_type
                    )}"
                    ?readonly="${this.isReadOnly('end_date', this.basePermissionPath)}"
                    ?invalid="${this._checkInvalid(this.errors.end_date)}"
                    .errorMessage="${this.errors.end_date}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'end_date', this.data)}"
                  >
                  </datepicker-lite>
                </div>
                <div class="input-container" ?hidden="${this._hideField('total_value', this.basePermissionPath)}">
                  <!-- Total Value of Selected FACE Forms -->
                  <etools-currency-amount-input
                    class="w100 validate-field
                                ${this._isAdditionalFieldRequired(
                      'total_value',
                      this.basePermissionPath,
                      this.data.engagement_type
                    )}"
                    field="total_value"
                    .value="${this.data.total_value}"
                    currency="$"
                    label="${this.getLabel('total_value', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('total_value', this.basePermissionPath)}"
                    ?required="${this._isAdditionalFieldRequired(
                      'total_value',
                      this.basePermissionPath,
                      this.data.engagement_type
                    )}"
                    ?readonly="${this.isReadOnly('total_value', this.basePermissionPath)}"
                    ?invalid="${this._checkInvalid(this.errors.total_value)}"
                    .errorMessage="${this.errors.total_value}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'total_value', this.data)}"
                  >
                  </etools-currency-amount-input>
                </div>`
            : ``}
          ${this.showJoinAudit
            ? html` <!-- Joint Audit -->
                <div class="input-container join-audit" style="width:16.66%">
                  <paper-checkbox
                    ?checked="${this.data.joint_audit}"
                    ?disabled="${this.isReadOnly('joint_audit', this.basePermissionPath)}"
                    @checked-changed="${(e: CustomEvent) => {
                      this.data.joint_audit = e.detail.value;
                    }}"
                  >
                    ${this.getLabel('joint_audit', this.basePermissionPath)}
                  </paper-checkbox>
                </div>
                <div class="input-container" class="${this.getYearOfAuditStyle(this.data.engagement_type)}">
                  <!-- Year of Audit -->
                  <etools-dropdown
                    id="yearOfAudit"
                    class="w100 ${this._setRequired('year_of_audit', this.basePermissionPath)} validate-field"
                    .selected="${this.data.year_of_audit}"
                    label="Year of Audit"
                    placeholder="${this.getPlaceholderText('year_of_audit', this.basePermissionPath, 'dropdown')}"
                    .options="${this.yearOfAuditOptions}"
                    option-label="label"
                    option-value="value"
                    ?required="${this.isAuditOrSpecialAudit(this.data.engagement_type)}"
                    ?readonly="${this.isReadOnly('year_of_audit', this.basePermissionPath)}"
                    ?invalid="${this._checkInvalid(this.errors.year_of_audit)}"
                    .errorMessage="${this.errors.year_of_audit}"
                    @focus="${this._resetFieldError}"
                    trigger-value-change-event
                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                      this.selectedItemChanged(detail, 'year_of_audit', 'value', this.data)}"
                    hide-search
                  >
                  </etools-dropdown>
                </div>`
            : ``}
          ${this.showAdditionalInput
            ? html` <!-- Shared Audit with-->
                <div class="input-container" ?hidden="${this._hideField('shared_ip_with', this.basePermissionPath)}">
                  <etools-dropdown-multi
                    id="sharedWith"
                    class="w100 validate-input ${this._setRequired('shared_ip_with', this.basePermissionPath)}"
                    label="${this.getLabel('shared_ip_with', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('shared_ip_with', this.basePermissionPath)}"
                    .options="${this.sharedIpWithOptions}"
                    option-label="display_name"
                    option-value="value"
                    .selectedValues="${this.data.shared_ip_with}"
                    ?required="${this._setRequired('shared_ip_with', this.basePermissionPath)}"
                    ?readonly="${this.isReadOnly('shared_ip_with', this.basePermissionPath)}"
                    ?invalid="${this.errors.shared_ip_with}"
                    .errorMessage="${this.errors.shared_ip_with}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      const newIds = detail.selectedItems.map((i: any) => i.value);
                      this.data.shared_ip_with = newIds;
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>`
            : ``}
          ${this.showInput
            ? html` <!-- Sections -->
                <div class="input-container" ?hidden="${this._hideField('sections', this.basePermissionPath)}">
                  <etools-dropdown-multi
                    class="w100 validate-input ${this._setRequired('sections', this.basePermissionPath)}"
                    label="${this.getLabel('sections', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('sections', this.basePermissionPath)}"
                    .options="${this.sectionOptions}"
                    option-label="name"
                    option-value="id"
                    .selectedValues="${this.sectionIDs}"
                    ?required="${this._setRequired('sections', this.basePermissionPath)}"
                    ?readonly="${this.isReadOnly('sections', this.basePermissionPath)}"
                    ?invalid="${this.errors.sections}"
                    .errorMessage="${this.errors.sections}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      const newIds = detail.selectedItems.map((i: any) => i.id);
                      this.sectionIDs = newIds;
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>
                <!-- Offices -->
                <div class="input-container" ?hidden="${this._hideField('offices', this.basePermissionPath)}">
                  <etools-dropdown-multi
                    class="w100 validate-input ${this._setRequired('offices', this.basePermissionPath)}"
                    label="${this.getLabel('offices', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('offices', this.basePermissionPath)}"
                    .options="${this.officeOptions}"
                    option-label="name"
                    option-value="id"
                    .selectedValues="${this.officeIDs}"
                    ?required="${this._setRequired('offices', this.basePermissionPath)}"
                    ?readonly="${this.isReadOnly('offices', this.basePermissionPath)}"
                    ?invalid="${this.errors.offices}"
                    .errorMessage="${this.errors.offices}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      const newIds = detail.selectedItems.map((i: any) => i.id);
                      this.officeIDs = newIds;
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>`
            : ``}
          <!-- Notified when completed -->
          <div class="input-container" ?hidden="${this._hideField('users_notified', this.basePermissionPath)}">
            <etools-dropdown-multi
              class="w100 validate-input ${this._setRequired('users_notified', this.basePermissionPath)}"
              label="${this.getLabel('users_notified', this.basePermissionPath)}"
              placeholder="${this.getPlaceholderText('users_notified', this.basePermissionPath)}"
              .options="${this.usersNotifiedOptions}"
              load-data-method="${this.loadUsersDropdownOptions}"
              preserve-search-on-close
              option-label="name"
              option-value="id"
              ?hidden="${this.isReadOnly('users_notified', this.basePermissionPath)}"
              .selectedValues="${this.usersNotifiedIDs}"
              ?required="${this._setRequired('users_notified', this.basePermissionPath)}"
              ?invalid="${this.errors.users_notified}"
              .errorMessage="${this.errors.users_notified}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                const newIds = detail.selectedItems.map((i: any) => i.id);
                this.usersNotifiedIDs = newIds;
              }}"
            >
            </etools-dropdown-multi>
            <div class="pad-lr" ?hidden="${!this.isReadOnly('users_notified', this.basePermissionPath)}">
              <label for="notifiedLbl" class="paper-label"
                >${this.getLabel('users_notified', this.basePermissionPath)}</label
              >
              <div class="input-label" ?empty="${this._emptyArray(this.data.users_notified)}">
                ${(this.data.users_notified || []).map(
                  (item, index) => html`
                    <div>
                      ${item.name}
                      <span class="separator">${this.getSeparator(this.data.users_notified, index)}</span>
                    </div>
                  `
                )}
              </div>
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
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

  @property({type: Array})
  yearOfAuditOptions!: {label: string; value: number}[];

  @property({type: Array})
  engagementTypes: GenericObject[] = [
    {
      label: 'Micro Assessment',
      value: 'ma'
    },
    {
      label: 'Audit',
      value: 'audit'
    },
    {
      label: 'Spot Check',
      value: 'sc'
    },
    {
      label: 'Special Audit',
      value: 'sa'
    }
  ];

  @property({type: Object})
  data!: any;

  @property({type: Object})
  originalData: any = {};

  @property({type: Object})
  errors: AnyObject = {};

  @property({type: String})
  engagementType = '';

  @property({type: Date})
  maxDate = new Date();

  @property({type: String})
  contractExpiryDate!: string;

  @property({type: Object})
  tabTexts = {
    name: 'Engagement Overview',
    fields: ['agreement', 'end_date', 'start_date', 'engagement_type', 'partner_contacted_at', 'total_value']
  };

  @property({type: Array})
  sharedIpWithOptions: [] = [];

  @property({type: Array})
  sharedIpWith: any[] = [];

  @property({type: Boolean})
  showJoinAudit = false;

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Boolean})
  showAdditionalInput!: boolean;

  @property({type: Boolean})
  showInput!: boolean;

  @property({type: Object})
  orderNumber!: GenericObject | null;

  @property({type: Array})
  sectionOptions!: GenericObject[];

  @property({type: Array})
  sectionIDs: number[] = [];

  @property({type: Array})
  officeOptions!: GenericObject[];

  @property({type: Array})
  officeIDs: number[] = [];

  @property({type: Array})
  users!: GenericObject[];

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Array})
  usersNotifiedOptions: GenericObject[] = [];

  @property({type: Array})
  usersNotifiedIDs: any[] = [];

  @property({type: Boolean})
  poUpdating!: boolean;

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  connectedCallback() {
    super.connectedCallback();

    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as PaperInputElement;
    purchaseOrderEl.validate = this._validatePurchaseOrder.bind(this, purchaseOrderEl);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // @dci
    // 'updateStyles(poPermissionPath, poUpdating)',
    // 'updateStyles(data.engagement_type)',

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
    }
    if (changedProperties.has('data')) {
      this.updatePoBasePath(this.data.agreement.id);
      this._prepareData();
      this.onEngagementTypeChanged();
    }
    if (changedProperties.has('basePermissionPath')) {
      // @dci this._basePathChanged();
      this._setEngagementTypes(this.basePermissionPath);
      this._setSharedIpWith(this.basePermissionPath);
    }
    if (changedProperties.has('showInput') || changedProperties.has('showAdditionalInput')) {
      this._showJoinAudit(this.showInput, this.showAdditionalInput);
    }
    if (changedProperties.has('basePermissionPath')) {
      this._setSharedIpWith(this.basePermissionPath);
    }
  }

  isReadonly_YearOfAudit(engagement_type, id) {
    if (engagement_type != 'audit') {
      return true;
    }
    if (!id) {
      return false;
    }
    return true;
  }

  onEngagementTypeChanged() {
    this._setShowInput(this.data.engagement_type);
    this._setAdditionalInput(this.data.engagement_type);
  }
  setYearOfAuditOptions(savedYearOfAudit: number) {
    const currYear = new Date().getFullYear();
    this.yearOfAuditOptions = [
      {label: String(currYear - 1), value: currYear - 1},
      {label: String(currYear), value: currYear},
      {label: String(currYear + 1), value: currYear + 1}
    ];
    if (savedYearOfAudit < currYear - 1) {
      this.yearOfAuditOptions.unshift({value: savedYearOfAudit, label: String(savedYearOfAudit)});
    }
  }

  getYearOfAuditStyle(engagementType: string) {
    let cssClasses = 'year-of-audit';
    if (!['audit', 'sa'].includes(engagementType)) {
      cssClasses += ' hide';
    }
    return cssClasses;
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
      this.setUsersNotifiedOptionsAndIDs();
      return resp;
    });
  }

  _prepareData() {
    // reset orderNumber
    this.orderNumber = null;

    this.populateDropdownsAndSetSelectedValues();

    const poItemId = this.data.po_item.id;
    if (poItemId && this.data.po_item !== poItemId) {
      this.data = {...this.data, po_item: poItemId};
      fireEvent(this, 'engagement-changed', this.data);
    }
  }

  getStartEndDateLabel(engType, field, basePermissionPath) {
    if (['sa', 'audit'].includes(engType)) {
      if (field === 'start_date') {
        return 'Start date of first reporting FACE';
      } else {
        return 'End date of last reporting FACE';
      }
    }

    return this.getLabel(field, basePermissionPath);
  }

  userIsFirmStaffAuditor() {
    const userData = getUserData();
    return userData && !userData.is_unicef_user;
  }

  populateDropdownsAndSetSelectedValues() {
    // For firm staff auditors certain endpoints return 403
    const userIsFirmStaffAuditor = this.userIsFirmStaffAuditor();

    const savedSections = this.data.sections || [];
    this.sectionOptions = (userIsFirmStaffAuditor ? savedSections : getStaticData('sections')) || [];
    const sectionIDs = savedSections.map((section) => section.id);
    this.sectionIDs = sectionIDs;

    const savedOffices = this.data.offices || [];
    this.officeOptions = (userIsFirmStaffAuditor ? savedOffices : getStaticData('offices')) || [];
    const officeIDs = savedOffices.map((office) => office.id);
    this.officeIDs = officeIDs;

    if (!this.users) {
      this.users = getStaticData('users') || [];
    }
    this.setUsersNotifiedOptionsAndIDs(true);

    this.setYearOfAuditOptions(this.data.year_of_audit);
  }

  setUsersNotifiedOptionsAndIDs(setSavedUsersIDs = false) {
    const availableUsers = [...this.users];
    const notifiedUsers = this.data.users_notified || [];
    this.handleUsersNoLongerAssignedToCurrentCountry(availableUsers, notifiedUsers);
    this.usersNotifiedOptions = availableUsers;
    if (setSavedUsersIDs) {
      // on the first call(after `data` is set), need to set usersNotifiedIDs (the IDs of the already saved users)
      const usersNotifiedIDs = notifiedUsers.map((user) => user.id);
      this.usersNotifiedIDs = usersNotifiedIDs;
    }
  }

  populateUsersNotifiedDropDown() {
    this.usersNotifiedOptions = [...this.users];
  }

  _setSharedIpWith(basePermissionPath: string) {
    const sharedIpWithOptions = getChoices(`${basePermissionPath}.shared_ip_with.child`);
    this.sharedIpWith = sharedIpWithOptions || [];
  }

  validate() {
    const orderField = this.shadowRoot!.querySelector('#purchaseOrder') as PaperInputElement;
    const orderValid = orderField && orderField.validate();

    const elements = this.shadowRoot!.querySelectorAll('.validate-field');
    let valid = true;
    elements.forEach((element: any) => {
      if (element.required && !(element.disabled || element.readonly) && !element.validate()) {
        const label = element.label || 'Field';
        element.errorMessage = `${label} is required`;
        element.invalid = true;
        valid = false;
      }
    });

    const periodStart = this.shadowRoot!.querySelector('#periodStartDateInput') as PaperInputElement;
    const periodEnd = this.shadowRoot!.querySelector('#periodEndDateInput') as PaperInputElement;
    const startValue = periodStart ? Date.parse(periodStart.value!) : 0;
    const endValue = periodEnd ? Date.parse(periodEnd.value!) : 0;

    if (periodEnd && periodStart && periodEnd && startValue && startValue > endValue) {
      periodEnd.errorMessage = 'This date should be after Period Start Date';
      periodEnd.invalid = true;
      valid = false;
    }

    return orderValid && valid;
  }

  resetValidationErrors() {
    this.errors = {...this.errors, agreement: false};
    const el = this.shadowRoot!.querySelectorAll('.validate-field');
    el.forEach((e: any) => (e.invalid = false));

    const elements = this.shadowRoot!.querySelectorAll('.validate-field');
    elements.forEach((element: any) => {
      element.errorMessage = '';
      element.invalid = false;
    });
  }

  _processValue(value: string) {
    return this.engagementTypes.filter((type: any) => {
      return type.value === value;
    })[0];
  }

  poKeydown(event: any) {
    if (event.keyCode === 13) {
      this._requestAgreement(event);
    }
  }

  _requestAgreement(event: any) {
    if (this.requestInProcess) {
      return;
    }

    const input = event && event.target;
    const value = input && input.value;

    if ((+value || +value === 0) && value === this.orderNumber) {
      return;
    }
    this.resetAgreement();

    if (!value) {
      this.orderNumber = null;
      return;
    }

    if (!this._validatePOLength(value)) {
      this.errors = {...this.errors, agreement: 'Purchase order number must be 10 digits'};
      this.orderNumber = null;
      return;
    }

    this.requestInProcess = true;
    this.orderNumber = value;
    return true;
  }

  _agreementLoaded(event: CustomEvent) {
    if (event.detail?.success) {
      this.data = {...this.data, agreement: event.detail.agreement};
      fireEvent(this, 'engagement-changed', this.data);
    } else if (event.detail?.errors) {
      this.errors = event.detail.errors;
    }
    this.requestInProcess = false;

    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as PaperInputElement;
    purchaseOrderEl.validate();
  }

  _poUpdatingStateChanged(event: CustomEvent): void {
    this.poUpdating = event.detail.state;
  }

  resetAgreement() {
    this.data.agreement.order_number = this.data && this.data.agreement && this.data.agreement.order_number;
    // @dci
    fireEvent(this, 'engagement-changed', this.data);
    this.contractExpiryDate = undefined;
    this.orderNumber = null;
  }

  _validatePurchaseOrder(orderInput: any) {
    if (orderInput && (orderInput.readonly || orderInput.disabled)) {
      return true;
    }
    if (this.requestInProcess) {
      this.errors = {...this.errors, agreement: 'Please, wait until Purchase Order loaded'};
      return false;
    }
    const value = orderInput && orderInput.value;
    if (!value && orderInput && orderInput.required) {
      this.errors = {...this.errors, agreement: 'Purchase order is required'};
      return false;
    }
    if (!this._validatePOLength(value)) {
      this.errors = {...this.errors, agreement: 'Purchase order number must be 10 digits'};
      return false;
    }
    if (!this.data || !this.data.agreement || !this.data.agreement.id) {
      this.errors = {...this.errors, agreement: 'Purchase order not found'};
      return false;
    }
    this.errors = {...this.errors, agreement: false};
    return true;
  }

  _validatePOLength(po: any) {
    return !po || `${po}`.length === 10;
  }

  resetType() {
    const etoolsDropdownEl = this.shadowRoot!.querySelector('#engagementType') as EtoolsDropdownEl;
    etoolsDropdownEl.selected = null;
  }

  getEngagementData() {
    const data: any = {};
    const agreementId = get(this, 'data.agreement.id');
    const originalAgreementId = get(this, 'originalData.agreement.id');

    if (this.originalData.start_date !== this.data.start_date) {
      data.start_date = this.data.start_date;
    }
    if (this.originalData.end_date !== this.data.end_date) {
      data.end_date = this.data.end_date;
    }
    if (this.originalData.partner_contacted_at !== this.data.partner_contacted_at) {
      data.partner_contacted_at = this.data.partner_contacted_at;
    }

    if ((!originalAgreementId && agreementId) || originalAgreementId !== agreementId) {
      data.agreement = this.data.agreement.id;
    }

    if (this.originalData.total_value !== this.data.total_value) {
      data.total_value = this.data.total_value;
    }

    if (this.originalData.engagement_type !== this.data.engagement_type && !this.isStaffSc) {
      data.engagement_type = this.data.engagement_type;
    }

    if (this.data.po_item && (!this.originalData.po_item || this.originalData.po_item.id !== +this.data.po_item)) {
      data.po_item = this.data.po_item;
    }

    if (['audit', 'sa'].includes(this.data.engagement_type)) {
      data.joint_audit = !!this.data.joint_audit;
    }

    if (['sa', 'audit'].includes(this.data.engagement_type)) {
      data.year_of_audit = this.data.year_of_audit;
    }

    const originalUsersNotifiedIDs = (this.originalData?.users_notified || []).map((user) => +user.id);
    if (this.collectionChanged(originalUsersNotifiedIDs, this.usersNotifiedIDs)) {
      data.users_notified = this.usersNotifiedIDs;
    }

    const originalSharedIpWith = this.originalData?.shared_ip_with || [];
    const sharedIpWith = this.data.shared_ip_with || [];
    if (sharedIpWith.length && sharedIpWith.filter((x) => !originalSharedIpWith.includes(x)).length > 0) {
      data.shared_ip_with = sharedIpWith;
    }

    const originalOfficeIDs = (this.originalData?.offices || []).map((office) => +office.id);
    if (this.collectionChanged(originalOfficeIDs, this.officeIDs)) {
      data.offices = this.officeIDs;
    }

    const originalSectionIDs = (this.originalData.sections || []).map((section) => +section.id);
    if (this.collectionChanged(originalSectionIDs, this.sectionIDs)) {
      data.sections = this.sectionIDs;
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

  _setShowInput(type: string) {
    this.showInput = !!type && type !== 'ma';
  }

  _setAdditionalInput(type: string) {
    this.showAdditionalInput = !!type && type !== 'sc';
  }

  _contractEndDateHasChanged(event: CustomEvent) {
    if (!this.data?.agreement?.id) {
      return;
    }
    const selectedDate = event.detail.date;
    this.contractExpiryDate = selectedDate;
  }

  _showJoinAudit(showInput: boolean, showAdditionalInput: boolean) {
    this.showJoinAudit = showAdditionalInput && showInput;
  }

  updatePoBasePath(id: any) {
    const path = id ? `po_${id}` : '';
    this.poPermissionPath = path;
  }

  _setExpiryMinDate(minDate: any) {
    if (!minDate) {
      return false;
    }
    const today = new Date(new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate());
    return new Date(today.getDate() - 1);
  }

  _hideTooltip(basePermissionPath: any, showInput: any, type: any) {
    return this.isReadOnly('engagement_type', basePermissionPath) || this.isSpecialAudit(type) || !showInput;
  }

  _setEngagementTypes(basePermissionPath: any) {
    const types = getChoices(`${basePermissionPath}.engagement_type`);
    if (!types) {
      return;
    }

    this.engagementTypes = types.map((typeObject: any) => {
      return {
        value: typeObject.value,
        label: typeObject.display_name
      };
    });
  }

  _getEngagementTypeLabel(type: string) {
    const value = this._processValue(type) || {};
    return value.label || '';
  }

  _isAdditionalFieldRequired(field: any, basePath: any, type: any) {
    if (this.isSpecialAudit(type)) {
      return false;
    }
    return this._setRequired(field, basePath);
  }

  _getPoItems(agreement: any) {
    let poItems = [];

    if (agreement && Array.isArray(agreement.items)) {
      agreement.items = agreement.items.filter((item: any) => item);

      poItems = agreement.items.map((item: any) => {
        return {
          id: item.id,
          number: `${item.number}`
        };
      });
    }

    return poItems;
  }

  _isDataAgreementReadonly(field: any, basePermissionPath: any, agreement: any) {
    if (!agreement) {
      return false;
    }
    return this.isReadOnly(field, basePermissionPath) || !agreement.order_number;
  }

  _hideField(fieldName: any, basePermissionPath: any) {
    if (!fieldName || !basePermissionPath) {
      return false;
    }

    const path = `${basePermissionPath}.${fieldName}`;
    const collectionNotExists =
      !collectionExists(path, 'POST') && !collectionExists(path, 'PUT') && !collectionExists(path, 'GET');

    return collectionNotExists;
  }

  _hideForSc(isStaffSc: any) {
    return isStaffSc;
  }

  _checkInvalid(value) {
    return !!value;
  }
}
