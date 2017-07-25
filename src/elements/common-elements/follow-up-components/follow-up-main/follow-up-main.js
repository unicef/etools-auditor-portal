'use strict';

Polymer({
    is: 'follow-up-main',

    getFollowUpData: function() {
        let data = {},
            //Follow Up
            followUp = Polymer.dom(this.root).querySelector('#actions'),
            followUpData = followUp && followUp.getActionsData(),
            //Audit Financial Findings
            followUpFindings = Polymer.dom(this.root).querySelector('#followUpFF'),
            followUpFindingsData = followUpFindings && followUpFindings.getFindingsData();

        if (followUpData) {
            data.action_points = followUpData;
        }
        if (followUpFindingsData) {
            _.assign(data, followUpFindingsData);
        }

        return _.isEmpty(data) ? null : data;
    },

    showFindings: function(type) {
        return !!type && type !== 'ma';
    }

});
