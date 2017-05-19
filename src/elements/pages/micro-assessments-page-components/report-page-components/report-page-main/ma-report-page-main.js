'use strict';

Polymer({
    is: 'ma-report-page-main',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        engagement: {
            type: Object,
            notify: true
        }
    },
    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },
    validate: function() {
        let assignTabValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate(),
            internalControlsValid = this.$.internalControls.validate();

        return assignTabValid && internalControlsValid;
    },
    getRisksData: function() {
        let element = this.$.internalControls;
        if (!element) { return null; }

        let data = element.getRiskData();
        return data ? {blueprints: data} : null;
    }
});
