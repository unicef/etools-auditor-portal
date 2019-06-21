import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class GetAttachments extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {

    @property({type: Number, notify: true, observer: '_baseIdChanged'})
    baseId!: number;

    @property({type: String})
    endpointName!: string;

    @property({type: Array, notify: true})
    attachments!: [];

    _handleResponse(detail) {
        this.attachments = detail && detail.results || [];
        fireEvent(this, 'attachments-loaded', {success: true});
    }

    _handleError() {
        fireEvent(this, 'attachments-loaded');
    }

    _baseIdChanged(baseId) {
        if (!baseId) { return; }
        let url = this.getEndpoint(this.endpointName, {id: baseId}).url;

        this.sendRequest({
            endpoint: {url}
        }).then(resp => {
           this._handleResponse(resp);
        }).catch(err => {
           this._handleError();
        });
    }
}
window.customElements.define("get-attachments", GetAttachments);
