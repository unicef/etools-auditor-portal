import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';

import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import '../kicw-risk/kicw-risk';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 */
@customElement('key-internal-controls-weaknesses')
export class KeyInternalControlsWeaknesses extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          position: relative;
          display: block;
          margin: 20px 0;
        }
        * {
          box-sizing: border-box;
        }
        .row-h.repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }
        .repeatable-item-container .repeatable-item-content {
          margin-left: 25px;
        }
        .form-title {
          position: relative;
          width: 100%;
          line-height: 40px;
          color: var(--primary-color);
          font-weight: 600;
          box-sizing: border-box;
          margin: 10px 0 0 !important;
          padding: 0 !important;
        }
        .form-title .text {
          background-color: var(--gray-06);
          border-radius: 3px;
          margin: 0 24px;
          padding: 0 24px;
        }
        .line {
          width: calc(100% - 48px);
          margin-left: 24px;
          box-sizing: border-box;
          margin-bottom: 0 !important;
          border-bottom: 1px solid var(--gray-border);
        }
        .collapse-container {
          border-top: solid 1px #bebebe;
          background-color: #eee;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('key_internal_weakness', this.optionsData)}"
        list
      >
        <div class="header-content">
          <div class="static-text">
            We have reviewed the implementation of applicable key internal controls and noted the following weaknesses:
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-9">Subject area</etools-data-table-column>
          <etools-data-table-column class="col-3">Risks Count</etools-data-table-column>
        </etools-data-table-header>

        ${(this.subjectAreas?.blueprints || []).map(
          (item, index) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-9">${item.header}</span>
                <span class="col-data col-3">${item.risks.length}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button name="add-box" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <kicw-risk
                .risksData="${item.risks}"
                .blueprintId="${item.id}"
                ?isEditable="${this._canBeChanged(this.optionsData)}"
              ></kicw-risk>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.subjectAreas?.blueprints?.length}">
          <div slot="row-data" class="layout-horizontal editable-row pl-30">
            <span class="col-data col-9">–</span>
            <span class="col-data col-3">–</span>
          </div>
        </etools-data-table-row>

        <etools-dialog
          theme="confirmation"
          size="md"
          keep-dialog-open
          ?opened="${this.confirmDialogOpened}"
          @confirm-btn-clicked="${this._deleteArea}"
          ?disable-confirm-btn="${this.requestInProcess}"
          ok-btn-text="Delete"
          openFlag="confirmDialogOpened"
          @close="${this._resetDialogOpenedFlag}"
        >
          ${this.dialogTexts?.dialogTitle}
        </etools-dialog>

        <etools-dialog
          no-padding
          keep-dialog-open
          size="md"
          ?opened="${this.dialogOpened}"
          dialog-title="${this.dialogTexts.dialogTitle || ''}"
          .okBtnText="${this.dialogTexts.confirmBtn}"
          ?show-spinner="${this.requestInProcess}"
          ?disable-confirm-btn="${this.requestInProcess}"
          @confirm-btn-clicked="${this._saveEditedArea}"
          openFlag="dialogOpened"
          @close="${this._resetDialogOpenedFlag}"
        >
          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Risk Assessment -->
              <etools-dropdown
                id="riskRatingInput"
                class="${this._setRequired(
                  'key_internal_weakness.blueprints.risks.value',
                  this.optionsData
                )} validate-input"
                .selected="${this.editedBlueprint?.risks[0]?.value}"
                label="Risk rating"
                placeholder="Select Risk rating"
                .options="${this.riskOptions}"
                option-label="display_name"
                option-value="value"
                ?required="${this._setRequired('key_internal_weakness.blueprints.risks.value', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                ?invalid="${this.errors?.blueprints[0]?.risks.value}"
                .errorMessage="${this.errors?.blueprints[0]?.risks.value}"
                @focus="${this._resetFieldError}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) => {
                  this.editedBlueprint.risks[0].value = detail.selectedItem?.value;
                  this.editedBlueprint = {...this.editedBlueprint};
                }}"
                hide-search
              >
              </etools-dropdown>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <etools-textarea
                class="${this._setRequired(
                  'key_internal_weakness.blueprints.risks.extra',
                  this.optionsData
                )} validate-input w100"
                .value="${this.editedBlueprint?.risks[0]?.extra.key_control_observation}"
                label="Key control observation"
                placeholder="Enter Observation"
                ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
                .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.editedBlueprint.risks[0].extra.key_control_observation = detail.value;
                  this.editedBlueprint = {...this.editedBlueprint};
                }}"
                @focus="${this._resetFieldError}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <etools-textarea
                class="${this._setRequired(
                  'key_internal_weakness.blueprints.risks.extra',
                  this.optionsData
                )} validate-input w100"
                .value="${this.editedBlueprint?.risks[0]?.extra.recommendation}"
                label="Recommendation"
                placeholder="Enter Recommendation"
                ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
                .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.editedBlueprint.risks[0].extra.recommendation = detail.value;
                  this.editedBlueprint = {...this.editedBlueprint};
                }}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <etools-textarea
                class="${this._setRequired(
                  'key_internal_weakness.blueprints.risks.extra',
                  this.optionsData
                )} validate-input w100"
                .value="${this.editedBlueprint?.risks[0]?.extra.ip_response}"
                label="IP Response"
                placeholder="Enter Response"
                ?required="${this._setRequired('key_internal_weakness.blueprints.risks.extra', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors?.blueprints[0]?.risks.extra}"
                .errorMessage="${this.errors?.blueprints[0]?.risks.extra}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => {
                  this.editedBlueprint.risks[0].extra.ip_response = detail.value;
                  this.editedBlueprint = {...this.editedBlueprint};
                }}"
              >
              </etools-textarea>
            </div>
          </div>
        </etools-dialog>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  subjectAreas!: GenericObject;

  @property({type: Object})
  dataModel: GenericObject = {
    risks: [
      {
        extra: {}
      }
    ]
  };

  @property({type: Array})
  details: any[] = [true];

  @property({type: String})
  errorBaseText = 'Key Internal Controls Weaknesses: ';

  @property({type: Object})
  dialogTexts: GenericObject = {
    dialogTitle: '',
    confirmBtn: ''
  };

  @property({type: Object})
  addDialogTexts: GenericObject = {
    dialogTitle: 'Add New Risk',
    confirmBtn: 'Add'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    dialogTitle: 'Edit Risk',
    confirmBtn: 'Add'
  };

  @property({type: Object})
  deleteDialogTexts: GenericObject = {
    dialogTitle: 'Are you sure that you want to delete this risk?',
    confirmBtn: 'Delete'
  };

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  editedBlueprint!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Array})
  riskOptions!: GenericObject[];

  @property({type: Boolean})
  dialogOpened!: boolean;

  @property({type: Boolean})
  confirmDialogOpened!: boolean;

  @property({type: Boolean})
  requestInProcess!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.editedBlueprint = cloneDeep(this.dataModel);
    this._initListeners();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('confirmDialogOpened')) {
      this.resetDialog(this.confirmDialogOpened);
    }
    if (changedProperties.has('subjectAreas')) {
      this._dataChanged();
    }
    if (changedProperties.has('errorObject')) {
      this._complexErrorHandler(this.errorObject?.key_internal_weakness);
    }
    if (changedProperties.has('optionsData')) {
      this.setRisk();
    }
  }

  _initListeners() {
    this.openEditDialog = this.openEditDialog.bind(this);
    this.addEventListener('kicw-risk-edit', this.openEditDialog as any);
    this.openDeleteDialog = this.openDeleteDialog.bind(this);
    this.addEventListener('kicw-risk-delete', this.openDeleteDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  setRisk() {
    const riskOptions = getOptionsChoices(this.optionsData, 'key_internal_weakness.blueprints.risks.value') || [];
    this.riskOptions = riskOptions;
  }

  _removeListeners() {
    this.removeEventListener('kicw-risk-edit', this.openEditDialog as any);
    this.removeEventListener('kicw-risk-delete', this.openDeleteDialog as any);
  }

  _getRisValueData(risk) {
    if (!this.riskOptions || !risk || isNil(risk.value)) {
      EtoolsLogger.error('Can not get correct risk value');
      return;
    }

    const option = this.riskOptions.find((option) => option.value === risk.value);
    if (option) {
      return option.value;
    }
    return -1;
  }

  _canBeChanged(optionsData) {
    return !this.isReadOnly('key_internal_weakness', optionsData);
  }

  openEditDialog(event) {
    // called from here with index and from kicw-risk with detail
    const data = event.detail ? event.detail : this.subjectAreas?.blueprints[event];
    if (data.blueprint) {
      const blueprint = data.blueprint;
      const risk = blueprint.risks[0];
      risk.value = this._getRisValueData(risk);

      this.editedBlueprint = blueprint;
      this.dialogTexts = this.editDialogTexts;
    } else {
      this.editedBlueprint = cloneDeep(this.dataModel);
      this.editedBlueprint.id = data.id;
      this.dialogTexts = this.addDialogTexts;
    }

    this.originalData = cloneDeep(this.editedBlueprint);
    this.dialogOpened = true;
  }

  openDeleteDialog(event) {
    if (!event || !event.detail) {
      return;
    }
    const data = event.detail;
    this.dialogTexts = this.deleteDialogTexts;
    this.editedBlueprint = data.blueprint;
    this.confirmDialogOpened = true;
  }

  _saveEditedArea() {
    if (!this.validate()) {
      return;
    }

    if (isEqual(this.originalData, this.editedBlueprint)) {
      this.dialogOpened = false;
      this.resetDialog(this.dialogOpened);
      return;
    }

    this._triggerSaveEngagement();
  }

  _deleteArea() {
    this._triggerSaveEngagement();
  }

  _triggerSaveEngagement() {
    this.requestInProcess = true;
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
  }

  getKeyInternalWeaknessData() {
    if (!this.dialogOpened && !this.confirmDialogOpened) {
      return null;
    }
    const blueprint = cloneDeep(this.editedBlueprint);

    if (blueprint.risks[0] && isObject(blueprint.risks[0].value)) {
      blueprint.risks[0].value = blueprint.risks[0].value.value;
    }

    return {
      blueprints: [blueprint]
    };
  }

  resetDialog(opened) {
    if (opened) {
      return;
    }
    const elements = this.shadowRoot!.querySelectorAll('.validate-input');
    elements.forEach((element: any) => {
      element.invalid = false;
      element.value = '';
    });
  }

  validate() {
    const elements = this.shadowRoot!.querySelectorAll('.validate-input');
    let valid = true;

    elements.forEach((element: any) => {
      if (element.required && !element.validate()) {
        element.invalid = 'This field is required';
        element.errorMessage = 'This field is required';
        valid = false;
      }
    });

    return valid;
  }
}
