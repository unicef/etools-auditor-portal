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

        observers: [
            'setFiltersSelections(basePermissionPath, filters)'
        ],

        _showAddButton: function() {
            return this.actionAllowed('new_engagement', 'create');
        },

        _getFilterIndex: function(query) {
            if (!(this.filters instanceof Array)) { return -1; }

            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },

        setFiltersSelections: function(base) {
            if (!base) { return; }

            let partnersFilterIndex = this._getFilterIndex('partner');
            let auditorsFilterIndex = this._getFilterIndex('agreement__auditor_firm');
            let statusFilterIndex = this._getFilterIndex('status');
            let typeFilterIndex = this._getFilterIndex('engagement_type');

            let partners = this.getData('partners') || [];
            let auditors = this.getData('auditors') || [];
            let statuses = this.getChoices(`${base}.status`) || [];
            let types = this.getChoices(`${base}.engagement_type`) || [];

            this.setFilterSelection(partnersFilterIndex, partners);
            this.setFilterSelection(auditorsFilterIndex, auditors);
            this.setFilterSelection(statusFilterIndex, statuses);
            this.setFilterSelection(typeFilterIndex, types);
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
