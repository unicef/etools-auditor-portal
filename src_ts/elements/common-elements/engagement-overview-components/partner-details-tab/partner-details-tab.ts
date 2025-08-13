import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import isEqual from 'lodash-es/isEqual';
import sortBy from 'lodash-es/sortBy';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import PaginationMixin from '@unicef-polymer/etools-unicef/src/mixins/pagination-mixin';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency.js';
// import {readonlyPermission} from '../../../mixins/permission-controller';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import dayjs from 'dayjs';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {riskRatingStyles} from '../../../styles/risk-rating-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import '../../../data-elements/get-partner-data';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {setEngagementPartner, updateCurrentEngagement} from '../../../../redux/actions/engagement';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {getEndpoint} from '../../../config/endpoints-controller';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('partner-details-tab')
export class PartnerDetailsTab extends connect(store)(PaginationMixin(CommonMethodsMixin(EtoolsCurrency(LitElement)))) {
  static get styles() {
    return [moduleStyles, tabLayoutStyles, tabInputsStyles, layoutStyles, riskRatingStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit} .partner-loading {
          position: absolute;
          top: 28px;
          left: auto;
          background-color: #fff;
        }
        .partner-loading:not([active]) {
          display: none !important;
        }
        .input-container {
          display: flex;
        }
        etools-data-table-header {
          --list-bg-color: var(--medium-theme-background-color, #eeeeee);
        }
        etools-data-table-row.no-divider,
        etools-data-table-header.no-divider {
          --list-divider-color: none !important;
        }
        etools-data-table-column::part(edt-list-column-label) {
          line-height: 14px;
        }
        .overview-row {
          padding-inline-start: 34px;
        }
        *[slot='row-data'] .col-data.center-align {
          justify-content: center;
        }
      </style>

      <get-partner-data .partnerId="${this.partnerId}" @partner-loaded="${this._partnerLoaded}"></get-partner-data>

      <etools-media-query
        query="(max-width: 1200px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>

      <etools-content-panel class="content-section clearfix" panel-title="Selecting Partner" show-expand-btn>
        <div class="row">
          <div class="col-12 col-lg-6 col-md-6 input-container">
            <!-- Partner -->
            ${this.isReadOnly('partner', this.optionsData)
              ? html`<etools-input
                  label="${this.getLabel('partner', this.optionsData)}"
                  .value="${this.partner?.name}"
                  readonly
                ></etools-input>`
              : html`<etools-dropdown
                  id="partner"
                  class="${this._setRequired('partner', this.optionsData)} ${this._setReadonlyClass(
                    this.requestInProcess,
                    this.optionsData
                  )}"
                  .selected="${this.engagement.partner?.id}"
                  label="${this.getLabel('partner', this.optionsData)}"
                  placeholder="${this.getPlaceholderText('partner', this.optionsData, 'dropdown')}"
                  .options="${this.partners}"
                  option-label="name"
                  option-value="id"
                  ?required="${this._setRequired('partner', this.optionsData)}"
                  ?invalid="${this.errors.partner}"
                  .errorMessage="${this.errors.partner}"
                  @focus="${this._resetFieldError}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${this._requestPartner}"
                  dynamic-align
                >
                </etools-dropdown>`}

            <etools-loading .active="${this.requestInProcess}" no-overlay loading-text="" class="partner-loading">
            </etools-loading>
          </div>
          <div class="col-12 col-lg-4 col-md-6 input-container">
            <!-- Partner Vendor Number -->
            <etools-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this.partner?.vendor_number}"
              label="Vendor Number"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </etools-input>
          </div>
          <div class="col-12 col-xl-6 layout-horizontal layout-wrap no-padding">
            <div class="col-xl-4 col-6 input-container">
              <!-- HACT Risk rating -->
              <div class="etools-container">
                <label class="paper-label">HACT Risk Rating</label>
                <div
                  class="${this.getRiskRatingClass(this.partner?.rating)} input-label"
                  ?empty="${!this.partner.rating}"
                >
                  ${this.partner?.rating}
                </div>
              </div>
            </div>
            <div class="col-xl-4 col-6 input-container">
              <!-- Type of assessment -->
              <etools-input
                readonly
                placeholder="—"
                label="Type of Assesmment"
                .value="${this.partner?.type_of_assessment}"
              >
              </etools-input>
            </div>
            <div class="col-xl-4 col-6 input-container">
              <!--Date last assessed-->
              <etools-input
                readonly
                placeholder="—"
                label="${'Date of Report'}"
                .value="${this.getDateDisplayValue(this.partner.last_assessment_date)}"
              >
              </etools-input>
            </div>
          </div>
          <div class="col-12 col-xl-6 layout-horizontal layout-wrap no-padding">
            <div class="col-12 col-lg-6 input-container">
              <!-- Total of Amount tested -->
              <etools-input
                readonly
                placeholder="—"
                label="Total of Amount tested"
                .value=" ${this.displayCurrencyAmount(this.totalAmountTested, 0, 0)}"
              >
              </etools-input>
            </div>
            <div class="col-12 col-lg-6 input-container">
              <!-- Amount of Financial Findings -->
              <etools-input
                readonly
                placeholder="—"
                label="Amount of Financial Findings (percentage)"
                .value=" ${this.displayCurrencyAmount(this.amountFinancialFindingsPercentage, 0, 0)}"
              >
              </etools-input>
            </div>
          </div>

          <div class="col-12 padding-v" ?hidden="${!this.partner?.id}">
            <etools-data-table-header no-title no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <etools-data-table-column class="col-1" field="engagement_type" sortable
                >Engagement Type</etools-data-table-column
              >
              <etools-data-table-column class="col-2 center-align" field="status_date" sortable
                >Date of Report</etools-data-table-column
              >
              <etools-data-table-column class="col-2 center-align" field="amount_tested" sortable
                >Amount Tested <br />(USD)</etools-data-table-column
              >
              <etools-data-table-column class="col-2 center-align" field="outstanding_findings" sortable
                >Financial Findings <br />(USD)</etools-data-table-column
              >
              <etools-data-table-column class="col-2 center-align" field="pending_unsupported_amount" sortable>
                Pending Unsupported Amount <br />(USD)</etools-data-table-column
              >
              <etools-data-table-column class="col-2 center-align">Report</etools-data-table-column>
              <etools-data-table-column class="col-1" field="open_high_priority_count" sortable>
                # Open High Priority AP
              </etools-data-table-column>
            </etools-data-table-header>
            ${(this.paginatedEngagements || []).map(
              (item) => html`
                <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                  <div slot="row-data" class="layout-horizontal">
                    <div class="col-data col-1" data-col-header-label="Engagement Type">
                      ${this.getEngagementTypeFulltext(item.engagement_type)}
                    </div>
                    <div class="col-data col-2 align-center" data-col-header-label="Date of Report">
                      ${this.getDateDisplayValue(item.status_date)}
                    </div>
                    <div class="col-data col-2 align-right" data-col-header-label="Amount Tested">
                      ${this.displayCurrencyAmount(item.amount_tested, 0, 0)}
                    </div>
                    <div class="col-data col-2 align-right" data-col-header-label="Financial Findings">
                      ${this.displayCurrencyAmount(item.outstanding_findings, 0, 0)}
                    </div>
                    <div class="col-data col-2 align-right" data-col-header-label="Pending Unsupported Amount">
                      ${this.displayCurrencyAmount(item.pending_unsupported_amount, 0, 0)}
                    </div>
                    <a
                      class="col-data ${this.lowResolutionLayout ? '' : 'report'} col-2 align-center"
                      data-col-header-label="Report"
                      target="_blank"
                      href="${this.linkFixUp(item.object_url)}"
                    >
                      <etools-icon-button name="open-in-new"></etools-icon-button>
                      View Report
                    </a>
                    <div class="col-data col-1 align-center" data-col-header-label="# Open High Priority AP">
                      ${item.open_high_priority_count}
                    </div>
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

  @property({type: Array})
  partners!: [];

  @property({type: Array})
  specialPartnerTypes = ['Bilateral / Multilateral', 'Government'];

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Boolean})
  lowResolutionLayout = false;

  @property({type: Object})
  errors: GenericObject = {};

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Array})
  allEngagements: any[] = [];

  @property({type: Number})
  totalAmountTested = 0;

  @property({type: Number})
  amountFinancialFindingsPercentage = 0;

  @property({type: Array})
  paginatedEngagements: any[] = [];

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Partner Details',
    fields: ['authorized_officers', 'active_pd', 'partner']
  };

  @property({type: Object})
  TYPES: any = {
    audit: 'Audit',
    ma: 'Micro Assessment',
    sc: 'Spot Check',
    sa: 'Special Audit'
  };

  @property({type: Object})
  partner!: GenericObject;

  @property({type: Object})
  authorizedOfficer: GenericObject | null = null;

  _engagement!: AnyObject;

  set engagement(engagement: AnyObject) {
    const isInitialSet = !this._engagement;
    this._engagement = engagement;
    if (isInitialSet) {
      this._engagementChanged(this.engagement);
    }
  }

  @property({type: Object})
  get engagement() {
    return this._engagement;
  }

  @property({type: String})
  partnerId!: string | null;

  connectedCallback() {
    super.connectedCallback();
    this._initListeners();
    this.addEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('sort-changed', this._sortOrderChanged as EventListenerOrEventListenerObject);
  }

  stateChanged(state: RootState) {
    if (state.commonData.loadedTimestamp && !isJsonStrMatch(this.partners, state.commonData.partners)) {
      this.partners = [...state.commonData.partners];
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
    }
  }

  _initListeners() {
    this._partnerLoaded = this._partnerLoaded.bind(this);
  }

  _partnerLoaded(event: CustomEvent) {
    if (event.detail) {
      this.partner = event.detail;
    }
    store.dispatch(setEngagementPartner(this.partner));
    this.partnerId = null;
    this.errors = {};
    this.requestInProcess = false;
    this.validatePartner();
  }

  validate() {
    return this.validatePartner();
  }

  validatePartner() {
    const partnerEl = this.shadowRoot?.querySelector('#partner') as EtoolsDropdownEl;
    if (!partnerEl || !partnerEl.required) {
      if (partnerEl) {
        partnerEl.invalid = false;
      }
      return true;
    }
    if (!this.engagement?.partner?.id) {
      this.errors = {...this.errors, partner: 'Partner is required'};
      partnerEl.invalid = true;
      return false;
    } else if (!this.partner.id) {
      this.errors = {...this.errors, partner: 'Can not find partner data'};
      partnerEl.invalid = true;
      return false;
    } else {
      partnerEl.invalid = false;
      return true;
    }
  }

  resetValidationErrors() {
    this.errors = {};
  }

  _setReadonlyClass(inProcess, optionsData) {
    return inProcess || this.isReadOnly('partner', optionsData) ? 'readonly' : '';
  }

  _showActivePd(partnerType, types) {
    return typeof partnerType === 'string' && types.every((type) => !~partnerType.indexOf(type));
  }

  _requestPartner(event, id) {
    if (this.requestInProcess) {
      return;
    }

    this.partner = {};
    this.authorizedOfficer = null;
    const selectedPartner = event && event.detail && event.detail.selectedItem;

    const partnerId = (selectedPartner && selectedPartner.id) || +id;
    if (!partnerId) {
      return;
    }

    this._getPartnerEngagements(partnerId);

    if (this.isReadOnly('partner', this.optionsData)) {
      this.partner = this.engagement.partner;
      this.partner.interventions = this.engagement.active_pd;
      store.dispatch(setEngagementPartner(this.partner));
      return;
    } else {
      this.engagement.partner = selectedPartner;
      store.dispatch(updateCurrentEngagement(this.engagement));
    }

    this.requestInProcess = true;
    this.partnerId = partnerId; // triggers GET request for partner
    return true;
  }

  _getPartnerEngagements(partnerId: string) {
    if (!partnerId) {
      return;
    }
    const requestOptions = {
      endpoint: getEndpoint('partnerEngagements'),
      params: {
        ordering: 'unique_id',
        status: 'final',
        partner: partnerId
      },
      csrf: true
    };

    sendRequest(requestOptions)
      .then((results: any) => {
        this._initEngagements(results);
      })
      .catch((err: any) => {
        console.log(err);
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
  }

  _initEngagements(engagements: any[]) {
    engagements = (engagements || []).sort(
      (a: any, b: any) => dayjs(b.status_date).unix() - dayjs(a.status_date).unix()
    );
    this.allEngagements = engagements;
    this.totalAmountTested = (this.allEngagements || []).map((x: any) => x.amount_tested).reduce((a, b) => a + b);
    this.paginatedEngagements = [];
    this.paginator = JSON.parse(
      JSON.stringify({
        count: engagements.length,
        page: 1,
        page_size: 5
      })
    );
  }

  _sortOrderChanged(e: CustomEvent) {
    const sorted = sortBy(this.allEngagements, (item) => item[e.detail.field]);
    this.allEngagements = e.detail.direction === 'asc' ? sorted : sorted.reverse();
    this.paginatorChanged();
  }

  // Override from PaginationMixin
  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  _paginate(pageNumber: number, pageSize: number) {
    if (!this.allEngagements) {
      return;
    }
    let engagements = cloneDeep(this.allEngagements);
    engagements = engagements.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    this.paginatedEngagements = engagements;
  }

  linkFixUp(url: string) {
    if (url && !url.includes('https://') && !url.includes('localhost')) {
      return 'https://' + url;
    }
    return url;
  }

  _engagementChanged(engagement) {
    if (!engagement || !engagement.partner) {
      this.partner = {};
    } else {
      this._requestPartner(null, engagement.partner.id);
    }
  }

  getPartnerData() {
    if (!this.validate()) {
      return null;
    }

    const data = {} as any;
    const originalPartnerId = this.originalData?.partner?.id;
    const partnerId = this.engagement?.partner?.id;

    if (originalPartnerId !== partnerId) {
      data.partner = partnerId;
    }

    if (isEqual(data, {})) {
      return null;
    }

    return data;
  }

  getEngagementTypeFulltext(type: string) {
    return this.TYPES[type] || type;
  }

  _setPlaceholderColor(partner) {
    return !partner || !partner.id ? 'no-data-fetched' : '';
  }

  _setPartnerAddress(partner) {
    if (!partner) {
      return '';
    }

    return [partner.address, partner.postal_code, partner.city, partner.country].filter((info) => !!info).join(', ');
  }

  _checkInvalid(value) {
    return !!value;
  }
}
