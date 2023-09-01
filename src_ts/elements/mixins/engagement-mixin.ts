import {LitElement, PropertyValues, property} from 'lit-element';
import includes from 'lodash-es/includes';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';
import assign from 'lodash-es/assign';
import isObject from 'lodash-es/isObject';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {AnyObject, Constructor, EtoolsUser, GenericObject} from '@unicef-polymer/etools-types';
import {getEndpoint} from '../config/endpoints-controller';
import {getUserData} from './user-controller';
import {isValidCollection, actionAllowed, getOptionsChoices} from './permission-controller';
import {whichPageTrows} from './error-handler';
import {clearQueries} from './query-params-controller';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import get from 'lodash-es/get';
import {RootState} from '../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
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
    routeData!: GenericObject;

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
    engagementOptions!: AnyObject;

    @property({type: Object})
    apOptions!: AnyObject;

    @property({type: Object})
    attachmentOptions!: AnyObject;

    @property({type: Object})
    reportAttachmentOptions!: AnyObject;

    @property({type: String})
    permissionBase!: string | null;

    @property({type: String})
    timeStamp!: string;

    @property({type: Object})
    errorObject: GenericObject = {};

    @property({type: Boolean})
    dialogOpened = false;

    @property({type: String})
    tab!: string;

    @property({type: Object})
    route!: GenericObject;

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

    @property({type: Object})
    updatedEngagement!: GenericObject;

    connectedCallback() {
      super.connectedCallback();

      this._processAction = this._processAction.bind(this);
      this.addEventListener('action-activated', this._processAction as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('action-activated', this._processAction as any);
    }

    setEngagementData(state: RootState) {
      if (state.engagement?.data && !isJsonStrMatch(this.engagement, state.engagement.data)) {
        this.engagement = cloneDeep(state.engagement.data);
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
    }

    updated(changedProperties: PropertyValues): void {
      super.updated(changedProperties);

      if (changedProperties.has('errorObject')) {
        this._errorOccurred(this.errorObject);
      }
      if (changedProperties.has('dialogOpened')) {
        this.resetInputDialog(this.dialogOpened);
      }
    }

    _resetDialogOpenedFlag(event) {
      this[event.currentTarget.getAttribute('openFlag')] = false;
    }

    onRouteChanged(routeDetails: EtoolsRouteDetails, tab: string) {
      // && !~route.prefix.indexOf(this.engagementPrefix)
      // debugger;
      if (!routeDetails) {
        return;
      }
      fireEvent(this, `close-toasts`);
      this.errorObject = {};

      const id = routeDetails ? routeDetails.params?.id : '';
      if (!this.engagementId) {
        clearQueries();
      }
      if (!id || isNaN(+id) || !includes(this.tabsList, tab)) {
        fireEvent(this, '404');
      } else {
       //  this.engagementId = Number(id);
      }
    }

    _checkAvailableTab(engagement: AnyObject, options: AnyObject, tab) {
      if (!tab || !options || !engagement) {
        return;
      }
      if (
        (tab === 'report' && !this._showReportTabs(options, engagement)) ||
        (tab === 'follow-up' && !this._showFollowUpTabs(options))
      ) {
        // debugger;
        history.pushState(
          window.history.state,
          '',
          `${ROOT_PATH}${this.routeDetails!.routeName}/${this.routeDetails!.params!.id}/overview`
        );
        window.dispatchEvent(new CustomEvent('popstate'));
      }
    }

    // dci to be called...
    _infoLoaded() {
      // save data copy
      this.originalData = cloneDeep(this.engagement);
      this.engagement = {...this.engagement};
      this.timeStamp = String(new Date().getTime());

      const tab = this.routeDetails ? this.routeDetails.subRouteName : '';
      if (!~this.tabsList.indexOf(tab)) {
        // dci this.routeData = {...this.routeData, tab: this.tabsList[0] || ''};
        return;
      }

      this.tab = tab!;
      // @ts-ignore Defined in derived class when needed
      if (this.infoLoaded) {
        // @ts-ignore Defined in derived class when needed
        this.infoLoaded();
      }
    }

    _engagementUpdated(event) {
      if (!event || !event.detail) {
        return;
      }
      const data = event.detail.data;
      const success = event.detail.success;
      if (data) {
        this.originalData = cloneDeep(this.engagement);
      }

      if (!isNil(success) && data && data.status === 'final') {
        if (getUserData().is_unicef_user) {
          this.tab = 'follow-up';
        }
      }
    }

    _tabChanged(newTabName: string, oldTabName: string | undefined) {
      // debugger;
      // const newPath = this._geNewUrlPath(newTabName, newSubTab);
      // history.pushState(window.history.state, '', newPath);
      // window.dispatchEvent(new CustomEvent('popstate'));
      const newPath = this.routeDetails?.path.replace(`/${oldTabName}`, `/${newTabName}`);
      history.pushState(window.history.state, '', `${ROOT_PATH}${newPath}`);
      window.dispatchEvent(new CustomEvent('popstate'));
    }

    //   _geNewUrlPath(newTabName: string, newSubTab: string) {
    //   const stringParams: string = buildUrlQueryString(this.routeDetails!.queryParams || {});
    //   let newPath = `interventions/${this.intervention!.id}/${newTabName}`;
    //   if (newSubTab) {
    //     newPath += `/${newSubTab}`;
    //   } else {
    //     this.activeSubTab = '';
    //   }
    //   newPath += stringParams !== '' ? `?${stringParams}` : '';

    //   return newPath;
    // }

    setFileTypes(reportAttachments: AnyObject, attachmentOptions: AnyObject) {
      if (!reportAttachments || !attachmentOptions) {
        return;
      }
      this.reportFileTypes = getOptionsChoices(reportAttachments, 'file_type');
      this.engagementFileTypes = getOptionsChoices(attachmentOptions, 'file_type');
    }

    _openCancelDialog() {
      this.dialogOpened = true;
    }

    resetInputDialog(opened) {
      const input = this.getElement('#cancellationReasonInput');
      if (!opened && input) {
        input.value = '';
        this._resetFieldError({target: input});
      }
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

    _cancelEngagement() {
      if (!this.dialogOpened) {
        return;
      }
      const input = this.getElement('#cancellationReasonInput');

      if (!input) {
        throw new Error('Can not find input!');
      }
      if (!input.validate()) {
        return;
      }

      const type = this.getLongEngType(this.engagement.engagement_type);

      this.updatedEngagement = {
        engagement_type: type,
        id: this.engagement.id,
        data: {cancel_comment: input.value},
        cancel: 'cancel/'
      };
      this.dialogOpened = false;
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
      // debugger;
      const collection = get(options, 'actions.GET');
      return isValidCollection(collection);
    }

    _showCancellationReason(engagement) {
      return engagement.status === 'cancelled';
    }

    _errorOccurred(errorObj) {
      if (!errorObj || !isObject(errorObj)) {
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
