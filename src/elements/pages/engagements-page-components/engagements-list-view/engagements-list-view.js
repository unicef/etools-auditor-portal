'use strict';

(function() {
    Polymer({
        is: 'engagements-list-view',

        behaviors: [
            APBehaviors.PermissionController,
            APBehaviors.StaticDataController,
            etoolsAppConfig.globals
        ],

        properties: {
            basePermissionPath: {
                type: String,
                value: ''
            },
            queryParams: {
                type: Object,
                notify: true
            },
            listHeadings: {
                type: Array,
                value: [{
                    'size': 15,
                    'label': 'Unique ID #',
                    'name': 'unique_id',
                    'link': '*engagement_type*/*data_id*/overview',
                    'ordered': false,
                    'path': 'unique_id'
                }, {
                    'size': 20,
                    'label': 'Auditor',
                    'labelPath': 'agreement.auditor_firm',
                    'name': 'agreement__auditor_firm__name',
                    'ordered': false,
                    'path': 'agreement.auditor_firm.name'
                }, {
                    'size': 20,
                    'label': 'Partner Name',
                    'name': 'partner__name',
                    'ordered': false,
                    'path': 'partner.name'
                }, {
                    'size': 15,
                    'label': 'Engagement Type',
                    'labelPath': 'engagement_type',
                    'name': 'engagement_type',
                    'ordered': false
                }, {
                    'size': 30,
                    'label': 'Status',
                    'labelPath': 'status',
                    'name': 'status',
                    'ordered': false,
                    'additional': {
                        'type': 'date',
                        'path': 'status_date'
                    }
                }]
            },
            filters: {
                type: Array,
                value: [
                    {
                        name: 'auditor',
                        query: 'agreement__auditor_firm',
                        optionValue: 'id',
                        optionLabel: 'name',
                        selection: []
                    },
                    {
                        name: 'engagement type',
                        query: 'engagement_type',
                        hideSearch: true,
                        optionValue: 'value',
                        optionLabel: 'display_name',
                        selection: []
                    },
                    {
                        name: 'partner',
                        query: 'partner',
                        optionValue: 'id',
                        optionLabel: 'name',
                        selection: []
                    },
                    {
                        name: 'status',
                        query: 'status',
                        hideSearch: true,
                        optionValue: 'value',
                        optionLabel: 'display_name',
                        selection: []
                    },
                    {
                        name: 'joint audit',
                        query: 'joint_audit',
                        hideSearch: true,
                        optionValue: 'value',
                        optionLabel: 'display_name',
                        selection: [{display_name: 'Yes', value: 'true'}, {display_name: 'No', value: 'false'}]
                    }
                ]
            },
            engagementsList: {
                type: Array,
                value: []
            },
            newBtnLink: {
                type: String,
                value: '/engagements/new/overview'
            },
            hasCollapse: {
                type: Boolean,
                value: false
            }
        },

        attached: function() {
            document.addEventListener('engagements-filters-updated', this._engagementsFiltersUpdated.bind(this));
        },

        detached: function() {
            document.removeEventListener('engagements-filters-updated', this._engagementsFiltersUpdated);
        },

        _engagementsFiltersUpdated: function() {
            let filtersElement = this.$.filters;
            this.setFiltersSelections();

            if (filtersElement) {
                filtersElement._reloadFilters();
            }
        },

        _showAddButton: function() {
            return this.actionAllowed('new_engagement', 'create');
        },

        _getFilterIndex: function(query) {
            if (!(this.filters instanceof Array)) { return -1; }

            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },

        setFiltersSelections: function() {
            let queryAndKeyPairs = [
                {query: 'partner', dataKey: 'filterPartners'},
                {query: 'agreement__auditor_firm', dataKey: 'filterAuditors'},
                {query: 'status', dataKey: 'statuses'},
                {query: 'engagement_type', dataKey: 'engagementTypes'},
            ];

            queryAndKeyPairs.forEach((pair) => {
                let filterIndex = this._getFilterIndex(pair.query);
                let data = this.getData(pair.dataKey) || [];
                this.setFilterSelection(filterIndex, data);
            });
        },

        setFilterSelection: function(filterIndex, data) {
            if (filterIndex !== undefined && filterIndex !== -1) {
                this.set(`filters.${filterIndex}.selection`, data);
                return true;
            }
        },

        _setExportLink: function() {
            return this.getEndpoint('engagementsList').url + '?format=csv&page_size=all';
        }

    });
})();
