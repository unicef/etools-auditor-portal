import {PolymerElement, html} from '@polymer/polymer';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {KeyInternalControlsTabStyles} from './key-internal-controls-tab-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../../common-elements/list-tab-elements/list-header/list-header';
import './subject-area-element';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators';
import isEqual from 'lodash-es/isEqual';
import {fireEvent} from '../../../utils/fire-custom-event';
import cloneDeep from 'lodash-es/cloneDeep';
import pick from 'lodash-es/pick';
import {GenericObject} from '../../../../types/global';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';


class KeyInternalControlsTab extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      ${KeyInternalControlsTabStyles}
      <etools-content-panel panel-title="[[subjectAreas.header]]" list>
        <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

        <template is="dom-repeat" items="[[subjectAreas.children]]">
          <subject-area-element class="area-element"
            base-permission-path="{{basePermissionPath}}"
            area="{{item}}"
            details="[[details]]"
            edit-mode="[[_canBeChanged(basePermissionPath)]]"
            headings="[[columns]]">
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
                  selected="{{editedArea.blueprints.0.risk.value.value}}"
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  options="[[riskOptions]]"
                  option-label="display_name"
                  option-value="value"
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

  @property({type: Array})
  columns = [
    {
      'size': 70,
      'label': 'Subject area',
      'path': 'header'
    }, {
      'size': 30,
      'label': 'Risk Assessment',
      'path': 'risk.value.display_name'
    }
  ];

  @property({type: Array})
  details = [{
    'label': 'Brief Justification for Rating (main internal control gaps)',
    'path': 'risk.extra.comments',
    'size': 100
  }];

  @property({type: Boolean, notify: true})
  dialogOpened!: boolean;

  @property({type: String})
  errorBaseText: string = 'Test Subject Areas: ';

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Boolean})
  requestInProcess!: boolean;

  @property({type: Boolean})
  saveWithButton!: boolean;

  @property({type: Object})
  editedArea!: GenericObject;

  @property({type: Object})
  subjectAreas!: GenericObject;

  @property({type: Number})
  editedAreaIndex!: number;

  @property({type: Object})
  originalEditedObj!: GenericObject;

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'updateStyles(requestInProcess)',
      '_dataChanged(subjectAreas)',
      '_complexErrorHandler(errorObject.test_subject_areas)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    let riskOptions = this.getChoices(`${this.basePermissionPath}.test_subject_areas.blueprints.risk.value`) || [];
    this.set('riskOptions', riskOptions);
    this.addEventListener('open-edit-dialog', this.openEditDialog);
  }

  _canBeChanged(basePermissionPath) {
    return !this.isReadOnly('test_subject_areas', basePermissionPath);
  }

  getRiskData() {
    if (this.dialogOpened && !this.saveWithButton) {return this.getCurrentData();}
    let elements = this.shadowRoot!.querySelectorAll('.area-element'),
      riskData = [];

    Array.prototype.forEach.call(elements, element => {
      let data = element.getRiskData();
      if (data) {riskData.push(data);}
    });

    return riskData.length ? riskData : null;
  }

  getCurrentData() {
    if (!this.dialogOpened) {return null;}
    let blueprint = pick(this.editedArea.blueprints[0], ['id', 'risk']);
    blueprint.risk = {
      value: blueprint.risk.value.value,
      extra: {comments: (blueprint.risk.extra && blueprint.risk.extra.comments) || ''}
    };

    return [{
      id: this.editedArea.id,
      blueprints: [blueprint]
    }];
  }

  validateEditFields() {
    let valueValid = (this.$.riskAssessmentInput as EtoolsDropdownEl).validate(),
      extraValid = (this.$.briefJustification as EtoolsDropdownEl).validate();

    let errors = {
      children: [{
        blueprints: [{
          risk: {
            value: !valueValid ? 'Please, select Risk Assessment' : false,
            extra: !extraValid ? 'Please, enter Brief Justification' : false
          }

        }]
      }]
    };
    this.set('errors', errors);

    return valueValid && extraValid;
  }

  validate(forSave) {
    if (!this.basePermissionPath || forSave) {return true;}
    let required = this.isRequired(`${this.basePermissionPath}.test_subject_areas`);
    if (!required) {return true;}

    let elements = this.shadowRoot!.querySelectorAll('.area-element'),
      valid = true;

    Array.prototype.forEach.call(elements, element => {
      if (!element.validate()) {valid = false;}
    });

    return valid;
  }

  openEditDialog(event) {
    let index = this.subjectAreas.children.indexOf(event && event.detail && event.detail.data);
    if ((!index && index !== 0) || !~index) {
      throw 'Can not find data';
    }
    let data = this.subjectAreas.children[index];
    this.editedArea = cloneDeep(data);

    if (this.editedArea.blueprints[0] && !this.editedArea.blueprints[0].risk.value) {
      this.editedArea.blueprints[0].risk.value = {value: -1, display_name: ''};
    }

    this.originalEditedObj = cloneDeep(this.editedArea);
    this.editedAreaIndex = index;
    this.dialogOpened = true;
  }

  _saveEditedArea() {
    if (!this.validateEditFields()) {return;}

    if (isEqual(this.originalEditedObj, this.editedArea)) {
      this.dialogOpened = false;
      this.resetDialog();
      return;
    }

    if (this.dialogOpened && !this.saveWithButton) {
      this.requestInProcess = true;
      fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
      return;
    }

    let data = cloneDeep(this.editedArea);
    data.changed = true;
    this.splice('subjectAreas.children', this.editedAreaIndex, 1, data);
    this.dialogOpened = false;
  }

  resetDialog(opened) {
    if (opened) {return;}
    let elements = this.shadowRoot!.querySelectorAll('.validate-input');

    Array.prototype.forEach.call(elements, element => {
      element.invalid = false;
      element.value = '';
    });

  }


}
window.customElements.define('key-internal-controls-tab', KeyInternalControlsTab);
