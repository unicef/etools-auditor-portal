import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

class UpdateStaffMembers extends PolymerElement {
  @property({type: Object, observer: '_dataChanged'})
  staffData!: GenericObject;

  @property({type: Number})
  organisationId!: number;

  _dataChanged(data) {
    if (!data) {
      return;
    }
    if (!this.organisationId) {
      throw new Error('Organisation id is not provided!');
    }
    if (!data.method || !data.data) {
      throw new Error('Method or data are missing!');
    }

    const options = {
      method: data.method,
      endpoint: {
        url: getEndpoint('staffMembers', {id: this.organisationId}).url + data.id
      },
      body: data.data
    };
    sendRequest(options)
      .then((resp) => this._handleResponse(resp, data))
      .catch((err) => this._handleError(err));
  }

  _handleResponse(detail, requestData) {
    fireEvent(this, 'staff-updated', {
      action: requestData.method.toLowerCase(),
      data: detail,
      hasAccess: requestData.data.hasAccess,
      index: requestData.staffIndex
    });
  }

  _handleError(error) {
    let {status, response} = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    fireEvent(this, 'staff-updated', {error: true, errorData: response, status: status});
  }
}
window.customElements.define('update-staff-members', UpdateStaffMembers);
