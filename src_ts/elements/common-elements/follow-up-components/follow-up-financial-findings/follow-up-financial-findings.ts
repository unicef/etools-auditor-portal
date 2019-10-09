import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-input/paper-textarea.js';
import pickBy from 'lodash-es/pickBy';
import each from 'lodash-es/each';

import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {getChoices} from '../../../app-mixins/permission-controller';

import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
class FollowUpFinancialFindings extends CommonMethodsMixin(PolymerElement) {

  static get template() {
    return html`
      ${tabInputsStyles}  ${moduleStyles}
      <style>
            :host {
              position: relative;
              margin-bottom: 24px;
              display: block;
            }
            paper-input {
              --paper-input-prefix: {
                                margin-right: 5px;
                                color: var(--gray-dark);
                            };
            }
        </style>

        <etools-content-panel panel-title="Financial Findings">

            <template is="dom-if" if="[[showFields(engagement.engagement_type, 'audit')]]" restamp>
                <div class="row-h group">
                    <div class="input-container">
                        <!-- Audit Opinion -->
                        <etools-dropdown
                                id="test"
                                class="disabled-as-readonly"
                                selected="{{engagement.audit_opinion}}"
                                label="[[getLabel('audit_opinion', basePermissionPath)]]"
                                placeholder="[[getReadonlyPlaceholder(engagement)]]"
                                options="[[auditOpinionChoices]]"
                                option-label="display_name"
                                option-value="value"
                                disabled readonly>
                        </etools-dropdown>
                    </div>
                </div>
            </template>

            <div class="row-h group">
                <!--Audit engagement fields-->
                <template is="dom-if" if="[[showFields(engagement.engagement_type, 'audit')]]" restamp>
                    <div class="input-container">
                        <!-- Audited expenditure (USD)-->
                        <etools-currency-amount-input
                                class="disabled-as-readonly"
                                value="{{engagement.audited_expenditure}}"
                                currency="$"
                                label$="[[getLabel('audited_expenditure', basePermissionPath)]]"
                                placeholder$="[[getReadonlyPlaceholder(engagement)]]"
                                disabled readonly>
                        </etools-currency-amount-input>
                    </div>

                    <div class="input-container">
                        <!-- Financial Findings (USD)-->
                        <etools-currency-amount-input
                                class="disabled-as-readonly"
                                value="{{engagement.financial_findings}}"
                                currency="$"
                                label$="[[getLabel('financial_findings', basePermissionPath)]]"
                                placeholder$="[[getReadonlyPlaceholder(engagement)]]"
                                disabled readonly>
                        </etools-currency-amount-input>
                    </div>
                </template>

                <!--Spot-Check engagement fields-->
                <template is="dom-if" if="[[showFields(engagement.engagement_type, 'sc')]]" restamp>
                    <div class="input-container">
                        <!-- Total amount tested-->
                        <etools-currency-amount-input
                                class="disabled-as-readonly"
                                value="{{engagement.total_amount_tested}}"
                                currency="$"
                                label$="[[getLabel('total_amount_tested', basePermissionPath)]]"
                                placeholder$="[[getReadonlyPlaceholder(engagement)]]"
                                disabled readonly>
                        </etools-currency-amount-input>
                    </div>

                    <div class="input-container">
                        <!-- Total amount of ineligible expenditure-->
                        <etools-currency-amount-input
                                class="disabled-as-readonly"
                                value="{{engagement.total_amount_of_ineligible_expenditure}}"
                                currency="$"
                                label$="[[getLabel('total_amount_of_ineligible_expenditure', basePermissionPath)]]"
                                placeholder$="[[getReadonlyPlaceholder(engagement)]]"
                                disabled readonly>
                        </etools-currency-amount-input>
                    </div>
                </template>

                <!--  -->
                <div class="input-container">
                    <!--Amount refunded -->
                    <etools-currency-amount-input
                            class$="validate-input disabled-as-readonly [[_setRequired('amount_refunded', basePermissionPath)]]"
                            value="{{engagement.amount_refunded}}"
                            currency="$"
                            label$="[[getLabel('amount_refunded', basePermissionPath)]]"
                            placeholder$="[[getPlaceholderText('amount_refunded', basePermissionPath)]]"
                            required$="[[_setRequired('amount_refunded', basePermissionPath)]]"
                            disabled$="[[isReadOnly('amount_refunded', basePermissionPath)]]"
                            readonly$="[[isReadOnly('amount_refunded', basePermissionPath)]]"
                            invalid$="{{errors.amount_refunded}}"
                            error-message="{{errors.amount_refunded}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>
            </div>

            <div class="row-h group">
                <div class="input-container">
                    <!--Additional supporting documentation provided -->
                    <etools-currency-amount-input
                            class$="validate-input disabled-as-readonly [[_setRequired('additional_supporting_documentation_provided', basePermissionPath)]]"
                            value="{{engagement.additional_supporting_documentation_provided}}"
                            currency="$"
                            label$="[[getLabel('additional_supporting_documentation_provided', basePermissionPath)]]"
                            placeholder$="[[getPlaceholderText('additional_supporting_documentation_provided', basePermissionPath)]]"
                            required$="[[_setRequired('additional_supporting_documentation_provided', basePermissionPath)]]"
                            disabled$="[[isReadOnly('additional_supporting_documentation_provided', basePermissionPath)]]"
                            readonly$="[[isReadOnly('additional_supporting_documentation_provided', basePermissionPath)]]"
                            invalid$="{{errors.additional_supporting_documentation_provided}}"
                            error-message="{{errors.additional_supporting_documentation_provided}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>

                <div class="input-container">
                    <!-- Justification provided and accepted -->
                    <etools-currency-amount-input
                            class$="validate-input disabled-as-readonly [[_setRequired('justification_provided_and_accepted', basePermissionPath)]]"
                            value="{{engagement.justification_provided_and_accepted}}"
                            currency="$"
                            label$="[[getLabel('justification_provided_and_accepted', basePermissionPath)]]"
                            placeholder$="[[getPlaceholderText('justification_provided_and_accepted', basePermissionPath)]]"
                            required$="[[_setRequired('justification_provided_and_accepted', basePermissionPath)]]"
                            disabled$="[[isReadOnly('justification_provided_and_accepted', basePermissionPath)]]"
                            readonly$="[[isReadOnly('justification_provided_and_accepted', basePermissionPath)]]"
                            invalid$="{{errors.justification_provided_and_accepted}}"
                            error-message="{{errors.justification_provided_and_accepted}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>

                <div class="input-container">
                    <!--Write off required -->
                    <etools-currency-amount-input
                            class$="validate-input disabled-as-readonly [[_setRequired('write_off_required', basePermissionPath)]]"
                            value="{{engagement.write_off_required}}"
                            currency="$"
                            label$="[[getLabel('write_off_required', basePermissionPath)]]"
                            placeholder$="[[getPlaceholderText('write_off_required', basePermissionPath)]]"
                            required$="[[_setRequired('write_off_required', basePermissionPath)]]"
                            disabled$="[[isReadOnly('write_off_required', basePermissionPath)]]"
                            readonly$="[[isReadOnly('write_off_required', basePermissionPath)]]"
                            invalid$="{{errors.write_off_required}}"
                            error-message="{{errors.write_off_required}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>
            </div>

            <div class="row-h group">
                <div class="input-container">
                    <!-- Pending Unsupported Amount -->
                    <paper-input
                            class="disabled-as-readonly"
                            value="[[setUnsupportedAmount(engagement, engagement.additional_supporting_documentation_provided, engagement.amount_refunded, engagement.justification_provided_and_accepted, engagement.write_off_required)]]"
                            label$="[[getLabel('pending_unsupported_amount', basePermissionPath)]]"
                            placeholder$="[[getReadonlyPlaceholder(engagement)]]"
                            disabled readonly>
                        <div prefix>$</div>
                    </paper-input>
                </div>
            </div>

            <div class="row-h group">
                <div class="input-container input-container-l">
                    <!-- explanation_for_additional_information -->
                    <paper-textarea
                            class$="validate-input {{_setRequired('explanation_for_additional_information', basePermissionPath)}}"
                            value="{{engagement.explanation_for_additional_information}}"
                            allowed-pattern="[\d\s]"
                            label="[[getLabel('explanation_for_additional_information', basePermissionPath)]]"
                            always-float-label
                            placeholder="[[getPlaceholderText('explanation_for_additional_information', basePermissionPath)]]"
                            required="{{_setRequired('explanation_for_additional_information', basePermissionPath)}}"
                            disabled="{{isReadOnly('explanation_for_additional_information', basePermissionPath)}}"
                            readonly$="{{isReadOnly('explanation_for_additional_information', basePermissionPath)}}"
                            invalid="{{errors.explanation_for_additional_information}}"
                            error-message="{{errors.explanation_for_additional_information}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </paper-textarea>
                </div>
            </div>
        </etools-content-panel>

      `;
  }
  static get observers() {
    return [
      'setAuditOpinionChoices(basePermissionPath, engagement)',
      '_errorHandler(errorObject)'
    ]
  }

  setAuditOpinionChoices(basePermissionPath) {
    if (!basePermissionPath) {return [];}
    this.set('auditOpinionChoices', getChoices(`${basePermissionPath}.audit_opinion`) || []);
  }

  getFindingsData() {
    let fields = ['additional_supporting_documentation_provided', 'amount_refunded',
      'justification_provided_and_accepted', 'write_off_required', 'explanation_for_additional_information'];

    return pickBy(this.engagement, (value, key) => {
      return ~fields.indexOf(key) && (this.originalData[key] !== this.engagement[key]);
    });
  }

  showFields(type, expectedType) {
    if (typeof type === 'object' && type && type.hasOwnProperty('value')) {
      type = type.value;
    }
    return type === expectedType;
  }

  setUnsupportedAmount(engagement, ...properties) {
    engagement = engagement || {};
    let value = engagement.financial_findings || engagement.total_amount_of_ineligible_expenditure || 0;

    each(properties, property => {
      value -= property;
    });

    return value.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

}
window.customElements.define('follow-up-financial-findings', FollowUpFinancialFindings);
export default FollowUpFinancialFindings
