import {PolymerElement} from "@polymer/polymer";
import {property} from "@polymer/decorators";
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';

class UpdateAgreementData extends EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement)) {

    @property({type: String, observer: '_dateChanged'})
    newDate!: string;

    @property({type: Object, notify: true})
    agreement!: any;

    @property({type: Boolean, notify: true})
    poUpdating: boolean = false;

    @property({type: Object, notify: true})
    errors!: {};

    _dateChanged(date) {
        date = date || null;
        if (!this.agreement || !this.agreement.id || this.agreement.contract_end_date === date) { return; }

        this.poUpdating = true;
        let url = this.getEndpoint('purchaseOrder', {id: this.agreement.id}).url;
        this.sendRequest({
            method: 'PATCH',
            endpoint: {url},
            body: {contract_end_date: date}
        }).then(resp => {
           this._handleResponse(resp);
        }).catch(err => {
            this._handleError(err);
        });
    }

    _handleResponse(detail) {
        this.poUpdating = false;
        this.agreement = detail;
    }

    _handleError(error) {
        this.poUpdating = false;

        let {status, response} = (error || {}) as any;
        if (typeof response === 'string') {
            try {
                response = JSON.parse(response);
            } catch (e) {
                response = {};
            }
        }

        this.set('errors', response);
    }
}
window.customElements.define("update-agreement-data", UpdateAgreementData);
