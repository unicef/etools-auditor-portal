import {PolymerElement, html} from '@polymer/polymer';
import famEndpoints from '../app-config/endpoints';
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import PermissionControllerMixin from '../../elements/app-mixins/permission-controller-mixin';
import StaticDataMixin from '../../elements/app-mixins/static-data-mixin';
import get from 'lodash-es/get';
import each from 'lodash-es/each';
import sortBy from 'lodash-es/sortBy';
import {fireEvent} from '../utils/fire-custom-event';
import './user-data';



class StaticData extends StaticDataMixin(PermissionControllerMixin(EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)))) {

  public static get template() {
    return html`
      <user-data></user-data>
    `;
  }

  private dataLoaded = {
    partners: false,
    engagementOptions: false,
    users: false,
    staffUsers: false,
    attachmentsOptions: false,
    filters: false,
    filterAuditors: false,
    filterPartners: false,
    engagementTypes: false,
    statuses: false
  };

  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('user-profile-loaded', this.loadStaticData);

    // document??
    this._updateEngagementsFilters = this._updateEngagementsFilters.bind(this);
    document.addEventListener('update-engagements-filters', this._updateEngagementsFilters);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('update-engagements-filters', this._updateEngagementsFilters);
  }

  loadStaticData() {
    this.getPartners();
    this.getUsers()
    this.getStaffUsers();
    this.getOffices();
    this.getSections();

    this._getStaticDropdownData();

    this.makeOptionsCalls();
  }

  getPartners() {
    let partnersEndpoint = this.getEndpoint('partnerOrganisations');
    this.sendRequest({
      endpoint: partnersEndpoint
    })
      .then((resp) => this._partnersLoaded(resp))
      .catch((err) => this._partnersLoaded(err));
  }

  getUsers() {
    let usersEndpoint = famEndpoints.users;
    this.sendRequest({
      endpoint: usersEndpoint
    })
      .then((resp) => this._handleUsersResponse(resp))
      .catch((err) => this._handleUsersResponse(err));
  }

  getStaffUsers() {
    let staffUsersEndpoint = famEndpoints.staffMembersUsers;
    this.sendRequest({
      endpoint: staffUsersEndpoint
    })
      .then((resp) => this._handleStaffUsersResponse(resp))
      .catch((err) => this._handleStaffUsersResponse(err));
  }

  getOffices() {
    let officesEndpoint = famEndpoints.offices;
    this.sendRequest({
      endpoint: officesEndpoint
    })
    .then((resp) => this._apDataResponse(resp, 'offices'))
    .catch(() => this._apDataResponse());// This doesn't actually handle the error in any way
  }

  getSections() {
    let sectionsEndpoint = famEndpoints.sectionsCovered;
    this.sendRequest({
      endpoint: sectionsEndpoint
    })
      .then((resp) => this._apDataResponse(resp, 'sections'))
      .catch(() => this._apDataResponse());// This doesn't actually handle the error in any way
  }

  _getStaticDropdownData() {
    const reqOpts = {
      csrf: true,
      endpoint: famEndpoints.static
    };

    this.sendRequest(reqOpts).then(resp => this._setData('staticDropdown', resp));
  }

  makeOptionsCalls() {
    this.getEngagementOptions();
    this.getNewStaffSCOptions();
    this.getAtmOptions();
  }

  getEngagementOptions() {
    const options = {
      endpoint: famEndpoints.createEngagement,
      csrf: true,
      method: 'OPTIONS'
    }
    this.sendRequest(options)
      .then((resp) => this._handleNewEngagementResponse(resp))
      .catch((err) => this._handleNewEngagementResponse(err));
  }

  getNewStaffSCOptions() {
    const options = {
      endpoint: famEndpoints.staffSCList,
      csrf: true,
      method: 'OPTIONS'
    }
    this.sendRequest(options)
      .then((resp) => this._handleStaffSCOptionsResponse(resp))
      .catch((err) => this._handleStaffSCOptionsResponse(err));
  }

  getAtmOptions() {
    const options = {
      endpoint: this.getEndpoint('attachments', {id: 'new'}),
      csrf: true,
      method: 'OPTIONS'
    }
    this.sendRequest(options)
      .then((resp) => this._atmOptionsResponse(resp))
      .catch((err) => this._atmOptionsResponse(err));
  }



  _allDataLoaded() {// TODO -rename _checkAllDataLoaded
    if (this.dataLoaded.partners &&
      this.dataLoaded.engagementOptions &&
      this.dataLoaded.users &&
      this.dataLoaded.staffUsers &&
      this.dataLoaded.attachmentsOptions) {
      fireEvent(this, 'static-data-loaded');
    }
  }

  _filtersDataLoaded() {
    if (this.dataLoaded.filterAuditors && this.dataLoaded.filterPartners &&
      this.dataLoaded.engagementTypes && this.dataLoaded.statuses) {
      this._triggerGlobalEvent('engagements-filters-updated');

      this.dataLoaded.filters = true;
      this.dataLoaded.filterAuditors = false;
      this.dataLoaded.filterPartners = false;
    }
  }

  _triggerGlobalEvent(eventName, data?) {
    let detail = {detail: data};
    let event = new CustomEvent(eventName, detail);
    document.dispatchEvent(event);
  }

  _updateEngagementsFilters() {
    let time = new Date().getTime();

    let filterAuditorsEndpoint = this.getEndpoint('filterAuditors');
    filterAuditorsEndpoint.url += `?reload=${time}`;
    this.sendRequest({endpoint: filterAuditorsEndpoint})
      .then((resp) => this._filterAuditorsLoaded(resp))
      .catch((err) => this._filterAuditorsLoaded(err));

    let filterPartnersEndpoint = this.getEndpoint('filterPartners');
    filterPartnersEndpoint.url += `?reload=${time}`;
    this.sendRequest({endpoint: filterPartnersEndpoint})
      .then((resp) => this._filterPartnersLoaded(resp))
      .catch((err) => this._filterPartnersLoaded(err));
  }

  _partnersLoaded(details) {
    if (!details || details.error) { // TODO is .error ok?
      this._responseError('Partners', '', 'warn');
    } else {
      let partners = sortBy(details, ['name']);
      this._setData('partners', partners);
    }
    this.dataLoaded.partners = true;
    this._allDataLoaded();
  }

  _filterAuditorsLoaded(details) {
    if (!details || details.error) {
      this._responseError('Auditors', '');
    }
    let filterAuditors = details || details.results || [];
    if (this.dataLoaded.filters) {
      this._updateData('filterAuditors', filterAuditors);
    } else {
      this._setData('filterAuditors', filterAuditors);
    }

    this.dataLoaded.filterAuditors = true;
    this._filtersDataLoaded();
  }

  _filterPartnersLoaded(details) {
    if (!details || details.error) {
      this._responseError('Partners', '');
    }

    let filterPartners = details || [];
    if (this.dataLoaded.filters) {
      this._updateData('filterPartners', filterPartners);
    } else {
      this._setData('filterPartners', filterPartners);
    }

    this.dataLoaded.filterPartners = true;
    this._filtersDataLoaded();
  }

  _handleNewEngagementResponse(details) {
    let actions = details && details.actions;
    if (!details || details.error || !this.isValidCollection(actions)) {
      this._responseError('Engagement Permissions', details.error);
    } else {
      this._addToCollection('new_engagement', actions);

      let statuses = this.getChoices('new_engagement.status') || [];
      let engagementTypes = this.getChoices('new_engagement.engagement_type') || [];

      if (!statuses) {this._responseError('Statuses', 'Can not load engagement statuses data');}
      if (!engagementTypes) {this._responseError('Engagement types', 'Can not load engagement types data');}

      this._setData('statuses', statuses);
      this.dataLoaded.statuses = true;
      this._setData('engagementTypes', engagementTypes);
      this.dataLoaded.engagementTypes = true;
    }

    this.dataLoaded.engagementOptions = true;
    this._allDataLoaded();
  }

  _handleStaffSCOptionsResponse(data) {
    let actions = get(data, 'actions') || {};
    let name = get(data, 'name', '');
    let collection = 'new_staff_sc';
    let dataName = 'staffSCPermissions';

    if (!collection || !dataName) {
      throw new Error('Please provide collection and dataName attributes');
    }

    this._addToCollection(collection, actions, name);
    this.dataLoaded[dataName] = true;
  }

  _atmOptionsResponse(data) {
    let actions = get(data, 'actions', {});
    let name = get(data, 'name', '');

    if (actions) {
      this._addToCollection(`new_engagement_attachments`, actions || {}, name);
      this._addToCollection(`new_staff_sc_attachments`, actions || {}, name);
    } else {
      this._responseError('Engagement Attachments Permissions', data && data.type);
    }

    this.dataLoaded.attachmentsOptions = true;
    this._allDataLoaded();
  }

  _handleUsersResponse(details) {
    if (!details || details.error) {
      this._responseError('Users', '', 'warn');
    } else {
      each(details, (user) => {
        user.full_name = user.first_name || user.last_name ?
          `${user.first_name} ${user.last_name}` :
          'Unnamed User';
      });
      this._setData('users', details);
    }
    this.dataLoaded.users = true;
    this._allDataLoaded();
  }

  _handleStaffUsersResponse(details) {
    if (!details || details.error) {// TODO check if field `error` exists on the error obj
      this._responseError('Staff Members Users', '', 'warn');
    } else {
      each(details, (user) => {
        user.full_name = user.first_name || user.last_name ?
          `${user.first_name} ${user.last_name}` :
          'Unnamed User';
      });
      this._setData('staffMembersUsers', details);
    }
    this.dataLoaded.staffUsers = true;
    this._allDataLoaded();
  }

  _apDataResponse(details?, cacheKey?) {
    let collection = cacheKey;// the cacheKey on the endpoint

    if (!collection || !details) {return;}

    this._setData(collection, details);
  }

  _responseError(message, type, eventType = 'error') {
    console[eventType](`Can not load initial data: ${message || '?'}. Reason: ${type || '?'}`);
  }
}

window.customElements.define('static-data', StaticData);
