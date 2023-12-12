import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../../types/global';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('other-recommendations-dialog')
export class OtherRecommendationsDialog extends TableElementsMixin(CommonMethodsMixin(LitElement)) {
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
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
        <div class="layout-horizontal">
          <div class="col col-12">
            <!-- Description -->
            <etools-textarea
              class="${this._setRequired(
                'other_recommendations.description',
                this.optionsData
              )} fixed-width validate-input w100"
              .value="${this.editedItem.description}"
              allowed-pattern="[\\d\\s]"
              label="${this.getLabel('other_recommendations.description', this.optionsData)}"
              placeholder="${this.getPlaceholderText('other_recommendations.description', this.optionsData)}"
              ?required="${this._setRequired('other_recommendations.description', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              max-rows="4"
              ?invalid="${this._checkInvalid(this.errors[0]?.description)}"
              .errorMessage="${this.errors[0]?.description}"
              @value-changed="${({detail}: CustomEvent) =>
                (this.editedItem = {...this.editedItem, description: detail.value})}"
            >
              @focus="${this._resetFieldError}" >
            </etools-textarea>
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
    this.dialogTitle = dialogTitle;
    this.opener = opener;
    this.confirmBtnText = confirmBtnText;
  }

  onSave() {
    if (!this.validate()) {
      return;
    }
    this.requestInProcess = true;
    this.opener.editedItem = cloneDeep(this.editedItem);
    this.opener._addItemFromDialog();
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _checkInvalid(value) {
    return !!value;
  }
}
