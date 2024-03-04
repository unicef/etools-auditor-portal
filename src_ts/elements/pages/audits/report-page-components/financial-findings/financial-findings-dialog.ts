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
        <div class="container">
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
                @value-changed="${({detail}: CustomEvent) =>
                  this.numberChanged(detail, 'local_amount', this.editedItem)}"
              >
              </etools-currency>
            </div>

            <div class="col-12 input-container col-lg-6 col-md-6">
              <!-- Amount USD -->
              <etools-currency
                class="w100 ${this._setRequired('financial_finding_set.amount', this.optionsData)} validate-input"
                .value="${this.editedItem.amount}"
                currency="$"
                label="${this.getLabel('financial_finding_set.amount', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.amount', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.amount', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
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
  opener!: GenericObject;

  set dialogData(data: any) {
    const {optionsData, editedItem, opener, dialogTitle, titleOptions}: any = data;

    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.opener = opener;
    this.titleOptions = titleOptions;
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
