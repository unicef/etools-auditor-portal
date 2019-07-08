import {PolymerElement, html} from '@polymer/polymer';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import '../../../common-elements/list-tab-elements/list-element/list-element';
import '@polymer/paper-icon-button/paper-icon-button';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators';
import {fireEvent} from '../../../utils/fire-custom-event';
import clone from 'lodash-es/clone';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {GenericObject} from '../../../../types/global';
import isEqual from 'lodash-es/isEqual';
import isNumber from 'lodash-es/isNumber';

class SubjectAreaElement extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    return html`
      <style>
        ${tabInputsStyles}
        :host {
          position: relative;
          display: block;
        }
        .edit-icon-slot {
          overflow: visible !important;
          display: flex;
          align-items: center;
          height: 100%;
        }
      </style>

      <list-element id="listElement" class="list-element"
        data="{{areaData}}" base-permission-path="[[basePermissionPath]]"
        headings="[[headings]]" details="[[details]]"
        has-collapse no-animation>
        <div slot="hover" class="edit-icon-slot" hidden$="[[!editMode]]">
          <paper-icon-button icon="create" class="edit-icon" on-tap="openEditDialog">
          </paper-icon-button>
        </div>
      </list-element>
    `;
  }

  @property({type: Object, notify: true})
  area!: GenericObject;

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Array})
  headings!: [];

  @property({type: Object})
  riskOptions!: GenericObject;

  static get observers() {
    return [
      '_setData(area, riskOptions)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();

    let riskOptions = this.getChoices(`${this.basePermissionPath}.test_subject_areas.blueprints.risk.value`) || [];
    this.set('riskOptions', riskOptions);
  }

_setData(data) {
    if (!data) { return; }
    if (!data.changed) {
        this.originalData = cloneDeep(data);
    }

    if (data.blueprints[0].risk && isNumber(data.blueprints[0].risk.value)) {
        this.area.blueprints[0].risk.value = this.riskOptions[this.area.blueprints[0].risk.value];
    }

    let risk = get(data, 'blueprints[0].risk') || {extra: {}};
    if (this.isJSONObj(risk.extra)) {
        risk.extra = JSON.parse(risk.extra);
    }
    data.blueprints[0].risk = risk;

    this.areaData = clone(data.blueprints[0]);
}

openEditDialog() {
    fireEvent(this, 'open-edit-dialog', {data: this.area});
}

getRiskData() {
    if (!this.area.blueprints[0].risk || !this.area.blueprints[0].risk.value) { return null; }
    if (this.area.blueprints[0].risk.value.value === this.originalData.blueprints[0].risk.value &&
        isEqual(this.area.blueprints[0].risk.extra, this.originalData.blueprints[0].risk.extra)) { return null; }

    let risk = {
        extra: this.area.blueprints[0].risk.extra,
        value: this.area.blueprints[0].risk.value.value
    };

    let blueprint = {
        id: this.area.blueprints[0].id,
        risk: risk
    };

    return {
        id: this.area.id,
        blueprints: [blueprint]
    };
}

validate() {
    return !!this.area.blueprints[0].risk.value && this.area.blueprints[0].risk.extra !== null;
}
}

window.customElements.define('subject-area-element', SubjectAreaElement);
