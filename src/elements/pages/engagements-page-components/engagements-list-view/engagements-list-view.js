'use strict';

(function() {
    let filters = [
        {
            name: 'auditor',
            query: 'agreement__audit_organization',
            optionValue: 'id',
            optionLabel: 'name',
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
            name: 'engagement type',
            query: 'type',
            hideSearch: true,
            optionValue: 'value',
            optionLabel: 'label',
            selection: [{
                label: 'Micro Assessment',
                value: 'ma'
            }, {
                label: 'Audit',
                value: 'audit'
            }, {
                label: 'Spot Check',
                value: 'sc'
            }]
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
                    value: 'draft_issued_to_partner'
                },
                {
                    label: 'Comments Received By IP',
                    value: 'comments_received_by_partner'
                },
                {
                    label: 'Draft Report Issued To UNICEF',
                    value: 'draft_issued_to_unicef'
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
                    label: 'Canceled',
                    value: 'canceled'
                }
            ]
        }
    ];

    Polymer({
        is: 'engagements-list-view',
        behaviors: [
            APBehaviors.PermissionController,
            APBehaviors.StaticDataController
        ],
        properties: {
            queryParams: {
                type: Object,
                notify: true
            },
            listHeadings: {
                type: Array,
                value: function() {
                    return [{
                        'size': 15,
                        'label': 'Purchase Order #',
                        'name': 'agreement__order_number',
                        'link': '*engagement_type*/*data_id*/overview',
                        'ordered': false,
                        'path': 'agreement.order_number'
                    }, {
                        'size': 20,
                        'label': 'Partner Name',
                        'name': 'partner__name',
                        'ordered': false,
                        'path': 'partner.name'
                    }, {
                        'size': 20,
                        'label': 'Auditor',
                        'name': 'agreement__audit_organization__name',
                        'ordered': false,
                        'path': 'agreement.audit_organization.name'
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
                    }];
                }
            },
            filters: {
                type: Array,
                value: filters
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
        listeners: {},
        observers: [
            'setFiltersSelections(engagementsList.*)'
        ],
        _showAddButton: function() {
            return this.actionAllowed('new_engagement', 'createEngagement');
        },
        _getFilterIndex: function(query) {
            return this.$.filters._getFilterIndex(query);
        },
        setFiltersSelections: function() {
            let partnersFilterIndex = this._getFilterIndex('partner');
            let auditorsFilterIndex = this._getFilterIndex('agreement__audit_organization');

            if (partnersFilterIndex !== -1) {
                this.set(`filters.${partnersFilterIndex}.selection`, this.getData('partners'));
            }

            if (auditorsFilterIndex !== -1) {
                this.set(`filters.${auditorsFilterIndex}.selection`, this.getData('auditors'));
            }
        }
    });
})();
