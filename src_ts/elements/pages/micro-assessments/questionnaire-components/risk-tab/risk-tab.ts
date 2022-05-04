import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import {RiskTabStyles} from './risk-tab-styles';
import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {getChoices} from '../../../../mixins/permission-controller';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';
import isNumber from 'lodash-es/isNumber';
import cloneDeep from 'lodash-es/cloneDeep';

class RiskTab extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles} ${RiskTabStyles}
      <style>
        list-element {
          --list-item-overflow: visible;
        }
        etools-dropdown {
          --esmm-dropdown-menu-position: absolute !important;
        }
      </style>
      <div class="tab-container">
        <etools-content-panel
          list
          completed$="[[completed]]"
          show-expand-btn
          panel-title="{{setPanelTitle(questionnaire.header, completed)}}"
          open="{{opened}}"
        >
          <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

          <template is="dom-repeat" items="{{questionnaire.blueprints}}" index-as="blueprintIndex">
            <list-element
              class="list-element"
              data="[[_prepareData(item)]]"
              base-permission-path="[[basePermissionPath]]"
              headings="[[columns]]"
              details="[[details]]"
              has-collapse
              multiline
              no-animation
            >
              <div slot="hover" class="edit-icon-slot" hidden$="[[!editMode]]">
                <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog"> </paper-icon-button>
              </div>

              <div slot="custom">
                <template is="dom-if" if="{{editMode}}">
                  <etools-dropdown
                    id="riskOptions1"
                    class="required validate-input"
                    selected="[[item.risk.value]]"
                    placeholder="&#8212;"
                    options="[[riskOptions]]"
                    option-label="display_name"
                    option-value="value"
                    data-path$="[[createPath(blueprintIndex)]]"
                    readonly$="[[isReadonly(blueprintIndex, null, currentRequests)]]"
                    on-focus="_resetFieldError_riskTab"
                    trigger-value-change-event
                    on-etools-selected-item-changed="_riskValueChanged"
                    dynamic-align
                    hide-search
                    allow-outside-scroll
                  >
                  </etools-dropdown>
                </template>

                <template is="dom-if" if="{{!editMode}}">
                  [[_getStringValue(item.risk.value, riskOptions, '–')]]
                </template>
              </div>
            </list-element>
          </template>

          <template is="dom-repeat" items="{{questionnaire.children}}" as="category" index-as="categoryIndex">
            <list-element
              class="list-element"
              data="[[category]]"
              headings="[[categoryHeader]]"
              no-animation
              multiline
              no-hover
            >
            </list-element>

            <template is="dom-repeat" items="{{category.blueprints}}" index-as="blueprintIndex">
              <list-element
                class="list-element"
                data="[[_prepareData(item)]]"
                base-permission-path="[[basePermissionPath]]"
                headings="[[columns]]"
                details="[[details]]"
                has-collapse
                multiline
                no-animation
              >
                <div slot="hover" class="edit-icon-slot" hidden$="[[!editMode]]">
                  <paper-icon-button
                    icon="create"
                    class="edit-icon"
                    on-tap="openEditDialog"
                    category-id$="{{category.id}}"
                  >
                  </paper-icon-button>
                </div>

                <div slot="custom">
                  <template is="dom-if" if="{{editMode}}">
                    <etools-dropdown
                      id="riskOptions2"
                      class="required validate-input"
                      selected="[[item.risk.value]]"
                      placeholder="&#8212;"
                      options="[[riskOptions]]"
                      option-label="display_name"
                      option-value="value"
                      category-id$="{{category.id}}"
                      on-focus="_resetFieldError_riskTab"
                      data-path$="[[createPath(blueprintIndex, categoryIndex)]]"
                      readonly$="[[isReadonly(blueprintIndex, categoryIndex, currentRequests)]]"
                      trigger-value-change-event
                      on-etools-selected-item-changed="_riskValueChanged"
                      dynamic-align
                      hide-search
                      allow-outside-scroll
                    >
                    </etools-dropdown>
                  </template>

                  <template is="dom-if" if="{{!editMode}}">
                    [[_getStringValue(item.risk.value, riskOptions, '–')]]
                  </template>
                </div>
              </list-element>
            </template>
          </template>
        </etools-content-panel>
      </div>
    `;
  }

  @property({type: Object, notify: true})
  questionnaire: GenericObject = {};

  @property({type: Number})
  index!: number;

  @property({type: Boolean})
  opened = false;

  @property({type: Boolean, reflectToAttribute: true})
  completed = false;

  @property({type: Boolean})
  disabled!: boolean;

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
  columns = [
    {
      size: 100,
      class: 'pr-45',
      label: 'Question',
      name: 'header',
      html: true
    },
    {
      size: '160px',
      label: 'Risk Assessment',
      name: 'value',
      property: 'risk.value',
      custom: true,
      doNotHide: true
    }
  ];

  @property({type: Array})
  details = [
    {
      label: 'Comments',
      path: 'risk.extra.comments',
      size: 100
    }
  ];

  @property({type: Array})
  categoryHeader = [
    {
      path: 'header',
      size: 100,
      html: true,
      class: 'question-title'
    }
  ];

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Array})
  riskOptions!: {value: string | number; display_name: string}[];

  @property({type: Object})
  currentRequests: GenericObject = {};

  static get observers() {
    return ['_setOpen(disabled, completed, firstRun, questionnaire)'];
  }

  connectedCallback() {
    super.connectedCallback();
    const riskOptions = getChoices(`${this.basePermissionPath}.questionnaire.blueprints.risk.value`) || [];
    this.set('riskOptions', riskOptions);
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

  isReadonly(blueprintIndex: number, categoryIndex: number) {
    const path = this.createPath(blueprintIndex, categoryIndex);
    return Object.hasOwnProperty.call(this.currentRequests, path);
  }

  createPath(blueprintIndex: number, categoryIndex?: number): string {
    return `children.${this.index}${
      typeof categoryIndex === 'number' ? `.children.${categoryIndex}` : ''
    }.blueprints.${blueprintIndex}.risk.value`;
  }

  _setOpen(disabled, completed, firstRun) {
    if (!firstRun) {
      return;
    }
    this.set('opened', !completed && !disabled);
  }

  _riskValueChanged(event) {
    const blueprint = event && event.model.item;
    if (!blueprint) {
      return;
    }
    const changedRiskRValue = event.detail.selectedItem && event.detail.selectedItem.value;

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
    this.set('errors.partner', false);
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

  openEditDialog(event) {
    const item = event && event.model && event.model.item;

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
window.customElements.define('risk-tab', RiskTab);
