'use strict';

Polymer({
    is: 'follow-up-main',

    getFollowUpData: function() {
        let data = {},
            //Follow Up
            followUp = Polymer.dom(this.root).querySelector('#actions'),
            followUpData = followUp && followUp.getActionsData(),
            //Audit Financial Findings
            auditFindings = Polymer.dom(this.root).querySelector('#auditFF'),
            auditFindingsData = auditFindings && auditFindings.getFindingsData();

        if (followUpData) {
            data.action_points = followUpData;
        }
        if (auditFindingsData) {
            _.assign(data, auditFindingsData);
        }

        return _.isEmpty(data) ? null : data;
    },

    showFindings: function(type, expectedType) {
        return type === expectedType;
    }

});
