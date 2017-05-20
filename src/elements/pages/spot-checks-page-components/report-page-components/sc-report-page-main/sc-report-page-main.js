'use strict';

Polymer({
    is: 'sc-report-page-main',
    properties: {
        priorities: {
            type: Object,
            value: function() {
                return {
                    low: {
                        display_name: 'Low',
                        value: 'low'
                    },
                    high: {
                        display_name: 'High',
                        value: 'high'
                    }
                };
            }
        },
        engagement: {
            type: Object,
            notify: true
        }
    },
    validate: function() {
        let assignTabValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate();

        return assignTabValid;
    }
});
