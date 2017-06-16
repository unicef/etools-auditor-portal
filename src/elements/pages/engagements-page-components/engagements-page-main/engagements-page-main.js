'use strict';

Polymer({
    is: 'engagements-page-main',

    behaviors: [
        APBehaviors.QueryParamsController,
        APBehaviors.PermissionController
    ],

    properties: {
        queryParams: {
            type: Object,
            notify: true,
            observer: '_queryParamsChanged'
        },
        initiation: {
            type: Number,
            value: 0
        }
    },

    observers: [
        '_routeConfig(routeData.view)'
    ],

    _routeConfig: function(view) {
        if (!this.route || !~this.route.prefix.indexOf('/engagements')) { return; }
        if (view === 'list') {
            let queries = this._configListParams(this.initiation++);
            this._setEngagementsListQueries(queries);
            this.view = 'list';
        } else if (view === 'new' && this.actionAllowed('new_engagement', 'createEngagement')) {
            this.clearQueries();
            this.view = 'new';
        } else {
            this.clearQueries();
            this.fire('404');
        }
    },

    _configListParams: function(noNotify) {
        let queriesUpdates = {},
            queries = this.parseQueries();

        if (!queries.page_size) { queriesUpdates.page_size = '10'; }
        if (!queries.ordering) { queriesUpdates.ordering = 'agreement__order_number'; }
        if (!queries.page) { queriesUpdates.page = '1'; }

        let page = +queries.page;
        if (isNaN(page) || (this.lastParams && (queries.page_size !== this.lastParams.page_size || queries.ordering !== this.lastParams.ordering))) {
            queriesUpdates.page = '1';
        }

        if (!this.lastParams) {
            this.lastParams = _.clone(queries);
        } else if (!_.isEqual(this.lastParams, queries)) {
            this.lastParams = _.clone(queries);
        }

        this.updateQueries(queriesUpdates, null, noNotify);
        return this.parseQueries();
    },

    _queryParamsChanged: function() {
        if (!~this.route.prefix.indexOf('/engagements') || !this.routeData) { return; }
        if (this.routeData.view === 'list') {
            let queries = this._configListParams();
            this._setEngagementsListQueries(queries);
        } else if (!isNaN(+this.routeData.view)) {
            this.clearQueries();
        }
    },

    _setEngagementsListQueries: function(queries) {
        if (!_.isEmpty(queries) && (!this.partnersListQueries || !_.isEqual(this.partnersListQueries, queries))) {
            this.partnersListQueries = queries;
        }
    }

});
