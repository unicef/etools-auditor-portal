import {LitElement, html, property, customElement, PropertyValues, query} from 'lit-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import each from 'lodash-es/each';
import isString from 'lodash-es/isString';
import isEmpty from 'lodash-es/isEmpty';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {PaperTextareaElement} from '@polymer/paper-input/paper-textarea';
import {GenericObject} from '../../../../../types/global';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import '../risk-tab/risk-tab';
import {checkNonField} from '../../../../mixins/error-handler';
import {refactorErrorObject} from '../../../../mixins/error-handler';
import '../../../../common-elements/insert-html/insert-html';
import get from 'lodash-es/get';
import {AnyAction} from 'redux';
import {AnyObject} from '@unicef-polymer/etools-types';

/**
 * @LitEelement
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 */
@customElement('questionnaire-page-main')
export class QuestionnairePageMain extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
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
        .result-element .value .significant,
        .result-element .value .high {
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
        div[list-item] {
          overflow: visible !important;
        }
        etools-dropdown#riskAssessmentDropdown {
          --paper-listbox: {
            max-height: 140px;
          }
        }

      </style>

      <etools-content-panel
        class="totals"
        .panelTitle="OVERALL RISK RATING ${this.getRating(this.riskAssessment)}"
        .open="${this.overalRiskOpen}"
      >
      </etools-content-panel>

      ${(this.questionnaire.children || []).map(
        (item, index) => html`<risk-tab
          .questionnaire="${item}"
          .optionsData="${this.optionsData}"
          class="validatable-tab risk-tab"
          index="${index}"
          .firstRun="${this.firstRun}"
          .currentRequests="${this.currentRequests}"
          ?completed="${this._checkCompleted(item)}"
          ?disabled="${this._checkDisabled(index)}"
          ?editMode="${this.editMode}"
        >
        </risk-tab>`
      )}

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        dialog-title="Edit Question"
        ok-btn-text="Save"
        ?showSpinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._addItemFromDialog}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
      >
        <div class="container">
          <div class="layout-horizontal">
            <div class="col-12">
              <div class="text" id="questionHeader">
                ${html`${this.editedItem?.header}`}
              </div>
            </div>
          </div>

          <div class="layout-horizontal">
            <div class="col col-6">
                <!-- Risk Assessment -->
                <etools-dropdown
                  id="riskAssessmentDropdown"
                  required validate-input"
                  .selected="${this.editedItem?.risk?.value}"
                  label="Risk Assessment"
                  placeholder="Select Risk Assessment"
                  .options="${this.riskOptions}"
                  option-label="display_name"
                  option-value="value"
                  ?disabled="${this.requestInProcess}"
                  errorMessage="This field is required"
                  @focus="${this._resetFieldError}"
                  required
                  trigger-value-change-event
                  @etools-selected-item-changed="${this._setSelectedRiskRatingEntity}"
                  hide-search
                >
                </etools-dropdown>
              </div>
            </div>

          <div class="layout-horizontal">
            <div class="col col-12">
                <!-- Comments -->
                <paper-textarea
                  id="riskAssessmentComments"
                  class="w100 validate-input"
                  .value="${this.editedItem?.risk?.extra?.comments}"
                  label="Comments"
                  placeholder="Enter Comments"
                  ?disabled="${this.requestInProcess}"
                  max-rows="4"
                  error-message="This field is required"
                  @focus="${this._resetFieldError}"
                  @value-changed="${({detail}: CustomEvent) => {
                    if (!this.editedItem) {
                      return;
                    }
                    if (!this.editedItem.risk) {
                      this.editedItem.risk = {};
                    }
                    if (!this.editedItem.risk.extra) {
                      this.editedItem.risk = {extra: {comments: ''}};
                    }
                    this.editedItem.risk.extra.comments = detail.value;
                  }}}"
                >
                </paper-textarea>
              </div>
            </div>

          </div>
        </div>
       </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  questionnaire: {children?: []} = {};

  @property({type: Object})
  riskRatingOptions = {
    na: 'N/A',
    low: 'Low',
    medium: 'Medium',
    significant: 'Significant',
    high: 'High',
    moderate: 'Moderate'
  };

  @property({type: Boolean})
  firstRun = true;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Boolean})
  overalRiskOpen = false;

  @property({type: Array})
  changedData: GenericObject[] = [];

  @property({type: Number})
  requests = 0;

  @property({type: String})
  riskAssessment = '';

  @property({type: Object})
  editedItem!: AnyObject;

  @property({type: Boolean})
  dialogOpened = false;

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Array})
  riskOptions!: GenericObject[];

  @query('#riskAssessmentDropdown')
  riskAssessmentDropdown!: EtoolsDropdownEl;

  @property({type: Boolean})
  editMode = false;

  private currentRequests: GenericObject = {};
  private tabId!: string;
  private categoryId!: string;
  private originalComments!: string;
  private originalRiskValue!: string;

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('edit-blueprint', this._openEditDialog as any);
    this.addEventListener('risk-value-changed', this._riskValueChanged as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();

    this.removeEventListener('edit-blueprint', this._openEditDialog as any);
    this.removeEventListener('risk-value-changed', this._riskValueChanged as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('data') || changedProperties.has('optionsData')) {
      this.dataChanged(this.data);
    }
    if (changedProperties.has('errorObject')) {
      this.savingError(this.errorObject);
    }
  }

  dataChanged(data) {
    this.editMode = !this.isReadOnly('questionnaire', this.optionsData);
    const riskOptions = getOptionsChoices(this.optionsData, 'questionnaire.blueprints.risk.value') || [];
    this.riskOptions = riskOptions;

    if (!data) {
      return;
    }
    if (!isEmpty(this.questionnaire) && this.firstRun) {
      this.firstRun = false;
    }
    Object.entries(this.currentRequests).forEach(([path, value]) => {
      const newValue = get(data, path);
      if (newValue === value) {
        delete this.currentRequests[path];
        this.currentRequests = {...this.currentRequests};
      }
    });
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
    if (!item) {
      return false;
    }
    let completed = true;

    item.blueprints.forEach((blueprint) => {
      if (!blueprint.risk || (!blueprint.risk.value && blueprint.risk.value !== 0)) {
        completed = false;
        return false;
      }
    });
    if (!completed) {
      return false;
    }

    item.children.forEach((child) => {
      if (!this._checkCompleted(child)) {
        completed = false;
        return false;
      }
    });
    return completed;
  }

  _checkDisabled(index) {
    if (!this.questionnaire.children || index === 0) {
      return false;
    }
    const previous = this.questionnaire.children[index - 1];
    return !this._checkCompleted(previous);
  }

  _openEditDialog(event) {
    const item = event.detail && event.detail.data;
    if (!item) {
      throw Error('Can not find user data');
    }

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
    this.editedItem.risk.value = selectedItem.value;
    this.editedItem.risk.display_name = selectedItem.display_name;

    this.editedItem = {...this.editedItem};
  }

  _riskValueChanged(event) {
    this.changedData.push({
      children: [event.detail.data]
    });
    this.currentRequests[event.detail.requestId.path] = event.detail.requestId.value;
    this.currentRequests = {...this.currentRequests};
    this.requestsCount(1);
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
  }

  _addItemFromDialog() {
    if (!this.dialogOpened || !this.validate()) {
      return;
    }

    if (
      this.originalComments === this.editedItem.risk.extra.comments &&
      this.riskAssessmentDropdown.selected &&
      this.originalRiskValue === this.editedItem.risk.value
    ) {
      this.dialogOpened = false;
      this.resetDialog();
      return;
    }

    this.requestInProcess = true;
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
  }

  validate() {
    const riskValid = this.riskAssessmentDropdown.validate();
    const commentsValid = (
      this.shadowRoot!.querySelector('#riskAssessmentComments') as PaperTextareaElement
    ).validate();

    return riskValid && commentsValid;
  }

  validateComplited() {
    if (!this.questionnaire || !this.questionnaire.children || !this.questionnaire.children.length) {
      return false;
    }
    let complited = true;

    each(this.questionnaire.children, (tab) => {
      if (!this._checkCompleted(tab)) {
        complited = false;
      }
    });

    return complited;
  }

  getQuestionnaireData() {
    if (this.dialogOpened) {
      return this.getDataFromDialog() || null;
    }
    return (this.changedData && this.changedData.shift()) || null;
  }

  getDataFromDialog() {
    const blueprintRisk = {
      value: this.riskAssessmentDropdown.selected,
      extra: (this.editedItem.risk && this.editedItem.risk.extra) || {}
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
    return ratingString ? `- ${rating.toUpperCase()}` : '';
  }

  resetDialog(opened?) {
    if (opened) {
      return;
    }

    this.riskAssessmentDropdown.invalid = false;
    this.riskAssessmentDropdown.selected = null;

    const riskAssessmentComments = this.shadowRoot!.querySelector('#riskAssessmentComments') as PaperTextareaElement;
    riskAssessmentComments.invalid = false;
    riskAssessmentComments.value = '';
  }

  savingError(errorObj) {
    if (this.requestInProcess) {
      this.requestInProcess = false;
      fireEvent(this, 'toast', {text: 'Can not save data'});
    }
    if (!errorObj || !errorObj.questionnaire) {
      return;
    }

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
    if (!number || isNaN(+number)) {
      return this.requests;
    }
    let count = number > 0 ? this.requests + 1 : this.requests - 1;
    if (count < 0) {
      count = 0;
    }
    // bellow function does not exists
    // this._setRequests(count);
    return this.requests;
  }
}
