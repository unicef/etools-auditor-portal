import {LitElement, html, PropertyValues, property, customElement} from 'lit-element';
import '@polymer/app-route/app-route';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import assign from 'lodash-es/assign';
import includes from 'lodash-es/includes';
import isUndefined from 'lodash-es/isUndefined';
import LastCreatedMixin from '../../../mixins/last-created-mixin';
import EngagementMixin from '../../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {clearQueries} from '../../../mixins/query-params-controller';
import '../../../mixins/permission-controller';
import {moduleStyles} from '../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {mainPageStyles} from '../../../styles/main-page-styles-lit';
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
import {BASE_PATH} from '../../../config/config';
import {navigateToUrl} from '../../../utils/navigate-helper';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
/**
 * @customElement
 * @LitElement
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin LastCreatedMixin
 */

@customElement('new-engagement-view')
export class NewEngagementView extends EngagementMixin(LastCreatedMixin(CommonMethodsMixin(LitElement))) {
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

      <app-route
        .route="${this.route}"
        @route-chaged=${this._routeChanged}
        pattern="/:tab"
        @data-changed="${this._routeDataChanged}"
      >
      </app-route>

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
          .selected="${this.routeData?.tab}"
          @selected-changed="${({detail}: CustomEvent) => {
            if (this.route?.path !== `/${detail.value}`) {
              const newRoute: GenericObject = {...this.route, path: `/${detail.value}`};
              fireEvent(this, 'sub-route-changed', {value: newRoute});
              this._updatePath(`${newRoute.prefix}${newRoute.path}`);
            }
          }}"
        >
          <paper-tab name="overview"><span class="tab-content">Engagement Overview</span></paper-tab>
          <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
        </paper-tabs>
      </div>

      <div class="view-container">
        <div id="pageContent">
          <iron-pages id="info-tabs" .selected="${this.routeData?.tab}" attr-for-selected="name">
            <div name="overview">
              <engagement-info-details
                .errorObject="${this.errorObject}"
                .data="${this.engagement}"
                @engagement-changed="${(e: CustomEvent) => {
                  this.engagement = {...e.detail};
                }}"
                id="engagementDetails"
                .basePermissionPath="${this.basePermissionPath}"
                ?isStaffSc="${this.isStaffSc}"
              >
              </engagement-info-details>

              <partner-details-tab
                id="partnerDetails"
                .errorObject="${this.errorObject}"
                .engagement="${this.engagement}"
                @engagement-changed="${(e: CustomEvent) => {
                  this.engagement = {...e.detail};
                }}"
                .basePermissionPath="${this.basePermissionPath}"
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
                    .basePermissionPath="${this.basePermissionPath}"
                  >
                  </specific-procedure>`
                : ``}

              <engagement-staff-members-tab
                id="staffMembers"
                .errorObject="${this.errorObject}"
                save-with-button
                .engagement="${this.engagement}"
                .basePermissionPath="${this.basePermissionPath}"
              >
              </engagement-staff-members-tab>
            </div>

            <div name="attachments">
              <file-attachments-tab
                id="engagement_attachments"
                .baseId="${this.engagement.id}"
                .dataBasePath="${this.basePermissionPath}"
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
            permission-base="new_engagement"
          ></status-tab-element>
        </div>
      </div>
    `;
  }

  @property({type: String})
  endpointName!: string;

  @property({type: String})
  page!: string;

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  newEngagementData!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  requestQueries!: GenericObject;

  @property({type: Object})
  engagement: GenericObject = {
    id: null,
    status: '',
    staff_members: [],
    engagement_type: '',
    engagement_type_details: {},
    engagement_attachments: [],
    agreement: {},
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

  @property({type: String})
  pageTitle = '';

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Object})
  auditFirm: GenericObject = {};

  @property({type: String})
  basePermissionPath!: string;

  links: {[key: string]: string} = {
    ma: 'micro-assessments',
    audit: 'audits',
    sc: 'spot-checks',
    sa: 'special-audits'
  };

  connectedCallback() {
    super.connectedCallback();
    this._routeConfig();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('page') || changedProperties.has('isStaffSc') || changedProperties.has('auditFirm')) {
      this._pageChanged(this.page, this.isStaffSc, this.auditFirm);
    }
  }

  _routeChanged({detail}: CustomEvent) {
    if (!detail.value.path || !detail.value.prefix) {
      return;
    }
    this.route = detail.value;
  }

  _routeDataChanged({detail}: CustomEvent) {
    this.routeData = detail.value;
  }

  _routeConfig() {
    if (!this.route || !~this.route.prefix.indexOf('new')) {
      return;
    }

    const currentTab = this.routeData && this.routeData.tab;
    if (currentTab === '' || isUndefined(currentTab)) {
      this.route = {...this.route, path: '/overview'};
    } else if (!includes(this.tabsList, currentTab)) {
      fireEvent(this, '404');
    }
    clearQueries();
  }

  _saveNewEngagement() {
    if (!this._validateBasicInfo('routeData.tab')) {
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
      this._setLastEngagementData(engagement);
      this.engagement.id = engagement.id;

      this._finishEngagementCreation();
    }
  }

  _finishEngagementCreation() {
    this.reloadEngagementsList();

    // redirect
    const engagementType = get(this, 'engagement.engagement_type');
    const link = !engagementType && this.isStaffSc ? 'staff-spot-checks' : this.links[String(engagementType)];
    const path = `${BASE_PATH}${link}/${this.engagement.id}/overview`;
    navigateToUrl(path);

    // reset data
    this.engagement = {
      status: '',
      staff_members: [],
      type: {}
    };

    fireEvent(this, 'global-loading', {type: 'create-engagement'});
  }

  reloadEngagementsList() {
    this.requestQueries = {...this.requestQueries, reload: true};
  }

  _pageChanged(page, isStaffSc, auditFirm) {
    if (page === 'new' || page === 'list') {
      this.engagement = {
        id: null,
        status: '',
        staff_members: [],
        engagement_type: '',
        engagement_type_details: {},
        engagement_attachments: [],
        agreement: {},
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
      engagementDetails.resetAgreement();
      engagementDetails.resetType();
      (this.shadowRoot!.querySelector('#partnerDetails') as PartnerDetailsTab).resetValidationErrors();
    }

    if (page === 'new' && isStaffSc) {
      this.engagement.agreement.auditor_firm = auditFirm;
      this.engagement.engagement_type = 'sc';
      this.engagement.engagement_type_details = {value: 'sc', label: 'Spot Check'};
      this.engagement = {...this.engagement};
    }
  }
}
