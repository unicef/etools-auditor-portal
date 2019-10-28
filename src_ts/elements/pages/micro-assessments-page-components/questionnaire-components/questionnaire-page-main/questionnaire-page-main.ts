import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {moduleStyles} from '../../../../styles-elements/module-styles';
import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {property, query} from '@polymer/decorators';
import each from 'lodash-es/each';
import isString from 'lodash-es/isString';
import isEmpty from 'lodash-es/isEmpty';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {GenericObject} from '../../../../../types/global';
import {getChoices} from '../../../../app-mixins/permission-controller';
import '../risk-tab/risk-tab';
import {checkNonField} from '../../../../app-mixins/error-handler';
import {refactorErrorObject} from '../../../../app-mixins/error-handler';

class QuestionnairePageMain extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      ${moduleStyles} ${tabInputsStyles}
      <style>
        etools-content-panel.totals {
          margin-bottom: 24px;

          --ecp-header-height: 51px;
          --ecp-header-bg: var(--module-warning);
        }
        .result-element {
          position: relative;
          height: 58px;
          padding: 16px calc(2% + 120px) 16px 2%;
          box-sizing: border-box;
          font-size: 17px;
        }
        .result-element .text {
          width: 100%;
          display: inline-block;
          padding-right: 10px;
          box-sizing: border-box;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .result-element .value {
          position: absolute;
          right: 2%;
          top: 16px;
          width: 120px;
          display: inline-block;
          text-align: center;
          font-weight: 800;
        }
        .result-element .value .low {
          color: var(--module-success);
        }
        .result-element .value .medium {
          color: var(--module-warning);
        }
        .result-element .value .significant, .result-element .value .high {
          color: var(--module-error);
        }
        .result-element .risk-rating .value {
          font-weight: 400;
        }
        .result-element .result-element {
          border-bottom: solid 1px #e8e8e8;
        }
        .repeatable-item-container {
          margin-bottom: 0 !important;
          min-width: 0 !important;
        }
        div[list-item]{
           overflow: visible !important;
        }
        etools-dropdown#riskAssessmentDropdown {
          --paper-listbox: {
            max-height: 140px;
          };
        }
      </style>

      <etools-content-panel class="totals" panel-title$="OVERALL RISK RATING [[getRating(riskAssessment)]]"
        open="{{overalRiskOpen}}">
      </etools-content-panel>

      <template is="dom-repeat" items="{{questionnaire.children}}">
        <risk-tab 
              questionnaire="{{item}}" 
              base-permission-path="{{basePermissionPath}}" 
              class="validatable-tab risk-tab"
              index="{{index}}" 
              first-run="[[firstRun]]" 
              completed="{{_checkCompleted(item)}}"
              disabled="{{_checkDisabled(index, item)}}" 
              edit-mode="[[editMode]]">
        </risk-tab>
      </template>

      <etools-dialog no-padding keep-dialog-open size="md" opened="{{dialogOpened}}" dialog-title="Edit Question"
        ok-btn-text="Save" show-spinner="{{requestInProcess}}" disable-confirm-btn="{{requestInProcess}}"
        on-confirm-btn-clicked="_addItemFromDialog">
        <div class="row-h repeatable-item-container" without-line>
          <div class="form-title">
            <div class="text" id="questionHeader">[[editedItem.header]]</div>
          </div>

          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container  input-container-ms">
                <!-- Risk Assessment -->

                <etools-dropdown id="riskAssessmentDropdown" class="disabled-as-readonly
                  required validate-input"
                  selected=[[editedItem.risk.value]]
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  options="[[riskOptions]]"
                  option-label="display_name"
                  option-value="value"
                  disabled="[[requestInProcess]]"
                  readonly="[[requestInProcess]]"
                  invalid="{{riskAssessmentInvalid}}"
                  error-message="This field is required" on-focus="_resetFieldError"
                  required
                  trigger-value-change-event
                  on-etools-selected-item-changed="_setSelectedRiskRatingEntity"
                  hide-search>
                </etools-dropdown>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l comment-container">
                <!-- Comments -->
                <paper-textarea id="riskAssessmentComments"
                  class="disabled-as-readonly validate-input"
                  value="{{editedItem.risk.extra.comments}}"
                  label="Comments" placeholder="Enter Comments"
                  disabled$="[[requestInProcess]]"
                  max-rows="4"
                  error-message="This field is required"
                  on-focus="_resetFieldError">
                </paper-textarea>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object, observer: 'dataChanged'})
  data!: object;

  @property({type: Object})
  questionnaire: {children?: []} = {};

  @property({type: Object})
  riskRatingOptions = {
    'na': 'N/A',
    'low': 'Low',
    'medium': 'Medium',
    'significant': 'Significant',
    'high': 'High',
    'moderate': 'Moderate'
  };

  @property({type: Boolean})
  firstRun: boolean = true;

  @property({type: Object, observer: 'savingError'})
  errorObject!: object;

  @property({type: Boolean})
  overalRiskOpen: boolean = false;

  @property({type: Array})
  changedData: GenericObject[] = [];

  @property({type: Number, readOnly: true})
  requests: number = 0;

  @property({type: String})
  riskAssessment: string = '';

  @property({type: String})
  basePermissionPath!: string; // engagement_[id]

  @property({type: Object})
  editedItem!: GenericObject;

  @property({type: Boolean})
  dialogOpened: boolean = false;

  @property({type: Boolean})
  requestInProcess: boolean = false;

  @query('#riskAssessmentDropdown')
  riskAssessmentDropdown!: EtoolsDropdownEl;

  @property({type: Boolean})
  editMode: boolean = false;

  private tabId!: string;
  private categoryId!: string;
  private originalComments!: string;
  private originalRiskValue!: string;

  static get observers() {
    return [
      'updateStyles(requestInProcess)',
      'resetDialog(dialogOpened)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    const riskOptions = getChoices(`${this.basePermissionPath}.questionnaire.blueprints.risk.value`) || [];
    this.set('riskOptions', riskOptions);

    this.addEventListener('edit-blueprint', this._openEditDialog as any);
    this.addEventListener('risk-value-changed', this._riskValueChanged as any);

  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('edit-blueprint', this._openEditDialog as any);
    this.removeEventListener('risk-value-changed', this._riskValueChanged as any);
  }

  dataChanged(data) {
    this.editMode = !this.isReadOnly('questionnaire', this.basePermissionPath);

    if (!data) {return;}
    if (!isEmpty(this.questionnaire) && this.firstRun) {
      this.firstRun = false;
    }
    this.requestsCount(-1);

    if (!this.requestsCount()) {
      this.questionnaire = data;
    }
    if (this.dialogOpened && this.requestInProcess) {
      this.requestInProcess = false;
      this.dialogOpened = false;
      this.resetDialog();
    }
  }

  _checkCompleted(item) {
    if (!item) {return false;}
    let completed = true;

    item.blueprints.forEach((blueprint) => {
      if (!blueprint.risk || (!blueprint.risk.value && blueprint.risk.value !== 0)) {
        completed = false;
        return false;
      }
    });
    if (!completed) {return false;}

    item.children.forEach((child) => {
      if (!this._checkCompleted(child)) {
        completed = false;
        return false;
      }
    });
    return completed;
  }

  _checkDisabled(index) {
    if (!this.questionnaire.children || index === 0) {return false;}
    const previous = this.questionnaire.children[index - 1];
    return !this._checkCompleted(previous);
  }

  _openEditDialog(event) {
    const item = event.detail && event.detail.data;
    if (!item) {throw Error('Can not find user data');}

    this.tabId = event.detail.tabId;
    this.categoryId = event.detail.childId;
    this.editedItem = item;
    this.originalComments = item.risk && item.risk.extra && item.risk.extra.comments;
    this.originalRiskValue = item.risk ? item.risk.value : '';
    // this.$.questionHeader.innerHTML = item.header;
    this.dialogOpened = true;
  }

  _setSelectedRiskRatingEntity(event) {
    const selectedItem = event.detail.selectedItem;
    if (!selectedItem) {
      return;
    }
    if (!this.editedItem.risk) {
      this.editedItem.risk = {};
    }

    this.set('editedItem.risk.value', selectedItem.value);
    this.set('editedItem.risk.display_name', selectedItem.display_name);
  }

  _riskValueChanged(event) {
    this.changedData.push({
      children: [event.detail.data]
    });
    this.requestsCount(1);
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
  }

  _addItemFromDialog() {
    if (!this.dialogOpened || !this.validate()) {return;}

    if (this.originalComments === this.editedItem.risk.extra.comments &&
      this.riskAssessmentDropdown.selected &&
      this.originalRiskValue === this.editedItem.risk.value) {

      this.dialogOpened = false;
      this.resetDialog();
      return;
    }


    this.requestInProcess = true;
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
  }

  validate() {
    const riskValid = this.riskAssessmentDropdown.validate();
    const commentsValid = (this.$.riskAssessmentComments as PaperTextareaElement).validate();

    return riskValid && commentsValid;
  }

  validateComplited() {
    if (!this.questionnaire || !this.questionnaire.children || !this.questionnaire.children.length) {return false;}
    let complited = true;

    each(this.questionnaire.children, (tab) => {
      if (!this._checkCompleted(tab)) {complited = false;}
    });

    return complited;
  }

  getQuestionnaireData() {
    if (this.dialogOpened) {return this.getDataFromDialog() || null;}
    return this.changedData && this.changedData.shift() || null;
  }

  getDataFromDialog() {
    const blueprintRisk = {
      value: this.riskAssessmentDropdown.selected,
      extra: this.editedItem.risk && this.editedItem.risk.extra || {}
    };
    const data = {
      id: this.editedItem.id,
      risk: blueprintRisk
    };

    let risk;
    if (this.categoryId) {
      const child = {
        id: +this.categoryId,
        blueprints: [data]
      };
      risk = {
        id: +this.tabId,
        children: [child]
      };
    } else {
      risk = {
        id: +this.tabId,
        blueprints: [data]
      };
    }

    if (risk) {
      return {
        children: [risk]
      };
    }
  }

  getElements(className) {
    return this.shadowRoot!.querySelectorAll(`.${className}`);
  }

  getScore(score) {
    return +score || 0;
  }

  getRating(rating) {
    const ratingString = this.riskRatingOptions[rating] || rating;
    return ratingString ? `- ${rating}` : '';
  }

  resetDialog(opened?) {
    if (opened) {return;}

    this.riskAssessmentDropdown.invalid = false;
    this.riskAssessmentDropdown.selected = null;

    (this.$.riskAssessmentComments as PaperTextareaElement).invalid = false;
    (this.$.riskAssessmentComments as PaperTextareaElement).value = '';
  }

  savingError(errorObj) {
    if (this.requestInProcess) {
      this.requestInProcess = false;
      fireEvent(this, 'toast', {text: 'Can not save data'});
    }
    if (!errorObj || !errorObj.questionnaire) {return;}

    const nonField = checkNonField(errorObj.questionnaire);
    const data = refactorErrorObject(errorObj.questionnaire);
    if (isString(data)) {
      fireEvent(this, 'toast', {text: `Qustionnaire: ${data}`});
    }
    if (nonField) {
      fireEvent(this, 'toast', {text: `Qustionnaire: ${nonField}`});
    }
  }

  requestsCount(number?) {
    if (!number || isNaN(+number)) {return this.requests;}
    let count = number > 0 ? this.requests + 1 : this.requests - 1;
    if (count < 0) {count = 0;}
    this._setRequests(count);
    return this.requests;
  }


}

window.customElements.define('questionnaire-page-main', QuestionnairePageMain);
