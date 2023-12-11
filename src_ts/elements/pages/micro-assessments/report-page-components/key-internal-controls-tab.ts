import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {KeyInternalControlsTabStyles} from './key-internal-controls-tab-styles';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import './subject-area-element';
import './key-internal-controls-dialog';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getOptionsChoices, isRequired} from '../../../mixins/permission-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import cloneDeep from 'lodash-es/cloneDeep';
import pick from 'lodash-es/pick';
import {GenericObject} from '../../../../types/global';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

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
        ${dataTableStylesLit} etools-dropdown#riskAssessmentInput {
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
    `;
  }

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
    this.dialogKey = 'key-internal-controls-dialog';
    this.addEventListener('open-edit-dialog', this.openEditDialog);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('subjectAreas')) {
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
    this.requestInProcess = false;
    this.closeEditDialog();
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
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedArea: this.editedArea,
        riskOptions: this.riskOptions
      }
    }).then(() => {
      this.dialogOpened = false;
    });
  }

  _saveEditedArea() {
    // @dci  if (this.dialogOpened && !this.saveWithButton) {
    this.requestInProcess = true;
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
    return;
    // }
    // @dci ? was ever getting here ???
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
