import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';

import DateMixin from '../../../../mixins/date-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
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
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}

      <etools-content-panel class="content-section clearfx" panel-title="Overview">
        <div class="row-h group">
          <div class="input-container">
            <datepicker-lite
              id="dateFaceStartInput"
              label="${this.getLabel('face_form_start_date', this.optionsData)}"
              .value="${this.data?.face_form_start_date}"
              selected-date-display-format="D MMM YYYY"
              ?readonly="${this.isReadOnly('face_form_start_date', this.optionsData)}"
              fire-date-has-changed
              property-name="face_form_start_date"
              @date-has-changed="${({detail}: CustomEvent) =>
                this.dateHasChanged(detail, 'face_form_start_date', this.data)}"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <datepicker-lite
              id="dateFaceEndInput"
              .value="${this.data?.face_form_end_date}"
              label="${this.getLabel('face_form_end_date', this.optionsData)}"
              selected-date-display-format="D MMM YYYY"
              readonly="${this.isReadOnly('face_form_end_date', this.optionsData)}"
              fire-date-has-changed
              property-name="face_form_end_date"
              @date-has-changed="${({detail}: CustomEvent) =>
                this.dateHasChanged(detail, 'face_form_end_date', this.data)}"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <!-- Total Value of Selected FACE Forms -->
            <etools-currency-amount-input
              .value="${this.data?.total_value}"
              currency="$"
              label="${this.getLabel('total_value', this.optionsData)}"
              placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
              readonly
              @focus="${this._resetFieldError}"
            >
            </etools-currency-amount-input>
          </div>
        </div>

        <div class="row-h group">
          <div class="input-container">
            <etools-currency-amount-input
              class="${this._setRequired('total_amount_tested', this.optionsData)}"
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
            </etools-currency-amount-input>
          </div>

          <div class="input-container">
            <etools-currency-amount-input
              class="${this._setRequired('total_amount_of_ineligible_expenditure', this.optionsData)}"
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
            </etools-currency-amount-input>
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
      'face_form_start_date',
      'face_form_end_date',
      'total_value',
      'total_amount_tested',
      'total_amount_of_ineligible_expenditure'
    ]
  };

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
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
