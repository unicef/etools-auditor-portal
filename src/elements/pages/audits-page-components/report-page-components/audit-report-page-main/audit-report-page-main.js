'use strict';

Polymer({
    is: 'audit-report-page-main',

    properties: {
        engagement: {
            type: Object,
            notify: true
        }
    },

    validate: function(forSave) {
        let assignTabValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate(forSave);

        return assignTabValid;
    },

    getAssignVisitData: function() {
        return this.$.assignEngagement.getAssignVisitData();
    },

    getFinancialFindingsData: function() {
        return this.$.financialFindings.getTabData();
    },

    getFindingsSummaryData: function() {
        return this.$.findingsSummary.getFindingsSummaryData();
    },

    getAssessmentOfControlsData: function() {
        return this.$.assessmentOfControls.getAssessmentOfControlsData();
    },

    getKeyInternalWeaknessData: function() {
        return this.$.keyInternalControlsWeaknesses.getKeyInternalWeaknessData();
    }
});
