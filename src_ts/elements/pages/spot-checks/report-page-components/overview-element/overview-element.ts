/* eslint-disable max-len */
import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import DateMixin from '../../../../mixins/date-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '../../../../../types/global';
import pickBy from 'lodash-es/pickBy';
import {multiplyWithExchangeRate} from '../../../../utils/utils';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('overview-element')
export class OverviewElement extends CommonMethodsMixin(ModelChangedMixin(DateMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>${dataTableStylesLit} 
        .red {
          color: red;
          font-size: 12px;
          margin-bottom: -8px;
          padding-inline-start: 12px;
        }
        .flex-column {
          display: flex;
          flex-direction: column;
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
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <etools-content-panel class="content-section clearfx" panel-title="Summary of Engagement Findings">
        <div class="row">
          <div class="col-12 padding-v">
            <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <etools-data-table-column class="col-2"></etools-data-table-column>
              <etools-data-table-column class="col-2">Value of Selected FACE</etools-data-table-column>
              <etools-data-table-column class="col-2">Total Amount Tested</etools-data-table-column>
              <etools-data-table-column class="col-2 col">Amount of Financial Findings</etools-data-table-column>
              <etools-data-table-column class="col-2 center-align">& of audited Expenditure</etools-data-table-column>
              <etools-data-table-column class="col-2"></etools-data-table-column>
            </etools-data-table-header>
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal">
                <div class="col-data col-2 layout-vertical center-align" data-col-header-label="Engagement Type"><label class='tbl-currency centered'>Local currency<label></div>
                <div class="col-data col-2" data-col-header-label="Date">
                  <etools-currency
                    class="w100"
                    .value="${this.data?.total_value_local}"
                    placeholder="${this.getPlaceholderText('total_value_local', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col-2" data-col-header-label="Amount Tested">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_tested_local', this.optionsData)}"
                    .value="${this.data?.total_amount_tested_local}"
                    placeholder="${this.getPlaceholderText('total_amount_tested_local', this.optionsData)}"
                    ?required="${this._setRequired('total_amount_tested_local', this.optionsData)}"
                    ?readonly="${this.isReadOnly('total_amount_tested_local', this.optionsData)}"
                    ?invalid="${this._checkInvalid(this.errors?.total_amount_tested_local)}"
                    .errorMessage="${this.errors?.total_amount_tested_local}"
                    @value-changed="${({detail}: CustomEvent) => {
                      this.numberChanged(detail, 'total_amount_tested_local', this.data);
                      detail.value = multiplyWithExchangeRate(detail.value, this.engagement.exchange_rate);
                      this.numberChanged(detail, 'total_amount_tested', this.data);
                    }}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col-2 col" data-col-header-label="Financial Findings">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_of_ineligible_expenditure_local', this.optionsData)}"
                    .value="${this.data?.total_amount_of_ineligible_expenditure_local}"
                    placeholder="${this.getPlaceholderText(
                      'total_amount_of_ineligible_expenditure_local',
                      this.optionsData
                    )}"
                    ?required="${this._setRequired('total_amount_of_ineligible_expenditure_local', this.optionsData)}"
                    ?readonly="${this.isReadOnly('total_amount_of_ineligible_expenditure_local', this.optionsData)}"
                    ?invalid="${this._checkInvalid(this.errors?.total_amount_of_ineligible_expenditure_local)}"
                    .errorMessage="${this.errors?.total_amount_of_ineligible_expenditure_local}"
                    @value-changed="${({detail}: CustomEvent) => {
                      this.numberChanged(detail, 'total_amount_of_ineligible_expenditure_local', this.data);
                      detail.value = multiplyWithExchangeRate(detail.value, this.engagement.exchange_rate);
                      this.numberChanged(detail, 'total_amount_of_ineligible_expenditure', this.data);
                    }}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col-2 layout-vertical center-align" data-col-header-label="Engagement Type"></div>
                <div class="col-data col-2 col"></div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data" class="layout-horizontal">
              <div class="col-data col-2 layout-vertical center-align" data-col-header-label="Engagement Type"><label class='tbl-currency centered'>USD<label></div>
                <div class="col-data col-2" data-col-header-label="Date">
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
                <div class="col-data col-2" data-col-header-label="Amount Tested">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_tested', this.optionsData)}"
                    .value="${this.data?.total_amount_tested}"
                    currency="$"
                    placeholder="${this.getPlaceholderText('total_amount_tested', this.optionsData)}"
                    ?required="${this._setRequired('total_amount_tested', this.optionsData)}"
                    readonly
                    ?invalid="${this._checkInvalid(this.errors?.total_amount_tested)}"
                    .errorMessage="${this.errors?.total_amount_tested}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.numberChanged(detail, 'total_amount_tested', this.data)}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col-2 col" data-col-header-label="Financial Findings">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    .value="${this.data?.total_amount_of_ineligible_expenditure}"
                    currency="$"
                    placeholder="${this.getPlaceholderText('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    readonly
                    ?invalid="${this._checkInvalid(this.errors?.total_amount_of_ineligible_expenditure)}"
                    .errorMessage="${this.errors?.total_amount_of_ineligible_expenditure}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.numberChanged(detail, 'total_amount_of_ineligible_expenditure', this.data)}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col-2 layout-vertical center-align" data-col-header-label="Pending Unsupported Amount">
                  <label class="centered">$ ${(this.data?.total_amount_tested || 0 / this.data?.total_amount_of_ineligible_expenditure || 0).toFixed(2)}</label>
                <div class="col-data col-2 col"></div>
              </div>
            </etools-data-table-row>
          </div>
        </div>
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  errors!: GenericObject;

  @property({type: Boolean})
  datepickerModal = false;

  @property({type: Boolean})
  showUSDWarning = false;

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Audit Overview',
    fields: [
      'total_value',
      'total_value_local',
      'total_amount_tested',
      'total_amount_tested_local',
      'total_amount_of_ineligible_expenditure',
      'total_amount_of_ineligible_expenditure_local'
    ]
  };

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
  }

  getOverviewData() {
    return pickBy(this.data, (value, key) => {
      return (
        ~[
          'total_value',
          'total_value_local',
          'total_amount_tested',
          'total_amount_tested_local',
          'total_amount_of_ineligible_expenditure',
          'total_amount_of_ineligible_expenditure_local'
        ].indexOf(key) && value !== (this.originalData ? this.originalData[key] : undefined)
      );
    });
  }

  _checkInvalid(value) {
    return !!value;
  }
}
