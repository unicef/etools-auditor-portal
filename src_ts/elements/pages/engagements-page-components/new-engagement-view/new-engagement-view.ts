import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/app-route/app-location';
import '@polymer/app-route/app-route';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import {property} from "@polymer/decorators/lib/decorators";
import {GenericObject} from "../../../../types/global";
import {fireEvent} from "../../../utils/fire-custom-event";
import get from 'lodash-es/get';
import assign from 'lodash-es/assign';
import includes from 'lodash-es/includes';
import isUndefined from 'lodash-es/isUndefined';
import LastCreatedMixin from '../../../app-mixins/last-created-mixin';
import EngagementMixin from '../../../app-mixins/engagement-mixin';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {clearQueries} from '../../../app-mixins/query-params-controller';
import '../../../app-mixins/permission-controller';
import {sharedStyles} from "../../../styles-elements/shared-styles";
import {moduleStyles} from "../../../styles-elements/module-styles";
import {mainPageStyles} from "../../../styles-elements/main-page-styles";
import '../../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../../common-elements/status-tab-element/status-tab-element';
import '../../../common-elements/pages-header-element/pages-header-element';
import '../../../data-elements/add-new-engagement';
import '../../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import '../../../common-elements/engagement-report-components/specific-procedure/specific-procedure';
import '../../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import {BASE_PATH} from '../../../app-config/config';

/**
 * TODO: polymer 3 migration
 *    - migrate and use:
 *     - add behaviors: etoolsAppConfig.globals aka EndpointsMixin and EtoolsAjaxRequestMixin ???????????????????
 *
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin LastCreatedMixin
 */
class NewEngagementView extends
  EngagementMixin(LastCreatedMixin(CommonMethodsMixin(PolymerElement))) {

  static get template() {
    // language=HTML
    return html`
      ${sharedStyles} ${moduleStyles} ${mainPageStyles}
      <style>
        :host {
          position: relative;
          display: block;

          --paper-tab-content-unselected: {
            color: var(--gray-light)
          };

          --ecp-header-bg: var(--module-primary);
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
          color: var(--module-primary);
          font-size: 14px;
          font-weight: bold;
          text-transform: uppercase;
        }

        .tab-selector .tab-content {
          padding: 0 13px;
        }
      </style>

      <app-location path="{{path}}"></app-location>
      <app-route
          route="{{route}}"
          pattern="/:tab"
          data="{{routeData}}">
      </app-route>

      <add-new-engagement
          endpoint-name="[[endpointName]]"
          new-engagement-data="{{newEngagementData}}"
          error-object="{{errorObject}}">
      </add-new-engagement>

      <pages-header-element
          hide-print-button
          page-title="[[pageTitle]]"
          engagement="[[engagement]]">
      </pages-header-element>

      <div class="tab-selector">
        <paper-tabs attr-for-selected="name" noink="" bottom-item="" role="tablist" tabindex="0"
                    selected="{{routeData.tab}}">
          <paper-tab name="overview"><span class="tab-content">Engagement Overview</span></paper-tab>
          <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
        </paper-tabs>
      </div>

      <div class="view-container">
        <div id="pageContent">
          <iron-pages
              id="info-tabs"
              selected="{{routeData.tab}}"
              attr-for-selected="name">
            <div name="overview">
              <engagement-info-details
                  error-object="{{errorObject}}"
                  data="{{engagement}}"
                  id="engagementDetails"
                  base-permission-path="[[basePermissionPath]]"
                  is-staff-sc="[[isStaffSc]]">
              </engagement-info-details>

              <partner-details-tab
                  id="partnerDetails"
                  error-object="{{errorObject}}"
                  engagement="{{engagement}}"
                  base-permission-path="[[basePermissionPath]]">
              </partner-details-tab>

              <template is="dom-if" if="[[isSpecialAudit(engagement.engagement_type)]]" restamp>
                <specific-procedure
                    id="specificProcedures"
                    class="mb-15"
                    without-finding-column
                    error-object="{{errorObject}}"
                    save-with-button
                    data-items="{{engagement.specific_procedures}}"
                    base-permission-path="[[basePermissionPath]]">
                </specific-procedure>
              </template>

              <engagement-staff-members-tab
                  id="staffMembers"
                  error-object="{{errorObject}}"
                  save-with-button
                  engagement="[[engagement]]"
                  base-permission-path="[[basePermissionPath]]">
              </engagement-staff-members-tab>
            </div>

            <div name="attachments">
              <file-attachments-tab
                  id="engagement_attachments"
                  base-id="[[engagement.id]]"
                  data-base-path="[[basePermissionPath]]"
                  error-property="engagement_attachments"
                  path-postfix="attachments">
              </file-attachments-tab>
            </div>
          </iron-pages>
        </div>

        <div id="sidebar">
          <status-tab-element engagement-data="[[engagement]]" permission-base="new_engagement"></status-tab-element>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  engagement: GenericObject = {
    id: null,
    status: '',
    staff_members: [],
    engagement_type: {},
    engagement_attachments: [],
    agreement: {},
    date_of_field_visit: null,
    date_of_draft_report_to_ip: null,
    date_of_comments_by_ip: null,
    date_of_draft_report_to_unicef: null,
    date_of_comments_by_unicef: null,
    partner_contacted_at: null,
    specific_procedures: []
  };

  @property({type: Array})
  tabsList: string[] = ['overview', 'attachments'];

  @property({type: Object, notify: true})
  queryParams: GenericObject = {};

  @property({type: String})
  pageTitle: string = '';

  @property({type: Boolean})
  isStaffSc: boolean = false;

  @property({type: Object})
  auditFirm: GenericObject = {};

  @property({type: String})
  basePermissionPath!: string;


  static get observers() {
    return [
      '_pageChanged(page, isStaffSc, auditFirm)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this._engagementCreated = this._engagementCreated.bind(this);
    this.addEventListener('engagement-created', this._engagementCreated);
    this._routeConfig();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('engagement-created', this._engagementCreated);
  }

  _routeConfig() {
    if (!this.route || !~this.route.prefix.indexOf('new')) {
      return;
    }

    let currentTab = this.routeData && this.routeData.tab;
    if (currentTab === '' || isUndefined(currentTab)) {
      this.set('route.path', '/overview');
    } else if (!includes(this.tabsList, currentTab)) {
      fireEvent(this, '404');
    }
    clearQueries();
  }

  _saveNewEngagement() {
    if (!this._validateBasicInfo('routeData.tab')) {
      return;
    }

    this._prepareData()
      .then((data) => {
        this.newEngagementData = data;
      });
  }

  customDataPrepare(data) {
    if (!this.isSpecialAudit(this.engagement.engagement_type)) {
      return data;
    }

    let specificProcedures = this.getElement('#specificProcedures');
    let specificProceduresData = specificProcedures && specificProcedures.getTabData();
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
      //save response data before redirecting
      let engagement = event.detail.data;
      this._setLastEngagementData(engagement);
      this.engagement.id = engagement.id;

      this._finishEngagementCreation();
    }
  }

  _finishEngagementCreation() {
    this.reloadEngagementsList();

    //redirect
    let link = get(this, 'engagement.engagement_type.link');
    if (!link && this.isStaffSc) {
      link = 'staff-spot-checks';
    }

    let path = `/${BASE_PATH}/${link}/${this.engagement.id}/overview`;
    this.set('path', path);

    //reset data
    this.engagement = {
      status: '',
      staff_members: [],
      type: {}
    };

    fireEvent(this, 'global-loading', {type: 'create-engagement'});
  }

  reloadEngagementsList() {
    this.set('requestQueries.reload', true);
  }

  _pageChanged(page, isStaffSc, auditFirm) {
    if (page === 'new' || page === 'list') {
      this.set('engagement', {
        id: null,
        status: '',
        staff_members: [],
        engagement_type: {},
        engagement_attachments: [],
        agreement: {},
        date_of_field_visit: null,
        date_of_draft_report_to_ip: null,
        date_of_comments_by_ip: null,
        date_of_draft_report_to_unicef: null,
        date_of_comments_by_unicef: null,
        partner_contacted_at: null,
        specific_procedures: []
      });

      // TODO
      // this.$.engagement_attachments.resetData();
      // this.$.engagementDetails.resetValidationErrors();
      // this.$.engagementDetails.resetAgreement();
      // this.$.partnerDetails.resetValidationErrors();
      // this.$.engagementDetails.resetType();
    }

    if (page === 'new' && isStaffSc) {
      this.set('engagement.agreement.auditor_firm', auditFirm);
      this.set('engagement.engagement_type', {value: 'sc', label: 'Spot Check'});
    }
  }

}

window.customElements.define('new-engagement-view', NewEngagementView);
