import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';

import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';
import isString from 'lodash-es/isString';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import TableElementsMixin from '../../../app-mixins/table-elements-mixin';
import {fireEvent} from '../../../utils/fire-custom-event';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import '@polymer/paper-input/paper-textarea';
import {checkNonField} from '../../../app-mixins/error-handler';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
class SpecificProcedure extends CommonMethodsMixin(TableElementsMixin(PolymerElement)) {

  static get template() {
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style>
          :host .repeatable-item-container[without-line] {
              min-width: 0 !important;
              margin-bottom: 0 !important;
          }
          :host .confirm-text {
              padding: 5px 86px 0 23px !important;
          }
          :host paper-icon-button[hidden] {
              display: none !important;
          }
          etools-content-panel {
            --ecp-content: {
              padding: 0;
            };
          }
          
          #specificProcedure {
            --etools-dialog-scrollable: {
              --etools-dialog-content_-_max-height: 30vh!important;
              overflow: auto;
            };
          }

      </style>

      <etools-content-panel
          class="content-section clearfix"
          panel-title="[[getLabel('specific_procedures', basePermissionPath)]]" list>
      <div slot="panel-btns">
          <div hidden$="[[!canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn)]]">
              <paper-icon-button
                      class="panel-button"
                      on-tap="openAddDialog"
                      icon="add-box">
              </paper-icon-button>
              <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
      </div>

      <list-header
              id="list-header"
              no-ordered
              no-additional
              data="[[columns]]"
              base-permission-path="[[basePermissionPath]]">
      </list-header>

      <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <list-element
                  class="list-element"
                  data="[[item]]"
                  base-permission-path="[[basePermissionPath]]"
                  item-index="[[index]]"
                  headings="[[columns]]"
                  no-additional
                  multiline
                  no-animation>
              <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
                  <paper-icon-button
                        icon="icons:create"
                        class="edit-icon"
                        hidden$="[[_hideEditIcon(basePermissionPath, withoutFindingColumn, readonlyTab)]]"
                        on-tap="openEditDialog"></paper-icon-button>
                  <paper-icon-button
                        icon="icons:delete"
                        class="edit-icon"
                        hidden$="[[!canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn)]]"
                        on-tap="openDeleteDialog"></paper-icon-button>
              </div>
          </list-element>
      </template>

      <template is="dom-if" if="[[!dataItems.length]]">
          <list-element
                  class="list-element"
                  data="[[emptyObj]]"
                  headings="[[columns]]"
                  no-additional
                  no-animation>
          </list-element>
      </template>
      </etools-content-panel>
      <etools-dialog theme="confirmation" size="md"
                      opened="{{confirmDialogOpened}}"
                      on-close="_removeItem"
                      ok-btn-text="Delete">
          [[deleteTitle]]
      </etools-dialog>
      <etools-dialog id="specificProcedure" no-padding keep-dialog-open size="md"
              opened="{{dialogOpened}}"
              dialog-title="[[dialogTitle]]"
              ok-btn-text="[[confirmBtnText]]"
              show-spinner="{{requestInProcess}}"
              disable-confirm-btn="{{requestInProcess}}"
              on-confirm-btn-clicked="_addItemFromDialog">
          <div class="row-h repeatable-item-container" without-line>
              <div class="repeatable-item-content">

                  <template is="dom-if" if="[[canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn)]]"
                                    restamp>
                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <!-- Description -->
                              <paper-textarea
                                      class$="disabled-as-readonly fixed-width validate-input
                                            [[_setRequired('specific_procedures.description', basePermissionPath)]]"
                                      value="{{editedItem.description}}"
                                      allowed-pattern="[\d\s]"
                                      label="[[getLabel('specific_procedures.description', basePermissionPath)]]"
                                      placeholder="[[getPlaceholderText('specific_procedures.description',
                                                    basePermissionPath)]]"
                                      required$="[[_setRequired('specific_procedures.description',
                                                    basePermissionPath)]]"
                                      disabled$="[[requestInProcess]]"
                                      readonly$="[[requestInProcess]]"
                                      max-rows="4"
                                      invalid="[[_checkInvalid(errors.0.description)]]"
                                      error-message="[[errors.0.description]]"
                                      on-focus="_resetFieldError"
                                      on-tap="_resetFieldError">
                              </paper-textarea>
                          </div>
                      </div>
                  </template>

                  <template is="dom-if"
                                if="[[!canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn)]]" restamp>
                      <div class="row-h group">
                          <div class="input-container input-container-l">
                              <!-- Finding -->
                              <paper-textarea
                                      class$="disabled-as-readonly fixed-width validate-input
                                              [[_setRequired('specific_procedures.finding', basePermissionPath)]]"
                                      value="{{editedItem.finding}}"
                                      allowed-pattern="[\d\s]"
                                      label="[[getLabel('specific_procedures.finding', basePermissionPath)]]"
                                      placeholder="[[getPlaceholderText('specific_procedures.finding',
                                                    basePermissionPath)]]"
                                      required$="[[_setRequired('specific_procedures.finding', basePermissionPath)]]"
                                      disabled$="[[requestInProcess]]"
                                      readonly$="[[requestInProcess]]"
                                      max-rows="4"
                                      invalid="[[_checkInvalid(errors.0.finding)]]"
                                      error-message="[[errors.0.finding]]"
                                      on-focus="_resetFieldError"
                                      on-tap="_resetFieldError">
                              </paper-textarea>
                          </div>
                      </div>
                  </template>
              </div>
          </div>
      </etools-dialog>
  `;
  }
  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      '_errorHandler(errorObject.specific_procedures)',
      '_checkNonField(errorObject.specific_procedures)',
      '_manageColumns(withoutFindingColumn, columns)'
    ];
  }

  @property({type: Object})
  findingColumn: GenericObject = {
    'size': 40,
    'label': 'Finding',
    'labelPath': 'specific_procedures.finding',
    'path': 'finding'
  };

  @property({type: Array, notify: true})
  dataItems!: [];

  @property({type: String})
  mainProperty: string = 'specific_procedures';

  @property({type: Object})
  itemModel: GenericObject = {description: '', finding: ''};

  @property({type: Array})
  columns = [{
    'size': 20,
    'name': 'finding',
    'label': 'Procedure'
  }, {
    'size': 40,
    'label': 'Description',
    'labelPath': 'specific_procedures.description',
    'path': 'description'
  }, {
    'size': 40,
    'label': 'Finding',
    'labelPath': 'specific_procedures.finding',
    'path': 'finding'
  }];;

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Procedure'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Finding'};

  @property({type: String})
  deleteTitle: string = 'Are you sure that you want to delete this finding?';

  @property({type: Boolean, reflectToAttribute: true})
  withoutFindingColumn: boolean = false;

  @property({type: Boolean})
  readonlyTab: boolean = false;

  _checkNonField(error) {
    if (!error || (!this._canBeChanged(this.basePermissionPath) && this._hideEditIcon(this.basePermissionPath, this.withoutFindingColumn, this.readonlyTab))) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField || isString(error)) {
      fireEvent(this, 'toast', {text: `Specific Procedures: ${nonField || error}`});
    }
  }

  _manageColumns(removeFinding, columns) {
    if (removeFinding && columns.length === 3) {
      this.splice('columns', 2, 1);
    } else if (!removeFinding && columns.length === 2) {
      this.splice('columns', 2, 0, this.findingColumn);
    }
  }

  _hideEditIcon(basePermissionPath, withoutFindingColumn, readonlyTab) {
    return withoutFindingColumn || readonlyTab || !this._canBeChanged(basePermissionPath);
  }

  canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn) {
    return this._canBeChanged(basePermissionPath) && !readonlyTab && withoutFindingColumn;
  }

  _removeItem(event) {
    if (this.deleteCanceled(event)) {
      return;
    }
    this.removeItem();
  }

  _checkInvalid(value) {
    return !!value;
  }

}
window.customElements.define('specific-procedure', SpecificProcedure);

export {SpecificProcedure as SpecificProcedureEl};
