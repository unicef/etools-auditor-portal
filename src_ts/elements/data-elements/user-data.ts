import {PolymerElement} from "@polymer/polymer/polymer-element";
import get from 'lodash-es/get';
import sortBy from 'lodash-es/sortBy';
import set from 'lodash-es/set';
import {fireEvent} from "../utils/fire-custom-event.js";
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {setUserData} from '../../elements/app-mixins/user-controller';
import {resetOldUserData} from '../app-config/config.js';
import famEndpoints from '../app-config/endpoints.js';

class UserData extends EtoolsAjaxRequestMixin(PolymerElement) {

  public connectedCallback() {
    super.connectedCallback();

    this.sendRequest({
      endpoint: famEndpoints.userProfile
    }).then(resp => {
      this._handleResponse(resp);
    }).catch(err => {
      console.log(err)
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
      console.error('Can\'t load user data');
    }
  }

}
window.customElements.define("user-data", UserData);
