import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-textarea';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';

import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import '../kicw-risk/kicw-risk';
import StaticDataMixin from '../../../../app-mixins/static-data-mixin';
import {getChoices} from '../../../../app-mixins/permission-controller';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';
import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isEqual from 'lodash-es/isEqual';
import isNil from 'lodash-es/isNil';


/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin StaticDataMixin
 */
class KeyInternalControlsWeaknesses extends
  CommonMethodsMixin(StaticDataMixin(PolymerElement)) {

  static get template() {
    return html`
    ${tabInputsStyles} ${moduleStyles}
      <style>
        :host {
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
          color: var(--module-primary);
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
        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }
      </style>

      <etools-content-panel class="content-section clearfix"
        panel-title="[[getLabel('key_internal_weakness', basePermissionPath)]]" list>
          <div class="header-content">
              <div class="static-text">
                  We have reviewed the implementation of applicable key internal controls and noted the following weaknesses:
              </div>
          </div>
          <list-header
                  no-ordered
                  data="[[columns]]"
                  base-permission-path="[[basePermissionPath]]">
          </list-header>

          <template is="dom-repeat" items="[[subjectAreas.blueprints]]">
              <list-element
                      class="list-element"
                      data="[[item]]"
                      headings="[[columns]]"
                      details="[[details]]"
                      has-collapse
                      no-animation>
                  <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
                      <paper-icon-button icon="icons:add-box" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
                  </div>
                  <div class="collapse-container" slot="custom-details">
                      <kicw-risk risks-data="[[item.risks]]"
                                  blueprint-id="[[item.id]]"
                                  is-editable="[[_canBeChanged(basePermissionPath)]]"></kicw-risk>
                  </div>
              </list-element>
          </template>

          <template is="dom-if" if="[[!subjectAreas.blueprints.length]]">
              <list-element
                      class="list-element"
                      data="[[emptyObj]]"
                      headings="[[columns]]"
                      no-animation>
              </list-element>
          </template>
      </etools-content-panel>
      <etools-dialog theme="confirmation" size="md"
              keep-dialog-open
              opened="{{confirmDialogOpened}}"
              on-confirm-btn-clicked="_deleteArea"
              disable-confirm-btn="{{requestInProcess}}"
              ok-btn-text="Delete">
          [[dialogTexts.dialogTitle]]
      </etools-dialog>
      <etools-dialog no-padding keep-dialog-open size="md"
              opened="{{dialogOpened}}"
              dialog-title="[[dialogTexts.dialogTitle]]"
              ok-btn-text="[[dialogTexts.confirmBtn]]"
              show-spinner="{{requestInProcess}}"
              disable-confirm-btn="{{requestInProcess}}"
              on-confirm-btn-clicked="_saveEditedArea">
              <div class="row-h repeatable-item-container" without-line>
                  <div class="repeatable-item-content">
                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <!-- Risk Assessment -->
                              <etools-dropdown
                                      id="riskRatingInput"
                                      class$="disabled-as-readonly {{_setRequired('key_internal_weakness.blueprints.risks.value', basePermissionPath)}} validate-input"
                                      selected="{{editedBlueprint.risks.0.value}}"
                                      label="Risk rating"
                                      placeholder="Select Risk rating"
                                      options="[[riskOptions]]"
                                      option-label="display_name"
                                      option-value="value"
                                      required="{{_setRequired('key_internal_weakness.blueprints.risks.value', basePermissionPath)}}"
                                      disabled="{{requestInProcess}}"
                                      readonly$="{{requestInProcess}}"
                                      invalid="{{errors.blueprints.0.risks.value}}"
                                      error-message="{{errors.blueprints.0.risks.value}}"
                                      on-focus="_resetFieldError"
                                      hide-search>
                              </etools-dropdown>
                          </div>
                      </div>

                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <paper-textarea
                                      class$="disabled-as-readonly {{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}} validate-input"
                                      value="{{editedBlueprint.risks.0.extra.key_control_observation}}"
                                      label="Key control observation"
                                      placeholder="Enter Observation"
                                      required="{{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}}"
                                      disabled="{{requestInProcess}}"
                                      readonly="{{requestInProcess}}"
                                      max-rows="4"
                                      invalid="{{errors.blueprints.0.risks.extra}}"
                                      error-message="{{errors.blueprints.0.risks.extra}}"
                                      on-focus="_resetFieldError">
                              </paper-textarea>
                          </div>
                      </div>

                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <paper-textarea
                                      class$="disabled-as-readonly {{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}} validate-input"
                                      value="{{editedBlueprint.risks.0.extra.recommendation}}"
                                      label="Recommendation"
                                      placeholder="Enter Recommendation"
                                      required="{{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}}"
                                      disabled="{{requestInProcess}}"
                                      readonly="{{requestInProcess}}"
                                      max-rows="4"
                                      invalid="{{errors.blueprints.0.risks.extra}}"
                                      error-message="{{errors.blueprints.0.risks.extra}}"
                                      on-focus="_resetFieldError">
                              </paper-textarea>
                          </div>
                      </div>

                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <paper-textarea
                                      class$="disabled-as-readonly {{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}} validate-input"
                                      value="{{editedBlueprint.risks.0.extra.ip_response}}"
                                      label="IP Response"
                                      placeholder="Enter Response"
                                      required="{{_setRequired('key_internal_weakness.blueprints.risks.extra', basePermissionPath)}}"
                                      disabled="{{requestInProcess}}"
                                      readonly="{{requestInProcess}}"
                                      max-rows="4"
                                      invalid="{{errors.blueprints.0.risks.extra}}"
                                      error-message="{{errors.blueprints.0.risks.extra}}"
                                      on-focus="_resetFieldError">
                              </paper-textarea>
                          </div>
                      </div>
                  </div>
              </div>
      </etools-dialog>
      `;
  }

  @property({type: Object})
  subjectAreas!: GenericObject;

  @property({type: Object})
  dataModel: GenericObject = {
    risks: [{
      value: {},
      extra: {}
    }]
  };

  @property({type: Array})
  columns: GenericObject[] = [{
    'size': 70,
    'label': 'Subject area',
    'path': 'header'
  }, {
    'size': 30,
    'label': 'Risks Count',
    'path': 'risks.length'
  }];

  @property({type: Array})
  details: any[] = [true];

  @property({type: String})
  errorBaseText: string = 'Key Internal Controls Weaknesses: ';

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

  @property({type: Array})
  riskOptions!: GenericObject[];

  @property({type: Boolean})
  dialogOpened!: boolean;

  @property({type: Boolean})
  confirmDialogOpened!: boolean;

  @property({type: Boolean})
  requestInProcess!: boolean;

  @property({type: String})
  basePermissionPath!: string;

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      'updateStyles(requestInProcess, dialogOpened)',
      '_dataChanged(subjectAreas)',
      '_complexErrorHandler(errorObject.key_internal_weakness)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    let riskOptions = getChoices(`${this.basePermissionPath}.key_internal_weakness.blueprints.risks.value`) || [];
    this.set('riskOptions', riskOptions);
    this.editedBlueprint = cloneDeep(this.dataModel);
    this._initListeners();
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

  _removeListeners() {
    this.removeEventListener('kicw-risk-edit', this.openEditDialog as any);
    this.removeEventListener('kicw-risk-delete', this.openDeleteDialog as any);
  }

  _getRisValueData(risk) {
    if (!this.riskOptions || !risk || isNil(risk.value)) {
      console.error('Can not get correct risk value');
      return;
    }

    let option = this.riskOptions.find(option => option.value === risk.value);
    if (option) {return option.value};
    return -1;
  }

  _canBeChanged(basePermissionPath) {
    return !this.isReadOnly('key_internal_weakness', basePermissionPath);
  }

  openEditDialog(event) {
    if (!event || !event.detail) {return;}
    let data = event.detail;
    if (data.blueprint) {
      let blueprint = data.blueprint,
        risk = blueprint.risks[0];

      risk.value = this._getRisValueData(risk);

      this.set('editedBlueprint', blueprint);
      this.dialogTexts = this.editDialogTexts;
    } else {
      let index = this.subjectAreas.blueprints.indexOf(event && event.model && event.model.item);
      if ((!index && index !== 0) || !~index) {
        throw 'Can not find data';
      }

      let blueprint = this.subjectAreas.blueprints[index];
      this.set('editedBlueprint', cloneDeep(this.dataModel));
      this.editedBlueprint.id = blueprint.id;
      this.dialogTexts = this.addDialogTexts;
    }

    this.originalData = cloneDeep(this.editedBlueprint);
    this.dialogOpened = true;
  }

  openDeleteDialog(event) {
    if (!event || !event.detail) {return;}
    let data = event.detail;
    this.dialogTexts = this.deleteDialogTexts;
    this.set('editedBlueprint', data.blueprint);
    this.confirmDialogOpened = true;
  }

  _saveEditedArea() {
    if (!this.validate()) {return;}

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
    if ((!this.dialogOpened && !this.confirmDialogOpened)) {return null;}
    let blueprint = cloneDeep(this.editedBlueprint);

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
    let elements = this.shadowRoot!.querySelectorAll('.validate-input');
    elements.forEach((element: any) => {
      element.invalid = false;
      element.value = '';
    });

  }

  validate() {
    let elements = this.shadowRoot!.querySelectorAll('.validate-input');
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

window.customElements.define('key-internal-controls-weaknesses', KeyInternalControlsWeaknesses);
