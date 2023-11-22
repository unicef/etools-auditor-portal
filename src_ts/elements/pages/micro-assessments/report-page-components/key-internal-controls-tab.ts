import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {KeyInternalControlsTabStyles} from './key-internal-controls-tab-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import './subject-area-element';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getOptionsChoices, isRequired} from '../../../mixins/permission-controller';
import isEqual from 'lodash-es/isEqual';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import cloneDeep from 'lodash-es/cloneDeep';
import pick from 'lodash-es/pick';
import {GenericObject} from '../../../../types/global';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import isObject from 'lodash-es/isObject';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('key-internal-controls-tab')
export class KeyInternalControlsTab extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit, KeyInternalControlsTabStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        etools-dropdown#riskAssessmentInput {
          --paper-listbox: {
            max-height: 140px;
          }
        }
        .input-container {
          padding-top: 2px;
        }
        .editable-row:hover .hover-block {
          background-color: transparent;
        }
      </style>
      <etools-content-panel .panelTitle="${this.subjectAreas.header}" list>

         <etools-data-table-header no-title>
            <etools-data-table-column class="col-8">Subject area</etools-data-table-column>
            <etools-data-table-column class="col-4">Risk Assessment</etools-data-table-column>
          </etools-data-table-header>

            ${(this.subjectAreas?.children || []).map(
              (item, index) => html`
                <subject-area-element
                  class="area-element"
                  .optionsData="${this.optionsData}"
                  .area="${item}"
                  .index="${index}"
                  .canBeChanged="${this.canBeChanged}"
                >
                </subject-area-element>
              `
            )}
            <etools-data-table-row no-collapse ?hidden="${this.subjectAreas?.children?.length}">
              <div slot="row-data" class="layout-horizontal editable-row pl-30">
                <span class="col-data col-8">–</span>
                <span class="col-data col-4">–</span>
              </div>
            </etools-data-table-row>

      </etools-content-panel>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        .dialogTitle="Edit Subject Area - ${this.editedArea?.blueprints[0]?.header}"
        ok-btn-text="Save"
        ?show-spinner="${this.requestInProcess}"
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._saveEditedArea}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
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
                <paper-textarea
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
                </paper-textarea>
              </div>
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
      size: 70,
      label: 'Subject area',
      path: 'header'
    },
    {
      size: 30,
      label: 'Risk Assessment',
      path: 'risk.value.display_name'
    }
  ];

  @property({type: Array})
  details = [
    {
      label: 'Brief Justification for Rating (main internal control gaps)',
      path: 'risk.extra.comments',
      size: 100
    }
  ];

  @property({type: Array})
  riskOptions!: any[];

  @property({type: Boolean})
  dialogOpened!: boolean;

  @property({type: String})
  errorBaseText = 'Test Subject Areas: ';

  @property({type: Boolean})
  requestInProcess!: boolean;

  @property({type: Boolean})
  saveWithButton!: boolean;

  @property({type: Object})
  editedArea!: GenericObject | null;

  @property({type: Object})
  subjectAreas!: GenericObject;

  @property({type: Object})
  originalSubjectAreas!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Number})
  editedAreaIndex!: number;

  @property({type: Object})
  originalEditedObj!: GenericObject | null;

  @property({type: Boolean})
  canBeChanged = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('open-edit-dialog', this.openEditDialog);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('subjectAreas')) {
      this._dataChanged();
      this.dataChanged();
    }
    if (changedProperties.has('errorObject')) {
      this._complexErrorHandler(this.errorObject.test_subject_areas);
    }
    if (changedProperties.has('optionsData')) {
      const riskOptions = getOptionsChoices(this.optionsData, 'test_subject_areas.blueprints.risk.value') || [];
      this.riskOptions = riskOptions;
      this.canBeChanged = !this.isReadOnly('test_subject_areas', this.optionsData);
    }
  }

  dataChanged() {
    this.originalSubjectAreas = cloneDeep(this.subjectAreas);
  }

  getRiskData() {
    if (this.dialogOpened && !this.saveWithButton) {
      return this.getCurrentData();
    }
    const elements = this.shadowRoot!.querySelectorAll('.area-element');
    const riskData: any[] = [];

    Array.prototype.forEach.call(elements, (element) => {
      const data = element.getRiskData();
      if (data) {
        riskData.push(data);
      }
    });

    return riskData.length ? riskData : null;
  }

  getCurrentData() {
    if (!this.dialogOpened) {
      return null;
    }
    const blueprint = pick(this.editedArea?.blueprints[0], ['id', 'risk']);
    blueprint.risk = {
      value: blueprint.risk.value.value,
      extra: {comments: (blueprint.risk.extra && blueprint.risk.extra.comments) || ''}
    };

    return [
      {
        id: this.editedArea?.id,
        blueprints: [blueprint]
      }
    ];
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

  validate(forSave) {
    if (!this.optionsData || forSave) {
      return true;
    }
    const required = isRequired('test_subject_areas', this.optionsData);
    if (!required) {
      return true;
    }

    const elements = this.shadowRoot!.querySelectorAll('.area-element');
    let valid = true;

    Array.prototype.forEach.call(elements, (element) => {
      if (!element.validate()) {
        valid = false;
      }
    });

    return valid;
  }

  openEditDialog(event) {
    const index = event.detail;
    const data = this.subjectAreas.children[index];
    this.editedArea = cloneDeep(data);

    if (this.editedArea!.blueprints[0] && !this.editedArea!.blueprints[0].risk.value) {
      this.editedArea!.blueprints[0].risk.value = {value: -1, display_name: ''};
    }

    this.originalEditedObj = cloneDeep(this.editedArea);
    this.editedAreaIndex = index;
    this.dialogOpened = true;
  }

  _saveEditedArea() {
    if (!this.validateEditFields()) {
      return;
    }

    if (isEqual(this.originalEditedObj, this.editedArea)) {
      this.dialogOpened = false;
      this.resetDialog(this.dialogOpened);
      return;
    }

    if (this.dialogOpened && !this.saveWithButton) {
      this.requestInProcess = true;
      fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
      return;
    }

    const data = cloneDeep(this.editedArea);
    data!.changed = true;
    this.subjectAreas.children.splice(this.editedAreaIndex, 1, data);
    this.dialogOpened = false;
  }

  resetDialog(opened) {
    if (opened) {
      return;
    }
    this.editedArea = null;
    this.originalEditedObj = null;
    const elements = this.shadowRoot!.querySelectorAll('.validate-input');

    Array.prototype.forEach.call(elements, (element) => {
      element.invalid = false;
      element.value = '';
    });
  }
}
