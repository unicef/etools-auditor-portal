import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';

import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getHeadingLabel, getOptionsChoices} from '../../../../mixins/permission-controller';
import sortBy from 'lodash-es/sortBy';
import {checkNonField} from '../../../../mixins/error-handler';
import {getTableRowIndexText} from '../../../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';

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
        ${dataTableStylesLit} .repeatable-item-container[without-line] {
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
        .row-details-content.col-12 {
          margin-bottom: 30px;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('financial_finding_set', this.optionsData)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
            </etools-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-2">Finding Number</etools-data-table-column>
          <etools-data-table-column class="col-4"
            >${getHeadingLabel(
              this.optionsData,
              'financial_finding_set.title',
              'Title (Category)'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-3"
            >${getHeadingLabel(
              this.optionsData,
              'financial_finding_set.local_amount',
              'Amount (local)'
            )}</etools-data-table-column
          >
          <etools-data-table-column class="col-3"
            >${getHeadingLabel(
              this.optionsData,
              'financial_finding_set.amount',
              'Amount USD'
            )}</etools-data-table-column
          >
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2">${getTableRowIndexText(index)}</span>
                <span class="col-data col-4">${item.title}</span>
                <span class="col-data col-3">${item.local_amount}</span>
                <span class="col-data col-1">${item.amount}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content col-12">
                  <span class="rdc-title"
                    >${getHeadingLabel(this.optionsData, 'financial_finding_set.description', 'Description')}</span
                  >
                  <span>${item.description}</span>
                </div>
                <div class="row-details-content col-12">
                  <span class="rdc-title"
                    >${getHeadingLabel(
                      this.optionsData,
                      'financial_finding_set.recommendation',
                      'Recommendation'
                    )}</span
                  >
                  <span>${item.recommendation}</span>
                </div>
                <div class="row-details-content col-12">
                  <span class="rdc-title">
                    ${getHeadingLabel(this.optionsData, 'financial_finding_set.ip_comments', 'IP comments')}
                  </span>
                  <span>${item.ip_comments}</span>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
          <div slot="row-data" class="layout-horizontal editable-row pl-30">
            <span class="col-data col-2">–</span>
            <span class="col-data col-4">–</span>
            <span class="col-data col-3">–</span>
            <span class="col-data col-1">–</span>
          </div>
        </etools-data-table-row>

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
          ?show-spinner="${this.requestInProcess}"
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
                class="${this._setRequired('financial_finding_set.title', this.optionsData)} validate-input"
                label="${this.getLabel('financial_finding_set.title', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.title', this.optionsData)}"
                .options="${this.titleOptions}"
                option-label="display_name"
                option-value="value"
                .selected="${this.editedItem.title}"
                ?required="${this._setRequired('financial_finding_set.title', this.optionsData)}"
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
              <etools-currency
                class="${this._setRequired('financial_finding_set.local_amount', this.optionsData)} validate-input"
                .value="${this.editedItem.local_amount}"
                currency=""
                label="${this.getLabel('financial_finding_set.local_amount', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.local_amount', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.local_amount', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                ?invalid="${this.errors.local_amount}"
                .errorMessage="${this.errors.local_amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.numberChanged(detail, 'local_amount', this.editedItem)}"
              >
              </etools-currency>
            </div>

            <div class="col col-6">
              <!-- Amount USD -->
              <etools-currency
                class="${this._setRequired('financial_finding_set.amount', this.optionsData)} validate-input"
                .value="${this.editedItem.amount}"
                currency="$"
                label="${this.getLabel('financial_finding_set.amount', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.amount', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.amount', this.optionsData)}"
                ?readonly="${this.requestInProcess}"
                ?invalid="${this.errors.amount}"
                .errorMessage="${this.errors.amount}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'amount', this.editedItem)}"
              >
              </etools-currency>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Description -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.description', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.description}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.description', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.description', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.description', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.description}"
                .errorMessage="${this.errors.description}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'description', this.editedItem)}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- Recommendation -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.recommendation', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.recommendation}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.recommendation', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.recommendation', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.recommendation', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.recommendation}"
                .errorMessage="${this.errors.recommendation}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) =>
                  this.valueChanged(detail, 'recommendation', this.editedItem)}"
              >
              </etools-textarea>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-12">
              <!-- IP comments -->
              <etools-textarea
                class="w100 ${this._setRequired('financial_finding_set.ip_comments', this.optionsData)}
                            fixed-width validate-input"
                .value="${this.editedItem.ip_comments}"
                allowed-pattern="[\\d\\s]"
                label="${this.getLabel('financial_finding_set.ip_comments', this.optionsData)}"
                placeholder="${this.getPlaceholderText('financial_finding_set.ip_comments', this.optionsData)}"
                ?required="${this._setRequired('financial_finding_set.ip_comments', this.optionsData)}"
                ?disabled="${this.requestInProcess}"
                max-rows="4"
                ?invalid="${this.errors.ip_comments}"
                .errorMessage="${this.errors.ip_comments}"
                @focus="${this._resetFieldError}"
                @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'ip_comments', this.editedItem)}"
              >
              </etools-textarea>
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
    if (changedProperties.has('optionsData')) {
      this.setChoices(this.optionsData);
    }
  }

  setChoices(options: AnyObject) {
    const unsortedOptions = getOptionsChoices(options, 'financial_finding_set.title');
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
