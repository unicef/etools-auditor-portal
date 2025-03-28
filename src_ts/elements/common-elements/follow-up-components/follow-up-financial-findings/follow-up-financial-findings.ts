import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
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
        :host {
          position: relative;
          margin-bottom: 24px;
          display: block;
        }
        .input-container {
          display: flex;
        }
      </style>

      <etools-content-panel panel-title="Financial Findings">
        ${this.showFields(this.engagement.engagement_type, 'audit')
          ? html`<div class="row">
              <div class="col-12 col-lg-4 col-md-6 input-container">
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
              </div>
            </div>`
          : ``}

        <div class="row">
          <!--Audit engagement fields-->
          ${this.showFields(this.engagement.engagement_type, 'audit')
            ? html`<div class="col-12 input-container col-lg-4 col-md-6">
                  <!-- Audited expenditure (USD)-->
                  <etools-currency
                    .value="${this.engagement.audited_expenditure}"
                    currency="$"
                    label="${this.getLabel('audited_expenditure', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency>
                </div>
                <div class="col-12 input-container col-lg-4 col-md-6">
                  <!-- Financial Findings (USD)-->
                  <etools-currency
                    .value="${this.engagement.financial_findings}"
                    currency="$"
                    label="${this.getLabel('financial_findings', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency>
                </div>`
            : ``}

          <!--Spot-Check engagement fields-->
          ${this.showFields(this.engagement.engagement_type, 'sc')
            ? html`<div class="col-12 input-container col-lg-4 col-md-6">
                  <!-- Total amount tested-->
                  <etools-currency
                    .value="${this.engagement.total_amount_tested}"
                    currency="$"
                    label="${this.getLabel('total_amount_tested', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency>
                </div>

                <div class="col-12 input-container col-lg-4 col-md-6">
                  <!-- Total amount of ineligible expenditure-->
                  <etools-currency
                    .value="${this.engagement.total_amount_of_ineligible_expenditure}"
                    currency="$"
                    label="${this.getLabel('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency>
                </div>`
            : ``}

          <!--  -->
          <div class="col-12 input-container col-lg-4 col-md-6">
            <!--Amount refunded -->
            <etools-currency
              class="${this._setRequired('amount_refunded', this.optionsData)}
                                    validate-input"
              .value="${this.engagement.amount_refunded}"
              currency="$"
              label="${this.getLabel('amount_refunded', this.optionsData)}"
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
                this.setUnsupportedAmount(
                  this.engagement,
                  this.engagement.additional_supporting_documentation_provided,
                  this.engagement.amount_refunded,
                  this.engagement.justification_provided_and_accepted,
                  this.engagement.write_off_required
                );
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>
          <div class="col-12 input-container col-lg-4 col-md-6">
            <!--Additional supporting documentation provided -->
            <etools-currency
              class="${this._setRequired('additional_supporting_documentation_provided', this.optionsData)}
                                        validate-input"
              .value="${this.engagement.additional_supporting_documentation_provided}"
              currency="$"
              label="${this.getLabel('additional_supporting_documentation_provided', this.optionsData)}"
              placeholder="${this.getPlaceholderText('additional_supporting_documentation_provided', this.optionsData)}"
              ?required="${this._setRequired('additional_supporting_documentation_provided', this.optionsData)}"
              ?readonly="${this.isReadOnly('additional_supporting_documentation_provided', this.optionsData)}"
              ?invalid="${this.errors?.additional_supporting_documentation_provided}"
              .errorMessage="${this.errors?.additional_supporting_documentation_provided}"
              @value-changed="${({detail}: CustomEvent) => {
                if (Number(this.engagement.additional_supporting_documentation_provided) === Number(detail?.value)) {
                  return;
                }
                this.numberChanged(detail, 'additional_supporting_documentation_provided', this.engagement);
                this.setUnsupportedAmount(
                  this.engagement,
                  this.engagement.additional_supporting_documentation_provided,
                  this.engagement.amount_refunded,
                  this.engagement.justification_provided_and_accepted,
                  this.engagement.write_off_required
                );
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <!-- Justification provided and accepted -->
            <etools-currency
              class="${this._setRequired('justification_provided_and_accepted', this.optionsData)}
                                    validate-input"
              .value="${this.engagement.justification_provided_and_accepted}"
              currency="$"
              label="${this.getLabel('justification_provided_and_accepted', this.optionsData)}"
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
                this.setUnsupportedAmount(
                  this.engagement,
                  this.engagement.additional_supporting_documentation_provided,
                  this.engagement.amount_refunded,
                  this.engagement.justification_provided_and_accepted,
                  this.engagement.write_off_required
                );
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <!--Write off required -->
            <etools-currency
              class="${this._setRequired('write_off_required', this.optionsData)}
                                      validate-input"
              .value="${this.engagement.write_off_required}"
              currency="$"
              label="${this.getLabel('write_off_required', this.optionsData)}"
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
                this.setUnsupportedAmount(
                  this.engagement,
                  this.engagement.additional_supporting_documentation_provided,
                  this.engagement.amount_refunded,
                  this.engagement.justification_provided_and_accepted,
                  this.engagement.write_off_required
                );
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>
          <div class="col-12 input-container col-lg-4 col-md-6">
            <!-- Pending Unsupported Amount -->
            <etools-input
              .value="${this.engagement.pending_unsupported_amount}"
              label="${this.getLabel('pending_unsupported_amount', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
              readonly
            >
              <div prefix>$</div>
            </etools-input>
          </div>
          <div class="col-12 input-container">
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
  }

  getFindingsData() {
    const fields = [
      'additional_supporting_documentation_provided',
      'amount_refunded',
      'justification_provided_and_accepted',
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

  setUnsupportedAmount(engagement, ...properties) {
    engagement = engagement || {};
    let value = engagement.financial_findings || engagement.total_amount_of_ineligible_expenditure || 0;

    each(properties, (property) => {
      value -= property;
    });

    if (isNaN(value)) {
      value = 0;
    }

    this.engagement.pending_unsupported_amount = value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}
