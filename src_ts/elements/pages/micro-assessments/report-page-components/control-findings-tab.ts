import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {checkNonField} from '../../../mixins/error-handler';
import {GenericObject} from '@unicef-polymer/etools-utils/dist/types/global.types';

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
        :host {
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
      </style>

      <etools-content-panel panel-title="Detailed Internal Control Findings and Recommendations" list>
        <div slot="panel-btns">
          <div ?hidden="${!this.canBeChanged}">
            <paper-icon-button class="panel-button" @tap="${this.openAddDialog}" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
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
                  <paper-icon-button icon="create" @click="${() => this.openEditDialog(index)}"></paper-icon-button>
                  <paper-icon-button icon="delete" @click="${() => this.openDeleteDialog(index)}"></paper-icon-button>
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
        theme="confirmation"
        size="md"
        keep-dialog-open
        ?opened="${this.confirmDialogOpened}"
        @confirm-btn-clicked="${this.removeItem}"
        ok-btn-text="Delete"
        openFlag="confirmDialogOpened"
        @close="${this._resetDialogOpenedFlag}"
      >
        ${this.deleteTitle}
      </etools-dialog>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        ?opened="${this.dialogOpened}"
        .deleteDialog="${this.deleteDialog}"
        .dialogTitle="${this.dialogTitle}"
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
              <paper-input
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
              </paper-input>
            </div>
          </div>
          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Recommendation -->
              <paper-textarea
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
              </paper-textarea>
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

  @property({type: Array})
  columns = [
    {
      size: 100,
      label: 'Description of Finding',
      labelPath: 'findings.finding',
      path: 'finding'
    }
  ];

  @property({type: Array})
  details = [
    {
      label: 'Recommendation and IP Management Response',
      labelPath: 'findings.recommendation',
      path: 'recommendation',
      size: 100
    }
  ];

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

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dataItems')) {
      this.dataItemsChanged();
    }
    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('confirmDialogOpened')) {
      this.resetDialog(this.confirmDialogOpened);
    }
    if (changedProperties.has('dataItems')) {
      this._errorHandler(this.errorObject?.findings);
      this._checkNonField(this.errorObject?.findings);
    }
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
