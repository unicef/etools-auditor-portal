import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import {sharedStyles} from '../../styles/shared-styles';
import {moduleStyles} from '../../styles/module-styles';
import {mainPageStyles} from '../../styles/main-page-styles';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../data-elements/engagement-info-data';
import '../../data-elements/update-engagement';
import '../../common-elements/pages-header-element/pages-header-element';
import '../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
// eslint-disable-next-line
import '../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../common-elements/follow-up-components/follow-up-main/follow-up-main';
import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '../../utils/fire-custom-event';
import assign from 'lodash-es/assign';
import './questionnaire-components/questionnaire-page-main/questionnaire-page-main';
import '../../common-elements/status-tab-element/status-tab-element';
import '@polymer/paper-input/paper-textarea';
import './report-page-components/ma-report-page-main';
import '../../common-elements/file-attachments-tab/file-attachments-tab';

class MicroAssessmentsPageMain extends EngagementMixin(CommonMethodsMixin(PolymerElement)) {
  static get template() {
    return html`
      <style>
        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
      </style>
      ${sharedStyles}${moduleStyles}${mainPageStyles}${tabInputsStyles}
      <app-route route="{{route}}" pattern="/:id/:tab" data="{{routeData}}"> </app-route>

      <engagement-info-data
        engagement-id="{{engagementId}}"
        engagement-type="micro-assessments"
        engagement-info="{{engagement}}"
      >
      </engagement-info-data>

      <update-engagement
        updated-engagement-data="{{updatedEngagement}}"
        quiet-adding="{{quietAdding}}"
        force-options-update="{{forceOptionsUpdate}}"
        engagement="{{engagement}}"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}"
      >
      </update-engagement>

      <template is="dom-if" if="[[engagement.id]]" restamp>
        <pages-header-element
          show-export-button
          hide-print-button
          export-links="[[_setExportLinks(engagement)]]"
          engagement="[[engagement]]"
          page-title="[[engagement.partner.name]] - Micro Assessment"
        >
        </pages-header-element>

        <div class="tab-selector">
          <paper-tabs
            attr-for-selected="name"
            noink
            bottom-item
            role="tablist"
            tabindex="0"
            selected="{{tab}}"
            id="pageTabs"
          >
            <paper-tab name="overview">
              <span class="tab-content">Engagement Overview</span>
            </paper-tab>

            <template is="dom-if" if="[[_showReportTabs(permissionBase, engagement)]]" restamp>
              <paper-tab name="report"><span class="tab-content">Report</span></paper-tab>
            </template>

            <template is="dom-if" if="[[_showQuestionnaire(permissionBase, engagement)]]" restamp>
              <paper-tab name="questionnaire"><span class="tab-content">Questionnaire</span></paper-tab>
            </template>

            <template is="dom-if" if="[[_showFollowUpTabs(permissionBase)]]" restamp>
              <paper-tab name="follow-up">
                <span class="tab-content">Follow-Up</span>
              </paper-tab>
            </template>

            <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
          </paper-tabs>
        </div>

        <div class="view-container">
          <div id="pageContent">
            <iron-pages id="info-tabs" selected="{{tab}}" attr-for-selected="name">
              <div name="overview">
                <template is="dom-if" if="[[_showCancellationReason(engagement)]]">
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
                  base-permission-path="{{permissionBase}}"
                >
                </engagement-info-details>

                <partner-details-tab
                  original-data="[[originalData]]"
                  id="partnerDetails"
                  engagement="{{engagement}}"
                  error-object="{{errorObject}}"
                  base-permission-path="{{permissionBase}}"
                >
                </partner-details-tab>

                <engagement-staff-members-tab
                  id="staffMembers"
                  engagement="{{engagement}}"
                  base-permission-path="{{permissionBase}}"
                  error-object="{{errorObject}}"
                >
                </engagement-staff-members-tab>
              </div>

              <template is="dom-if" if="[[_showReportTabs(permissionBase, engagement)]]" restamp>
                <div name="report">
                  <ma-report-page-main
                    id="report"
                    original-data="[[originalData]]"
                    engagement="{{engagement}}"
                    error-object="{{errorObject}}"
                    permission-base="{{permissionBase}}"
                  >
                  </ma-report-page-main>
                </div>
              </template>

              <template is="dom-if" if="[[_showQuestionnaire(permissionBase, engagement)]]" restamp>
                <div name="questionnaire">
                  <questionnaire-page-main
                    id="questionnaire"
                    data="[[engagement.questionnaire]]"
                    risk-assessment="[[engagement.overall_risk_assessment.blueprints.0.risk.value_display]]"
                    error-object="{{errorObject}}"
                    base-permission-path="{{permissionBase}}"
                  >
                  </questionnaire-page-main>
                </div>
              </template>

              <template is="dom-if" if="[[_showFollowUpTabs(permissionBase)]]" restamp>
                <div name="follow-up">
                  <follow-up-main
                    id="follow-up"
                    original-data="[[originalData]]"
                    error-object="{{errorObject}}"
                    engagement="{{engagement}}"
                    permission-base="{{permissionBase}}"
                  >
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
                  endpoint-name="attachments"
                >
                </file-attachments-tab>

                <template is="dom-if" if="[[hasReportAccess(permissionBase, engagement)]]" restamp>
                  <file-attachments-tab
                    id="report_attachments"
                    is-report-tab="true"
                    data-base-path="[[permissionBase]]"
                    path-postfix="report_attachments"
                    base-id="[[engagement.id]]"
                    error-object="{{errorObject}}"
                    error-property="report_attachments"
                    endpoint-name="reportAttachments"
                  >
                  </file-attachments-tab>
                </template>
              </div>
            </iron-pages>
          </div>

          <div id="sidebar">
            <status-tab-element engagement-data="[[engagement]]" permission-base="[[permissionBase]]">
            </status-tab-element>
          </div>
        </div>

        <etools-dialog
          no-padding
          keep-dialog-open
          size="md"
          opened="{{dialogOpened}}"
          dialog-title="Cancellation of Engagement"
          ok-btn-text="Continue"
          on-confirm-btn-clicked="_cancelEngagement"
          openFlag="dialogOpened"
          on-close="_resetDialogOpenedFlag"
        >
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
                  >
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
  engagement: GenericObject = {};

  @property({type: Array})
  otherActions = [];

  @property({type: Array})
  tabsList = ['overview', 'report', 'questionnaire', 'attachments', 'follow-up'];

  @property({type: String})
  engagementPrefix = '/micro-assessments';

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
    // this.addEventListener('main-action-activated', this._mainActionActivated);
  }

  _validateEngagement() {
    const basicInfoValid = this._validateBasicInfo();
    const questionnaireValid = this.getElement('#questionnaire').validateComplited();
    const reportValid = this.getElement('#report').validate();

    if (!basicInfoValid) {
      return false;
    }
    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    if (!questionnaireValid) {
      this.set('tab', 'questionnaire');
      fireEvent(this, 'toast', {text: 'Fill questionnaire before submiting!'});
      return false;
    }
    return true;
  }

  customDataPrepare(data) {
    data = data || {};
    const questionnaireTab = this.getElement('#questionnaire');
    const questionnaire = questionnaireTab && questionnaireTab.getQuestionnaireData();
    if (questionnaire) {
      data.questionnaire = questionnaire;
    } else {
      delete data.questionnaire;
    }
    const hasReport = this.hasReportAccess(this.permissionBase, this.engagement);
    const reportTab = hasReport ? this.getElement('#report') : null;

    const subjectAreas = reportTab && reportTab.getInternalControlsData();
    if (subjectAreas) {
      data.test_subject_areas = subjectAreas;
    }

    const overallRisk = reportTab && reportTab.getPrimaryRiskData();
    if (overallRisk) {
      data.overall_risk_assessment = overallRisk;
    }

    const findingsData = reportTab && reportTab.getFindingsData();
    if (findingsData && findingsData.length) {
      data.findings = findingsData;
    }

    // FollowUp data
    const followUpPage = this.getElement('#follow-up');
    const followUpData = (followUpPage && followUpPage.getFollowUpData()) || {};
    assign(data, followUpData);

    return data;
  }

  customBasicValidation() {
    const hasReport = this.hasReportAccess(this.permissionBase, this.engagement);
    if (!hasReport) {
      return true;
    }
    const reportTab = this.getElement('#report');

    const reportValid = reportTab.validate('forSave');

    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    return true;
  }
}
window.customElements.define('micro-assessments-page-main', MicroAssessmentsPageMain);
