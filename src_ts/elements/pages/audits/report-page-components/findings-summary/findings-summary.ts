import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query.js';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';

import {GenericObject} from '../../../../../types/global';

import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import keys from 'lodash-es/keys';
import pick from 'lodash-es/pick';
import transform from 'lodash-es/transform';
import {refactorErrorObject} from '../../../../mixins/error-handler';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import {multiplyWithExchangeRate} from '../../../../utils/utils';

/**
 * @customElement
 * @polymer
 * @appliesMixin  TableElementsMixin
 * @appliesMixin  CommonMethodsMixin
 */
@customElement('findings-summary')
export class FindingsSummary extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} etools-content-panel::part(ecp-content) {
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
        etools-data-table-row *[slot='row-data'] {
          margin-top: 1px;
          margin-bottom: 1px;
        }
        .centered {
          height: 100%;
          justify-content: center;
          display: flex;
          flex-direction: column; 
        }
        .tbl-currency {
          font-weight: 700;
        }
      </style>
      <etools-media-query
        query="(max-width: 1300px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel list panel-title="Summary of Engagement Findings">

        <div class="row">                 
                 <div class="col-12 padding-v">
                   <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                     <etools-data-table-column class="col-2"></etools-data-table-column>
                     <etools-data-table-column class="col-2">Value of Selected FACE</etools-data-table-column>
                     <etools-data-table-column class="col-2">Audited Expenditure</etools-data-table-column>
                     <etools-data-table-column class="col-2 col">Amount of Financial Findings</etools-data-table-column>
                     <etools-data-table-column class="col-2">
                      % of audited Expenditure
                    </etools-data-table-column>
                     <etools-data-table-column class="col-2"></etools-data-table-column>
                   </etools-data-table-header>
                   <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                     <div slot="row-data" class="layout-horizontal">
                       <div class="col-data col-2 no-colon layout-vertical center-align" data-col-header-label="">
                        <label class='tbl-currency centered'>Local currency<label>                        
                      </div>
                       <div class="col-data col-2" data-col-header-label="Value of Selected FACE">
                         <etools-currency
                           class="w100"
                           .value="${this.data?.total_value_local}"
                           placeholder="${this.getPlaceholderText('total_value_local', this.optionsData)}"
                           readonly
                           @focus="${this._resetFieldError}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2" data-col-header-label="Audited Expenditure">
                         <etools-currency
                           class="w100 ${this._setRequired('audited_expenditure_local', this.optionsData)}"
                           .value="${this.data?.audited_expenditure_local}"
                           placeholder="${this.getPlaceholderText('audited_expenditure_local', this.optionsData)}"
                           ?required="${this._setRequired('audited_expenditure_local', this.optionsData)}"
                           ?readonly="${this.isReadOnly('audited_expenditure_local', this.optionsData)}"
                           ?invalid="${this._checkInvalid(this.errors?.audited_expenditure_local)}"
                           .errorMessage="${this.errors?.audited_expenditure_local}"
                           @value-changed="${({detail}: CustomEvent) => {
                             this.numberChanged(detail, 'audited_expenditure_local', this.editedItem);
                             detail.value = multiplyWithExchangeRate(detail.value, this.data.exchange_rate);
                             this.numberChanged(detail, 'audited_expenditure', this.data);
                             this.setPercentOfAuditedExpenditure();
                           }}"
                           @focus="${() => {
                             this._resetFieldError;
                           }}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2 col" data-col-header-label="Amount of Financial Findings">
                         <etools-currency
                           class="w100 ${this._setRequired('financial_findings_local', this.optionsData)}"
                           .value="${this.data?.financial_findings_local}"
                           placeholder="${this.getPlaceholderText('financial_findings_local', this.optionsData)}"
                           ?required="${this._setRequired('financial_findings_local', this.optionsData)}"
                           ?readonly="${this.isReadOnly('financial_findings_local', this.optionsData)}"
                           ?invalid="${this._checkInvalid(this.errors?.financial_findings_local)}"
                           .errorMessage="${this.errors?.financial_findings_local}"
                           @value-changed="${({detail}: CustomEvent) => {
                             this.numberChanged(detail, 'financial_findings_local', this.editedItem);
                             detail.value = multiplyWithExchangeRate(detail.value, this.data.exchange_rate);
                             this.numberChanged(detail, 'financial_findings', this.editedItem);
                           }}"
                           @focus="${() => {
                             this._resetFieldError;
                           }}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2 no-colon layout-vertical center-align" data-col-header-label=""></div>
                       <div class="col-data col-2 no-colon col" data-col-header-label=""></div>
                     </div>
                   </etools-data-table-row>
                   <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                     <div slot="row-data" class="layout-horizontal">
                       <div class="col-data col-2 no-colon layout-vertical center-align" data-col-header-label="">
                        <label class='tbl-currency centered'>USD<label>                          
                       </div>
                       <div class="col-data col-2" data-col-header-label="Value of Selected FACE">
                         <etools-currency
                           class="w100"
                           .value="${this.data?.total_value}"
                           currency="$"
                           placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
                           readonly
                           @focus="${this._resetFieldError}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2" data-col-header-label="Audited Expenditure">
                         <etools-currency
                           class="w100 ${this._setRequired('audited_expenditure', this.optionsData)}"
                           .value="${this.data?.audited_expenditure}"
                           currency="$"
                           placeholder="${this.getPlaceholderText('audited_expenditure', this.optionsData)}"
                           ?required="${this._setRequired('audited_expenditure', this.optionsData)}"
                           ?readonly="${this.isReadOnly('audited_expenditure', this.optionsData)}"
                           ?invalid="${this._checkInvalid(this.errors?.audited_expenditure)}"
                           .errorMessage="${this.errors?.audited_expenditure}"
                           @value-changed="${({detail}: CustomEvent) =>
                             this.numberChanged(detail, 'audited_expenditure', this.editedItem)}"
                           @focus="${() => {
                             this._resetFieldError;
                           }}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2 col" data-col-header-label="Amount of Financial Findings">
                         <etools-currency
                           class="w100 ${this._setRequired('financial_findings', this.optionsData)}"
                           .value="${this.data?.financial_findings}"
                           currency="$"
                           placeholder="${this.getPlaceholderText('financial_findings', this.optionsData)}"
                           ?readonly="${this.isReadOnly('financial_findings', this.optionsData)}"
                           ?invalid="${this._checkInvalid(this.errors?.financial_findings)}"
                           .errorMessage="${this.errors?.financial_findings}"
                           @value-changed="${({detail}: CustomEvent) =>
                             this.numberChanged(detail, 'financial_findings', this.editedItem)}"
                           @focus="${() => {
                             this._resetFieldError;
                           }}"
                         >
                         </etools-currency>
                       </div>
                       <div class="col-data col-2" 
                          data-col-header-label="% of audited Expenditure">
                         <label class="centered">$ ${this.data?.percent_of_audited_expenditure}</label>
                       <div class="col-data col-2 no-colon col" data-col-header-label="&nbsp;"></div>
                     </div>
                     </div>
                   </etools-data-table-row>
                 </div>
                 <div class="col-12 padding-v"></div>
                  <div class="col-12 col-lg-4 col-md-6">
                    <!-- Audit opinion -->
                    <etools-dropdown
                      id="auditOpinionDropDown"
                      class="w100 validate-input ${this._setRequired('audit_opinion', this.optionsData)}"
                      .selected="${this.data.audit_opinion}"
                      label="${this.getLabel('audit_opinion', this.optionsData)}"
                      placeholder="${this.getPlaceholderText('audit_opinion', this.optionsData)}"
                      .options="${this.auditOpinions}"
                      option-label="display_name"
                      option-value="value"
                      ?required="${this._setRequired('audit_opinion', this.optionsData)}"
                      ?readonly="${this.isReadOnly('audit_opinion', this.optionsData)}"
                      ?invalid="${this.errors.audit_opinion}"
                      .errorMessage="${this.errors.audit_opinion}"
                      trigger-value-change-event
                      @etools-selected-item-changed="${({detail}: CustomEvent) =>
                        this.selectedItemChanged(detail, 'audit_opinion', 'value', this.editedItem)}"
                      @focus="${this._resetFieldError}"
                      @click="${this._resetFieldError}"
                      hide-search
                    >
                    </etools-dropdown>
                  </div>
                  <div class="col-12 col-lg-4 col-md-6 input-container">
                   <etools-input
                      class="w100"
                      .value="${this.data.exchange_rate}"
                      label="Exchange rate"
                      placeholder="${this.getNumericPlaceholderText('exchange_rate', this.optionsData)}"
                      readonly
                    >
                    </etools-input>
                  </div>
                 <div class="col-12 col-lg-4 col-md-6 input-container">
                    <!-- Auditor -->
                    <etools-input
                      id="auditorInput"
                      class="w100"
                      .value="${this.data?.number_of_financial_findings}"
                      label="${this.getLabel('number_of_financial_findings', this.optionsData)}"
                      placeholder="${this.getNumericPlaceholderText('number_of_financial_findings', this.optionsData)}"
                      readonly
                    >
                    </etools-input>
                  </div>
                  <div class="col-12 col-lg-4 col-md-6 input-container">
                    <!-- Auditor -->
                    <etools-input
                      id="auditorInput"
                      class="w100"
                      .value="${this.data.key_internal_weakness?.high_risk_count}"
                      label="${this.getLabel('key_internal_weakness.high_risk_count', this.optionsData)}"
                      placeholder="${this.getNumericPlaceholderText(
                        'key_internal_weakness.high_risk_count',
                        this.optionsData
                      )}"
                      readonly
                    >
                    </etools-input>
                  </div>
                  <div class="col-12 col-lg-4 col-md-6 input-container">
                    <!-- Auditor -->
                    <etools-input
                      id="auditorInput"
                      class="w100"
                      .value="${this.data.key_internal_weakness?.medium_risk_count}"
                      label="${this.getLabel('key_internal_weakness.medium_risk_count', this.optionsData)}"
                      placeholder="${this.getNumericPlaceholderText(
                        'key_internal_weakness.medium_risk_count',
                        this.optionsData
                      )}"
                      readonly
                    >
                    </etools-input>
                  </div>
                  <div class="col-12 col-lg-4 col-md-6 input-container">
                    <!-- Auditor -->
                    <etools-input
                      id="auditorInput"
                      class="w100"
                      .value="${this.data?.key_internal_weakness?.low_risk_count}"
                      label="${this.getLabel('key_internal_weakness.low_risk_count', this.optionsData)}"
                      placeholder="${this.getNumericPlaceholderText(
                        'key_internal_weakness.low_risk_count',
                        this.optionsData
                      )}"
                      readonly
                    >
                    </etools-input>
                  </div>
               </div>
      </etools-content-panel>
    `;
  }

  @property({type: String})
  mainProperty = 'financial_findings';

  @property({type: Object})
  itemModel: GenericObject = {
    audited_expenditure_local: undefined,
    audit_opinion: undefined,
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

  @property({type: Object})
  originalData!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this.fundingsSummaryErrHandler(this.errorObject);
    }
    if (changedProperties.has('data')) {
      this._setDataItems();
      this._setAuditOpinion(this.data.audit_opinion, this.auditOpinions);
    }
  }

  _checkInvalid(value) {
    return !!value;
  }

  _setDataItems() {
    this.auditOpinions = getOptionsChoices(this.optionsData, 'audit_opinion');
    if (this.data.percent_of_audited_expenditure) {
      this.data.percent_of_audited_expenditure = Number(this.data.percent_of_audited_expenditure).toFixed(2);
    }
    this.editedItem = cloneDeep(this.itemModel);
  }

  getFindingsSummaryData() {
    if (isEqual(this.editedItem, this.itemModel)) {
      return;
    }

    let itemModelKeys = keys(this.itemModel) || [];

    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });

    const data = pick(this.editedItem, itemModelKeys);
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
    if (!errorData || !Object.keys(errorData).length) {
      return;
    }

    const refactoredData = refactorErrorObject(errorData);
    this.errors = refactoredData;
  }

  getLocalLabel(path, base) {
    return String(this.getLabel(path, base));
  }

  setPercentOfAuditedExpenditure() {
    this.data.percent_of_audited_expenditure = (
      (100 * this.data.financial_findings) /
      this.data.audited_expenditure
    ).toFixed(2);
  }
}
