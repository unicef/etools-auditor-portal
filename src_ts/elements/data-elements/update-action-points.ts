import {PolymerElement} from "@polymer/polymer";
import {property} from "@polymer/decorators";
import findIndex from 'lodash-es/findIndex';
import { fireEvent } from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class UpdateActionPoints extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {

    @property({type: String, observer: '_dataChanged'})
    requestData!: string;

    @property({type: Array, notify: true})
    actionPoints!: [];

    @property({type: Boolean, notify: true})
    requestInProcess!: boolean;

    @property({type: Object, notify: true})
    errors!: {};

    @property({type: Number})
    engagementId!: number;

    _dataChanged(data = {}) {
        let {method, apData, complete} = data as any;
        if (!method || !apData) {
            return;
        }

        let apBaseUrl = this.getEndpoint('engagementInfo', {id: this.engagementId, type: 'engagements'}).url,
                url = `${apBaseUrl}action-points/`;

        if (apData.id) { url += `${apData.id}/` }
        if (complete) { url += 'complete/'; }

        this._sendUpdateRequest(url, apData, method);
    }

    _sendUpdateRequest(url, body, method) {
        const requestOptions = {
            method: method,
            endpoint: {
                url
            },
            body
        };

        this.sendRequest(requestOptions)
            .then(resp => this._handleResponse(resp))
            .catch(err => this._handleError(err));
    }

    _handleResponse(detail) {
        let index = findIndex(this.actionPoints, (item: any) => item.id === detail.id);

        if (~index) {
            this.splice('actionPoints', index, 1, detail);
        } else {
            this.push('actionPoints', detail);
        }

        fireEvent(this, 'ap-request-completed', {success: true});
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

        this.set('errors', response);
        fireEvent(this, 'ap-request-completed');
    }

 }
window.customElements.define("update-action-points", UpdateActionPoints);
