'use strict';

(function() {
    let filters = [
        {
            name: 'auditor',
            query: 'f_auditor',
            optionValue: 'id',
            optionLabel: 'name',
            selection: []
        },
        {
            name: 'partner',
            query: 'f_partner_id',
            optionValue: 'id',
            optionLabel: 'name',
            selection: []
        },
        {
            name: 'audit type',
            query: 'f_type',
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
            query: 'f_status',
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
                        'name': 'po',
                        'link': '*engagement_type*/*data_id*/overview',
                        'ordered': false,
                        'path': 'agreement.order_number'
                    }, {
                        'size': 20,
                        'label': 'Partner Name',
                        'name': 'partner',
                        'ordered': false,
                        'path': 'partner.name'
                    }, {
                        'size': 20,
                        'label': 'Auditor',
                        'name': 'auditor',
                        'ordered': false,
                        'path': 'agreement.audit_organization.name'
                    }, {
                        'size': 15,
                        'label': 'Audit Type',
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
            engagements: {
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
            listDetails: {
                type: Array,
                value: function() {
                    return [{
                        'label': 'Partner Email',
                        'path': 'partner.email'
                    }, {
                        'label': 'Partner Phone #',
                        'path': 'partner.phone_number'
                    }, {
                        'label': 'Partner Type',
                        'path': 'partner.partner_type'
                    }];
                }
            }
        },
        listeners: {},
        observers: [
            'setFiltersSelections(engagements.*)'
        ],
        _showAddButton: function() {
            return this.actionAllowed('new_engagement', 'createEngagement');
        },
        checkExpire: function() {
            this.$.listData.checkExpire();
        },
        _getFilterIndex: function(query) {
            return this.$.filters._getFilterIndex(query);
        },
        setFiltersSelections: function() {
            let partnersFilterIndex = this._getFilterIndex('f_partner_id');
            let auditorsFilterIndex = this._getFilterIndex('f_auditor');

            if (partnersFilterIndex !== -1) {
                this.set(`filters.${partnersFilterIndex}.selection`, this.getData('partners'));
            }

            if (auditorsFilterIndex !== -1) {
                this.set(`filters.${auditorsFilterIndex}.selection`, this.getData('auditors'));
            }
        }
    });
})();
