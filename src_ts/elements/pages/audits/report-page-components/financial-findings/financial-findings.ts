import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';

import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
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
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import './financial-findings-dialog.js';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @customElement
 * @LitElement
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('financial-findings')
export class FinancialFindings extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
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
        etools-data-table-row *[slot='row-data-details'] {
          flex-direction: column;
        }
        .row-details-content.col-12 {
          margin-bottom: 30px;
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
        .panelTitle="${this.getLabel('financial_finding_set', this.optionsData)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title .lowResolutionLayout="${this.lowResolutionLayout}">
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
            <etools-data-table-row .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2" data-col-header-label="Finding Number"
                  >${getTableRowIndexText(index)}</span
                >
                <span
                  class="col-data col-4"
                  data-col-header-label="${getHeadingLabel(
                    this.optionsData,
                    'financial_finding_set.title',
                    'Title (Category)'
                  )}"
                  >${item.title}</span
                >
                <span
                  class="col-data col-3"
                  data-col-header-label="${getHeadingLabel(
                    this.optionsData,
                    'financial_finding_set.local_amount',
                    'Amount (local)'
                  )}"
                  >${item.local_amount}</span
                >
                <span
                  class="col-data col-1"
                  data-col-header-label="${getHeadingLabel(
                    this.optionsData,
                    'financial_finding_set.amount',
                    'Amount USD'
                  )}"
                  >${item.amount}</span
                >
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
          <div slot="row-data" class="layout-horizontal editable-row pl-30 padding-v">
            <span class="col-data col-12">No records found.</span>
          </div>
        </etools-data-table-row>
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

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'financial-findings-dialog';
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject.financial_finding_set, this.errorObject);
      this._checkNonField(this.errorObject.financial_finding_set);
    }
    if (changedProperties.has('optionsData')) {
      this.setChoices(this.optionsData);
    }
  }

  openAddEditDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        opener: this,
        dialogTitle: this.dialogTitle,
        titleOptions: this.titleOptions
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
