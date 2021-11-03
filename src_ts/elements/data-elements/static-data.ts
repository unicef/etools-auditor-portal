import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import famEndpoints from '../config/endpoints';
import {getEndpoint} from '../config/endpoints-controller';
import {addToCollection, getChoices, isValidCollection} from '../mixins/permission-controller';
import {setStaticData, updateStaticData} from '../mixins/static-data-controller';
import get from 'lodash-es/get';
import each from 'lodash-es/each';
import sortBy from 'lodash-es/sortBy';
import {fireEvent} from '../utils/fire-custom-event';
import './user-data';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import clone from 'lodash-es/clone';

class StaticData extends PolymerElement {
  public static get template() {
    return html` <user-data></user-data> `;
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
    this.getUsers();
    this.getStaffUsers();
    this.getOffices();
    this.getSections();

    this._getStaticDropdownData();

    this.makeOptionsCalls();
  }

  getPartners() {
    const partnersEndpoint = getEndpoint('partnerOrganisations');
    sendRequest({
      endpoint: partnersEndpoint
    })
      .then((resp) => this._partnersLoaded(resp))
      .catch((err) => this._partnersLoaded(err));
  }

  getUsers() {
    const usersEndpoint = clone(famEndpoints.users);
    usersEndpoint.url += '?page=1&page_size=30';
    sendRequest({
      endpoint: usersEndpoint
    })
      .then((resp) => {
        this._handleUsersResponse(resp.results);
      })
      .catch((err) => this._handleUsersResponse(err));
  }

  getStaffUsers() {
    const staffUsersEndpoint = famEndpoints.staffMembersUsers;
    sendRequest({
      endpoint: staffUsersEndpoint
    })
      .then((resp) => this._handleStaffUsersResponse(resp))
      .catch((err) => this._handleStaffUsersResponse(err));
  }

  getOffices() {
    const officesEndpoint = famEndpoints.offices;
    sendRequest({
      endpoint: officesEndpoint
    })
      .then((resp) => this._apDataResponse(resp, 'offices'))
      .catch(() => this._apDataResponse()); // This doesn't actually handle the error in any way
  }

  getSections() {
    const sectionsEndpoint = famEndpoints.sectionsCovered;
    sendRequest({
      endpoint: sectionsEndpoint
    })
      .then((resp) => this._apDataResponse(resp, 'sections'))
      .catch(() => this._apDataResponse()); // This doesn't actually handle the error in any way
  }

  _getStaticDropdownData() {
    const reqOpts = {
      csrf: true,
      endpoint: famEndpoints.static
    };

    sendRequest(reqOpts).then((resp) => setStaticData('staticDropdown', resp));
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
    };
    sendRequest(options)
      .then((resp) => this._handleNewEngagementResponse(resp))
      .catch((err) => this._handleNewEngagementResponse(err));
  }

  getNewStaffSCOptions() {
    const options = {
      endpoint: famEndpoints.staffSCList,
      csrf: true,
      method: 'OPTIONS'
    };
    sendRequest(options)
      .then((resp) => this._handleStaffSCOptionsResponse(resp))
      .catch((err) => this._handleStaffSCOptionsResponse(err));
  }

  getAtmOptions() {
    const options = {
      endpoint: getEndpoint('attachments', {id: 'new'}),
      csrf: true,
      method: 'OPTIONS'
    };
    sendRequest(options)
      .then((resp) => this._atmOptionsResponse(resp))
      .catch((err) => this._atmOptionsResponse(err));
  }

  _checkAllDataLoaded() {
    if (
      this.dataLoaded.partners &&
      this.dataLoaded.engagementOptions &&
      this.dataLoaded.users &&
      this.dataLoaded.staffUsers &&
      this.dataLoaded.attachmentsOptions
    ) {
      fireEvent(this, 'static-data-loaded');
    }
  }

  _filtersDataLoaded() {
    if (
      this.dataLoaded.filterAuditors &&
      this.dataLoaded.filterPartners &&
      this.dataLoaded.engagementTypes &&
      this.dataLoaded.statuses
    ) {
      this._triggerGlobalEvent('engagements-filters-updated');

      this.dataLoaded.filters = true;
      this.dataLoaded.filterAuditors = false;
      this.dataLoaded.filterPartners = false;
    }
  }

  _triggerGlobalEvent(eventName, data?) {
    const detail = {detail: data};
    const event = new CustomEvent(eventName, detail);
    document.dispatchEvent(event);
  }

  _updateEngagementsFilters() {
    const time = new Date().getTime();

    const filterAuditorsEndpoint = getEndpoint('filterAuditors');
    filterAuditorsEndpoint.url += `?reload=${time}`;
    sendRequest({endpoint: filterAuditorsEndpoint})
      .then((resp) => this._filterAuditorsLoaded(resp))
      .catch((err) => this._filterAuditorsLoaded(err));

    const filterPartnersEndpoint = getEndpoint('filterPartners');
    filterPartnersEndpoint.url += `?reload=${time}`;
    sendRequest({endpoint: filterPartnersEndpoint})
      .then((resp) => this._filterPartnersLoaded(resp))
      .catch((err) => this._filterPartnersLoaded(err));
  }

  _partnersLoaded(details) {
    if (!details || details.error) {
      // TODO is .error ok?
      this._responseError('Partners', '', 'warn');
    } else {
      const partners = sortBy(details, ['name']);
      setStaticData('partners', partners);
    }
    this.dataLoaded.partners = true;
    this._checkAllDataLoaded();
  }

  _filterAuditorsLoaded(details) {
    if (!details || details.error) {
      this._responseError('Auditors', '');
    }
    const filterAuditors = details || details.results || [];
    if (this.dataLoaded.filters) {
      updateStaticData('filterAuditors', filterAuditors);
    } else {
      setStaticData('filterAuditors', filterAuditors);
    }

    this.dataLoaded.filterAuditors = true;
    this._filtersDataLoaded();
  }

  _filterPartnersLoaded(details) {
    if (!details || details.error) {
      this._responseError('Partners', '');
    }

    const filterPartners = details || [];
    if (this.dataLoaded.filters) {
      updateStaticData('filterPartners', filterPartners);
    } else {
      setStaticData('filterPartners', filterPartners);
    }

    this.dataLoaded.filterPartners = true;
    this._filtersDataLoaded();
  }

  _handleNewEngagementResponse(details) {
    const actions = details && details.actions;
    if (!details || details.error || !isValidCollection(actions)) {
      this._responseError('Engagement Permissions', details.error);
    } else {
      addToCollection('new_engagement', actions);

      const statuses = getChoices('new_engagement.status') || [];
      const engagementTypes = getChoices('new_engagement.engagement_type') || [];

      if (!statuses) {
        this._responseError('Statuses', 'Can not load engagement statuses data');
      }
      if (!engagementTypes) {
        this._responseError('Engagement types', 'Can not load engagement types data');
      }

      setStaticData('statuses', statuses);
      this.dataLoaded.statuses = true;
      setStaticData('engagementTypes', engagementTypes);
      this.dataLoaded.engagementTypes = true;
    }

    this.dataLoaded.engagementOptions = true;
    this._checkAllDataLoaded();
  }

  _handleStaffSCOptionsResponse(data) {
    const actions = get(data, 'actions') || {};
    const name = get(data, 'name', '');
    const collection = 'new_staff_sc';
    const dataName = 'staffSCPermissions';

    if (!collection || !dataName) {
      throw new Error('Please provide collection and dataName attributes');
    }

    addToCollection(collection, actions, name);
    this.dataLoaded[dataName] = true;
  }

  _atmOptionsResponse(data) {
    const actions = get(data, 'actions', {});
    const name = get(data, 'name', '');

    if (actions) {
      addToCollection(`new_engagement_attachments`, actions || {}, name);
      addToCollection(`new_staff_sc_attachments`, actions || {}, name);
    } else {
      this._responseError('Engagement Attachments Permissions', data && data.type);
    }

    this.dataLoaded.attachmentsOptions = true;
    this._checkAllDataLoaded();
  }

  _handleUsersResponse(details) {
    if (!details || details.error) {
      this._responseError('Users', '', 'warn');
    } else {
      setStaticData('users', details);
    }
    this.dataLoaded.users = true;
    this._checkAllDataLoaded();
  }

  _handleStaffUsersResponse(details) {
    if (!details || details.error) {
      // TODO check if field `error` exists on the error obj
      this._responseError('Staff Members Users', '', 'warn');
    } else {
      each(details, (user) => {
        user.full_name = user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'Unnamed User';
      });
      setStaticData('staffMembersUsers', details);
    }
    this.dataLoaded.staffUsers = true;
    this._checkAllDataLoaded();
  }

  _apDataResponse(details?, cacheKey?) {
    const collection = cacheKey; // the cacheKey on the endpoint

    if (!collection || !details) {
      return;
    }

    setStaticData(collection, details);
  }

  _responseError(message, type, eventType = 'error') {
    console[eventType](`Can not load initial data: ${message || '?'}. Reason: ${type || '?'}`);
  }
}

window.customElements.define('static-data', StaticData);
