import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('assessment-of-controls-dialog')
export class AssessmentOfControlsDialog extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
          no-padding
          keep-dialog-open
          size="md"
          dialog-title="${this.dialogTitle}"
          .okBtnText="${this.confirmBtnText}"
          ?show-spinner="${this.requestInProcess}"
          ?disable-confirm-btn="${this.requestInProcess}"
          @confirm-btn-clicked="${this.onSave}"
          @close="${this._onClose}"
        >
          <div class="container">
            <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Recommendation -->
                  <etools-textarea
                    class="w100 ${this._setRequired(
                      'key_internal_controls.recommendation',
                      this.optionsData
                    )} validate-input"
                    .value="${this.editedItem.recommendation}"
                    label="${this.getLabel('key_internal_controls.recommendation', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('key_internal_controls.recommendation', this.optionsData)}"
                    ?required="${this._setRequired('key_internal_controls.recommendation', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.recommendation}"
                    .errorMessage="${this.errors.recommendation}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'recommendation', this.editedItem)}""
                  >
                  </etools-textarea>
                </div>
              </div>

              <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Audit Observation -->
                  <etools-textarea
                    class="w100 ${this._setRequired(
                      'key_internal_controls.audit_observation',
                      this.optionsData
                    )} validate-input"
                    .value="${this.editedItem.audit_observation}"
                    label="${this.getLabel('key_internal_controls.audit_observation', this.optionsData)}"
                    placeholder="${this.getPlaceholderText(
                      'key_internal_controls.audit_observation',
                      this.optionsData
                    )}"
                    ?required="${this._setRequired('key_internal_controls.audit_observation', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.audit_observation}"
                    .errorMessage="${this.errors.audit_observation}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'audit_observation', this.editedItem)}""
                  >
                  </etools-textarea>
                </div>
              </div>

               <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- IP Response -->
                  <etools-textarea
                    class="w100 ${this._setRequired('key_internal_controls.ip_response', this.optionsData)}
                                          validate-input"
                    .value="${this.editedItem.ip_response}"
                    label="${this.getLabel('key_internal_controls.ip_response', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('key_internal_controls.ip_response', this.optionsData)}"
                    ?required="${this._setRequired('key_internal_controls.ip_response', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.ip_response}"
                    .errorMessage="${this.errors.ip_response}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'ip_response', this.editedItem)}""
                  >
                  </etools-textarea>
                </div>
              </div>
            </div>
        </etools-dialog>
        `;
  }

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {optionsData, editedItem, opener, dialogTitle, confirmBtnText}: any = data;

    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.opener = opener;
    this.dialogTitle = dialogTitle;
    this.confirmBtnText = confirmBtnText;
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
