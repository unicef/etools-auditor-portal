import {PolymerElement} from "@polymer/polymer";
import get from 'lodash-es/get';
import sortBy from 'lodash-es/sortBy';
import set from 'lodash-es/set';
import { fireEvent } from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import UserControllerMixin from '../../elements/app-mixins/user-controller-mixin';

class UserData extends EndpointsMixin(EtoolsAjaxRequestMixin(UserControllerMixin(PolymerElement))) {

    public connectedCallback() {
        super.connectedCallback();
        this.sendRequest({
            endpoint: this.getEndpoint('userProfile')
        }).then(resp => {
           this._handleResponse(resp);
        }).catch(err => {
            console.log(err)
            this._handleError(err);
        });
     }

    _handleResponse(user) {
        let previousUserId = JSON.parse(localStorage.getItem('userId') || '');
        let countriesAvailable = get(user, 'countries_available') || [];

        countriesAvailable = sortBy(countriesAvailable, ['name']);
        set(user, 'countries_available', countriesAvailable);

        if (!previousUserId || previousUserId !== user.user) {
            this.resetOldUserData();
        }

        localStorage.setItem('userId', user.user);

        this._setUserData(user);
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
