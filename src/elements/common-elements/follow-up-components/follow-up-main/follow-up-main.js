'use strict';

Polymer({
    is: 'follow-up-main',

    getFollowUpData: function() {
        let data = {},
            followUp = Polymer.dom(this.root).querySelector('#actions'),
            followUpData = followUp && followUp.getActionsData();

        if (followUpData) {
            data.action_points = followUpData;
        }

        return _.isEmpty(data) ? null : data;
    }
});
