import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {riskTabStyles} from './risk-tab-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {getOptionsChoices} from '../../../../mixins/permission-controller';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isNumber from 'lodash-es/isNumber';
import cloneDeep from 'lodash-es/cloneDeep';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 */
@customElement('risk-tab')
export class RiskTab extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit, riskTabStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
        etools-data-table-row::part(edt-list-row-wrapper) {
          height: auto !important;
          min-height: 40px;
          padding-top: 5px;
          padding-bottom: 5px;
        }
        etools-data-table-row *[slot='row-data'] {
          margin-top: 0px !important;
          margin-bottom: 0px !important;
        }
        etools-data-table-row *[slot='row-data-details'] {
          flex-direction: column;
        }
        .question {
          width: calc(100% - 160px);
          padding-right: 10px;
        }
        .w100 {
          padding-right: 5px;
        }
        .w160px {
          margin-right: 25px;
        }
      </style>
      <div class="tab-container">
        <etools-content-panel
          list
          ?completed="${this.completed}"
          show-expand-btn
          .panelTitle="${this.setPanelTitle(this.questionnaire.header, this.completed)}"
          .open="${this.opened}"
        >
          <etools-data-table-header no-title>
            <etools-data-table-column class="question">Question</etools-data-table-column>
            <etools-data-table-column class="w160px">Risk Assessment</etools-data-table-column>
          </etools-data-table-header>
          ${(this.questionnaire?.blueprints || []).map(
            (item, index) => html`
              <etools-data-table-row>
                <div slot="row-data" class="layout-horizontal editable-row">
                  <span class="question">${item.header}</span>
                  <span class="w160px">
                    ${this.editMode
                      ? html` <etools-dropdown
                          id="riskOptions1"
                          class="required validate-input w100"
                          .selected="${item.risk?.value}"
                          placeholder="&#8212;"
                          .options="${this.riskOptions}"
                          option-label="display_name"
                          option-value="value"
                          data-path="${this.createPath(index)}"
                          ?readonly="${this.isReadonly(index, null, this.currentRequests)}"
                          @focus="${this._resetFieldError_riskTab}"
                          trigger-value-change-event
                          @etools-selected-item-changed="${(e: CustomEvent) => {
                            this._riskValueChanged(item, e.detail.selectedItem?.value, e);
                          }}"
                          dynamic-align
                          hide-search
                          allow-outside-scroll
                        >
                        </etools-dropdown>`
                      : html`${this._getStringValue(item.risk.value, this.riskOptions, '–')}`}
                  </span>

                  <div class="hover-block" ?hidden="${!this.editMode}">
                    <etools-icon-button
                      name="create"
                      @click="${(e: CustomEvent) => this.openEditDialog(e, item)}"
                    ></etools-icon-button>
                  </div>
                </div>
                <div slot="row-data-details">
                  <div class="row-details-content col-12">
                    <span class="rdc-title">Comments</span>
                    <span>${item.risk?.extra?.comments || '–'}</span>
                  </div>
                </div>
              </etools-data-table-row>
            `
          )}
          ${(this.questionnaire?.children || []).map(
            (category, categoryIndex) =>
              html` ${(category.blueprints || []).map(
                (item, blueprintIndex) => html`
                  <etools-data-table-row>
                    <div slot="row-data" class="layout-horizontal editable-row">
                      <span class="question">${item.header}</span>
                      <span class="w160px">
                        ${this.editMode
                          ? html` <etools-dropdown
                              id="riskOptions2"
                              class="required validate-input w100"
                              .selected="${item.risk?.value}"
                              placeholder="&#8212;"
                              .options="${this.riskOptions}"
                              option-label="display_name"
                              option-value="value"
                              category-id="${category.id}"
                              ?readonly="${this.isReadonly(blueprintIndex, categoryIndex, this.currentRequests)}"
                              @focus="${this._resetFieldError_riskTab}"
                              data-path="${this.createPath(blueprintIndex, categoryIndex)}"
                              trigger-value-change-event
                              @etools-selected-item-changed="${(e: CustomEvent) => {
                                this._riskValueChanged(item, e.detail.selectedItem?.value, e);
                              }}"
                              dynamic-align
                              hide-search
                              allow-outside-scroll
                            >
                            </etools-dropdown>`
                          : html`${this._getStringValue(item.risk.value, this.riskOptions, '–')}`}
                      </span>

                      <div class="hover-block" ?hidden="${!this.editMode}">
                        <etools-icon-button
                          name="create"
                          category-id="${category.id}"
                          @click="${(e: CustomEvent) => this.openEditDialog(e, item)}"
                        ></etools-icon-button>
                      </div>
                    </div>
                    <div slot="row-data-details">
                      <div class="row-details-content col-12">
                        <span class="rdc-title">Comments</span>
                        <span>${item.risk?.extra?.comments || '–'}</span>
                      </div>
                    </div>
                  </etools-data-table-row>
                `
              )}`
          )}
        </etools-content-panel>
      </div>
    `;
  }

  @property({type: Object})
  questionnaire: GenericObject = {};

  @property({type: Number})
  index!: number;

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean})
  editMode!: boolean;

  @property({type: Boolean, reflect: true})
  completed = false;

  @property({type: Boolean})
  firstRun = false;

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Object})
  currentRequests: GenericObject = {};

  @property({type: Object})
  riskRatingOptions = {
    na: 'N/A',
    low: 'Low',
    medium: 'Medium',
    significant: 'Significant',
    high: 'High',
    moderate: 'Moderate'
  };

  @property({type: Array})
  categoryHeader = [
    {
      path: 'header',
      size: 100,
      html: true,
      class: 'question-title'
    }
  ];

  @property({type: Array})
  riskOptions!: {value: string | number; display_name: string}[];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      const riskOptions = getOptionsChoices(this.optionsData, 'questionnaire.blueprints.risk.value') || [];
      this.riskOptions = riskOptions;
    }
    if (
      changedProperties.has('disabled') ||
      changedProperties.has('completed') ||
      changedProperties.has('firstRun') ||
      changedProperties.has('questionnaire')
    ) {
      this._setOpen(this.disabled, this.completed, this.firstRun);
    }
  }

  showResults(completed, open) {
    if (!completed) {
      return false;
    }
    return !open;
  }

  getScore(score) {
    return score || 0;
  }

  getRating(rating) {
    return this.riskRatingOptions[rating] || rating;
  }

  isReadonly(blueprintIndex: number, categoryIndex: number | null, currentRequests: GenericObject) {
    const path = this.createPath(blueprintIndex, categoryIndex);
    return Object.hasOwnProperty.call(currentRequests, path);
  }

  createPath(blueprintIndex: number, categoryIndex?: number | null): string {
    return `children.${this.index}${
      typeof categoryIndex === 'number' ? `.children.${categoryIndex}` : ''
    }.blueprints.${blueprintIndex}.risk.value`;
  }

  _setOpen(disabled, completed, firstRun) {
    if (!firstRun) {
      return;
    }
    this.opened = !completed && !disabled;
  }

  _riskValueChanged(blueprint, changedRiskRValue, event) {
    if (!blueprint) {
      return;
    }
    if (!blueprint.risk) {
      blueprint.risk = {};
    }
    if ((!changedRiskRValue && changedRiskRValue !== 0) || changedRiskRValue === blueprint.risk.value) {
      return;
    }

    blueprint.risk.value = changedRiskRValue;

    fireEvent(this, 'risk-value-changed', {
      data: this._getQuestionnaireDataToSave(changedRiskRValue, blueprint.id, event.target),
      requestId: {
        path: event.target.dataset.path,
        value: changedRiskRValue
      }
    });
  }

  _getQuestionnaireDataToSave(changedRiskRValue, blueprintId, eventTarget) {
    const questionnaireToSave: GenericObject = {
      id: this.questionnaire.id
    };

    if (this.questionnaire.children.length) {
      const childId = eventTarget && eventTarget.getAttribute('category-id');
      if (!childId) {
        throw new Error('Can not find category id!');
      }

      questionnaireToSave.children = [
        {
          id: childId,
          blueprints: [{risk: {value: changedRiskRValue}, id: blueprintId}]
        }
      ];
    } else {
      questionnaireToSave.blueprints = [{risk: {value: changedRiskRValue}, id: blueprintId}];
    }

    return questionnaireToSave;
  }

  _resetFieldError_riskTab() {
    this.errors = {...this.errors, partner: false};
  }

  setPanelTitle(header, complited) {
    if (!complited) {
      return header;
    }
    const label = this.riskRatingOptions && this.riskRatingOptions[this.questionnaire.risk_rating];
    if (!label) {
      return header;
    }
    return `${header} - ${label.toUpperCase()}`;
  }

  getElements(className) {
    return this.shadowRoot!.querySelectorAll(`.${className}`);
  }

  openEditDialog(event, item) {
    if (!item) {
      throw new Error('Can not find user data');
    }

    let childId = null;
    if (this.questionnaire.children.length) {
      childId = event.target && event.target.getAttribute('category-id');
      if (!childId) {
        throw new Error('Can not find category id!');
      }
    }
    const data = cloneDeep(item);
    if (!data.risk) {
      data.risk = {};
    }
    if (this.isJSONObj(data.risk.extra)) {
      data.risk.extra = JSON.parse(data.risk.extra);
    } else {
      data.risk.extra = {comments: (data.risk.extra && data.risk.extra.comments) || ''};
    }
    fireEvent(this, 'edit-blueprint', {data: data, tabId: this.questionnaire.id, childId: childId});
  }

  _setRiskValue(value, options) {
    if (!options) {
      return;
    }
    if (isNumber(value)) {
      return options[value];
    }
    return value;
  }

  _getStringValue(value, options, defaultValue) {
    if (!options || !isNumber(value)) {
      return defaultValue;
    }
    return (options[value] && options[value].display_name) || defaultValue;
  }

  _prepareData(data) {
    if (data && data.risk && this.isJSONObj(data.risk.extra)) {
      data.risk.extra = JSON.parse(data.risk.extra);
    }
    return data;
  }
}
