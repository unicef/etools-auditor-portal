import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import clone from 'lodash-es/clone';
import {getEndpoint} from '../config/endpoints-controller';
import {GenericObject} from '../../types/global';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('get-partner-data')
export class GetPartnerData extends LitElement {
  @property({type: Number})
  partnerId!: number | null;

  @property({type: Array})
  cachedPartners: GenericObject[] = [];

  lastLoadedPartner!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('partnerId')) {
      this._partnerIdChanged(this.partnerId);
    }
  }

  _handleResponse(detail) {
    if (!detail || !detail.id) {
      this._handleError();
      return;
    }
    this.lastLoadedPartner = detail;
    sendRequest({
      endpoint: {url: getEndpoint('authorizedOfficers', {id: detail.id}).url}
    })
      .then((resp) => {
        this._handleOfficersResponse(resp);
      })
      .catch(() => {
        this._handleOfficersError();
      });
  }

  _handleOfficersResponse(detail) {
    if (!detail) {
      this._handleOfficersError();
    } else {
      const prefixedPartnerOfficers = detail.map((officer) => {
        const partnerOfficer = clone(officer);
        partnerOfficer.fullName = `${
          !partnerOfficer.active ? '[Inactive]' : !partnerOfficer.has_active_realm ? '[No Access]' : ''
        }${partnerOfficer.first_name} ${partnerOfficer.last_name}`;
        return partnerOfficer;
      });
      this.lastLoadedPartner.partnerOfficers = prefixedPartnerOfficers;
      this.cachedPartners.push(clone(this.lastLoadedPartner));
      this.finishRequest(clone(this.lastLoadedPartner));
    }
  }

  finishRequest(partner: GenericObject) {
    fireEvent(this, 'partner-loaded', partner);
  }

  _partnerIdChanged(partnerId) {
    if (!partnerId) {
      return;
    }
    this.lastLoadedPartner = {};
    const cachedPartner = this.cachedPartners.find((partner) => String(partner.id) === String(partnerId));
    if (cachedPartner) {
      this.finishRequest(clone(cachedPartner));
      return;
    }

    sendRequest({
      endpoint: {url: getEndpoint('partnerInfo', {id: partnerId}).url}
    })
      .then((resp) => {
        this._handleResponse(resp);
      })
      .catch(() => {
        this._handleError();
      });
  }

  _handleOfficersError() {
    EtoolsLogger.error('Can not load partner officers!');
    this.finishRequest(clone(this.lastLoadedPartner));
  }

  _handleError() {
    fireEvent(this, 'partner-loaded');
  }
}
