import {LitElement, html, property, customElement} from 'lit-element';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import {getChoices, isRequired} from '../../../mixins/permission-controller';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';
import find from 'lodash-es/find';
import {GenericObject, ValueAndDisplayName} from '../../../../types/global';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import isEmpty from 'lodash-es/isEmpty';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */

@customElement('primary-risk-element')
export class PrimaryRiskElement extends CommonMethodsMixin(ModelChangedMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        etools-content-panel.overal-risks {
          margin: 20px 0;
        }

        etools-content-panel.overal-risks::part(ecp-header) {
          height: 51px;
          background-color: var(--module-warning);
        }
      </style>

      <etools-content-panel .panelTitle="${this.riskData.header}" class="overal-risks">
        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Risk Assessment -->

            <etools-dropdown
              id="riskAssessmentInput"
              class="validate-input required"
              .selected="${this.primaryArea.risk.value.value}"
              label="Risk Assessment"
              placeholder="Select Risk Assessment"
              .options="${this.riskOptions}"
              option-label="display_name"
              option-value="value"
              required
              ?readonly="${this.isDisabled}"
              ?invalid="${this.errors?.children[0]?.blueprints[0]?.risk?.value}"
              .errorMessage="${this.errors?.children[0].blueprints[0].risk.value}"
              @focus="${this._resetFieldError}"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) =>
                this.selectedItemChanged(detail, 'risk.value.value', 'value', this.primaryArea)}"
              hide-search
            >
            </etools-dropdown>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <!-- Brief Justification -->
            <paper-textarea
              id="briefJustification"
              class="validate-input required w100"
              .value="${this.primaryArea.risk.extra.comments}"
              label="Brief Justification for Rating (main internal control gaps)"
              placeholder="Enter Brief Justification"
              required
              ?readonly="${this.isDisabled}"
              max-rows="4"
              invalid="${this.errors?.children[0]?.blueprints[0]?.risk?.extra}"
              .errorMessage="${this.errors?.children[0]?.blueprints[0]?.risk.extra}"
              @focus="${this._resetFieldError}"
              @value-changed="${({detail}: CustomEvent) =>
                this.valueChanged(detail, 'risk.extra.comments', this.primaryArea)}"
            >
            </paper-textarea>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  primaryArea: any = {risk: {extra: {}, value: {}}};

  @property({type: String})
  errorBaseText = 'Overall Risk Assessment: ';

  @property({type: Object})
  tabTexts = {
    name: 'Overall Risk Assessment',
    fields: ['overall_risk_assessment']
  };

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Object})
  riskData!: GenericObject;

  @property({type: Array})
  riskOptions!: [];

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Boolean})
  isDisabled = true;

  @property({type: Boolean})
  dialogOpened!: boolean;

  static get observers() {
    return [
      '_setValues(riskData, riskOptions)',
      'updateStyles(basePermissionPath)',
      '_complexErrorHandler(errorObject.overall_risk_assessment)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    this._populateRiskOptions();
  }

  _setValues(data) {
    this._populateRiskOptions();
    this.isDisabled = this.isReadOnly('test_subject_areas', this.basePermissionPath);

    if (!data) {
      return;
    }

    this.originalData = cloneDeep(data);

    if (!this.riskData.blueprints[0].risk || isNaN(+this.riskData.blueprints[0].risk.value)) {
      return;
    }

    let extra = get(this, 'riskData.blueprints[0].risk.extra', '{"comments":""}');
    if (this.isJSONObj(extra)) {
      extra = JSON.parse(String(extra));
    }

    this.primaryArea.risk.value = find(
      this.riskOptions,
      (risk: ValueAndDisplayName) => risk.value === this.riskData.blueprints[0].risk.value
    );
    this.primaryArea.risk.extra = extra;
    this.primaryArea = {...this.primaryArea};
  }

  _populateRiskOptions() {
    if (!this.riskOptions) {
      const riskOptions = getChoices(`${this.basePermissionPath}.overall_risk_assessment.blueprints.risk.value`) || [];
      this.riskOptions = riskOptions;
    }
  }

  validate(forSave) {
    if (this.primaryArea.risk.extra.comments && !this.primaryArea.risk.value) {
      this.errors = {children: [{blueprints: [{risk: {value: 'Field is required'}}]}]};
      fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
      return false;
    }
    if (!this.basePermissionPath || forSave) {
      return true;
    }
    const required = isRequired(`${this.basePermissionPath}.overall_risk_assessment.blueprints.risk`);
    if (!required) {
      return true;
    }

    const riskValid = (this.shadowRoot!.querySelector('#riskAssessmentInput') as EtoolsDropdownEl).validate();
    const commentsValid = (this.shadowRoot!.querySelector('#briefJustification') as PaperTextareaElement).validate();
    const valid = riskValid && commentsValid;

    const errors = {
      children: [
        {
          blueprints: [
            {
              risk: {
                value: !riskValid ? 'Field is required' : false,
                extra: !commentsValid ? 'Field is required' : false
              }
            }
          ]
        }
      ]
    };
    this.errors = errors;
    if (!valid) {
      fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
    }

    return valid;
  }

  getRiskData() {
    if (isEmpty(this.primaryArea.risk.value)) {
      return null;
    }

    const extra = this.isJSONObj(this.primaryArea.risk.extra)
      ? JSON.parse(this.primaryArea.risk.extra)
      : this.primaryArea.risk.extra;

    let originalExtra = get(this, 'originalData.blueprints[0].risk.extra');
    if (this.isJSONObj(originalExtra)) {
      originalExtra = JSON.parse(String(originalExtra));
    }

    if (
      this.originalData.blueprints[0].risk &&
      this.primaryArea.risk.value.value === this.originalData.blueprints[0].risk.value &&
      isEqual(extra, originalExtra)
    ) {
      return null;
    }

    const risk = {
      value: this.primaryArea.risk.value.value,
      extra: this.primaryArea.risk.extra || {}
    };

    const blueprint = {
      id: this.riskData.blueprints[0].id,
      risk: risk
    };

    return {
      id: this.riskData.id,
      blueprints: [blueprint]
    };
  }

  errorHandler(errorData) {
    if (this.dialogOpened) {
      return;
    }
    this._errorHandler(errorData);
  }
}
