import {PolymerElement, html} from '@polymer/polymer';
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

import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {tabLayoutStyles} from '../../../styles-elements/tab-layout-styles';

import get from 'lodash-es/get';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {getChoices, collectionExists} from '../../../app-mixins/permission-controller';
import DateMixin from '../../../app-mixins/date-mixin';
import {getStaticData} from '../../../app-mixins/static-data-controller';
import '../../../data-elements/get-agreement-data';
import '../../../data-elements/update-agreement-data';
import {getUserData} from '../../../app-mixins/user-controller';
declare const dayjs: any;

/**
 * @polymer
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
class EngagementInfoDetails extends DateMixin(CommonMethodsMixin(PolymerElement)) {
  static get template() {
    // language=HTML
    return html`
      ${tabInputsStyles} ${moduleStyles} ${tabLayoutStyles}
      <style>
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
      </style>

      <get-agreement-data agreement="{{data.agreement}}" order-number="{{orderNumber}}"> </get-agreement-data>

      <update-agreement-data
        agreement="{{data.agreement}}"
        new-date="[[contractExpiryDate]]"
        po-updating="{{poUpdating}}"
        errors="{{errors}}"
      >
      </update-agreement-data>

      <etools-content-panel class="content-section clearfix" panel-title="Engagement Overview">
        <div class="row-h group  float">
          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- Purchase Order -->
            <paper-input
              id="purchaseOrder"
              class$="disabled-as-readonly {{_setRequired('agreement', basePermissionPath)}}"
              field="agreement"
              value="{{data.agreement.order_number}}"
              allowed-pattern="[0-9]"
              label="[[getLabel('agreement.order_number', basePermissionPath)]]"
              placeholder="Enter [[getLabel('agreement.order_number', basePermissionPath)]]"
              disabled$="[[isReadOnly('agreement', basePermissionPath)]]"
              readonly="[[requestInProcess]]"
              maxlength="30"
              required
              invalid$="{{_checkInvalid(errors.agreement)}}"
              error-message="{{errors.agreement}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              on-keydown="poKeydown"
              on-blur="_requestAgreement"
            >
            </paper-input>

            <etools-loading active="[[requestInProcess]]" no-overlay loading-text="" class="po-loading">
            </etools-loading>
          </div>

          <div class="input-container">
            <!-- Auditor -->
            <paper-input
              id="auditorInput"
              class$="without-border [[_setReadonlyFieldClass(data.agreement)]]"
              value="[[data.agreement.auditor_firm.name]]"
              label="[[getLabel('agreement.auditor_firm.name', basePermissionPath)]]"
              placeholder="[[getReadonlyPlaceholder(data.agreement)]]"
              disabled
              readonly
            >
            </paper-input>
            <paper-tooltip offset="0">[[data.agreement.auditor_firm.name]]</paper-tooltip>
          </div>

          <div class="input-container" hidden$="[[_hideField('po_item', basePermissionPath)]]">
            <!-- PO Item Number -->
            <etools-dropdown
              class$="validate-field disabled-as-readonly [[_setRequired('po_item', basePermissionPath)]]"
              selected="{{data.po_item}}"
              label="[[getLabel('po_item', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('po_item', basePermissionPath)]]"
              options="[[_getPoItems(data.agreement)]]"
              option-label="number"
              option-value="id"
              required$="[[_setRequired('po_item', basePermissionPath)]]"
              disabled$="[[_isDataAgreementReadonly('po_item', basePermissionPath, data.agreement)]]"
              readonly$="[[_isDataAgreementReadonly('po_item', basePermissionPath, data.agreement)]]"
              invalid="{{_checkInvalid(errors.po_item)}}"
              error-message="{{errors.po_item}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              hide-search
            >
            </etools-dropdown>
            <paper-tooltip offset="0">[[data.po_item.number]]</paper-tooltip>
          </div>

          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- PO Date -->
            <datepicker-lite
              id="contractStartDateInput"
              class$="without-border [[_setReadonlyFieldClass(data.agreement)]]"
              value="[[data.agreement.contract_start_date]]"
              label="[[getLabel('agreement.contract_start_date', basePermissionPath)]]"
              placeholder="[[getReadonlyPlaceholder(data.agreement)]]"
              disabled
              readonly
              selected-date-display-format="D MMM YYYY"
              hidden$="{{!_showPrefix('contract_start_date', basePermissionPath,
                                    data.agreement.contract_start_date, 'readonly')}}"
              icon="date-range"
            >
            </datepicker-lite>
          </div>

          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- Contract Expiry Date -->
            <datepicker-lite
              id="contractEndDateInput"
              class$="disabled-as-readonly {{_setRequired('related_agreement.contract_end_date',
                                                        basePermissionPath)}} validate-field"
              value="[[data.agreement.contract_end_date]]"
              label="[[getLabel('agreement.contract_end_date', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('agreement.contract_end_date',
                                                            basePermissionPath, 'datepicker')]]"
              required="[[_setRequired('related_agreement.contract_end_date', basePermissionPath)]]"
              disabled$="[[isReadOnly('related_agreement.contract_end_date', basePermissionPath)]]"
              invalid="{{_checkInvalid(errors.contract_end_date)}}"
              error-message="{{errors.contract_end_date}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              on-date-has-changed="_contractEndDateHasChanged"
              fire-date-has-changed
              selected-date-display-format="D MMM YYYY"
              min-date="{{_setExpiryMinDate(data.agreement.contract_start_date)}}"
            >
            </datepicker-lite>
            <etools-loading active="{{poUpdating}}" no-overlay loading-text="" class="po-loading"> </etools-loading>
          </div>

          <div class="input-container" hidden$="[[_hideField('partner_contacted_at', basePermissionPath)]]">
            <!-- Date Partner Was Contacted -->
            <datepicker-lite
              id="contactedDateInput"
              class$="disabled-as-readonly {{_setRequired('partner_contacted_at', basePermissionPath)}}
                                validate-field"
              value="{{data.partner_contacted_at}}"
              label="[[getLabel('partner_contacted_at', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('partner_contacted_at', basePermissionPath, 'datepicker')]]"
              required="[[_setRequired('partner_contacted_at', basePermissionPath)]]"
              disabled$="[[isReadOnly('partner_contacted_at', basePermissionPath)]]"
              invalid="{{_checkInvalid(errors.partner_contacted_at)}}"
              error-message="{{errors.partner_contacted_at}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              max-date="[[maxDate]]"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <etools-info-tooltip
              hide-tooltip="{{_hideTooltip(basePermissionPath, showInput,
                                                        data.engagement_type)}}"
            >
              <!-- Engagement Type -->
              <etools-dropdown
                slot="field"
                id="engagementType"
                class$="disabled-as-readonly {{_setRequired('engagement_type', basePermissionPath)}}
                                  validate-field"
                selected="{{data.engagement_type}}"
                label="[[getLabel('engagement_type', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('engagement_type', basePermissionPath, 'dropdown')]]"
                options="[[engagementTypes]]"
                option-label="label"
                option-value="value"
                required="[[_setRequired('engagement_type', basePermissionPath)]]"
                disabled="[[isReadOnly('engagement_type', basePermissionPath)]]"
                readonly="[[isReadOnly('engagement_type', basePermissionPath)]]"
                invalid="{{_checkInvalid(errors.engagement_type)}}"
                error-message="{{errors.engagement_type}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                trigger-value-change-event
                on-etools-selected-item-changed="_setEngagementTypeObject"
                hide-search
              >
              </etools-dropdown>
              <span slot="message"
                >Attach FACE Form Requesting Funding, <br />
                ICE Form, FACE Form Reporting,<br />
                Statement of Expenditure</span
              >
            </etools-info-tooltip>

            <paper-tooltip for="engagementType" offset="0">
              [[_getEngagementTypeLabel(data.engagement_type)]]
            </paper-tooltip>
          </div>

          <template is="dom-if" if="{{showInput}}" restamp>
            <div class="input-container" hidden$="[[_hideField('start_date', basePermissionPath)]]">
              <!-- Period Start Date -->
              <datepicker-lite
                id="periodStartDateInput"
                class$="disabled-as-readonly {{_isAdditionalFieldRequired('start_date',
                                      basePermissionPath, data.engagement_type)}} validate-field"
                value="{{data.start_date}}"
                label="[[getLabel('start_date', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('start_date', basePermissionPath, 'datepicker')]]"
                selected-date-display-format="D MMM YYYY"
                required="[[_isAdditionalFieldRequired('start_date', basePermissionPath,
                                        data.engagement_type)]]"
                disabled$="[[isReadOnly('start_date', basePermissionPath)]]"
                invalid="{{_checkInvalid(errors.start_date)}}"
                error-message="{{errors.start_date}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
              >
              </datepicker-lite>
            </div>
          </template>

          <template is="dom-if" if="{{showInput}}" restamp>
            <div class="input-container" hidden$="[[_hideField('end_date', basePermissionPath)]]">
              <!-- Period End Date -->
              <datepicker-lite
                id="periodEndDateInput"
                class$="disabled-as-readonly {{_isAdditionalFieldRequired('end_date', basePermissionPath,
                                        data.engagement_type)}} validate-field"
                value="{{data.end_date}}"
                label="[[getLabel('end_date', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('end_date', basePermissionPath, 'datepicker')]]"
                data-selector="periodEndDate"
                required="[[_isAdditionalFieldRequired('end_date', basePermissionPath,
                                            data.engagement_type)]]"
                disabled$="[[isReadOnly('end_date', basePermissionPath)]]"
                invalid="{{_checkInvalid(errors.end_date)}}"
                error-message="{{errors.end_date}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                selected-date-display-format="D MMM YYYY"
              >
              </datepicker-lite>
            </div>
          </template>

          <template is="dom-if" if="{{showInput}}" restamp>
            <div class="input-container" hidden$="[[_hideField('total_value', basePermissionPath)]]">
              <!-- Total Value of Selected FACE Forms -->
              <etools-currency-amount-input
                class$="disabled-as-readonly validate-field
                                {{_isAdditionalFieldRequired('total_value', basePermissionPath, data.engagement_type)}}"
                field="total_value"
                value="{{data.total_value}}"
                currency="$"
                label="[[getLabel('total_value', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('total_value', basePermissionPath)]]"
                required$="[[_isAdditionalFieldRequired('total_value', basePermissionPath,
                                        data.engagement_type)]]"
                disabled$="[[isReadOnly('total_value', basePermissionPath)]]"
                invalid="{{_checkInvalid(errors.total_value)}}"
                error-message="{{errors.total_value}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
              >
              </etools-currency-amount-input>
            </div>
          </template>

          <template is="dom-if" if="{{showJoinAudit}}" restamp>
            <!-- Joint Audit -->
            <div class="input-container join-audit">
              <paper-checkbox
                checked="{{data.joint_audit}}"
                disabled="[[isReadOnly('joint_audit', basePermissionPath)]]"
              >
                [[getLabel('joint_audit', basePermissionPath)]]
              </paper-checkbox>
            </div>
          </template>

          <template is="dom-if" if="{{showAdditionalInput}}" restamp>
            <!-- Shared Audit with-->
            <div class="input-container" hidden$="[[_hideField('shared_ip_with', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input disabled-as-readonly [[_setRequired('shared_ip_with',
                                        basePermissionPath)]]"
                label="[[getLabel('shared_ip_with', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('shared_ip_with', basePermissionPath)]]"
                options="[[sharedIpWithOptions]]"
                option-label="display_name"
                option-value="value"
                selected-values="{{data.shared_ip_with}}"
                required$="[[_setRequired('shared_ip_with', basePermissionPath)]]"
                disabled$="[[isReadOnly('shared_ip_with', basePermissionPath)]]"
                readonly$="[[isReadOnly('shared_ip_with', basePermissionPath)]]"
                invalid="{{errors.shared_ip_with}}"
                error-message="{{errors.shared_ip_with}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <template is="dom-if" if="{{showInput}}" restamp>
            <!-- Sections -->
            <div class="input-container" hidden$="[[_hideField('sections', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input disabled-as-readonly [[_setRequired('sections',
                                        basePermissionPath)]]"
                label="[[getLabel('sections', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('sections', basePermissionPath)]]"
                options="[[sectionOptions]]"
                option-label="name"
                option-value="id"
                selected-values="{{sectionIDs}}"
                required$="[[_setRequired('sections', basePermissionPath)]]"
                disabled$="[[isReadOnly('sections', basePermissionPath)]]"
                readonly$="[[isReadOnly('sections', basePermissionPath)]]"
                invalid="{{errors.sections}}"
                error-message="{{errors.sections}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <template is="dom-if" if="{{showInput}}" restamp>
            <!-- Offices -->
            <div class="input-container" hidden$="[[_hideField('offices', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input disabled-as-readonly [[_setRequired('offices',
                                        basePermissionPath)]]"
                label="[[getLabel('offices', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('offices', basePermissionPath)]]"
                options="[[officeOptions]]"
                option-label="name"
                option-value="id"
                selected-values="{{officeIDs}}"
                required$="[[_setRequired('offices', basePermissionPath)]]"
                disabled$="[[isReadOnly('offices', basePermissionPath)]]"
                readonly$="[[isReadOnly('offices', basePermissionPath)]]"
                invalid="{{errors.offices}}"
                error-message="{{errors.offices}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <!-- Notify when completed -->
          <div class="input-container" hidden$="[[_hideField('users_notified', basePermissionPath)]]">
            <etools-dropdown-multi
              class$="validate-input disabled-as-readonly [[_setRequired('users_notified',
                                      basePermissionPath)]]"
              label="[[getLabel('users_notified', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('users_notified', basePermissionPath)]]"
              options="[[usersNotifiedOptions]]"
              option-label="name"
              option-value="id"
              selected-values="{{usersNotifiedIDs}}"
              required$="[[_setRequired('users_notified', basePermissionPath)]]"
              disabled$="[[isReadOnly('users_notified', basePermissionPath)]]"
              readonly$="[[isReadOnly('users_notified', basePermissionPath)]]"
              invalid="{{errors.users_notified}}"
              error-message="{{errors.users_notified}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
            >
            </etools-dropdown-multi>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: String, observer: '_basePathChanged'})
  basePermissionPath!: string;

  @property({type: Array, computed: '_setEngagementTypes(basePermissionPath)'})
  engagementTypes: GenericObject[] = [
    {
      label: 'Micro Assessment',
      link: 'micro-assessments',
      value: 'ma'
    },
    {
      label: 'Audit',
      link: 'audits',
      value: 'audit'
    },
    {
      label: 'Spot Check',
      link: 'spot-checks',
      value: 'sc'
    },
    {
      label: 'Special Audit',
      link: 'special-audits',
      value: 'sa'
    }
  ];

  @property({type: Object, notify: true})
  data!: any;

  @property({type: Object})
  originalData: any = {};

  @property({type: Object})
  errors = {};

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

  @property({type: Array, computed: '_setSharedIpWith(basePermissionPath)'})
  sharedIpWithOptions: [] = [];

  @property({type: Array})
  sharedIpWith: any[] = [];

  @property({type: Boolean, computed: '_showJoinAudit(showInput, showAdditionalInput)'})
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

  @property({type: Array})
  usersNotifiedOptions: GenericObject[] = [];

  @property({type: Array})
  usersNotifiedIDs: any[] = [];

  static get observers() {
    return [
      '_errorHandler(errorObject)',
      '_setShowInput(data.engagement_type)',
      '_setAdditionalInput(data.engagement_type)',
      'updateStyles(poPermissionPath, poUpdating)',
      'updateStyles(data.engagement_type)',
      'updatePoBasePath(data.agreement.id)',
      '_prepareData(data)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    (this.$.purchaseOrder as PaperInputElement).validate = this._validatePurchaseOrder.bind(this, this.$.purchaseOrder);
    this.addEventListener('agreement-loaded', this._agreementLoaded);
  }

  _setEngagementTypeObject(e) {
    this.set('data.engagement_type_details', e.detail.selectedItem);
  }

  _prepareData() {
    // reset orderNumber
    this.set('orderNumber', null);

    this.populateDropdownsAndSetSelectedValues();

    const poItemId = this.get('data.po_item.id');
    if (poItemId) {
      this.set('data.po_item', poItemId);
    }
  }

  userIsFirmStaffAuditor() {
    const userData = getUserData();
    return userData && !userData.is_unicef_user;
  }

  populateDropdownsAndSetSelectedValues() {
    // For firm staff auditors certain endpoints return 403
    const userIsFirmStaffAuditor = this.userIsFirmStaffAuditor();

    const savedSections = this.get('data.sections') || [];
    this.set('sectionOptions', (userIsFirmStaffAuditor ? savedSections : getStaticData('sections')) || []);
    const sectionIDs = savedSections.map((section) => section.id);
    this.set('sectionIDs', sectionIDs);

    const savedOffices = this.get('data.offices') || [];
    this.set('officeOptions', (userIsFirmStaffAuditor ? savedOffices : getStaticData('offices')) || []);
    const officeIDs = savedOffices.map((office) => office.id);
    this.set('officeIDs', officeIDs);

    if (!this.users) {
      this.set('users', getStaticData('users') || []);
    }
    this.setUsersNotifiedIDs();
  }

  setUsersNotifiedIDs() {
    const availableUsers = [...this.users];
    const notifiedUsers = this.get('data.users_notified') || [];
    this.handleUsersNoLongerAssignedToCurrentCountry(availableUsers, notifiedUsers);
    this.set('usersNotifiedOptions', availableUsers);
    const usersNotifiedIDs = notifiedUsers.map((user) => user.id);
    this.set('usersNotifiedIDs', usersNotifiedIDs);
  }

  populateUsersNotifiedDropDown() {
    this.usersNotifiedOptions = [...this.users];
  }

  _setSharedIpWith(basePermissionPath: string) {
    const sharedIpWithOptions = getChoices(`${basePermissionPath}.shared_ip_with.child`);
    return sharedIpWithOptions || [];
  }

  validate() {
    const orderField = this.$.purchaseOrder as PaperInputElement;
    const orderValid = orderField && orderField.validate();

    const elements = this.shadowRoot!.querySelectorAll('.validate-field');
    let valid = true;
    elements.forEach((element: any) => {
      if (element.required && !element.disabled && !element.validate()) {
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
    this.set('errors.agreement', false);
    const el = this.shadowRoot!.querySelectorAll('.validate-field');
    el.forEach((e: any) => e.set('invalid', false));

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
      this.set('orderNumber', null);
      return;
    }

    if (!this._validatePOLength(value)) {
      this.set('errors.agreement', 'Purchase order number must be 10 digits');
      this.set('orderNumber', null);
      return;
    }

    this.requestInProcess = true;
    this.set('orderNumber', value);
    return true;
  }

  _agreementLoaded() {
    this.requestInProcess = false;
    (this.$.purchaseOrder as PaperInputElement).validate();
  }

  resetAgreement() {
    this.set('data.agreement', {order_number: this.data && this.data.agreement && this.data.agreement.order_number});
    this.set('contractExpiryDate', undefined);
    this.set('orderNumber', null);
  }

  _validatePurchaseOrder(orderInput: any) {
    if (orderInput && (orderInput.readonly || orderInput.disabled)) {
      return true;
    }
    if (this.requestInProcess) {
      this.set('errors.agreement', 'Please, wait until Purchase Order loaded');
      return false;
    }
    const value = orderInput && orderInput.value;
    if (!value && orderInput && orderInput.required) {
      this.set('errors.agreement', 'Purchase order is required');
      return false;
    }
    if (!this._validatePOLength(value)) {
      this.set('errors.agreement', 'Purchase order number must be 10 digits');
      return false;
    }
    if (!this.data || !this.data.agreement || !this.data.agreement.id) {
      this.set('errors.agreement', 'Purchase order not found');
      return false;
    }
    this.set('errors.agreement', false);
    return true;
  }

  _validatePOLength(po: any) {
    return !po || `${po}`.length === 10;
  }

  resetType() {
    (this.$.engagementType as EtoolsDropdownEl).set('selected', '');
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

    const originalUsersNotifiedIDs = (this.get('originalData.users_notified') || []).map((user) => +user.id);
    if (this.collectionChanged(originalUsersNotifiedIDs, this.usersNotifiedIDs)) {
      data.users_notified = this.usersNotifiedIDs;
    }

    const originalSharedIpWith = this.get('originalData.shared_ip_with') || [];
    const sharedIpWith = this.data.shared_ip_with || [];
    if (sharedIpWith.length && sharedIpWith.filter((x) => !originalSharedIpWith.includes(x)).length > 0) {
      data.shared_ip_with = sharedIpWith;
    }

    const originalOfficeIDs = (this.get('originalData.offices') || []).map((office) => +office.id);
    if (this.collectionChanged(originalOfficeIDs, this.officeIDs)) {
      data.offices = this.officeIDs;
    }

    const originalSectionIDs = (this.get('originalData.sections') || []).map((section) => +section.id);
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
    if(!this.get('data.agreement.id')) {
      return;
    }
    const selectedDate = event.detail.date;
    this.set('contractExpiryDate', selectedDate ? dayjs(selectedDate).format('YYYY-MM-DD') : null);
  }

  _showJoinAudit(showInput: boolean, showAdditionalInput: boolean) {
    return showAdditionalInput && showInput;
  }

  updatePoBasePath(id: any) {
    const path = id ? `po_${id}` : '';
    this.set('poPermissionPath', path);
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

    const links: {[key: string]: string} = {
      ma: 'micro-assessments',
      audit: 'audits',
      sc: 'spot-checks',
      sa: 'special-audits'
    };

    return types.map((typeObject: any) => {
      return {
        value: typeObject.value,
        label: typeObject.display_name,
        link: links[typeObject.value as string]
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

window.customElements.define('engagement-info-details', EngagementInfoDetails);

export {EngagementInfoDetails as EngagementInfoDetailsEl};
