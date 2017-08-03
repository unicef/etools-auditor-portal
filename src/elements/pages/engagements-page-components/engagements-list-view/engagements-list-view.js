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
                    'name': 'type',
                    'ordered': false
                }, {
                    'size': 30,
                    'label': 'Status',
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
                        query: 'type',
                        hideSearch: true,
                        optionValue: 'value',
                        optionLabel: 'label',
                        selection: [{
                            label: 'Audit',
                            value: 'audit'
                        }, {
                            label: 'Micro Assessment',
                            value: 'ma'
                        }, {
                            label: 'Spot Check',
                            value: 'sc'
                        }]
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
                        optionLabel: 'label',
                        selection: [
                            {
                                label: 'Partner was Contacted',
                                value: 'partner_contacted'
                            },
                            {
                                label: 'Field Visit',
                                value: 'field_visit'
                            },
                            {
                                label: 'Draft Report Issued To IP',
                                value: 'draft_issued_to_unicef'
                            },
                            {
                                label: 'Comments Received By IP',
                                value: 'comments_received_by_partner'
                            },
                            {
                                label: 'Draft Report Issued To UNICEF',
                                value: 'draft_issued_to_partner'
                            },
                            {
                                label: 'Comments Received By UNICEF',
                                value: 'comments_received_by_unicef'
                            },
                            {
                                label: 'Report Submitted',
                                value: 'report_submitted'
                            },
                            {
                                label: 'Final Report',
                                value: 'final'
                            },
                            {
                                label: 'Cancelled',
                                value: 'canceled'
                            }
                        ]
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

        ready: function() {
            this.setupFiltersAndHeadings();
            this.setFiltersSelections();
        },

        _showAddButton: function() {
            return this.actionAllowed('new_engagement', 'create');
        },

        setupFiltersAndHeadings: function() {
            if (false) { //TODO: check that user is auditor
                let auditorsFilterIndex = this._getFilterIndex('agreement__auditor_firm');
                let auditorHeadingIndex = this.listHeadings.findIndex((heading) => {
                    return heading.name === 'agreement__auditor_firm__name';
                });

                this.filters.splice(auditorsFilterIndex, 1);
                this.listHeadings.splice(auditorHeadingIndex, 1);
                this.listHeadings.forEach((heading) => {
                    heading.size += 5;
                });
            }

            let partners = this.getData('partners');
            if (!partners || !partners.length) {
                let partnersFilterIndex = this._getFilterIndex('partner');
                if (partnersFilterIndex !== -1) {
                    this.filters.splice(partnersFilterIndex, 1);
                }
            }
        },

        _getFilterIndex: function(query) {
            if (!(this.filters instanceof Array)) { return -1; }

            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },

        setFiltersSelections: function() {
            let partnersFilterIndex = this._getFilterIndex('partner');
            let auditorsFilterIndex = this._getFilterIndex('agreement__auditor_firm');

            if (partnersFilterIndex !== -1) {
                this.set(`filters.${partnersFilterIndex}.selection`, this.getData('partners') || []);
            }

            if (auditorsFilterIndex !== -1) {
                this.set(`filters.${auditorsFilterIndex}.selection`, this.getData('auditors') || []);
            }
        },

        _setExportLink: function() {
            return this.getEndpoint('engagementsList').url + '?format=csv&page_size=all';
        }

    });
})();
