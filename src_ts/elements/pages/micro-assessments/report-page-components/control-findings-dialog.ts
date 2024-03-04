import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('control-findings-tab-dialog')
export class ControlFindingsTabDialog extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
  static get styles() {
    return [moduleStyles, layoutStyles];
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
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
        <div class="container">
          <div class="row">
            <div class="col-12">
              <!-- Finding -->
              <etools-input
                class="w100 validate-input ${this._setRequired('findings.finding', this.optionsData)}"
                .value="${this.editedItem.finding}"
                label="${this.getLabel('findings.finding', this.optionsData)}"
                placeholder="${this.getPlaceholderText('findings.finding', this.optionsData)}"
                ?required="${this._setRequired('findings.finding', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                maxlength="400"
                ?invalid="${this.errors[0]?.finding}"
                .errorMessage="${this.errors[0]?.finding}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => (this.editedItem.finding = detail.value)}"
              >
              </etools-input>
            </div>
            <div class="col-12">
              <!-- Recommendation -->
              <etools-textarea
                class="w100 validate-input ${this._setRequired('findings.recommendation', this.optionsData)}"
                .value="${this.editedItem.recommendation}"
                allowed-pattern="[ds]"
                label="${this.getLabel('findings.recommendation', this.optionsData)}"
                placeholder="${this.getPlaceholderText('findings.recommendation', this.optionsData)}"
                ?required="${this._setRequired('findings.recommendation', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors[0]?.recommendation}"
                .errorMessage="${this.errors[0]?.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => (this.editedItem.recommendation = detail.value)}"
              >
              </etools-textarea>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  dialogTitle!: string;

  @property({type: String})
  confirmBtnText!: string;

  @property({type: Object})
  editedItem!: GenericObject;

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {opener, optionsData, editedItem, dialogTitle, confirmBtnText}: any = data;

    this.opener = opener;
    this.optionsData = optionsData;
    this.editedItem = editedItem;
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
