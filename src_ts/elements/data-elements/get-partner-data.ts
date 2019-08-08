import { PolymerElement } from "@polymer/polymer/polymer-element";
import { property } from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import clone from 'lodash-es/clone';
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import StaticDataMixin from '../../elements/app-mixins/static-data-mixin';
import { GenericObject } from "../../types/global.js";

class GetPartnerData extends StaticDataMixin(EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement))) {

    @property({type: Number, notify: true, observer: '_partnerIdChanged'})
    partnerId!: number | null;

    @property({type: Object, notify: true})
    partner!: GenericObject;

    @property({type: Object})
    lastData!: GenericObject;

    @property({type: Boolean})
    lastError?: boolean;

    @property({type: Number})
    lastNumber?: number;

    _handleResponse(detail) {
        if (!detail || !detail.id) {
            this._handleError();
            return;
        }
        this.lastData = clone(detail);
        let officers = this.getData(`officers_${detail.id}`);
        if (officers) {
            this.lastData.partnerOfficers = officers;
            this.finishRequest();
        } else {
            this.sendRequest({
                endpoint: {url: this.getEndpoint('authorizedOfficers', {id: detail.id}).url}
            }).then(resp => {
                this._handleOfficersResponse(resp);
            }).catch(err => {
                this._handleOfficersError();
            });
        }
    }

    _handleOfficersResponse(detail) {
        if (!detail) {
            this._handleOfficersError();
        } else {
            let activePartnerOfficers = detail.filter((officer) => {
                return officer && officer.active;
            });
            activePartnerOfficers = activePartnerOfficers.map((officer) => {
                let partnerOfficer = clone(officer);
                partnerOfficer.fullName = `${partnerOfficer.first_name} ${partnerOfficer.last_name}`;
                return partnerOfficer;
            });
            this._setData(`officers_${this.lastData.id}`, activePartnerOfficers);
            this.lastData.partnerOfficers = activePartnerOfficers;
            this.finishRequest();
        }
    }

    finishRequest() {
        this.partner = clone(this.lastData);
        fireEvent(this, 'partner-loaded', {success: true});

        let partnerDataId = `partner_${this.partner.id}`,
            partner = this.getData(partnerDataId);
        if (!partner) {
            this._setData(partnerDataId, this.partner);
        }
    }

    _handleOfficersError() {
        console.error('Can not load partner officers!');
        this.finishRequest();
    }

    _handleError() {
        this.lastError = true;
        fireEvent(this, 'partner-loaded');
    }

    _partnerIdChanged(partnerId) {
        if (!partnerId) { return; }
        if (partnerId === this.lastNumber) {
            this.partnerId = null;
            let detail = clone(this.lastData)
            this.lastError ? this._handleError() : this._handleResponse(detail);
            return;
        }

        this.lastError = false;
        this.lastNumber = partnerId;

        let partner = this.getData(`partner_${partnerId}`);
        if (partner) {
            this._handleResponse(partner);
        } else {
            this.sendRequest({
                endpoint: {url: this.getEndpoint('partnerInfo', {id: partnerId}).url}
            }).then(resp => {
                this._handleResponse(resp);
            }).catch(err => {
                this._handleError();
            });
        }

        this.partnerId = null;
    }
}
window.customElements.define("get-partner-data", GetPartnerData);
