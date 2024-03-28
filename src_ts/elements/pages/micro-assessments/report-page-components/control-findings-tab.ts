import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import './control-findings-dialog';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {checkNonField} from '../../../mixins/error-handler';
import {GenericObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util.js';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('control-findings-tab')
export class ControlFindingsTab extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          position: relative;
          display: block;
        }

        .repeatable-item-container.row-h {
          width: 100%;
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        .edit-icon-slot {
          overflow: visible !important;
          display: flex;
          align-items: center;
          height: 100%;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        etools-data-table-row *[slot='row-data-details'] {
          flex-direction: column;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel panel-title="Detailed Internal Control Findings and Recommendations" list>
        <div slot="panel-btns">
          <div ?hidden="${!this.canBeChanged}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title .lowResolutionLayout="${this.lowResolutionLayout}">
          <etools-data-table-column class="col-12">Description of Finding</etools-data-table-column>
        </etools-data-table-header>
        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-12" data-col-header-label="Description of Finding">${item.finding}</span>
                <div class="hover-block" ?hidden="${!this.canBeChanged}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
              <div slot="row-data-details" class="row">
                <div class="row-details-content col-12">
                  <span class="rdc-title">Recommendation and IP Management Response</span>
                </div>
                <span class="col-12">${item.recommendation}</span>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
          <div slot="row-data" class="layout-horizontal editable-row pl-30">
            <span class="col-data col-12">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems!: GenericObject[];

  @property({type: String})
  mainProperty = 'findings';

  @property({type: Object})
  itemModel = {
    finding: '',
    recommendation: ''
  };

  @property({type: Object})
  addDialogTexts = {
    title: 'Add New Finding'
  };

  @property({type: Object})
  editDialogTexts = {
    title: 'Edit Finding'
  };

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Boolean})
  canBeChanged = false;

  connectedCallback() {
    super.connectedCallback();

    this.dialogKey = 'control-findings-tab-dialog';
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

    if (changedProperties.has('dataItems')) {
      this.dataItemsChanged();
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.findings, this.errorObject);
      this._checkNonField(this.errorObject?.findings);
    }
  }

  openAddEditDialog() {
    openDialog({
      dialog: 'control-findings-tab-dialog',
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText
      }
    }).then(({confirmed, response}) => {
      if (confirmed) {
        this.dataItems = cloneDeep(response);
      }
      setTimeout(() => {
        this.isAddDialogOpen = false;
      }, 1000);
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
      setTimeout(() => {
        this.isConfirmDialogOpen = false;
      }, 1000);
    });
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Findings and Recommendations: ${nonField}`});
    }
  }

  dataItemsChanged() {
    this.canBeChanged = this._canBeChanged(this.optionsData);
  }
}
