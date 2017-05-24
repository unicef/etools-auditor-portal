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
    },
    getFindingsData: function() {
        let findingsLowPriority = this.$.findingsLowPriority.getFindingsData();
        let findingsHighPriority = this.$.findingsHighPriority.getFindingsData();
        return _.concat(findingsLowPriority, findingsHighPriority);
    },
    getInternalControlsData: function() {
        return this.$.internalControls.getInternalControlsData();
    },
    getAssignVisitData: function() {
        return this.$.assignEngagement.getAssignVisitData();
    }
});
