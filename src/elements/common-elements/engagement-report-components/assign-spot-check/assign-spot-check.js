'use strict';

Polymer({
    is: 'assign-spot-check',
    behaviors: [
        APBehaviors.DateBehavior
    ],
    properties: {
        disabledDateOfFieldVisit: Boolean,
        disabledDateOfDraftReportToIp: Boolean,
        disabledDateOfCommentsByIp: Boolean,
        disabledDateOfDraftReportToUnicef: Boolean,
        disabledDateOfCommentsByUnicef: Boolean
    },
    _isAvailable: function(prevDate, nextDate) {
        return prevDate && !nextDate;
    }
});
