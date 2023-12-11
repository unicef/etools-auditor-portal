import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import DateMixin from '../../../../mixins/date-mixin';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitEelement
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin DateMixin
 */
@customElement('summary-findings-dialog')
export class SummaryFindingsDialog extends CommonMethodsMixin(
  TableElementsMixin(DateMixin(ModelChangedMixin(LitElement)))
) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        size="md"
        no-padding
        id="summary-findings"
        dialog-title="${this.dialogTitle}"
        keep-dialog-open
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
        <div class="container">
          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Category of Observation -->
              <etools-dropdown
                class="w100 validate-input"
                label="${this.getLabel('findings.category_of_observation', this.optionsData)}"
                placeholder="${this.getPlaceholderText('findings.category_of_observation', this.optionsData)}"
                .options="${this.categoryOfObservation}"
                option-label="display_name"
                option-value="value"
                .selected="${this.editedItem?.category_of_observation}"
                trigger-value-change-event
                ?required="${this._setRequired('findings.category_of_observation', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                ?invalid="${this.errors?.category_of_observation}"
                .errorMessage="${this.errors?.category_of_observation}"
                @focus="${this._resetFieldError}"
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  this.selectedItemChanged(detail, 'category_of_observation', 'value', 'editedItem')}"
                hide-search
              >
              </etools-dropdown>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Recommendation -->
              <etools-textarea
                class="${this._setRequired('findings.recommendation', this.optionsData)} validate-input w100"
                .value="${this.editedItem?.recommendation}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('findings.recommendation', this.optionsData)}"
                always-float-label
                placeholder="${this.getPlaceholderText('findings.recommendation', this.optionsData)}"
                ?required="${this._setRequired('findings.recommendation', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors?.recommendation}"
                .errorMessage="${this.errors?.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.valueChanged(detail, 'recommendation', this.editedItem)}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Agreed Action by IP -->
              <etools-textarea
                class="${this._setRequired('findings.agreed_action_by_ip', this.optionsData)}
                               validate-input w100"
                .value="${this.editedItem?.agreed_action_by_ip}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('findings.agreed_action_by_ip', this.optionsData)}"
                always-float-label
                placeholder="${this.getPlaceholderText('findings.agreed_action_by_ip', this.optionsData)}"
                ?required="${this._setRequired('findings.agreed_action_by_ip', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors?.agreed_action_by_ip}"
                .errorMessage="${this.errors?.agreed_action_by_ip}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.valueChanged(detail, 'agreed_action_by_ip', this.editedItem)}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-6">
              <!-- Deadline of Action -->
              <datepicker-lite
                id="deadlineActionSelector"
                selected-date-display-format="D MMM YYYY"
                placeholder="${this.getPlaceholderText('findings.deadline_of_action', this.optionsData)}"
                label="${this.getLabel('findings.deadline_of_action', this.optionsData)}"
                .value="${this.editedItem?.deadline_of_action}"
                .errorMessage="${this.errors?.deadline_of_action}"
                ?required="${this._setRequired('findings.deadline_of_action', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                fire-date-has-changed
                property-name="deadline_of_action"
                @date-has-changed="${this.deadlineDateHasChanged}"
              >
              </datepicker-lite>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  categoryOfObservation: any[] = [];

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {optionsData, editedItem, opener, dialogTitle, confirmBtnText, categoryOfObservation}: any = data;

    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.opener = opener;
    this.confirmBtnText = confirmBtnText;
    this.categoryOfObservation = categoryOfObservation;
  }

  onSave() {
    if (!this.validate()) {
      return;
    }
    this.opener._addItemFromDialog();
  }

  deadlineDateHasChanged(e: CustomEvent) {
    this.editedItem.deadline_of_action = e.detail.date;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
