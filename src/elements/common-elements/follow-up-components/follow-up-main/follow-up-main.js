'use strict';

Polymer({
    is: 'follow-up-main',

    getFollowUpData: function() {
        let data = {},
            //Audit Financial Findings
            followUpFindings = Polymer.dom(this.root).querySelector('#followUpFF'),
            followUpFindingsData = followUpFindings && followUpFindings.getFindingsData();

        if (followUpFindingsData) {
            _.assign(data, followUpFindingsData);
        }

        return _.isEmpty(data) ? null : data;
    },

    showFindings: function(type) {
        return !!type && !~['ma', 'sa'].indexOf(type);
    }

});
