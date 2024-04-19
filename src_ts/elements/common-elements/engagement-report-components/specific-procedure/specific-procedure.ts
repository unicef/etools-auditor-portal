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
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {checkNonField} from '../../../mixins/error-handler';
import {getHeadingLabel} from '../../../mixins/permission-controller';
import {getTableRowIndexText} from '../../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('specific-procedure')
export class SpecificProcedure extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host .repeatable-item-container[without-line] {
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
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
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

        <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
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
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2" data-col-header-label="Procedure">${getTableRowIndexText(index)}</span>
                <span
                  class="col-data ${this.withoutFindingColumn ? 'col-10' : 'col-5'}"
                  data-col-header-label="${getHeadingLabel(
                    this.optionsData,
                    'specific_procedures.description',
                    'Description'
                  )}"
                  >${item.description}</span
                >
                <span
                  class="col-data col-5"
                  data-col-header-label="${getHeadingLabel(this.optionsData, 'specific_procedures.finding', 'Finding')}"
                  ?hidden="${this.withoutFindingColumn}"
                  >${item.finding}</span
                >
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
          <div slot="row-data" class="layout-horizontal editable-row padding-v">
            <span class="col-data col-12">No records found.</span>
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
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.removeEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.removeEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.specific_procedures, this.errorObject);
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

  openAddEditDialog() {
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
    }).then(() => (this.isAddDialogOpen = false));
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
      setTimeout(() => {
        this.isConfirmDialogOpen = false;
      }, 1000);
    });
  }

  _checkInvalid(value) {
    return !!value;
  }
}
