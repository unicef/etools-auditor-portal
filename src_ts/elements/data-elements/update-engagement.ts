import {LitElement, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {getEndpoint} from '../config/endpoints-controller';
import {addAllowedActions} from '../mixins/permission-controller';
import {GenericObject} from '@unicef-polymer/etools-types';
import {EtoolsRequestConfig, sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {
  getActionPointOptions,
  getEngagementAttachmentOptions,
  getEngagementOptions,
  getEngagementReportAttachmentsOptions,
  updateCurrentEngagement,
  updateEngagementAllOptions
} from '../../redux/actions/engagement';
import {getValueFromResponse} from '../utils/utils';
import {EngagementState} from '../../redux/reducers/engagement';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('update-engagement')
export class UpdateEngagement extends LitElement {
  @property({type: Object})
  updatedEngagementData!: GenericObject;

  @property({type: Boolean})
  quietAdding!: boolean;

  @property({type: Object})
  errorObject = {};

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
    getStore().dispatch(updateCurrentEngagement(data));
    if (this.requestOptions.method === 'POST' || this.forceOptionsUpdate) {
      this.lastData = data;
      this.forceOptionsUpdate = false;
      fireEvent(this, 'force-options-changed', String(this.forceOptionsUpdate).toLowerCase());
      this._finishPostResponse();
      return;
    } else if (this.actionUrl) {
      const engagement = data || {};
      this._engagementChanged(engagement);
      return;
    }
    this.finishResponse(data);
  }

  finishResponse(data) {
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
      fireEvent(this, 'quiet-adding-changed', String(this.quietAdding).toLowerCase());
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

    Promise.allSettled([
      getEngagementOptions(this.updatedEngagementData.id, this.updatedEngagementData.engagement_type),
      getEngagementAttachmentOptions(this.updatedEngagementData.id),
      getEngagementReportAttachmentsOptions(this.updatedEngagementData.id),
      getActionPointOptions(this.updatedEngagementData.id)
    ]).then((response: any[]) => {
      this._handleOptionsResponse(this.formatResponse(response));
      fireEvent(this, 'global-loading', {active: false});
    });
  }

  _handleOptionsResponse(data) {
    getStore().dispatch(updateEngagementAllOptions(data));
    this.finishResponse(this.lastData);
  }

  private formatResponse(response: any[]) {
    const resp: Partial<EngagementState> = {};
    resp.options = addAllowedActions(getValueFromResponse(response[0]) || {});
    resp.attachmentOptions = getValueFromResponse(response[1]) || {};
    resp.reportAttachmentOptions = getValueFromResponse(response[2]) || {};
    resp.apOptions = getValueFromResponse(response[3]) || {};
    return resp;
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

    if (this.quietAdding) {
      this.quietAdding = false;
      fireEvent(this, 'quiet-adding-changed', String(this.quietAdding).toLowerCase());
    }
  }

  _handleOptionsError() {
    // this.basePermissionPath = 'not_found';
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
