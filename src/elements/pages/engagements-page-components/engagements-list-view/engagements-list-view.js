'use strict';

(function() {
    let filters = [
        {
            name: 'Status',
            filterName: 'f_status',
            selection: [
                {
                    label: 'Planned',
                    value: 0,
                    apiValue: 'planned'
                },
                {
                    label: 'Submitted',
                    value: 1,
                    apiValue: 'submitted'
                },
                {
                    label: 'Rejected',
                    value: 2,
                    apiValue: 'rejected'
                },
                {
                    label: 'Approved',
                    value: 3,
                    apiValue: 'approved'
                }
            ]
        },
        {
            name: 'Implementing Partner',
            filterName: 'f_impl_partner',
            selection: []
        },
        {
            name: 'Location',
            filterName: 'f_location',
            selection: []
        },
        {
            name: 'UNICEF Focal Point',
            filterName: 'f_focal_point',
            selection: []
        }
    ];

    Polymer({
        is: 'engagements-list-view',
        behaviors: [],
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
            engagementsList: {
                type: Array,
                value: []
            },
            newBtnLink: {
                type: String,
                value: '/engagements/new/overview'
            }
        },
        listeners: {},
        _showAddButton: function() { return true; },
        checkExpire: function() {
            this.$.listData.checkExpire();
        }
    });
})();
