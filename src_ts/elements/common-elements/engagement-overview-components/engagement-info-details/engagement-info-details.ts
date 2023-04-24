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

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';

import get from 'lodash-es/get';
import {PaperInputElement} from '@polymer/paper-input/paper-input.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getChoices, collectionExists} from '../../../mixins/permission-controller';
import DateMixin from '../../../mixins/date-mixin';
import {getStaticData} from '../../../mixins/static-data-controller';
import '../../../data-elements/get-agreement-data';
import '../../../data-elements/update-agreement-data';
import famEndpoints from '../../../config/endpoints';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import clone from 'lodash-es/clone';
import {getUserData} from '../../../mixins/user-controller';

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

        .year-of-audit {
          width: 16.66%;
        }
        .year-of-audit.hide {
          visibility: hidden;
        }
      </style>

      <get-agreement-data
        agreement="[[data.agreement]]"
        order-number="[[orderNumber]]"
        on-agreement-loaded="_agreementLoaded"
      >
      </get-agreement-data>

      <update-agreement-data
        agreement="[[data.agreement]]"
        new-date="[[contractExpiryDate]]"
        on-loading-state-changed="_poUpdatingStateChanged"
        on-agreement-changed="_agreementLoaded"
      >
      </update-agreement-data>

      <etools-content-panel class="content-section clearfix" panel-title="Engagement Overview">
        <div class="row-h group  float">
          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- Purchase Order -->
            <paper-input
              id="purchaseOrder"
              class$="[[_setRequired('agreement', basePermissionPath)]]"
              field="agreement"
              value="[[data.agreement.order_number]]"
              allowed-pattern="[0-9]"
              label="[[getLabel('agreement.order_number', basePermissionPath)]]"
              placeholder="Enter [[getLabel('agreement.order_number', basePermissionPath)]]"
              readonly$="[[isReadOnly('agreement', basePermissionPath)]]"
              maxlength="30"
              required
              invalid$="[[_checkInvalid(errors.agreement)]]"
              error-message="[[errors.agreement]]"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              on-keydown="poKeydown"
              on-blur="_requestAgreement"
              data-value-path="target.value"
              data-field-path="data.agreement.order_number"
              on-input="_setField"
            >
            </paper-input>

            <etools-loading active="[[requestInProcess]]" no-overlay loading-text="" class="po-loading">
            </etools-loading>
          </div>

          <div class="input-container">
            <!-- Auditor -->
            <paper-input
              id="auditorInput"
              class$="[[_setReadonlyFieldClass(data.agreement)]]"
              value="[[data.agreement.auditor_firm.name]]"
              label="[[getLabel('agreement.auditor_firm.name', basePermissionPath)]]"
              placeholder="[[getReadonlyPlaceholder(data.agreement)]]"
              readonly
            >
            </paper-input>
          </div>

          <div class="input-container" hidden$="[[_hideField('po_item', basePermissionPath)]]">
            <!-- PO Item Number -->
            <etools-dropdown
              class$="validate-field  [[_setRequired('po_item', basePermissionPath)]]"
              selected="[[data.po_item]]"
              label="[[getLabel('po_item', basePermissionPath)]]"
              placeholder="&#8212;"
              options="[[_getPoItems(data.agreement)]]"
              option-label="number"
              option-value="id"
              required$="[[_setRequired('po_item', basePermissionPath)]]"
              readonly$="[[_isDataAgreementReadonly('po_item', basePermissionPath, data.agreement)]]"
              invalid="[[_checkInvalid(errors.po_item)]]"
              error-message="[[errors.po_item]]"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              data-value-path="detail.selectedItem.id"
              data-field-path="data.po_item"
              on-etools-selected-item-changed="_setField"
              hide-search
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>

          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- PO Date -->
            <datepicker-lite
              id="contractStartDateInput"
              class$="[[_setReadonlyFieldClass(data.agreement)]]"
              value="[[data.agreement.contract_start_date]]"
              label="[[getLabel('agreement.contract_start_date', basePermissionPath)]]"
              placeholder="[[getReadonlyPlaceholder(data.agreement)]]"
              readonly
              selected-date-display-format="D MMM YYYY"
              hidden$="[[!_showPrefix('contract_start_date', basePermissionPath,
                                    data.agreement.contract_start_date, 'readonly')]]"
              icon="date-range"
            >
            </datepicker-lite>
          </div>

          <div class="input-container" hidden$="[[_hideForSc(isStaffSc)]]">
            <!-- Contract Expiry Date -->
            <datepicker-lite
              id="contractEndDateInput"
              class$=" [[_setRequired('related_agreement.contract_end_date',
                                                        basePermissionPath)]] validate-field"
              value="[[data.agreement.contract_end_date]]"
              label="[[getLabel('agreement.contract_end_date', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('agreement.contract_end_date',
                                                            basePermissionPath, 'datepicker')]]"
              required="[[_setRequired('related_agreement.contract_end_date', basePermissionPath)]]"
              readonly$="[[isReadOnly('related_agreement.contract_end_date', basePermissionPath)]]"
              invalid="[[_checkInvalid(errors.contract_end_date)]]"
              error-message="[[errors.contract_end_date]]"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              on-date-has-changed="_contractEndDateHasChanged"
              fire-date-has-changed
              selected-date-display-format="D MMM YYYY"
              min-date="[[_setExpiryMinDate(data.agreement.contract_start_date)]]"
            >
            </datepicker-lite>
            <etools-loading active="[[poUpdating]]" no-overlay loading-text="" class="po-loading"> </etools-loading>
          </div>

          <div class="input-container" hidden$="[[_hideField('partner_contacted_at', basePermissionPath)]]">
            <!-- Date Partner Was Contacted -->
            <datepicker-lite
              id="contactedDateInput"
              class$="[[_setRequired('partner_contacted_at', basePermissionPath)]]
                                validate-field"
              value="[[data.partner_contacted_at]]"
              label="[[getLabel('partner_contacted_at', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('partner_contacted_at', basePermissionPath, 'datepicker')]]"
              required="[[_setRequired('partner_contacted_at', basePermissionPath)]]"
              readonly$="[[isReadOnly('partner_contacted_at', basePermissionPath)]]"
              invalid="[[_checkInvalid(errors.partner_contacted_at)]]"
              error-message="[[errors.partner_contacted_at]]"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              max-date="[[maxDate]]"
              fire-date-has-changed
              property-name="partner_contacted_at"
              on-date-has-changed="dateHasChanged"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <etools-info-tooltip hide-tooltip="[[_hideTooltip(basePermissionPath, showInput, data.engagement_type)]]">
              <!-- Engagement Type -->
              <etools-dropdown
                slot="field"
                id="engagementType"
                class$="[[_setRequired('engagement_type', basePermissionPath)]]
                                  validate-field"
                selected="[[data.engagement_type]]"
                label="[[getLabel('engagement_type', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('engagement_type', basePermissionPath, 'dropdown')]]"
                options="[[engagementTypes]]"
                option-label="label"
                option-value="value"
                required="[[_setRequired('engagement_type', basePermissionPath)]]"
                readonly$="[[isReadOnly('engagement_type', basePermissionPath)]]"
                invalid="[[_checkInvalid(errors.engagement_type)]]"
                error-message="[[errors.engagement_type]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                trigger-value-change-event
                data-value-path="detail.selectedItem.value"
                data-field-path="data.engagement_type"
                on-etools-selected-item-changed="_setField"
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

          <template is="dom-if" if="[[showInput]]" restamp>
            <div class="input-container" hidden$="[[_hideField('start_date', basePermissionPath)]]">
              <!-- Period Start Date -->
              <datepicker-lite
                style="width: 100%"
                id="periodStartDateInput"
                class$="[[_isAdditionalFieldRequired('start_date',
                                      basePermissionPath, data.engagement_type)]] validate-field"
                value="[[data.start_date]]"
                label="[[getStartEndDateLabel(data.engagement_type,'start_date', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('start_date', basePermissionPath, 'datepicker')]]"
                selected-date-display-format="D MMM YYYY"
                required="[[_isAdditionalFieldRequired('start_date', basePermissionPath,
                                        data.engagement_type)]]"
                readonly$="[[isReadOnly('start_date', basePermissionPath)]]"
                invalid="[[_checkInvalid(errors.start_date)]]"
                error-message="[[errors.start_date]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                fire-date-has-changed
                property-name="start_date"
                on-date-has-changed="dateHasChanged"
              >
              </datepicker-lite>
            </div>
          </template>

          <template is="dom-if" if="[[showInput]]" restamp>
            <div class="input-container" hidden$="[[_hideField('end_date', basePermissionPath)]]">
              <!-- Period End Date -->
              <datepicker-lite
                id="periodEndDateInput"
                style="width: 100%"
                class$="[[_isAdditionalFieldRequired('end_date', basePermissionPath,
                                        data.engagement_type)]] validate-field"
                value="[[data.end_date]]"
                label="[[getStartEndDateLabel(data.engagement_type,'end_date', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('end_date', basePermissionPath, 'datepicker')]]"
                data-selector="periodEndDate"
                required="[[_isAdditionalFieldRequired('end_date', basePermissionPath,
                                            data.engagement_type)]]"
                readonly$="[[isReadOnly('end_date', basePermissionPath)]]"
                invalid="[[_checkInvalid(errors.end_date)]]"
                error-message="[[errors.end_date]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                property-name="end_date"
                on-date-has-changed="dateHasChanged"
              >
              </datepicker-lite>
            </div>
          </template>

          <template is="dom-if" if="[[showInput]]" restamp>
            <div class="input-container" hidden$="[[_hideField('total_value', basePermissionPath)]]">
              <!-- Total Value of Selected FACE Forms -->
              <etools-currency-amount-input
                class$=" validate-field
                                [[_isAdditionalFieldRequired('total_value', basePermissionPath, data.engagement_type)]]"
                field="total_value"
                value="[[data.total_value]]"
                currency="$"
                label="[[getLabel('total_value', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('total_value', basePermissionPath)]]"
                required$="[[_isAdditionalFieldRequired('total_value', basePermissionPath,
                                        data.engagement_type)]]"
                readonly$="[[isReadOnly('total_value', basePermissionPath)]]"
                invalid="[[_checkInvalid(errors.total_value)]]"
                error-message="[[errors.total_value]]"
                invalid="[[_checkInvalid(errors.total_value)]]"
                error-message="[[errors.total_value]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                data-value-path="target.value"
                data-field-path="data.total_value"
                on-input="_setField"
              >
              </etools-currency-amount-input>
            </div>
          </template>

          <template is="dom-if" if="[[showJoinAudit]]" restamp>
            <!-- Joint Audit -->
            <div class="input-container join-audit" style="width:16.66%">
              <paper-checkbox
                checked="[[data.joint_audit]]"
                disabled$="[[isReadOnly('joint_audit', basePermissionPath)]]"
                data-value-path="target.checked"
                data-field-path="data.joint_audit"
                on-change="_setField"
              >
                [[getLabel('joint_audit', basePermissionPath)]]
              </paper-checkbox>
            </div>
            <div class="input-container" class$="[[getYearOfAuditStyle(data.engagement_type)]]">
              <!-- Year of Audit -->
              <etools-dropdown
                id="yearOfAudit"
                class$="[[_setRequired('year_of_audit', basePermissionPath)]]
                                  validate-field"
                selected="[[data.year_of_audit]]"
                label="Year of Audit"
                placeholder="[[getPlaceholderText('year_of_audit', basePermissionPath, 'dropdown')]]"
                options="[[yearOfAuditOptions]]"
                option-label="label"
                option-value="value"
                required="[[isAuditOrSpecialAudit(data.engagement_type)]]"
                readonly$="[[isReadOnly('year_of_audit', basePermissionPath)]]"
                invalid="[[_checkInvalid(errors.year_of_audit)]]"
                error-message="[[errors.year_of_audit]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                trigger-value-change-event
                data-value-path="detail.selectedItem.value"
                data-field-path="data.year_of_audit"
                on-etools-selected-item-changed="_setField"
                hide-search
              >
              </etools-dropdown>
            </div>
          </template>

          <template is="dom-if" if="[[showAdditionalInput]]" restamp>
            <!-- Shared Audit with-->
            <div class="input-container" hidden$="[[_hideField('shared_ip_with', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input [[_setRequired('shared_ip_with',
                                        basePermissionPath)]]"
                label="[[getLabel('shared_ip_with', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('shared_ip_with', basePermissionPath)]]"
                options="[[sharedIpWithOptions]]"
                option-label="display_name"
                option-value="value"
                selected-values="[[data.shared_ip_with]]"
                required$="[[_setRequired('shared_ip_with', basePermissionPath)]]"
                readonly$="[[isReadOnly('shared_ip_with', basePermissionPath)]]"
                invalid="[[errors.shared_ip_with]]"
                error-message="[[errors.shared_ip_with]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
                trigger-value-change-event
                data-value-path="target.selectedValues"
                data-field-path="data.shared_ip_with"
                on-etools-selected-items-changed="_setField"
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <template is="dom-if" if="[[showInput]]" restamp>
            <!-- Sections -->
            <div class="input-container" hidden$="[[_hideField('sections', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input [[_setRequired('sections',
                                        basePermissionPath)]]"
                label="[[getLabel('sections', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('sections', basePermissionPath)]]"
                options="[[sectionOptions]]"
                option-label="name"
                option-value="id"
                selected-values="[[sectionIDs]]"
                required$="[[_setRequired('sections', basePermissionPath)]]"
                readonly$="[[isReadOnly('sections', basePermissionPath)]]"
                invalid="[[errors.sections]]"
                error-message="[[errors.sections]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
                trigger-value-change-event
                data-value-path="target.selectedValues"
                data-field-path="sectionIDs"
                on-etools-selected-items-changed="_setField"
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <template is="dom-if" if="[[showInput]]" restamp>
            <!-- Offices -->
            <div class="input-container" hidden$="[[_hideField('offices', basePermissionPath)]]">
              <etools-dropdown-multi
                class$="validate-input [[_setRequired('offices',
                                        basePermissionPath)]]"
                label="[[getLabel('offices', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('offices', basePermissionPath)]]"
                options="[[officeOptions]]"
                option-label="name"
                option-value="id"
                selected-values="[[officeIDs]]"
                required$="[[_setRequired('offices', basePermissionPath)]]"
                readonly$="[[isReadOnly('offices', basePermissionPath)]]"
                invalid="[[errors.offices]]"
                error-message="[[errors.offices]]"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
                hide-search
                trigger-value-change-event
                data-value-path="target.selectedValues"
                data-field-path="officeIDs"
                on-etools-selected-items-changed="_setField"
              >
              </etools-dropdown-multi>
            </div>
          </template>

          <!-- Notified when completed -->
          <div class="input-container" hidden$="[[_hideField('users_notified', basePermissionPath)]]">
            <etools-dropdown-multi
              class$="validate-input  [[_setRequired('users_notified',
                                      basePermissionPath)]]"
              label="[[getLabel('users_notified', basePermissionPath)]]"
              placeholder="[[getPlaceholderText('users_notified', basePermissionPath)]]"
              options="[[usersNotifiedOptions]]"
              load-data-method="[[loadUsersDropdownOptions]]"
              preserve-search-on-close
              option-label="name"
              option-value="id"
              hidden$="[[isReadOnly('users_notified', basePermissionPath)]]"
              selected-values="[[usersNotifiedIDs]]"
              required$="[[_setRequired('users_notified', basePermissionPath)]]"
              invalid="[[errors.users_notified]]"
              error-message="[[errors.users_notified]]"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              trigger-value-change-event
              data-value-path="target.selectedValues"
              data-field-path="usersNotifiedIDs"
              on-etools-selected-items-changed="_setField"
            >
            </etools-dropdown-multi>
            <div class="pad-lr" hidden$="[[!isReadOnly('users_notified', basePermissionPath)]]">
              <label for="notifiedLbl" class="paper-label">[[getLabel('users_notified', basePermissionPath)]]</label>
              <div class="input-label" empty$="[[_emptyArray(data.users_notified)]]">
                <dom-repeat items="[[data.users_notified]]">
                  <template>
                    <div>
                      [[item.name]]
                      <span class="separator">[[getSeparator(data.users_notified, index)]]</span>
                    </div>
                  </template>
                </dom-repeat>
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

  @property({type: String, observer: '_basePathChanged'})
  basePermissionPath!: string;

  @property({type: Array, computed: '_setEngagementTypes(basePermissionPath)'})
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

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

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
    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as PaperInputElement;
    purchaseOrderEl.validate = this._validatePurchaseOrder.bind(this, purchaseOrderEl);
    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
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

  setYearOfAuditOptions(savedYearOfAudit: number) {
    const currYear = new Date().getFullYear();
    this.yearOfAuditOptions = [
      {label: String(currYear - 1), value: currYear - 1},
      {label: String(currYear), value: currYear},
      {label: String(currYear + 1), value: currYear + 1}
    ];
    if (savedYearOfAudit < currYear - 1) {
      this.yearOfAuditOptions.unshift({value: savedYearOfAudit, label: '> 1 year ago'});
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
      const data = page > 1 ? [...this.users, ...resp.results] : resp.results;
      this.set('users', data);
      this.setUsersNotifiedOptionsAndIDs();
      return resp;
    });
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
    this.setUsersNotifiedOptionsAndIDs(true);

    this.setYearOfAuditOptions(this.data.year_of_audit);
  }

  setUsersNotifiedOptionsAndIDs(setSavedUsersIDs = false) {
    const availableUsers = [...this.users];
    const notifiedUsers = this.get('data.users_notified') || [];
    this.handleUsersNoLongerAssignedToCurrentCountry(availableUsers, notifiedUsers);
    this.set('usersNotifiedOptions', availableUsers);
    if (setSavedUsersIDs) {
      // on the first call(after `data` is set), need to set usersNotifiedIDs (the IDs of the already saved users)
      const usersNotifiedIDs = notifiedUsers.map((user) => user.id);
      this.set('usersNotifiedIDs', usersNotifiedIDs);
    }
  }

  populateUsersNotifiedDropDown() {
    this.usersNotifiedOptions = [...this.users];
  }

  _setSharedIpWith(basePermissionPath: string) {
    const sharedIpWithOptions = getChoices(`${basePermissionPath}.shared_ip_with.child`);
    return sharedIpWithOptions || [];
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
    this.set('errors.agreement', false);
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

  _agreementLoaded(event: CustomEvent) {
    if (event.detail?.success) {
      this.set('data.agreement', event.detail.agreement);
    } else if (event.detail?.errors) {
      this.set('errors', event.detail.errors);
    }
    this.requestInProcess = false;
    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as PaperInputElement;
    purchaseOrderEl.validate();
  }

  _poUpdatingStateChanged(event: CustomEvent): void {
    this.set('poUpdating', event.detail.state);
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
    const etoolsDropdownEl = this.shadowRoot!.querySelector('#engagementType') as EtoolsDropdownEl;
    etoolsDropdownEl.selected = '';
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
    if (!this.get('data.agreement.id')) {
      return;
    }
    const selectedDate = event.detail.date;
    this.contractExpiryDate = selectedDate;
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

    return types.map((typeObject: any) => {
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

window.customElements.define('engagement-info-details', EngagementInfoDetails);

export {EngagementInfoDetails as EngagementInfoDetailsEl};
