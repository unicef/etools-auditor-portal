import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 */
@customElement('key-internal-controls-weaknesses-dialog')
export class KeyInternalControlsWeaknessesDialog extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        dialog-title="${this.dialogTexts.dialogTitle || ''}"
        .okBtnText="${this.dialogTexts.confirmBtn}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._saveEditedArea}"
        @close="${this._onClose}"
      >
      <div class="container">
        <div class="layout-horizontal">
          <div class="col col-12">
            <!-- Risk Assessment -->
            <etools-dropdown
              id="riskRatingInput"
              class="${this._setRequired(
                'key_internal_weakness.blueprints.risks.value',
                this.optionsData
              )} validate-input"
              .selected="${this.editedBlueprint?.risks[0]?.value}"
              label="Risk rating"
              placeholder="Select Risk rating"
              .options="${this.riskOptions}"
              option-label="display_name"
              option-value="value"
              ?required="${this._setRequired('key_internal_weakness.blueprints.risks.value', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              ?invalid="${this.errors?.blueprints[0]?.risks.value}"
              .errorMessage="${this.errors?.blueprints[0]?.risks.value}"
              @focus="${this._resetFieldError}"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (detail.selectedItem) {
                  this.editedBlueprint.risks[0].value = detail.selectedItem.value;
                  this.editedBlueprint = {...this.editedBlueprint};
                }
              }}"
              hide-search
            >
            </etools-dropdown>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <etools-textarea
              class="${this._setRequired(
                'key_internal_weakness.blueprints.risks.extra',
                this.optionsData
              )} validate-input w100"
              .value="${this.editedBlueprint?.risks[0]?.extra.key_control_observation}"
              label="Key control observation"
              placeholder="Enter Observation"
              ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              max-rows="4"
              ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
              .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
              @value-changed="${({detail}: CustomEvent) => {
                this.editedBlueprint.risks[0].extra.key_control_observation = detail.value;
                this.editedBlueprint = {...this.editedBlueprint};
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-textarea>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <etools-textarea
              class="${this._setRequired(
                'key_internal_weakness.blueprints.risks.extra',
                this.optionsData
              )} validate-input w100"
              .value="${this.editedBlueprint?.risks[0]?.extra.recommendation}"
              label="Recommendation"
              placeholder="Enter Recommendation"
              ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              max-rows="4"
              ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
              .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
              @focus="${this._resetFieldError}"
              @value-changed="${({detail}: CustomEvent) => {
                this.editedBlueprint.risks[0].extra.recommendation = detail.value;
                this.editedBlueprint = {...this.editedBlueprint};
              }}"
            >
            </etools-textarea>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <etools-textarea
              class="${this._setRequired(
                'key_internal_weakness.blueprints.risks.extra',
                this.optionsData
              )} validate-input w100"
              .value="${this.editedBlueprint?.risks[0]?.extra.ip_response}"
              label="IP Response"
              placeholder="Enter Response"
              ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              max-rows="4"
              ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
              .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
              @focus="${this._resetFieldError}"
              @value-changed="${({detail}: CustomEvent) => {
                this.editedBlueprint.risks[0].extra.ip_response = detail?.value;
                this.editedBlueprint = {...this.editedBlueprint};
              }}"
            >
            </etools-textarea>
          </div>
        </div>
       </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  editedBlueprint!: GenericObject;

  @property({type: Object})
  dialogTexts!: GenericObject;

  @property({type: Array})
  riskOptions!: GenericObject[];

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {opener, optionsData, editedBlueprint, dialogTexts, riskOptions}: any = data;
    this.opener = opener;
    this.optionsData = optionsData;
    this.editedBlueprint = editedBlueprint;
    this.originalData = cloneDeep(this.editedBlueprint);
    this.riskOptions = riskOptions;
    this.dialogTexts = dialogTexts;
  }

  _saveEditedArea() {
    if (!this.validate()) {
      return;
    }

    if (isEqual(this.originalData, this.editedBlueprint)) {
      this._onClose();
      return;
    }

    this.requestInProcess = true;
    this.opener._triggerSaveEngagement(this.editedBlueprint);
  }

  validate() {
    const elements = this.shadowRoot!.querySelectorAll('.validate-input');
    let valid = true;

    elements.forEach((element: any) => {
      if (element.required && !element.validate()) {
        element.invalid = 'This field is required';
        element.errorMessage = 'This field is required';
        valid = false;
      }
    });
    return valid;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
