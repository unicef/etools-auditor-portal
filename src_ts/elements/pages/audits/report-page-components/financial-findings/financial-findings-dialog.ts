import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '@unicef-polymer/etools-types';
import {divideWithExchangeRate} from '../../../../utils/utils';

/**
 * @customElement
 * @LitElement
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('financial-findings-dialog')
export class FinancialFindingsDialog extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        etools-currency::part(input) {
          text-align: end;
        }
      </style>
      <etools-dialog
        id="financial-findings"
        no-padding
        size="md"
        keep-dialog-open
        dialog-title="${this.dialogTitle}"
        ok-btn-text="Add"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
        <div class="container-dialog">
          <div class="row">
            <div class="col-12 input-container col-lg-6 col-md-6">
              <!-- Title -->
              <etools-dropdown
                id="titleOptionsDropDown"
                class="w100 ${this._setRequired('financial_finding_set.title', this.optionsData)} validate-input"
                label="${this.getLabel('financial_finding_set.title', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.title', this.optionsData)}"
                .options="${this.titleOptions}"
                option-label="display_name"
                option-value="value"
                .selected="${this.editedItem.title}"
                ?required="${this._setRequired('financial_finding_set.title', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                ?invalid="${this.errors.title}"
                .errorMessage="${this.errors.title}"
                @focus="${this._resetFieldError}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  this.selectedItemChanged(detail, 'title', 'value', this.editedItem)}"
                hide-search
              >
              </etools-dropdown>
            </div>
          </div>

          <div class="row">
            <div class="col-12 input-container col-lg-6 col-md-6">
              <!-- Amount (local) -->
              <etools-currency
                id="ecFinancialFindingLocal"
                class="w100 ${this._setRequired('financial_finding_set.local_amount', this.optionsData)} validate-input"
                .value="${this.editedItem.local_amount}"
                currency=""
                label="${this.getLabel('financial_finding_set.local_amount', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.local_amount', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.local_amount', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                ?invalid="${this.errors.local_amount}"
                .errorMessage="${this.errors.local_amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => {
                  if (Number(this.editedItem?.local_amount) === Number(detail?.value)) {
                    return;
                  }
                  if (!this.priorFaceForms && !this.validateFindingValue(detail.value)) {
                    return;
                  }
                  this.numberChanged(detail, 'local_amount', this.editedItem);
                  if (this.priorFaceForms) {
                    return;
                  }
                  detail.value = divideWithExchangeRate(detail.value, this.editedItem.exchange_rate);
                  this.numberChanged(detail, 'amount', this.editedItem);
                }}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-lg-6 col-md-6">
              <!-- Amount USD -->
              <etools-currency
                class="w100 ${this._setRequired('financial_finding_set.amount', this.optionsData)} validate-input"
                .value="${this.editedItem.amount}"
                label="${this.getLabel('financial_finding_set.amount', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.amount', this.optionsData)}"
                ?readonly="${!this.priorFaceForms || this.requestInProcess}"
                ?invalid="${this.errors.amount}"
                .errorMessage="${this.errors.amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'amount', this.editedItem)}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container">
              <!-- Description -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.description', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.description}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.description', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.description', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.description', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.description}"
                .errorMessage="${this.errors.description}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'description', this.editedItem)}"
              >
              </etools-textarea>
            </div>
            <div class="col-12 input-container">
              <!-- Recommendation -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.recommendation', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.recommendation}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.recommendation', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.recommendation', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.recommendation', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.recommendation}"
                .errorMessage="${this.errors.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.valueChanged(detail, 'recommendation', this.editedItem)}"
              >
              </etools-textarea>
            </div>
            <div class="col-12 input-container">
              <!-- IP comments -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.ip_comments', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.ip_comments}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.ip_comments', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.ip_comments', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.ip_comments', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.ip_comments}"
                .errorMessage="${this.errors.ip_comments}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'ip_comments', this.editedItem)}"
              >
              </etools-textarea>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  titleOptions: any[] = [];

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  opener!: GenericObject;

  @property({type: Boolean})
  priorFaceForms!: boolean;

  @property({type: Boolean})
  isStaffSc!: boolean;

  @property({type: Number})
  totalFinancialFindings = 0;

  set dialogData(data: any) {
    const {optionsData, editedItem, opener, dialogTitle, titleOptions, priorFaceForms, engagement, isStaffSc}: any =
      data;

    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.priorFaceForms = priorFaceForms;
    this.opener = opener;
    this.titleOptions = titleOptions;
    this.engagement = engagement;
    this.isStaffSc = isStaffSc;

    const financialFindingsArr = (this.engagement?.financial_finding_set || []).filter(
      (x: any) => x.id !== this.editedItem?.id
    );
    this.totalFinancialFindings = financialFindingsArr.length
      ? financialFindingsArr.map((x: any) => Number(x.local_amount)).reduce((a, b) => a + b)
      : 0;
  }

  validateFindingValue(findingValue: number) {
    const compareAgainst = this.isStaffSc
      ? Number(this.engagement?.total_amount_tested_local || 0)
      : Number(this.engagement?.audited_expenditure_local || 0);

    if ((this.totalFinancialFindings + Number(findingValue) || 0) > compareAgainst) {
      const msg = this.isStaffSc ? 'Total Amount Tested' : 'Audited Expenditure';
      fireEvent(this, 'toast', {
        text: `Amount of Financial Findings should not be higher than the ${msg}`
      });
      (this.shadowRoot?.querySelector('#ecFinancialFindingLocal') as HTMLInputElement).value =
        this.editedItem?.local_amount || 0;
      return false;
    }
    return true;
  }

  onSave() {
    if (!this.validate()) {
      return;
    }
    this.requestInProcess = true;
    this.opener._addItemFromDialog();
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
