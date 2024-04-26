import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global';
import each from 'lodash-es/each';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../redux/store';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsUser} from '@unicef-polymer/etools-types/dist/user.types';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @customElement
 * @LitElement
 */
@customElement('get-staff-members-list')
export class GetStaffMembersList extends connect(store)(LitElement) {
  @property({type: Number})
  organizationId!: number;

  @property({type: Object})
  queries!: GenericObject;

  @property({type: String})
  pageType = '';

  @property({type: Object})
  user!: EtoolsUser;

  stateChanged(state: RootState) {
    if (state.user?.data && !isJsonStrMatch(state.user.data, this.user)) {
      this.user = state.user.data;
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('organizationId') || changedProperties.has('queries')) {
      this._startRequest(this.organizationId, this.queries);
    }
  }

  _startRequest(organizationId, listQueries) {
    if (!organizationId || isNaN(parseInt(organizationId)) || !listQueries) {
      return;
    }

    fireEvent(this, 'loading-state-changed', {state: true});

    Promise.all([this.getDataRequest(organizationId, listQueries)])
      .then(([data]) => fireEvent(this, 'data-loaded', data))
      .catch((error) => {
        // request aborted, prevent showing toast errors
        if (error.status === 0) {
          return;
        }

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

    const countryFilter = this.pageType.includes('staff')
      ? `user__profile__countries_available__name=${this.user.country.name}`
      : '';
    return `?ordering=-id&${countryFilter}&${queries.join('&')}`;
  }
}
