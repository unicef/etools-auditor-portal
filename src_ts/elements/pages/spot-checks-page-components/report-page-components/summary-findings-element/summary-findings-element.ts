import {PolymerElement, html} from "@polymer/polymer/polymer-element";
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-tooltip/paper-tooltip';
import {property} from '@polymer/decorators/lib/decorators';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {moduleStyles} from "../../../../styles-elements/module-styles";

import DateMixin from '../../../../app-mixins/date-mixin';
import TableElementsMixin from '../../../../app-mixins/table-elements-mixin';
import StaticDataMixin from '../../../../app-mixins/static-data-mixin';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {GenericObject} from "../../../../../types/global";

import find from 'lodash-es/find';
import each from 'lodash-es/each';
import isObject from 'lodash-es/isObject';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqualWith from 'lodash-es/isEqualWith';
import cloneWith from 'lodash-es/cloneWith';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin StaticDataMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin DateMixin
 */
class SummaryFindingsElement extends (CommonMethodsMixin
  (StaticDataMixin(TableElementsMixin(DateMixin(PolymerElement))))) {

  static get template() {
    // language=HTML
    return html`
        ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style>
        :host {
          .repeatable-item-container[without-line] {
            min-width: 0 !important;
            margin-bottom: 0 !important;
          }

          .confirm-text {
            padding: 5px 86px 0 23px !important;
          }
        }

        etools-content-panel {
          --ecp-content: {
            padding: 0;
          }
        }

      </style>

      <etools-content-panel list
                class="content-section clearfix"
                panel-title="Summary of [[priority.display_name]] Priority Findings and Recommendations">

            <div slot="panel-btns">
                <div hidden$="[[!_canBeChanged(basePermissionPath)]]">
                    <paper-icon-button
                            class="panel-button"
                            on-tap="openAddDialog"
                            icon="add-box">
                    </paper-icon-button>
                    <paper-tooltip offset="0">Add</paper-tooltip>
                </div>
            </div>

            <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

            <template is="dom-repeat" items="[[dataItems]]" filter="_showFindings">
                <list-element
                        class="list-element"
                        data="[[item]]"
                        base-permission-path="[[basePermissionPath]]"
                        item-index="[[index]]"
                        headings="[[columns]]"
                        details="[[details]]"
                        has-collapse
                        no-animation>
                    <div slot="custom">
                        [[getCategoryDisplayName(item.category_of_observation, '--')]]
                        <paper-tooltip offset="0">[[getCategoryDisplayName(item.category_of_observation)]]</paper-tooltip>
                    </div>
                    <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
                        <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
                        <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"></paper-icon-button>
                    </div>
                </list-element>
            </template>

            <template is="dom-if" if="[[!_getLength(dataItems, dataItems.length)]]">
                <list-element
                        class="list-element"
                        data="[[emptyObj]]"
                        headings="[[columns]]"
                        no-animation>
                </list-element>
            </template>
        </etools-content-panel>

        <etools-dialog theme="confirmation"
                       id="delete-summary-findings"
                       size="md"
                       opened="{{confirmDialogOpened}}"
                       keep-dialog-open
                       on-confirm-btn-clicked="removeItem"
                       ok-btn-text="Delete">
            Are you sure you want to delete this attachment?
        </etools-dialog>

        <etools-dialog size="md"
                       no-padding
                       id="summary-findings"
                       dialog-title="[[dialogTitle]]"
                       keep-dialog-open
                       opened="{{dialogOpened}}"
                       ok-btn-text="[[confirmBtnText]]"
                       show-spinner="{{requestInProcess}}"
                       disable-confirm-btn="{{requestInProcess}}"
                       on-confirm-btn-clicked="_addItemFromDialog">

            <div class="row-h repeatable-item-container" without-line>
                <div class="repeatable-item-content">
                    <div class="row-h group">
                        <div class="input-container input-container-l">
                            <!-- Category of Observation -->
                            <etools-dropdown label="[[getLabel('findings.category_of_observation', basePermissionPath)]]"
                                             placeholder="[[getPlaceholderText('findings.category_of_observation', basePermissionPath)]]"
                                             options="[[categoryOfObservation]]"
                                             option-label="display_name"
                                             option-value="value"
                                             selected="{{editedItem.category_of_observation}}"
                                             trigger-value-change-event
                                             required$="[[_setRequired('findings.category_of_observation', basePermissionPath)]]"
                                             disabled$="{{requestInProcess}}"
                                             readonly$="{{requestInProcess}}"
                                             invalid="{{errors.category_of_observation}}"
                                             error-message="{{errors.category_of_observation}}"
                                             on-focus="_resetFieldError"
                                             on-tap="_resetFieldError"
                                             hide-search>
                            </etools-dropdown>
                            <paper-tooltip offset="0">[[getCategoryDisplayName(editedItem.category_of_observation)]]</paper-tooltip>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-l">
                            <!-- Recommendation -->
                            <paper-textarea
                                    class$="disabled-as-readonly fixed-width validate-input {{_setRequired('findings.recommendation', basePermissionPath)}}"
                                    value="{{editedItem.recommendation}}"
                                    allowed-pattern="[\\d\\s]"
                                    label="[[getLabel('findings.recommendation', basePermissionPath)]]"
                                    always-float-label
                                    placeholder="[[getPlaceholderText('findings.recommendation', basePermissionPath)]]"
                                    required$="{{_setRequired('findings.recommendation', basePermissionPath)}}"
                                    disabled$="{{requestInProcess}}"
                                    readonly$="{{requestInProcess}}"
                                    max-rows="4"
                                    invalid="{{errors.recommendation}}"
                                    error-message="{{errors.recommendation}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </paper-textarea>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-l">
                            <!-- Agreed Action by IP -->
                            <paper-textarea
                                    class$="disabled-as-readonly fixed-width validate-input [[_setRequired('findings.agreed_action_by_ip', basePermissionPath)]]"
                                    value="{{editedItem.agreed_action_by_ip}}"
                                    allowed-pattern="[\\d\\s]"
                                    label="[[getLabel('findings.agreed_action_by_ip', basePermissionPath)]]"
                                    always-float-label
                                    placeholder="[[getPlaceholderText('findings.agreed_action_by_ip', basePermissionPath)]]"
                                    required$="[[_setRequired('findings.agreed_action_by_ip', basePermissionPath)]]"
                                    disabled$="{{requestInProcess}}"
                                    readonly$="{{requestInProcess}}"
                                    max-rows="4"
                                    invalid="{{errors.agreed_action_by_ip}}"
                                    error-message="{{errors.agreed_action_by_ip}}"
                                    on-focus="_resetFieldError"
                                    on-tap="_resetFieldError">
                            </paper-textarea>
                        </div>
                    </div>

                    <div class="row-h group">
                        <div class="input-container input-container-l">
                            <!-- Deadline of Action -->
                            <datepicker-lite
                                        id="deadlineActionSelector"
                                        selected-date-display-format="D MMM YYYY"
                                        placeholder="[[getPlaceholderText('findings.deadline_of_action', basePermissionPath)]]"
                                        label="[[getLabel('findings.deadline_of_action', basePermissionPath)]]"
                                        value="{{editedItem.deadline_of_action}}"
                                        error-message="{{errors.deadline_of_action}}"
                                        required$="[[_setRequired('findings.deadline_of_action', basePermissionPath)]]"
                                        disabled$="{{requestInProcess}}"
                                        readonly$="{{requestInProcess}}">
                            </datepicker-lite>
                        </div>
                    </div>
                </div>
            </div>
        </etools-dialog>
    `;
  }

  @property({type: Array})
  categoryOfObservation: any[] = [];

  @property({type: Array, notify: true})
  dataItems: any[] = [];

  @property({type: String})
  mainProperty: string = 'findings';

  @property({type: Object})
  itemModel: GenericObject = {};

  @property({type: Array})
  columns: GenericObject[] = [
    {
      'size': 25,
      'name': 'finding',
      'label': 'Finding Number',
    }, {
      'size': 50,
      'label': 'Subject Area',
      'labelPath': 'findings.category_of_observation',
      'custom': true,
      'property': 'category_of_observation',
      'doNotHide': false
    },
    {
      'size': 25,
      'name': 'date',
      'label': 'Deadline of Action',
      'labelPath': 'findings.deadline_of_action',
      'path': 'deadline_of_action'
    }
  ];

  @property({type: Array})
  details: GenericObject[] = [{
    'label': 'Recommendation',
    'labelPath': 'findings.recommendation',
    'path': 'recommendation',
    'size': 100
  }, {
    'label': 'Agreed Action by IP',
    'labelPath': 'findings.agreed_action_by_ip',
    'path': 'agreed_action_by_ip',
    'size': 100
  }];

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Finding'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Finding'};

  @property({type: Object})
  priority: GenericObject = {};

  @property({type: String, computed: 'getErrorBaseText(priority)'})
  errorBaseText!: string;

  @property({type: String})
  deleteTitle: string = 'Are you sure that you want to delete this finding?';



  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      '_setPriority(itemModel, priority)',
      '_complexErrorHandler(errorObject.findings)'
    ]
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('dialog-confirmed', this._addItemFromDialog);
    this.addEventListener('delete-confirmed', this.removeItem);
    this.categoryOfObservation = this.getData('category_of_observation');
    this.set('errors.deadline_of_action', false);
  }

  getErrorBaseText(priority) {
    if (!priority) {
      return '';
    }
    return `Summary of ${this.priority.display_name} Priority Findings and Recommendations: `;
  }

  getCategoryDisplayName(value, emptyValue) {
    let categoryOfObservation = find(this.categoryOfObservation, ['value', value]);
    return categoryOfObservation ? categoryOfObservation.display_name : emptyValue || '';
  }

  _getLength(dataItems) {
    if (!dataItems) {
      return;
    }
    return dataItems.filter((item) => {
      return item.priority === this.priority.value;
    }).length;
  }

  _setPriority(itemModel, priority) {
    itemModel.priority = priority.value;
    if (priority.value === 'high') {
      this.updateStyles({'--ecp-header-bg': 'var(--module-warning)'});
    }
  }

  _showFindings(item) {
    return this._showItems(item) && item.priority === this.priority.value;
  }

  getFindingsData() {
    if ((this.dialogOpened || this.confirmDialogOpened) && !this.saveWithButton) {
      return this.getCurrentData();
    }
    let data = [];
    each(this.dataItems, (item, index) => {
      if (item.priority !== this.priority.value) {
        return;
      }
      if (!item.deadline_of_action) {
        item.deadline_of_action = null;
      }
      let dataItem;
      if (isObject(item.category_of_observation)) {
        let preparedItem = cloneDeep(item);
        preparedItem.category_of_observation = item.category_of_observation.value;
        dataItem = preparedItem;
      } else {
        dataItem = item;
      }
      let compareItems = (changedObj, originalObj) => {
        return !((changedObj.category_of_observation && changedObj.category_of_observation !== originalObj.category_of_observation) ||
          (changedObj.deadline_of_action && changedObj.deadline_of_action !== originalObj.deadline_of_action) ||
          (changedObj.recommendation && changedObj.recommendation !== originalObj.recommendation) ||
          (changedObj.agreed_action_by_ip && changedObj.agreed_action_by_ip !== originalObj.agreed_action_by_ip));
      };
      if (!isEqualWith(dataItem, this.originalData[index], compareItems)) {
        data.push(dataItem);
      }
    });
    return data && data.length ? data : null;
  }

  getCurrentData() {
    if (!this.dialogOpened && !this.confirmDialogOpened) {
      return null;
    }
    let data = cloneWith(this.editedItem, (item) => {
      if (item.category_of_observation && item.category_of_observation.value) {
        item.category_of_observation = item.category_of_observation.value;
      }
      return item;
    });
    return [data];
  }

}

window.customElements.define('summary-findings-element', SummaryFindingsElement);
