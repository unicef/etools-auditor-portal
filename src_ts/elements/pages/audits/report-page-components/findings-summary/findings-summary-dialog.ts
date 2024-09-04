import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {GenericObject} from '../../../../../types/global';
import toNumber from 'lodash-es/toNumber';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

/**
 * @customElement
 * @polymer
 * @appliesMixin  TableElementsMixin
 * @appliesMixin  CommonMethodsMixin
 */
@customElement('findings-summary-dialog')
export class FindingsSummaryDialog extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        .layout-horizontal {
          flex-flow: wrap;
        }
        .col:not(:first-of-type) {
          padding-inline-start: 0px !important;
        }
        .flex-column {
          display: flex;
          flex-direction: column;
        }
        .red {
          color: red;
          font-size: 12px;
          margin-bottom: -8px;
          padding-inline-start: 12px;
        }
      </style>
      <etools-dialog
        id="findings-summary"
        size="lg"
        no-padding
        keep-dialog-open
        @confirm-btn-clicked="${this.onSave}"
        dialog-title="${this.dialogTitle}"
        ok-btn-text="Save"
        @close="${this._onClose}"
      >
        <div class="container-dialog">
          <div class="row">
            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- Implementing partner name -->
              <etools-input
                class="w100 validate-input"
                .value="${this.editedItem.partner?.name}"
                label="${this.getLabel('partner.name', this.optionsData)}"
                placeholder="${this.getPlaceholderText('partner.name', this.optionsData)}"
                readonly
              >
              </etools-input>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4 flex-column">
              <!-- Audited expenditure (USD) -->
              <span class="red" ?hidden="${!this.showUSDWarning}">Please ensure that the value is in USD</span>
              <etools-currency
                id="audited-expenditure"
                class="w100 ${this._setRequired('audited_expenditure', this.optionsData)} validate-input"
                .value="${this.editedItem.audited_expenditure}"
                currency="$"
                label="${this.getLabel('audited_expenditure', this.optionsData)}"
                placeholder="${this.getPlaceholderText('audited_expenditure', this.optionsData)}"
                ?required="${this._setRequired('audited_expenditure', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                .wrapTextInReadonly="${false}"
                ?invalid="${this.errors.audited_expenditure}"
                .errorMessage="${this.errors.audited_expenditure}"
                @value-changed="${({detail}: CustomEvent) => {
                  detail.value = detail.value || 0;
                  this.numberChanged(detail, 'audited_expenditure', this.editedItem);
                  this._setAuditedExpenditure(this.editedItem.financial_findings, this.editedItem.audited_expenditure);
                }}"
                @blur="${this.customValidation}"
                @focus="${() => {
                  this.showUSDWarning = true;
                  this._resetFieldError;
                }}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4 flex-column">
              <!-- Financial findings (USD) -->
              <span class="red" ?hidden="${!this.showUSDWarning}">Please ensure that the value is in USD</span>
              <etools-currency
                id="financial-findings"
                class="w100 ${this._setRequired('financial_findings', this.optionsData)} validate-input"
                .value="${this.editedItem.financial_findings}"
                currency="$"
                label="${this.getLabel('financial_findings', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText('financial_findings', this.optionsData)}"
                ?required="${this._setRequired('financial_findings', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                .wrapTextInReadonly="${false}"
                ?invalid="${this.errors.financial_findings}"
                .errorMessage="${this.errors.financial_findings}"
                @value-changed="${({detail}: CustomEvent) => {
                  detail.value = detail.value || 0;
                  this.numberChanged(detail, 'financial_findings', this.editedItem);
                  this._setAuditedExpenditure(this.editedItem.financial_findings, this.editedItem.audited_expenditure);
                }}"
                @blur="${this.customValidation}"
                @focus="${() => {
                  this.showUSDWarning = true;
                  this._resetFieldError;
                }}"
              >
              </etools-currency>
            </div>
            <div class="col-12 input-container col-md-6 col-lg-4" ?hidden="${!this.showLocalCurrency}">
              <!-- Audited expenditure (Local) -->
              <etools-currency
                id="audited-expenditure-local"
                class="w100 validate-input ${this._setRequired('audited_expenditure_local', this.optionsData)}"
                .value="${this.editedItem.audited_expenditure_local}"
                .currency="${this.currency}"
                label="${this.getLocalLabel('audited_expenditure_local', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText('audited_expenditure_local', this.optionsData)}"
                ?required="${this._setRequired('audited_expenditure_local', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                .wrapTextInReadonly="${false}"
                ?invalid="${this.errors.audited_expenditure_local}"
                .errorMessage="${this.errors.audited_expenditure_local}"
                @value-changed="${({detail}: CustomEvent) => {
                  detail.value = detail.value || 0;
                  this.numberChanged(detail, 'audited_expenditure_local', this.editedItem);
                }}"
                @blur="${this.customValidation}"
                @focus="${this._resetFieldError}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4" ?hidden="${!this.showLocalCurrency}">
              <!-- Financial findings (Local) -->
              <etools-currency
                id="financial-findings-local"
                class="w100 validate-input ${this._setRequired('financial_findings_local', this.optionsData)}"
                .value="${this.editedItem.financial_findings_local}"
                .currency="${this.currency}"
                label="${this.getLocalLabel('financial_findings_local', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText('financial_findings_local', this.optionsData)}"
                ?required="${this._setRequired('financial_findings_local', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                .wrapTextInReadonly="${false}"
                ?invalid="${this.errors.financial_findings_local}"
                .errorMessage="${this.errors.financial_findings_local}"
                @value-changed="${({detail}: CustomEvent) => {
                  detail.value = detail.value || 0;
                  this.numberChanged(detail, 'financial_findings_local', this.editedItem);
                }}"
                @blur="${this.customValidation}"
                @focus="${this._resetFieldError}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- % of audited expenditure -->
              <etools-currency
                class="w100 validate-input"
                .value="${this.editedItem.percent_of_audited_expenditure}"
                currency=""
                label="${this.getLabel('percent_of_audited_expenditure', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText('percent_of_audited_expenditure', this.optionsData)}"
                readonly
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- Audit opinion -->
              <etools-dropdown
                id="auditOpinionDropDown"
                class="w100 validate-input ${this._setRequired('audit_opinion', this.optionsData)}"
                .selected="${this.editedItem.audit_opinion}"
                label="${this.getLabel('audit_opinion', this.optionsData)}"
                placeholder="${this.getPlaceholderText('audit_opinion', this.optionsData)}"
                .options="${this.auditOpinions}"
                option-label="display_name"
                option-value="value"
                ?required="${this._setRequired('audit_opinion', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                ?invalid="${this.errors.audit_opinion}"
                .errorMessage="${this.errors.audit_opinion}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  this.selectedItemChanged(detail, 'audit_opinion', 'value', this.editedItem)}"
                @focus="${this._resetFieldError}"
                @click="${this._resetFieldError}"
                hide-search
              >
              </etools-dropdown>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- Number of financial findings -->
              <etools-input
                class="w100"
                .value="${this.editedItem.number_of_financial_findings}"
                label="${this.getLabel('number_of_financial_findings', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText('number_of_financial_findings', this.optionsData)}"
                readonly
              >
              </etools-input>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- High risk -->
              <etools-input
                class="w100"
                .value="${this.editedItem.key_internal_weakness?.high_risk_count}"
                label="${this.getLabel('key_internal_weakness.high_risk_count', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText(
                  'key_internal_weakness.high_risk_count',
                  this.optionsData
                )}"
                readonly
              >
              </etools-input>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- Medium risk -->
              <etools-input
                class="w100"
                .value="${this.editedItem.key_internal_weakness?.medium_risk_count}"
                label="${this.getLabel('key_internal_weakness.medium_risk_count', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText(
                  'key_internal_weakness.medium_risk_count',
                  this.optionsData
                )}"
                readonly
              >
              </etools-input>
            </div>

            <div class="col-12 input-container col-md-6 col-lg-4">
              <!-- Low risk -->
              <etools-input
                class="w100"
                .value="${this.editedItem.key_internal_weakness?.low_risk_count}"
                label="${this.getLabel('key_internal_weakness.low_risk_count', this.optionsData)}"
                placeholder="${this.getNumericPlaceholderText(
                  'key_internal_weakness.low_risk_count',
                  this.optionsData
                )}"
                readonly
              >
              </etools-input>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  auditOpinions: any[] = [];

  @property({type: Object})
  opener!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: String})
  currency!: string;

  @property({type: Boolean})
  showLocalCurrency!: boolean;

  @property({type: String})
  msgUSDConfirm = '';

  @property({type: Boolean})
  showUSDWarning = false;

  set dialogData(data: any) {
    const {optionsData, editedItem, opener, dialogTitle, auditOpinions, currency, showLocalCurrency}: any = data;

    this.optionsData = optionsData;
    this.originalData = cloneDeep(editedItem);
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.opener = opener;
    this.auditOpinions = auditOpinions;
    this.currency = currency;
    this.showLocalCurrency = showLocalCurrency;
  }

  onSave() {
    if (!this.validate() || !this.customValidation(true)) {
      return;
    }
    if (this.msgUSDConfirm) {
      this.openConfirmDialog();
    } else {
      this.requestInProcess = true;
      this.opener._addItemFromDialog();
    }
  }

  openConfirmDialog() {
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: this.msgUSDConfirm,
        confirmBtnText: 'Confirm',
        cancelBtnText: 'Cancel'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this.requestInProcess = true;
        this.opener._addItemFromDialog();
      }
    });
  }

  _setAuditedExpenditure(financialFindings, auditedExpenditure) {
    const ffNumber = toNumber(financialFindings);
    const aeNumber = toNumber(auditedExpenditure);
    const val = aeNumber === 0 ? 0 : Math.floor((ffNumber / aeNumber) * 100);
    this.editedItem.percent_of_audited_expenditure = val;
  }

  customValidation(isForSaving?: boolean) {
    const ffElement = this.shadowRoot!.querySelector('#financial-findings') as unknown as EtoolsCurrency;
    const ffNumber = ffElement && toNumber(ffElement.value);
    const aeElement = this.shadowRoot!.querySelector('#audited-expenditure') as unknown as EtoolsCurrency;
    const aeNumber = aeElement && toNumber(aeElement.value);

    this.msgUSDConfirm = '';
    if (
      isForSaving &&
      ((this.originalData.audited_expenditure !== this.editedItem.audited_expenditure &&
        this.editedItem.audited_expenditure > 0) ||
        (this.originalData.financial_findings !== this.editedItem.financial_findings &&
          this.editedItem.financial_findings > 0))
    ) {
      this.msgUSDConfirm = `Please confirm that the values for Audited Expenditure:
        ${aeNumber} and Financial Findings: ${ffNumber} are in USD`;
    }
    let isvalid = true;
    if (aeNumber <= ffNumber) {
      ffElement.invalid = true;
      ffElement.errorMessage = 'Must be less than Audited Expenditure';
      isvalid = false;
    } else {
      ffElement.invalid = false;
    }

    if (this.showLocalCurrency) {
      const ffElementLocal = this.shadowRoot!.querySelector('#financial-findings-local') as unknown as EtoolsCurrency;
      const ffNumberLocal = ffElementLocal && toNumber(ffElementLocal.value);
      const aeElementLocal = this.shadowRoot!.querySelector('#audited-expenditure-local') as unknown as EtoolsCurrency;
      const aeNumberLocal = aeElementLocal && toNumber(aeElementLocal.value);
      if (aeNumberLocal <= ffNumberLocal) {
        ffElementLocal.invalid = true;
        ffElementLocal.errorMessage = 'Must be less than Audited Expenditure Local';
        isvalid = false;
      } else {
        ffElementLocal.invalid = false;
      }
    }
    return isvalid;
  }

  getLocalLabel(path, base) {
    return String(this.getLabel(path, base));
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
