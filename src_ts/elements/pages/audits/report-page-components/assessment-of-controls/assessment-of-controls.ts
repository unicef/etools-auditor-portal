import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import './assessment-of-controls-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {checkNonField} from '../../../../mixins/error-handler';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('assessment-of-controls')
export class AssessmentOfControls extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
        .repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .mt-30 {
          margin-top: 30px
        }
        .pr-55 {
          padding-inline-end: 55px !important;
        }
        etools-data-table-row *[slot="row-data-details"]{
          flex-direction: column;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('key_internal_controls', this.optionsData)}"
        list
      >
        <div class="header-content">
          <div class="static-text">
            We have reviewed the status of implementation of the recommendations from the micro assessment or previous
            audit. The recommendations that have not been implemented are presented below:
          </div>
        </div>
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${
                this.openAddDialog
              }" name="add-box"> </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-12">Audit Observation</etools-data-table-column>
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-12 truncate pr-55">${item.audit_observation}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content col-12">
                  <span class="rdc-title">Recommendation</span>
                  <span>${item.recommendation}</span>
                </div>
                <div class="row-details-content col-12 mt-30">
                  <span class="rdc-title">IP response</span>
                  <span>${item.ip_response}</span>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
          <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
            <div slot="row-data" class="layout-horizontal editable-row pl-30">
              <span class="col-data col-12">–</span>
            </div>
          </etools-data-table-row>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems: GenericObject[] = [];

  @property({type: String})
  mainProperty = 'key_internal_controls';

  @property({type: Object})
  itemModel: GenericObject = {};

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Add New Assessment of Key Internal Controls'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Assessment of Key Internal Controls'
  };

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this assessment?';

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'assessment-of-controls-dialog';
    this.addEventListener('show-add-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditAttachDialog as any);
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
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
      this._errorHandler(this.errorObject.key_internal_controls);
      this._checkNonField(this.errorObject.key_internal_controls);
    }
  }

  openAddEditAttachDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        editedIndex: this.editedIndex,
        dataItems: this.dataItems,
        originalEditedObj: this.originalEditedObj,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText
      }
    });
    // .then(({confirmed, response}) => {
    //   if (confirmed) {
    //     this.dataItems = cloneDeep(response);
    //   }
    // });
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

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Assessment of Key Internal Controls: ${nonField}`});
    }
  }
}
