'use strict';

Polymer({
    is: 'ma-report-page-main',
    behaviors: [
        APBehaviors.EngagementBehavior,
    ],
    properties: {
        engagement: {
            type: Object,
            notify: true
        },
        primaryArea: {
            type: Object
        }
    },

    validate: function(forSave) {
        let assignTabValid = this.getElement('#assignEngagement').validate(forSave),
            primaryValid = this.getElement('#primaryRisk').validate(forSave),
            internalControlsValid = this.getElement('#internalControls').validate(forSave);

        return assignTabValid && primaryValid && internalControlsValid;
    },

    getInternalControlsData: function() {
        let internalControls = this.getElement('#internalControls');
        let data = internalControls && internalControls.getRiskData() || [];
        return data.length ? {children: data} : null;
    },

    getPrimaryRiskData: function() {
        let primaryRisk = this.getElement('#primaryRisk');
        let primaryRiskData = primaryRisk && primaryRisk.getRiskData();
        return primaryRiskData || null;
    },

    getAssignVisitData: function() {
        return this.getElement('#assignEngagement').getAssignVisitData();
    },

    getFindingsData: function() {
        return this.getElement('#controlFindings').getTabData();
    }
});
