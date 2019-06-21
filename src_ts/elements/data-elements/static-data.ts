import { PolymerElement, html } from '@polymer/polymer';
import famEndpoints from '../app-config/endpoints';
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import PermissionControllerMixin from '../../elements/app-mixins/permission-controller-mixin';
import StaticDataMixin from '../../elements/app-mixins/static-data-mixin';
import get from 'lodash-es/get';
import each from 'lodash-es/each';
import sortBy from 'lodash-es/sortBy';
import invoke from 'lodash-es/invoke';
import { fireEvent } from '../utils/fire-custom-event';

let dataLoaded: {
  partners: boolean,
  engagementOptions: boolean,
  users: boolean,
  staffUsers: boolean,
  attachmentsOptions: boolean,
  filters: boolean,
  filterAuditors: boolean,
  filterPartners: boolean
};

class StaticData extends StaticDataMixin(PermissionControllerMixin(EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)))) {

  public static get template() {
    return html`
      <user-data></user-data>
    `;
  }

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
    let partnersEndpoint = famEndpoints.partnerOrganisations;
    this.sendRequest({
      endpoint: partnersEndpoint
      })
      .then(this._handleNewEngagementResponse.bind(this))
      .catch(this._handleNewEngagementResponse.bind(this));
  }

  getUsers() {
    let usersEndpoint = famEndpoints.users.url;
  }

  getStaffUsers() {
    let staffUsersEndpoint = famEndpoints.staffMembersUsers.url;
  }

  getOffices() {
    let officesEndpoint = famEndpoints.offices;
  }

  getSections() {
    let sectionsEndpoint = famEndpoints.sectionsCovered;
  }

  _getStaticDropdownData () {
    const reqOpts = {
        csrf: true,
        endpoint: famEndpoints.static
    };

    this.sendRequest(reqOpts).then(resp=> this._setData('staticDropdown', resp));
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
      .then(this._handleNewEngagementResponse.bind(this))
      .catch(this._handleNewEngagementResponse.bind(this));
  }

  getNewStaffSCOptions() {
      const options = {
          endpoint: famEndpoints.staffSCList,
          csrf: true,
          method: 'OPTIONS'
      }
      this.sendRequest(options)
        .then(this._handleStaffSCOptionsResponse.bind(this))
        .catch(this._handleStaffSCOptionsResponse.bind(this));
  }

  getAtmOptions() {
      const options = {
          endpoint: this.getEndpoint('attachments', {id: 'new'}),
          csrf: true,
          method: 'OPTIONS'
      }
      this.sendRequest(options)
        .then(this._atmOptionsResponse.bind(this))
        .catch(this._atmOptionsResponse.bind(this));
  }



  _allDataLoaded() {
    if (dataLoaded.partners &&
        dataLoaded.engagementOptions &&
        dataLoaded.users &&
        dataLoaded.staffUsers &&
        dataLoaded.attachmentsOptions) {
        fireEvent(this, 'static-data-loaded');
    }
  }

  _filtersDataLoaded() {
      if (dataLoaded.filterAuditors && dataLoaded.filterPartners) {
          this._triggerGlobalEvent('engagements-filters-updated');

          dataLoaded.filters = true;
          dataLoaded.filterAuditors = false;
          dataLoaded.filterPartners = false;
      }
  }

  _triggerGlobalEvent(eventName, data) {
      let detail = {detail: data};
      let event = new CustomEvent(eventName, detail);
      document.dispatchEvent(event);
  }

  _updateEngagementsFilters() {
    let time = new Date().getTime();

    this.filterAuditorsUrl = famEndpoints.filterAuditors.url + `?reload=${time}`;// TODO
    this.filterPartnersUrl = famEndpoints.filterPartners.url + `?reload=${time}`;// TODO
  }

  _partnersLoaded(event, details) {
    if (!details || details.error) {
        this._responseError('Partners', event && event.type, 'warn');
    } else {
        let partners = sortBy(details, ['name']);
        this._setData('partners', partners);
    }
    dataLoaded.partners = true;
    this._allDataLoaded();
  }

  _filterAuditorsLoaded(event, details) {
    if (!details || details.error) {
        this._responseError('Auditors', event && event.type);
    }
    let filterAuditors = details || details.results || [];
    if (dataLoaded.filters) {
        this._updateData('filterAuditors', filterAuditors);
    } else {
        this._setData('filterAuditors', filterAuditors);
    }

    dataLoaded.filterAuditors = true;
    this._filtersDataLoaded();
  }

  _filterPartnersLoaded(event, details) {
    if (!details || details.error) {
        this._responseError('Partners', event && event.type);
    }

    let filterPartners = details || [];
    if (dataLoaded.filters) {
        this._updateData('filterPartners', filterPartners);
    } else {
        this._setData('filterPartners', filterPartners);
    }

    dataLoaded.filterPartners = true;
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

        if (!statuses) { this._responseError('Statuses', 'Can not load engagement statuses data'); }
        if (!engagementTypes) { this._responseError('Engagement types', 'Can not load engagement types data'); }

        this._setData('statuses', statuses);
        this._setData('engagementTypes', engagementTypes);
    }

    dataLoaded.engagementOptions = true;
    this._allDataLoaded();
  }

  _handleStaffSCOptionsResponse(data) {
    let actions = get(data, 'actions') || {};
    let name = get(data, 'name', '');
    let collection = 'new_staff_sc';
    let dataName  = 'staffSCPermissions';

    if (!collection || !dataName) {
        throw new Error('Please provide collection and dataName attributes');
    }

    this._addToCollection(collection, actions, name);
    dataLoaded[dataName] = true;
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

    dataLoaded.attachmentsOptions = true;
    this._allDataLoaded();
  }

  _handleUsersResponse(event, details) {
    if (!details || details.error) {
        this._responseError('Users', event && event.type, 'warn');
    } else {
        each(details, (user) => {
            user.full_name = user.first_name || user.last_name ?
                    `${user.first_name} ${user.last_name}` :
                    'Unnamed User';
        });
        this._setData('users', details);
    }
    dataLoaded.users = true;
    this._allDataLoaded();
  }

  _handleStaffUsersResponse(event, details) {
      if (!details || details.error) {
          this._responseError('Staff Members Users', event && event.type, 'warn');
      } else {
          each(details, (user) => {
              user.full_name = user.first_name || user.last_name ?
                      `${user.first_name} ${user.last_name}` :
                      'Unnamed User';
          });
          this._setData('staffMembersUsers', details);
      }
      dataLoaded.staffUsers = true;
      this._allDataLoaded();
  }

  _apDataResponse(event, details) {
      let collection = invoke(event, 'srcElement.getAttribute', 'cache-key');

      if (!collection || !details) { return; }
      this._setData(collection, details);
  }

  _responseError(message, type, eventType = 'error') {
      console[eventType](`Can not load initial data: ${message || '?'}. Reason: ${type || '?'}`);
  }
}

window.customElements.define('static-data', StaticData);
