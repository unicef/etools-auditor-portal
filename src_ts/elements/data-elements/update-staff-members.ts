import {PolymerElement} from "@polymer/polymer";
import {property} from "@polymer/decorators";
import cloneDeep from 'lodash-es/cloneDeep';
import { fireEvent } from "../utils/fire-custom-event.js";

class UpdateStaffMembers extends PolymerElement {
    // behaviors: [
    //     etoolsAppConfig.globals,
    //     EtoolsAjaxRequestBehavior
    // ],

    @property({type: Object, notify: true, observer: '_dataChanged'})
    staffData!: any;

    @property({type: Number})
    organisationId!: number;

    _dataChanged(data) {
        if (!data) { return; }
        if (!this.organisationId) { throw 'Organisation id is not provided!'; }
        if (!data.method || !data.data) { throw 'Method or data are missing!'}

        this.lastRequestData = cloneDeep(data);

        // this.method = data.method;
        // this.url = this.getEndpoint('staffMembers', {id: this.organisationId}).url + data.id;
        // this.postData = data.data;
        this.set('staffData', null);
        const options = {
            method: data.method,
            endpoint: {
                url: this.getEndpoint('staffMembers', {id: this.organisationId}).url + data.id
            },
            body: data.data
        }
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
window.customElements.define("update-staff-members", UpdateStaffMembers);
