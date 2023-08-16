import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';

import {GenericObject} from '../../../../types/global';
import isString from 'lodash-es/isString';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@polymer/paper-input/paper-textarea';
import {checkNonField} from '../../../mixins/error-handler';
import {getHeadingLabel} from '../../../mixins/permission-controller';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('specific-procedure')
export class SpecificProcedure extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
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
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('specific_procedures', this.basePermissionPath)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this.canAddSP(this.basePermissionPath, this.readonlyTab, this.withoutFindingColumn)}">
            <paper-icon-button class="panel-button" on-tap="openAddDialog" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-2">Procedure</etools-data-table-column>
          <etools-data-table-column class="${this.withoutFindingColumn ? 'col-10' : 'col-5'}"
            >${getHeadingLabel(
              this.basePermissionPath,
              'specific_procedures.description',
              'Description'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-5" ?hidden="${this.withoutFindingColumn}"
            >${getHeadingLabel(
              this.basePermissionPath,
              'specific_procedures.finding',
              'Finding'
            )}</etools-data-table-column
          >
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2">${item.finding}</span>
                <span class="col-data ${this.withoutFindingColumn ? 'col-10' : 'col-5'}">${item.description}</span>
                <span class="col-data col-5" ?hidden="${this.withoutFindingColumn}"
                  >${item.specific_procedures.finding}</span
                >
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.basePermissionPath)}">
                  <paper-icon-button
                    icon="create"
                    ?hidden="${this._hideEditIcon(
                      this.basePermissionPath,
                      this.withoutFindingColumn,
                      this.readonlyTab
                    )}"
                    @click="${() => this.openEditDialog(index)}"
                  ></paper-icon-button>
                  <paper-icon-button
                    icon="delete"
                    ?hidden="${!this.canAddSP(this.basePermissionPath, this.readonlyTab, this.withoutFindingColumn)}"
                    @click="${() => this.openDeleteDialog(index)}"
                  ></paper-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
      </etools-content-panel>

      <etools-dialog
        theme="confirmation"
        size="md"
        .opened="${this.confirmDialogOpened}"
        openFlag="confirmDialogOpened"
        @close="${(e: CustomEvent) => {
          this._resetDialogOpenedFlag(e);
          this._removeItem(e);
        }}"
        ok-btn-text="Delete"
      >
        ${this.deleteTitle}
      </etools-dialog>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
        .dialogTitle="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?showSpinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._addItemFromDialog}"
      >
        ${
          this.canAddSP(this.basePermissionPath, this.readonlyTab, this.withoutFindingColumn)
            ? html`<div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Description -->
                  <paper-textarea
                    class="fixed-width validate-input ${this._setRequired(
                      'specific_procedures.description',
                      this.basePermissionPath
                    )}"
                    .value="${this.editedItem?.description}"
                    allowed-pattern="[ds]"
                    label="${this.getLabel('specific_procedures.description', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('specific_procedures.description', this.basePermissionPath)}"
                    ?required="${this._setRequired('specific_procedures.description', this.basePermissionPath)}"
                    ?readonly="${this.requestInProcess}"
                    max-rows="4"
                    ?invalid="${this._checkInvalid(this.errors[0]?.description)}"
                    .errorMessage="${this.errors[0]?.description}"
                    @value-changed="${({detail}: CustomEvent) =>
                      (this.editedItem = {...this.editedItem, description: detail.value})}"
                    @focus="${this._resetFieldError}"
                  >
                  </paper-textarea>
                </div>
              </div>`
            : ``
        }

        ${
          this.canAddSP(this.basePermissionPath, this.readonlyTab, this.withoutFindingColumn)
            ? html` <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Finding -->
                  <paper-textarea
                    class="fixed-width validate-input ${this._setRequired(
                      'specific_procedures.finding',
                      this.basePermissionPath
                    )}"
                    .value="${this.editedItem?.finding}"
                    allowed-pattern="[ds]"
                    label="${this.getLabel('specific_procedures.finding', this.basePermissionPath)}"
                    placeholder="${this.getPlaceholderText('specific_procedures.finding', this.basePermissionPath)}"
                    ?required="${this._setRequired('specific_procedures.finding', this.basePermissionPath)}"
                    ?readonly="${this.requestInProcess}"
                    max-rows="4"
                    ?invalid="${this._checkInvalid(this.errors[0]?.finding)}"
                    .errorMessage="${this.errors[0]?.finding}"
                    @value-changed="${({detail}: CustomEvent) =>
                      (this.editedItem = {...this.editedItem, finding: detail.value})}"
                    @focus="${this._resetFieldError}"
                  >
                  </paper-textarea>
                </div>
              </div>`
            : ``
        }

          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  findingColumn: GenericObject = {
    size: 40,
    label: 'Finding',
    labelPath: 'specific_procedures.finding',
    path: 'finding'
  };

  @property({type: Array})
  dataItems!: GenericObject[];

  @property({type: String})
  mainProperty = 'specific_procedures';

  @property({type: Object})
  itemModel: GenericObject = {description: '', finding: ''};

  @property({type: Array})
  columns = [
    {
      size: 20,
      name: 'finding',
      label: 'Procedure'
    },
    {
      size: 40,
      label: 'Description',
      labelPath: 'specific_procedures.description',
      path: 'description'
    },
    {
      size: 40,
      label: 'Finding',
      labelPath: 'specific_procedures.finding',
      path: 'finding'
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Procedure'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Finding'};

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Boolean})
  withoutFindingColumn = false;

  @property({type: Boolean})
  readonlyTab = false;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.specific_procedures);
      this._checkNonField(this.errorObject?.specific_procedures);
    }
    // @dci '_manageColumns(withoutFindingColumn, columns)'
  }

  _checkNonField(error) {
    if (
      !error ||
      (!this._canBeChanged(this.basePermissionPath) &&
        this._hideEditIcon(this.basePermissionPath, this.withoutFindingColumn, this.readonlyTab))
    ) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField || isString(error)) {
      fireEvent(this, 'toast', {text: `Specific Procedures: ${nonField || error}`});
    }
  }

  // @dci to be removed
  _manageColumns(removeFinding, columns) {
    if (removeFinding && columns.length === 3) {
      this.columns.splice(2, 1);
    } else if (!removeFinding && columns.length === 2) {
      this.columns.splice(2, 0, this.findingColumn);
    }
  }

  _hideEditIcon(basePermissionPath, withoutFindingColumn, readonlyTab) {
    return withoutFindingColumn || readonlyTab || !this._canBeChanged(basePermissionPath);
  }

  canAddSP(basePermissionPath, readonlyTab, withoutFindingColumn) {
    return this._canBeChanged(basePermissionPath) && !readonlyTab && withoutFindingColumn;
  }

  _removeItem(event) {
    this.confirmDialogOpened = false;
    if (this.deleteCanceled(event)) {
      return;
    }
    this.removeItem();
  }

  _checkInvalid(value) {
    return !!value;
  }
}
