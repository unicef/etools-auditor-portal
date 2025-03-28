import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-modules-common/dist/layout/etools-tabs';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '../../common-elements/pages-header-element/pages-header-element';
import '../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../common-elements/status-tab-element/status-tab-element';

import '../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import './report-page-components/sc-report-page-main/sc-report-page-main';
import '../../common-elements/follow-up-components/follow-up-main/follow-up-main';
import '../../common-elements/engagement-cancel/engagement-cancel-dialog';

import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';

import '../../data-elements/update-engagement';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {moduleStyles} from '../../styles/module-styles';
import {mainPageStyles} from '../../styles/main-page-styles';
import {GenericObject} from '../../../types/global';
import {RootState, store} from '../../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import isNull from 'lodash-es/isNull';
import assign from 'lodash-es/assign';
import {isActiveTab, pageIsNotCurrentlyActive} from '../../utils/utils';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import get from 'lodash-es/get';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('spot-checks-page-main')
export class SpotChecksPageMain extends connect(store)(CommonMethodsMixin(EngagementMixin(LitElement))) {
  static get styles() {
    return [moduleStyles, mainPageStyles, tabInputsStyles, layoutStyles];
  }

  render() {
    if (!this.engagementIsLoaded(this.engagement)) {
      return html``;
    }

    return html`
      ${sharedStyles}
      <style>
        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
        .cancellation-tab {
          --etools-icon-font-size: var(--etools-font-size-70, 70px);
        }
      </style>

      <update-engagement
        .updatedEngagementData="${this.updatedEngagement}"
        .quietAdding="${this.quietAdding}"
        @quiet-adding-changed="${(e: CustomEvent) => (this.quietAdding = e.detail === 'true')}"
        .forceOptionsUpdate="${this.forceOptionsUpdate}"
        @force-options-changed="${(e: CustomEvent) => (this.forceOptionsUpdate = e.detail === 'true')}"
        .errorObject="${this.errorObject}"
        @error-changed="${(e: CustomEvent) => (this.errorObject = e.detail)}"
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
              <etools-tabs-lit
                .tabs="${this.tabsList}"
                .activeTab="${this.tab}"
                @sl-tab-show="${(e: CustomEvent) => {
                  if (this.tab !== e.detail.name) {
                    this._tabChanged(e.detail.name, this.tab);
                    this.tab = e.detail.name;
                  }
                }}"
                id="pageTabs"
              ></etools-tabs-lit>
            </div>

            <div class="view-container">
              <div id="pageContent">
                <div name="overview" ?hidden="${!isActiveTab(this.tab, 'overview')}">
                  ${this._showCancellationReason(this.engagement)
                    ? html`<etools-content-panel class="cancellation-tab" panel-title="">
                        <div slot="panel-btns" class="bookmark">
                          <etools-icon name="bookmark"></etools-icon>
                        </div>

                        <div class="cancellation-title">Cancellation Note</div>
                        <div class="cancellation-text">${this.engagement.cancel_comment}</div>
                      </etools-content-panel>`
                    : ``}

                  <partner-details-tab
                    .originalData="${this.originalData}"
                    id="partnerDetails"
                    .engagement="${this.engagement}"
                    .errorObject="${this.errorObject}"
                    .optionsData="${this.engagementOptions}"
                  >
                  </partner-details-tab>

                  <engagement-info-details
                    id="engagementDetails"
                    .data="${this.engagement}"
                    .originalData="${this.originalData}"
                    .errorObject="${this.errorObject}"
                    .optionsData="${this.engagementOptions}"
                    .isStaffSc="${this.isStaffSc}"
                  >
                  </engagement-info-details>

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
                  ? html`<div name="report" ?hidden="${!isActiveTab(this.tab, 'report')}">
                      <sc-report-page-main
                        id="report"
                        .originalData="${this.originalData}"
                        .engagement="${this.engagement}"
                        .errorObject="${this.errorObject}"
                        .optionsData="${this.engagementOptions}"
                        ?showSendBackComments="${this._showSendBackComments(this.engagement)}"
                      >
                      </sc-report-page-main>
                    </div>`
                  : ``}
                ${this._showFollowUpTabs(this.apOptions)
                  ? html`<div name="follow-up" ?hidden="${!isActiveTab(this.tab, 'follow-up')}">
                      <follow-up-main
                        id="follow-up"
                        .originalData="${this.originalData}"
                        .errorObject="${this.errorObject}"
                        .engagement="${this.engagement}"
                        .optionsData="${this.engagementOptions}"
                        .apOptionsData="${this.apOptions}"
                      >
                      </follow-up-main>
                    </div>`
                  : ``}

                <div name="attachments" ?hidden="${!isActiveTab(this.tab, 'attachments')}">
                  <file-attachments-tab
                    id="engagement_attachments"
                    .optionsData="${this.attachmentOptions}"
                    .engagement="${this.engagement}"
                    .errorObject="${this.errorObject}"
                    .isUnicefUser="${this.user?.is_unicef_user}"
                    error-property="engagement_attachments"
                    endpoint-name="attachments"
                  >
                  </file-attachments-tab>

                  ${this.hasReportAccess(this.engagementOptions, this.engagement)
                    ? html`<file-attachments-tab
                        id="report_attachments"
                        is-report-tab="true"
                        .optionsData="${this.reportAttachmentOptions}"
                        .engagement="${this.engagement}"
                        .errorObject="${this.errorObject}"
                        error-property="report_attachments"
                        endpoint-name="reportAttachments"
                      >
                      </file-attachments-tab>`
                    : ``}
                </div>
              </div>

              <div id="sidebar">
                <status-tab-element .engagementData="${this.engagement}" .optionsData="${this.engagementOptions}">
                </status-tab-element>
              </div>
            </div>
          `
        : ``}
    `;
  }

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Array})
  otherActions: any[] = [];

  @property({type: Array})
  tabsList: AnyObject[] = [];

  @property({type: String})
  pageType = '';

  @property({type: Boolean})
  isStaffSc!: boolean;

  @property({type: String})
  engagementPrefix = '';

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails.routeName'), 'spot-checks|staff-spot-checks')) {
      this.resetEngagementDataIfNeeded();
      return;
    }

    this.setEngagementDataFromRedux(state);

    if (state.app?.routeDetails && !isJsonStrMatch(this.routeDetails, state.app.routeDetails)) {
      this.isStaffSc = state.app.routeDetails.routeName === 'staff-spot-checks';
      this.engagementPrefix = this.isStaffSc ? 'staff-spot-checks' : 'spot-checks';
      this.onDetailPageRouteChanged(state.app.routeDetails);
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (
      changedProperties.has('engagementOptions') ||
      changedProperties.has('engagement') ||
      changedProperties.has('user')
    ) {
      this.onEngagementLoaded();
    }
  }

  onEngagementLoaded() {
    if (this.engagementOptions && this.engagement && this.user) {
      this.tabsList = [
        {tab: 'overview', tabLabel: 'Engagement Overview'},
        {tab: 'report', hidden: !this._showReportTabs(this.engagementOptions, this.engagement), tabLabel: 'Report'},
        {tab: 'follow-up', hidden: !this._showFollowUpTabs(this.apOptions), tabLabel: 'Follow-Up'},
        {tab: 'attachments', tabLabel: 'Attachments'}
      ];
      this.setFileTypes(this.attachmentOptions, this.reportAttachmentOptions);
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
      fireEvent(this, 'toast', {text: 'Fill report before submiting!'});
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

  _openCancelOrSendBackDialog(action: string) {
    openDialog({
      dialog: 'engagement-cancel-dialog',
      dialogData: {
        action: action,
        reasonText: action === 'send_back' ? this.engagement.send_back_comment : ''
      }
    }).then(({confirmed, response}) => {
      if (confirmed) {
        this._cancelOrSendBackEngagement(action, response);
      }
    });
  }
}
