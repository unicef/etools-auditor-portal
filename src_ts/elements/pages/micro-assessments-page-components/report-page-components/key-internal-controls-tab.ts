import {PolymerElement, html} from '@polymer/polymer';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {KeyInternalControlsTabStyles} from './key-internal-controls-tab-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../../common-elements/list-tab-elements/list-header/list-header';
//import 'subject-area-element'
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-textarea';


class KeyInternalControlsTab extends PolymerElement {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      ${KeyInternalControlsTabStyles}
      <etools-content-panel panel-title="[[subjectAreas.header]]">
        <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

        <template is="dom-repeat" items="[[subjectAreas.children]]">
          <subject-area-element class="area-element" base-permission-path="{{basePermissionPath}}" area="{{item}}"
            details="[[details]]" edit-mode="[[_canBeChanged(basePermissionPath)]]" headings="[[columns]]">
          </subject-area-element>
        </template>
      </etools-content-panel>

      <etools-dialog no-padding keep-dialog-open size="md" opened="{{dialogOpened}}"
        dialog-title="Edit Subject Area - {{editedArea.blueprints.0.header}}" ok-btn-text="Save"
        show-spinner="{{requestInProcess}}" disable-confirm-btn="{{requestInProcess}}"
        on-confirm-btn-clicked="_saveEditedArea">
        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container input-container-ms">
                <!-- Risk Assessment -->
                <etools-dropdown id="riskAssessmentInput"
                  class="disabled-as-readonly validate-input required"
                  selected="{{editedArea.blueprints.0.risk.value}}"
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  options="[[riskOptions]]"
                  option-label="display_name"
                  option-value="display_name"
                  required disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  invalid="{{errors.children.0.blueprints.0.risk.value}}"
                  error-message="{{errors.children.0.blueprints.0.risk.value}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                  hide-search>
                </etools-dropdown>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Brief Justification -->
                <paper-textarea id="briefJustification"
                  class="disabled-as-readonly validate-input required"
                  value="{{editedArea.blueprints.0.risk.extra.comments}}"
                  label="Brief Justification for Rating (main internal control gaps)"
                  placeholder="Enter Brief Justification"
                  required disabled="{{requestInProcess}}" readonly$="{{requestInProcess}}"
                  max-rows="4"
                  error-message="{{errors.children.0.blueprints.0.risk.extra}}"
                  invalid="{{errors.children.0.blueprints.0.risk.extra}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError">
                </paper-textarea>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

 // TODO - add js

}
window.customElements.define('key-internal-controls-tab', KeyInternalControlsTab);
