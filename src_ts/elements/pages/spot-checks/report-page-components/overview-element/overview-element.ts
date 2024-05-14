import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';

import DateMixin from '../../../../mixins/date-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '../../../../../types/global';
import pickBy from 'lodash-es/pickBy';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('overview-element')
export class OverviewElement extends CommonMethodsMixin(ModelChangedMixin(DateMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}

      <etools-content-panel class="content-section clearfx" panel-title="Overview">
        <div class="row">
          <div class="col-12 input-container col-lg-4 col-md-6">
            <datepicker-lite
              id="dateFaceStartInput"
              label="${this.getLabel('start_date', this.optionsData)}"
              .value="${this.data?.start_date}"
              selected-date-display-format="D MMM YYYY"
              ?readonly="${this.isReadOnly('start_date', this.optionsData)}"
              fire-date-has-changed
              property-name="start_date"
              @date-has-changed="${({detail}: CustomEvent) =>
                this.dateHasChanged(detail, 'start_date', this.data)}"
            >
            </datepicker-lite>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <datepicker-lite
              id="dateFaceEndInput"
              .value="${this.data?.end_date}"
              label="${this.getLabel('end_date', this.optionsData)}"
              selected-date-display-format="D MMM YYYY"
              readonly="${this.isReadOnly('end_date', this.optionsData)}"
              fire-date-has-changed
              property-name="end_date"
              @date-has-changed="${({detail}: CustomEvent) =>
                this.dateHasChanged(detail, 'end_date', this.data)}"
            >
            </datepicker-lite>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <!-- Total Value of Selected FACE Forms -->
            <etools-currency
              class="w100"
              .value="${this.data?.total_value}"
              currency="$"
              label="${this.getLabel('total_value', this.optionsData)}"
              placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
              readonly
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <etools-currency
              class="w100 ${this._setRequired('total_amount_tested', this.optionsData)}"
              .value="${this.data?.total_amount_tested}"
              currency="$"
              label="${this.getLabel('total_amount_tested', this.optionsData)}"
              placeholder="${this.getPlaceholderText('total_amount_tested', this.optionsData)}"
              ?required="${this._setRequired('total_amount_tested', this.optionsData)}"
              ?readonly="${this.isReadOnly('total_amount_tested', this.optionsData)}"
              ?invalid="${this._checkInvalid(this.errors?.total_amount_tested)}"
              .errorMessage="${this.errors?.total_amount_tested}"
              @value-changed="${({detail}: CustomEvent) =>
                this.numberChanged(detail, 'total_amount_tested', this.data)}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>

          <div class="col-12 input-container col-lg-4 col-md-6">
            <etools-currency
              class="w100 ${this._setRequired('total_amount_of_ineligible_expenditure', this.optionsData)}"
              .value="${this.data?.total_amount_of_ineligible_expenditure}"
              currency="$"
              label="${this.getLabel('total_amount_of_ineligible_expenditure', this.optionsData)}"
              placeholder="${this.getPlaceholderText('total_amount_of_ineligible_expenditure', this.optionsData)}"
              ?required="${this._setRequired('total_amount_of_ineligible_expenditure', this.optionsData)}"
              ?readonly="${this.isReadOnly('total_amount_of_ineligible_expenditure', this.optionsData)}"
              ?invalid="${this._checkInvalid(this.errors?.total_amount_of_ineligible_expenditure)}"
              .errorMessage="${this.errors?.total_amount_of_ineligible_expenditure}"
              @value-changed="${({detail}: CustomEvent) =>
                this.numberChanged(detail, 'total_amount_of_ineligible_expenditure', this.data)}"
              @focus="${this._resetFieldError}"
            >
            </etools-currency>
          </div>
        </div>
      </etools-content-panel>
    `;
  }
  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  errors!: GenericObject;

  @property({type: Boolean})
  datepickerModal = false;

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Audit Overview',
    fields: [
      'start_date',
      'end_date',
      'total_value',
      'total_amount_tested',
      'total_amount_of_ineligible_expenditure'
    ]
  };

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
  }

  getOverviewData() {
    return pickBy(this.data, (value, key) => {
      return (
        ~['total_amount_tested', 'total_amount_of_ineligible_expenditure'].indexOf(key) &&
        value !== (this.originalData ? this.originalData[key] : undefined)
      );
    });
  }

  _checkInvalid(value) {
    return !!value;
  }
}
