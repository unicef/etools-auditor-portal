import {PolymerElement, html} from '@polymer/polymer';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@polymer/paper-input/paper-textarea';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {getChoices, isRequired} from '../../../app-mixins/permission-controller';
import {property} from '@polymer/decorators';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '../../../utils/fire-custom-event';
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';
import find from 'lodash-es/find';
import {GenericObject, ValueAndDisplayName} from '../../../../types/global';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';

class PrimaryRiskElement extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      <style>
        etools-content-panel.overal-risks {
          margin: 20px 0;
        }

        etools-content-panel.overal-risks {
          --ecp-header-height: 51px;
          --ecp-header-bg: var(--module-warning);
        }

      </style>

      <etools-content-panel panel-title="{{riskData.header}}" class="overal-risks">
        <div class="repeatable-item-content">
          <div class="row-h group">
            <div class="input-container">
              <!-- Risk Assessment -->

              <etools-dropdown id="riskAssessmentInput"
                class="validate-input disabled-as-readonly required"
                selected="{{primaryArea.risk.value.value}}"
                label="Risk Assessment"
                placeholder="Select Risk Assessment"
                options="[[riskOptions]]"
                option-label="display_name"
                option-value="value"
                required
                disabled="[[isDisabled]]"
                readonly="[[isDisabled]]"
                invalid="{{errors.children.0.blueprints.0.risk.value}}"
                error-message="{{errors.children.0.blueprints.0.risk.value}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                hide-search>
              </etools-dropdown>
            </div>
          </div>

          <div class="row-h group">
            <div class="input-container input-container-l">
              <!-- Brief Justification -->
              <paper-textarea id="briefJustification"
                class="disabled-as-readonly validate-input required"
                value="{{primaryArea.risk.extra.comments}}"
                label="Brief Justification for Rating (main internal control gaps)"
                placeholder="Enter Brief Justification"
                required disabled="[[isDisabled]]"
                max-rows="4"
                invalid="{{errors.children.0.blueprints.0.risk.extra}}"
                error-message="{{errors.children.0.blueprints.0.risk.extra}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError">
              </paper-textarea>
            </div>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  primaryArea = {risk: {extra: {}, value: {}}};

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
  isDisabled: boolean = true;

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

    let extra = get(this, 'riskData.blueprints[0].risk.extra', {comments: ''});
    if (this.isJSONObj(extra)) {
      extra = JSON.parse(extra);
    }

    this.set('primaryArea.risk.value', find(this.riskOptions, (risk: ValueAndDisplayName) => risk.value === this.riskData.blueprints[0].risk.value));
    this.set('primaryArea.risk.extra', extra);
  }

  _populateRiskOptions() {
    if (!this.riskOptions) {
      let riskOptions = getChoices(`${this.basePermissionPath}.overall_risk_assessment.blueprints.risk.value`) || [];
      this.set('riskOptions', riskOptions);
    }
  }

  validate(forSave) {
    if (this.primaryArea.risk.extra.comments && !this.primaryArea.risk.value) {
      this.set('errors', {children: [{blueprints: [{risk: {value: 'Field is required'}}]}]});
      fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
      return false;
    }
    if (!this.basePermissionPath || forSave) {return true;}
    let required = isRequired(`${this.basePermissionPath}.overall_risk_assessment.blueprints.risk`);
    if (!required) {return true;}

    let riskValid = (this.$.riskAssessmentInput as EtoolsDropdownEl).validate(),
      commentsValid = (this.$.briefJustification as PaperTextareaElement).validate(),
      valid = riskValid && commentsValid;

    let errors = {
      children: [{
        blueprints: [{
          risk: {
            value: !riskValid ? 'Field is required' : false,
            extra: !commentsValid ? 'Field is required' : false
          }
        }]
      }]
    };
    this.set('errors', errors);
    if (!valid) {fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});}

    return valid;
  }

  getRiskData() {
    if (!this.primaryArea.risk.value) {
      return null;
    }

    let extra = this.isJSONObj(this.primaryArea.risk.extra) ?
      JSON.parse(this.primaryArea.risk.extra) :
      this.primaryArea.risk.extra;

    let originalExtra = get(this, 'originalData.blueprints[0].risk.extra');
    if (this.isJSONObj(originalExtra)) {originalExtra = JSON.parse(originalExtra);}

    if (this.originalData.blueprints[0].risk &&
      this.primaryArea.risk.value.value === this.originalData.blueprints[0].risk.value &&
      isEqual(extra, originalExtra)) {
      return null;
    }

    let risk = {
      value: this.primaryArea.risk.value.value,
      extra: this.primaryArea.risk.extra || {}
    };

    let blueprint = {
      id: this.riskData.blueprints[0].id,
      risk: risk
    };

    return {
      id: this.riskData.id,
      blueprints: [blueprint]
    };
  }

  errorHandler(errorData) {
    if (this.dialogOpened) {return;}
    this._errorHandler(errorData);
  }

}
window.customElements.define('primary-risk-element', PrimaryRiskElement);
