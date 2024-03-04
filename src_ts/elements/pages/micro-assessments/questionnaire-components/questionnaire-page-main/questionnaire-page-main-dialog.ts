import {LitElement, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {EtoolsTextarea} from '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {GenericObject} from '../../../../../types/global';
import '../risk-tab/risk-tab';
import '../../../../common-elements/insert-html/insert-html';
import {AnyObject} from '@unicef-polymer/etools-types';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

/**
 * @LitEelement
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 */
@customElement('questionnaire-page-main-dialog')
export class QuestionnairePageMainDialog extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        dialog-title="Edit Question"
        ok-btn-text="Save"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
        <div class="container">
          <div class="layout-horizontal">
            <div class="form-title">
              <div class="text" id="questionHeader">
                ${unsafeHTML(this.editedItem?.header)}
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-12 input-container col-md-6 col-lg-4">
                <!-- Risk Assessment -->
                <etools-dropdown
                  id="riskAssessmentDropdown"
                  required validate-input"
                  .selected="${this.editedItem?.risk?.value}"
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  .options="${this.riskOptions}"
                  option-label="display_name"
                  option-value="value"
                  ?disabled="${this.requestInProcess}"
                  error-message="This field is required"
                  @focus="${this._resetFieldError}"
                  required
                  trigger-value-change-event
                  @etools-selected-item-changed="${this._setSelectedRiskRatingEntity}"
                  hide-search
                >
                </etools-dropdown>
              </div>
            <div class="col-12 input-container">
                <!-- Comments -->
                <etools-textarea
                  id="riskAssessmentComments"
                  class="w100 validate-input"
                  .value="${this.editedItem?.risk?.extra?.comments}"
                  label="Comments"
                  placeholder="Enter Comments"
                  ?disabled="${this.requestInProcess}"
                  max-rows="4"
                  error-message="This field is required"
                  @focus="${this._resetFieldError}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (!this.editedItem) {
                      return;
                    }
                    if (!this.editedItem.risk) {
                      this.editedItem.risk = {};
                    }
                    if (!this.editedItem.risk.extra) {
                      this.editedItem.risk = {extra: {comments: ''}};
                    }
                    this.editedItem.risk.extra.comments = detail.value;
                  }}"
                >
                </etools-textarea>
              </div>
            </div>

          </div>
        </div>
       </div>
      </etools-dialog>
    `;
  }

  @query('#riskAssessmentDropdown')
  riskAssessmentDropdown!: EtoolsDropdownEl;

  @property({type: Object})
  editedItem!: AnyObject;

  @property({type: Array})
  riskOptions!: GenericObject[];

  @property({type: Object})
  dataFromDialog!: GenericObject | undefined;

  @property({type: Object})
  opener!: GenericObject | undefined;

  private tabId!: string;
  private categoryId!: string;
  private originalComments!: string;
  private originalRiskValue!: string;

  set dialogData(data: any) {
    const {
      opener,
      editedItem,
      riskOptions,
      tabId,
      categoryId,
      originalComments,
      originalRiskValue,
      dataFromDialog
    }: any = data;
    this.opener = opener;
    this.dataFromDialog = dataFromDialog;
    this.editedItem = editedItem;
    this.riskOptions = riskOptions;
    this.tabId = tabId;
    this.categoryId = categoryId;
    this.originalComments = originalComments;
    this.originalRiskValue = originalRiskValue;
  }

  _setSelectedRiskRatingEntity(event) {
    const selectedItem = event.detail.selectedItem;
    if (!selectedItem) {
      return;
    }
    if (!this.editedItem.risk) {
      this.editedItem.risk = {};
    }
    this.editedItem.risk.value = selectedItem.value;
    this.editedItem.risk.display_name = selectedItem.display_name;
  }

  onSave() {
    if (!this.validate()) {
      return;
    }

    if (
      this.originalComments === this.editedItem.risk.extra.comments &&
      this.riskAssessmentDropdown.selected &&
      this.originalRiskValue === this.editedItem.risk.value
    ) {
      this._onClose();
      return;
    }
    this.requestInProcess = true;
    this.opener!.triggerSaveFromDialog(this.getDataFromDialog());
  }

  getDataFromDialog() {
    const blueprintRisk = {
      value: this.editedItem.risk?.value,
      extra: (this.editedItem.risk && this.editedItem.risk.extra) || {}
    };
    const data = {
      id: this.editedItem.id,
      risk: blueprintRisk
    };

    let risk;
    if (this.categoryId) {
      const child = {
        id: +this.categoryId,
        blueprints: [data]
      };
      risk = {
        id: +this.tabId,
        children: [child]
      };
    } else {
      risk = {
        id: +this.tabId,
        blueprints: [data]
      };
    }

    if (risk) {
      return {
        children: [risk]
      };
    }
  }

  validate() {
    const riskValid = this.riskAssessmentDropdown.validate();
    const commentsValid = (this.shadowRoot!.querySelector('#riskAssessmentComments') as EtoolsTextarea).validate();

    return riskValid && commentsValid;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
