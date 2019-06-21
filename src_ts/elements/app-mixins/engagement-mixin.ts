import PolymerElement from '@polymer/polymer';
import {property} from "@polymer/decorators";
import isUndefined from 'lodash-es/isUndefined';
import includes from 'lodash-es/includes';
import cloneDeep from 'lodash-es/cloneDeep';
import isNil from 'lodash-es/isNil';
import assign from 'lodash-es/assign';
import find from 'lodash-es/find';
import isObject from 'lodash-es/isObject';
import {fireEvent} from '../utils/fire-custom-event';
import {Constructor} from '../../types/global';
import PermissionControllerMixin from './permission-controller-mixin';
import ErrorHandlerMixin from './error-handler-mixin';
import TextareaMaxRowsMixin from './textarea-max-rows-mixin';
import EndpointsMixin from '../app-config/endpoints-mixin';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin PermissionControllerMixin
 * @appliesMixin UserControllerMixin
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin TextareaMaxRowsMixin
 */
// TODO: in old behavior config globals was used, check usage
function EngagementMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class EngagementMixinClass extends
      EndpointsMixin(PermissionControllerMixin(
          UserControllerMixin(ErrorHandlerMixin(TextareaMaxRowsMixin(baseClass))))) {

    @property({type: Number})
    engagementId: number;

    @property({type: Object})
    routeData: object;

    @property({type: Array})
    tabsList: any[];

    @property({type: String})
    engagementPrefix: string = '';

    @property({type: Object, readOnly: true})
    originalData: {};

    @property({type: Object})
    currentEngagement: {};

    connectedCallback() {
      super.connectedCallback();

      this._processAction = this._processAction.bind(this);
      this.addEventListener('action-activated', this._processAction);

      this._addObserverEffect("errorObject", '_errorOccurred');
      this._addObserverEffect("dialogOpened", 'resetInputDialog');
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('action-activated', this._processAction);
    }

    _routeConfig(route) {
      if (this.route && !~this.route.prefix.indexOf(this.engagementPrefix)) {
        return;
      }
      fireEvent(this, 'toast', {reset: true});
      this.errorObject = {};

      let id = this.routeData ? this.routeData.id : route.path.split('/')[1];
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
      let tab = route.path.split('/')[2];
      if ((tab === 'report') && !this._showReportTabs(permissionBase, engagement) ||
          (tab === 'follow-up') && !this._showFollowUpTabs(permissionBase)) {
        let id = route.path.split('/')[1];
        this.set('route.path', `/${id}/overview`);
      }
    }

    _infoLoaded() {
      //save data copy
      this.set('originalData', cloneDeep(this.engagement));

      let tab = this.routeData ? this.routeData.tab : this.route.path.split('/')[2];
      if (!~this.tabsList.indexOf(tab)) {
        this.routeData.tab = this.tabsList[0] || '';
        return;
      }

      this.tab = tab;
      if (this.infoLoaded) {
        this.infoLoaded();
      }
    }

    _engagementUpdated(event) {
      let data = event && event.detail && event.detail.data;
      let success = event && event.detail.success;
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
      this.reportFileTypes = this.getChoices(`${this.permissionBase}.report_attachments.file_type`);
      this.engagementFileTypes = this.getChoices(`${this.permissionBase}.engagement_attachments.file_type`);
    }

    _openCancelDialog() {
      let input = this.getElement('#cancellationReasonInput');
      if (input) {
        this.setMaxHeight(input);
      }
      this.dialogOpened = true;
    }

    resetInputDialog(opened) {
      let input = this.getElement('#cancellationReasonInput');
      if (!opened && input) {
        input.value = '';
        this._resetFieldError({target: input});
      }
    }

    _resetFieldError(event) {
      event.target.invalid = false;
    }

    _processAction(event, details) {
      if (!details || !details.type) {
        throw 'Event type is not provided!';
      }
      switch (details.type) {
        case 'save':
          this._saveProgress(event, details);
          break;
        case 'create':
          this._saveNewEngagement(event, details);
          break;
        case 'submit':
          this._submitReport(event, details);
          break;
        case 'finalize':
          this._finalizeReport(event, details);
          break;
        case 'cancel':
          this._openCancelDialog(event, details);
          break;
        default:
          throw `Unknown event type: ${details.type}`;
      }
    }

    _saveProgress(event) {
      if (!this._validateBasicInfo()) {
        return;
      }
      if (this.customBasicValidation && !this.customBasicValidation()) {
        return;
      }

      let quietAdding = event && event.detail && event.detail.quietAdding,
          forceOptionsUpdate = event && event.detail && event.detail.forceOptionsUpdate;

      return this._prepareData()
          .then((data) => {
            this.quietAdding = quietAdding;
            this.forceOptionsUpdate = forceOptionsUpdate;
            this.updatedEngagement = data;
          });
    }

    _submitReport() {
      if (!this._validateEngagement()) {
        return;
      }

      return this._prepareData(true)
          .then((data) => {
            this.updatedEngagement = data;
          });
    }

    _finalizeReport() {
      if (!this._validateEngagement()) {
        return;
      }

      return this._prepareData(false, true)
          .then((data) => {
            this.updatedEngagement = data;
          });
    }

    _cancelEngagement() {
      if (!this.dialogOpened) {
        return;
      }
      let input = this.getElement('#cancellationReasonInput');

      if (!input) {
        throw 'Can not find input!'
      }
      if (!input.validate()) {
        return;
      }

      let type = this.getType(this.engagement.engagement_type);

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

    getType(type) {
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
      const currentEngagement = {details: engagement, type};
      this.set('currentEngagement', currentEngagement)
    }

    getCurrentEngagement() {
      return this.currentEngagement;
    }

    _prepareData(submit, finalize) {
      if (!this.engagement) {
        return Promise.reject('You need engagement object');
      }

      //Check basic info
      let [data, engagementId] = this._getBasicInfo({});

      //Add assign report info
      let reportTab = this.getElement('#report'),
          assignReportData = reportTab && reportTab.getAssignVisitData();
      if (assignReportData) {
        assign(data, assignReportData);
      }

      let type = this.getType(this.engagement.engagement_type);
      if (!type && !this.isStaffSc) {
        type = this.engagement.engagement_type.link;
        data.engagement_type = this.engagement.engagement_type.value;
      }

      if (this.customDataPrepare) {
        data = this.customDataPrepare(data);
      }

      //leave for compatibility with other code
      return Promise.all([])
          .then(() => ({
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
      let type = this.getType(engagement.engagement_type) || 'engagements',
          pdfLink = this.getEndpoint('engagementInfo', {id: engagement.id, type: type}).url + 'pdf/',
          csvLink = this.getEndpoint('engagementInfo', {id: engagement.id, type: type}).url + 'csv/';

      return [{
        name: 'Export PDF',
        url: pdfLink
      }, {
        name: 'Export CSV',
        url: csvLink
      }];
    }

    _validateBasicInfo(property) {
      let detailsValid = this.getElement('#engagementDetails').validate(),
          partnerDetailsValid = this.getElement('#partnerDetails').validate();

      if (!detailsValid || !partnerDetailsValid) {
        let openTab = (partnerDetailsValid && detailsValid) ? 'attachments' : 'overview';

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
      return this.shadowRoot!.querySelector(selector);
    }

    _attachmentsReadonly(base, type) {
      let readOnly = this.isReadonly(`${base}.${type}`);
      if (readOnly === null) {
        readOnly = true;
      }
      return readOnly;
    }

    _getBasicInfo(data) {
      data = data || {};

      let engagementDetailsData = this.getElement('#engagementDetails').getEngagementData(),
          partnerDetailsData = this.getElement('#partnerDetails').getPartnerData(),
          authorizedOfficer = this.getElement('#partnerDetails').getAuthorizedOfficer(),
          staffMembersData = this.getElement('#staffMembers').getTabData();

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
      const userIsFocalPoint = find(this.getUserData().groups, {name: 'UNICEF Audit Focal Point'});
      return this.hasReportAccess(permissionBase, engagement) || Boolean(userIsFocalPoint);
    }

    hasReportAccess(permissionBase, engagement) {
      return this.actionAllowed(permissionBase, 'submit') ||
          engagement.status === 'report_submitted' ||
          engagement.status === 'final'
    }

    _showQuestionnaire(permissionBase, engagement) {
      if (!permissionBase || !engagement) {
        return false;
      }
      return this.hasReportAccess(permissionBase, engagement);
    }

    _showFollowUpTabs(permissionBase) {
      let collection = this._getCollection(`${permissionBase}_ap`, 'GET');
      return this.isValidCollection(collection);
    }

    _showCancellationReason(engagement) {
      return engagement.status === 'cancelled';
    }

    _errorOccurred(errorObj) {
      if (!errorObj || !isObject(errorObj)) {
        return;
      }
      let page = this.whichPageTrows(errorObj);
      if (page) {
        let tab = this.tab ? 'tab' : 'routeData.tab';
        this.set(tab, page);
      }
    }

  }

  return EngagementMixinClass;

}

export default EngagementMixin;
