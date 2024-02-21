import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import './findings-summary-dialog';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';

import {GenericObject} from '../../../../../types/global';

import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import keys from 'lodash-es/keys';
import pick from 'lodash-es/pick';
import transform from 'lodash-es/transform';
import values from 'lodash-es/values';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {refactorErrorObject} from '../../../../mixins/error-handler';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @customElement
 * @polymer
 * @appliesMixin  TableElementsMixin
 * @appliesMixin  CommonMethodsMixin
 */
@customElement('findings-summary')
export class FindingsSummary extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        .row-h {
          margin-bottom: 0;
        }
        .input-container {
          height: 75px;
        }
        .wrap {
          flex-wrap: wrap;
        }
        .layout-horizontal {
          flex-flow: wrap;
        }
        .col:not(:first-of-type) {
          padding-inline-start: 0px !important;
        }
        etools-input::part(readonly-input) {
          text-wrap: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>

      <etools-content-panel list panel-title="Summary of Audit Findings">
        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-2">IP name</etools-data-table-column>
          <etools-data-table-column class="col-1">Audited Expenditure $</etools-data-table-column>
          <etools-data-table-column class="col-1">Financial Findings $</etools-data-table-column>
          <etools-data-table-column class="col-1">Audited Expenditure</etools-data-table-column>
          <etools-data-table-column class="col-1">Financial Findings</etools-data-table-column>
          <etools-data-table-column class="col-1">% Of Audited Expenditure</etools-data-table-column>
          <etools-data-table-column class="col-1">Audit Opinion</etools-data-table-column>
          <etools-data-table-column class="col-1">No. of Financial Findings</etools-data-table-column>
          <etools-data-table-column class="col-1">High Risk</etools-data-table-column>
          <etools-data-table-column class="col-1">Medium Risk</etools-data-table-column>
          <etools-data-table-column class="col-1">Low Risk</etools-data-table-column>
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-2 text-ellipsis">${item.partner.name}</span>
                <span class="col-data col-1">${item.audited_expenditure}</span>
                <span class="col-data col-1">${item.financial_findings}</span>
                <span class="col-data col-1">${item.audited_expenditure_local}</span>
                <span class="col-data col-1">${item.financial_findings_local}</span>
                <span class="col-data col-1">${item.percent_of_audited_expenditure}</span>
                <span class="col-data col-1">${item.display_name}</span>
                <span class="col-data col-1">${item.number_of_financial_findings}</span>
                <span class="col-data col-1">${item.key_internal_weakness.high_risk_count}</span>
                <span class="col-data col-1">${item.key_internal_weakness.medium_risk_count}</span>
                <span class="col-data col-1">${item.key_internal_weakness.low_risk_count}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
          <div slot="row-data" class="layout-horizontal editable-row">
            <span class="col-data col-2">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
            <span class="col-data col-1">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  mainProperty = 'financial_findings';

  @property({type: Object})
  itemModel: GenericObject = {
    audited_expenditure: undefined,
    financial_findings: undefined,
    audited_expenditure_local: undefined,
    financial_findings_local: undefined,
    audit_opinion: undefined,
    partner: {
      name: undefined
    },
    opinion: {}
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Summary of audit findings'
  };

  @property({type: Array})
  auditOpinions: any[] = [];

  @property({type: Object})
  data: GenericObject = {};

  @property({type: Boolean})
  showLocalCurrency = false;

  @property({type: Array})
  headerColumns!: GenericObject[];

  @property({type: Array})
  columns!: GenericObject[];

  @property({type: Array})
  defaultColumns: GenericObject[] = [
    {
      size: 20,
      label: 'IP name',
      path: 'partner.name'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Audited Expenditure $ ',
      path: 'audited_expenditure',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Financial Findings $ ',
      path: 'financial_findings',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Audited Expenditure ',
      path: 'audited_expenditure_local',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Financial Findings ',
      path: 'financial_findings_local',
      align: 'right'
    },
    {
      size: 12,
      name: 'percents',
      label: '% Of Audited Expenditure',
      path: 'percent_of_audited_expenditure',
      align: 'right'
    },
    {
      size: 12,
      label: 'Audit Opinion',
      labelPath: 'audit_opinion',
      path: 'display_name',
      align: 'center'
    },
    {
      size: '80px',
      label: 'No. of Financial Findings',
      path: 'number_of_financial_findings',
      align: 'center'
    },
    {
      size: '60px',
      label: 'High Risk',
      path: 'key_internal_weakness.high_risk_count',
      align: 'center'
    },
    {
      size: '60px',
      label: 'Medium Risk',
      path: 'key_internal_weakness.medium_risk_count',
      align: 'center'
    },
    {
      size: '60px',
      label: 'Low Risk',
      path: 'key_internal_weakness.low_risk_count',
      align: 'center'
    }
  ];

  @property({type: Object})
  colSizesWithoutLocal: GenericObject = {
    audited_expenditure: 20,
    financial_findings: 15,
    display_name: 20
  };

  @property({type: Object})
  originalData!: GenericObject;

  connectedCallback() {
    super.connectedCallback();
    this.dialogKey = 'findings-summary-dialog';

    this.setColumnsAndHeaders();
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.addEventListener('show-edit-dialog', this.openAddEditDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this.fundingsSummaryErrHandler(this.errorObject);
    }
    if (changedProperties.has('data')) {
      this._setDataItems();
      this._setAuditOpinion(this.data.audit_opinion, this.auditOpinions);
      this.currencyChanged();
    }
  }

  setColumnsAndHeaders() {
    // if local currency it's not used, local columns will not be displayed
    // and the size of some displayed columns will be increased
    let columns = cloneDeep(this.defaultColumns);
    if (!this.showLocalCurrency) {
      columns = columns.filter((col: GenericObject) => {
        if (this.colSizesWithoutLocal[col.path]) {
          col.size = this.colSizesWithoutLocal[col.path];
        }
        return col.path !== 'audited_expenditure_local' && col.path !== 'financial_findings_local';
      });
    }

    this.columns = columns;
    const headerColumns = cloneDeep(columns);
    const group = headerColumns.slice(-3);
    const groupColumn = {
      group: true,
      label: 'No. of Key Control Weaknesses',
      align: 'center',
      size: '180px',
      columns: group
    };
    // for local currency columns need to avoid list-header logic of setting labels and set htmlLabel property for this
    if (this.showLocalCurrency) {
      headerColumns
        .filter((h) => h.path === 'financial_findings_local' || h.path === 'audited_expenditure_local')
        .forEach((h) => (h.htmlLabel = this.getLocalLabel(h.path, this.optionsData)));
    }
    this.headerColumns = headerColumns.slice(0, -3).concat([groupColumn]);
  }

  openAddEditDialog() {
    openDialog({
      dialog: this.dialogKey,
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedItem: this.editedItem,
        dialogTitle: this.dialogTitle,
        auditOpinions: this.auditOpinions,
        currency: this.data.currency_of_report,
        showLocalCurrency: this.showLocalCurrency
      }
    }).then(() => (this.isAddDialogOpen = false));
  }

  _setDataItems() {
    this.setShowLocalCurrency();
    this.auditOpinions = getOptionsChoices(this.optionsData, 'audit_opinion');
    if (this.data.percent_of_audited_expenditure) {
      this.data.percent_of_audited_expenditure = Number(this.data.percent_of_audited_expenditure).toFixed(2);
    }
    this.dataItems = [this.data];
    // reset editem item
    this.editedItem = cloneDeep(this.itemModel);
  }

  getFindingsSummaryData() {
    if (isEqual(this.editedItem, this.itemModel)) {
      return;
    }

    let itemModelKeys = keys(this.itemModel) || [];
    let data: any;

    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });

    if (this.isAddDialogOpen) {
      data = pick(this.editedItem, itemModelKeys);
    } else {
      data = pick(this.originalData && this.originalData[0], itemModelKeys);
    }
    const originalData = pick(this.originalData && this.originalData[0], itemModelKeys);

    if (!isEqual(data, originalData)) {
      // return only changed values
      return transform(
        data,
        function (result, value, key) {
          // @ts-ignore
          if (value !== originalData[key]) {
            result[key] = value;
          }
        },
        {}
      );
    }
  }

  _setAuditOpinion(auditOpinionValue, auditOpinions) {
    if (auditOpinions && auditOpinions.length > 0) {
      const auditOpinion =
        auditOpinions.find(function (auditOpinion) {
          return auditOpinion.value === auditOpinionValue;
        }) || {};
      this.data.opinion = auditOpinion;
      this.data.display_name = auditOpinion.display_name;
    }
  }

  fundingsSummaryErrHandler(errorData) {
    this.requestInProcess = false;
    if (!errorData) {
      return;
    }

    const refactoredData = refactorErrorObject(errorData);
    let itemModelKeys = keys(this.itemModel) || [];
    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });
    const findingsSummaryErrors = pick(refactoredData, itemModelKeys);

    if (!this.isAddDialogOpen && values(findingsSummaryErrors).length) {
      fireEvent(this, 'toast', {text: 'Please fill in the Summary of Audit Findings.'});
    } else {
      this.errors = refactoredData;
    }
  }

  currencyChanged() {
    const prevShowLocalCurrency = this.showLocalCurrency;
    this.setShowLocalCurrency();
    if (prevShowLocalCurrency != this.showLocalCurrency) {
      this.setColumnsAndHeaders();
    }
  }

  setShowLocalCurrency() {
    this.showLocalCurrency =
      this.data.currency_of_report !== undefined &&
      this.data.currency_of_report !== '' &&
      this.data.currency_of_report !== 'USD';
  }

  getLocalLabel(path, base) {
    return String(this.getLabel(path, base));
  }
}
