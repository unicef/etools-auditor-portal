'use strict';

Polymer({
    is: 'assign-spot-check',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_updateStyles'
        }
    },
    observers: [
        '_updateStyles(data.date_of_field_visit)',
        '_updateStyles(data.date_of_draft_report_to_ip)',
        '_updateStyles(data.date_of_comments_by_ip)',
        '_updateStyles(data.date_of_draft_report_to_unicef)',
        '_updateStyles(data.date_of_comments_by_unicef)'
    ],
    _updateStyles: function() {
        this.updateStyles();
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    _isReadOnly: function(field, prevDate, nextDate) {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly || !(prevDate && !nextDate);
    }
});
