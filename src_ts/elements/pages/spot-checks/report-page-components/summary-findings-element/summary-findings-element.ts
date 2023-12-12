import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import './summary-findings-dialog';

import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import DateMixin from '../../../../mixins/date-mixin';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {GenericObject} from '../../../../../types/global';

import find from 'lodash-es/find';
import each from 'lodash-es/each';
import isObject from 'lodash-es/isObject';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqualWith from 'lodash-es/isEqualWith';
import cloneWith from 'lodash-es/cloneWith';
import {getHeadingLabel, getOptionsChoices} from '../../../../mixins/permission-controller';
import {getTableRowIndexText} from '../../../../utils/utils';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @LitEelement
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin DateMixin
 */
@customElement('summary-findings-element')
export class SummaryFindingsElement extends CommonMethodsMixin(
  TableElementsMixin(DateMixin(ModelChangedMixin(LitElement)))
) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          .repeatable-item-container[without-line] {
            min-width: 0 !important;
            margin-bottom: 0 !important;
          }

          .confirm-text {
            padding: 5px 86px 0 23px !important;
          }
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        datepicker-lite::part(dp-calendar) {
          position: fixed;
        }
        .mt-30 {
          margin-top: 30px;
        }
        etools-content-panel.high::part(ecp-header) {
          background-color: var(--module-warning) !important;
        }
        etools-dropdown,
        etools-dropdown-multi {
          --esmm-external-wrapper: {
            max-width: 100%;
          }
        }
        etools-data-table-row *[slot='row-data-details'] {
          flex-direction: column;
        }
      </style>

      <etools-content-panel
        list
        class="content-section clearfix ${this.itemModel?.priority || ''}"
        panel-title="Summary of ${this.priority?.display_name} Priority Findings and Recommendations"
      >
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-3">Finding Number</etools-data-table-column>
          <etools-data-table-column class="col-6">
            ${getHeadingLabel(this.optionsData, 'findings.category_of_observation', 'Subject Area')}
          </etools-data-table-column>
          <etools-data-table-column class="col-3">
            ${getHeadingLabel(this.optionsData, 'findings.deadline_of_action', 'Deadline of Action')}
          </etools-data-table-column>
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) =>
            html`
              <etools-data-table-row>
                <div slot="row-data" class="layout-horizontal editable-row">
                  <span class="col-data col-3">${getTableRowIndexText(index)}</span>
                  <span class="col-data col-6">${this.getCategoryDisplayName(item.category_of_observation, '--')}</span>
                  <span class="col-data col-3">${item.deadline_of_action}</span>
                  <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                    <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                    <etools-icon-button
                      name="delete"
                      @click="${() => this.openDeleteDialog(index)}"
                    ></etools-icon-button>
                  </div>
                </div>

                <div slot="row-data-details">
                  <div class="row-details-content col-12">
                    <span class="rdc-title">
                      ${getHeadingLabel(this.optionsData, 'findings.recommendation', 'Recommendation')}
                    </span>
                    <span>${item.recommendation}</span>
                  </div>
                  <div class="row-details-content col-12 mt-30">
                    <span class="rdc-title">
                      ${getHeadingLabel(this.optionsData, 'findings.agreed_action_by_ip', 'Agreed Action by IP')}
                    </span>
                    <span>${item.agreed_action_by_ip}</span>
                  </div>
                </div>
              </etools-data-table-row>
            `
        )}
        <etools-data-table-row no-collapse ?hidden="${(this.dataItems || []).some((item) => this._showFindings(item))}">
          <div slot="row-data" class="layout-horizontal editable-row pl-30">
            <span class="col-data col-3">–</span>
            <span class="col-data col-6">–</span>
            <span class="col-data col-3">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  categoryOfObservation: any[] = [];

  @property({type: Array})
  dataItems: any[] = [];

  @property({type: String})
  mainProperty = 'findings';

  @property({type: Object})
  itemModel: GenericObject = {};

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Finding'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Finding'};

  @property({type: Object})
  priority: GenericObject = {};

  @property({type: String})
  errorBaseText!: string;

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'summary-findings-dialog';

    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.addEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
    this.errors.deadline_of_action = false;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
    this.removeEventListener('show-add-dialog', this.openAddEditDialog as any);
    this.removeEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('itemModel') || changedProperties.has('priority')) {
      this._setPriority(this.itemModel, this.priority);
    }
    if (changedProperties.has('priority')) {
      this.setErrorBaseText(this.priority);
    }
    if (changedProperties.has('errorObject')) {
      this._complexErrorHandler(this.errorObject.findings);
    }
    if (changedProperties.has('optionsData')) {
      this.setCategoryOfObservation(this.optionsData);
    }
  }

  openAddEditDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        dialogTitle: this.dialogTitle,
        confirmBtnText: this.confirmBtnText,
        categoryOfObservation: this.categoryOfObservation
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

  setCategoryOfObservation(options: AnyObject) {
    this.categoryOfObservation = options ? getOptionsChoices(options, 'findings.category_of_observation') : [];
  }

  setErrorBaseText(priority) {
    if (!priority) {
      this.errorBaseText = '';
    }
    this.errorBaseText = `Summary of ${this.priority.display_name} Priority Findings and Recommendations: `;
  }

  getCategoryDisplayName(value, emptyValue) {
    const categoryOfObservation = find(this.categoryOfObservation, ['value', value]);
    return categoryOfObservation ? categoryOfObservation.display_name : emptyValue || '';
  }

  _setPriority(itemModel, priority) {
    itemModel.priority = priority.value;
  }

  _showFindings(item) {
    return this._showItems(item) && item.priority === this.priority.value;
  }

  getFindingsData() {
    if ((this.isAddDialogOpen || this.isConfirmDialogOpen) && !this.saveWithButton) {
      return this.getCurrentData();
    }
    const data: any[] = [];
    each(this.dataItems, (item, index) => {
      if (item.priority !== this.priority.value) {
        return;
      }
      if (!item.deadline_of_action) {
        item.deadline_of_action = null;
      }
      let dataItem;
      if (isObject(item.category_of_observation)) {
        const preparedItem = cloneDeep(item);
        preparedItem.category_of_observation = item.category_of_observation.value;
        dataItem = preparedItem;
      } else {
        dataItem = item;
      }
      const compareItems = (changedObj, originalObj) => {
        // eslint-disable-next-line
        return !(
          (changedObj.category_of_observation &&
            changedObj.category_of_observation !== originalObj.category_of_observation) ||
          (changedObj.deadline_of_action && changedObj.deadline_of_action !== originalObj.deadline_of_action) ||
          (changedObj.recommendation && changedObj.recommendation !== originalObj.recommendation) ||
          (changedObj.agreed_action_by_ip && changedObj.agreed_action_by_ip !== originalObj.agreed_action_by_ip)
        );
      };
      if (!isEqualWith(dataItem, this.originalData[index] || {}, compareItems)) {
        data.push(dataItem);
      }
    });
    return data && data.length ? data : null;
  }

  getCurrentData() {
    if (!this.isAddDialogOpen && !this.isConfirmDialogOpen) {
      return null;
    }
    if (!this.validate()) {
      return null;
    }
    const data = cloneWith(this.editedItem, (item) => {
      if (item.category_of_observation && item.category_of_observation.value) {
        item.category_of_observation = item.category_of_observation.value;
      }
      return item;
    });
    data.priority = this.priority.value;
    return [data];
  }
}
