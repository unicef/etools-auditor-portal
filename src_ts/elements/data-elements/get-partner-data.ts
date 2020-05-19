import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';
import clone from 'lodash-es/clone';
import {getEndpoint} from '../app-config/endpoints-controller';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getStaticData, setStaticData} from '../app-mixins/static-data-controller';
import {GenericObject} from '../../types/global';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';

class GetPartnerData extends PolymerElement {

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
    const officers = getStaticData(`officers_${detail.id}`);
    if (officers) {
      this.lastData.partnerOfficers = officers;
      this.finishRequest();
    } else {
      sendRequest({
        endpoint: {url: getEndpoint('authorizedOfficers', {id: detail.id}).url}
      }).then((resp) => {
        this._handleOfficersResponse(resp);
      }).catch(() => {
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
        const partnerOfficer = clone(officer);
        partnerOfficer.fullName = `${partnerOfficer.first_name} ${partnerOfficer.last_name}`;
        return partnerOfficer;
      });
      setStaticData(`officers_${this.lastData.id}`, activePartnerOfficers);
      this.lastData.partnerOfficers = activePartnerOfficers;
      this.finishRequest();
    }
  }

  finishRequest() {
    this.partner = clone(this.lastData);
    fireEvent(this, 'partner-loaded', {success: true});

    const partnerDataId = `partner_${this.partner.id}`;
    const partner = getStaticData(partnerDataId);
    if (!partner) {
      setStaticData(partnerDataId, this.partner);
    }
  }

  _handleOfficersError() {
    logError('Can not load partner officers!');
    this.finishRequest();
  }

  _handleError() {
    this.lastError = true;
    fireEvent(this, 'partner-loaded');
  }

  _partnerIdChanged(partnerId) {
    if (!partnerId) {return;}
    if (partnerId === this.lastNumber) {
      this.partnerId = null;
      const detail = clone(this.lastData);
      this.lastError ? this._handleError() : this._handleResponse(detail);
      return;
    }

    this.lastError = false;
    this.lastNumber = partnerId;

    const partner = getStaticData(`partner_${partnerId}`);
    if (partner) {
      this._handleResponse(partner);
    } else {
      sendRequest({
        endpoint: {url: getEndpoint('partnerInfo', {id: partnerId}).url}
      }).then((resp) => {
        this._handleResponse(resp);
      }).catch(() => {
        this._handleError();
      });
    }

    this.partnerId = null;
  }
}
window.customElements.define('get-partner-data', GetPartnerData);
