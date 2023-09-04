import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import '@polymer/paper-icon-button/paper-icon-button';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {getOptionsChoices} from '../../../mixins/permission-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import clone from 'lodash-es/clone';
import get from 'lodash-es/get';
import cloneDeep from 'lodash-es/cloneDeep';
import {GenericObject} from '../../../../types/global';
import isEqual from 'lodash-es/isEqual';
import isNumber from 'lodash-es/isNumber';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin CommonMethodsMixinLit
 */
@customElement('subject-area-element')
export class SubjectAreaElement extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-data-table-row>
        <div slot="row-data" class="layout-horizontal editable-row">
          <span class="col-data col-8">${this.areaData?.header}</span>
          <span class="col-data col-4">${this.areaData?.risk.value_display}</span>
          <div class="hover-block" ?hidden="${!this.canBeChanged}">
            <paper-icon-button icon="create" @click="${this.openEditDialog}"></paper-icon-button>
          </div>
        </div>
        <div slot="row-data-details">
          <div class="row-details-content col-12">
            <span class="rdc-title">Brief Justification for Rating (main internal control gaps)</span>
            <span>${this.areaData?.risk.extra.comments || 'None'}</span>
          </div>
        </div>
      </etools-data-table-row>
    `;
  }

  @property({type: Object})
  area!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Boolean})
  canBeChanged!: boolean;

  @property({type: Number})
  index!: number;

  @property({type: Object})
  riskOptions!: GenericObject;

  @property({type: Object})
  areaData!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('optionsData')) {
      this.setRiskOptions();
    }
    if (changedProperties.has('area') || changedProperties.has('riskOptions')) {
      this._setAreaData(this.area, this.riskOptions);
    }
  }

  setRiskOptions() {
    const riskOptions = getOptionsChoices(this.optionsData, 'test_subject_areas.blueprints.risk.value') || [];
    this.riskOptions = riskOptions;
  }

  _setAreaData(data, riskOptions) {
    if (!data || !riskOptions) {
      return;
    }
    if (!data.changed) {
      this.originalData = cloneDeep(data);
    }

    if (data.blueprints[0].risk && isNumber(data.blueprints[0].risk.value)) {
      this.area.blueprints[0].risk.value = this.riskOptions[this.area.blueprints[0].risk.value];
    }

    const risk = get(data, 'blueprints[0].risk') || {extra: {}};
    if (this.isJSONObj(risk.extra)) {
      risk.extra = JSON.parse(risk.extra);
    }
    data.blueprints[0].risk = risk;

    this.areaData = clone(data.blueprints[0]);
  }

  openEditDialog() {
    fireEvent(this, 'open-edit-dialog', this.index);
  }

  getRiskData() {
    if (!this.area.blueprints[0].risk || !this.area.blueprints[0].risk.value) {
      return null;
    }
    if (
      this.area.blueprints[0].risk.value.value === this.originalData.blueprints[0].risk.value &&
      isEqual(this.area.blueprints[0].risk.extra, this.originalData.blueprints[0].risk.extra)
    ) {
      return null;
    }

    const risk = {
      extra: this.area.blueprints[0].risk.extra,
      value: this.area.blueprints[0].risk.value.value
    };

    const blueprint = {
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
