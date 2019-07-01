import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-route/app-route';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '../../../../elements/core-elements/app-main-header/page-header';
import '../../../../elements/common-elements/status-tab-element/status-tab-element';
import '../../../../elements/common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../../../elements/common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../../../elements/common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import '../../../../elements/common-elements/follow-up-components/follow-up-main/follow-up-main';
import '../../../../elements/common-elements/engagement-report-components/specific-procedure/specific-procedure';
import '../../../../elements/data-elements/update-engagement';
import '../../../../elements/data-elements/engagement-info-data';
// import sa-report-page-main.js   //TODO:polymer3 not migrated
// import file-attachments-tab.js  //TODO:polymer3 not migrated
import '../../../common-elements/pages-header-element/pages-header-element';

import EngagementMixin from '../../../app-mixins/engagement-mixin';

import { sharedStyles } from "../../../styles-elements/shared-styles";
import { moduleStyles } from "../../../styles-elements/module-styles";
import { mainPageStyles } from "../../../styles-elements/main-page-styles";
import { tabInputsStyles } from '../../../styles-elements/tab-inputs-styles';

import assign from 'lodash-es/assign';
import isNull from 'lodash-es/isNull';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EngagementMixin
 */
class SpecialAuditsPageMain extends (EngagementMixin(PolymerElement)) {

  static get template() {
    // language=HTML
    return html`
        ${sharedStyles} ${moduleStyles} ${mainPageStyles} ${tabInputsStyles}
      <style>

        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
        
      </style>

      <app-route
              route="{{route}}"
              pattern="/:id/:tab"
              data="{{routeData}}">
      </app-route>

      <engagement-info-data
              engagement-id="{{engagementId}}"
              engagement-type="special-audits"
              engagement-info="{{engagement}}">
      </engagement-info-data>

      <update-engagement
              updated-engagement-data="{{updatedEngagement}}"
              quiet-adding="{{quietAdding}}"
              force-options-update="{{forceOptionsUpdate}}"
              engagement="{{engagement}}"
              error-object="{{errorObject}}"
              base-permission-path="{{permissionBase}}">
      </update-engagement>

      <template is="dom-if" if="{{engagement.id}}" restamp>
        <pages-header-element
                show-export-button
                hide-print-button
                export-links="[[_setExportLinks(engagement)]]"
                engagement="[[engagement]]"
                page-title="[[engagement.partner.name]] - Audit">
        </pages-header-element>

        <div class="tab-selector">
          <paper-tabs
                  attr-for-selected="name"
                  noink bottom-item
                  role="tablist"
                  tabindex="0"
                  selected="{{tab}}"
                  id="pageTabs">
            <paper-tab name="overview">
              <span class="tab-content">Engagement Overview</span>
            </paper-tab>

            <template is="dom-if" if="{{_showReportTabs(permissionBase, engagement)}}" restamp>
              <paper-tab name="report">
                <span class="tab-content">Report</span>
              </paper-tab>
            </template>

            <template is="dom-if" if="{{_showFollowUpTabs(permissionBase)}}" restamp>
              <paper-tab name="follow-up">
                <span class="tab-content">Follow-Up</span>
              </paper-tab>
            </template>

            <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
          </paper-tabs>
        </div>

        <div class="view-container">
          <div id="pageContent">
            <iron-pages
                    id="info-tabs"
                    selected="{{tab}}"
                    attr-for-selected="name">
              <div name="overview">
                <template is="dom-if" if="{{_showCancellationReason(engagement)}}">
                  <etools-content-panel class="cancellation-tab" panel-title="">
                    <div slot="panel-btns" class="bookmark">
                      <iron-icon icon="bookmark"></iron-icon>
                    </div>

                    <div class="cancellation-title">Cancellation Note</div>
                    <div class="cancellation-text">[[engagement.cancel_comment]]</div>
                  </etools-content-panel>
                </template>

                <engagement-info-details
                        id="engagementDetails"
                        data="{{engagement}}"
                        original-data="[[originalData]]"
                        error-object="{{errorObject}}"
                        base-permission-path="{{permissionBase}}">
                </engagement-info-details>

                <partner-details-tab
                        id="partnerDetails"
                        original-data="[[originalData]]"
                        engagement="{{engagement}}"
                        error-object="{{errorObject}}"
                        base-permission-path="{{permissionBase}}">
                </partner-details-tab>

                <specific-procedure
                        id="specificProcedures"
                        class="mb-15"
                        without-finding-column
                        error-object="{{errorObject}}"
                        data-items="{{engagement.specific_procedures}}"
                        base-permission-path="{{permissionBase}}"
                        readonly-tab>
                </specific-procedure>

                <engagement-staff-members-tab
                        id="staffMembers"
                        engagement="{{engagement}}"
                        error-object="{{errorObject}}"
                        base-permission-path="{{permissionBase}}">
                </engagement-staff-members-tab>
              </div>

              <template is="dom-if" if="{{_showReportTabs(permissionBase, engagement)}}" restamp>
                <div name="report">
                  <sa-report-page-main
                          id="report"
                          original-data="[[originalData]]"
                          error-object="{{errorObject}}"
                          engagement="{{engagement}}"
                          permission-base="{{permissionBase}}">
                  </sa-report-page-main>
                </div>
              </template>

              <template is="dom-if" if="{{_showFollowUpTabs(permissionBase)}}" restamp>
                <div name="follow-up">
                  <follow-up-main
                          id="follow-up"
                          original-data="[[originalData]]"
                          error-object="{{errorObject}}"
                          engagement="{{engagement}}"
                          permission-base="{{permissionBase}}">
                  </follow-up-main>
                </div>
              </template>

              <div name="attachments">
                <file-attachments-tab
                        id="engagement_attachments"
                        data-base-path="[[permissionBase]]"
                        path-postfix="attachments"
                        base-id="[[engagement.id]]"
                        error-object="{{errorObject}}"
                        error-property="engagement_attachments"
                        endpoint-name="attachments">
                </file-attachments-tab>

                <template is="dom-if" if="{{hasReportAccess(permissionBase, engagement)}}" restamp>
                  <file-attachments-tab
                          id="report_attachments"
                          is-report-tab="true"
                          data-base-path="[[permissionBase]]"
                          path-postfix="report_attachments"
                          base-id="[[engagement.id]]"
                          error-object="{{errorObject}}"
                          error-property="report_attachments"
                          endpoint-name="reportAttachments">
                  </file-attachments-tab>
                </template>
              </div>
            </iron-pages>
          </div>

          <div id="sidebar">
            <status-tab-element
                    engagement-data="[[engagement]]"
                    permission-base="[[permissionBase]]">
            </status-tab-element>
          </div>
        </div>

        <etools-dialog no-padding keep-dialog-open size="md"
                       opened="{{dialogOpened}}"
                       dialog-title="Cancellation of Engagement"
                       ok-btn-text="Continue"
                       on-confirm-btn-clicked="_cancelEngagement">
          <div class="row-h repeatable-item-container" without-line>
            <div class="repeatable-item-content">
              <div class="row-h group">
                <div class="input-container input-container-l">
                  <paper-textarea
                          id="cancellationReasonInput"
                          class="required"
                          label="Cancellation Reason"
                          placeholder="Enter reason of cancellation"
                          required
                          max-rows="4"
                          error-message="This field is required."
                          on-focus="_resetFieldError"
                          on-tap="_resetFieldError">
                  </paper-textarea>
                </div>
              </div>
            </div>
          </div>
        </etools-dialog>
      </template>
    
    
    `;
  }

  @property({type: Object})
  engagement!: {};

  @property({type: Array})
  tabsList: string[] = ['overview', 'report', 'attachments', 'follow-up'];

  @property({type: String})
  engagementPrefix: string = '/special-audits';


  static get observers() {
    return [
      '_routeConfig(route)',
      '_checkAvailableTab(engagement, permissionBase, route)',
      '_setPermissionBase(engagement.id)',
      '_tabChanged(tab)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('engagement-info-loaded', this._infoLoaded);
    this.addEventListener('engagement-updated', this._engagementUpdated);
    this.addEventListener('main-action-activated', this._mainActionActivated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('engagement-info-loaded', this._infoLoaded);
    this.removeEventListener('engagement-updated', this._engagementUpdated);
    this.removeEventListener('main-action-activated', this._mainActionActivated);
  }

  _validateEngagement() {
    let basicInfoValid = this._validateBasicInfo(),
        reportValid = this.getElement('#report').validate();

    if (!basicInfoValid) { return false; }
    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    return true;
  }

  customDataPrepare(data) {
    data = data || {};

    //FollowUp data
    let followUpPage = this.getElement('#follow-up'),
        followUpData = followUpPage && followUpPage.getFollowUpData() || {};
    assign(data, followUpData);

    //Report Data
    let reportPage = this.getElement('#report');
    if (!reportPage) { return data; }

    let specificProceduresData = reportPage.getSpecificProceduresData();
    let otherRecommendationsData = reportPage.getOtherRecommendationsData();

    if (!isNull(specificProceduresData)) {
      data.specific_procedures = specificProceduresData;
    }

    if (!isNull(otherRecommendationsData)) {
      data.other_recommendations = otherRecommendationsData;
    }

    return data;
  }

  customBasicValidation() {
    let reportTab = this.getElement('#report');
    if (!reportTab) { return true; }

    let reportValid = reportTab.validate('forSave');
    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    return true;
  }

}

window.customElements.define('special-audit-page-main', SpecialAuditsPageMain);
