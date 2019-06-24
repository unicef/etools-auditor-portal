import {PolymerElement} from "@polymer/polymer";
import {property} from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import get from 'lodash-es/get';
import EndpointsMixin from '../app-config/endpoints-mixin';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import PermissionControllerMixin from '../../elements/app-mixins/permission-controller-mixin';
import { GenericObject } from "../../types/global.js";

class UpdateEngagement extends PermissionControllerMixin(EndpointsMixin(EtoolsAjaxRequestMixin(PolymerElement))) {

    @property({type: Object, observer: '_engagementChanged'})
    updatedEngagementData!: GenericObject;

    @property({type: Object, notify: true})
    engagement!: GenericObject;

    @property({type: String, notify: true})
    basePermissionPath!: string;

    @property({type: Boolean, notify: true})    
    quietAdding!: boolean;

    @property({type: Object, notify: true})
    errorObject = {};

    @property({type: Object, notify: true})
    optionRequests: GenericObject = {};

    @property({type: Boolean, notify: true})
    forceOptionsUpdate!: boolean;

    @property({type: Object})
    requestOptions!: GenericObject;

    @property({type: Object})
    postData!: GenericObject;

    @property({type: String, notify: true})
    actionUrl: string = '';

    @property({type: Object})
    lastData!: GenericObject;

    _handleResponse(data) {
        if (this.requestOptions.method === 'POST' || this.forceOptionsUpdate) {
            this.lastData = data;
            this.forceOptionsUpdate = false;
            this._finishPostResponse();
            return;
        } else if (this.actionUrl) {
            let engagement = data || {};
            this._engagementChanged(engagement);
            return;
        }
        this.finishResponse(data);
    }

    _handleOptionsResponse(data) {
        let collectionName = `engagement_${this.lastData.id}`;
        this._updateCollection(collectionName, data.actions);

        this.optionRequests.options = true;
        this.finishOptionsResponse(this.lastData);
    }

    _handleDataOptionsResponse(postfix, requestName) {
        return data => {
            let actions = get(data, 'actions', {}),
            name = get(data, 'name', '');
            // postfix = _.get(data, 'srcElement.dataset.pathPostfix'),
            // requestName = _.get(data, 'srcElement.dataset.requestName');

        let collectionName = `engagement_${this.lastData.id}_${postfix}`;
        this._updateCollection(collectionName, actions || {}, name);
        this[requestName] = '';

        this.optionRequests[requestName] = true;
        this.finishOptionsResponse(this.lastData);
        }
    }

    finishOptionsResponse(data) {
        if (!this.optionRequests.options ||
            !this.optionRequests.apOptions ||
            !this.optionRequests.attachments ||
            !this.optionRequests.reportAttachments) { return; }

        this.finishResponse(data);
    }

    finishResponse(data) {
        this.optionRequests = {};
        this.engagement = data;

        this.basePermissionPath = '';
        this.basePermissionPath = `engagement_${this.engagement.id}`;

        fireEvent(this, 'engagement-updated', {success: true, data});
        fireEvent(this, 'global-loading', {type: 'update-engagement'});
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
        }
    }

    _finishPostResponse() {
        if (!this.quietAdding) {
            fireEvent(this, 'global-loading', {type: 'update-permissions', active: true, message: 'Updating data...'});
        }

        if (~this.actionUrl.indexOf('submit')) {
            fireEvent(this, 'global-loading', {type: 'submit-engagement'});
        } else if (~this.actionUrl.indexOf('finalize')) {
            fireEvent(this, 'global-loading', {type: 'finalize-engagement'});
        } else if (~this.actionUrl.indexOf('cancel')) {
            fireEvent(this, 'global-loading', {type: 'cancel-engagement'});
        } else {
            fireEvent(this, 'global-loading', {type: 'update-engagement'});
        }
        this.actionUrl = '';

        const optionsEndpoint = this.getEndpoint('engagementInfo', { id: this.updatedEngagementData.id, type: this.updatedEngagementData.engagement_type });

        this.sendRequest({
            method: 'OPTIONS',
            endpoint: optionsEndpoint
        })
            .then(this._handleOptionsResponse.bind(this))
            .catch(this._handleOptionsError.bind(this));

        const attachmentsEndpoint = this.getEndpoint('attachments', { id: this.updatedEngagementData.id });
        this.sendRequest({
            method: 'OPTIONS',
            endpoint: attachmentsEndpoint
        })
            .then(this._handleDataOptionsResponse('attachments', 'attachments'))
            .catch(this._handleDataOptionsResponse('attachments', 'attachments'));

        const reportAttachmentsEndpoint = this.getEndpoint('reportAttachments', {id: this.updatedEngagementData.id});
        this.sendRequest({
            method: 'OPTIONS',
            endpoint: reportAttachmentsEndpoint
        })
            .then(this._handleDataOptionsResponse('report_attachments','reportAttachments'))
            .catch(this._handleDataOptionsResponse('report_attachments','reportAttachments'));

        let apBaseUrl = this.getEndpoint('engagementInfo', {id: this.updatedEngagementData.id, type: 'engagements'}).url;
        this.sendRequest({
            method: 'OPTIONS',
            endpoint: {
                url: `${apBaseUrl}action-points/`
            }
        })
            .then(this._handleDataOptionsResponse('ap','apOptions'))
            .catch(this._handleDataOptionsResponse('ap','apOptions'));
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
            this.set('errorObject', response);
        } else if(status === 413) {
            this.errorObject = {};
            fireEvent(this, 'toast', {text: `Error: Exceeded the maximum size of uploaded file.`});
        } else {
            this.errorObject = {};
            fireEvent(this, 'toast', {text: 'Can not save engagement data. Please try again later!'});
        }

        fireEvent(this, 'engagement-updated');

        if (this.quietAdding) {
            this.quietAdding = false;
        }
    }

    _handleOptionsError() {
        this.basePermissionPath = 'not_found';
        this.finishResponse(this.lastData);
        fireEvent(this,'toast', {text: 'Can not update permissions data. Please reload the page!'});
    }

    _engagementChanged(engagement) {
        //return if no data changed
        if (!engagement) { return; }

        if (engagement.submit && !this.actionUrl) {
            //Prepare submit request. Save submit url, update engagement data at first
            let url = this.getEndpoint('engagementInfo', {type: engagement.engagement_type, id: engagement.id}).url;
            this.actionUrl = url + engagement.submit;
            // this.requestOptions.method = 'PATCH';
            this.set('requestOptions', {
                method: 'PATCH',
                endpoint: {
                    url,
                },
                body: engagement.data
            });
            this._saveEngagement();
        } else if (this.actionUrl && ~this.actionUrl.indexOf('submit')) {
            //Finish data updating, run submitting if submit url has been saved
            fireEvent(this, 'engagement-updated', {success: true, data: engagement});

            fireEvent(this, 'global-loading', {type: 'submit-engagement', active: true, message: 'Submitting engagement...'});
            fireEvent(this, 'global-loading', {type: 'update-engagement'});
            // this.requestOptions.method = 'POST';
            this.set('requestOptions', {
                method: 'POST',
                endpoint: {
                    url: this.actionUrl
                },
                body: this.postData
            });

            this._performUpdate()

        } else if (engagement.finalize) {
            //Run finalizing
            fireEvent(this, 'global-loading', {type: 'finalize-engagement', active: true, message: 'Finalizing engagement...'});
            let url = this.getEndpoint('engagementInfo', {type: engagement.engagement_type, id: engagement.id}).url + engagement.finalize;
            // this.requestOptions.method = 'POST';
            // this.url = url;

            this.actionUrl = url;
            this.postData = engagement.data;
            this.set('requestOptions', {
                method: 'POST',
                endpoint: {
                    url
                },
                body: this.postData
            });
            this._performUpdate();
        } else if (engagement.cancel) {
            //Run finalizing
            fireEvent(this, 'global-loading', {type: 'cancel-engagement', active: true, message: 'Canceling engagement...'});
            let url = this.getEndpoint('engagementInfo', {type: engagement.engagement_type, id: engagement.id}).url + engagement.cancel;
            this.actionUrl = url;
            this.postData = engagement.data;
            this.set('requestOptions', {
                method: 'POST',
                endpoint: {
                    url
                },
                body: this.postData
            });
            this._performUpdate();
        } else {
            //Simple engagement data updating
            let url = this.getEndpoint('engagementInfo', {type: engagement.engagement_type, id: engagement.id}).url;
            this.actionUrl = '';
            this.set('requestOptions', {
                method: 'PATCH',
                endpoint: {
                    url
                },
                body: engagement.data
            });
            this._saveEngagement();
        }
    }

    _saveEngagement() {
        if (!this.quietAdding) {
             fireEvent(this, 'global-loading', {type: 'update-engagement', active: true, message: 'Updating engagement data...'});
        }
       this._performUpdate();
    }

    _performUpdate(){
        this.sendRequest(this.requestOptions)
            .then(this._handleResponse.bind(this))
            .catch(this._handleError.bind(this));
    }

}
window.customElements.define("update-engagement", UpdateEngagement);
