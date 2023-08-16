import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';

import '@unicef-polymer/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';

import isEmpty from 'lodash-es/isEmpty';
import pickBy from 'lodash-es/pickBy';
declare const dayjs: any;
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {collectionExists} from '../../../mixins/permission-controller';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import DateMixin from '../../../mixins/date-mixin';
import {getStaticData} from '../../../mixins/static-data-controller';
import {validateRequiredFields} from '../../../utils/utils';

/**
 * @LitElement
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin CommonMethodsMixin
 */

@customElement('assign-engagement')
export class AssignEngagement extends DateMixin(CommonMethodsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style></style>

      <etools-content-panel class="content-section clearfx" panel-title="Engagement Status">
        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Date of Field Visit -->
            <datepicker-lite
              id="dateVisitInput"
              class="${this._setRequired('date_of_field_visit', this.basePermissionPath)} validate-date"
              .value="${this.data.date_of_field_visit}"
              label="${this.getLabel('date_of_field_visit', this.basePermissionPath)}"
              placeholder="&#8212;"
              ?required="${this._setRequired('date_of_field_visit', this.basePermissionPath)}"
              ?readonly="${this._isReadOnly('date_of_field_visit', 'true', this.falseValue, this.basePermissionPath)}"
              ?invalid="${this._checkFieldInvalid(this.errors?.date_of_field_visit)}"
              .errorMessage="${this.errors?.date_of_field_visit}"
              @focus="${this._resetFieldError}"
              selected-date-display-format="D MMM YYYY"
              .date="${this.prepareDate(this.data.date_of_field_visit)}"
              fire-date-has-changed
              property-name="date_of_field_visit"
              @date-has-changed="${(e: CustomEvent) => {
                this.onDataChanged('date_of_field_visit', e.detail.date);
              }}"
            >
            </datepicker-lite>
          </div>

          <div class="col col-4">
            <!-- Draft Report Issued to IP -->
            <datepicker-lite
              id="draftReportToIpInput"
              class="${this._setRequired('date_of_draft_report_to_ip', this.basePermissionPath)} validate-date"
              .value="${this.data.date_of_draft_report_to_ip}"
              label="${this.getLabel('date_of_draft_report_to_ip', this.basePermissionPath)}"
              placeholder="&#8212;"
              ?required="${this._setRequired('date_of_draft_report_to_ip', this.basePermissionPath)}"
              ?readonly="${this._isReadOnly(
                'date_of_draft_report_to_ip',
                'true',
                this.data.date_of_comments_by_ip,
                this.basePermissionPath
              )}"
              ?invalid="${this._checkFieldInvalid(this.errors?.date_of_draft_report_to_ip)}"
              .errorMessage="${this.errors?.date_of_draft_report_to_ip}"
              @focus="${this._resetFieldError}"
              selected-date-display-format="D MMM YYYY"
              .maxDate="${this.maxDate}"
              fire-date-has-changed
              property-name="date_of_draft_report_to_ip"
              @date-has-changed="${(e: CustomEvent) => {
                this.onDataChanged('date_of_draft_report_to_ip', e.detail.date);
              }}"
            >
            </datepicker-lite>
          </div>

          <div class="col col-4">
            <!-- Comments Received by IP -->
            <datepicker-lite
              id="commentsReceivedByIpInput"
              class="${this._setRequired('date_of_comments_by_ip', this.basePermissionPath)} validate-date"
              .value="${this.data.date_of_comments_by_ip}"
              label="${this.getLabel('date_of_comments_by_ip', this.basePermissionPath)}"
              placeholder="&#8212;"
              ?required="${this._setRequired('date_of_comments_by_ip', this.basePermissionPath)}"
              ?readonly="${this._isReadOnly(
                'date_of_comments_by_ip',
                this.data?.date_of_draft_report_to_ip,
                this.data?.date_of_draft_report_to_unicef,
                this.basePermissionPath
              )}"
              ?invalid="${this._checkFieldInvalid(this.errors?.date_of_comments_by_ip)}"
              .errorMessage="${this.errors?.date_of_comments_by_ip}"
              @focus="${this._resetFieldError}"
              selected-date-display-format="D MMM YYYY"
              .minDate="${this.minDate(this.data?.date_of_draft_report_to_ip)}"
              .maxDate="${this.maxDate}"
              fire-date-has-changed
              property-name="date_of_comments_by_ip"
              @date-has-changed="${(e: CustomEvent) => {
                this.onDataChanged('date_of_comments_by_ip', e.detail.date);
              }}"
            >
            </datepicker-lite>
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-4">
            <!-- Draft Report Issued to UNICEF -->
            <datepicker-lite
              id="draftReportUnicefInput"
              class="${this._setRequired('date_of_draft_report_to_unicef', this.basePermissionPath)} validate-date"
              .value="${this.data.date_of_draft_report_to_unicef}"
              label="${this.getLabel('date_of_draft_report_to_unicef', this.basePermissionPath)}"
              placeholder="&#8212;"
              ?required="${this._setRequired('date_of_draft_report_to_unicef', this.basePermissionPath)}"
              ?readonly="${this._isReadOnly(
                'date_of_draft_report_to_unicef',
                this.data.date_of_comments_by_ip,
                this.data.date_of_comments_by_unicef,
                this.basePermissionPath
              )}"
              ?invalid="${this._checkFieldInvalid(this.errors?.date_of_draft_report_to_unicef)}"
              .errorMessage="${this.errors?.date_of_draft_report_to_unicef}"
              @focus="${this._resetFieldError}"
              selected-date-display-format="D MMM YYYY"
              .minDate="${this.minDate(this.data.date_of_comments_by_ip)}"
              .maxDate="${this.maxDate}"
              fire-date-has-changed
              property-name="date_of_draft_report_to_unicef"
              @date-has-changed="${(e: CustomEvent) => {
                this.onDataChanged('date_of_draft_report_to_unicef', e.detail.date);
              }}"
            >
            </datepicker-lite>
          </div>

          <div class="col col-4">
            <!-- Comments Received by UNICEF -->
            <datepicker-lite
              id="commentsReceivedUnicefInput"
              class="${this._setRequired('date_of_comments_by_unicef', this.basePermissionPath)} validate-date"
              .value="${this.data.date_of_comments_by_unicef}"
              label="${this.getLabel('date_of_comments_by_unicef', this.basePermissionPath)}"
              placeholder="&#8212;"
              ?required="${this._setRequired('date_of_comments_by_unicef', this.basePermissionPath)}"
              ?readonly="${this._isReadOnly(
                'date_of_comments_by_unicef',
                this.data.date_of_draft_report_to_unicef,
                '',
                this.basePermissionPath
              )}"
              ?invalid="${this._checkFieldInvalid(this.errors?.date_of_comments_by_unicef)}"
              .errorMessage="${this.errors?.date_of_comments_by_unicef}"
              @focus="${this._resetFieldError}"
              selected-date-display-format="D MMM YYYY"
              .minDate="${this.minDate(this.data.date_of_draft_report_to_unicef)}"
              .maxDate="${this.maxDate}"
              fire-date-has-changed
              property-name="date_of_comments_by_unicef"
              @date-has-changed="${(e: CustomEvent) => {
                this.onDataChanged('date_of_comments_by_unicef', e.detail.date);
              }}"
            >
            </datepicker-lite>
          </div>

          ${this.showCurrency(this.basePermissionPath)
            ? html`<div class="col col-4">
                <!-- Currency of Report -->
                <etools-dropdown
                  id="currency_of_report"
                  class="validate-input ${this._setRequired('currency_of_report', this.basePermissionPath)}"
                  .selected="${this.data.currency_of_report}"
                  .options="${this.currencies}"
                  option-label="label"
                  option-value="value"
                  label="${this.getLabel('currency_of_report', this.basePermissionPath)}"
                  placeholder="${this.getPlaceholderText('currency_of_report', this.basePermissionPath, 'dropdown')}"
                  ?required="${this._setRequired('currency_of_report', this.basePermissionPath)}"
                  ?readonly="${this.isReadOnly('currency_of_report', this.basePermissionPath)}"
                  ?invalid="${this._checkInvalid(this.errors?.currency_of_report)}"
                  .errorMessage="${this.errors?.currency_of_report}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) =>
                    this.onDataChanged('currency_of_report', detail.selectedItem && detail.selectedItem.value)}"
                  @focus="${this._resetFieldError}"
                  dynamic-align
                >
                </etools-dropdown>
              </div>`
            : ``}
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Date})
  maxDate = new Date();

  @property({type: Boolean})
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
    this.currencies = getStaticData('staticDropdown').currencies;
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
    }
  }

  _isReadOnly(field, prevDate, nextDate, basePermissionPath) {
    return this.isReadOnly(field, basePermissionPath) || !(prevDate && !nextDate);
  }

  onDataChanged(field, value) {
    this.data[field] = value;
    this.checkDateValues();
    this.requestUpdate();
    fireEvent(this, 'data-changed', this.data);
  }

  validate(escapeValidation) {
    if (escapeValidation) {
      return true;
    }
    const valid = validateRequiredFields(this);
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
      let date = new Date(dayjs(strDate).format());
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
