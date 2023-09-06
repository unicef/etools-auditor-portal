import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import assign from 'lodash-es/assign';
import EngagementMixin from '../../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {clearQueries} from '../../../mixins/query-params-controller';
import '../../../mixins/permission-controller';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {mainPageStyles} from '../../../styles/main-page-styles';
import '../../../common-elements/file-attachments-tab/file-attachments-tab';
import {FileAttachmentsTab} from '../../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../../common-elements/status-tab-element/status-tab-element';
import '../../../common-elements/pages-header-element/pages-header-element';
import '../../../data-elements/add-new-engagement';
import '../../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
// eslint-disable-next-line
import {EngagementInfoDetails} from '../../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
// eslint-disable-next-line
import {PartnerDetailsTab} from '../../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import '../../../common-elements/engagement-report-components/specific-procedure/specific-procedure';
// eslint-disable-next-line
import '../../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {RootState, store} from '../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {RouteDetails} from '@unicef-polymer/etools-types';
import {setEngagementData} from '../../../../redux/actions/engagement';
/**
 * @customElement
 * @LitElement
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin LastCreatedMixin
 */

@customElement('new-engagement-view')
export class NewEngagementView extends connect(store)(EngagementMixin(CommonMethodsMixin(LitElement))) {
  static get styles() {
    return [moduleStyles, gridLayoutStylesLit, mainPageStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;

          --paper-tab-content-unselected: {
            color: var(--gray-light);
          }

          --ecp-header-bg: var(--primary-color);
        }

        .tab-selector {
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-pack: start;
          -webkit-justify-content: flex-start;
          justify-content: flex-start;
          margin-top: -13px;
          padding-left: 22px;
          box-sizing: border-box;
          background-color: #ffffff;
          box-shadow: 1px -3px 9px 0 #000000;
        }

        .tab-selector paper-tabs {
          color: var(--primary-color);
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .tab-selector .tab-content {
          padding: 0 13px;
        }
      </style>

      <add-new-engagement
        .endpointName="${this.endpointName}"
        .newEngagementData="${this.newEngagementData}"
        @engagement-created="${this._engagementCreated}"
        .errorObject="${this.errorObject}"
      >
      </add-new-engagement>

      <pages-header-element hide-print-button .pageTitle="${this.pageTitle}" .engagement="${this.engagement}">
      </pages-header-element>

      <div class="tab-selector">
        <paper-tabs
          attr-for-selected="name"
          noink=""
          bottom-item=""
          role="tablist"
          tabindex="0"
          .selected="${this.tab}"
          @selected-changed="${(e: CustomEvent) => {
            if (this.tab !== e.detail.value) {
              this._tabChanged(e.detail.value, this.tab);
              this.tab = e.detail.value;
            }
          }}"
        >
          <paper-tab name="overview"><span class="tab-content">Engagement Overview</span></paper-tab>
          <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
        </paper-tabs>
      </div>

      <div class="view-container">
        <div id="pageContent">
          <iron-pages id="info-tabs" .selected="${this.tab}" attr-for-selected="name">
            <div name="overview">
              <engagement-info-details
                .errorObject="${this.errorObject}"
                .data="${this.engagement}"
                id="engagementDetails"
                .optionsData="${this.engagementOptions}"
                ?isStaffSc="${this.isStaffSc}"
              >
              </engagement-info-details>

              <partner-details-tab
                id="partnerDetails"
                .errorObject="${this.errorObject}"
                .engagement="${this.engagement}"
                .optionsData="${this.engagementOptions}"
              >
              </partner-details-tab>

              ${this.isSpecialAudit(this.engagement?.engagement_type)
                ? html` <specific-procedure
                    id="specificProcedures"
                    class="mb-15"
                    without-finding-column
                    .errorObject="${this.errorObject}"
                    save-with-button
                    .dataItems="${this.engagement.specific_procedures}"
                    .optionsData="${this.engagementOptions}"
                  >
                  </specific-procedure>`
                : ``}

              <engagement-staff-members-tab
                id="staffMembers"
                .errorObject="${this.errorObject}"
                save-with-button
                .engagement="${this.engagement}"
                .optionsData="${this.engagementOptions}"
              >
              </engagement-staff-members-tab>
            </div>

            <div name="attachments">
              <file-attachments-tab
                id="engagement_attachments"
                .baseId="${this.engagement.id}"
                .optionsData="${this.attachmentOptions}"
                error-property="engagement_attachments"
                path-postfix="attachments"
              >
              </file-attachments-tab>
            </div>
          </iron-pages>
        </div>

        <div id="sidebar">
          <status-tab-element
            .engagementData="${this.engagement}"
            .optionsData="${this.engagementOptions}"
          ></status-tab-element>
        </div>
      </div>
    `;
  }

  @property({type: String})
  endpointName!: string;

  @property({type: Object})
  newEngagementData!: GenericObject;

  @property({type: Object})
  engagement: GenericObject = {
    id: null,
    status: '',
    staff_members: [],
    engagement_type: '',
    engagement_type_details: {},
    engagement_attachments: [],
    agreement: {order_number: undefined},
    date_of_field_visit: null,
    date_of_draft_report_to_ip: null,
    date_of_comments_by_ip: null,
    date_of_draft_report_to_unicef: null,
    date_of_comments_by_unicef: null,
    partner_contacted_at: null,
    specific_procedures: [],
    users_notified: [],
    offices: [],
    sections: [],
    shared_ip_with: []
  };

  @property({type: Array})
  tabsList: string[] = ['overview', 'attachments'];

  @property({type: Object})
  queryParams: GenericObject = {};

  @property({type: Object})
  prevRouteDetails!: RouteDetails;

  @property({type: String, attribute: 'page-title'})
  pageTitle = '';

  @property({type: Boolean})
  isStaffSc!: boolean;

  @property({type: Object})
  auditFirm: GenericObject = {};

  links: {[key: string]: string} = {
    ma: 'micro-assessments',
    audit: 'audits',
    sc: 'spot-checks',
    sa: 'special-audits'
  };

  connectedCallback() {
    super.connectedCallback();
    clearQueries();
  }

  stateChanged(state: RootState) {
    if (!get(state, 'app.routeDetails.path') || !state.app.routeDetails.path.includes('new')) {
      this.prevRouteDetails = state.app.routeDetails;
      return;
    }
    this.initializeEngagementOnFirstAccess(state.app.routeDetails);

    if (state.user?.data && !isJsonStrMatch(state.user.data, this.user)) {
      this.user = state.user.data;
    }
    if (state.engagement?.data && !isJsonStrMatch(this.engagementFromRedux, state.engagement.data)) {
      this.engagementFromRedux = cloneDeep(state.engagement.data);
      this.engagement = cloneDeep(this.engagementFromRedux);
    }
    if (state.app?.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.routeDetails = state.app.routeDetails;
      this.tab = this.routeDetails.subRouteName || 'overview';
      // this.onRouteChanged(this.routeDetails, this.tab);
    }
    const optionsToUse = this.isStaffSc
      ? state.commonData?.new_staff_scOptions
      : state.commonData?.new_engagementOptions;
    if (state.commonData.loadedTimestamp && !isJsonStrMatch(this.engagementOptions, optionsToUse)) {
      this.engagementOptions = cloneDeep(optionsToUse);
    }
    if (!isJsonStrMatch(this.errorObject, state.engagement.errorObject)) {
      this.errorObject = state.engagement.errorObject || {};
    }
  }

  initializeEngagementOnFirstAccess(currentRouteDetails: RouteDetails) {
    this.isStaffSc = currentRouteDetails.routeName === 'staff-sc';
    const isFirstAcess = !this.prevRouteDetails?.path.includes('new') && currentRouteDetails?.path?.includes('new');
    this.prevRouteDetails = currentRouteDetails;
    if (isFirstAcess) {
      this.setDefaultEngagement(this.isStaffSc, this.auditFirm);
      store.dispatch(setEngagementData(this.engagement));
    }
  }

  _saveNewEngagement() {
    if (!this._validateBasicInfo(this.tab)) {
      return;
    }

    this._prepareData(false, false).then((data) => {
      this.newEngagementData = data;
    });
  }

  customDataPrepare(data) {
    if (!this.isSpecialAudit(this.engagement.engagement_type)) {
      return data;
    }

    const specificProcedures = this.getElement('#specificProcedures');
    const specificProceduresData = specificProcedures && specificProcedures.getTabData();
    if (specificProceduresData) {
      assign(data, {specific_procedures: specificProceduresData});
    }
    return data;
  }

  _engagementCreated(event) {
    if (!event || !event.detail) {
      return;
    }

    if (event.detail.success && event.detail.data) {
      // save response data before redirecting
      const engagement = event.detail.data;
      this.engagement.id = engagement.id;

      this._finishEngagementCreation();
    }
  }

  _finishEngagementCreation() {
    // redirect
    const engagementType = this.engagement.engagement_type;
    const link = !engagementType && this.isStaffSc ? 'staff-spot-checks' : this.links[String(engagementType)];
    EtoolsRouter.updateAppLocation(`${link}/${this.engagement.id}/overview`);
    // reset data
    this.engagement = {
      status: '',
      staff_members: [],
      type: {}
    };

    fireEvent(this, 'global-loading', {type: 'create-engagement'});
  }

  setDefaultEngagement(isStaffSc, auditFirm) {
    this.engagement = {
      id: null,
      status: '',
      staff_members: [],
      engagement_type: '',
      engagement_type_details: {},
      engagement_attachments: [],
      agreement: {order_number: undefined},
      date_of_field_visit: null,
      date_of_draft_report_to_ip: null,
      date_of_comments_by_ip: null,
      date_of_draft_report_to_unicef: null,
      date_of_comments_by_unicef: null,
      partner_contacted_at: null,
      specific_procedures: [],
      users_notified: [],
      offices: [],
      sections: [],
      shared_ip_with: []
    };

    (this.shadowRoot!.querySelector('#engagement_attachments') as FileAttachmentsTab).resetData();
    const engagementDetails = this.shadowRoot!.querySelector('#engagementDetails') as EngagementInfoDetails;
    engagementDetails.resetValidationErrors();
    //     engagementDetails.resetAgreement();
    // engagementDetails.resetType();
    (this.shadowRoot!.querySelector('#partnerDetails') as PartnerDetailsTab).resetValidationErrors();

    if (isStaffSc) {
      this.engagement.agreement.auditor_firm = auditFirm;
      this.engagement.engagement_type = 'sc';
      this.engagement.engagement_type_details = {value: 'sc', label: 'Spot Check'};
      this.engagement = {...this.engagement};
    }
  }
}
