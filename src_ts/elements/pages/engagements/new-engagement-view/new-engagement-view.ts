import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import assign from 'lodash-es/assign';
import EngagementMixin from '../../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {clearQueries} from '../../../mixins/query-params-controller';
import '../../../mixins/permission-controller';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
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
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {AnyObject, RouteDetails} from '@unicef-polymer/etools-types';
import {setEngagementData, updateCurrentEngagement} from '../../../../redux/actions/engagement';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {isActiveTab} from '../../../utils/utils';
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
    return [moduleStyles, layoutStyles, mainPageStyles, tabInputsStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;
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

        .tab-selector etools-tabs-lit {
          font-size: var(--etools-font-size-14, 14px);
          font-weight: bold;
          text-transform: uppercase;
          min-width: calc(100% - 4px);
          max-width: calc(100% - 4px);
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
        <etools-tabs-lit
          role="tablist"
          .tabs="${this.tabsList}"
          .activeTab="${this.tab}"
          @sl-tab-show="${(e: CustomEvent) => {
            if (this.tab !== e.detail.name) {
              this._tabChanged(e.detail.name, this.tab);
              this.tab = e.detail.name;
            }
          }}"
        ></etools-tabs-lit>
      </div>

      <div class="view-container">
        <div id="pageContent">
          <div name="overview" ?hidden="${!isActiveTab(this.tab, 'overview')}">
            <partner-details-tab
              id="partnerDetails"
              .errorObject="${this.errorObject}"
              .engagement="${this.engagement}"
              .optionsData="${this.engagementOptions}"
            >
            </partner-details-tab>

            <engagement-info-details
              .errorObject="${this.errorObject}"
              .data="${this.engagement}"
              id="engagementDetails"
              .optionsData="${this.engagementOptions}"
              ?isStaffSc="${this.isStaffSc}"
            >
            </engagement-info-details>

            <specific-procedure
              id="specificProcedures"
              ?hidden="${!this.isSpecialAudit(this.engagement?.engagement_type)}"
              class="mb-15"
              without-finding-column
              .errorObject="${this.errorObject}"
              save-with-button
              .dataItems="${this.engagement.specific_procedures}"
              .optionsData="${this.engagementOptions}"
            >
            </specific-procedure>

            <engagement-staff-members-tab
              id="staffMembers"
              .engagement="${this.engagement}"
              .optionsData="${this.engagementOptions}"
              .errorObject="${this.errorObject}"
              save-with-button
            >
            </engagement-staff-members-tab>
          </div>

          <div name="attachments" ?hidden="${!isActiveTab(this.tab, 'attachments')}">
            <file-attachments-tab
              id="engagement_attachments"
              .engagement="${this.engagement}"
              .optionsData="${this.attachmentOptions}"
              error-property="engagement_attachments"
            >
            </file-attachments-tab>
          </div>
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
    engagement_type: null,
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
  tabsList: AnyObject[] = [
    {tab: 'overview', tabLabel: 'Engagement Details'},
    {tab: 'attachments', tabLabel: 'Attachments'}
  ];

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

  stateChanged(state: RootState) {
    if (!get(state, 'app.routeDetails.path') || !state.app.routeDetails.path.includes('new')) {
      this.prevRouteDetails = state.app.routeDetails;
      return;
    }

    if (this.initializeOnFirstAccess(state.app.routeDetails)) {
      return;
    }
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
    if (
      state.commonData.loadedTimestamp &&
      !isJsonStrMatch(this.attachmentOptions, state.commonData?.new_attachOptions)
    ) {
      this.attachmentOptions = cloneDeep(state.commonData?.new_attachOptions);
    }
    if (!isJsonStrMatch(this.errorObject, state.engagement.errorObject)) {
      this.errorObject = state.engagement.errorObject || {};
    }
  }

  initializeOnFirstAccess(currentRouteDetails: RouteDetails) {
    this.isStaffSc = currentRouteDetails.routeName === 'staff-sc';
    const isFirstAcess = !this.prevRouteDetails?.path.includes('new') && currentRouteDetails?.path?.includes('new');
    this.prevRouteDetails = currentRouteDetails;
    if (isFirstAcess) {
      clearQueries();
      setTimeout(() => {
        this.setDefaultEngagement(this.isStaffSc, this.auditFirm);
      });

      return true;
    }
    return false;
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
    const engagement: GenericObject<any> = {
      id: null,
      status: '',
      staff_members: [],
      engagement_type: null,
      engagement_type_details: {},
      engagement_attachments: [],
      agreement: {order_number: ''},
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
      shared_ip_with: [],
      partner: {}
    };

    if (isStaffSc) {
      engagement.agreement.auditor_firm = auditFirm;
      engagement.engagement_type = 'sc';
      engagement.engagement_type_details = {value: 'sc', label: 'Spot Check'};
    }

    this.engagement = cloneDeep(engagement);
    const engData = {data: engagement, options: {}, attachmentOptions: {}, reportAttachmentOptions: {}, apOptions: {}};

    store.dispatch(setEngagementData(engData));

    const engagementAttachments = this.shadowRoot!.querySelector('#engagement_attachments') as FileAttachmentsTab;
    if (engagementAttachments) {
      engagementAttachments.resetData();
    }
    const engagementDetails = this.shadowRoot!.querySelector('#engagementDetails') as EngagementInfoDetails;
    if (engagementDetails) {
      engagementDetails.resetValidationErrors();
      // engagementDetails.resetAgreement();
    }
    const partnerDetails = this.shadowRoot!.querySelector('#partnerDetails') as PartnerDetailsTab;
    if (partnerDetails) {
      partnerDetails.resetValidationErrors();
    }

    this.stopLoading(isStaffSc);
  }

  stopLoading(isStaffSc: boolean) {
    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: isStaffSc ? 'staff-sc' : 'engagements'
      });
    }, 200);
  }
}
