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
import {EtoolsCurrencyAmountInput} from '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';

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
      <style>
        etools-content-panel {
          --ecp-content: {
            padding: 0;
          }
        }
        etools-dropdown#auditOpinionDropDown {
          --paper-listbox: {
            max-height: 140px;
          }
        }
        .row-h {
          margin-bottom: 0;
        }
        .input-container {
          height: 75px;
        }
      </style>

      <etools-content-panel list panel-title="Summary of Audit Findings">
        <list-header
          id="list-header"
          no-additional
          no-ordered
          data="[[headerColumns]]"
          base-permission-path="[[basePermissionPath]]"
        >
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <list-element class="list-element" no-additional data="[[item]]" headings="[[columns]]">
            <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
              <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
            </div>
          </list-element>
        </template>
      </etools-content-panel>

      <etools-dialog
        id="findings-summary"
        size="md"
        no-padding
        keep-dialog-open
        opened="{{dialogOpened}}"
        on-confirm-btn-clicked="_addItemFromDialog"
        dialog-title="[[dialogTitle]]"
        ok-btn-text="Save"
      >
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
                  readonly
                >
                </paper-input>
                <paper-tooltip offset="0">[[editedItem.partner.name]]</paper-tooltip>
              </div>

              <div class="input-container">
                <!-- Audited expenditure (USD) -->
                <etools-currency-amount-input
                  id="audited-expenditure"
                  class$="[[_setRequired('audited_expenditure', basePermissionPath)]]
                            validate-input disabled-as-readonly"
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
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container">
                <!-- Financial findings (USD) -->
                <etools-currency-amount-input
                  id="financial-findings"
                  class$="[[_setRequired('financial_findings', basePermissionPath)]]
                            validate-input disabled-as-readonly"
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
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container" hidden$="[[!showLocalCurrency]]">
                <!-- Audited expenditure (Local) -->
                <etools-currency-amount-input
                  id="audited-expenditure-local"
                  class$="validate-input disabled-as-readonly
                        [[_setRequired('audited_expenditure_local', basePermissionPath)]]"
                  value="{{editedItem.audited_expenditure_local}}"
                  currency="[[data.currency_of_report]]"
                  label$="[[getLocalLabel('audited_expenditure_local', basePermissionPath)]]"
                  placeholder$="[[getPlaceholderText('audited_expenditure_local', basePermissionPath)]]"
                  required$="[[_setRequired('audited_expenditure_local', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  invalid="{{errors.audited_expenditure_local}}"
                  error-message="{{errors.audited_expenditure_local}}"
                  on-blur="customValidation"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container" hidden$="[[!showLocalCurrency]]">
                <!-- Financial findings (Local) -->
                <etools-currency-amount-input
                  id="financial-findings-local"
                  class$="validate-input disabled-as-readonly
                      [[_setRequired('financial_findings_local', basePermissionPath)]]"
                  value="{{editedItem.financial_findings_local}}"
                  currency="[[data.currency_of_report]]"
                  label$="[[getLocalLabel('financial_findings_local', basePermissionPath)]]"
                  placeholder$="[[getPlaceholderText('financial_findings_local', basePermissionPath)]]"
                  required$="[[_setRequired('financial_findings_local', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  invalid="{{errors.financial_findings_local}}"
                  error-message="{{errors.financial_findings_local}}"
                  on-blur="customValidation"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container">
                <!-- % of audited expenditure -->
                <etools-currency-amount-input
                  class$="validate-input disabled-as-readonly"
                  value="{{editedItem.percent_of_audited_expenditure}}"
                  currency=""
                  label$="[[getLabel('percent_of_audited_expenditure', basePermissionPath)]]"
                  placeholder$="[[getPlaceholderText('percent_of_audited_expenditure', basePermissionPath)]]"
                  disabled="disabled"
                  readonly
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container">
                <!-- Audit opinion -->
                <etools-dropdown
                  id="auditOpinionDropDown"
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
                  hide-search
                >
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
                  readonly
                >
                </paper-input>
              </div>

              <div class="input-container">
                <!-- High risk -->
                <paper-input
                  class="disabled-as-readonly"
                  value="{{editedItem.key_internal_weakness.high_risk_count}}"
                  label$="[[getLabel('key_internal_weakness.high_risk_count', basePermissionPath)]]"
                  placeholder$="[[getPlaceholderText('key_internal_weakness.high_risk_count', basePermissionPath)]]"
                  disabled
                  readonly
                >
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
                  readonly
                >
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
                  readonly
                >
                </paper-input>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: String})
  basePermissionPath!: string;

  @property({type: String})
  mainProperty = 'financial_findings';

  @property({type: Object})
  itemModel: GenericObject = {
    audited_expenditure: undefined,
    financial_findings: undefined,
    audited_expenditure_local: undefined,
    financial_findings_local: undefined,
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

  @property({type: Boolean})
  showLocalCurrency = false;

  @property({type: Array})
  headerColumns!: GenericObject[];

  @property({type: Array})
  columns!: GenericObject[];

  @property({type: Array})
  defaultColumns: GenericObject[] = [
    {
      size: 20,
      label: 'IP name',
      path: 'partner.name'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Audited Expenditure $ ',
      path: 'audited_expenditure',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Financial Findings $ ',
      path: 'financial_findings',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Audited Expenditure ',
      path: 'audited_expenditure_local',
      align: 'right'
    },
    {
      size: 12,
      name: 'currency',
      label: 'Financial Findings ',
      path: 'financial_findings_local',
      align: 'right'
    },
    {
      size: 12,
      name: 'percents',
      label: '% Of Audited Expenditure',
      path: 'percent_of_audited_expenditure',
      align: 'right'
    },
    {
      size: 12,
      label: 'Audit Opinion',
      labelPath: 'audit_opinion',
      path: 'display_name',
      align: 'center'
    },
    {
      size: '80px',
      label: 'No. of Financial Findings',
      path: 'number_of_financial_findings',
      align: 'center'
    },
    {
      size: '60px',
      label: 'High Risk',
      path: 'key_internal_weakness.high_risk_count',
      align: 'center'
    },
    {
      size: '60px',
      label: 'Medium Risk',
      path: 'key_internal_weakness.medium_risk_count',
      align: 'center'
    },
    {
      size: '60px',
      label: 'Low Risk',
      path: 'key_internal_weakness.low_risk_count',
      align: 'center'
    }
  ];

  @property({type: Object})
  colSizesWithoutLocal: GenericObject = {
    audited_expenditure: 20,
    financial_findings: 15,
    display_name: 20
  };

  @property({type: Object})
  originalData!: GenericObject;

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'fundingsSummaryErrHandler(errorObject)',
      '_setDataItems(data)',
      '_setAuditOpinion(data.audit_opinion, auditOpinions)',
      'updateStyles(basePermissionPath, requestInProcess)',
      '_setAuditedExpenditure(editedItem.financial_findings, editedItem.audited_expenditure)',
      'currencyChanged(data.currency_of_report)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.auditOpinions = getStaticData('audit_opinions') || [];
    this.setColumnsAndHeaders();
  }

  setColumnsAndHeaders() {
    // if local currency it's not used, local columns will not be displayed
    // and the size of some displayed columns will be increased
    let columns = cloneDeep(this.defaultColumns);
    if (!this.showLocalCurrency) {
      columns = columns.filter((col: GenericObject) => {
        if (this.colSizesWithoutLocal[col.path]) {
          col.size = this.colSizesWithoutLocal[col.path];
        }
        return col.path !== 'audited_expenditure_local' && col.path !== 'financial_findings_local';
      });
    }

    this.columns = columns;
    const headerColumns = cloneDeep(columns);
    const group = headerColumns.slice(-3);
    const groupColumn = {
      group: true,
      label: 'No. of Key Control Weaknesses',
      align: 'center',
      size: '180px',
      columns: group
    };
    // for local currency columns need to avoid list-header logic of setting labels and set htmlLabel property for this
    if (this.showLocalCurrency) {
      headerColumns
        .filter((h) => h.path === 'financial_findings_local' || h.path === 'audited_expenditure_local')
        .forEach((h) => (h.htmlLabel = this.getLocalLabel(h.path, this.basePermissionPath)));
    }
    this.headerColumns = headerColumns.slice(0, -3).concat([groupColumn]);
  }

  _setDataItems() {
    this.setShowLocalCurrency();
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
    let data: any;

    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });

    if (this.dialogOpened) {
      data = pick(this.editedItem, itemModelKeys);
    } else {
      data = pick(this.originalData && this.originalData[0], itemModelKeys);
    }
    const originalData = pick(this.originalData && this.originalData[0], itemModelKeys);

    if (!isEqual(data, originalData)) {
      // return only changed values
      return transform(
        data,
        function (result, value, key) {
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

  _setAuditedExpenditure(financialFindings, auditedExpenditure) {
    const ffNumber = toNumber(financialFindings);
    const aeNumber = toNumber(auditedExpenditure);
    const val = aeNumber === 0 ? 0 : Math.floor((ffNumber / aeNumber) * 100);
    this.set('editedItem.percent_of_audited_expenditure', val);
  }

  fundingsSummaryErrHandler(errorData) {
    this.requestInProcess = false;
    if (!errorData) {
      return;
    }

    const refactoredData = refactorErrorObject(errorData);
    let itemModelKeys = keys(this.itemModel) || [];
    itemModelKeys = itemModelKeys.filter((key) => {
      return key !== 'partner' && key !== 'opinion';
    });
    const findingsSummaryErrors = pick(refactoredData, itemModelKeys);

    if (!this.dialogOpened && values(findingsSummaryErrors).length) {
      fireEvent(this, 'toast', {text: 'Please fill in the Summary of Audit Findings.'});
    } else {
      this.set('errors', refactoredData);
    }
  }

  customValidation() {
    const ffElement = (this.$['financial-findings'] as unknown) as EtoolsCurrencyAmountInput;
    const ffNumber = ffElement && toNumber(ffElement.value);
    const aeElement = (this.$['audited-expenditure'] as unknown) as EtoolsCurrencyAmountInput;
    const aeNumber = aeElement && toNumber(aeElement.value);

    if (aeNumber < ffNumber) {
      ffElement.invalid = true;
      ffElement.errorMessage = 'Cannot exceed Audited Expenditure';
      return false;
    } else {
      ffElement.invalid = false;
      return true;
    }
  }

  currencyChanged() {
    const prevShowLocalCurrency = this.showLocalCurrency;
    this.setShowLocalCurrency();
    if (prevShowLocalCurrency != this.showLocalCurrency) {
      this.setColumnsAndHeaders();
    }
  }

  setShowLocalCurrency() {
    this.showLocalCurrency =
      this.data.currency_of_report !== undefined &&
      this.data.currency_of_report !== '' &&
      this.data.currency_of_report !== 'USD';
  }

  getLocalLabel(path, base) {
    return String(this.getLabel(path, base));
  }
}

window.customElements.define('findings-summary', FindingsSummary);

export {FindingsSummary as FindingsSummaryEl};
