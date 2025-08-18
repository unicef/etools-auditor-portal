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
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import get from 'lodash-es/get';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {collectionExists, getOptionsChoices} from '../../../mixins/permission-controller';
import '../../../data-elements/get-agreement-data';
import '../../../data-elements/update-agreement-data';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {CommonDataState} from '../../../../redux/reducers/common-data';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {updateCurrentEngagement} from '../../../../redux/actions/engagement';
import cloneDeep from 'lodash-es/cloneDeep';
import {waitForCondition} from '@unicef-polymer/etools-utils/dist/wait.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-purchase-details')
export class EngagementPurchaseDetails extends connect(store)(CommonMethodsMixin(ModelChangedMixin(LitElement))) {
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
        ${dataTableStylesLit} :host {
          position: relative;
          display: block;
          margin-bottom: 0 !important;
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

        .row .input-container {
          margin-bottom: 8px;
          display: flex;
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

      <etools-media-query
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

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

        <div class="col-12 col-lg-4 col-md-6 input-container" ?hidden="${this._hideField('po_item', this.optionsData)}">
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

        <div class="col-12 col-lg-4 col-md-6 input-container" ?hidden="${!this._isAudit(this.data?.engagement_type)}">
          <!-- SAI -->
          <etools-dropdown
            id="ddlSai"
            class="w100 validate-field ${this._setRequired('conducted_by_sai', this.optionsData)}"
            .selected="${this.data.conducted_by_sai}"
            label="${this.getLabel('conducted_by_sai', this.optionsData)}"
            placeholder="&#8212;"
            .options="${this.saiOptions}"
            option-label="label"
            option-value="value"
            ?required="${this._isAudit(this.data?.engagement_type)}"
            ?readonly="${this.itIsReadOnly('conducted_by_sai', this.optionsData)}"
            ?invalid="${this._checkInvalid(this.errors.conducted_by_sai)}"
            .errorMessage="${this.errors.conducted_by_sai}"
            @focus="${(event: any) => this._resetFieldError(event)}"
            @etools-selected-item-changed="${({detail}: CustomEvent) =>
              this.selectedItemChanged(detail, 'conducted_by_sai', 'value', this.data)}"
            hide-search
            trigger-value-change-event
          >
          </etools-dropdown>
        </div>

        <div class="col-12 col-lg-4 col-md-6 input-container" 
        ?hidden="${
          this._hideForSc(this.isStaffSc) ||
          !this._showPrefix(
            'contract_start_date',
            this.optionsData,
            this.data.agreement?.contract_start_date,
            'readonly'
          )
        }">
          <!-- PO Date -->
          <datepicker-lite
            id="contractStartDateInput"
            class="w100 ${this._setReadonlyFieldClass(this.data.agreement)}"
            .value="${this.data.agreement?.contract_start_date}"
            label="${this.getLabel('agreement.contract_start_date', this.optionsData)}"
            placeholder="${this.getReadonlyPlaceholder(this.data.agreement)}"
            readonly
            selected-date-display-format="D MMM YYYY"
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
         
        </div>
      </div>
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

  @property({type: Object})
  originalData: any = {};

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

  @property({type: Array})
  saiOptions: GenericObject[] = [
    {
      label: 'Yes',
      value: 'true'
    },
    {
      label: 'No',
      value: 'false'
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
      // this.onEngagementTypeChanged(false);
      waitForCondition(() => !!this.user).then(() => {
        this._prepareData();
      });
    }
  }

  get data() {
    return this._data;
  }

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
    name: 'Engagement Details',
    fields: ['agreement', 'end_date', 'start_date', 'engagement_type', 'partner_contacted_at']
  };

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Object})
  orderNumber!: GenericObject | null;

  @property({type: Object})
  reduxCommonData!: CommonDataState;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  user!: GenericObject;

  @property({type: Boolean})
  poUpdating!: boolean;

  @property({type: String})
  detailsRoutePath!: string;

  @property({type: Number})
  prevPartnerId!: number;

  @property({type: Boolean})
  lowResolutionLayout = false;

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
    }
  }

  itIsReadOnly(field: string, permissions: AnyObject) {
    return !this.data.partner?.id || this.isReadOnly(field, permissions);
  }

  cleanUpStoredValues() {
    this.data = {};
    this.orderNumber = null;
  }

  onEngagementTypeChanged(updateEngagement = true) {
    if (updateEngagement) {
      store.dispatch(updateCurrentEngagement(this.data));
    }
  }

  _prepareData() {
    // reset orderNumber
    if (!this.user || !this.data) {
      return;
    }
    this.orderNumber = null;

    const poItemId = get(this.data, 'po_item.id');
    if (poItemId && poItemId !== this.data.po_item) {
      this.data.po_item = poItemId;
      store.dispatch(updateCurrentEngagement(this.data));
    }
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

  _isAudit(engagement_type: string) {
    return engagement_type === 'audit' || engagement_type === 'sa';
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

    if (this.originalData?.partner_contacted_at !== this.data.partner_contacted_at) {
      data.partner_contacted_at = this.data.partner_contacted_at;
    }

    if ((!originalAgreementId && agreementId) || originalAgreementId !== agreementId) {
      data.agreement = this.data.agreement.id;
    }

    if (this.data.po_item && (!this.originalData?.po_item || this.originalData?.po_item.id !== +this.data.po_item)) {
      data.po_item = this.data.po_item;
    }

    if (
      this._isAudit(this.data?.engagement_type) &&
      this.originalData?.conducted_by_sai !== this.data.conducted_by_sai
    ) {
      data.conducted_by_sai = this.data.conducted_by_sai;
    }

    return data;
  }

  collectionsHaveDifferentLength(originalCollection: any[], newCollection: any[]) {
    return originalCollection.length !== newCollection.length;
  }

  collectionsAreDifferent(originalCollection: any[], newCollection: any[]) {
    return newCollection.filter((id) => !originalCollection.includes(+id)).length > 0;
  }

  _contractEndDateHasChanged(event: CustomEvent) {
    if (!this.data?.agreement?.id) {
      return;
    }
    this.contractExpiryDate = event.detail.date;
  }

  _setExpiryMinDate(minDate: any) {
    if (!minDate) {
      return false;
    }
    const today = new Date(new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate());
    return new Date(today.getDate() - 1);
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
