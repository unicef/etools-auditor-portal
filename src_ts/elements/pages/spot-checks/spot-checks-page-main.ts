import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/app-layout/app-layout';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../common-elements/pages-header-element/pages-header-element';
import '../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../common-elements/status-tab-element/status-tab-element';
// eslint-disable-next-line
import '../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import './report-page-components/sc-report-page-main/sc-report-page-main';
import '../../common-elements/follow-up-components/follow-up-main/follow-up-main';

import {setStaticData, getStaticData} from '../../mixins/static-data-controller';
import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {getChoices} from '../../mixins/permission-controller';

import '../../data-elements/update-engagement';
import '../../data-elements/engagement-info-data';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {moduleStyles} from '../../styles/module-styles';
import {mainPageStyles} from '../../styles/main-page-styles';
import {GenericObject} from '../../../types/global';
import {RootState, store} from '../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import isNull from 'lodash-es/isNull';
import assign from 'lodash-es/assign';
import sortBy from 'lodash-es/sortBy';
import {pageIsNotCurrentlyActive} from '../../utils/utils';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import get from 'lodash-es/get';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('spot-checks-page-main')
export class SpotChecksPageMain extends connect(store)(CommonMethodsMixin(EngagementMixin(LitElement))) {
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

      <engagement-info-data .engagementType="${this.pageType}" .engagementId="${this.engagementId}">
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
              pageTitle="${this.engagement.partner.name} - Spot Check"
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

                ${this._showReportTabs(this.engagementOptions, this.engagement)
                  ? html`<paper-tab name="report"><span class="tab-content">Report</span></paper-tab>`
                  : ``}
                ${this._showFollowUpTabs(this.engagementOptions)
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
                      @data-changed="${(e: CustomEvent) => {
                        this.engagement = e.detail;
                      }}"
                      .originalData="${this.originalData}"
                      .errorObject="${this.errorObject}"
                      .optionsData="${this.engagementOptions}"
                      .isStaffSc="${this.isStaffSc}"
                    >
                    </engagement-info-details>

                    <partner-details-tab
                      .originalData="${this.originalData}"
                      id="partnerDetails"
                      .engagement="${this.engagement}"
                      .errorObject="${this.errorObject}"
                      .optionsData="${this.engagementOptions}"
                    >
                    </partner-details-tab>

                    <engagement-staff-members-tab
                      id="staffMembers"
                      .engagement="${this.engagement}"
                      .optionsData="${this.engagementOptions}"
                      .errorObject="${this.errorObject}"
                      .pageType="${this.pageType}"
                    >
                    </engagement-staff-members-tab>
                  </div>

                  ${this._showReportTabs(this.engagementOptions, this.engagement)
                    ? html`<div name="report">
                        <sc-report-page-main
                          id="report"
                          .originalData="${this.originalData}"
                          @data-changed="${({detail}) => {
                            this.engagement = detail;
                          }}"
                          .engagement="${this.engagement}"
                          .errorObject="${this.errorObject}"
                          .optionsData="${this.engagementOptions}"
                        >
                        </sc-report-page-main>
                      </div>`
                    : ``}
                  ${this._showFollowUpTabs(this.engagementOptions)
                    ? html`<div name="follow-up">
                        <follow-up-main
                          id="follow-up"
                          .originalData="${this.originalData}"
                          .errorObject="${this.errorObject}"
                          .engagement="${this.engagement}"
                          .optionsData="${this.engagementOptions}"
                        >
                        </follow-up-main>
                      </div>`
                    : ``}

                  <div name="attachments">
                    <file-attachments-tab
                      id="engagement_attachments"
                      .optionsData="${this.attachmentOptions}"
                      path-postfix="attachments"
                      .baseId="${this.engagement.id}"
                      .errorObject="${this.errorObject}"
                      .timeStamp="${this.timeStamp}"
                      error-property="engagement_attachments"
                      endpoint-name="attachments"
                    >
                    </file-attachments-tab>

                    ${this.hasReportAccess(this.engagementOptions, this.engagement)
                      ? html`<file-attachments-tab
                          id="report_attachments"
                          is-report-tab="true"
                          .optionsData="${this.reportAttachmentOptions}"
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
                <status-tab-element .engagementData="${this.engagement}" .optionsData="${this.engagementOptions}">
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
  otherActions: any[] = [];

  @property({type: Array})
  tabsList = ['overview', 'report', 'attachments', 'follow-up'];

  @property({type: String})
  pageType = '';

  @property({type: Boolean})
  isStaffSc!: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('engagement-info-loaded', this._infoLoaded);
    this.addEventListener('engagement-updated', this._engagementUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('engagement-info-loaded', this._infoLoaded);
    this.removeEventListener('engagement-updated', this._engagementUpdated);
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails.routeName'), 'spot-checks|staff-spot-checks')) {
      return;
    }

    if (state.user && state.user.data) {
      this.user = state.user.data;
    }
    this.setEngagementData(state);

    if (state.app?.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.routeDetails = state.app.routeDetails;
      this.isStaffSc = this.routeDetails.routeName === 'staff-spot-checks';
      this.pageType = this.isStaffSc ? 'staff-spot-checks' : 'spot-checks';
      this.engagementId = Number(this.routeDetails.params!.id);
      this.tab = this.routeDetails.subRouteName || 'overview';
      // @dci called 2 for this page
      // this.onRouteChanged(this.routeDetails, this.tab);
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('engagementOptions') || changedProperties.has('engagement')) {
      this.onEngagementLoaded();
    }
  }

  onEngagementLoaded() {
    if (this.engagementOptions && this.engagement) {
      this.setFileTypes(this.attachmentOptions, this.reportAttachmentOptions);
      this._checkAvailableTab(this.engagement, this.engagementOptions, this.routeDetails?.subRouteName);
    }
  }

  _validateEngagement() {
    const basicInfoValid = this._validateBasicInfo();
    const reportValid = this.getElement('#report').validate();

    if (!basicInfoValid) {
      return false;
    }
    if (!reportValid) {
      this.tab = 'report';
      return false;
    }
    return true;
  }

  customDataPrepare(data) {
    data = data || {};
    // Rport data
    const reportPage = this.getElement('#report');

    const findingData = reportPage && reportPage.getFindingsData();
    if (findingData) {
      data.findings = findingData;
    }

    const internalControlsData = reportPage && reportPage.getInternalControlsData();
    if (!isNull(internalControlsData)) {
      data.internal_controls = internalControlsData;
    }

    const overviewData = (reportPage && reportPage.getOverviewData()) || {};
    assign(data, overviewData);

    // FollowUp data
    const followUpPage = this.getElement('#follow-up');
    const followUpData = (followUpPage && followUpPage.getFollowUpData()) || {};
    assign(data, followUpData);

    return data;
  }

  customBasicValidation() {
    const reportTab = this.getElement('#report');
    if (!reportTab) {
      return true;
    }
    const reportValid = reportTab.validate('forSave');
    if (!reportValid) {
      this.tab = 'report';
      return false;
    }
    return true;
  }

  // @dci!!!!
  infoLoaded() {
    this.loadChoices('category_of_observation');
  }

  loadChoices(property) {
    if (getStaticData(property)) {
      return;
    }
    const choices = getChoices(`engagement_${this.engagement.id}.findings.${property}`);
    if (!choices) {
      return;
    }
    const sortedChoices = sortBy(choices, ['display_name']);
    setStaticData(property, sortedChoices);
  }
}
