import {LitElement, PropertyValues, property, customElement} from 'lit-element';
import {getEndpoint} from '../config/endpoints-controller';
import {collectionExists, addToCollection} from '../mixins/permission-controller';
import {getUserData} from '../mixins/user-controller';
import {GenericObject} from '../../types/global';
import each from 'lodash-es/each';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

export function getStaffCollectionName(organisationId: number): string {
  return `staff_members_${organisationId}`;
}

/**
 * @customElement
 * @LitElement
 */
@customElement('get-staff-members-list')
export class GetStaffMembersList extends LitElement {
  @property({type: Number})
  organisationId!: number;

  @property({type: Object})
  queries!: GenericObject;

  @property({type: String})
  pageType = '';

  static get observers() {
    return ['_startRequest(organisationId, queries)'];
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('organisationId') || changedProperties.has('queries')) {
      this._startRequest(this.organisationId, this.queries);
    }
  }

  _startRequest(organisationId, listQueries) {
    if (!organisationId || !listQueries) {
      return;
    }

    fireEvent(this, 'loading-state-changed', {state: true});

    Promise.all([this.getDataRequest(organisationId, listQueries), this.getOptionsRequest(organisationId, listQueries)])
      .then(([data]) => fireEvent(this, 'data-loaded', data))
      .catch((error) => {
        const responseData = error?.request?.detail?.request?.xhr;
        EtoolsLogger.error(responseData);
      })
      .finally(() => fireEvent(this, 'loading-state-changed', {state: false}));
  }

  private getDataRequest(organisationId: number, listQueries: GenericObject) {
    const queriesString = this.prepareQueries(listQueries);
    const options = {
      method: 'GET',
      endpoint: {url: getEndpoint('staffMembers', {id: organisationId}).url + queriesString}
    };
    return sendRequest(options);
  }

  private prepareQueries(listQueries) {
    const queries: string[] = [];
    each(listQueries, (value, key) => {
      if (key !== 'search' || !!value) {
        queries.push(`${key}=${value}`);
      }
    });
    const profile = getUserData() as any;
    const countryFilter = this.pageType.includes('staff')
      ? `user__profile__countries_available__name=${profile.country.name}`
      : '';
    return `?ordering=-id&${countryFilter}&${queries.join('&')}`;
  }

  private async getOptionsRequest(organisationId, params): Promise<void> {
    const collectionName: string = getStaffCollectionName(organisationId);
    if (collectionExists(collectionName)) {
      return Promise.resolve();
    }
    const options = {
      method: 'OPTIONS',
      endpoint: getEndpoint('staffMembers', {id: organisationId}),
      params
    };
    try {
      const {actions} = await sendRequest(options);
      if (!actions) {
        throw new Error();
      }
      addToCollection(collectionName, actions);
    } catch (e) {
      EtoolsLogger.error('Can not load permissions for engagement');
    }
  }
}
