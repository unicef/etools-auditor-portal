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

    validate: function(forSave) {
        let assignTabValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate(forSave);

        return assignTabValid;
    },

    getFindingsData: function() {
        let findingsLowPriority = this.$.findingsLowPriority.getFindingsData();
        let findingsHighPriority = this.$.findingsHighPriority.getFindingsData();
        let findings = _.concat(findingsLowPriority || [], findingsHighPriority || []);
        return findings.length ? findings : null;
    },

    getInternalControlsData: function() {
        let internalControlsData = this.$.internalControls.getInternalControlsData();
        return !_.isNull(internalControlsData) ? internalControlsData : null;
    },

    getAssignVisitData: function() {
        return this.$.assignEngagement.getAssignVisitData() || null;
    },

    getOverviewData: function() {
        return this.$.overviewEngagement.getOverviewData() || null;
    }
});
