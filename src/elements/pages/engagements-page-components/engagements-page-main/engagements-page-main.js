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
        },
        endpointName: {
            type: String,
            value: 'engagementsList'
        }
    },

    observers: [
        '_routeConfig(routeData.view)'
    ],

    _routeConfig: function(view) {
        if (!this.route || !~this.route.prefix.indexOf('/engagements')) {
            this.resetLastView();
            return;
        }

        if (view === 'list') {
            let queries = this._configListParams(this.initiation++);
            this._setEngagementsListQueries(queries);
            this._fireUpdateEngagementsFilters();
            this.view = 'list';
        } else if (view === 'new' && this.actionAllowed('new_engagement', 'create')) {
            this.clearQueries();
            this.view = 'new';
        } else if (view === '' || _.isUndefined(view)) {
            this.set('route.path', '/list');
        } else {
            this.clearQueries();
            this.fire('404');
        }

        if (view !== this.lastView) {
            this.fire('toast', {reset: true});
        }
        this.lastView = view;
    },

    resetLastView: function() {
        if (this.lastView) { this.lastView = null; }
    },

    _fireUpdateEngagementsFilters: function() {
        this.debounce('updateEngagementsFiltersDebouncer', () => {
            document.dispatchEvent(new CustomEvent('update-engagements-filters'));
        }, 100);
    },

    _configListParams: function(noNotify) {
        let queriesUpdates = {},
            queries = this.parseQueries() || {};

        if (!queries.page_size) { queriesUpdates.page_size = '10'; }
        if (!queries.ordering) { queriesUpdates.ordering = 'unique_id'; }
        if (!queries.page) { queriesUpdates.page = '1'; }

        let page = +queries.page;
        if (isNaN(page) || (this.lastParams && (queries.page_size !== this.lastParams.page_size || queries.ordering !== this.lastParams.ordering))) {
            queriesUpdates.page = '1';
        }

        if (!this.lastParams || !_.isEqual(this.lastParams, queries)) {
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
