import {LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import cloneDeep from 'lodash-es/cloneDeep';
import assign from 'lodash-es/assign';
import isObject from 'lodash-es/isObject';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, Constructor, EtoolsUser, GenericObject} from '@unicef-polymer/etools-types';
import {getEndpoint} from '../config/endpoints-controller';
import {isValidCollection, actionAllowed, getOptionsChoices, addAllowedActions} from './permission-controller';
import {whichPageTrows} from './error-handler';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import get from 'lodash-es/get';
import {RootState, store} from '../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {
  getActionPointOptions,
  getEngagementAttachmentOptions,
  getEngagementData,
  getEngagementOptions,
  getEngagementReportAttachmentsOptions,
  setEngagementData
} from '../../redux/actions/engagement';
import {EngagementState} from '../../redux/reducers/engagement';
import {getValueFromResponse} from '../utils/utils';
/**
 * @polymer
 * @mixinFunction
 */
// TODO: in old behavior config globals was used, check usage

function EngagementMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class EngagementMixinLitClass extends baseClass {
    @property({type: Number})
    engagementId!: number | null;

    @property({type: Object})
    routeDetails?: EtoolsRouteDetails;

    @property({type: Object})
    user!: EtoolsUser;

    @property({type: Array})
    tabsList!: any[];

    @property({type: String})
    engagementPrefix = '';

    @property({type: Object})
    originalData!: GenericObject;

    @property({type: Object})
    engagement!: AnyObject;

    @property({type: Object})
    engagementFromRedux!: AnyObject;

    @property({type: Object})
    engagementCopy!: AnyObject;

    @property({type: Object})
    engagementOptions!: AnyObject;

    @property({type: Object})
    apOptions!: AnyObject;

    @property({type: Object})
    attachmentOptions!: AnyObject;

    @property({type: Object})
    reportAttachmentOptions!: AnyObject;

    @property({type: Object})
    errorObject: AnyObject = {};

    @property({type: Boolean})
    dialogOpened = false;

    @property({type: String})
    tab!: string;

    @property({type: Boolean})
    isTabValidated = false;

    @property({type: Array})
    reportFileTypes!: any[];

    @property({type: Array})
    engagementFileTypes!: any[];

    @property({type: Boolean})
    isStaffSc!: boolean;

    @property({type: Boolean})
    forceOptionsUpdate!: boolean;

    @property({type: Boolean})
    quietAdding!: boolean;

    @property({type: Boolean})
    selectFollowUpTab = false;

    @property({type: Object})
    updatedEngagement: GenericObject | undefined;

    connectedCallback() {
      super.connectedCallback();

      this._processAction = this._processAction.bind(this);
      this.addEventListener('action-activated', this._processAction as any);
      this.addEventListener('global-loading', this._engagementStatusUpdated as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('action-activated', this._processAction as any);
      this.removeEventListener('', this._engagementStatusUpdated as any);
    }

    setEngagementDataFromRedux(state: RootState) {
      if (state.user?.data && !isJsonStrMatch(state.user.data, this.user)) {
        this.user = state.user.data;
      }
      if (state.engagement?.data && !isJsonStrMatch(this.engagementFromRedux, state.engagement.data)) {
        this.engagementFromRedux = cloneDeep(state.engagement.data);
        this.engagement = cloneDeep(this.engagementFromRedux);
      }
      if (state.engagement?.originalData && !isJsonStrMatch(this.originalData, state.engagement.originalData)) {
        this.originalData = cloneDeep(state.engagement.originalData);
      }
      if (state.engagement?.options && !isJsonStrMatch(this.engagementOptions, state.engagement.options)) {
        this.engagementOptions = cloneDeep(state.engagement.options!);
      }
      if (state.engagement?.apOptions && !isJsonStrMatch(this.apOptions, state.engagement.apOptions)) {
        this.apOptions = cloneDeep(state.engagement.apOptions!);
      }
      if (
        state.engagement?.attachmentOptions &&
        !isJsonStrMatch(this.attachmentOptions, state.engagement.attachmentOptions)
      ) {
        this.attachmentOptions = cloneDeep(state.engagement.attachmentOptions);
      }
      if (
        state.engagement?.reportAttachmentOptions &&
        !isJsonStrMatch(this.reportAttachmentOptions, state.engagement.reportAttachmentOptions)
      ) {
        this.reportAttachmentOptions = cloneDeep(state.engagement.reportAttachmentOptions);
      }
      if (!isJsonStrMatch(this.errorObject, state.engagement.errorObject)) {
        this.errorObject = state.engagement.errorObject || {};
      }

      if (this.user) {
        this._checkAvailableTab(this.engagement, this.engagementOptions, this.apOptions, this.tab);
      }
    }

    updated(changedProperties: PropertyValues): void {
      super.updated(changedProperties);

      if (changedProperties.has('errorObject')) {
        this._errorOccurred(this.errorObject);
      }
    }

    loadEngagementData(id: number | null, engagementType) {
      if (!id || isNaN(id) || !engagementType) {
        return;
      }
      fireEvent(this, 'global-loading', {message: 'Loading engagement data...', active: true, type: 'engagement-info'});
      Promise.allSettled([
        getEngagementData(id, engagementType),
        getEngagementOptions(id, engagementType),
        getEngagementAttachmentOptions(id),
        getEngagementReportAttachmentsOptions(id),
        getActionPointOptions(id)
      ])
        .then((response: any[]) => {
          // if engagement not found redirect to not-found page
          if (response[0].status !== 'fulfilled') {
            fireEvent(this, '404');
            return;
          }
          store.dispatch(setEngagementData(this.formatResponse(response)));
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => fireEvent(this, 'global-loading', {active: false}));
    }

    formatResponse(response: any[]) {
      const resp: Partial<EngagementState> = {};
      resp.data = getValueFromResponse(response[0]);
      resp.options = addAllowedActions(getValueFromResponse(response[1]) || {});
      resp.attachmentOptions = getValueFromResponse(response[2]) || {};
      resp.reportAttachmentOptions = getValueFromResponse(response[3]) || {};
      resp.apOptions = getValueFromResponse(response[4]) || {};
      return resp;
    }

    engagementIsLoaded(engagement) {
      return engagement && Object.keys(engagement).length;
    }

    resetEngagementDataIfNeeded() {
      if (this.engagementId || (this.engagement && Object.keys(this.engagement).length)) {
        this.updatedEngagement = undefined;
        this.engagement = {};
        this.engagementId = null;
        this.engagementOptions = {};
        this.attachmentOptions = {};
        this.reportAttachmentOptions = {};
        this.apOptions = {};
        this.errorObject = {};
        this.routeDetails = undefined;
      }
    }

    _engagementStatusUpdated(e: CustomEvent) {
      if (e.detail && e.detail.saved && e.detail.type) {
        const type = e.detail.type;
        if (type === 'finalize-engagement') {
          this.selectFollowUpTab = true;
        }
      }
    }

    onDetailPageRouteChanged(stateRouteDetails: EtoolsRouteDetails) {
      if (!stateRouteDetails) {
        return;
      }

      this.routeDetails = stateRouteDetails;
      const id = Number(this.routeDetails.params?.id);
      if (!isNaN(id)) {
        if (!this.engagementId || this.engagementId !== id) {
          this.loadEngagementData(id, this.engagementPrefix);
        }
        this.engagementId = id;
      } else {
        fireEvent(this, '404');
      }
      this.tab = this.routeDetails.subRouteName || 'overview';
    }

    _checkAvailableTab(engagement: AnyObject, options: AnyObject, apOptions: AnyObject, tab: string) {
      if (!tab || this.isTabValidated || !engagement || !options || !apOptions) {
        return;
      }
      this.isTabValidated = true;
      if (
        (tab === 'report' && !this._showReportTabs(options, engagement)) ||
        (tab === 'follow-up' && !this._showFollowUpTabs(apOptions))
      ) {
        this._tabChanged('overview', tab);
      }
    }

    _tabChanged(newTabName: string, oldTabName: string | undefined) {
      this.tab = newTabName;
      const newPath = this.routeDetails!.path.replace(`/${oldTabName}`, `/${newTabName}`);
      EtoolsRouter.updateAppLocation(newPath);
    }

    setFileTypes(reportAttachments: AnyObject, attachmentOptions: AnyObject) {
      if (!reportAttachments || !attachmentOptions) {
        return;
      }
      this.reportFileTypes = getOptionsChoices(reportAttachments, 'file_type');
      this.engagementFileTypes = getOptionsChoices(attachmentOptions, 'file_type');
    }

    _openCancelDialog() {
      // overridden in the classes
    }

    _resetFieldError(event) {
      event.target.invalid = false;
    }

    _processAction(event) {
      const details = event.detail;

      if (!details || !details.type) {
        throw new Error('Event type is not provided!');
      }

      switch (details.type) {
        case 'save':
          this._saveProgress(event);
          break;
        case 'create':
          // @ts-ignore Defined in derived class when needed
          this._saveNewEngagement();
          break;
        case 'submit':
          this._submitReport();
          break;
        case 'finalize':
          this._finalizeReport();
          break;
        case 'cancel':
          this._openCancelDialog();
          break;
        default:
          throw new Error(`Unknown event type: ${details.type}`);
      }
    }

    _saveProgress(event) {
      if (!this._validateBasicInfo()) {
        return;
      }
      // @ts-ignore Defined in derived class when needed
      if (this.customBasicValidation && !this.customBasicValidation()) {
        return;
      }

      const quietAdding = event && event.detail && event.detail.quietAdding;
      const forceOptionsUpdate = event && event.detail && event.detail.forceOptionsUpdate;
      return this._prepareData().then((data) => {
        this.quietAdding = quietAdding;
        this.forceOptionsUpdate = forceOptionsUpdate;
        this.updatedEngagement = data;
      });
    }

    _submitReport() {
      // @ts-ignore Defined in derived class when needed
      if (!this._validateEngagement()) {
        return;
      }

      return this._prepareData(true, false).then((data) => {
        this.updatedEngagement = data;
      });
    }

    _finalizeReport() {
      // @ts-ignore Defined in derived class when needed
      if (!this._validateEngagement()) {
        return;
      }

      return this._prepareData(false, true).then((data) => {
        this.updatedEngagement = data;
      });
    }

    _cancelEngagement(cancelComment: string) {
      const type = this.getLongEngType(this.engagement.engagement_type);

      this.updatedEngagement = {
        engagement_type: type,
        id: this.engagement.id,
        data: {cancel_comment: cancelComment},
        cancel: 'cancel/'
      };

      if (this.tab === 'report') {
        this.tab = 'overview';
      }
    }

    getLongEngType(type) {
      switch (type) {
        case 'ma':
          return 'micro-assessments';
        case 'sc':
          return this.isStaffSc ? 'staff-spot-checks' : 'spot-checks';
        case 'audit':
          return 'audits';
        case 'sa':
          return 'special-audits';
      }
    }

    _prepareData(submit?: boolean, finalize?: boolean) {
      if (!this.engagement) {
        return Promise.reject(new Error('You need engagement object'));
      }

      // Check basic info
      let [data, engagementId] = this._getBasicInfo({});

      // Add assign report info
      const reportTab = this.getElement('#report');
      const assignReportData = reportTab && reportTab.getAssignVisitData();
      if (assignReportData) {
        assign(data, assignReportData);
      }

      const type = this.getLongEngType(this.engagement.engagement_type);
      if (!this.isStaffSc) {
        data.engagement_type = this.engagement.engagement_type;
      }

      // @ts-ignore Defined in derived class when needed
      if (this.customDataPrepare) {
        // @ts-ignore Defined in derived class when needed
        data = this.customDataPrepare(data);
      }

      // leave for compatibility with other code
      return Promise.all([]).then(() => ({
        engagement_type: type,
        id: engagementId,
        data: data,
        submit: submit ? 'submit/' : null,
        finalize: finalize ? 'finalize/' : null
      }));
    }

    _setExportLinks(engagement) {
      if (!engagement || !engagement.engagement_type || !engagement.id) {
        return '';
      }
      const type = this.getLongEngType(engagement.engagement_type) || 'engagements';
      const pdfLink = getEndpoint('engagementInfo', {id: engagement.id, type: type}).url + 'pdf/';
      const csvLink = getEndpoint('engagementInfo', {id: engagement.id, type: type}).url + 'csv/';

      return [
        {
          name: 'Export PDF',
          url: pdfLink
        },
        {
          name: 'Export CSV',
          url: csvLink
        }
      ];
    }

    _validateBasicInfo(property?) {
      const detailsValid = this.getElement('#engagementDetails').validate();
      const partnerDetailsValid = this.getElement('#partnerDetails').validate();

      if (!detailsValid || !partnerDetailsValid) {
        const openTab = partnerDetailsValid && detailsValid ? 'attachments' : 'overview';
        this[property || 'tab'] = openTab;
        fireEvent(this, 'toast', {text: 'Fix invalid fields before saving'});
        return false;
      }

      return true;
    }

    _getMembersLength(length) {
      if (isNaN(+length)) {
        length = 0;
      }
      return +length || 0;
    }

    getElement(selector) {
      if (!this.shadowRoot) {
        return;
      }
      let el = this.shadowRoot.querySelector(selector);
      if (!el) {
        const pageContent = this.closest('#pageContent');
        if (pageContent) {
          el = pageContent.querySelector(selector);
        }
      }
      return el;
    }

    _getBasicInfo(data) {
      data = data || {};

      const engagementDetailsData = this.getElement('#engagementDetails').getEngagementData();
      const partnerDetailsData = this.getElement('#partnerDetails').getPartnerData();
      const authorizedOfficer = this.getElement('#partnerDetails').getAuthorizedOfficer();
      const staffMembersData = this.getElement('#staffMembers').getTabData();

      if (engagementDetailsData) {
        assign(data, engagementDetailsData);
      }
      if (partnerDetailsData) {
        assign(data, partnerDetailsData);
      }
      if (staffMembersData) {
        data.staff_members = staffMembersData;
      }
      if (authorizedOfficer) {
        data.authorized_officers = [authorizedOfficer];
      }

      return [data, this.engagement.id];
    }

    _showReportTabs(options: AnyObject, engagement: AnyObject) {
      if (!options || !engagement) {
        return false;
      }
      const userIsFocalPoint = this.user.groups.some((x) => x.name === 'UNICEF Audit Focal Point');
      return this.hasReportAccess(options, engagement) || Boolean(userIsFocalPoint);
    }

    hasReportAccess(options: AnyObject, engagement: AnyObject) {
      return (
        actionAllowed(options, 'submit') || engagement.status === 'report_submitted' || engagement.status === 'final'
      );
    }

    _showQuestionnaire(options: AnyObject, engagement: AnyObject) {
      if (!options || !engagement) {
        return false;
      }
      return this.hasReportAccess(options, engagement);
    }

    _showFollowUpTabs(options: AnyObject) {
      const showFollowUp = isValidCollection(get(options, 'actions.GET'));
      if (showFollowUp && this.selectFollowUpTab) {
        setTimeout(() => {
          this.selectFollowUpTab = false;
          this.tab = 'follow-up';
        }, 300);
      }
      return showFollowUp;
    }

    _showCancellationReason(engagement) {
      return engagement.status === 'cancelled';
    }

    _errorOccurred(errorObj) {
      if (!errorObj || !isObject(errorObj) || !Object.keys(errorObj).length) {
        return;
      }
      const page = whichPageTrows(errorObj);
      if (page) {
        const tab = this.tab ? 'tab' : 'routeData.tab';
        this[tab] = page;
      }
    }
  }
  return EngagementMixinLitClass;
}

export default EngagementMixin;
