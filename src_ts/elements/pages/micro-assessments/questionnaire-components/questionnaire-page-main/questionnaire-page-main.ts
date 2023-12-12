import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import each from 'lodash-es/each';
import isString from 'lodash-es/isString';
import isEmpty from 'lodash-es/isEmpty';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../../types/global';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import './questionnaire-page-main-dialog.js';
import '../risk-tab/risk-tab';
import {checkNonField} from '../../../../mixins/error-handler';
import {refactorErrorObject} from '../../../../mixins/error-handler';
import '../../../../common-elements/insert-html/insert-html';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

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
        etools-content-panel.totals::part(ecp-header) {
          margin-bottom: 24px;
          height: 51px;
          background-color: var(--module-warning) !important;
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

  @property({type: Boolean})
  dialogOpened = false;

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Array})
  riskOptions!: GenericObject[];

  @property({type: Boolean})
  editMode = false;

  @property({type: Object})
  dataFromDialog!: GenericObject | null;

  private currentRequests: GenericObject = {};

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

    if (changedProperties.has('data') || changedProperties.has('optionsData')) {
      this.dataChanged(this.data);
    }
    if (changedProperties.has('errorObject')) {
      this.savingError(this.errorObject);
    }
  }

  triggerSaveFromDialog(dataFromDialog: GenericObject) {
    this.requestInProcess = true;
    this.dataFromDialog = dataFromDialog;
    fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
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

    if (this.requestInProcess) {
      const dialogEl = document.body.querySelector('questionnaire-page-main-dialog');
      // reset dialog Loading if dialog opened
      if (dialogEl) {
        (dialogEl as any)._onClose();
      }
      this.requestInProcess = false;
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
    this.dataFromDialog = null;
    openDialog({
      dialog: 'questionnaire-page-main-dialog',
      dialogData: {
        opener: this,
        optionsData: this.optionsData,
        editedItem: cloneDeep(item),
        originalComments: item.risk && item.risk.extra && item.risk.extra.comments,
        originalRiskValue: item.risk ? item.risk.value : '',
        dataFromDialog: this.dataFromDialog,
        riskOptions: this.riskOptions,
        tabId: event.detail.tabId,
        categoryId: event.detail.childId
      }
    }).then(() => {
      this.dataFromDialog = null;
    });
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

  validateCompleted() {
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
    if (this.dataFromDialog) {
      return this.dataFromDialog;
    }
    return (this.changedData && this.changedData.shift()) || null;
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

  savingError(errorObj) {
    const dialogEl = document.body.querySelector('questionnaire-page-main-dialog');
    // reset dialog Loading if dialog opened
    if (dialogEl) {
      (dialogEl as any).requestInProcess = false;
    }

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
