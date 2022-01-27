import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-input/paper-textarea';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';

import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {getChoices} from '../../../../mixins/permission-controller';
import sortBy from 'lodash-es/sortBy';
import {checkNonField} from '../../../../mixins/error-handler';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
class FinancialFindings extends CommonMethodsMixin(TableElementsMixin(PolymerElement)) {
  static get template() {
    // language=HTML
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style>
        .repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
        etools-dropdown#titleOptionsDropDown {
          --paper-listbox: {
            max-height: 340px;
          }
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        panel-title="[[getLabel('financial_finding_set', basePermissionPath)]]"
        list
      >
        <div slot="panel-btns">
          <div hidden$="[[!_canBeChanged(basePermissionPath)]]">
            <paper-icon-button class="panel-button" on-tap="openAddDialog" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <list-header id="list-header" no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]">
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <list-element
            class="list-element"
            data="[[item]]"
            base-permission-path="[[basePermissionPath]]"
            item-index="[[index]]"
            headings="[[columns]]"
            details="[[details]]"
            has-collapse
            no-animation
          >
            <div slot="custom">[[getDisplayName('financial_finding_set.title', basePermissionPath, item.title)]]</div>
            <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
              <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
              <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"></paper-icon-button>
            </div>
          </list-element>
        </template>

        <template is="dom-if" if="[[!dataItems.length]]">
          <list-element class="list-element" data="[[emptyObj]]" headings="[[columns]]" no-animation> </list-element>
        </template>
      </etools-content-panel>

      <etools-dialog
        theme="confirmation"
        size="md"
        keep-dialog-open
        opened="{{confirmDialogOpened}}"
        on-confirm-btn-clicked="removeItem"
        ok-btn-text="Delete"
        openFlag="confirmDialogOpened"
        on-close="_resetDialogOpenedFlag"
      >
        [[deleteTitle]]
      </etools-dialog>

      <etools-dialog
        id="financial-findings"
        no-padding
        size="md"
        opened="{{dialogOpened}}"
        keep-dialog-open
        dialog-title="[[dialogTitle]]"
        ok-btn-text="Add"
        show-spinner="{{requestInProcess}}"
        disable-confirm-btn="{{requestInProcess}}"
        on-confirm-btn-clicked="_addItemFromDialog"
        openFlag="dialogOpened"
        on-close="_resetDialogOpenedFlag"
      >
        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Title -->
                <etools-dropdown
                  id="titleOptionsDropDown"
                  class$="[[_setRequired('financial_finding_set.title', basePermissionPath)]]
                            disabled-as-readonly validate-input"
                  label="[[getLabel('financial_finding_set.title', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.title', basePermissionPath)]]"
                  options="[[titleOptions]]"
                  option-label="display_name"
                  option-value="value"
                  selected="{{editedItem.title}}"
                  required$="[[_setRequired('financial_finding_set.title', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  invalid="{{errors.title}}"
                  error-message="{{errors.title}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                  hide-search
                >
                </etools-dropdown>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-ms">
                <!-- Amount (local) -->
                <etools-currency-amount-input
                  class$="{{_setRequired('financial_finding_set.local_amount', basePermissionPath)}}
                            disabled-as-readonly validate-input"
                  value="{{editedItem.local_amount}}"
                  currency=""
                  label="[[getLabel('financial_finding_set.local_amount', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.local_amount', basePermissionPath)]]"
                  required$="[[_setRequired('financial_finding_set.local_amount', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  invalid$="[[errors.local_amount]]"
                  error-message="{{errors.local_amount}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>

              <div class="input-container input-container-ms">
                <!-- Amount USD -->
                <etools-currency-amount-input
                  class$="{{_setRequired('financial_finding_set.amount', basePermissionPath)}}
                            disabled-as-readonly validate-input"
                  value="{{editedItem.amount}}"
                  currency="$"
                  label="[[getLabel('financial_finding_set.amount', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.amount', basePermissionPath)]]"
                  required$="[[_setRequired('financial_finding_set.amount', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  invalid$="[[errors.amount]]"
                  error-message$="[[errors.amount]]"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </etools-currency-amount-input>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Description -->
                <paper-textarea
                  class$="[[_setRequired('financial_finding_set.description', basePermissionPath)]]
                            disabled-as-readonly fixed-width validate-input"
                  value="{{editedItem.description}}"
                  allowed-pattern="[\\d\\s]"
                  label="[[getLabel('financial_finding_set.description', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.description', basePermissionPath)]]"
                  required$="[[_setRequired('financial_finding_set.description', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  max-rows="4"
                  invalid$="[[errors.description]]"
                  error-message$="[[errors.description]]"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </paper-textarea>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Recommendation -->
                <paper-textarea
                  class$="[[_setRequired('financial_finding_set.recommendation', basePermissionPath)]]
                            disabled-as-readonly fixed-width validate-input"
                  value="{{editedItem.recommendation}}"
                  allowed-pattern="[\\d\\s]"
                  label="[[getLabel('financial_finding_set.recommendation', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.recommendation', basePermissionPath)]]"
                  required$="[[_setRequired('financial_finding_set.recommendation', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  max-rows="4"
                  invalid$="[[errors.recommendation]]"
                  error-message$="[[errors.recommendation]]"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </paper-textarea>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- IP comments -->
                <paper-textarea
                  class$="[[_setRequired('financial_finding_set.ip_comments', basePermissionPath)]]
                            disabled-as-readonly fixed-width validate-input"
                  value="{{editedItem.ip_comments}}"
                  allowed-pattern="[\\d\\s]"
                  label="[[getLabel('financial_finding_set.ip_comments', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('financial_finding_set.ip_comments', basePermissionPath)]]"
                  required$="[[_setRequired('financial_finding_set.ip_comments', basePermissionPath)]]"
                  disabled$="[[requestInProcess]]"
                  readonly$="[[requestInProcess]]"
                  max-rows="4"
                  invalid$="[[errors.ip_comments]]"
                  error-message$="[[errors.ip_comments]]"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError"
                >
                </paper-textarea>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array, notify: true})
  dataItems!: any[];

  @property({type: String})
  mainProperty = 'financial_finding_set';

  @property({type: Object})
  itemModel: GenericObject = {
    title: '',
    local_amount: '',
    amount: '',
    description: '',
    recommendation: '',
    ip_comments: ''
  };

  @property({type: Array})
  columns: GenericObject[] = [
    {
      size: 20,
      name: 'finding',
      label: 'Finding Number'
    },
    {
      size: 40,
      label: 'Title (Category)',
      labelPath: 'financial_finding_set.title',
      property: 'title',
      custom: true,
      doNotHide: false
    },
    {
      size: 20,
      name: 'currency',
      label: 'Amount (local)',
      labelPath: 'financial_finding_set.local_amount',
      path: 'local_amount',
      align: 'right'
    },
    {
      size: 20,
      name: 'currency',
      label: 'Amount USD',
      labelPath: 'financial_finding_set.amount',
      path: 'amount',
      align: 'right'
    }
  ];

  @property({type: Array})
  details: GenericObject[] = [
    {
      size: 100,
      label: 'Description',
      labelPath: 'financial_finding_set.description',
      path: 'description'
    },
    {
      size: 100,
      label: 'Recommendation',
      labelPath: 'financial_finding_set.recommendation',
      path: 'recommendation'
    },
    {
      size: 100,
      label: 'IP comments',
      labelPath: 'financial_finding_set.ip_comments',
      path: 'ip_comments'
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Add New Finding'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Finding'
  };

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  @property({type: Array})
  titleOptions: any[] = [];

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      '_errorHandler(errorObject.financial_finding_set)',
      '_checkNonField(errorObject.financial_finding_set)',
      'setChoices(basePermissionPath)'
    ];
  }

  setChoices(basePath) {
    const unsortedOptions = getChoices(`${basePath}.financial_finding_set.title`);
    const titleOptions = sortBy(unsortedOptions, ['display_name']);
    this.set('titleOptions', titleOptions || []);
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Financial Findings: ${nonField}`});
    }
  }
}

window.customElements.define('financial-findings', FinancialFindings);

export {FinancialFindings as FinancialFindingsEl};
