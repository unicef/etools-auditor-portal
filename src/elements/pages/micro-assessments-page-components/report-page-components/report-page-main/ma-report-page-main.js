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
    getRisksData: function() {
        let internalControls = this.$.internalControls,
            primaryRisk = this.$.primaryRisk;

        let data = internalControls && internalControls.getRiskData() || [];
        let primaryRiskData = primaryRisk && primaryRisk.getRiskData();
        if (primaryRiskData) { data.unshift(primaryRiskData); }
        return data.length ? {children: data} : null;
    },
    getAssignVisitData: function() {
        return this.$.assignEngagement.getAssignVisitData();
    },
    getFindingsData: function() {
        return this.$.controlFindings.getTabData();
    }
});
