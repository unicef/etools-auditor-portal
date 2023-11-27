import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import pickBy from 'lodash-es/pickBy';
import each from 'lodash-es/each';

import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getOptionsChoices} from '../../../mixins/permission-controller';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
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
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
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
        etools-input {
          --paper-input-prefix: {
            margin-right: 5px;
            color: var(--gray-mid);
          }
        }
      </style>

      <etools-content-panel panel-title="Financial Findings">
        ${this.showFields(this.engagement.engagement_type, 'audit')
          ? html`<div class="layout-horizontal">
              <div class="col col-4">
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

        <div class="layout-horizontal">
          <!--Audit engagement fields-->
          ${this.showFields(this.engagement.engagement_type, 'audit')
            ? html`<div class="col col-4">
                  <!-- Audited expenditure (USD)-->
                  <etools-currency-amount-input
                    .value="${this.engagement.audited_expenditure}"
                    currency="$"
                    label="${this.getLabel('audited_expenditure', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency-amount-input>
                </div>
                <div class="col col-4">
                  <!-- Financial Findings (USD)-->
                  <etools-currency-amount-input
                    .value="${this.engagement.financial_findings}"
                    currency="$"
                    label="${this.getLabel('financial_findings', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency-amount-input>
                </div>`
            : ``}

          <!--Spot-Check engagement fields-->
          ${this.showFields(this.engagement.engagement_type, 'sc')
            ? html`<div class="col col-4">
                  <!-- Total amount tested-->
                  <etools-currency-amount-input
                    .value="${this.engagement.total_amount_tested}"
                    currency="$"
                    label="${this.getLabel('total_amount_tested', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency-amount-input>
                </div>

                <div class="col col-4">
                  <!-- Total amount of ineligible expenditure-->
                  <etools-currency-amount-input
                    .value="${this.engagement.total_amount_of_ineligible_expenditure}"
                    currency="$"
                    label="${this.getLabel('total_amount_of_ineligible_expenditure', this.optionsData)}"
                    placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
                    readonly
                  >
                  </etools-currency-amount-input>
                </div>`
            : ``}

          <!--  -->
          <div class="col col-4">
            <!--Amount refunded -->
            <etools-currency-amount-input
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
                this.numberChanged(detail, 'amount_refunded', this.engagement);
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency-amount-input>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-4">
            <!--Additional supporting documentation provided -->
            <etools-currency-amount-input
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
                this.numberChanged(detail, 'additional_supporting_documentation_provided', this.engagement);
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency-amount-input>
          </div>

          <div class="col col-4">
            <!-- Justification provided and accepted -->
            <etools-currency-amount-input
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
                this.numberChanged(detail, 'justification_provided_and_accepted', this.engagement);
              }}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency-amount-input>
          </div>

          <div class="col col-4">
            <!--Write off required -->
            <etools-currency-amount-input
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
              @value-changed="${({detail}: CustomEvent) =>
                this.numberChanged(detail, 'write_off_required', this.engagement)}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency-amount-input>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Pending Unsupported Amount -->
            <etools-input
              .value="${this.setUnsupportedAmount(
                this.engagement,
                this.engagement.additional_supporting_documentation_provided,
                this.engagement.amount_refunded,
                this.engagement.justification_provided_and_accepted,
                this.engagement.write_off_required
              )}"
              label="${this.getLabel('pending_unsupported_amount', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.engagement)}"
              readonly
            >
              <div prefix>$</div>
            </etools-input>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <!-- explanation_for_additional_information -->
            <paper-textarea
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
            </paper-textarea>
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
      this._errorHandler(this.errorObject);
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

    return value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }
}
