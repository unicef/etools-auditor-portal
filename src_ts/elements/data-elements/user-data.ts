import {PolymerElement} from '@polymer/polymer/polymer-element';
import get from 'lodash-es/get';
import sortBy from 'lodash-es/sortBy';
import set from 'lodash-es/set';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {setUserData} from '../mixins/user-controller';
import {resetOldUserData} from '../config/config';
import famEndpoints from '../config/endpoints.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

class UserData extends PolymerElement {
  public connectedCallback() {
    super.connectedCallback();

    sendRequest({
      endpoint: famEndpoints.userProfile
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch((err) => {
        EtoolsLogger.error(err);
        this._handleError(err);
      });
  }

  _handleResponse(user) {
    const storedUserId = localStorage.getItem('userId');
    const previousUserId = storedUserId ? JSON.parse(storedUserId) : null;
    let countriesAvailable = get(user, 'countries_available') || [];

    countriesAvailable = sortBy(countriesAvailable, ['name']);
    set(user, 'countries_available', countriesAvailable);

    if (!previousUserId || previousUserId !== user.user) {
      resetOldUserData();
    }

    localStorage.setItem('userId', user.user);

    setUserData(user);
    fireEvent(this, 'user-profile-loaded');
  }

  _handleError(err) {
    if (err.status === 403) {
      window.location.href = window.location.origin + '/';
    } else {
      EtoolsLogger.error("Can't load user data");
    }
  }
}
window.customElements.define('user-data', UserData);
