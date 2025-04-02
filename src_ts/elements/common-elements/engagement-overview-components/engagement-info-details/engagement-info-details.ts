import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';

import get from 'lodash-es/get';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {collectionExists, getOptionsChoices} from '../../../mixins/permission-controller';
import '../../../data-elements/get-agreement-data';
import '../../../data-elements/update-agreement-data';
import famEndpoints from '../../../config/endpoints';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import clone from 'lodash-es/clone';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {CommonDataState} from '../../../../redux/reducers/common-data';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {updateCurrentEngagement} from '../../../../redux/actions/engagement';
import cloneDeep from 'lodash-es/cloneDeep';
import {getObjectsIDs} from '../../../utils/utils';
import {waitForCondition} from '@unicef-polymer/etools-utils/dist/wait.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {getEndpoint} from '../../../config/endpoints-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import dayjs from 'dayjs';

/**
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-info-details')
export class EngagementInfoDetails extends connect(store)(CommonMethodsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, tabLayoutStyles, layoutStyles];
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
          width: 100%;
        }

        .join-audit {
          padding-inline-start: 27px !important;
          box-sizing: border-box;
          align-self: center;
          margin-bottom: 8px;
        }

        .row .input-container {
          margin-bottom: 8px;
          display: flex;
        }

        .pad-lr {
          padding: 0 12px;
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
        <div class="row">
          <div class="col-12 col-lg-4 col-md-6 input-container">
            <etools-info-tooltip
              .hideTooltip="${this._hideTooltip(this.optionsData, this.showInput, this.data.engagement_type)}"
            >
              <!-- Engagement Type -->
              <etools-dropdown
                slot="field"
                id="engagementType"
                class="w100 ${this._setRequired('engagement_type', this.optionsData)} validate-field"
                .selected="${this.data.engagement_type}"
                label="${this.getLabel('engagement_type', this.optionsData)}"
                placeholder="${this.getPlaceholderText('engagement_type', this.optionsData, 'dropdown')}"
                .options="${this.engagementTypes}"
                option-label="label"
                option-value="value"
                ?required="${this._setRequired('engagement_type', this.optionsData)}"
                ?readonly="${this.itIsReadOnly('engagement_type', this.optionsData)}"
                ?invalid="${this._checkInvalid(this.errors.engagement_type)}"
                .errorMessage="${this.errors.engagement_type}"
                @focus="${(event: any) => this._resetFieldError(event)}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) => {
                  this.selectedItemChanged(detail, 'engagement_type', 'value', this.data);
                  if (detail.selectedItem) {
                    this.onEngagementTypeChanged();
                  }
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

          <div class="col-12 col-lg-4 col-md-4 input-container">
            <etools-dropdown-multi
              id="faceForms"
              ?hidden="${!this.showFaceForm(this.data.engagement_type, this.data.partner?.id)}"
              class="w100 ${this._setRequired('engagement_type', this.optionsData)} validate-field"
              .selectedValues="${this.data.faceForms || []}"
              label="Face forms"
              .options="${this.faceFormsOption}"
              option-label="commitment_ref"
              option-value="commitment_ref"
              ?readonly="${this.itIsReadOnly('engagement_type', this.optionsData)}"
              ?invalid="${this.errors.active_pd}"
              .errorMessage="${this.errors.active_pd}"
              @focus="${this._resetFieldError}"
              dynamic-align
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                const commRefs = (detail.selectedItems || []).map((i: any) => i.commitment_ref);
                this.data.faceForms = commRefs;
                this.onFaceChange(this.data.faceForms);
              }}"
            >
            </etools-dropdown-multi>
          </div>
        </div>
        <div class="row">
          <div class="col-12 col-lg-4 col-md-6 input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- Purchase Order -->
            <etools-input
              id="purchaseOrder"
              class="w100 ${this._setRequired('agreement', this.optionsData)}"
              field="agreement"
              .value="${this.data.agreement?.order_number}"
              allowed-pattern="[0-9]"
              label="${this.getLabel('agreement.order_number', this.optionsData)}"
              placeholder="Enter ${this.getLabel('agreement.order_number', this.optionsData)}"
              ?readonly="${this.itIsReadOnly('agreement', this.optionsData)}"
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
            </etools-input>

            <etools-loading .active="${this.requestInProcess}" no-overlay loading-text="" class="po-loading">
            </etools-loading>
          </div>

          <div class="col-12 col-lg-4 col-md-6 input-container">
            <!-- Auditor -->
            <etools-input
              id="auditorInput"
              class="w100 ${this._setReadonlyFieldClass(this.data.agreement)}"
              .value="${this.data.agreement?.auditor_firm?.name}"
              label="${this.getLabel('agreement.auditor_firm.name', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.data.agreement)}"
              readonly
            >
            </etools-input>
          </div>

          <div
            class="col-12 col-lg-4 col-md-6 input-container"
            ?hidden="${this._hideField('po_item', this.optionsData)}"
          >
            <!-- PO Item Number -->
            <etools-dropdown
              id="ddlPOItem"
              class="w100 validate-field ${this._setRequired('po_item', this.optionsData)}"
              .selected="${this.data.po_item}"
              label="${this.getLabel('po_item', this.optionsData)}"
              placeholder="&#8212;"
              .options="${this._getPoItems(this.data.agreement)}"
              option-label="number"
              option-value="id"
              ?required="${this._setRequired('po_item', this.optionsData)}"
              ?readonly="${this._isDataAgreementReadonly('po_item', this.optionsData, this.data.agreement)}"
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

          <div class="col-12 col-lg-4 col-md-6 input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- PO Date -->
            <datepicker-lite
              id="contractStartDateInput"
              class="w100 ${this._setReadonlyFieldClass(this.data.agreement)}"
              .value="${this.data.agreement?.contract_start_date}"
              label="${this.getLabel('agreement.contract_start_date', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.data.agreement)}"
              readonly
              selected-date-display-format="D MMM YYYY"
              ?hidden="${!this._showPrefix(
                'contract_start_date',
                this.optionsData,
                this.data.agreement?.contract_start_date,
                'readonly'
              )}"
              name="date-range"
            >
            </datepicker-lite>
          </div>

          <div class="col-12 col-lg-4 col-md-6 input-container" ?hidden="${this._hideForSc(this.isStaffSc)}">
            <!-- Contract Expiry Date -->
            <datepicker-lite
              id="contractEndDateInput"
              class="w100 ${this._setRequired('related_agreement.contract_end_date', this.optionsData)} validate-field"
              .value="${this.data.agreement?.contract_end_date}"
              label="${this.getLabel('agreement.contract_end_date', this.optionsData)}"
              placeholder="${this.getPlaceholderText('agreement.contract_end_date', this.optionsData, 'datepicker')}"
              ?required="${this._setRequired('related_agreement.contract_end_date', this.optionsData)}"
              ?readonly="${this.itIsReadOnly('related_agreement.contract_end_date', this.optionsData)}"
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

          <div
            class="col-12 col-lg-4 col-md-6 input-container"
            ?hidden="${this._hideField('partner_contacted_at', this.optionsData)}"
          >
            <!-- Date Partner Was Contacted -->
            <datepicker-lite
              id="contactedDateInput"
              class="w100 ${this._setRequired('partner_contacted_at', this.optionsData)} validate-field"
              .value="${this.data.partner_contacted_at}"
              label="${this.getLabel('partner_contacted_at', this.optionsData)}"
              placeholder="${this.getPlaceholderText('partner_contacted_at', this.optionsData, 'datepicker')}"
              ?required="${this._setRequired('partner_contacted_at', this.optionsData)}"
              ?readonly="${this.itIsReadOnly('partner_contacted_at', this.optionsData)}"
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

          ${this.showInput
            ? html`<div
                class="col-12 col-lg-4 col-md-6 input-container"
                ?hidden="${this._hideField('start_date', this.optionsData)}"
              >
                <!-- Period Start Date -->
                <datepicker-lite
                  id="periodStartDateInput"
                  class="w100 ${this._isAdditionalFieldRequired(
                    'start_date',
                    this.optionsData,
                    this.data.engagement_type
                  )} validate-field"
                  .value="${this.data.start_date}"
                  label="${this.getStartEndDateLabel(this.data.engagement_type, 'start_date', this.optionsData)}"
                  placeholder="${this.getPlaceholderText('start_date', this.optionsData, 'datepicker')}"
                  selected-date-display-format="D MMM YYYY"
                  ?required="${this._isAdditionalFieldRequired(
                    'start_date',
                    this.optionsData,
                    this.data.engagement_type
                  )}"
                  ?readonly="${this.itIsReadOnly('start_date', this.optionsData)}"
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
            ? html` <div
                  class="col-12 col-lg-4 col-md-6 input-container"
                  ?hidden="${this._hideField('end_date', this.optionsData)}"
                >
                  <!-- Period End Date -->
                  <datepicker-lite
                    id="periodEndDateInput"
                    class="w100 ${this._isAdditionalFieldRequired(
                      'end_date',
                      this.optionsData,
                      this.data.engagement_type
                    )} validate-field"
                    .value="${this.data.end_date}"
                    label="${this.getStartEndDateLabel(this.data.engagement_type, 'end_date', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('end_date', this.optionsData, 'datepicker')}"
                    data-selector="periodEndDate"
                    ?required="${this._isAdditionalFieldRequired(
                      'end_date',
                      this.optionsData,
                      this.data.engagement_type
                    )}"
                    ?readonly="${this.itIsReadOnly('end_date', this.optionsData)}"
                    ?invalid="${this._checkInvalid(this.errors.end_date)}"
                    .errorMessage="${this.errors.end_date}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${({detail}: CustomEvent) => this.dateHasChanged(detail, 'end_date', this.data)}"
                  >
                  </datepicker-lite>
                </div>
                <div
                  class="col-12 col-lg-4 col-md-6 input-container"
                  ?hidden="${this._hideField('total_value', this.optionsData)}"
                >
                  <!-- Total Value of Selected FACE Forms -->
                  <etools-currency
                    class="w100 validate-field
                                ${this._isAdditionalFieldRequired(
                      'total_value',
                      this.optionsData,
                      this.data.engagement_type
                    )}"
                    field="total_value"
                    .value="${this.data.total_value}"
                    currency="$"
                    label="${this.getLabel('total_value', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
                    ?required="${this._isAdditionalFieldRequired(
                      'total_value',
                      this.optionsData,
                      this.data.engagement_type
                    )}"
                    ?readonly="${this.itIsReadOnly('total_value', this.optionsData)}"
                    ?invalid="${this._checkInvalid(this.errors.total_value)}"
                    .errorMessage="${this.errors.total_value}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'total_value', this.data)}"
                  >
                  </etools-currency>
                </div>`
            : ``}
          ${this.showJoinAudit
            ? html` <!-- Joint Audit -->
                <div class="col-md-3 col-lg-2 col-12 join-audit">
                  <etools-checkbox
                    ?checked="${this.data.joint_audit}"
                    ?disabled="${this.itIsReadOnly('joint_audit', this.optionsData)}"
                    @sl-change="${(e: any) => {
                      this.data.joint_audit = e.target.checked;
                    }}"
                  >
                    ${this.getLabel('joint_audit', this.optionsData)}
                  </etools-checkbox>
                </div>
                <div class="col-md-3 col-lg-2 col-12 ${this.getYearOfAuditStyle(this.data.engagement_type)}">
                  <!-- Year of Audit -->
                  <etools-dropdown
                    id="yearOfAudit"
                    class="w100 ${this._setRequired('year_of_audit', this.optionsData)} validate-field"
                    .selected="${this.data.year_of_audit}"
                    label="Year of Audit"
                    placeholder="${this.getPlaceholderText('year_of_audit', this.optionsData, 'dropdown')}"
                    .options="${this.yearOfAuditOptions}"
                    option-label="label"
                    option-value="value"
                    ?required="${this.isAuditOrSpecialAudit(this.data.engagement_type)}"
                    ?readonly="${this.itIsReadOnly('year_of_audit', this.optionsData)}"
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
                    .selectedValues="${this.data.shared_ip_with || []}"
                    ?required="${this._setRequired('shared_ip_with', this.optionsData)}"
                    ?readonly="${this.itIsReadOnly('shared_ip_with', this.optionsData)}"
                    ?invalid="${this.errors.shared_ip_with}"
                    .errorMessage="${this.errors.shared_ip_with}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      this.selectedItemsChanged(detail, 'shared_ip_with', 'value', this.data);
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>`
            : ``}
          ${this.showInput
            ? html` <!-- Sections -->
                <div
                  class="col-12 col-lg-4 col-md-6 input-container"
                  ?hidden="${this._hideField('sections', this.optionsData)}"
                >
                  <etools-dropdown-multi
                    class="w100 validate-input ${this._setRequired('sections', this.optionsData)}"
                    label="${this.getLabel('sections', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('sections', this.optionsData)}"
                    .options="${this.sectionOptions}"
                    option-label="name"
                    option-value="id"
                    .selectedValues="${getObjectsIDs(this.data?.sections)}"
                    ?required="${this._setRequired('sections', this.optionsData)}"
                    ?readonly="${this.itIsReadOnly('sections', this.optionsData)}"
                    ?invalid="${this.errors.sections}"
                    .errorMessage="${this.errors.sections}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      if (!isJsonStrMatch(this.data.sections, detail.selectedItems)) {
                        this.data.sections = detail.selectedItems;
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
                    .selectedValues="${getObjectsIDs(this.data?.offices)}"
                    ?required="${this._setRequired('offices', this.optionsData)}"
                    ?readonly="${this.itIsReadOnly('offices', this.optionsData)}"
                    ?invalid="${this.errors.offices}"
                    .errorMessage="${this.errors.offices}"
                    @focus="${(event: any) => this._resetFieldError(event)}"
                    dynamic-align
                    hide-search
                    trigger-value-change-event
                    @etools-selected-items-changed="${({detail}: CustomEvent) => {
                      if (!isJsonStrMatch(this.data.offices, detail.selectedItems)) {
                        this.data.offices = detail.selectedItems;
                        this.requestUpdate();
                      }
                    }}"
                  >
                  </etools-dropdown-multi>
                </div>`
            : ``}
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
              .selectedValues="${getObjectsIDs(this.data?.users_notified)}"
              ?required="${this._setRequired('users_notified', this.optionsData)}"
              ?invalid="${this.errors.users_notified}"
              .errorMessage="${this.errors.users_notified}"
              @focus="${(event: any) => this._resetFieldError(event)}"
              trigger-value-change-event
              @etools-selected-items-changed="${({detail}: CustomEvent) => {
                if (!isJsonStrMatch(this.data.users_notified, detail.selectedItems)) {
                  this.data.users_notified = detail.selectedItems;
                  this.requestUpdate();
                }
              }}"
            >
            </etools-dropdown-multi>
            <div class="pad-lr" ?hidden="${!this.itIsReadOnly('users_notified', this.optionsData)}">
              <label for="notifiedLbl" class="paper-label">${this.getLabel('users_notified', this.optionsData)}</label>
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

  private _data!: GenericObject;

  @property({type: Object})
  set data(data: GenericObject) {
    const idChanged = this._data?.id !== data?.id;
    // when engagement changed, use a clone of it
    this._data = idChanged ? cloneDeep(data) : data;
    if (idChanged) {
      // needed when we load an engagement to set visible fields
      this.onEngagementTypeChanged(false);
      waitForCondition(() => !!this.user).then(() => {
        this._prepareData();
      });
    }
  }

  get data() {
    return this._data;
  }

  @property({type: Object})
  originalData: any = {};

  @property({type: Object})
  errors: AnyObject = {};

  @property({type: String})
  engagementType = '';

  @property({type: Date})
  maxDate = new Date();

  @property({type: String})
  contractExpiryDate!: string | undefined;

  @property({type: Object})
  tabTexts = {
    name: 'Engagement Overview',
    fields: ['agreement', 'end_date', 'start_date', 'engagement_type', 'partner_contacted_at', 'total_value']
  };

  @property({type: Array})
  sharedIpWithOptions: [] = [];

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
  users!: GenericObject[];

  @property({type: Object})
  reduxCommonData!: CommonDataState;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  user!: GenericObject;

  @property({type: Array})
  usersNotifiedOptions: GenericObject[] = [];

  @property({type: Boolean})
  poUpdating!: boolean;

  @property({type: String})
  detailsRoutePath!: string;

  @property({type: Number})
  prevPartnerId!: number;

  @property({type: Array})
  faceFormsOption = [];

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  connectedCallback() {
    super.connectedCallback();

    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.detailsRoutePath, state.app.routeDetails?.path)) {
      this.detailsRoutePath = state.app.routeDetails?.path;
      // prevent controls to show old values
      this.cleanUpStoredValues();
    }
    if (state.commonData.loadedTimestamp) {
      this.reduxCommonData = state.commonData;
    }
    if (state.user?.data && !isJsonStrMatch(this.user, state.user.data)) {
      this.user = cloneDeep(state.user.data);
    }
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as EtoolsInput;
    purchaseOrderEl.validate = this._validatePurchaseOrder.bind(this, purchaseOrderEl);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
    if (changedProperties.has('optionsData')) {
      this._setEngagementTypes(this.optionsData);
      this._setSharedIpWith(this.optionsData);
    }
    if (changedProperties.has('showInput') || changedProperties.has('showAdditionalInput')) {
      this._showJoinAudit(this.showInput, this.showAdditionalInput);
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

  itIsReadOnly(field: string, permissions: AnyObject) {
    return !this.data.partner?.id || this.isReadOnly(field, permissions);
  }

  showFaceForm(engagement_type: string, partnerId?: number) {
    const showFaceForm = ['audit', 'sc'].includes(engagement_type);

    if (showFaceForm && partnerId && this.prevPartnerId !== partnerId) {
      this.prevPartnerId = partnerId;
      this.loadFaceData(this.prevPartnerId);
    }
    return showFaceForm;
  }

  loadFaceData(partnerId: number) {
    const url = getEndpoint('linkFace', {id: partnerId}).url;
    sendRequest({
      endpoint: {url}
    })
      .then((resp) => {
        this.faceFormsOption = resp.rows || [];
      })
      .catch((err) => fireEvent(this, 'toast', {text: `Error fetching Face forms data for ${partnerId}: ${err}`}));
  }

  onFaceChange(commitment_refs: string[]) {
    const selectedFaceForms: any[] = this.faceFormsOption.filter((x: any) =>
      commitment_refs.includes(x.commitment_ref)
    );
    let dct_amt_usd = 0;
    let start_date: any = null;
    let end_date: any = null;
    for (const faceForm of selectedFaceForms) {
      dct_amt_usd += Number(faceForm.dct_amt_usd);
      if (faceForm.start_date && (!start_date || dayjs(faceForm.start_date) < start_date)) {
        start_date = dayjs(faceForm.start_date);
      }
      if (faceForm.end_date && (!end_date || dayjs(faceForm.end_date) > end_date)) {
        end_date = dayjs(faceForm.end_date);
      }
    }
    this.data = {
      ...this.data,
      total_value: dct_amt_usd,
      start_date: start_date ? dayjs(start_date).format('YYYY-MM-DD') : start_date,
      end_date: end_date ? dayjs(end_date).format('YYYY-MM-DD') : end_date
    };
  }

  cleanUpStoredValues() {
    this.data = {};
    this.orderNumber = null;
  }

  onEngagementTypeChanged(updateEngagement = true) {
    this._setShowInput(this.data.engagement_type, updateEngagement);
    this._setAdditionalInput(this.data.engagement_type);
    if (updateEngagement) {
      store.dispatch(updateCurrentEngagement(this.data));
    }
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
      this.setUsersNotifiedOptions();
      return resp;
    });
  }

  _prepareData() {
    // reset orderNumber
    if (!this.user || !this.data) {
      return;
    }
    this.orderNumber = null;
    this.populateDropdownsAndSetSelectedValues();

    const poItemId = get(this.data, 'po_item.id');
    if (poItemId && poItemId !== this.data.po_item) {
      this.data.po_item = poItemId;
      store.dispatch(updateCurrentEngagement(this.data));
    }
  }

  getStartEndDateLabel(engType: string, field: string, options: AnyObject) {
    if (['sa', 'audit'].includes(engType)) {
      if (field === 'start_date') {
        return 'Start date of first reporting FACE';
      } else {
        return 'End date of last reporting FACE';
      }
    }

    return this.getLabel(field, options);
  }

  populateDropdownsAndSetSelectedValues() {
    // For firm staff auditors certain endpoints return 403
    const userIsFirmStaffAuditor = !this.user.is_unicef_user;

    const savedSections = this.data.sections || [];
    this.sectionOptions = (userIsFirmStaffAuditor ? savedSections : this.reduxCommonData?.sections) || [];

    const savedOffices = this.data.offices || [];
    this.officeOptions = (userIsFirmStaffAuditor ? savedOffices : this.reduxCommonData?.offices) || [];

    if (!this.users) {
      this.users = this.reduxCommonData?.users || [];
    }
    this.setUsersNotifiedOptions();

    this.setYearOfAuditOptions(this.data.year_of_audit);
  }

  setUsersNotifiedOptions() {
    const availableUsers = [...this.users];
    const notifiedUsers = this.data.users_notified || [];
    this.handleUsersNoLongerAssignedToCurrentCountry(availableUsers, notifiedUsers);
    this.usersNotifiedOptions = availableUsers;
  }

  populateUsersNotifiedDropDown() {
    this.usersNotifiedOptions = [...this.users];
  }

  _setSharedIpWith(optionsData: AnyObject) {
    const sharedIpWithOptions = getOptionsChoices(optionsData, 'shared_ip_with.child');
    this.sharedIpWithOptions = sharedIpWithOptions || [];
  }

  validate() {
    const orderField = this.shadowRoot!.querySelector('#purchaseOrder') as EtoolsInput;
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

    const periodStart = this.shadowRoot!.querySelector('#periodStartDateInput') as EtoolsInput;
    const periodEnd = this.shadowRoot!.querySelector('#periodEndDateInput') as EtoolsInput;
    const startValue = periodStart ? Date.parse(periodStart.value! as string) : 0;
    const endValue = periodEnd ? Date.parse(periodEnd.value! as string) : 0;

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
      store.dispatch(updateCurrentEngagement(this.data));
    } else if (event.detail?.errors) {
      this.errors = event.detail.errors;
    }
    this.requestInProcess = false;

    const purchaseOrderEl = this.shadowRoot!.querySelector('#purchaseOrder') as EtoolsInput;
    purchaseOrderEl.validate();
  }

  _poUpdatingStateChanged(event: CustomEvent): void {
    this.poUpdating = event.detail.state;
  }

  resetAgreement() {
    this.contractExpiryDate = undefined;
    this.orderNumber = null;
    const agreementNewValue = {order_number: this.data && this.data.agreement && this.data.agreement.order_number};
    if (!isJsonStrMatch(agreementNewValue, this.data.agreement)) {
      this.data.agreement = {order_number: this.data && this.data.agreement && this.data.agreement.order_number};
      store.dispatch(updateCurrentEngagement(this.data));
    }
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

  getEngagementData() {
    const data: any = {};
    const agreementId = String(get(this, 'data.agreement.id'));
    const originalAgreementId = String(get(this, 'originalData.agreement.id'));

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

    if (this.showInput) {
      if (isNaN(parseFloat(this.data.total_value)) || parseFloat(this.data.total_value) === 0) {
        this.data.total_value = null;
      }
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
    const usersNotifiedIDs = (this.data?.users_notified || []).map((user) => +user.id);
    if (this.collectionChanged(originalUsersNotifiedIDs, usersNotifiedIDs)) {
      data.users_notified = usersNotifiedIDs;
    }

    const originalSharedIpWith = this.originalData?.shared_ip_with || [];
    const sharedIpWith = this.data.shared_ip_with || [];
    if (sharedIpWith.length && sharedIpWith.filter((x) => !originalSharedIpWith.includes(x)).length > 0) {
      data.shared_ip_with = sharedIpWith;
    }

    const originalOfficeIDs = (this.originalData?.offices || []).map((office) => +office.id);
    const officeIDs = (this.data?.offices || []).map((office) => +office.id);
    if (this.collectionChanged(originalOfficeIDs, officeIDs)) {
      data.offices = officeIDs;
    }

    const originalSectionIDs = (this.originalData.sections || []).map((section) => +section.id);
    const sectionIDs = (this.data?.sections || []).map((section) => +section.id);
    if (this.collectionChanged(originalSectionIDs, sectionIDs)) {
      data.sections = sectionIDs;
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

  _setShowInput(type: string, resetValues: boolean) {
    this.showInput = !!type && type !== 'ma';
    if (!this.showInput && resetValues) {
      // reset values
      this.data.total_value = 0;
      this.data.start_date = undefined;
      this.data.end_date = undefined;
      this.data.sections = [];
      this.data.offices = [];
    }
  }

  _setAdditionalInput(type: string) {
    this.showAdditionalInput = !!type && type !== 'sc';
  }

  _contractEndDateHasChanged(event: CustomEvent) {
    if (!this.data?.agreement?.id) {
      return;
    }
    this.contractExpiryDate = event.detail.date;
  }

  _showJoinAudit(showInput: boolean, showAdditionalInput: boolean) {
    this.showJoinAudit = showAdditionalInput && showInput;
  }

  _setExpiryMinDate(minDate: any) {
    if (!minDate) {
      return false;
    }
    const today = new Date(new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate());
    return new Date(today.getDate() - 1);
  }

  _hideTooltip(options: AnyObject, showInput: any, type: any) {
    return this.itIsReadOnly('engagement_type', options) || this.isSpecialAudit(type) || !showInput;
  }

  _setEngagementTypes(options: AnyObject) {
    const types = getOptionsChoices(options, 'engagement_type');
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

  _isAdditionalFieldRequired(field: any, options: AnyObject, type: any) {
    if (this.isSpecialAudit(type)) {
      return false;
    }
    return this._setRequired(field, options);
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

  _isDataAgreementReadonly(field: string, permissions: AnyObject, agreement: any) {
    if (!agreement) {
      return false;
    }
    return this.itIsReadOnly(field, permissions) || !agreement.id;
  }

  _hideField(fieldName: any, optionsData: AnyObject) {
    if (!fieldName || !optionsData) {
      return false;
    }

    const collectionNotExists =
      !collectionExists(fieldName, optionsData, 'POST') &&
      !collectionExists(fieldName, optionsData, 'PUT') &&
      !collectionExists(fieldName, optionsData, 'GET');

    return collectionNotExists;
  }

  _hideForSc(isStaffSc: any) {
    return isStaffSc;
  }

  _checkInvalid(value) {
    return !!value;
  }
}
