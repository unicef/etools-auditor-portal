import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import {RiskTabStyles} from './risk-tab-styles';
import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';
import isNumber from 'lodash-es/isNumber';
import cloneDeep from 'lodash-es/cloneDeep';

class RiskTab extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles} ${RiskTabStyles}
      <div class="tab-container">
        <etools-content-panel list completed$="[[completed]]" show-expand-btn
          panel-title="{{setPanelTitle(questionnaire.header, completed)}}" open="{{opened}}">

          <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

          <template is="dom-repeat" items="{{questionnaire.blueprints}}">
            <list-element class="list-element"
              data="[[_prepareData(item)]]"
              base-permission-path="[[basePermissionPath]]"
              headings="[[columns]]"
              details="[[details]]"
              has-collapse multiline no-animation>
              <div slot="hover" class="edit-icon-slot" hidden$="[[!editMode]]">
                <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog">
                </paper-icon-button>
              </div>

              <div slot="custom">
                <template is="dom-if" if="{{editMode}}">
                  <etools-dropdown
                    class="disabled-as-readonly required validate-input"
                    selected="[[_setRiskValue(item.risk.value, riskOptions)]]"
                    placeholder="&#8212;"
                    options="[[riskOptions]]"
                    option-label="display_name"
                    option-value="display_name"
                    on-focus="_resetFieldError"
                    trigger-value-change-event
                    on-etools-selected-item-changed="_riskValueChanged"
                    dynamic-align hide-search allow-outside-scroll>
                  </etools-dropdown>
                  <paper-tooltip offset="0">[[item.risk.value]]</paper-tooltip>
                </template>

                <template is="dom-if" if="{{!editMode}}">
                  [[_getStringValue(item.risk.value, riskOptions, '–')]]
                </template>
              </div>
            </list-element>
          </template>

          <template is="dom-repeat" items="{{questionnaire.children}}" as="category">
            <list-element class="list-element" data="[[category]]" headings="[[categoryHeader]]" no-animation multiline
              no-hover>
            </list-element>

            <template is="dom-repeat" items="{{category.blueprints}}">
              <list-element class="list-element" data="[[_prepareData(item)]]" base-permission-path="[[basePermissionPath]]"
                headings="[[columns]]" details="[[details]]" has-collapse multiline no-animation>
                <div slot="hover" class="edit-icon-slot" hidden$="[[!editMode]]">
                  <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog" category-id$="{{category.id}}">
                  </paper-icon-button>
                </div>

                <div slot="custom">
                  <template is="dom-if" if="{{editMode}}">
                    <etools-dropdown
                      class="disabled-as-readonly required validate-input"
                      selected="[[_setRiskValue(item.risk.value, riskOptions)]]"
                      placeholder="&#8212;"
                      options="[[riskOptions]]"
                      option-label="display_name"
                      option-value="display_name"
                      category-id$="{{category.id}}"
                      on-focus="_resetFieldError"
                      trigger-value-change-event
                      on-etools-selected-item-changed="_riskValueChanged"
                      dynamic-align hide-search allow-outside-scroll>
                    </etools-dropdown>
                    <paper-tooltip offset="0">[[item.risk.value]]</paper-tooltip>
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
  questionnaire: GenericObject = {}

  @property({type: Number})
  index!: number;

  @property({type: Boolean})
  opened: boolean = false;

  @property({type: Boolean, reflectToAttribute: true})
  completed: boolean = false;

  @property({type: Boolean})
  disabled!: boolean;

  @property({type: Object})
  riskRatingOptions = {
    'na': 'N/A',
    'low': 'Low',
    'medium': 'Medium',
    'significant': 'Significant',
    'high': 'High',
    'moderate': 'Moderate'
  };

  @property({type: Array})
  columns = [
    {
      'size': 100,
      'class': 'pr-45',
      'label': 'Question',
      'name': 'header',
      'html': true
    }, {
      'size': '160px',
      'label': 'Risk Assessment',
      'name': 'value',
      'property': 'risk.value',
      'custom': true,
      'doNotHide': true
    }
  ];

  @property({type: Array})
  details = [{
    'label': 'Comments',
    'path': 'risk.extra.comments',
    'size': 100
  }];

  @property({type: Array})
  categoryHeader = [{
    'path': 'header',
    'size': 100,
    'html': true,
    'class': 'question-title'
  }];

  @property({type: String})
  basePermissionPath!: string;

  static get observers() {
    return [
      '_setOpen(disabled, completed, firstRun, questionnaire)'
    ];
  }


  connectedCallback() {
    super.connectedCallback();
    let riskOptions = this.getChoices(`${this.basePermissionPath}.questionnaire.blueprints.risk.value`) || [];
    this.set('riskOptions', riskOptions);
  }

  showResults(completed, open) {
    if (!completed) {return false;}
    return !open;
  }

  getScore(score) {
    return score || 0;
  }

  getRating(rating) {
    return this.riskRatingOptions[rating] || rating;
  }

  _setOpen(disabled, completed, firstRun) {
    if (!firstRun) {return;}
    this.set('opened', !completed && !disabled);
  }

  _riskValueChanged(event) {
    let item = event && event.selectedItem;
    let changedValue = item && item.value;
    let data;

    if (!item.risk) {item.risk = {};}
    if ((!changedValue && changedValue !== 0) || changedValue === item.risk.value) {return;}

    item.risk.value = changedValue;

    let childId = null;
    if (this.questionnaire.children.length) {
      childId = event.target && event.target.getAttribute('category-id');
      if (!childId) {throw 'Can not find category id!';}
      data = {
        id: this.questionnaire.id,
        children: [{
          id: childId,
          blueprints: [{risk: {value: changedValue}, id: item.id}]
        }]
      };
    } else {
      data = {
        id: this.questionnaire.id,
        blueprints: [{risk: {value: changedValue}, id: item.id}]
      };
    }
    fireEvent(this, 'risk-value-changed', {data: data});
  }

  _resetFieldError() {
    this.set('errors.partner', false);
  }

  setPanelTitle(header, complited) {
    if (!complited) {return header;}
    let label = this.riskRatingOptions && this.riskRatingOptions[this.questionnaire.risk_rating];
    if (!label) {return header;}
    return `${header} - ${label.toUpperCase()}`;
  }

  getElements(className) {
    return this.shadowRoot!.querySelectorAll(`.${className}`);
  }

  openEditDialog(event) {
    let item = event && event.model && event.model.item;

    if (!item) {throw Error('Can not find user data');}

    let childId = null;
    if (this.questionnaire.children.length) {
      childId = event.target && event.target.getAttribute('category-id');
      if (!childId) {throw 'Can not find category id!';}
    }
    let data = cloneDeep(item);
    if (!data.risk) {data.risk = {};}
    if (this.isJSONObj(data.risk.extra)) {
      data.risk.extra = JSON.parse(data.risk.extra);
    } else {
      data.risk.extra = {comments: (data.risk.extra && data.risk.extra.comments) || ''};
    }
    fireEvent(this, 'edit-blueprint', {data: data, tabId: this.questionnaire.id, childId: childId});
  }

  _setRiskValue(value, options) {
    if (!options) {return;}
    if (isNumber(value)) {
      return options[value];
    }
    return value;
  }

  _getStringValue(value, options, defaultValue) {
    if (!options || !isNumber(value)) {return defaultValue;}
    return options[value] && options[value].display_name || defaultValue;
  }

  _prepareData(data) {
    if (data && data.risk && this.isJSONObj(data.risk.extra)) {data.risk.extra = JSON.parse(data.risk.extra);}
    return data;
  }


}
window.customElements.define('risk-tab', RiskTab);
