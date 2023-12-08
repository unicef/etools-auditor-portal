import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
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

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('control-findings-tab')
export class ControlFindingsTab extends CommonMethodsMixin(TableElementsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
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

      <etools-content-panel panel-title="Detailed Internal Control Findings and Recommendations" list>
        <div slot="panel-btns">
          <div ?hidden="${!this.canBeChanged}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-12">Description of Finding</etools-data-table-column>
        </etools-data-table-header>
        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-12">${item.finding}</span>
                <div class="hover-block" ?hidden="${!this.canBeChanged}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content col-12">
                  <span class="rdc-title">Recommendation and IP Management Response</span>
                </div>
                <span>${item.recommendation}</span>
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

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        ?opened="${this.dialogOpened}"
        .deleteDialog="${this.deleteDialog}"
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this.requestInProcess}"
        ?disableConfirmBtn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._addItemFromDialog}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
      >
        <div class="container">
          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Finding -->
              <etools-input
                class="w100 validate-input ${this._setRequired('findings.finding', this.optionsData)}"
                .value="${this.editedItem.finding}"
                label="${this.getLabel('findings.finding', this.optionsData)}"
                placeholder="${this.getPlaceholderText('findings.finding', this.optionsData)}"
                ?required="${this._setRequired('findings.finding', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                maxlength="400"
                ?invalid="${this.errors[0]?.finding}"
                .errorMessage="${this.errors[0]?.finding}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => (this.editedItem.finding = detail.value)}"
              >
              </etools-input>
            </div>
          </div>
          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Recommendation -->
              <etools-textarea
                class="w100 validate-input ${this._setRequired('findings.recommendation', this.optionsData)}"
                .value="${this.editedItem.recommendation}"
                allowed-pattern="[ds]"
                label="${this.getLabel('findings.recommendation', this.optionsData)}"
                placeholder="${this.getPlaceholderText('findings.recommendation', this.optionsData)}"
                ?required="${this._setRequired('findings.recommendation', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors[0]?.recommendation}"
                .errorMessage="${this.errors[0]?.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => (this.editedItem.recommendation = detail.value)}"
              >
              </etools-textarea>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  dataItems!: GenericObject[];

  @property({type: Array})
  originalDataItems!: GenericObject[];

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
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dataItems')) {
      this.dataItemsChanged();
    }
    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('dataItems')) {
      this._errorHandler(this.errorObject?.findings);
      this._checkNonField(this.errorObject?.findings);
    }
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
      fireEvent(this, 'toast', {text: `Findings and Recommendations: ${nonField}`});
    }
  }

  dataItemsChanged() {
    this.canBeChanged = this._canBeChanged(this.optionsData);

    if (!this.originalDataItems) {
      this.originalDataItems = this.dataItems;
    }
  }
}
