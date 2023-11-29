import {AnyObject, EtoolsUser} from '@unicef-polymer/etools-types';
import famEndpoints from '../config/endpoints.js';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {store} from '../../redux/store';
import {updateUserData} from '../../redux/actions/user';

export function getCurrentUser() {
  return sendRequest({
    endpoint: famEndpoints.userProfile
  })
    .then((response: EtoolsUser) => {
      store.dispatch(updateUserData(response));

      return response;
    })
    .catch((error: AnyObject) => {
      if ([403, 401].includes(error.status)) {
        window.location.href = window.location.origin + '/login';
      }
      throw error;
    });
}
