import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency.js';
import {collectionExists, getOptionsChoices} from '../../../mixins/permission-controller';
import {getArraysDiff} from '@unicef-polymer/etools-utils/dist/array.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {AnyObject, GenericObject} from '@unicef-polymer/etools-types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {CommonDataState} from '../../../../redux/reducers/common-data';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {updateCurrentEngagement} from '../../../../redux/actions/engagement';
import cloneDeep from 'lodash-es/cloneDeep';
import sortBy from 'lodash-es/sortBy';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {getEndpoint} from '../../../config/endpoints-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import dayjs from 'dayjs';
import {repeat} from 'lit/directives/repeat.js';

/**
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-info-details')
export class EngagementInfoDetails extends connect(store)(
  PaginationMixin(CommonMethodsMixin(ModelChangedMixin(EtoolsCurrency(LitElement))))
) {
  static get styles() {
    return [tabInputsStyles, moduleStyles, tabLayoutStyles, layoutStyles];
  }

  render() {
    if (!this.data) {
      return html``;
    }

    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} :host {
          position: relative;
          display: block;
          margin-bottom: 24px;
        }
        etools-currency {
          width: 100%;
        }
        etools-currency::part(form-control-label) {
          text-align: start;
        }
        etools-currency.centered::part(form-control-label) {
          text-align: center;
        }
        etools-currency {
          text-align: end;
        }
        .po-loading {
          position: absolute;
          top: 25px;
          left: auto;
          background-color: #fff;
        }
        .etools-loading:not([active]) {
          display: none !important;
        }
        etools-info-tooltip span[slot='message'] {
          white-space: nowrap;
          line-height: 15px;
        }
        etools-info-tooltip {
          width: 100%;
        }
        .w-200px {
          width: 200px;
        }
        .wrap {
          flex-wrap: wrap;
        }
        .top-aligned {
          align-items: flex-start;
        }
        .join-audit {
          padding-block-start: 12px !important;
          padding-inline-start: 12px !important;
          box-sizing: border-box;
          align-self: center;
        }
        .row .input-container {
          margin-bottom: 8px;
          display: flex;
        }
        .error-label {
          color: var(--error-color, #ea4022);
          display: block;
        }
        .info-label {
          color: var(--sl-input-label-color);
          display: block;
        }
        etools-data-table-header {
          --list-bg-color: var(--medium-theme-background-color, #eeeeee);
        }
        *[slot='row-data'] {
          padding-block: 6px;
        }
        etools-content-panel::part(ecp-content) {
          padding: 16px 0 !important;
        }
        datepicker-lite {
          padding: 0 !important;
        }
      </style>

      <etools-media-query
        query="(max-width: 1400px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <etools-content-panel class="content-section clearfix" panel-title="Selecting Engagement" show-expand-btn>
        <etools-loading .active="${this.loadingFaceForms}" loading-text="Loading Face Forms..." class="loading">
        </etools-loading>
        <div class="row">
          <div class="col-6 layout-horizontal layout-wrap top-aligned">
            <div class="col-md-12 col-lg-6">
              <etools-info-tooltip
                .hideTooltip="${this._hideTooltip(this.optionsData, this.showFace, this.data.engagement_type)}"
              >
                <!-- Engagement Type -->
                <etools-dropdown
                  slot="field"
                  id="engagementType"
                  class="w100 ${this._setRequired('engagement_type', this.optionsData)} validate-field"
                  .selected="${this.data.engagement_type}"
                  label="${this.getLabel('engagement_type', this.optionsData)}"
                  placeholder="${this.getPlaceholderText('engagement_type', this.optionsData, 'dropdown')}"
                  .options="${this.engagementTypes}"
                  option-label="label"
                  option-value="value"
                  ?required="${this._setRequired('engagement_type', this.optionsData)}"
                  ?readonly="${this.itIsReadOnly('engagement_type', this.optionsData)}"
                  ?invalid="${this._checkInvalid(this.errors.engagement_type)}"
                  .errorMessage="${this.errors.engagement_type}"
                  @focus="${(event: any) => this._resetFieldError(event)}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${({detail}: CustomEvent) => {
                    if (detail.selectedItem && this.data?.engagement_type !== detail.selectedItem?.value) {
                      this.selectedItemChanged(detail, 'engagement_type', 'value', this.data);
                      this.onEngagementTypeChanged();
                    }
                  }}"
                  hide-search
                >
                </etools-dropdown>
                <span slot="message"
                  >Attach FACE Form Requesting Funding, <br />
                  ICE Form, FACE Form Reporting,<br />
                  Statement of Expenditure</span
                >
              </etools-info-tooltip>
            </div>
               ${
                 this.showJoinAudit
                   ? html` <!-- Year of Audit -->
                       <div class="col-md-12 col-lg-6">
                         <etools-dropdown
                           id="yearOfAudit"
                           class="w100 ${this._setRequired('year_of_audit', this.optionsData)} validate-field"
                           .selected="${this.data.year_of_audit}"
                           label="${this.getLabel('year_of_audit', this.optionsData)}"
                           placeholder="${this.getPlaceholderText('year_of_audit', this.optionsData, 'dropdown')}"
                           .options="${this.yearOfAuditOptions}"
                           option-label="label"
                           option-value="value"
                           ?required="${this.isAuditOrSpecialAudit(this.data.engagement_type)}"
                           ?readonly="${this.itIsReadOnly('year_of_audit', this.optionsData)}"
                           ?invalid="${this._checkInvalid(this.errors.year_of_audit)}"
                           .errorMessage="${this.errors.year_of_audit}"
                           @focus="${this._resetFieldError}"
                           trigger-value-change-event
                           @etools-selected-item-changed="${({detail}: CustomEvent) =>
                             this.selectedItemChanged(detail, 'year_of_audit', 'value', this.data)}"
                           hide-search
                         >
                         </etools-dropdown>
                       </div>`
                   : html`<div class="col-md-12 col-lg-6"></div>`
               }

            ${
              this.showJoinAudit
                ? html`<div class="col-md-12 col-lg-6">
                    <!-- Joint Audit -->
                    <etools-checkbox
                      class="join-audit"
                      ?checked="${this.data.joint_audit}"
                      ?disabled="${this.itIsReadOnly('joint_audit', this.optionsData)}"
                      @sl-change="${(e: any) => {
                        this.data.joint_audit = e.target.checked;
                      }}"
                    >
                      ${this.getLabel('joint_audit', this.optionsData)}
                    </etools-checkbox>
                  </div>`
                : html``
            }
              ${
                this.showSharedAuditField(this.data.engagement_type)
                  ? html` <!-- Shared Audit with-->
                      <div class="col-md-12 col-lg-6" ?hidden="${this._hideField('shared_ip_with', this.optionsData)}">
                        <etools-dropdown-multi
                          id="sharedWith"
                          class="w100 validate-input ${this._setRequired('shared_ip_with', this.optionsData)}"
                          label="${this.getLabel('shared_ip_with', this.optionsData)}"
                          placeholder="${this.getPlaceholderText('shared_ip_with', this.optionsData)}"
                          .options="${this.sharedIpWithOptions}"
                          option-label="display_name"
                          option-value="value"
                          .selectedValues="${this.data.shared_ip_with || []}"
                          ?required="${this._setRequired('shared_ip_with', this.optionsData)}"
                          ?readonly="${this.itIsReadOnly('shared_ip_with', this.optionsData)}"
                          ?invalid="${this.errors.shared_ip_with}"
                          .errorMessage="${this.errors.shared_ip_with}"
                          @focus="${(event: any) => this._resetFieldError(event)}"
                          dynamic-align
                          hide-search
                          trigger-value-change-event
                          @etools-selected-items-changed="${({detail}: CustomEvent) => {
                            const selected = (detail.selectedItems || []).map((x) => x.value);
                            if (!isJsonStrMatch(this.data.shared_ip_with, selected)) {
                              this.data.shared_ip_with = selected;
                            }
                          }}"
                        >
                        </etools-dropdown-multi>
                      </div>`
                  : html`<div class="col-md-12 col-lg-6"></div>`
              }
            </div>

            <div class="col-6 layout-horizontal layout-wrap">
              ${
                this.showFaceForm(this.data.engagement_type, this.data?.partner?.id)
                  ? html`<div class="col-md-12 col-lg-6">
                        <!-- Period Start Date -->
                        <datepicker-lite
                          id="periodStartDateInput"
                          class="w100 ${this._isAdditionalFieldRequired(
                            'start_date',
                            this.optionsData,
                            this.data.engagement_type
                          )} validate-field"
                          .value="${this.data.start_date}"
                          label="${this.getStartEndDateLabel(
                            this.data.engagement_type,
                            'start_date',
                            this.optionsData
                          )}"
                          placeholder="${this.getPlaceholderText('start_date', this.optionsData, 'datepicker')}"
                          selected-date-display-format="D MMM YYYY"
                          ?required="${this.isFaceFieldRequired(this.data?.engagement_type)}"
                          ?readonly="${!this.isSpecialAuditEditable(this.data?.id, this.data?.engagement_type)}"
                          ?invalid="${this._checkInvalid(this.errors.start_date)}"
                          .errorMessage="${this.errors.start_date}"
                          @focus="${(event: any) => this._resetFieldError(event)}"
                          fire-date-has-changed
                          @date-has-changed="${({detail}: CustomEvent) =>
                            this.dateHasChanged(detail, 'start_date', this.data)}"
                        >
                        </datepicker-lite>
                      </div>

                      <div class="col-md-12 col-lg-6">
                        <!-- Period End Date -->
                        <datepicker-lite
                          id="periodEndDateInput"
                          class="w100 ${this._isAdditionalFieldRequired(
                            'end_date',
                            this.optionsData,
                            this.data.engagement_type
                          )} validate-field"
                          .value="${this.data.end_date}"
                          label="${this.getStartEndDateLabel(this.data.engagement_type, 'end_date', this.optionsData)}"
                          placeholder="${this.getPlaceholderText('end_date', this.optionsData, 'datepicker')}"
                          data-selector="periodEndDate"
                          ?required="${this.isFaceFieldRequired(this.data?.engagement_type)}"
                          ?readonly="${!this.isSpecialAuditEditable(this.data?.id, this.data?.engagement_type)}"
                          ?invalid="${this._checkInvalid(this.errors.end_date)}"
                          .errorMessage="${this.errors.end_date}"
                          @focus="${(event: any) => this._resetFieldError(event)}"
                          selected-date-display-format="D MMM YYYY"
                          fire-date-has-changed
                          @date-has-changed="${({detail}: CustomEvent) =>
                            this.dateHasChanged(detail, 'end_date', this.data)}"
                        >
                        </datepicker-lite>
                      </div>`
                  : ``
              }
              <div class="col-md-12 col-lg-6" ?hidden="${!this.showFace}">
                <!-- Total Value of Selected FACE Forms -->
                <etools-currency
                  class="w100 validate-field
                                  ${this._isAdditionalFieldRequired(
                                    'total_value',
                                    this.optionsData,
                                    this.data.engagement_type
                                  )}"
                  field="total_value"
                  .value="${this.data.total_value || 0}"
                  label="Total Value of Selected FACE form(s) in USD"
                  placeholder="${this.getPlaceholderText('total_value', this.optionsData)}"
                  ?required="${this.isFaceFieldRequired(this.data?.engagement_type)}"
                  ?readonly="${
                    this.itIsReadOnly('total_value', this.optionsData) &&
                    !this.isSpecialAuditEditable(this.data?.id, this.data?.engagement_type)
                  }"
                  ?invalid="${this._checkInvalid(this.errors.total_value)}"
                  .errorMessage="${this.errors.total_value}"
                  @focus="${(event: any) => this._resetFieldError(event)}"
                  @value-changed="${({detail}: CustomEvent) => this.numberChanged(detail, 'total_value', this.data)}"
                >
                </etools-currency>
              </div>
              <div class="col-md-12 col-lg-6" ?hidden="${!this.showFace}">
                <!-- Total Value of Selected FACE Forms Local in local currency -->
                <etools-currency
                  class="w100 validate-field
                                  ${this._isAdditionalFieldRequired(
                                    'total_value_local',
                                    this.optionsData,
                                    this.data.engagement_type
                                  )}"
                  field="total_value_local"
                  .value="${this.data?.total_value_local || 0}"
                  label="Total Value of Selected FACE form(s) in Local Currency"
                  placeholder="${this.getPlaceholderText('total_value_local', this.optionsData)}"
                  ?required="${this.isFaceFieldRequired(this.data?.engagement_type)}"
                  ?readonly="${
                    this.itIsReadOnly('total_value_local', this.optionsData) &&
                    !this.isSpecialAuditEditable(this.data?.id, this.data?.engagement_type)
                  }"
                  ?invalid="${this._checkInvalid(this.errors.total_value_local)}"
                  .errorMessage="${this.errors.total_value_local}"
                  @focus="${(event: any) => this._resetFieldError(event)}"
                  @value-changed="${({detail}: CustomEvent) =>
                    this.numberChanged(detail, 'total_value_local', this.data)}"
                >
                </etools-currency>
              </div>
            </div>
          </div>

          <div
            class="col-12 padding-v"
            ?hidden="${
              !this.showFaceForm(this.data?.engagement_type, this.data?.partner?.id) ||
              this.doesNotHaveFaceData(this.data, this.isFaceFormReadonly)
            }"
          >
            <label class="error-label" id="lblFaceRequired" ?hidden="${!this.showFaceRequired}">
              Please select at least one Face item
            </label>
            <label class="info-label" id="lblFaceRequired"> No. of selected Face(s): ${this.noOfSelectedFaces} </label>
            <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <etools-data-table-column class="col-2 wrap-text" field="face_number" sortable>
                FACE No. (Liquidation)
              </etools-data-table-column>
              <etools-data-table-column class="col-1 wrap-text" field="face_accounted" sortable>
                FACE No. (Request)
              </etools-data-table-column>
              <etools-data-table-column class="col-1" field="currency" sortable> Currency </etools-data-table-column>
              <etools-data-table-column class="col-2 center-align" field="amount_local" sortable>
                Amount
              </etools-data-table-column>
              <etools-data-table-column class="col-1 center-align" field="amount_usd" sortable>
                Amount (USD)
              </etools-data-table-column>
              <etools-data-table-column class="col-1 center-align" field="exchange_rate" sortable>
                Exchange rate
              </etools-data-table-column>
              <etools-data-table-column class="col-1" field="date_of_liquidation" sortable>
                Date of <br />
                Liquidation
              </etools-data-table-column>
              <etools-data-table-column class="col-1" field="start_date" sortable>
                Start Date
              </etools-data-table-column>
              <etools-data-table-column class="col-1" field="end_date" sortable> End Date </etools-data-table-column>
              <etools-data-table-column class="col-1"> Modality </etools-data-table-column>
            </etools-data-table-header>

            ${repeat(
              this.paginatedFaceData || [],
              (item: any) => item.id,
              (item, _index) => html`
                <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                  <div slot="row-data" class="layout-horizontal">
                    <div class="col-data col-2 wrap-text" data-col-header-label="FACE No. (Liquidation)">
                      <etools-checkbox
                        size="small"
                        ?checked="${item.selected}"
                        ?disabled="${this.isFaceFormReadonly}"
                        id="${item.id}"
                        @sl-change="${(e: any) => {
                          this.showFaceRequired = false;
                          this.allFaceData[Number(this.paginator.visible_range[0]) - 1 + _index].selected =
                            e.target.checked;
                          this.onFaceChange(this.allFaceData);
                        }}"
                      >
                        ${item.face_number}
                      </etools-checkbox>
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="FACE No. (Request)">
                      ${item.face_accounted}
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="Currency">${item.currency}</div>
                    <div class="col-data col-2 align-right" data-col-header-label="Amount">
                      ${this.displayCurrencyAmount(item.amount_local, 0, 2)}
                    </div>
                    <div class="col-data col-1 align-right" data-col-header-label="Amount (USD)">
                      ${this.displayCurrencyAmount(item.amount_usd, 0, 2)}
                    </div>
                    <div class="col-data col-1 align-right" data-col-header-label="Exchange rate">
                      ${item.exchange_rate}
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="Date of Liquidation">
                      ${this.getDateDisplayValue(item.date_of_liquidation)}
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="Start Date">
                      ${this.getDateDisplayValue(item.start_date)}
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="End Date">
                      ${this.getDateDisplayValue(item.end_date)}
                    </div>
                    <div class="col-data col-1 wrap-text" data-col-header-label="Modality">${item.modality}</div>
                  </div>
                </etools-data-table-row>
              `
            )}
            <etools-data-table-footer
              .lowResolutionLayout="${this.lowResolutionLayout}"
              .pageSize="${this.paginator.page_size}"
              .pageNumber="${this.paginator.page}"
              .totalResults="${this.paginator.count}"
              .visibleRange="${this.paginator.visible_range}"
              @page-size-changed="${this.pageSizeChanged}"
              @page-number-changed="${this.pageNumberChanged}"
            >
            </etools-data-table-footer>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  _emptyArray(arr) {
    return !arr || !arr.length;
  }
  getSeparator(collection, index) {
    if (!collection) {
      return '';
    }
    if (index < collection.length - 1) {
      return '|';
    }
    return '';
  }

  @property({type: Array})
  yearOfAuditOptions!: {label: string; value: number}[];

  @property({type: Array})
  engagementTypes: GenericObject[] = [
    {
      label: 'Micro Assessment',
      value: 'ma'
    },
    {
      label: 'Audit',
      value: 'audit'
    },
    {
      label: 'Spot Check',
      value: 'sc'
    },
    {
      label: 'Special Audit',
      value: 'sa'
    }
  ];

  private _data!: GenericObject;

  @property({type: Object})
  set data(data: GenericObject) {
    const idChanged = this._data?.id !== data?.id;
    // when engagement changed, use a clone of it
    this._data = idChanged ? cloneDeep(data) : data;
    if (idChanged) {
      // needed when we load an engagement to set visible fields
      this.onEngagementTypeChanged(false);
      this.setYearOfAuditOptions(this.data.year_of_audit);
    }
  }

  get data() {
    return this._data;
  }

  @property({type: Object})
  originalData: any = {};

  @property({type: Object})
  errors: AnyObject = {};

  @property({type: String})
  engagementType = '';

  @property({type: Date})
  maxDate = new Date();

  @property({type: Object})
  tabTexts = {
    name: 'Engagement Details',
    fields: ['agreement', 'end_date', 'start_date', 'engagement_type', 'total_value', 'face_forms']
  };

  @property({type: Boolean})
  showJoinAudit = false;

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Boolean})
  showFace!: boolean;

  @property({type: Boolean})
  loadingFaceForms!: boolean;

  @property({type: Array})
  users!: GenericObject[];

  @property({type: Object})
  reduxCommonData!: CommonDataState;

  @property({type: Number})
  noOfSelectedFaces = 0;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  user!: GenericObject;

  @property({type: Boolean})
  poUpdating!: boolean;

  @property({type: String})
  detailsRoutePath!: string;

  @property({type: Array})
  allFaceData: any[] = [];

  @property({type: Array})
  paginatedFaceData: any[] = [];

  @property({type: Number})
  prevPartnerId!: number;

  @property({type: Boolean})
  showFaceRequired = false;

  @property({type: Boolean})
  isFaceFormReadonly = false;

  @property({type: Array})
  sharedIpWithOptions: [] = [];

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.detailsRoutePath, state.app.routeDetails?.path)) {
      this.detailsRoutePath = state.app.routeDetails?.path;
      // prevent controls to show old values
      this.cleanUpStoredValues();
    }
    if (state.commonData.loadedTimestamp) {
      this.reduxCommonData = state.commonData;
    }
    if (state.user?.data && !isJsonStrMatch(this.user, state.user.data)) {
      this.user = cloneDeep(state.user.data);
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
    if (changedProperties.has('optionsData')) {
      this.isFaceFormReadonly = this.isReadOnly('face_forms', this.optionsData);
      this._setEngagementTypes(this.optionsData);
      this._setSharedIpWith(this.optionsData);
    }
  }

  isReadonly_YearOfAudit(engagement_type, id) {
    if (engagement_type != 'audit') {
      return true;
    }
    if (!id) {
      return false;
    }
    return true;
  }

  showSharedAuditField(engagement_type: string) {
    return !!engagement_type && engagement_type !== 'sc';
  }

  isSpecialAuditEditable(id: string, engagement_type: string) {
    return !id && this.isSpecialAudit(engagement_type);
  }

  isFaceFieldRequired(engagement_type: string) {
    return engagement_type && !['ma', 'sa'].includes(engagement_type);
  }

  itIsReadOnly(field: string, permissions: AnyObject) {
    return !this.data.partner?.id || this.isReadOnly(field, permissions);
  }

  _setSharedIpWith(optionsData: AnyObject) {
    const sharedIpWithOptions = getOptionsChoices(optionsData, 'shared_ip_with.child');
    this.sharedIpWithOptions = sharedIpWithOptions || [];
  }

  showFaceForm(engagement_type: string, partnerId?: number) {
    this.showFace = !!engagement_type && engagement_type !== 'ma';
    this.showJoinAudit = !!engagement_type && ['audit', 'sa'].includes(engagement_type);
    if (this.showFace && partnerId && this.prevPartnerId !== partnerId) {
      this.prevPartnerId = partnerId;
      //@dci this.data.face_forms = [];
      this.loadFaceData(this.prevPartnerId);
    }
    return this.showFace;
  }

  doesNotHaveFaceData(data: GenericObject, isFaceFormReadonly: boolean) {
    return isFaceFormReadonly && data?.id && !(data?.face_forms || []).length;
  }

  loadFaceData(partnerId: number) {
    if (this.isFaceFormReadonly) {
      // for existing engagements table is not editable, just show selected face_forms for info,
      //  no need to request all existing forms,
      this.setFaceData([...(this.data.face_forms || [])], true);
      return;
    }
    this.loadingFaceForms = true;
    const url = getEndpoint('linkFace', {id: partnerId}).url;
    sendRequest({
      endpoint: {url}
    })
      .then((resp) => {
        this.setFaceData(resp || []);
        this.requestUpdate();
      })
      .catch((err) => fireEvent(this, 'toast', {text: `Error fetching Face forms data for ${partnerId}: ${err}`}))
      .finally(() => (this.loadingFaceForms = false));
  }

  setFaceData(faceData: any[], defaultSelection = false) {
    this.allFaceData = faceData || [];
    this.allFaceData.forEach((x: any) => (x.selected = defaultSelection));
    if (!defaultSelection) {
      // if opening an existing record check previous saved faceForms
      const selectedFaceForms = (this.data.face_forms || []).map((x: any) => x.id);
      this.allFaceData.forEach((item) => (item.selected = selectedFaceForms.includes(item.id)));
    }
    this.noOfSelectedFaces = this.allFaceData.filter((x) => x.selected).length;
    this.paginatedFaceData = [];
    this.paginator = JSON.parse(
      JSON.stringify({
        count: faceData.length,
        page: 1,
        page_size: 5
      })
    );
  }

  _sortOrderChanged(e: CustomEvent) {
    const sorted = sortBy(this.allFaceData, (item) => item[e.detail.field]);
    this.allFaceData = e.detail.direction === 'asc' ? sorted : sorted.reverse();
    this.paginatorChanged();
  }

  // Override from PaginationMixin
  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.allFaceData) {
      return;
    }
    let faceData = cloneDeep(this.allFaceData);
    faceData = faceData
      .sort((a: any, b: any) => dayjs(b.status_date).unix() - dayjs(a.status_date).unix())
      .slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

    this.paginatedFaceData = faceData;
  }

  onFaceChange(allFaceData: any[]) {
    const selectedFaceForms: any[] = (allFaceData || []).filter((x: any) => x.selected);
    this.noOfSelectedFaces = selectedFaceForms.length;
    this.data.face_forms = [...selectedFaceForms];
    let amount_usd = 0;
    let amount_local = 0;
    let start_date: any = null;
    let end_date: any = null;
    let end_date_local: any = null;
    let exchange_rate = 1;

    for (const faceForm of selectedFaceForms) {
      amount_usd += Number(faceForm.amount_usd);
      if (faceForm.start_date && (!start_date || dayjs(faceForm.start_date) < start_date)) {
        start_date = dayjs(faceForm.start_date);
      }
      if (faceForm.end_date && (!end_date || dayjs(faceForm.end_date) > end_date)) {
        end_date = dayjs(faceForm.end_date);
      }
      if (faceForm.currency !== 'USD') {
        // get the exchange rate from the latest face item with  different currency than $
        if (faceForm.end_date && (!end_date_local || dayjs(faceForm.end_date) > end_date_local)) {
          end_date_local = dayjs(faceForm.end_date);
          exchange_rate = Number(faceForm.exchange_rate);
        }
      }
    }
    console.log(`exchange rate: ${exchange_rate}`);
    for (const faceForm of selectedFaceForms) {
      if (faceForm.currency === 'USD') {
        amount_local += exchange_rate * Number(faceForm.amount_local);
      } else {
        amount_local += Number(faceForm.amount_local);
      }
    }

    this.data = {
      ...this.data,
      total_value: amount_usd,
      total_value_local: amount_local,
      start_date: start_date ? dayjs(start_date).format('YYYY-MM-DD') : start_date,
      end_date: end_date ? dayjs(end_date).format('YYYY-MM-DD') : end_date
    };
    store.dispatch(updateCurrentEngagement(this.data));
  }

  cleanUpStoredValues() {
    this.data = {};
  }

  onEngagementTypeChanged(updateEngagement = true) {
    this._setShowInput(this.data.engagement_type, updateEngagement);
    if (updateEngagement) {
      store.dispatch(updateCurrentEngagement(this.data));
    }
  }

  setYearOfAuditOptions(savedYearOfAudit: number) {
    const currYear = new Date().getFullYear();
    this.yearOfAuditOptions = [
      {label: String(currYear - 1), value: currYear - 1},
      {label: String(currYear), value: currYear},
      {label: String(currYear + 1), value: currYear + 1}
    ];
    if (savedYearOfAudit < currYear - 1) {
      this.yearOfAuditOptions.unshift({value: savedYearOfAudit, label: String(savedYearOfAudit)});
    }
  }

  getYearOfAuditStyle(engagementType: string) {
    let cssClasses = 'year-of-audit';
    if (!['audit', 'sa', 'sc'].includes(engagementType)) {
      cssClasses += ' hide';
    }
    return cssClasses;
  }

  getStartEndDateLabel(engType: string, field: string, options: AnyObject) {
    if (['sa', 'audit'].includes(engType)) {
      if (field === 'start_date') {
        return 'Start date of first reporting FACE';
      } else {
        return 'End date of last reporting FACE';
      }
    }

    return this.getLabel(field, options);
  }

  validate() {
    if (this.itIsReadOnly('engagement_type', this.optionsData)) {
      // type is not editable (and the other fields)
      return true;
    }

    const elements = this.shadowRoot!.querySelectorAll('.validate-field');
    let valid = true;
    elements.forEach((element: any) => {
      if (element.required && !(element.disabled || element.readonly) && !element.validate()) {
        const label = element.label || 'Field';
        element.errorMessage = `${label} is required`;
        element.invalid = true;
        valid = false;
      }
    });

    this.showFaceRequired = false;
    if (
      this.data.engagement_type &&
      ['audit', 'sc'].includes(this.data.engagement_type) &&
      !this.data?.face_forms?.length
    ) {
      this.showFaceRequired = true;
      valid = false;
    }

    const periodStart = this.shadowRoot!.querySelector('#periodStartDateInput') as EtoolsInput;
    const periodEnd = this.shadowRoot!.querySelector('#periodEndDateInput') as EtoolsInput;
    const startValue = periodStart ? Date.parse(periodStart.value! as string) : 0;
    const endValue = periodEnd ? Date.parse(periodEnd.value! as string) : 0;

    if (periodEnd && periodStart && periodEnd && startValue && startValue > endValue) {
      periodEnd.errorMessage = 'This date should be after Period Start Date';
      periodEnd.invalid = true;
      valid = false;
    }

    return valid;
  }

  resetValidationErrors() {
    this.errors = {...this.errors, agreement: false};
    const el = this.shadowRoot!.querySelectorAll('.validate-field');
    el.forEach((e: any) => (e.invalid = false));

    const elements = this.shadowRoot!.querySelectorAll('.validate-field');
    elements.forEach((element: any) => {
      element.errorMessage = '';
      element.invalid = false;
    });
  }

  _processValue(value: string) {
    return this.engagementTypes.filter((type: any) => {
      return type.value === value;
    })[0];
  }

  _poUpdatingStateChanged(event: CustomEvent): void {
    this.poUpdating = event.detail.state;
  }

  getEngagementData() {
    const data: any = {};

    if (!this.isReadOnly('engagement_type', this.optionsData)) {
      if (this.originalData.engagement_type !== this.data.engagement_type && !this.isStaffSc) {
        data.engagement_type = this.data.engagement_type;
      }
    }

    if (!this.isReadOnly('start_date', this.optionsData)) {
      if (this.originalData.start_date !== this.data.start_date) {
        data.start_date = this.data.start_date;
      }
      if (this.originalData.end_date !== this.data.end_date) {
        data.end_date = this.data.end_date;
      }
    }

    const originalSharedIpWith = this.originalData?.shared_ip_with || [];
    const sharedIpWith = this.data.shared_ip_with || [];
    if (sharedIpWith.length && sharedIpWith.filter((x) => !originalSharedIpWith.includes(x)).length > 0) {
      data.shared_ip_with = sharedIpWith;
    }

    if (!this.isFaceFormReadonly) {
      if (['audit', 'sa', 'sc'].includes(this.data.engagement_type)) {
        if (isNaN(parseFloat(this.data.total_value)) || parseFloat(this.data.total_value) === 0) {
          this.data.total_value = null;
        }

        if (this.originalData.total_value !== this.data.total_value) {
          data.total_value = this.data.total_value || 0;
        }

        if (this.originalData.total_value_local !== this.data.total_value_local) {
          data.total_value_local = this.data.total_value_local || 0;
        }

        data.joint_audit = !!this.data.joint_audit;

        data.year_of_audit = this.data.year_of_audit;
        const diff = getArraysDiff(this.originalData.face_forms || [], this.data?.face_forms || [], 'id');
        if (diff.length) {
          data.face_forms = this.getFaceFormsToSave(this.data?.face_forms);
        }
      }
    }

    return data;
  }

  getFaceFormsToSave(face_forms: any[]) {
    return (face_forms || []).map((item: any) => item.id);
  }

  // collectionChanged(originalCollection: any[], newCollection: any[]) {
  //   return (
  //     this.collectionsHaveDifferentLength(originalCollection, newCollection) ||
  //     this.collectionsAreDifferent(originalCollection, newCollection)
  //   );
  // }

  // collectionsHaveDifferentLength(originalCollection: any[], newCollection: any[]) {
  //   return originalCollection.length !== newCollection.length;
  // }

  // collectionsAreDifferent(originalCollection: any[], newCollection: any[]) {
  //   return newCollection.filter((id) => !originalCollection.includes(+id)).length > 0;
  // }

  _setShowInput(type: string, resetValues: boolean) {
    this.showFace = !!type && type !== 'ma';
    this.showJoinAudit = !!type && ['audit', 'sa'].includes(type);
    if (!this.showFace && resetValues) {
      // reset values
      this.data.total_value = 0;
      this.data.total_value_local = 0;
      this.data.start_date = undefined;
      this.data.end_date = undefined;
    }
  }

  _hideTooltip(options: AnyObject, showInput: any, type: any) {
    return this.itIsReadOnly('engagement_type', options) || this.isSpecialAudit(type) || !showInput;
  }

  _setEngagementTypes(options: AnyObject) {
    const types = getOptionsChoices(options, 'engagement_type');
    if (!types) {
      return;
    }

    this.engagementTypes = types.map((typeObject: any) => {
      return {
        value: typeObject.value,
        label: typeObject.display_name
      };
    });
  }

  _getEngagementTypeLabel(type: string) {
    const value = this._processValue(type) || {};
    return value.label || '';
  }

  _isAdditionalFieldRequired(field: any, options: AnyObject, type: any) {
    if (this.isSpecialAudit(type)) {
      return false;
    }
    return this._setRequired(field, options);
  }

  _getPoItems(agreement: any) {
    let poItems = [];

    if (agreement && Array.isArray(agreement.items)) {
      agreement.items = agreement.items.filter((item: any) => item);

      poItems = agreement.items.map((item: any) => {
        return {
          id: item.id,
          number: `${item.number}`
        };
      });
    }

    return poItems;
  }

  _isDataAgreementReadonly(field: string, permissions: AnyObject, agreement: any) {
    if (!agreement) {
      return false;
    }
    return this.itIsReadOnly(field, permissions) || !agreement.id;
  }

  _hideField(fieldName: any, optionsData: AnyObject) {
    if (!fieldName || !optionsData) {
      return false;
    }

    const collectionNotExists =
      !collectionExists(fieldName, optionsData, 'POST') &&
      !collectionExists(fieldName, optionsData, 'PUT') &&
      !collectionExists(fieldName, optionsData, 'GET');

    return collectionNotExists;
  }

  _hideForSc(isStaffSc: any) {
    return isStaffSc;
  }

  _checkInvalid(value) {
    return !!value;
  }
}
