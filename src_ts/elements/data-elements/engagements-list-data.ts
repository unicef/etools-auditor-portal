import { PolymerElement } from "@polymer/polymer";
import { property } from "@polymer/decorators";
import { fireEvent } from "../utils/fire-custom-event.js";
import cloneDeep from 'lodash-es/cloneDeep';
import keys from 'lodash-es/keys';
import pull from 'lodash-es/pull';
import uniq from 'lodash-es/uniq';
import difference from 'lodash-es/difference';

class EngagementListData extends PolymerElement {

    // behaviors: [
    //     etoolsAppConfig.globals,
    //     APBehaviors.QueryParamsController,
    //     EtoolsAjaxRequestBehavior
    // ],
    @property({type: Array, readOnly: true, notify: true})
    engagementsList!: [];
  
    @property({type: Object})
    requestQueries!: any;

    @property({type: Object})
    lastState: any = {};

    @property({type: Number, notify: true})
    listLength!: number;

    @property({ type: String })
    endpointName: string = '';

    static get observers() {
        return [ 'getEngagementsList(requestQueries.*)'];
    }

    _engagementsLoaded(detail) {
        if (!detail) {
            fireEvent(this, 'toast', {text: 'An error occured, try again.'});
            return;
        }

        this._setEngagementsList(detail.results);
        this.listLength = detail.count;
        this.updateQueries({reload: false});
        fireEvent(this, 'update-export-links');
        fireEvent(this, 'global-loading', {type: 'engagements-list'});
    }

    getEngagementsList() {
        let reloadRequired = this.reloadRequired() || this.requestQueries.reload;
        this.lastState = cloneDeep(this.requestQueries);
        if (!reloadRequired || !this.endpointName) {
            //not reload the page
            return;
        }

        fireEvent(this, 'global-loading', {type: 'engagements-list', active: true, message: 'Loading of engagements list...'});

        let endpoint = this.getEndpoint(this.endpointName);
        endpoint.url += this.getQueriesString();

        if (this.requestQueries.reload) {
            endpoint.url += `&reload=${new Date().getTime()}`;
        }

        endpoint.url = endpoint.url.replace(/[&?]{1}/, '?');
        this.sendRequest({
            endpoint: endpoint
        }).then(resp => {
           this._engagementsLoaded(resp);
        }).catch(err => {
            this._responseError(err);
        });
    }

    reloadRequired() {
        let lastKeys = keys(this.lastState);
        let requestQueriesKeys = keys(this.requestQueries);
        let filtersKeys = ['agreement__auditor_firm', 'partner', 'engagement_type', 'status', 'joint_audit', 'staff_members__user', 'sc'];
        let queriesKeys = lastKeys.concat(requestQueriesKeys);

        queriesKeys = uniq(queriesKeys);
        queriesKeys = difference(queriesKeys, filtersKeys);
        pull(queriesKeys, 'reload');

        let otherQueriesChanged = queriesKeys.some((key) => {
            let lastValue = this.lastState[key];
            let newValue = this.requestQueries[key];
            return lastValue !== newValue;
        });

        let filtersChanged = !filtersKeys.every((key) => {
            let lastValue = this.lastState[key];
            let newValue = this.requestQueries[key];
            return lastValue === newValue || (lastValue === true && newValue === undefined);
        });

        return otherQueriesChanged || filtersChanged;
    }

    _responseError(err) {
        let {status} = (err || {}) as any;

        //wrong page in queries
        if (status === 404 && this.requestQueries.page !== '1') {
            this.updateQueries({page: '1'});
            return;
        }

        this.updateQueries({reload: false});
        fireEvent(this, 'global-loading', {type: 'engagements-list'});
        fireEvent(this, 'toast', {text: 'Page not found.'});
    }
}
window.customElements.define("engagements-list-data", EngagementListData);