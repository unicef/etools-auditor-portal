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
import {multiplyWithExchangeRate, toggleCssClass} from '../../../../utils/utils';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('findings-summary-sc')
export class FindingsSummarySC extends CommonMethodsMixin(ModelChangedMixin(DateMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host etools-currency {
          width: 100%;
          text-align: end;
        }
        etools-currency::part(input) {
          text-align: end;
        }
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
        .align-start {
          align-items: start;
        }
        .h-50 {
          min-height: 50px;
        }
        .pr-20 {
          padding-inline-end: 20px !important;
        }
      </style>

      <etools-media-query
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <etools-content-panel
        class="content-section clearfx"
        panel-title="Summary of Engagement Findings"
        show-expand-btn
      >
        <div class="row">
          <div class="col-12 col-lg-9 padding-v">
            <etools-data-table-header no-title no-collapse>
              <etools-data-table-column class="col-4"></etools-data-table-column>
              <etools-data-table-column class="col-4 align-center" ?hidden="${this.data?.prior_face_forms}">
                Local currency
              </etools-data-table-column>
              <etools-data-table-column
                class="align-center ${toggleCssClass(this.data?.prior_face_forms, 'col-8', 'col-4')}"
              >
                USD
              </etools-data-table-column>
            </etools-data-table-header>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">Value of Selected FACE</div>
                <div class="col-data col-4 no-colon" ?hidden="${this.data?.prior_face_forms}">
                  <etools-currency
                    class="w100"
                    .value="${this.data?.total_value_local}"
                    placeholder="${this.getPlaceholderText('total_value_local', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data no-colon ${toggleCssClass(this.data?.prior_face_forms, 'col-8', 'col-4')}">
                  <etools-currency
                    class="w100"
                    .value="${this.data?.total_value}"
                    placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">Total Amount Tested</div>
                <div class="col-data col-4 no-colon" ?hidden="${this.data?.prior_face_forms}">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_tested_local', this.optionsData)}"
                    .value="${this.data?.total_amount_tested_local}"
                    placeholder="${this.getPlaceholderText('total_amount_tested_local', this.optionsData)}"
                    ?required="${this._setRequired('total_amount_tested_local', this.optionsData)}"
                    ?readonly="${this.isReadOnly('total_amount_tested_local', this.optionsData)}"
                    ?invalid="${this._checkInvalid(this.errors?.total_amount_tested_local)}"
                    .errorMessage="${this.errors?.total_amount_tested_local}"
                    @value-changed="${({detail}: CustomEvent) => {
                      if (
                        this.data?.prior_face_forms ||
                        Number(this.data?.total_amount_tested_local) === Number(detail?.value)
                      ) {
                        return;
                      }
                      this.numberChanged(detail, 'total_amount_tested_local', this.data);
                      detail.value = multiplyWithExchangeRate(detail.value, this.data.exchange_rate);
                      this.numberChanged(detail, 'total_amount_tested', this.data);
                      this.setPercentExpenditure();
                    }}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data no-colon ${toggleCssClass(this.data?.prior_face_forms, 'col-8', 'col-4')}">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_tested', this.optionsData)}"
                    .value="${this.data?.total_amount_tested}"
                    placeholder="${this.getPlaceholderText('total_amount_tested', this.optionsData)}"
                    ?required="${this._setRequired('total_amount_tested', this.optionsData)}"
                    ?readonly="${this.isReadOnly('total_amount_tested', this.optionsData)}"
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
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">Total Amount of Ineligible Expenditure</div>
                <div class="col-data col-4 no-colon col" ?hidden="${this.data?.prior_face_forms}">
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
                      if (
                        this.data?.prior_face_forms ||
                        Number(this.data?.total_amount_of_ineligible_expenditure_local) === Number(detail?.value)
                      ) {
                        return;
                      }
                      this.numberChanged(detail, 'total_amount_of_ineligible_expenditure_local', this.data);
                      detail.value = multiplyWithExchangeRate(detail.value, this.data.exchange_rate);
                      this.numberChanged(detail, 'total_amount_of_ineligible_expenditure', this.data);
                    }}"
                    @focus="${() => {
                      this._resetFieldError;
                    }}"
                  >
                  </etools-currency>
                </div>
                <div class="col-data col no-colon ${toggleCssClass(this.data?.prior_face_forms, 'col-8', 'col-4')}">
                  <etools-currency
                    class="w100 ${this._setRequired('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    .value="${this.data?.total_amount_of_ineligible_expenditure}"
                    placeholder="${this.getPlaceholderText('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    ?readonly="${this.isReadOnly('total_amount_of_ineligible_expenditure', this.optionsData)}"
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
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">% of audited Expenditure</div>
                <div class="col-data col-4" ?hidden="${this.data?.prior_face_forms}">&nbsp;</div>
                <div
                  class="col-data align-right pr-20 ${toggleCssClass(this.data?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <label>${this.data?.percent_of_audited_expenditure}</label>
                </div>
              </div>
            </etools-data-table-row>
          </div>
          <div class="col-12 col-lg-3 padding-v row">
            <div class="col-12 input-container align-start">
              <etools-info-tooltip ?hidden="${this.data?.prior_face_forms}">
                <etools-input
                  slot="field"
                  class="w100"
                  .value="${this.data.exchange_rate}"
                  label="Exchange rate"
                  placeholder="${this.getNumericPlaceholderText('exchange_rate', this.optionsData)}"
                  readonly
                >
                </etools-input>
                <span slot="message">
                  If there is multi-currency: the rate of the recently reported expense excluding the USD.<br />
                  If it is only USD: then the rate will be 1.
                </span>
              </etools-info-tooltip>
            </div>
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

  getFindingsSummarySCData() {
    return pickBy(this.data, (value, key) => {
      return (
        ~[
          'total_amount_tested_local',
          'total_amount_tested',
          'total_amount_of_ineligible_expenditure_local',
          'total_amount_of_ineligible_expenditure'
        ].indexOf(key) && value !== (this.originalData ? this.originalData[key] : undefined)
      );
    });
  }

  _checkInvalid(value) {
    return !!value;
  }

  setPercentExpenditure() {
    if (!this.data.total_amount_tested_local) {
      this.data.percent_of_audited_expenditure = Number(0).toFixed(2);
      return;
    }
    this.data.percent_of_audited_expenditure = (
      (100 * this.data.total_amount_of_ineligible_expenditure_local) / this.data.total_amount_tested_local || 0
    ).toFixed(2);
  }
}
