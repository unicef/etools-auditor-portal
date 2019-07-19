import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-input/paper-input';
import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input';
import '../../../../../elements/common-elements/custom-validator/custom-validator';

import DateMixin from '../../../../app-mixins/date-mixin';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';
import {property} from "@polymer/decorators/lib/decorators";
import {GenericObject} from "../../../../../types/global";

import pickBy from 'lodash-es/pickBy';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
class OverviewElement extends (CommonMethodsMixin(DateMixin(PolymerElement))) {
  static get template() {
    // language=HTML
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      
      <etools-content-panel class="content-section clearfx" panel-title="Overview">
            <div class="row-h group">
                <div class="input-container">
                
                
                    <datepicker-lite 
                                id="dateFaceStartInput" 
                                label="[[getLabel('face_form_start_date', basePermissionPath)]]"
                                value="{{prepareDate(data.face_form_start_date)}}" 
                                selected-date-display-format="YYYY-MM-DD" 
                                clearBtnInsideDr>
                    </datepicker-lite>
                    <!--<paper-input-->
                            <!--id="dateFaceStartInput"-->
                            <!--class="disabled-as-readonly"-->
                            <!--value="[[prettyDate(data.face_form_start_date)]]"-->
                            <!--label="[[getLabel('face_form_start_date', basePermissionPath)]]"-->
                            <!--placeholder="&#8212;"-->
                            <!--data-selector="dateFaceStartSelector"-->
                            <!--disabled-->
                            <!--on-down="openDatePicker">-->
                        
                        <!--<etools-datepicker-->
                                <!--id="dateFaceStartSelector"-->
                                <!--modal="[[datepickerModal]]"-->
                                <!--prefix-->
                                <!--format="YYYY-MM-DD"-->
                                <!--date="[[prepareDate(data.face_form_start_date)]]"-->
                                <!--pretty-date="{{data.face_form_start_date}}"-->
                                <!--no-init-->
                                <!--show-clear-btn>-->
                        <!--</etools-datepicker>-->
                    <!--</paper-input>-->
                </div>

                <div class="input-container">
                
                    <datepicker-lite 
                            id="dateFaceEndInput" 
                            value="[[prettyDate(data.face_form_end_date)]]" 
                            label="[[getLabel('face_form_end_date', basePermissionPath)]]" 
                            selected-date-display-format="YYYY-MM-DD" 
                            clearBtnInsideDr>
                    </datepicker-lite>
                
                    <!--<paper-input-->
                            <!--id="dateFaceEndInput"-->
                            <!--class="disabled-as-readonly"-->
                            <!--value="[[prettyDate(data.face_form_end_date)]]"-->
                            <!--label="[[getLabel('face_form_end_date', basePermissionPath)]]"-->
                            <!--placeholder="&#8212;"-->
                            <!--data-selector="dateFaceEndSelector"-->
                            <!--disabled-->
                            <!--on-down="openDatePicker">-->
                        <!--<etools-datepicker-->
                                <!--id="dateFaceEndSelector"-->
                                <!--modal="[[datepickerModal]]"-->
                                <!--prefix-->
                                <!--format="YYYY-MM-DD"-->
                                <!--date="[[prepareDate(data.face_form_end_date)]]"-->
                                <!--pretty-date="{{data.face_form_end_date}}"-->
                                <!--no-init-->
                                <!--show-clear-btn>-->
                        <!--</etools-datepicker>-->
                    <!--</paper-input>-->
                </div>

                <div class="input-container">
                    <!-- Total Value of Selected FACE Forms -->
                    <etools-currency-amount-input
                            class="disabled-as-readonly"
                            value="{{data.total_value}}"
                            currency="$"
                            label="[[getLabel('total_value', basePermissionPath)]]"
                            placeholder="[[getPlaceholderText('total_value', basePermissionPath)]]"
                            disabled
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>
            </div>

            <div class="row-h group">
                <div class="input-container">
                    <etools-currency-amount-input
                            class$="disabled-as-readonly [[_setRequired('total_amount_tested', basePermissionPath)]]"
                            value="{{data.total_amount_tested}}"
                            currency="$"
                            label="[[getLabel('total_amount_tested', basePermissionPath)]]"
                            placeholder="[[getPlaceholderText('total_amount_tested', basePermissionPath)]]"
                            required$="[[_setRequired('total_amount_tested', basePermissionPath)]]"
                            disabled$="[[isReadOnly('total_amount_tested', basePermissionPath)]]"
                            invalid="{{_checkInvalid(errors.total_amount_tested)}}"
                            error-message="{{errors.total_amount_tested}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>

                <div class="input-container">
                    <etools-currency-amount-input
                            class$="disabled-as-readonly [[_setRequired('total_amount_of_ineligible_expenditure', basePermissionPath)]]"
                            value="{{data.total_amount_of_ineligible_expenditure}}"
                            currency="$"
                            label="[[getLabel('total_amount_of_ineligible_expenditure', basePermissionPath)]]"
                            placeholder="[[getPlaceholderText('total_amount_of_ineligible_expenditure', basePermissionPath)]]"
                            required$="[[_setRequired('total_amount_of_ineligible_expenditure')]]"
                            disabled$="[[isReadOnly('total_amount_of_ineligible_expenditure', basePermissionPath)]]"
                            invalid="{{_checkInvalid(errors.total_amount_of_ineligible_expenditure)}}"
                            error-message="{{errors.total_amount_of_ineligible_expenditure}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError">
                    </etools-currency-amount-input>
                </div>
            </div>
      </etools-content-panel>
    `;
  }

  @property({type: String, observer: '_basePathChanged'})
  basePermissionPath: string = '';

  @property({type: Object})
  errors: GenericObject = {};

  @property({type: Boolean})
  datepickerModal: boolean = false;

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Audit Overview',
    fields: ['face_form_start_date', 'face_form_end_date', 'total_value', 'total_amount_tested', 'total_amount_of_ineligible_expenditure']
  }

  static get observers() {
    return [
      '_errorHandler(errorObject)'
    ]
  }

  getOverviewData() {
    return pickBy(this.data, (value, key) => {
      return ~['total_amount_tested',
        'total_amount_of_ineligible_expenditure'].indexOf(key) && value !== this.originalData[key];
    });
  }

}

window.customElements.define('overview-element', OverviewElement);
