import {LitElement, PropertyValues, property, customElement} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import get from 'lodash-es/get';
import {getEndpoint} from '../config/endpoints-controller';
import {updateCollection} from '../mixins/permission-controller';
import {GenericObject} from '@unicef-polymer/etools-types';
import {EtoolsRequestConfig, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('update-engagement')
export class UpdateEngagement extends LitElement {
  @property({type: Object})
  updatedEngagementData!: GenericObject;

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Boolean})
  quietAdding!: boolean;

  @property({type: Object})
  errorObject = {};

  @property({type: Object})
  optionRequests: GenericObject = {};

  @property({type: Boolean})
  forceOptionsUpdate!: boolean;

  @property({type: Object})
  requestOptions!: EtoolsRequestConfig;

  @property({type: Object})
  postData!: GenericObject;

  @property({type: String})
  actionUrl = '';

  @property({type: Object})
  lastData!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('updatedEngagementData')) {
      this._engagementChanged(this.updatedEngagementData);
    }
  }

  _handleResponse(data) {
    if (this.requestOptions.method === 'POST' || this.forceOptionsUpdate) {
      this.lastData = data;
      this.forceOptionsUpdate = false;
      fireEvent(this, 'force-options-changed', this.forceOptionsUpdate);
      this._finishPostResponse();
      return;
    } else if (this.actionUrl) {
      const engagement = data || {};
      this._engagementChanged(engagement);
      return;
    }
    this.finishResponse(data);
  }

  _handleOptionsResponse(data) {
    const collectionName = `engagement_${this.lastData.id}`;
    updateCollection(collectionName, data.actions);

    this.optionRequests.options = true;
    this.finishOptionsResponse(this.lastData);
  }

  _handleDataOptionsResponse(postfix, requestName) {
    return (data) => {
      const actions = get(data, 'actions', {});
      const name = get(data, 'name', '');
      // postfix = _.get(data, 'srcElement.dataset.pathPostfix'),
      // requestName = _.get(data, 'srcElement.dataset.requestName');

      const collectionName = `engagement_${this.lastData.id}_${postfix}`;
      updateCollection(collectionName, actions || {}, name);
      this[requestName] = '';

      this.optionRequests[requestName] = true;
      this.finishOptionsResponse(this.lastData);
    };
  }

  finishOptionsResponse(data) {
    if (
      !this.optionRequests.options ||
      !this.optionRequests.apOptions ||
      !this.optionRequests.attachments ||
      !this.optionRequests.reportAttachments
    ) {
      return;
    }

    this.finishResponse(data);
  }

  finishResponse(data) {
    this.optionRequests = {};
    this.engagement = data;

    this.basePermissionPath = '';
    this.basePermissionPath = `engagement_${this.engagement.id}`;
    fireEvent(this, 'base-permission-changed', this.basePermissionPath);
    fireEvent(this, 'engagement-updated', {success: true, data: data});
    fireEvent(this, 'global-loading', {type: 'update-engagement', saved: true});
    fireEvent(this, 'global-loading', {type: 'update-permissions'});

    let action;
    if (this.requestOptions.method === 'PATCH') {
      action = 'saved';
    } else if (data.status === 'report_submitted') {
      action = 'submitted';
    } else if (data.status === 'final') {
      action = 'finalized';
    } else if (data.status === 'cancelled') {
      action = 'cancelled';
    }

    if (!this.quietAdding) {
      fireEvent(this, 'toast', {text: `Engagement ${action !== 'saved' ? '' : 'data '}has been ${action}!`});
    } else {
      this.quietAdding = false;
      // @dci need to check
      // fireEvent(this, 'quiet-adding-changed', this.quietAdding);
    }
  }

  _finishPostResponse() {
    if (!this.quietAdding) {
      fireEvent(this, 'global-loading', {type: 'update-permissions', active: true, message: 'Updating data...'});
    }

    if (~this.actionUrl.indexOf('submit')) {
      fireEvent(this, 'global-loading', {type: 'submit-engagement', saved: true});
    } else if (~this.actionUrl.indexOf('finalize')) {
      fireEvent(this, 'global-loading', {type: 'finalize-engagement', saved: true});
    } else if (~this.actionUrl.indexOf('cancel')) {
      fireEvent(this, 'global-loading', {type: 'cancel-engagement'});
    } else {
      fireEvent(this, 'global-loading', {type: 'update-engagement', saved: true});
    }
    this.actionUrl = '';

    const optionsEndpoint = getEndpoint('engagementInfo', {
      id: this.updatedEngagementData.id,
      type: this.updatedEngagementData.engagement_type
    });

    sendRequest({
      method: 'OPTIONS',
      endpoint: optionsEndpoint
    })
      .then(this._handleOptionsResponse.bind(this))
      .catch(this._handleOptionsError.bind(this));

    const attachmentsEndpoint = getEndpoint('attachments', {id: this.updatedEngagementData.id});
    sendRequest({
      method: 'OPTIONS',
      endpoint: attachmentsEndpoint
    })
      .then(this._handleDataOptionsResponse('attachments', 'attachments'))
      .catch(this._handleDataOptionsResponse('attachments', 'attachments'));

    const reportAttachmentsEndpoint = getEndpoint('reportAttachments', {id: this.updatedEngagementData.id});
    sendRequest({
      method: 'OPTIONS',
      endpoint: reportAttachmentsEndpoint
    })
      .then(this._handleDataOptionsResponse('report_attachments', 'reportAttachments'))
      .catch(this._handleDataOptionsResponse('report_attachments', 'reportAttachments'));

    const apBaseUrl = getEndpoint('engagementInfo', {id: this.updatedEngagementData.id, type: 'engagements'}).url;
    sendRequest({
      method: 'OPTIONS',
      endpoint: {
        url: `${apBaseUrl}action-points/`
      }
    })
      .then(this._handleDataOptionsResponse('ap', 'apOptions'))
      .catch(this._handleDataOptionsResponse('ap', 'apOptions'));
  }

  _handleError(error) {
    if (this.requestOptions.method === 'PATCH') {
      fireEvent(this, 'global-loading', {type: 'update-engagement'});
    } else if (this.requestOptions.method === 'POST' && ~this.actionUrl.indexOf('submit')) {
      fireEvent(this, 'global-loading', {type: 'submit-engagement'});
    } else if (this.requestOptions.method === 'POST' && ~this.actionUrl.indexOf('finalize')) {
      fireEvent(this, 'global-loading', {type: 'finalize-engagement'});
    } else if (this.requestOptions.method === 'POST' && ~this.actionUrl.indexOf('cancel')) {
      fireEvent(this, 'global-loading', {type: 'cancel-engagement'});
    }

    this.actionUrl = '';

    let {status, response} = (error || {}) as any;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
    }

    if (status === 400) {
      this.errorObject = response;
    } else if (status === 413) {
      this.errorObject = {};
      fireEvent(this, 'toast', {text: `Error: Exceeded the maximum size of uploaded file.`});
    } else {
      this.errorObject = {};
      fireEvent(this, 'toast', {text: 'Can not save engagement data. Please try again later!'});
    }
    fireEvent(this, 'error-changed', this.errorObject);
    fireEvent(this, 'engagement-updated');

    if (this.quietAdding) {
      this.quietAdding = false;
      // @dci - need to check
      // fireEvent(this, 'quiet-adding-changed', this.quietAdding);
    }
  }

  _handleOptionsError() {
    this.basePermissionPath = 'not_found';
    this.finishResponse(this.lastData);
    fireEvent(this, 'toast', {text: 'Can not update permissions data. Please reload the page!'});
  }

  _engagementChanged(engagementInfo) {
    // what kind of person would write a method like this?
    // return if no data changed
    if (!engagementInfo) {
      return;
    }

    if (engagementInfo.submit && !this.actionUrl) {
      // Prepare submit request. Save submit url, update engagement data at first
      const url = getEndpoint('engagementInfo', {type: engagementInfo.engagement_type, id: engagementInfo.id}).url;
      this.actionUrl = url + engagementInfo.submit;
      // this.requestOptions.method = 'PATCH';
      this.requestOptions = {
        method: 'PATCH',
        endpoint: {
          url
        },
        body: engagementInfo.data
      };
      this._saveEngagement();
    } else if (this.actionUrl && ~this.actionUrl.indexOf('submit')) {
      // Finish data updating, run submitting if submit url has been saved
      fireEvent(this, 'engagement-updated', {success: true, data: engagementInfo});

      fireEvent(this, 'global-loading', {type: 'submit-engagement', active: true, message: 'Submitting engagement...'});
      fireEvent(this, 'global-loading', {type: 'update-engagement'});
      // this.requestOptions.method = 'POST';
      this.requestOptions = {
        method: 'POST',
        endpoint: {
          url: this.actionUrl
        },
        body: this.postData
      };

      this._performUpdate();
    } else if (engagementInfo.finalize) {
      // Run finalizing
      fireEvent(this, 'global-loading', {
        type: 'finalize-engagement',
        active: true,
        message: 'Finalizing engagement...'
      });
      const url =
        getEndpoint('engagementInfo', {type: engagementInfo.engagement_type, id: engagementInfo.id}).url +
        engagementInfo.finalize;
      // this.requestOptions.method = 'POST';
      // this.url = url;

      this.actionUrl = url;
      this.postData = engagementInfo.data;
      this.requestOptions = {
        method: 'POST',
        endpoint: {
          url
        },
        body: this.postData
      };
      this._performUpdate();
    } else if (engagementInfo.cancel) {
      // Run finalizing
      fireEvent(this, 'global-loading', {type: 'cancel-engagement', active: true, message: 'Canceling engagement...'});
      const url =
        getEndpoint('engagementInfo', {type: engagementInfo.engagement_type, id: engagementInfo.id}).url +
        engagementInfo.cancel;
      this.actionUrl = url;
      this.postData = engagementInfo.data;
      this.requestOptions = {
        method: 'POST',
        endpoint: {
          url
        },
        body: this.postData
      };
      this._performUpdate();
    } else {
      // Simple engagement data updating
      const url = getEndpoint('engagementInfo', {type: engagementInfo.engagement_type, id: engagementInfo.id}).url;
      this.actionUrl = '';
      this.requestOptions = {
        method: 'PATCH',
        endpoint: {
          url
        },
        body: engagementInfo.data
      };
      this._saveEngagement();
    }
  }

  _saveEngagement() {
    if (!this.quietAdding) {
      fireEvent(this, 'global-loading', {
        type: 'update-engagement',
        active: true,
        message: 'Updating engagement data...'
      });
    }
    this._performUpdate();
  }

  _performUpdate() {
    sendRequest(this.requestOptions).then(this._handleResponse.bind(this)).catch(this._handleError.bind(this));
  }
}
