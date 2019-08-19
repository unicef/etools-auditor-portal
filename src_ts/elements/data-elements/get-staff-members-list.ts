import {PolymerElement, html} from "@polymer/polymer";
import '@polymer/app-route/app-route.js';
import '@polymer/app-route/app-location.js';
import '@unicef-polymer/etools-ajax/etools-ajax';
import {property} from "@polymer/decorators";
import get from 'lodash-es/get';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {collectionExists, addToCollection} from '../app-mixins/permission-controller';
import {getUserData} from '../../elements/app-mixins/user-controller';
import {GenericObject} from "../../types/global";
import each from 'lodash-es/each';


/**
 * @customElement
 * @polymer
 * @appliesMixin EtoolsAjaxRequestMixin
 */

class GetStaffMembersList extends EtoolsAjaxRequestMixin(PolymerElement) {
  static get template() {
    return html`
      <app-location
          route="{{route}}">
      </app-location>

      <app-route
          route="{{route}}"
          pattern="/:view/:page"
          data="{{routeData}}">
      </app-route>

      <etools-ajax
          method="GET"
          url="{{url}}"
          on-success="_handleDataResponse"
          on-fail="_handleError">
      </etools-ajax>
    `;
  }

  @property({type: Number, notify: true})
  organisationId!: number;

  @property({type: Object, notify: true})
  queries!: GenericObject;

  @property({type: Object, notify: true})
  dataItems!: {};

  @property({type: Boolean, notify: true})
  listLoading: boolean = false;

  @property({type: Number, notify: true, observer: '_partnerIdChanged'})
  partnerId!: number | null;

  @property({type: Number, notify: true})
  datalength!: number;

  @property({type: Object})
  requestsCompleted: GenericObject = {};

  @property({type: String, notify: true})
  staffsBase: string = '';

  @property({type: Object})
  responseData!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: String})
  url!: string | null;

  static get observers() {
    return [
      '_startRequest(organisationId, queries)'
    ];
  }

  _startRequest(organisationId, listQueries) {
    if (!organisationId || !listQueries) {return;}

    this.listLoading = true;
    let queriesString = this._prepareQueries(listQueries);

    this.requestsCompleted = {};
    this.url = getEndpoint('staffMembers', {id: organisationId}).url + queriesString;
    if (collectionExists(`staff_members_${organisationId}`)) {
      this.requestsCompleted.options = true;
    } else {
      this._getOptions(organisationId, listQueries);
    }
  }

  _getOptions(organisationId, params) {
    const options = {
      method: 'OPTIONS',
      endpoint: getEndpoint('staffMembers', {id: organisationId}),
      params
    };
    this.sendRequest(options)
      .then(this._handleOptionsResponse.bind(this))
      .catch(this._handleOptionsResponse.bind(this))
  }

  _prepareQueries(listQueries) {
    let queries: string[] = [];
    each(listQueries, (value, key) => {
      if (key !== 'search' || !!value) {
        queries.push(`${key}=${value}`);
      }

    });

    const profile = getUserData() as any;
    const countryFilter = get(this.routeData, 'page', '').includes('staff') ? `user__profile__countries_available__name=${profile.country.name}` : '';
    return `?ordering=-id&${countryFilter}&${queries.join('&')}`;
  }

  _handleDataResponse(data) {
    this.responseData = data.detail;
    this.requestsCompleted.data = true;
    this._handleResponse(this.responseData);
  }

  _handleOptionsResponse(data) {
    let actions = data && data.actions;
    if (actions) {
      addToCollection(`staff_members_${this.organisationId}`, actions);
    } else {
      console.error('Can not load permissions for engagement');
    }

    this.requestsCompleted.options = true;
    this._handleResponse(this.responseData);
  }

  _handleResponse(data) {
    if (!this.requestsCompleted.data || !this.requestsCompleted.options) {return;}

    this.dataItems = data.results;
    if (this.queries && !this.queries.search) {
      this.datalength = data.count;
    }
    this.listLoading = false;
    this.url = null;
    this.staffsBase = `staff_members_${this.organisationId}`;
  }

  _handleError(event, error) {
    let responseData = error && error.request && error.request.detail &&
      error.request.detail.request && error.request.detail.request.xhr;
    console.error(responseData);
    this.listLoading = false;
    this.url = null;
  }
}
window.customElements.define("get-staff-members-list", GetStaffMembersList);
