import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import isUndefined from 'lodash-es/isUndefined';
import includes from 'lodash-es/includes';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';
import assign from 'lodash-es/assign';
import find from 'lodash-es/find';
import isObject from 'lodash-es/isObject';
import {fireEvent} from '../utils/fire-custom-event';
import {Constructor, GenericObject} from '../../types/global';
import {getEndpoint} from '../app-config/endpoints-controller';
import {getUserData} from '../../elements/app-mixins/user-controller';
import {getChoices, readonlyPermission, getCollection, isValidCollection, actionAllowed} from './permission-controller';
import {whichPageTrows} from './error-handler';

let currentEngagement: {details?: GenericObject; type?: string} = {};
/**
 * @polymer
 * @mixinFunction
 */
// TODO: in old behavior config globals was used, check usage

function EngagementMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class EngagementMixinClass extends baseClass {
    @property({type: Number})
    engagementId!: number | null;

    @property({type: Object})
    routeData!: GenericObject;

    @property({type: Array})
    tabsList!: any[];

    @property({type: String})
    engagementPrefix = '';

    @property({type: Object})
    originalData!: GenericObject;

    @property({type: Object})
    currentEngagement!: GenericObject;

    @property({type: String})
    permissionBase!: string | null;

    @property({type: Object, observer: '_errorOccurred'})
    errorObject: GenericObject = {};

    @property({type: Boolean, observer: 'resetInputDialog'})
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

    @property({type: Object})
    engagement!: GenericObject;

    connectedCallback() {
      super.connectedCallback();

      this._processAction = this._processAction.bind(this);
      this.addEventListener('action-activated', this._processAction as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('action-activated', this._processAction as any);
    }

    _routeConfig(route) {
      if (this.route && !~this.route.prefix.indexOf(this.engagementPrefix)) {
        return;
      }
      fireEvent(this, 'toast', {reset: true});
      this.errorObject = {};

      const id = this.routeData ? this.routeData.id : route.path.split('/')[1];
      let tab = this.routeData ? this.routeData.tab : route.path.split('/')[2];
      if (tab === '' || isUndefined(tab)) {
        this.set('route.path', `/${id}/overview`);
        tab = 'overview';
      }
      if (!id || isNaN(+id) || !includes(this.tabsList, tab)) {
        fireEvent(this, '404');
      } else {
        this.engagementId = +id;
      }
    }

    _checkAvailableTab(engagement, permissionBase, route) {
      if (!route || !permissionBase || !engagement) {
        return;
      }
      const tab = route.path.split('/')[2];
      if (
        (tab === 'report' && !this._showReportTabs(permissionBase, engagement)) ||
        (tab === 'follow-up' && !this._showFollowUpTabs(permissionBase))
      ) {
        const id = route.path.split('/')[1];
        this.set('route.path', `/${id}/overview`);
      }
    }

    _infoLoaded() {
      // save data copy
      this.set('originalData', cloneDeep(this.engagement));

      const tab = this.routeData ? this.routeData.tab : this.route.path.split('/')[2];
      if (!~this.tabsList.indexOf(tab)) {
        this.routeData.tab = this.tabsList[0] || '';
        return;
      }

      this.tab = tab;
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
        this.set('originalData', cloneDeep(this.engagement));
      }

      if (!isNil(success) && data && data.status === 'final') {
        this.tab = 'follow-up';
      }
    }

    _tabChanged(tab) {
      if (tab && this.routeData && this.routeData.tab !== tab) {
        this.set('routeData.tab', tab);
      }
    }

    _setPermissionBase(id) {
      if ((!id && id !== 0) || isNaN(+id)) {
        this.permissionBase = null;
      } else {
        this.permissionBase = `engagement_${id}`;
      }
      (this.reportFileTypes as any) = getChoices(`${this.permissionBase}.report_attachments.file_type`);
      (this.engagementFileTypes as any) = getChoices(`${this.permissionBase}.engagement_attachments.file_type`);
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

    persistCurrentEngagement(engagement, type) {
      currentEngagement = {details: engagement, type};
      this.set('currentEngagement', currentEngagement);
    }

    getCurrentEngagement() {
      return currentEngagement;
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
        this.set(property || 'tab', openTab);
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

    _attachmentsReadonly(base, type) {
      let readOnly = readonlyPermission(`${base}.${type}`);
      if (readOnly === null) {
        readOnly = true;
      }
      return readOnly;
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

    _showReportTabs(permissionBase, engagement) {
      if (!permissionBase || !engagement) {
        return false;
      }
      const userIsFocalPoint = find(getUserData().groups, {name: 'UNICEF Audit Focal Point'});
      return this.hasReportAccess(permissionBase, engagement) || Boolean(userIsFocalPoint);
    }

    hasReportAccess(permissionBase, engagement) {
      return (
        actionAllowed(permissionBase, 'submit') ||
        engagement.status === 'report_submitted' ||
        engagement.status === 'final'
      );
    }

    _showQuestionnaire(permissionBase, engagement) {
      if (!permissionBase || !engagement) {
        return false;
      }
      return this.hasReportAccess(permissionBase, engagement);
    }

    _showFollowUpTabs(permissionBase) {
      const collection = getCollection(`${permissionBase}_ap`, 'GET');
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
        this.set(tab, page);
      }
    }
  }
  return EngagementMixinClass;
}

export default EngagementMixin;
