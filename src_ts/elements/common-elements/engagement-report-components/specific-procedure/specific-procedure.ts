import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import './specific-procedure-dialog.js';
import {GenericObject} from '../../../../types/global';
import isString from 'lodash-es/isString';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {checkNonField} from '../../../mixins/error-handler';
import {getHeadingLabel} from '../../../mixins/permission-controller';
import {getTableRowIndexText} from '../../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

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
        :host etools-icon-button[hidden] {
          display: none !important;
        }
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('specific_procedures', this.optionsData)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this.canAddSP(this.optionsData, this.readonlyTab, this.withoutFindingColumn)}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-2">Procedure</etools-data-table-column>
          <etools-data-table-column class="${this.withoutFindingColumn ? 'col-10' : 'col-5'}"
            >${getHeadingLabel(
              this.optionsData,
              'specific_procedures.description',
              'Description'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-5" ?hidden="${this.withoutFindingColumn}">
            ${getHeadingLabel(this.optionsData, 'specific_procedures.finding', 'Finding')}
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2">${getTableRowIndexText(index)}</span>
                <span class="col-data ${this.withoutFindingColumn ? 'col-10' : 'col-5'}">${item.description}</span>
                <span class="col-data col-5" ?hidden="${this.withoutFindingColumn}">${item.finding}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button
                    name="create"
                    ?hidden="${this._hideEditIcon(this.optionsData, this.withoutFindingColumn, this.readonlyTab)}"
                    @click="${() => this.openEditDialog(index)}"
                  ></etools-icon-button>
                  <etools-icon-button
                    name="delete"
                    ?hidden="${!this.canAddSP(this.optionsData, this.readonlyTab, this.withoutFindingColumn)}"
                    @click="${() => this.openDeleteDialog(index)}"
                  ></etools-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
          <div slot="row-data" class="layout-horizontal editable-row">
            <span class="col-data col-2">–</span>
            <span class="col-data ${this.withoutFindingColumn ? 'col-10' : 'col-5'}">–</span>
            <span class="col-data col-5" ?hidden="${this.withoutFindingColumn}">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  mainProperty = 'specific_procedures';

  @property({type: Object})
  itemModel: GenericObject = {description: '', finding: ''};

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Procedure'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Finding'};

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Boolean, attribute: 'without-finding-column'})
  withoutFindingColumn = false;

  @property({type: Boolean, attribute: 'save-with-button'})
  saveWithButton = false;

  @property({type: Boolean, attribute: 'readonly-tab'})
  readonlyTab = false;

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'specific-procedure-dialog';
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditAttachDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditAttachDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.specific_procedures);
      this._checkNonField(this.errorObject?.specific_procedures);
    }
  }

  _checkNonField(error) {
    if (
      !error ||
      (!this._canBeChanged(this.optionsData) &&
        this._hideEditIcon(this.optionsData, this.withoutFindingColumn, this.readonlyTab))
    ) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField || isString(error)) {
      fireEvent(this, 'toast', {text: `Specific Procedures: ${nonField || error}`});
    }
  }

  _hideEditIcon(permissions: AnyObject, withoutFindingColumn, readonlyTab) {
    return withoutFindingColumn || readonlyTab || !this._canBeChanged(permissions);
  }

  canAddSP(permissions: AnyObject, readonlyTab, withoutFindingColumn) {
    return this._canBeChanged(permissions) && !readonlyTab && withoutFindingColumn;
  }

  openAddEditAttachDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        withoutFindingColumn: this.withoutFindingColumn,
        readonlyTab: this.readonlyTab,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        originalEditedObj: this.originalEditedObj,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText
      }
    });
  }

  openConfirmDeleteDialog() {
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: this.deleteTitle,
        confirmBtnText: 'Delete',
        cancelBtnText: 'Cancel'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this.removeItem();
      }
    });
  }

  _checkInvalid(value) {
    return !!value;
  }
}
