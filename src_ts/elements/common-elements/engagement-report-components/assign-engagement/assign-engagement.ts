import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

import isEmpty from 'lodash-es/isEmpty';
import each from 'lodash-es/each';
import pickBy from 'lodash-es/pickBy';
import {property} from '@polymer/decorators';
import '@polymer/polymer/lib/elements/dom-if';
declare const moment: any;
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '../../../utils/fire-custom-event';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {collectionExists} from '../../../app-mixins/permission-controller';

import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import DateMixin from '../../../app-mixins/date-mixin';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite';
import {getStaticData} from '../../../app-mixins/static-data-controller';

/**
 * @polymer
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */
class AssignEngagement extends DateMixin(CommonMethodsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style></style>

      <etools-content-panel class="content-section clearfx" panel-title="Engagement Status">
        <div class="row-h group">
          <div class="input-container">
            <!-- Date of Field Visit -->
            <datepicker-lite
              id="dateVisitInput"
              class$="disabled-as-readonly [[_setRequired('date_of_field_visit', basePermissionPath)]]
                                    validate-date"
              value="{{data.date_of_field_visit}}"
              label="[[getLabel('date_of_field_visit', basePermissionPath)]]"
              placeholder="&#8212;"
              required="[[_setRequired('date_of_field_visit', basePermissionPath)]]"
              disabled$="[[_isReadOnly('date_of_field_visit', 'true', falseValue, basePermissionPath)]]"
              invalid="{{_checkFieldInvalid(errors.date_of_field_visit)}}"
              error-message="{{errors.date_of_field_visit}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              date="[[prepareDate(data.date_of_field_visit)]]"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <!-- Draft Report Issued to IP -->
            <datepicker-lite
              id="draftReportToIpInput"
              class$="[[_setRequired('date_of_draft_report_to_ip', basePermissionPath)]] 
                                    disabled-as-readonly validate-date"
              value="{{data.date_of_draft_report_to_ip}}"
              label="[[getLabel('date_of_draft_report_to_ip', basePermissionPath)]]"
              placeholder="&#8212;"
              required="[[_setRequired('date_of_draft_report_to_ip', basePermissionPath)]]"
              disabled$="[[_isReadOnly('date_of_draft_report_to_ip', 'true', data.date_of_comments_by_ip,
                                    basePermissionPath)]]"
              invalid="{{_checkFieldInvalid(errors.date_of_draft_report_to_ip)}}"
              error-message="{{errors.date_of_draft_report_to_ip}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              max-date="[[maxDate]]"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <!-- Comments Received by IP -->
            <datepicker-lite
              id="commentsReceivedByIpInput"
              class$="[[_setRequired('date_of_comments_by_ip', basePermissionPath)]]
                                    disabled-as-readonly validate-date"
              value="{{data.date_of_comments_by_ip}}"
              label="[[getLabel('date_of_comments_by_ip', basePermissionPath)]]"
              placeholder="&#8212;"
              required="[[_setRequired('date_of_comments_by_ip', basePermissionPath)]]"
              disabled$="[[_isReadOnly('date_of_comments_by_ip', data.date_of_draft_report_to_ip, 
                                        data.date_of_draft_report_to_unicef, basePermissionPath)]]"
              invalid="{{_checkFieldInvalid(errors.date_of_comments_by_ip)}}"
              error-message="{{errors.date_of_comments_by_ip}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              min-date="[[minDate(data.date_of_draft_report_to_ip)]]"
              max-date="[[maxDate]]"
            >
            </datepicker-lite>
          </div>
        </div>

        <div class="row-h group">
          <div class="input-container">
            <!-- Draft Report Issued to UNICEF -->
            <datepicker-lite
              id="draftReportUnicefInput"
              class$="[[_setRequired('date_of_draft_report_to_unicef', basePermissionPath)]]
                                    disabled-as-readonly validate-date"
              value="{{data.date_of_draft_report_to_unicef}}"
              label="[[getLabel('date_of_draft_report_to_unicef', basePermissionPath)]]"
              placeholder="&#8212;"
              required="[[_setRequired('date_of_draft_report_to_unicef', basePermissionPath)]]"
              disabled$="[[_isReadOnly('date_of_draft_report_to_unicef', data.date_of_comments_by_ip, 
                                    data.date_of_comments_by_unicef, basePermissionPath)]]"
              invalid="{{_checkFieldInvalid(errors.date_of_draft_report_to_unicef)}}"
              error-message="{{errors.date_of_draft_report_to_unicef}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              min-date="[[minDate(data.date_of_comments_by_ip)]]"
              max-date="[[maxDate]]"
            >
            </datepicker-lite>
          </div>

          <div class="input-container">
            <!-- Comments Received by UNICEF -->
            <datepicker-lite
              id="commentsReceivedUnicefInput"
              class$="[[_setRequired('date_of_comments_by_unicef', basePermissionPath)]]
                                    disabled-as-readonly validate-date"
              value="{{data.date_of_comments_by_unicef}}"
              label="[[getLabel('date_of_comments_by_unicef', basePermissionPath)]]"
              placeholder="&#8212;"
              required="[[_setRequired('date_of_comments_by_unicef', basePermissionPath)]]"
              disabled$="[[_isReadOnly('date_of_comments_by_unicef', data.date_of_draft_report_to_unicef,
                                        '', basePermissionPath)]]"
              invalid="{{_checkFieldInvalid(errors.date_of_comments_by_unicef)}}"
              error-message="{{errors.date_of_comments_by_unicef}}"
              on-focus="_resetFieldError"
              on-tap="_resetFieldError"
              selected-date-display-format="D MMM YYYY"
              min-date="[[minDate(data.date_of_draft_report_to_unicef)]]"
              max-date="[[maxDate]]"
            >
            </datepicker-lite>
          </div>

          <template is="dom-if" if="[[showCurrency(basePermissionPath)]]">
            <div class="input-container">
              <!-- Currency of Report -->
              <etools-dropdown
                id="currency_of_report"
                class$="validate-input disabled-as-readonly [[_setRequired('currency_of_report', basePermissionPath)]]"
                selected="{{data.currency_of_report}}"
                options="[[currencies]]"
                option-label="label"
                option-value="value"
                label="[[getLabel('currency_of_report', basePermissionPath)]]"
                placeholder="[[getPlaceholderText('currency_of_report', basePermissionPath, 'dropdown')]]"
                required$="{{_setRequired('currency_of_report', basePermissionPath)}}"
                disabled$="[[isReadOnly('currency_of_report', basePermissionPath)]]"
                readonly$="[[isReadOnly('currency_of_report', basePermissionPath)]]"
                invalid="{{_checkInvalid(errors.currency_of_report)}}"
                error-message="{{errors.currency_of_report}}"
                on-focus="_resetFieldError"
                on-tap="_resetFieldError"
                dynamic-align
              >
              </etools-dropdown>
            </div>
          </template>
        </div>
      </etools-content-panel>
    `;
  }
  static get observers() {
    return [
      '_updateStyles(data.date_of_field_visit)',
      '_updateStyles(data.date_of_draft_report_to_ip)',
      '_updateStyles(data.date_of_comments_by_ip)',
      '_updateStyles(data.date_of_draft_report_to_unicef)',
      '_updateStyles(data.date_of_comments_by_unicef)',
      '_updateStyles(basePermissionPath)',
      '_errorHandler(errorObject)'
    ];
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: String, observer: '_updateStyles'})
  basePermissionPath!: string;

  @property({type: Date})
  maxDate = new Date();

  @property({type: Boolean, readOnly: true})
  falseValue = false;

  @property({type: Array})
  currencies!: [];

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Engagement Status',
    fields: [
      'date_of_field_visit',
      'date_of_draft_report_to_ip',
      'date_of_comments_by_ip',
      'date_of_draft_report_to_unicef',
      'date_of_comments_by_unicef'
    ]
  };

  connectedCallback() {
    super.connectedCallback();
    this.set('currencies', getStaticData('staticDropdown').currencies);
  }

  _updateStyles() {
    this.updateStyles();
    this.checkDateValues();
  }

  _isReadOnly(field, prevDate, nextDate, basePermissionPath) {
    return this.isReadOnly(field, basePermissionPath) || !(prevDate && !nextDate);
  }

  validate(forSave) {
    const elements = this.shadowRoot!.querySelectorAll('.validate-date') as NodeListOf<DatePickerLite>;
    let valid = true;
    each(elements, (element, index) => {
      const previousElement = index > 1 ? elements[index - 1] : null;
      if (!forSave && element.required && (!previousElement || !!previousElement.value) && !element.validate()) {
        element.errorMessage = 'Field is required';
        element.invalid = true;
        valid = false;
      }
    });

    if (!valid) {
      fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
    }
    return valid;
  }

  checkDateValues() {
    if (!this.data) {
      return;
    }
    if (!this.data.date_of_field_visit) {
      this.data.date_of_field_visit = null;
    }
    if (!this.data.date_of_draft_report_to_ip) {
      this.data.date_of_draft_report_to_ip = null;
    }
    if (!this.data.date_of_comments_by_ip) {
      this.data.date_of_comments_by_ip = null;
    }
    if (!this.data.date_of_draft_report_to_unicef) {
      this.data.date_of_draft_report_to_unicef = null;
    }
    if (!this.data.date_of_comments_by_unicef) {
      this.data.date_of_comments_by_unicef = null;
    }
  }

  getAssignVisitData() {
    const data = pickBy(this.data, (value, key) => {
      const properties = [
        'date_of_field_visit',
        'date_of_draft_report_to_ip',
        'date_of_comments_by_ip',
        'date_of_draft_report_to_unicef',
        'date_of_comments_by_unicef',
        'currency_of_report'
      ];
      if (!~properties.indexOf(key)) {
        return false;
      }

      return !this.originalData || this.originalData[key] !== value;
    });

    return isEmpty(data) ? null : data;
  }

  minDate(strDate) {
    if (strDate) {
      let date = new Date(moment(strDate).format());
      date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // @ts-ignore
      return new Date(date - 1);
    }
    return undefined;
  }

  _checkFieldInvalid(error) {
    return !!error;
  }

  showCurrency(basePath) {
    return basePath && collectionExists(`${basePath}.currency_of_report`, 'GET');
  }

  _checkInvalid(value) {
    return !!value;
  }
}
window.customElements.define('assign-engagement', AssignEngagement);

export {AssignEngagement as AssignEngagementEl};
