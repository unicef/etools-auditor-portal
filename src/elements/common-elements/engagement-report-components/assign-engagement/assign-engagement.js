'use strict';

Polymer({
    is: 'assign-engagement',
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
        '_updateStyles(data.date_of_comments_by_unicef)',
        '_updateStyles(basePermissionPath)'
    ],
    ready: function() {
        this.$['date-validator'].validate = this._validDate.bind(this);
    },
    _validDate: function(date) {
        console.log('date validate!');
        return !!(date);
    },
    _updateStyles: function() {
        this.updateStyles();
        this.checkDateValues();
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    _isReadOnly: function(field, prevDate, nextDate) {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly || !(prevDate && !nextDate);
    },
    _isRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        return this.isRequired(`${this.basePermissionPath}.${field}`) ? 'required' : '';
    },
    validate: function(forSave) {
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-date');
        let valid = true;
        elements.reduce((previousElement, currentElement) => {
            let previousDate = Date.parse(previousElement.value);
            let currentDate = Date.parse(currentElement.value);
            if (!forSave && currentElement.required && !currentElement.validate()) {
                valid = false;
            }
            if (previousDate > currentDate) {
                currentElement.invalid = true;
                currentElement.errorMessage = 'This date should be after previous date';
                valid = false;
            }
            if (previousDate > Date.now()) {
                previousElement.invalid = true;
                previousElement.errorMessage = 'This date should be before today';
                valid = false;
            }
            return currentElement;
        });

        return valid;
    },
    checkDateValues: function() {
        if (!this.data) { return; }
        if (!this.data.date_of_field_visit) { this.data.date_of_field_visit = null; }
        if (!this.data.date_of_draft_report_to_ip) { this.data.date_of_draft_report_to_ip = null; }
        if (!this.data.date_of_comments_by_ip) { this.data.date_of_comments_by_ip = null; }
        if (!this.data.date_of_draft_report_to_unicef) { this.data.date_of_draft_report_to_unicef = null; }
        if (!this.data.date_of_comments_by_unicef) { this.data.date_of_comments_by_unicef = null; }
    }
});
