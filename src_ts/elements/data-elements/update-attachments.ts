import {PolymerElement} from "@polymer/polymer";
import {property} from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import findIndex from 'lodash-es/findIndex';
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import { GenericObject } from "../../types/global.js";

class UpdateAttachments extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {

    @property({type: String, observer: '_requestDataChanged'})
    requestData!: string;

    @property({type: Array, notify: true})
    attachments!: [];

    @property({type: Object, notify: true})
    errors!: GenericObject;

    @property({type: Number})
    baseId!: number;

    @property({type: String})
    endpointName!: string;

    @property({type: Object, notify: true})
    requestOptions!: GenericObject;

    @property({type: String})
    method!: string;

    @property({type: Object})
    postData!: GenericObject;

    _requestDataChanged(data = {}) {
        let {method, attachmentData} = data as any;
        if (!method || !attachmentData || !this.baseId) {
            return;
        }

        let url = this.getEndpoint(this.endpointName, {id: this.baseId}).url;
        if (attachmentData.id) {
            url += `${attachmentData.id}/`;
        }
        this.postData = attachmentData;
        this.method = method;

        let options = {
            method: method,
            endpoint: {url},
            body: attachmentData,
            multiPart: true,
            prepareMultipartData: true
        };
        this.sendRequest(options)
            .then((resp) => {
                this._handleResponse(resp);
            }).catch((error) => {
               this._handleError(error);
        });
    }

    _handleResponse(detail) {
        let deleteRequest = this.method === 'DELETE';
        let id = deleteRequest ? this.postData.id : detail.id;

        let index = findIndex(this.attachments, (item: any) => item.id === id);


        if (deleteRequest && ~index) {
            this.splice('attachments', index, 1);
        } else if (~index) {
            this.splice('attachments', index, 1, detail);
        } else if (!deleteRequest) {
            this.push('attachments', detail);
        }

        fireEvent(this, 'attachments-request-completed', {success: true});
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
        fireEvent(this, 'attachments-request-completed');
    }
}
window.customElements.define("update-attachments", UpdateAttachments);
