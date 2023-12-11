import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {KeyInternalControlsTabStyles} from './key-internal-controls-tab-styles';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import './subject-area-element';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../types/global';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import isObject from 'lodash-es/isObject';
import isEqual from 'lodash-es/isEqual';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('key-internal-controls-dialog')
export class KeyInternalControlsDialog extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit, KeyInternalControlsTabStyles];
  }

  render() {
    return html`
      ${sharedStyles}
  <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        dialog-title="Edit Subject Area - ${this.editedArea?.blueprints[0]?.header}"
        ok-btn-text="Save"
        ?show-spinner="${this.requestInProcess}"
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this.onSave}"
        @close="${this._onClose}"
      >
      <div class="container">
         <div class="layout-horizontal">
            <div class="col col-6">
                <!-- Risk Assessment -->
                <etools-dropdown
                  id="riskAssessmentInput"
                  class="validate-input required"
                  .selected="${this.editedArea?.blueprints[0]?.risk?.value?.value}"
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  .options="${this.riskOptions}"
                  option-label="display_name"
                  option-value="value"
                  required
                  ?disabled="${this.requestInProcess}"
                  ?invalid="${this.errors?.children[0]?.blueprints[0]?.risk?.value}"
                  .errorMessage="${this.errors?.children[0]?.blueprints[0]?.risk?.value}"
                  @focus="${this._resetFieldError}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) => {
                    if (this.editedArea?.blueprints[0]) {
                      if (!isObject(this.editedArea.blueprints[0].risk.value)) {
                        this.editedArea.blueprints[0].risk.value = {};
                      }
                      this.editedArea.blueprints[0].risk.value.value = detail.selectedItem?.value;
                    }
                  }}"
                  hide-search
                >
                </etools-dropdown>
              </div>
            </div>

            <div class="layout-horizontal">
              <div class="col col-12">
                <!-- Brief Justification -->
                <etools-textarea
                  id="briefJustification"
                  class="validate-input required w100"
                  .value="${this.editedArea?.blueprints[0]?.risk?.extra?.comments}"
                  label="Brief Justification for Rating (main internal control gaps)"
                  placeholder="Enter Brief Justification"
                  required
                  ?disabled="${this.requestInProcess}"
                  max-rows="4"
                  .errorMessage="${this.errors?.children[0]?.blueprints[0].risk?.extra}"
                  ?invalid="${this.errors?.children[0]?.blueprints[0]?.risk?.extra}"
                  @focus="${this._resetFieldError}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (this.editedArea?.blueprints[0]) {
                      if (!isObject(this.editedArea.blueprints[0].risk.extra)) {
                        this.editedArea.blueprints[0].risk.extra = {};
                      }
                      this.editedArea.blueprints[0].risk.extra.comments = detail.value;
                    }
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

  @property({type: Object})
  editedArea!: GenericObject;

  @property({type: Object})
  originalEditedObj!: GenericObject;

  @property({type: Array})
  riskOptions!: any[];

  @property({type: Object})
  opener!: GenericObject;

  set dialogData(data: any) {
    const {optionsData, editedArea, opener, riskOptions}: any = data;

    this.opener = opener;
    this.optionsData = optionsData;
    this.editedArea = editedArea;
    this.originalEditedObj = cloneDeep(this.editedArea);
    this.riskOptions = riskOptions;
  }

  onSave() {
    if (!this.validateEditFields()) {
      return;
    }
    if (isEqual(this.originalEditedObj, this.editedArea)) {
      this._onClose();
      return;
    }

    this.opener._saveEditedArea();
  }

  validateEditFields() {
    const valueValid = (this.shadowRoot!.querySelector('#riskAssessmentInput') as EtoolsDropdownEl).validate();
    const extraValid = (this.shadowRoot!.querySelector('#briefJustification') as EtoolsDropdownEl).validate();

    const errors = {
      children: [
        {
          blueprints: [
            {
              risk: {
                value: !valueValid ? 'Please, select Risk Assessment' : false,
                extra: !extraValid ? 'Please, enter Brief Justification' : false
              }
            }
          ]
        }
      ]
    };
    this.errors = errors;

    return valueValid && extraValid;
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
