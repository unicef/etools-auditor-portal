'use strict';

Polymer({
    is: 'staff-sc-page-main',

    behaviors: [
        APBehaviors.QueryParamsController,
        APBehaviors.PermissionController,
        etoolsAppConfig.globals,
        EtoolsAjaxRequestBehavior
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
        filters: {
            type: Array,
            value: [
                {
                    name: 'partner',
                    label: 'Partner',
                    query: 'partner__in',
                    optionValue: 'id',
                    optionLabel: 'name',
                    selection: []
                },
                {
                    name: 'status',
                    label: 'Status',
                    query: 'status__in',
                    hideSearch: true,
                    optionValue: 'value',
                    optionLabel: 'display_name',
                    selection: []
                },
                {
                    name: 'unicef user',
                    label: 'Unicef User',
                    query: 'staff_members__user__in',
                    optionValue: 'id',
                    optionLabel: 'full_name',
                    selection: []
                }
            ]
        },
        endpointName: {
            type: String,
            value: 'staffSCList'
        }
    },

    observers: [
        '_routeConfig(routeData.view, selectedPage)'
    ],

    ready: function() {
        this.sendRequest({
            endpoint: {url: this.getEndpoint('filterAuditors').url + '?unicef_users_allowed=true'}
        }).then(resp => {
           this._auditFirmLoaded(resp);
        }).catch(err => {
            throw new Error(err);
        });
    },

    _routeConfig: function(view, selectedPage) {
        if (!this.route || !~this.route.prefix.indexOf('/staff-sc') || selectedPage !== 'staff-sc') {
            this.resetLastView();
            return;
        }

        if (view === this.lastView) { return; }
        if (view === 'list') {
            let queries = this._configListParams(this.initiation++);
            this._setEngagementsListQueries(queries);
            this._fireUpdateEngagementsFilters();
            this.view = 'list';
        } else if (view === 'new' && this.actionAllowed('new_staff_sc', 'create')) {
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
        if (!~this.route.prefix.indexOf('/staff-sc') || !this.routeData) { return; }
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
    },

    _auditFirmLoaded: function(data) {
        if (!data.length) {
            console.error('Can not load firm data.');
            console.error(data);
        }
        else {
            this.auditFirm = data[0];
        }
    }

});
