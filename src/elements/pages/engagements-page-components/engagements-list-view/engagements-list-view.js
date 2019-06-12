'use strict';

(function() {
    Polymer({
        is: 'engagements-list-view',

        behaviors: [
            APBehaviors.PermissionController,
            APBehaviors.StaticDataController,
            APBehaviors.QueryParamsController,
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
                value: () => [{
                    'size': 15,
                    'label': 'Unique ID #',
                    'name': 'unique_id',
                    'link': '*engagement_type*/*data_id*/overview',
                    'ordered': false,
                    'path': 'unique_id'
                }, {
                    'size': 20,
                    'label': 'Audit Firm',
                    'labelPath': 'agreement.audit_firm',
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
                        name: 'audit firm',
                        label: 'Audit Firm',
                        query: 'agreement__auditor_firm__in',
                        optionValue: 'id',
                        optionLabel: 'name',
                        selection: []
                    },
                    {
                        name: 'engagement type',
                        label: 'Engagement Type',
                        query: 'engagement_type__in',
                        hideSearch: true,
                        optionValue: 'value',
                        optionLabel: 'display_name',
                        selection: []
                    },
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
                        name: 'joint audit',
                        label: 'Joint Audit',
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
            },
            hideAddButton: {
                type: Boolean,
                value: false
            },
            addBtnText: {
                type: 'String',
                value: 'Add New Engagement'
            },
            isStaffSc: {
                type: Boolean,
                value: false
            },
            exportLinks: {
                type: Array,
                value: []
            },
            endpointName: String
        },

        observers: [
            '_changeLinkTemplate(isStaffSc, listHeadings)',
            '_setExportLinks(endpointName)'
        ],

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

        _showAddButton: function(hideAddButton) {
            return this.actionAllowed('new_engagement', 'create') && !hideAddButton;
        },

        _getFilterIndex: function(query) {
            if (!(this.filters instanceof Array)) { return -1; }

            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },

        setFiltersSelections: function() {
            let queryAndKeyPairs = [
                {query: 'partner__in', dataKey: 'filterPartners'},
                {query: 'agreement__auditor_firm__in', dataKey: 'filterAuditors'},
                {query: 'status__in', dataKey: 'statuses'},
                {query: 'engagement_type__in', dataKey: 'engagementTypes'},
                {query: 'staff_members__user__in', dataKey: 'staffMembersUsers'}
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

        _setExportLinks: function() {
            const endpoint = this.getEndpoint(this.endpointName);
            const queryString = this.buildQueryString(this.queryParams);
            const exportLinks = endpoint ? [{
                name: 'Export Engagements',
                url: `${endpoint.url}csv/?${queryString}`
            }] : [];
            this.set('exportLinks', exportLinks);
        },

        _changeLinkTemplate: function(isStaffSc, headings) {
            if (!headings) { return; }
            if (isStaffSc) {
                this.set('listHeadings.0.link', 'staff-spot-checks/*data_id*/overview');
            } else {
                this.set('listHeadings.0.link', '*engagement_type*/*data_id*/overview');
            }
        }

    });
})();
