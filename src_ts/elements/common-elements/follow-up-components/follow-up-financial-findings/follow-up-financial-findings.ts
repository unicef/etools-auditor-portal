import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import pickBy from 'lodash-es/pickBy';
import each from 'lodash-es/each';

import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getOptionsChoices} from '../../../mixins/permission-controller';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '../../../../types/global';
import {AnyObject} from '@unicef-polymer/etools-types';
import {divideWithExchangeRate, toggleCssClass} from '../../../utils/utils';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
@customElement('follow-up-financial-findings')
export class FollowUpFinancialFindings extends CommonMethodsMixin(ModelChangedMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          position: relative;
          margin-bottom: 24px;
          display: block;
        }
        etools-currency {
          width: 100%;
          text-align: end;
        }
        .input-container {
          display: flex;
        }
        .flex-column {
          display: flex;
          flex-direction: column;
        }
        .align-top {
          align-items: start;
        }
        etools-data-table-row *[slot='row-data'] {
          margin-top: 1px;
          margin-bottom: 1px;
        }
        .tbl-currency {
          font-weight: 700;
          height: 100%;
          justify-content: center;
          display: flex;
          flex-direction: column;
        }
        .h-50 {
          min-height: 50px;
        }
        etools-data-table-column::part(edt-list-column-label) {
          line-height: 14px;
        }
        etools-currency::part(input) {
          text-align: end;
        }
        *[slot='row-data'] .col-data.align-right {
          text-align: end;
        }
      </style>

      <etools-content-panel panel-title="Financial Findings" show-expand-btn>
        <div class="row">
          <div class="col-12 col-lg-9 padding-v">
            <etools-data-table-header no-title no-collapse>
              <etools-data-table-column class="col-4"></etools-data-table-column>
              <etools-data-table-column class="col-4 align-center" ?hidden="${this.engagement?.prior_face_forms}">
                Local currency
              </etools-data-table-column>
              <etools-data-table-column
                class="align-center ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >USD</etools-data-table-column
              >
            </etools-data-table-header>

            <etools-data-table-row no-collapse ?hidden="${!this.showFields(this.engagement.engagement_type, 'audit')}">
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('audited_expenditure', this.optionsData)}
                </div>
                <div class="col-data col-4 align-right" ?hidden="${this.engagement?.prior_face_forms}">
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.audited_expenditure_local}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.audited_expenditure}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>

            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4" ?hidden="${!this.showFields(this.engagement.engagement_type, 'audit')}">
                  ${this.getLabelWithoutCurrency('financial_findings', this.optionsData)}
                </div>
                <div class="col-data col-4" ?hidden="${!this.showFields(this.engagement.engagement_type, 'sc')}">
                  ${this.getLabelWithoutCurrency('total_amount_tested', this.optionsData)}
                </div>
                <div
                  class="col-data col-4 align-right"
                  ?hidden="${this.engagement?.prior_face_forms ||
                  !this.showFields(this.engagement.engagement_type, 'audit')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.financial_findings_local}"
                    placeholder="${this.getPlaceholderText('financial_findings_local', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div
                  class="col-data col-4 align-right"
                  ?hidden="${this.engagement?.prior_face_forms ||
                  !this.showFields(this.engagement.engagement_type, 'sc')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.total_amount_tested_local}"
                    placeholder="${this.getPlaceholderText('total_amount_tested_local', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                  ?hidden="${!this.showFields(this.engagement.engagement_type, 'audit')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.financial_findings}"
                    placeholder="${this.getPlaceholderText('financial_findings', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                  ?hidden="${!this.showFields(this.engagement.engagement_type, 'sc')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.total_amount_tested}"
                    placeholder="${this.getPlaceholderText('total_amount_tested', this.optionsData)}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>

            <etools-data-table-row no-collapse ?hidden="${!this.showFields(this.engagement.engagement_type, 'sc')}">
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('total_amount_of_ineligible_expenditure', this.optionsData)}
                </div>
                <div class="col-data col-4 align-right" ?hidden="${this.engagement?.prior_face_forms}">
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.total_amount_of_ineligible_expenditure_local}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <etools-currency
                    class="w100"
                    .value="${this.engagement.total_amount_of_ineligible_expenditure}"
                    readonly
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>

            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">${this.getLabelWithoutCurrency('amount_refunded', this.optionsData)}</div>
                ${!this.engagement?.prior_face_forms
                  ? html` <div class="col-data col-4 align-right">
                      <etools-currency
                        class="${this._setRequired('amount_refunded_local', this.optionsData)} validate-input"
                        .value="${this.engagement.amount_refunded_local}"
                        placeholder="${this.getPlaceholderText('amount_refunded_local', this.optionsData)}"
                        ?required="${this._setRequired('amount_refunded_local', this.optionsData)}"
                        ?readonly="${this.isReadOnly('amount_refunded_local', this.optionsData)}"
                        ?invalid="${this.errors?.amount_refunded_local}"
                        .errorMessage="${this.errors?.amount_refunded_local}"
                        @value-changed="${(e: CustomEvent) => {
                          const detail = e.detail;
                          if (Number(this.engagement.amount_refunded_local) === Number(detail?.value)) {
                            return;
                          }
                          if (
                            !this.validateAuditInputValuesLocal(
                              this.engagement,
                              Number(detail?.value),
                              this.engagement.additional_supporting_documentation_provided_local,
                              this.engagement.justification_provided_and_accepted_local,
                              this.engagement.write_off_required_local
                            )
                          ) {
                            (e.target as any).value = this.engagement.amount_refunded_local;
                            this.requestUpdate();
                            return;
                          }
                          this.numberChanged(detail, 'amount_refunded_local', this.engagement);
                          detail.value = divideWithExchangeRate(detail.value, this.engagement.exchange_rate);
                          this.numberChanged(detail, 'amount_refunded', this.engagement);
                          this.setUnsupportedAmountLocal(
                            this.engagement,
                            this.engagement.additional_supporting_documentation_provided_local,
                            this.engagement.amount_refunded_local,
                            this.engagement.justification_provided_and_accepted_local,
                            this.engagement.write_off_required_local
                          );
                        }}"
                        @focus="${this._resetFieldError}"
                      >
                      </etools-currency>
                    </div>`
                  : html``}
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <!--Amount refunded -->
                  <etools-currency
                    class="${this._setRequired('amount_refunded', this.optionsData)} validate-input"
                    .value="${this.engagement.amount_refunded}"
                    placeholder="${this.getPlaceholderText('amount_refunded', this.optionsData)}"
                    ?required="${this._setRequired('amount_refunded', this.optionsData)}"
                    ?readonly="${this.isReadOnly('amount_refunded', this.optionsData)}"
                    ?invalid="${this.errors?.amount_refunded}"
                    .errorMessage="${this.errors?.amount_refunded}"
                    @value-changed="${({detail}: CustomEvent) => {
                      if (Number(this.engagement.amount_refunded) === Number(detail?.value)) {
                        return;
                      }
                      this.numberChanged(detail, 'amount_refunded', this.engagement);
                    }}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('additional_supporting_documentation_provided', this.optionsData)}
                </div>
                ${!this.engagement?.prior_face_forms
                  ? html` <div class="col-data col-4 align-right">
                      <!--Additional supporting documentation provided -->
                      <etools-currency
                        class="${this._setRequired(
                          'additional_supporting_documentation_provided_local',
                          this.optionsData
                        )} validate-input"
                        .value="${this.engagement.additional_supporting_documentation_provided_local}"
                        placeholder="${this.getPlaceholderText(
                          'additional_supporting_documentation_provided_local',
                          this.optionsData
                        )}"
                        ?required="${this._setRequired(
                          'additional_supporting_documentation_provided_local',
                          this.optionsData
                        )}"
                        ?readonly="${this.isReadOnly(
                          'additional_supporting_documentation_provided_local',
                          this.optionsData
                        )}"
                        ?invalid="${this.errors?.additional_supporting_documentation_provided_local}"
                        .errorMessage="${this.errors?.additional_supporting_documentation_provided_local}"
                        @value-changed="${(e: CustomEvent) => {
                          const detail = e.detail;
                          if (
                            Number(this.engagement.additional_supporting_documentation_provided_local) ===
                            Number(detail?.value)
                          ) {
                            return;
                          }
                          if (
                            !this.validateAuditInputValuesLocal(
                              this.engagement,
                              this.engagement.amount_refunded_local,
                              Number(detail?.value),
                              this.engagement.justification_provided_and_accepted_local,
                              this.engagement.write_off_required_local
                            )
                          ) {
                            (e.target as any).value =
                              this.engagement.additional_supporting_documentation_provided_local;
                            this.requestUpdate();
                            return;
                          }
                          this.numberChanged(
                            detail,
                            'additional_supporting_documentation_provided_local',
                            this.engagement
                          );
                          detail.value = divideWithExchangeRate(detail.value, this.engagement.exchange_rate);
                          this.numberChanged(detail, 'additional_supporting_documentation_provided', this.engagement);
                          this.setUnsupportedAmountLocal(
                            this.engagement,
                            this.engagement.additional_supporting_documentation_provided_local,
                            this.engagement.amount_refunded_local,
                            this.engagement.justification_provided_and_accepted_local,
                            this.engagement.write_off_required_local
                          );
                        }}"
                        @focus="${this._resetFieldError}"
                      >
                      </etools-currency>
                    </div>`
                  : html``}
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <!--Additional supporting documentation provided -->
                  <etools-currency
                    class="${this._setRequired('additional_supporting_documentation_provided', this.optionsData)}
                                                    validate-input"
                    .value="${this.engagement.additional_supporting_documentation_provided}"
                    placeholder="${this.getPlaceholderText(
                      'additional_supporting_documentation_provided',
                      this.optionsData
                    )}"
                    ?required="${this._setRequired('additional_supporting_documentation_provided', this.optionsData)}"
                    ?readonly="${this.isReadOnly('additional_supporting_documentation_provided', this.optionsData)}"
                    ?invalid="${this.errors?.additional_supporting_documentation_provided}"
                    .errorMessage="${this.errors?.additional_supporting_documentation_provided}"
                    @value-changed="${({detail}: CustomEvent) => {
                      if (
                        Number(this.engagement.additional_supporting_documentation_provided) === Number(detail?.value)
                      ) {
                        return;
                      }
                      this.numberChanged(detail, 'additional_supporting_documentation_provided', this.engagement);
                    }}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('justification_provided_and_accepted', this.optionsData)}
                </div>
                ${!this.engagement?.prior_face_forms
                  ? html` <div class="col-data col-4 align-right">
                      <!-- Justification provided and accepted -->
                      <etools-currency
                        class="${this._setRequired('justification_provided_and_accepted_local', this.optionsData)}
                                                validate-input"
                        .value="${this.engagement.justification_provided_and_accepted_local}"
                        placeholder="${this.getPlaceholderText(
                          'justification_provided_and_accepted_local',
                          this.optionsData
                        )}"
                        ?required="${this._setRequired('justification_provided_and_accepted_local', this.optionsData)}"
                        ?readonly="${this.isReadOnly('justification_provided_and_accepted_local', this.optionsData)}"
                        ?invalid="${this.errors?.justification_provided_and_accepted_local}"
                        .errorMessage="${this.errors?.justification_provided_and_accepted_local}"
                        @value-changed="${(e: CustomEvent) => {
                          const detail = e.detail;
                          if (
                            Number(this.engagement.justification_provided_and_accepted_local) === Number(detail?.value)
                          ) {
                            return;
                          }
                          if (
                            !this.validateAuditInputValuesLocal(
                              this.engagement,
                              this.engagement.amount_refunded_local,
                              this.engagement.additional_supporting_documentation_provided_local,
                              Number(detail?.value),
                              this.engagement.write_off_required_local
                            )
                          ) {
                            (e.target as any).value = this.engagement.justification_provided_and_accepted_local;
                            // this.requestUpdate();
                            return;
                          }
                          this.numberChanged(detail, 'justification_provided_and_accepted_local', this.engagement);
                          detail.value = divideWithExchangeRate(detail.value, this.engagement.exchange_rate);
                          this.numberChanged(detail, 'justification_provided_and_accepted', this.engagement);
                          this.setUnsupportedAmountLocal(
                            this.engagement,
                            this.engagement.additional_supporting_documentation_provided_local,
                            this.engagement.amount_refunded_local,
                            this.engagement.justification_provided_and_accepted_local,
                            this.engagement.write_off_required_local
                          );
                        }}"
                        @focus="${this._resetFieldError}"
                      >
                      </etools-currency>
                    </div>`
                  : html``}
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <!-- Justification provided and accepted -->
                  <etools-currency
                    class="${this._setRequired('justification_provided_and_accepted', this.optionsData)}
                                              validate-input"
                    .value="${this.engagement.justification_provided_and_accepted}"
                    placeholder="${this.getPlaceholderText('justification_provided_and_accepted', this.optionsData)}"
                    ?required="${this._setRequired('justification_provided_and_accepted', this.optionsData)}"
                    ?readonly="${this.isReadOnly('justification_provided_and_accepted', this.optionsData)}"
                    ?invalid="${this.errors?.justification_provided_and_accepted}"
                    .errorMessage="${this.errors?.justification_provided_and_accepted}"
                    @value-changed="${({detail}: CustomEvent) => {
                      if (Number(this.engagement.justification_provided_and_accepted) === Number(detail?.value)) {
                        return;
                      }
                      this.numberChanged(detail, 'justification_provided_and_accepted', this.engagement);
                    }}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('write_off_required', this.optionsData)}
                </div>
                ${!this.engagement?.prior_face_forms
                  ? html` <div class="col-data col-4 align-right">
                      <etools-currency
                        class="${this._setRequired('write_off_required_local', this.optionsData)} validate-input"
                        .value="${this.engagement.write_off_required_local}"
                        placeholder="${this.getPlaceholderText('write_off_required_local', this.optionsData)}"
                        ?required="${this._setRequired('write_off_required_local', this.optionsData)}"
                        ?readonly="${this.isReadOnly('write_off_required_local', this.optionsData)}"
                        ?invalid="${this.errors?.write_off_required_local}"
                        .errorMessage="${this.errors?.write_off_required_local}"
                        @value-changed="${(e: CustomEvent) => {
                          const detail = e.detail;
                          if (Number(this.engagement.write_off_required_local) === Number(detail?.value)) {
                            return;
                          }
                          if (
                            !this.validateAuditInputValuesLocal(
                              this.engagement,
                              this.engagement.amount_refunded_local,
                              this.engagement.additional_supporting_documentation_provided_local,
                              this.engagement.justification_provided_and_accepted_local,
                              Number(detail?.value)
                            )
                          ) {
                            (e.target as any).value = this.engagement.write_off_required_local;
                            this.requestUpdate();
                            return;
                          }
                          this.numberChanged(detail, 'write_off_required_local', this.engagement);
                          detail.value = divideWithExchangeRate(detail.value, this.engagement.exchange_rate);
                          this.numberChanged(detail, 'write_off_required', this.engagement);
                          this.setUnsupportedAmountLocal(
                            this.engagement,
                            this.engagement.additional_supporting_documentation_provided_local,
                            this.engagement.amount_refunded_local,
                            this.engagement.justification_provided_and_accepted_local,
                            this.engagement.write_off_required_local
                          );
                        }}"
                        @focus="${this._resetFieldError}"
                      >
                      </etools-currency>
                    </div>`
                  : html``}
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                >
                  <!--Write off required -->
                  <etools-currency
                    class="${this._setRequired('write_off_required', this.optionsData)} validate-input"
                    .value="${this.engagement.write_off_required}"
                    placeholder="${this.getPlaceholderText('write_off_required', this.optionsData)}"
                    ?required="${this._setRequired('write_off_required', this.optionsData)}"
                    ?readonly="${this.isReadOnly('write_off_required', this.optionsData)}"
                    ?invalid="${this.errors?.write_off_required}"
                    .errorMessage="${this.errors?.write_off_required}"
                    @value-changed="${({detail}: CustomEvent) => {
                      if (Number(this.engagement.write_off_required) === Number(detail?.value)) {
                        return;
                      }
                      this.numberChanged(detail, 'write_off_required', this.engagement);
                    }}"
                    @focus="${this._resetFieldError}"
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal h-50">
                <div class="col-data col-4">
                  ${this.getLabelWithoutCurrency('pending_unsupported_amount', this.optionsData)}
                </div>
                ${!this.engagement?.prior_face_forms
                  ? html` <div
                      class="col-data col-4 col align-right"
                      data-col-header-label="${this.getLabelWithoutCurrency(
                        'pending_unsupported_amount',
                        this.optionsData
                      )}"
                    >
                      <etools-currency
                        .value="${this.engagement.pending_unsupported_amount_local}"
                        placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                        readonly
                      >
                      </etools-currency>
                    </div>`
                  : html``}
                <div
                  class="col-data align-right ${toggleCssClass(this.engagement?.prior_face_forms, 'col-8', 'col-4')}"
                  data-col-header-label="${this.getLabelWithoutCurrency(
                    'pending_unsupported_amount',
                    this.optionsData
                  )}"
                >
                  <etools-currency
                    .value="${this.engagement.pending_unsupported_amount}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency>
                </div>
              </div>
            </etools-data-table-row>
          </div>
          <div class="col-12 col-lg-3 padding-v row">
            <div class="col-12 col-lg-6 input-container align-top">
              <etools-info-tooltip>
                <etools-input
                  slot="field"
                  class="w100 "
                  .value="${this.engagement.exchange_rate}"
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
        <div class="row align-items-center">
          <div class="col-9">
            <!-- explanation_for_additional_information -->
            <etools-textarea
              class="w100 validate-input ${this._setRequired(
                'explanation_for_additional_information',
                this.optionsData
              )}"
              .value="${this.engagement.explanation_for_additional_information}"
              allowed-pattern="[ds]"
              label="${this.getLabel('explanation_for_additional_information', this.optionsData)}"
              always-float-label
              placeholder="${this.getPlaceholderText('explanation_for_additional_information', this.optionsData)}"
              ?required="${this._setRequired('explanation_for_additional_information', this.optionsData)}"
              ?readonly="${this.isReadOnly('explanation_for_additional_information', this.optionsData)}"
              ?invalid="${this.errors?.explanation_for_additional_information}"
              .errorMessage="${this.errors?.explanation_for_additional_information}"
              @focus="${this._resetFieldError}"
              @value-changed="${({detail}: CustomEvent) =>
                this.valueChanged(detail, 'explanation_for_additional_information', this.engagement)}"
            >
            </etools-textarea>
          </div>
          ${this.showFields(this.engagement.engagement_type, 'audit')
            ? html`<div class="col-12 col-lg-3 col-md-6">
                <!-- Audit Opinion -->
                <etools-dropdown
                  id="test"
                  .selected="${this.engagement.audit_opinion}"
                  label="${this.getLabel('audit_opinion', this.optionsData)}"
                  placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                  .options="${this.auditOpinionChoices}"
                  option-label="display_name"
                  option-value="value"
                  readonly
                >
                </etools-dropdown>
              </div> `
            : ``}
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Array})
  auditOpinionChoices!: [];

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: String})
  ineligibleExpenditureLabel = '';

  @property({type: String})
  financialFindingsLabel = '';

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this.setAuditOpinionChoices(this.optionsData);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
  }

  setAuditOpinionChoices(options: AnyObject) {
    if (!options) {
      return [];
    }
    this.auditOpinionChoices = getOptionsChoices(options, 'audit_opinion') || [];
    this.ineligibleExpenditureLabel = this.getLabelWithoutCurrency(
      'total_amount_of_ineligible_expenditure',
      this.optionsData
    );
    this.financialFindingsLabel = this.getLabelWithoutCurrency('financial_findings', this.optionsData);
  }

  getFindingsData() {
    const fields = [
      'additional_supporting_documentation_provided_local',
      'additional_supporting_documentation_provided',
      'amount_refunded_local',
      'amount_refunded',
      'justification_provided_and_accepted_local',
      'justification_provided_and_accepted',
      'write_off_required_local',
      'write_off_required',
      'explanation_for_additional_information'
    ];

    return pickBy(this.engagement, (_value, key) => {
      return ~fields.indexOf(key) && this.originalData[key] !== this.engagement[key];
    });
  }

  showFields(type, expectedType) {
    return type === expectedType;
  }

  getLabelWithoutCurrency(path: string, options: AnyObject) {
    let label = this.getLabel(path, options);
    if (label) {
      label = label.replace(/ *\([^)]*\) */g, '');
      label = label.replace('$', '');
    }
    return label;
  }

  validateAuditInputValuesLocal(
    engagement: GenericObject,
    amount_refunded_local: number,
    additional_supporting_documentation_provided_local: number,
    justification_provided_and_accepted_local: number,
    write_off_required_local: number
  ) {
    const higherLimit =
      this.engagement.engagement_type === 'sc'
        ? Number(engagement.total_amount_of_ineligible_expenditure_local || 0)
        : Number(engagement.financial_findings_local || 0);

    const msgField =
      this.engagement.engagement_type === 'sc' ? this.ineligibleExpenditureLabel : this.financialFindingsLabel;
    const inputValid =
      higherLimit >=
      Number(amount_refunded_local || 0) +
        Number(additional_supporting_documentation_provided_local || 0) +
        Number(justification_provided_and_accepted_local || 0) +
        Number(write_off_required_local || 0);

    if (!inputValid) {
      fireEvent(this, 'toast', {text: `The sum of input values cannot be higher than ${msgField} value`});
    }
    return inputValid;
  }

  setUnsupportedAmountLocal(engagement, ...properties) {
    engagement = engagement || {};
    let value = engagement.financial_findings_local || engagement.total_amount_of_ineligible_expenditure_local || 0;
    let changedValues = 0;
    each(properties, (property) => {
      changedValues += Number(property || 0);
    });
    if (changedValues === 0) {
      // no value changed, just return;
      return;
    }

    value -= changedValues;
    if (isNaN(value)) {
      value = 0;
    }

    this.engagement.pending_unsupported_amount_local = value;
    this.engagement.pending_unsupported_amount = divideWithExchangeRate(
      this.engagement.pending_unsupported_amount_local,
      this.engagement.exchange_rate
    );
  }
}
