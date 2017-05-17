'use strict';

Polymer({
    is: 'financial-findings',
    properties: {
        basePermissionPath: {
            type: String
        },
        data: {
            type: Object,
            notify: true
        },
        headings: {
            type: Array,
            value: [{
                'size': 20,
                'label': 'Finding Number',
                'link': '*engagement_type*/*data_id*/overview',
                'path': 'finding_number'
            }, {
                'size': 40,
                'label': 'Title (Category)',
                'path': 'title'
            }, {
                'size': 20,
                'label': 'Amount (local)',
                'path': 'local_amount',
                'align': 'right'
            }, {
                'size': 13,
                'label': 'Amount USD',
                'path': 'amount',
                'align': 'right'
            }, {
                'size': 7,
                'label': 'Edit',
                'align': 'center',
                'icon': true
            }]
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'size': 30,
                    'label': 'Description',
                    'path': 'description'
                }, {
                    'size': 30,
                    'label': 'Recommendation',
                    'path': 'recommendation'
                }, {
                    'size': 30,
                    'label': 'IP comments',
                    'path': 'ip_comments'
                }];
            }
        }
    }
});
