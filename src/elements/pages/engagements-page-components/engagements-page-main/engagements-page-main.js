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
            this.$.listPage.checkExpire();
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

        if (!queries.size) { queriesUpdates.size = '10'; }
        if (!queries.ordered_by) { queriesUpdates.ordered_by = 'po.asc'; }

        if (queries.page) {
            let page = +queries.page;
            if (page < 2 || isNaN(page) ||
                (!!this.lastParams && (queries.size !== this.lastParams.size || queries.ordered_by !== this.lastParams.ordered_by))) {
                queriesUpdates.page = false;
            }
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
