'use strict';

Polymer({
    is: 'sa-report-page-main',

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

    getSpecificProceduresData: function() {
        return this.$.specificProcedures.getTabData();
    }

});
