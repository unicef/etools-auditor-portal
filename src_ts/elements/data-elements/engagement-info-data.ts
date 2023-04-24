import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';
import {getEndpoint} from '../config/endpoints-controller';
import {addToCollection, collectionExists} from '../mixins/permission-controller';
import LastCreatedMixin from '../mixins/last-created-mixin';
import EngagementMixin from '../mixins/engagement-mixin';
import {GenericObject} from '../../types/global';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * @polymer
 * @customElement
 * @appliesMixin LastCreatedMixin
 * @appliesMixin EngagementMixin
 */
class EngagementInfoData extends LastCreatedMixin(EngagementMixin(PolymerElement)) {
  // ts-@ignore
  @property({type: Number, notify: true, observer: '_idChanged'})
  engagementId: number | null = null;

  @property({type: String})
  engagementType!: string;

  @property({type: Object, notify: true, observer: '_setToResponse'})
  engagementInfo!: GenericObject;

  @property({type: Number})
  lastId!: number;

  @property({type: Object})
  requestsCompleted: GenericObject = {};

  @property({type: Object})
  reportAtmOptions = {
    postfix: 'report_attachments',
    requestName: 'reportAttachments'
  };

  @property({type: Object})
  atmOptions = {
    postfix: 'attachments',
    requestName: 'attachments'
  };

  @property({type: Object})
  responseData!: GenericObject;

  @property({type: Boolean})
  lastError?: boolean;

  _handleDataResponse(data) {
    this.responseData = data;
    this.requestsCompleted.data = true;
    this._finishRequests(this.responseData || {});
  }

  _handleOptionsResponse(data) {
    const actions = get(data, 'actions', null);
    if (actions) {
      addToCollection(`engagement_${this.engagementId}`, actions);
    } else {
      EtoolsLogger.error('Can not load permissions for engagement');
    }

    this.requestsCompleted.options = true;
    this._finishRequests(this.responseData || {});
  }

  _handleDataOptionsResponse(data, params) {
    const actions = get(data, 'actions', {});
    const name = get(data, 'name', '');
    this._handleEngagementOptions(params, actions, name);
  }

  _handleEngagementOptions({postfix, requestName}, actions, name) {
    addToCollection(`engagement_${this.engagementId}_${postfix}`, actions, name);
    this.requestsCompleted[requestName] = true;
    this._finishRequests(this.responseData || {});
  }

  _finishRequests(data) {
    if (
      !this.requestsCompleted.data ||
      !this.requestsCompleted.apOptions ||
      !this.requestsCompleted.options ||
      !this.requestsCompleted.attachments ||
      !this.requestsCompleted.reportAttachments
    ) {
      return;
    }

    if (data) {
      this.engagementInfo = data;
    }

    fireEvent(this, 'global-loading', {type: 'engagement-info'});
    fireEvent(this, 'engagement-info-loaded');
    this.persistCurrentEngagement(data, this.engagementType);
    this.engagementId = null;
    this.lastError = false;
  }

  _handleError() {
    fireEvent(this, 'global-loading', {type: 'engagement-info'});
    fireEvent(this, '404', {message: 'Partner not found!'});
    this.engagementId = null;
    this.lastError = true;
  }

  _handleOptionsError(error, params) {
    if (error.status === 403) {
      this._handleEngagementOptions(params, {}, '');
    }
  }

  _setToResponse(engagement) {
    if (engagement && engagement.id && !isEqual(this.responseData, engagement)) {
      this.responseData = engagement;
    }
  }

  _makeOptionsRequest(params, endpoint) {
    const options = {
      method: 'OPTIONS',
      endpoint
    };
    sendRequest(options)
      .then((resp) => this._handleDataOptionsResponse(resp, params))
      .catch((error) => this._handleOptionsError(error, params));
  }

  _idChanged(id) {
    if (!id || isNaN(id) || !this.engagementType) {
      return;
    }

    if (+id === this.lastId) {
      this.lastError ? this._handleError() : this._finishRequests(this.responseData || {});
      return;
    }

    this.lastId = id;
    this.engagementInfo = {};
    this.requestsCompleted = {};

    fireEvent(this, 'global-loading', {message: 'Loading engagement data...', active: true, type: 'engagement-info'});

    const apBaseUrl = getEndpoint('engagementInfo', {id: id, type: 'engagements'}).url;
    this._makeOptionsRequest(
      {
        postfix: 'ap',
        requestName: 'apOptions'
      },
      {url: `${apBaseUrl}action-points/`}
    );

    this._makeOptionsRequest(
      {
        postfix: 'attachments',
        requestName: 'attachments'
      },
      getEndpoint('attachments', {id: id})
    );

    this._makeOptionsRequest(
      {
        postfix: 'report_attachments',
        requestName: 'reportAttachments'
      },
      getEndpoint('reportAttachments', {id: id})
    );

    const lastCreated = this.getLastEngagementData(id);
    // load engagement info if it was just created
    if (lastCreated) {
      this._handleDataResponse(lastCreated);
      this._requestOptions(id);
      return;
    }

    // otherwise fetch info

    this._getEngagementInfo(id);

    if (collectionExists(`engagement_${id}`)) {
      this.requestsCompleted.options = true;
    } else {
      this._requestOptions(id);
    }
  }

  _getEngagementInfo(id) {
    const options = {
      endpoint: getEndpoint('engagementInfo', {id, type: this.engagementType})
    };
    sendRequest(options).then(this._handleDataResponse.bind(this)).catch(this._handleError.bind(this));
  }

  _requestOptions(id) {
    const options = {
      method: 'OPTIONS',
      endpoint: getEndpoint('engagementInfo', {id, type: this.engagementType})
    };
    sendRequest(options).then(this._handleOptionsResponse.bind(this)).catch(this._handleOptionsResponse.bind(this));
  }
}
window.customElements.define('engagement-info-data', EngagementInfoData);
