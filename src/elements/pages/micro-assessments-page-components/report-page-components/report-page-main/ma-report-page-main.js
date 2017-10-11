'use strict';

Polymer({
    is: 'ma-report-page-main',

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
        let assignTabValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate(forSave),
            primaryValid = this.$.primaryRisk.validate(forSave),
            internalControlsValid = this.$.internalControls.validate(forSave);

        return assignTabValid && primaryValid && internalControlsValid;
    },

    getInternalControlsData: function() {
        let internalControls = this.$.internalControls;
        let data = internalControls && internalControls.getRiskData() || [];
        return data.length ? {children: data} : null;
    },

    getPrimaryRiskData: function() {
        let primaryRisk = this.$.primaryRisk;
        let primaryRiskData = primaryRisk && primaryRisk.getRiskData();
        return primaryRiskData || null;
    },

    getAssignVisitData: function() {
        return this.$.assignEngagement.getAssignVisitData();
    },

    getFindingsData: function() {
        return this.$.controlFindings.getTabData();
    }
});
