'use strict';

(function() {
    let filters = [
        {
            name: 'auditor',
            query: 'f_auditor',
            optionValue: 'value',
            optionLabel: 'label',
            selection: []
        },
        {
            name: 'partner',
            query: 'partner_id',
            optionValue: 'id',
            optionLabel: 'name',
            selection: []
        },
        {
            name: 'audit type',
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
                }
            ]
        }
    ];

    let searchParams = [
        {
            label: 'partner',
            query: 'partner_id'
        },
        {
            label: 'PO',
            query: 'id'
        },
        {
            label: 'auditor',
            query: 'f_auditor'
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
                        'size': 20,
                        'label': 'Purchase Order #',
                        'name': 'order_number',
                        'link': '*engagement_type*/*data_id*/overview',
                        'ordered': false,
                        'path': 'agreement.order_number'
                    }, {
                        'size': 40,
                        'label': 'Partner Name',
                        'name': 'name',
                        'ordered': false,
                        'path': 'partner.name'
                    }, {
                        'size': 20,
                        'label': 'Audit Type',
                        'name': 'type',
                        'ordered': false
                    }, {
                        'size': 20,
                        'label': 'Status',
                        'name': 'status',
                        'ordered': false
                    }];
                }
            },
            filters: {
                type: Array,
                value: filters
            },
            searchParams: {
                type: Array,
                value: searchParams
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
                        'label': 'Email',
                        'name': 'email'
                    }, {
                        'label': 'Phone #',
                        'name': 'phone_number'
                    }];
                }
            }
        },
        listeners: {},
        observers: [
            'setFiltersSelections(engagements.*)'
        ],
        _showAddButton: function() {
            return this.collectionExists('new_engagement');
        },
        checkExpire: function() {
            this.$.listData.checkExpire();
        },
        _getFilterIndex: function(query) {
            return this.$.filters._getFilterIndex(query);
        },
        setFiltersSelections: function() {
            let partnersFilterIndex = this._getFilterIndex('partner_id');

            if (partnersFilterIndex !== -1) {
                this.set(`filters.${partnersFilterIndex}.selection`, this.getData('partners'));
            }
        }
    });
})();
