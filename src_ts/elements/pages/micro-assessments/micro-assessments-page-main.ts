import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/app-route/app-route';
import '@polymer/iron-pages/iron-pages';
import '@polymer/paper-tabs/paper-tab';
import '@polymer/paper-tabs/paper-tabs';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {tabInputsStyles} from '../../styles/tab-inputs-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {mainPageStyles} from '../../styles/main-page-styles-lit';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../data-elements/engagement-info-data';
import '../../data-elements/update-engagement';
import '../../common-elements/pages-header-element/pages-header-element';
import '../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
// eslint-disable-next-line
import '../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../common-elements/follow-up-components/follow-up-main/follow-up-main';
import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import assign from 'lodash-es/assign';
import './questionnaire-components/questionnaire-page-main/questionnaire-page-main';
import '../../common-elements/status-tab-element/status-tab-element';
import '@polymer/paper-input/paper-textarea';
import './report-page-components/ma-report-page-main';
import '../../common-elements/file-attachments-tab/file-attachments-tab';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('micro-assessments-page-main')
export class MicroAssessmentsPageMain extends EngagementMixin(CommonMethodsMixin(LitElement)) {
  static get styles() {
    return [moduleStyles, mainPageStyles, tabInputsStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
      </style>
      <app-route
        .route="${this.route}"
        @route-changed="${({detail}: CustomEvent) => {
          this.route = detail.value;
        }}"
        pattern="/:id/:tab"
        @data-changed="${({detail}: CustomEvent) => (this.routeData = detail.value)}"
      >
      </app-route>

      <engagement-info-data
        engagementType="micro-assessments"
        .engagementId="${this.engagementId}"
        .engagementInfo="${this.engagement}"
        @engagement-info-loaded="${(e: CustomEvent) => {
          this.engagement = e.detail;
        }}"
      >
      </engagement-info-data>

      <update-engagement
        .updatedEngagementData="${this.updatedEngagement}"
        .quietAdding="${this.quietAdding}"
        @quiet-adding-changed="${(e: CustomEvent) => (this.quietAdding = e.detail)}"
        .forceOptionsUpdate="${this.forceOptionsUpdate}"
        @force-options-changed="${(e: CustomEvent) => (this.forceOptionsUpdate = e.detail)}"
        .engagement="${this.engagement}"
        @engagement-updated="${(e: CustomEvent) => (this.engagement = e.detail.data)}"
        .errorObject="${this.errorObject}"
        @error-changed="${(e: CustomEvent) => (this.errorObject = e.detail)}"
        .basePermissionPath="${this.permissionBase}"
        @base-permission-changed="${(e: CustomEvent) => (this.permissionBase = e.detail)}"
      >
      </update-engagement>

      ${this.engagement?.id
        ? html`
            <pages-header-element
              show-export-button
              hide-print-button
              .exportLinks="${this._setExportLinks(this.engagement)}"
              .engagement="${this.engagement}"
              pageTitle="${this.engagement.partner.name} - Micro Assessment"
            >
            </pages-header-element>

            <div class="tab-selector">
              <paper-tabs
                attr-for-selected="name"
                noink
                bottom-item
                role="tablist"
                tabindex="0"
                .selected="${this.tab}"
                @selected-changed="${(e: CustomEvent) => (this.tab = e.detail.value)}"
                id="pageTabs"
              >
                <paper-tab name="overview">
                  <span class="tab-content">Engagement Overview</span>
                </paper-tab>

                ${this._showReportTabs(this.permissionBase, this.engagement)
                  ? html`<paper-tab name="report"><span class="tab-content">Report</span></paper-tab>`
                  : ``}
                ${this._showQuestionnaire(this.permissionBase, this.engagement)
                  ? html` <paper-tab name="questionnaire"><span class="tab-content">Questionnaire</span></paper-tab>`
                  : ``}
                ${this._showFollowUpTabs(this.permissionBase)
                  ? html`<paper-tab name="follow-up"><span class="tab-content">Follow-Up</span></paper-tab>`
                  : ``}

                <paper-tab name="attachments"><span class="tab-content">Attachments</span></paper-tab>
              </paper-tabs>
            </div>

            <div class="view-container">
              <div id="pageContent">
                <iron-pages id="info-tabs" .selected="${this.tab}" attr-for-selected="name">
                  <div name="overview">
                    ${this._showCancellationReason(this.engagement)
                      ? html`<etools-content-panel class="cancellation-tab" panel-title="">
                          <div slot="panel-btns" class="bookmark">
                            <iron-icon icon="bookmark"></iron-icon>
                          </div>

                          <div class="cancellation-title">Cancellation Note</div>
                          <div class="cancellation-text">${this.engagement.cancel_comment}</div>
                        </etools-content-panel>`
                      : ``}

                    <engagement-info-details
                      id="engagementDetails"
                      .data="${this.engagement}"
                      @data-changed="${(e: CustomEvent) => (this.engagement = e.detail)}"
                      .originalData="${this.originalData}"
                      .errorObject="${this.errorObject}"
                      .basePermissionPath="${this.permissionBase}"
                    >
                    </engagement-info-details>

                    <partner-details-tab
                      .originalData="${this.originalData}"
                      id="partnerDetails"
                      .engagement="${this.engagement}"
                      .errorObject="${this.errorObject}"
                      .basePermissionPath="${this.permissionBase}"
                    >
                    </partner-details-tab>

                    <engagement-staff-members-tab
                      id="staffMembers"
                      .engagement="${this.engagement}"
                      .basePermissionPath="${this.permissionBase}"
                      .errorObject="${this.errorObject}"
                    >
                    </engagement-staff-members-tab>
                  </div>

                  ${this._showReportTabs(this.permissionBase, this.engagement)
                    ? html`<div name="report">
                        <ma-report-page-main
                          id="report"
                          .originalData="${this.originalData}"
                          .engagement="${this.engagement}"
                          .errorObject="${this.errorObject}"
                          .permissionBase="${this.permissionBase}"
                        >
                        </ma-report-page-main>
                      </div>`
                    : ``}
                  ${this._showQuestionnaire(this.permissionBase, this.engagement)
                    ? html`<div name="questionnaire">
                        <questionnaire-page-main
                          id="questionnaire"
                          .data="${this.engagement.questionnaire}"
                          .riskAssessment="${this.engagement.questionnaire.risk_rating}"
                          .errorObject="${this.errorObject}"
                          .basePermissionPath="${this.permissionBase}"
                        >
                        </questionnaire-page-main>
                      </div>`
                    : ``}
                  ${this._showFollowUpTabs(this.permissionBase)
                    ? html`<div name="follow-up">
                        <follow-up-main
                          id="follow-up"
                          .originalData="${this.originalData}"
                          .errorObject="${this.errorObject}"
                          .engagement="${this.engagement}"
                          .permissionBase="${this.permissionBase}"
                        >
                        </follow-up-main>
                      </div>`
                    : ``}

                  <div name="attachments">
                    <file-attachments-tab
                      id="engagement_attachments"
                      .dataBasePath="${this.permissionBase}"
                      path-postfix="attachments"
                      .baseId="${this.engagement.id}"
                      .errorObject="${this.errorObject}"
                      .timeStamp="${this.timeStamp}"
                      error-property="engagement_attachments"
                      endpoint-name="attachments"
                    >
                    </file-attachments-tab>

                    ${this.hasReportAccess(this.permissionBase, this.engagement)
                      ? html`<file-attachments-tab
                          id="report_attachments"
                          is-report-tab="true"
                          .dataBasePath="${this.permissionBase}"
                          path-postfix="report_attachments"
                          .baseId="${this.engagement.id}"
                          .errorObject="${this.errorObject}"
                          .timeStamp="${this.timeStamp}"
                          error-property="report_attachments"
                          endpoint-name="reportAttachments"
                        >
                        </file-attachments-tab>`
                      : ``}
                  </div>
                </iron-pages>
              </div>

              <div id="sidebar">
                <status-tab-element .engagementData="${this.engagement}" .permissionBase="${this.permissionBase}">
                </status-tab-element>
              </div>
            </div>

            <etools-dialog
              no-padding
              keep-dialog-open
              size="md"
              .opened="${this.dialogOpened}"
              dialog-title="Cancellation of Engagement"
              ok-btn-text="Continue"
              @confirm-btn-clicked="${this._cancelEngagement}"
              openFlag="dialogOpened"
              @close="${this._resetDialogOpenedFlag}"
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
                        @focus="${this._resetFieldError}"
                      >
                      </paper-textarea>
                    </div>
                  </div>
                </div>
              </div>
            </etools-dialog>
          `
        : ``}
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

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('engagement-info-loaded', this._infoLoaded);
    this.addEventListener('engagement-updated', this._engagementUpdated);
    // this.addEventListener('main-action-activated', this._mainActionActivated);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('route')) {
      this._routeConfig(this.route);
    }
    if (
      changedProperties.has('engagement') ||
      changedProperties.has('permissionBase') ||
      changedProperties.has('route')
    ) {
      this._checkAvailableTab(this.engagement, this.permissionBase, this.route);
    }
    if (changedProperties.has('engagement')) {
      this._setPermissionBase(this.engagement.id);
    }
    if (changedProperties.has('tab')) {
      this._tabChanged(this.tab);
    }
  }

  _validateEngagement() {
    const basicInfoValid = this._validateBasicInfo();
    const questionnaireValid = this.getElement('#questionnaire').validateComplited();
    const reportValid = this.getElement('#report').validate();

    if (!basicInfoValid) {
      return false;
    }
    if (!reportValid) {
      this.tab = 'report';
      return false;
    }
    if (!questionnaireValid) {
      this.tab = 'questionnaire';
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
      this.tab = 'report';
      return false;
    }
    return true;
  }
}
