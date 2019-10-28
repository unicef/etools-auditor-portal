import {PolymerElement} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators';
import cloneDeep from 'lodash-es/cloneDeep';
import {fireEvent} from '../utils/fire-custom-event.js';
import {getEndpoint} from '../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import {GenericObject} from '../../types/global.js';

class UpdateStaffMembers extends EtoolsAjaxRequestMixin(PolymerElement) {

  @property({type: Object, notify: true, observer: '_dataChanged'})
  staffData!: GenericObject;

  @property({type: Number})
  organisationId!: number;

  @property({type: Object})
  lastRequestData!: GenericObject;

  _dataChanged(data) {
    if (!data) {return;}
    if (!this.organisationId) {throw new Error('Organisation id is not provided!');}
    if (!data.method || !data.data) {throw new Error('Method or data are missing!');}

    this.lastRequestData = cloneDeep(data);

    // this.method = data.method;
    // this.url = getEndpoint('staffMembers', {id: this.organisationId}).url + data.id;
    // this.postData = data.data;
    this.set('staffData', null);
    const options = {
      method: data.method,
      endpoint: {
        url: getEndpoint('staffMembers', {id: this.organisationId}).url + data.id
      },
      body: data.data
    };
    this.sendRequest(options)
      .then(resp => this._handleResponse(resp))
      .catch(err => this._handleError(err));
  }

  _handleResponse(detail) {
    fireEvent(this, 'staff-updated', {
      action: this.lastRequestData.method.toLowerCase(),
      data: detail,
      hasAccess: this.lastRequestData.data.hasAccess,
      index: this.lastRequestData.staffIndex
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
