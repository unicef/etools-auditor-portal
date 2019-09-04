import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/iron-icons/iron-icons';

import {moduleStyles} from '../../../../styles-elements/module-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '@unicef-polymer/etools-dropdown/etools-dropdown';

import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import {getStaticData} from '../../../../app-mixins/static-data-controller';
import TableElementsMixin from '../../../../app-mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';

import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import keys from 'lodash-es/keys';
import pick from 'lodash-es/pick';
import transform from 'lodash-es/transform';
import toNumber from 'lodash-es/toNumber';
import values from 'lodash-es/values';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {refactorErrorObject} from '../../../../app-mixins/error-handler';

/**
 * @customElement
 * @polymer
 * @appliesMixin  TableElementsMixin
 * @appliesMixin  CommonMethodsMixin
 */
class FindingsSummary extends CommonMethodsMixin(TableElementsMixin(PolymerElement)) {

  static get template() {
    // language=HTML
    return html`
      ${moduleStyles} ${tabLayoutStyles} ${tabInputsStyles}
      <style include="module-styles tab-layout-styles tab-inputs-styles">
        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }
        etools-dropdown#auditOpinionDropDown {
          --paper-listbox: {
            max-height: 140px;
          };
        }
      </style>

      <etools-content-panel list panel-title="Summary of Audit Findings">
        <list-header
            id="list-header"
            no-additional
            no-ordered
            data="[[headerColumns]]"
            base-permission-path="[[basePermissionPath]]">
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <list-element
              class="list-element"
              no-additional
              data="[[item]]"
              headings="[[columns]]">
            <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
              <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
            </div>
          </list-element>
        </template>
      </etools-content-panel>

      <etools-dialog id="findings-summary"
                     size="md"
                     no-padding
                     keep-dialog-open
                     opened="{{dialogOpened}}"
                     on-confirm-btn-clicked="_addItemFromDialog"
                     dialog-title="[[dialogTitle]]"
                     ok-btn-text="Save">

        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container">
                <!-- Implementing partner name -->
                <paper-input
                    class="validate-input disabled-as-readonly"
                    value="{{editedItem.partner.name}}"
                    label$="[[getLabel('partner.name', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('partner.name', basePermissionPath)]]"
                    disabled
                    readonly>
                </paper-input>
                <paper-tooltip offset="0">[[editedItem.partner.name]]</paper-tooltip>
              </div>

              <div class="input-container">
                <!-- Audited expenditure (USD) -->
                <etools-currency-amount-input
                    id="audited-expenditure"
                    class$="validate-input disabled-as-readonly [[_setRequired('audited_expenditure', basePermissionPath)]]"
                    value="{{editedItem.audited_expenditure}}"
                    currency="$"
                    label$="[[getLabel('audited_expenditure', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('audited_expenditure', basePermissionPath)]]"
                    required$="[[_setRequired('audited_expenditure', basePermissionPath)]]"
                    disabled$="[[requestInProcess]]"
                    readonly$="[[requestInProcess]]"
                    invalid="{{errors.audited_expenditure}}"
                    error-message="{{errors.audited_expenditure}}"
                    on-blur="customValidation"
                    on-focus="_resetFieldError"
                    on-tap="_resetFieldError">
                </etools-currency-amount-input>
              </div>

              <div class="input-container">
                <!-- Financial findings (USD) -->
                <etools-currency-amount-input
                    id="financial-findings"
                    class$="validate-input disabled-as-readonly [[_setRequired('financial_findings', basePermissionPath)]]"
                    value="{{editedItem.financial_findings}}"
                    currency="$"
                    label$="[[getLabel('financial_findings', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('financial_findings', basePermissionPath)]]"
                    required$="[[_setRequired('financial_findings', basePermissionPath)]]"
                    disabled$="[[requestInProcess]]"
                    readonly$="[[requestInProcess]]"
                    invalid="{{errors.financial_findings}}"
                    error-message="{{errors.financial_findings}}"
                    on-blur="customValidation"
                    on-focus="_resetFieldError"
                    on-tap="_resetFieldError">
                </etools-currency-amount-input>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container">
                <!-- % of audited expenditure -->
                <etools-currency-amount-input
                    class$="validate-input disabled-as-readonly"
                    value="{{editedItem.percent_of_audited_expenditure}}"
                    currency=""
                    label$="[[getLabel('percent_of_audited_expenditure', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('percent_of_audited_expenditure', basePermissionPath)]]"
                    disabled="disabled"
                    readonly>
                </etools-currency-amount-input>
              </div>

              <div class="input-container">
                <!-- Audit opinion -->
                <etools-dropdown id="auditOpinionDropDown"
                    class$="validate-input disabled-as-readonly [[_setRequired('audit_opinion', basePermissionPath)]]"
                    selected="{{editedItem.audit_opinion}}"
                    label$="[[getLabel('audit_opinion', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('audit_opinion', basePermissionPath)]]"
                    options="[[auditOpinions]]"
                    option-label="display_name"
                    option-value="value"
                    required$="[[_setRequired('audit_opinion', basePermissionPath)]]"
                    disabled$="[[requestInProcess]]"
                    readonly$="[[requestInProcess]]"
                    invalid="{{errors.audit_opinion}}"
                    error-message="{{errors.audit_opinion}}"
                    on-focus="_resetFieldError"
                    on-tap="_resetFieldError"
                    hide-search>
                </etools-dropdown>
              </div>

              <div class="input-container">
                <!-- Number of financial findings -->
                <paper-input
                    class="disabled-as-readonly"
                    value="{{editedItem.number_of_financial_findings}}"
                    label$="[[getLabel('number_of_financial_findings', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('number_of_financial_findings', basePermissionPath)]]"
                    disabled
                    readonly>
                </paper-input>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container">
                <!-- High risk -->
                <paper-input
                    class="disabled-as-readonly"
                    value="{{editedItem.key_internal_weakness.high_risk_count}}"
                    label$="[[getLabel('key_internal_weakness.high_risk_count', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('key_internal_weakness.high_risk_count', basePermissionPath)]]"
                    disabled
                    readonly>
                </paper-input>
              </div>

              <div class="input-container">
                <!-- Medium risk -->
                <paper-input
                    class="disabled-as-readonly"
                    value="{{editedItem.key_internal_weakness.medium_risk_count}}"
                    label$="[[getLabel('key_internal_weakness.medium_risk_count', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('key_internal_weakness.medium_risk_count', basePermissionPath)]]"
                    disabled
                    readonly>
                </paper-input>
              </div>

              <div class="input-container">
                <!-- Low risk -->
                <paper-input
                    class="disabled-as-readonly"
                    value="{{editedItem.key_internal_weakness.low_risk_count}}"
                    label$="[[getLabel('key_internal_weakness.low_risk_count', basePermissionPath)]]"
                    placeholder$="[[getPlaceholderText('key_internal_weakness.low_risk_count', basePermissionPath)]]"
                    disabled
                    readonly>
                </paper-input>
              </div>
            </div>
          </div>
        </div>

      </etools-dialog>
    `;
  }

  @property({type: String})
  basePermissionPath: string = '';

  @property({type: String})
  mainProperty: string = 'financial_findings';

  @property({type: Object})
  itemModel: GenericObject = {
    audited_expenditure: undefined,
    financial_findings: undefined,
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

  @property({type: Array})
  columns: GenericObject[] = [{
    'size': 25,
    'label': 'IP name',
    'path': 'partner.name'
  }, {
    'size': 20,
    'name': 'currency',
    'label': 'Audited Expenditure $ ',
    'path': 'audited_expenditure',
    'align': 'right'
  }, {
    'size': 15,
    'name': 'currency',
    'label': 'Financial Findings $ ',
    'path': 'financial_findings',
    'align': 'right'
  }, {
    'size': 20,
    'name': 'percents',
    'label': '% Of Audited Expenditure',
    'path': 'percent_of_audited_expenditure',
    'align': 'right'
  }, {
    'size': 20,
    'label': 'Audit Opinion',
    'labelPath': 'audit_opinion',
    'path': 'display_name',
    'align': 'center'
  }, {
    'size': '80px',
    'label': 'No. of Financial Findings',
    'path': 'number_of_financial_findings',
    'align': 'center'
  }, {
    'size': '60px',
    'label': 'High Risk',
    'path': 'key_internal_weakness.high_risk_count',
    'align': 'center'
  }, {
    'size': '60px',
    'label': 'Medium Risk',
    'path': 'key_internal_weakness.medium_risk_count',
    'align': 'center'
  }, {
    'size': '60px',
    'label': 'Low Risk',
    'path': 'key_internal_weakness.low_risk_count',
    'align': 'center'
  }];

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      '_errorHandler(errorObject)',
      '_setDataItems(data)',
      '_setAuditOpinion(data.audit_opinion, auditOpinions)',
      'updateStyles(basePermissionPath, requestInProcess)',
      '_setAuditedExpenditure(editedItem.financial_findings, editedItem.audited_expenditure)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    this.auditOpinions = getStaticData('audit_opinions') || [];
    let headerColumns = cloneDeep(this.columns),
        group = headerColumns.slice(-3),
        groupColumn = {
          'group': true,
          'label': 'No. of Key Control Weaknesses',
          'align': 'center',
          'size': '180px',
          'columns': group
        };
    this.headerColumns = headerColumns.slice(0, -3).concat([groupColumn]);
  }

  _setDataItems() {
    if (this.data.percent_of_audited_expenditure) {
      this.set('data.percent_of_audited_expenditure', this.data.percent_of_audited_expenditure.toFixed(2));
    }
    this.set('dataItems', [this.data]);
    this.set('itemModel.audit_opinion', this.data.audit_opinion);
    this.set('itemModel.partner.name', this.data.partner && this.data.partner.name);
  }

  getFindingsSummaryData() {
    if (isEqual(this.editedItem, this.itemModel)) {
      return;
    }

    let itemModelKeys = keys(this.itemModel) || [];
    let originalData;
    let data;

    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });

    if (this.dialogOpened) {
      data = pick(this.editedItem, itemModelKeys);
    } else {
      data = pick(this.originalData && this.originalData[0], itemModelKeys);
    }
    originalData = pick(this.originalData && this.originalData[0], itemModelKeys);


    if (!isEqual(data, originalData)) {
      //return only changed values
      return transform(data, function(result, value, key) {
        if (value !== originalData[key]) {
          result[key] = value;
        }
      }, {});
    }
  }

  _setAuditOpinion(auditOpinionValue, auditOpinions) {
    if (auditOpinions && auditOpinions.length > 0) {
      let auditOpinion = auditOpinions.find(function(auditOpinion) {
        return auditOpinion.value === auditOpinionValue;
      }) || {};
      this.data.opinion = auditOpinion;
      this.data.display_name = auditOpinion.display_name;
    }
  }

  _setAuditedExpenditure(financialFindings, auditedExpenditure) {
    let ffNumber = toNumber(financialFindings);
    let aeNumber = toNumber(auditedExpenditure);
    let val = aeNumber === 0 ? 0 : Math.floor(ffNumber / aeNumber * 100);
    this.set('editedItem.percent_of_audited_expenditure', val);
  }

  _errorHandler(errorData) {
    this.requestInProcess = false;
    if (!errorData) {
      return;
    }

    let refactoredData = refactorErrorObject(errorData);
    let itemModelKeys = keys(this.itemModel) || [];
    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });
    let findingsSummaryErrors = pick(refactoredData, itemModelKeys);

    if (!this.dialogOpened && values(findingsSummaryErrors).length) {
      fireEvent(this, 'toast', {text: 'Please fill in the Summary of Audit Findings.'});
    } else {
      this.set('errors', refactoredData);
    }
  }

  customValidation() {
    let ffElement = this.$['financial-findings'],
        ffNumber = ffElement && toNumber(ffElement.value);
    let aeElement = this.$['audited-expenditure'],
        aeNumber = aeElement && toNumber(aeElement.value);

    if (aeNumber < ffNumber) {
      ffElement.invalid = 'Cannot exceed Audited Expenditure';
      return false;
    } else {
      ffElement.invalid = '';
      return true;
    }
  }

}

window.customElements.define('findings-summary', FindingsSummary);

export {FindingsSummary as FindingsSummaryEl};
