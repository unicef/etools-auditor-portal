import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('specific-procedure-dialog')
export class SpecificProcedureDialog extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
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
        @close="${this._onClose}"
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
      >
        <div class="container">
          ${this.canAddSP(this.optionsData, this.readonlyTab, this.withoutFindingColumn)
            ? html`<div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Description -->
                  <etools-textarea
                    class="w100 validate-input ${this._setRequired(
                      'specific_procedures.description',
                      this.optionsData
                    )}"
                    .value="${this.editedItem?.description}"
                    allowed-pattern="[ds]"
                    label="${this.getLabel('specific_procedures.description', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('specific_procedures.description', this.optionsData)}"
                    ?required="${this._setRequired('specific_procedures.description', this.optionsData)}"
                    ?readonly="${this.requestInProcess}"
                    max-rows="4"
                    ?invalid="${this._checkInvalid(this.errors[0]?.description)}"
                    .errorMessage="${this.errors[0]?.description}"
                    @value-changed="${({detail}: CustomEvent) => (this.editedItem.description = detail.value)}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-textarea>
                </div>
              </div>`
            : ``}
          ${!this.canAddSP(this.optionsData, this.readonlyTab, this.withoutFindingColumn)
            ? html` <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Finding -->
                  <etools-textarea
                    class="w100 validate-input ${this._setRequired('specific_procedures.finding', this.optionsData)}"
                    .value="${this.editedItem?.finding}"
                    allowed-pattern="[ds]"
                    label="${this.getLabel('specific_procedures.finding', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('specific_procedures.finding', this.optionsData)}"
                    ?required="${this._setRequired('specific_procedures.finding', this.optionsData)}"
                    ?readonly="${this.requestInProcess}"
                    max-rows="4"
                    ?invalid="${this._checkInvalid(this.errors[0]?.finding)}"
                    .errorMessage="${this.errors[0]?.finding}"
                    @value-changed="${({detail}: CustomEvent) => (this.editedItem.finding = detail.value)}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-textarea>
                </div>
              </div>`
            : ``}
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  mainProperty = 'specific_procedures';

  @property({type: Boolean})
  withoutFindingColumn = false;

  @property({type: Boolean})
  readonlyTab = false;

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {withoutFindingColumn, optionsData, editedItem, dialogTitle, confirmBtnText, readonlyTab, opener}: any = data;

    this.withoutFindingColumn = withoutFindingColumn;
    this.optionsData = optionsData;
    this.editedItem = editedItem;
    this.dialogTitle = dialogTitle;
    this.confirmBtnText = confirmBtnText;
    this.readonlyTab = readonlyTab;
    this.opener = opener;
  }

  onSave() {
    if (!this.validate()) {
      return;
    }
    this.requestInProcess = true;
    this.opener._addItemFromDialog();
  }

  canAddSP(permissions: AnyObject, readonlyTab, withoutFindingColumn) {
    return this._canBeChanged(permissions) && !readonlyTab && withoutFindingColumn;
  }

  _checkInvalid(value) {
    return !!value;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
