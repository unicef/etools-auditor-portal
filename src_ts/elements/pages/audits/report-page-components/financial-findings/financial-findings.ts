import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-input/paper-textarea';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getChoices, getHeadingLabel} from '../../../../mixins/permission-controller';
import sortBy from 'lodash-es/sortBy';
import {checkNonField} from '../../../../mixins/error-handler';

/**
 * @customElement
 * @LitElement
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('financial-findings')
export class FinancialFindings extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
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
        etools-dropdown#titleOptionsDropDown {
          --paper-listbox: {
            max-height: 340px;
          }
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('financial_finding_set', this.basePermissionPath)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.basePermissionPath)}">
            <paper-icon-button class="panel-button" @click="${this.openAddDialog}" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-2">Finding Number</etools-data-table-column>
          <etools-data-table-column class="col-4"
            >${getHeadingLabel(
              this.basePermissionPath,
              'financial_finding_set.title',
              'Title (Category)'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-3"
            >${getHeadingLabel(
              this.basePermissionPath,
              'financial_finding_set.local_amount',
              'Amount (local)'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-3"
            >${getHeadingLabel(
              this.basePermissionPath,
              'financial_finding_set.amount',
              'Amount USD'
            )}</etools-data-table-column
          >
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-3">${item.finding}</span>
                <span class="col-data col-3">${item.title}</span>
                <span class="col-data col-1">${item.local_amount}</span>
                <span class="col-data col-2">${item.amount}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.basePermissionPath)}">
                  <paper-icon-button icon="create" @click="${() => this.openEditDialog(index)}"></paper-icon-button>
                  <paper-icon-button icon="delete" @click="${() => this.openDeleteDialog(index)}"></paper-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}

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
          id="financial-findings"
          no-padding
          size="md"
          ?opened="${this.dialogOpened}"
          keep-dialog-open
          .dialogTitle="${this.dialogTitle}"
          ok-btn-text="Add"
          ?showSpinner="${this.requestInProcess}"
          ?disable-confirm-btn="${this.requestInProcess}"
          @confirm-btn-clicked="${this._addItemFromDialog}"
          openFlag="dialogOpened"
          @close="${this._resetDialogOpenedFlag}"
        >
          <div class="layout-horizontal">
            <div class="col col-6">
              <!-- Title -->
              <etools-dropdown
                id="titleOptionsDropDown"
                class="${this._setRequired('financial_finding_set.title', this.basePermissionPath)} validate-input"
                label="${this.getLabel('financial_finding_set.title', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.title', this.basePermissionPath)}"
                .options="${this.titleOptions}"
                option-label="display_name"
                option-value="value"
                .selected="${this.editedItem.title}"
                ?required="${this._setRequired('financial_finding_set.title', this.basePermissionPath)}"
                ?disabled="${this.requestInProcess}"
                ?invalid="${this.errors.title}"
                .errorMessage="${this.errors.title}"
                @focus="${this._resetFieldError}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  this.selectedItemChanged(detail, 'title', 'value', this.editedItem)}"
                hide-search
              >
              </etools-dropdown>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-6">
              <!-- Amount (local) -->
              <etools-currency-amount-input
                class="${this._setRequired(
                  'financial_finding_set.local_amount',
                  this.basePermissionPath
                )} validate-input"
                .value="${this.editedItem.local_amount}"
                currency=""
                label="${this.getLabel('financial_finding_set.local_amount', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.local_amount', this.basePermissionPath)}"
                ?required="${this._setRequired('financial_finding_set.local_amount', this.basePermissionPath)}"
                ?readonly="${this.requestInProcess}"
                ?invalid="${this.errors.local_amount}"
                .errorMessage="${this.errors.local_amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.numberChanged(detail, 'local_amount', this.editedItem)}"
              >
              </etools-currency-amount-input>
            </div>

            <div class="col col-6">
              <!-- Amount USD -->
              <etools-currency-amount-input
                class="${this._setRequired('financial_finding_set.amount', this.basePermissionPath)} validate-input"
                .value="${this.editedItem.amount}"
                currency="$"
                label="${this.getLabel('financial_finding_set.amount', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.amount', this.basePermissionPath)}"
                ?required="${this._setRequired('financial_finding_set.amount', this.basePermissionPath)}"
                ?readonly="${this.requestInProcess}"
                ?invalid="${this.errors.amount}"
                .errorMessage="${this.errors.amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'amount', this.editedItem)}"
              >
              </etools-currency-amount-input>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Description -->
              <paper-textarea
                class="w100 ${this._setRequired('financial_finding_set.description', this.basePermissionPath)}
                            fixed-width validate-input"
                .value="${this.editedItem.description}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.description', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.description', this.basePermissionPath)}"
                ?required="${this._setRequired('financial_finding_set.description', this.basePermissionPath)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.description}"
                .errorMessage="${this.errors.description}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'description', this.editedItem)}"
              >
              </paper-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Recommendation -->
              <paper-textarea
                class="w100 ${this._setRequired('financial_finding_set.recommendation', this.basePermissionPath)}
                            fixed-width validate-input"
                .value="${this.editedItem.recommendation}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.recommendation', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText(
                  'financial_finding_set.recommendation',
                  this.basePermissionPath
                )}"
                ?required="${this._setRequired('financial_finding_set.recommendation', this.basePermissionPath)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.recommendation}"
                .errorMessage="${this.errors.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.valueChanged(detail, 'recommendation', this.editedItem)}"
              >
              </paper-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- IP comments -->
              <paper-textarea
                class="w100 ${this._setRequired('financial_finding_set.ip_comments', this.basePermissionPath)}
                            fixed-width validate-input"
                .value="${this.editedItem.ip_comments}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.ip_comments', this.basePermissionPath)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.ip_comments', this.basePermissionPath)}"
                ?required="${this._setRequired('financial_finding_set.ip_comments', this.basePermissionPath)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.ip_comments}"
                .errorMessage="${this.errors.ip_comments}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'ip_comments', this.editedItem)}"
              >
              </paper-textarea>
            </div>
          </div>
        </etools-dialog>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems!: any[];

  @property({type: String})
  mainProperty = 'financial_finding_set';

  @property({type: Object})
  itemModel: GenericObject = {
    title: '',
    local_amount: '',
    amount: '',
    description: '',
    recommendation: '',
    ip_comments: ''
  };

  @property({type: Array})
  columns: GenericObject[] = [
    {
      size: 20,
      name: 'finding',
      label: 'Finding Number'
    },
    {
      size: 40,
      label: 'Title (Category)',
      labelPath: 'financial_finding_set.title',
      property: 'title',
      custom: true,
      doNotHide: false
    },
    {
      size: 20,
      name: 'currency',
      label: 'Amount (local)',
      labelPath: 'financial_finding_set.local_amount',
      path: 'local_amount',
      align: 'right'
    },
    {
      size: 20,
      name: 'currency',
      label: 'Amount USD',
      labelPath: 'financial_finding_set.amount',
      path: 'amount',
      align: 'right'
    }
  ];

  @property({type: Array})
  details: GenericObject[] = [
    {
      size: 100,
      label: 'Description',
      labelPath: 'financial_finding_set.description',
      path: 'description'
    },
    {
      size: 100,
      label: 'Recommendation',
      labelPath: 'financial_finding_set.recommendation',
      path: 'recommendation'
    },
    {
      size: 100,
      label: 'IP comments',
      labelPath: 'financial_finding_set.ip_comments',
      path: 'ip_comments'
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Add New Finding'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Finding'
  };

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Array})
  titleOptions: any[] = [];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('confirmDialogOpened')) {
      this.resetDialog(this.confirmDialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this._checkNonField(this.errorObject.financial_finding_set);
      this._errorHandler(this.errorObject.financial_finding_set);
    }
    if (changedProperties.has('errorObject')) {
      this.setChoices(this.basePermissionPath);
    }
  }

  setChoices(basePath) {
    const unsortedOptions = getChoices(`${basePath}.financial_finding_set.title`);
    const titleOptions = sortBy(unsortedOptions, ['display_name']);
    this.titleOptions = titleOptions || [];
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Financial Findings: ${nonField}`});
    }
  }
}
