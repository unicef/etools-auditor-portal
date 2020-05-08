import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/app-route/app-route';
import '@polymer/polymer/lib/elements/dom-if';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/app-layout/app-layout';
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '../../../common-elements/pages-header-element/pages-header-element';
import '../../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../../common-elements/status-tab-element/status-tab-element';
// eslint-disable-next-line
import '../../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../../common-elements/engagement-overview-components/partner-details-tab/partner-details-tab';
import '../report-page-components/sc-report-page-main/sc-report-page-main';
import '../../../common-elements/follow-up-components/follow-up-main/follow-up-main';

import {setStaticData, getStaticData} from '../../../app-mixins/static-data-controller';
import EngagementMixin from '../../../app-mixins/engagement-mixin';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {getChoices} from '../../../app-mixins/permission-controller';

import '../../../data-elements/update-engagement';
import '../../../data-elements/engagement-info-data';

import {sharedStyles} from '../../../styles-elements/shared-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {mainPageStyles} from '../../../styles-elements/main-page-styles';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {GenericObject} from '../../../../types/global';

import isNull from 'lodash-es/isNull';
import assign from 'lodash-es/assign';
import sortBy from 'lodash-es/sortBy';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
class SpotChecksPageMain extends (CommonMethodsMixin(EngagementMixin(PolymerElement))) {

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
            engagement-type="[[pageType]]"
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
                    page-title="[[engagement.partner.name]] - Spot Check">
            </pages-header-element>

            <div class="tab-selector">
                <paper-tabs
                        attr-for-selected="name"
                        noink
                        bottom-item
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

                    <paper-tab name="attachments">
                        <span class="tab-content">Attachments</span>
                    </paper-tab>
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
                                    error-object="{{errorObject}}"
                                    original-data="[[originalData]]"
                                    base-permission-path="{{permissionBase}}"
                                    is-staff-sc="[[isStaffSc]]">
                            </engagement-info-details>

                            <partner-details-tab
                                    id="partnerDetails"
                                    original-data="[[originalData]]"
                                    engagement="{{engagement}}"
                                    error-object="{{errorObject}}"
                                    base-permission-path="{{permissionBase}}">
                            </partner-details-tab>


                            <engagement-staff-members-tab
                                    id="staffMembers"
                                    base-permission-path="{{permissionBase}}"
                                    engagement="{{engagement}}"
                                    error-object="{{errorObject}}"
                                    page-type="[[pageType]]">
                            </engagement-staff-members-tab>
                        </div>

                        <template is="dom-if" if="{{_showReportTabs(permissionBase, engagement)}}" restamp>
                            <div name="report">
                                <sc-report-page-main
                                        id="report"
                                        original-data="[[originalData]]"
                                        engagement="{{engagement}}"
                                        error-object="{{errorObject}}"
                                        permission-base="{{permissionBase}}">
                                </sc-report-page-main>
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
                                        partner-name="[[engagement.partner.name]]"
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

            <etools-dialog id="spotCheckCancelation"
                           size="md"
                           opened="{{dialogOpened}}"
                           dialog-title="Cancellation of Engagement"
                           keep-dialog-open
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
  engagement: GenericObject = {};

  @property({type: Array})
  otherActions: any[] = [];

  @property({type: Array})
  tabsList = ['overview', 'report', 'attachments', 'follow-up'];

  @property({type: String})
  pageType: string = '';

  @property({type: String})
  isStaffSc!: string;


  static get observers() {
    return [
      '_routeConfig(route)',
      '_checkAvailableTab(engagement, permissionBase, route)',
      '_setPermissionBase(engagement.id)',
      '_tabChanged(tab)',
      '_setType(isStaffSc)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('engagement-info-loaded', this._infoLoaded);
    this.addEventListener('engagement-updated', this._engagementUpdated);
    // @lajos not found
    // this.addEventListener('main-action-activated', this._mainActionActivated);
  }

  _setType(isStaffSc) {
    const type = isStaffSc ? 'staff-spot-checks' : 'spot-checks';
    this.set('engagementPrefix', `/${type}`);
    this.set('pageType', type);
  }

  _validateEngagement() {
    const basicInfoValid = this._validateBasicInfo();
    const reportValid = this.getElement('#report').validate();

    if (!basicInfoValid) {return false;}
    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    return true;
  }

  customDataPrepare(data) {
    data = data || {};
    // Rport data
    const reportPage = this.getElement('#report');

    const findingData = reportPage && reportPage.getFindingsData();
    if (findingData) {data.findings = findingData;}

    const internalControlsData = reportPage && reportPage.getInternalControlsData();
    if (!isNull(internalControlsData)) {data.internal_controls = internalControlsData;}

    const overviewData = reportPage && reportPage.getOverviewData() || {};
    assign(data, overviewData);

    // FollowUp data
    const followUpPage = this.getElement('#follow-up');
    const followUpData = followUpPage && followUpPage.getFollowUpData() || {};
    assign(data, followUpData);

    return data;
  }

  customBasicValidation() {
    const reportTab = this.getElement('#report');
    if (!reportTab) {return true;}
    const reportValid = reportTab.validate('forSave');
    if (!reportValid) {
      this.set('tab', 'report');
      return false;
    }
    return true;
  }

  infoLoaded() {
    this.loadChoices('category_of_observation');
  }

  loadChoices(property) {
    if (getStaticData(property)) {return;}
    const choices = getChoices(`engagement_${this.engagement.id}.findings.${property}`);
    if (!choices) {return;}
    const sortedChoices = sortBy(
      choices,
      ['display_name']);
    setStaticData(property, sortedChoices);
  }

}

window.customElements.define('spot-checks-page-main', SpotChecksPageMain);
