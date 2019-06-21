import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class GetActionPoints extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {
    // behaviors: [
    //     etoolsAppConfig.globals,
    //     APBehaviors.PermissionController,
    //     EtoolsAjaxRequestBehavior
    // ],

    @property({type: Number, notify: true, observer: '_engagementIdChanged'})
    engagementId!: number;

    @property({type: Array, notify: true})
    actionPoints!: [];

    _handleResponse(data) {
        this.actionPoints = data.length && data || [];
        fireEvent(this, 'ap-loaded', {success: true});
    }

    _handleError() {
        fireEvent(this, 'ap-loaded');
    }

    _engagementIdChanged(engagementId) {
        if (!engagementId) { return; }
        let apBaseUrl = this.getEndpoint('engagementInfo', {id: engagementId, type: 'engagements'}).url;
        let url = `${apBaseUrl}action-points/?page_size=all`;

        this._getActionPoints(url);
    }

    _getActionPoints(url) {
        const requestOptions = {
            endpoint: {
                url,
            }
        };
        
        this.sendRequest(requestOptions)
            .then(resp => this._handleResponse(resp))
            .catch((err => this._handleError()));
    }
}
window.customElements.define("get-action-points", GetActionPoints);