'use strict';

Polymer({
    is: 'assign-engagement',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_updateStyles'
        },
        maxDate: {
            type: Date,
            value: function() {
                let nextDay = moment(moment().format('YYYY-MM-DD')).add(1, 'days').format();
                return new Date(nextDay);
            }
        }
    },
    observers: [
        '_updateStyles(data.date_of_field_visit)',
        '_updateStyles(data.date_of_draft_report_to_ip)',
        '_updateStyles(data.date_of_comments_by_ip)',
        '_updateStyles(data.date_of_draft_report_to_unicef)',
        '_updateStyles(data.date_of_comments_by_unicef)',
        '_updateStyles(basePermissionPath)',
        '_errorHandler(errorObject)'
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
        _.each(elements, (element, index) => {
            let previousElement = index !== 0 ? elements[index - 1] : null,
                currentDate = Date.parse(element.value),
                previousDate = previousElement ? Date.parse(previousElement.value) : 0;

            if (!forSave && element.required && (!previousElement || !!previousElement.value) && !element.validate()) {
                element.errorMessage = 'Field is required';
                element.invalid = 'Field is required';
                valid = false;
            }

            if (previousDate > currentDate) {
                element.errorMessage = 'This date should be after previous date';
                element.invalid = 'This date should be after previous date';
                valid = false;
            }
            if (previousDate > Date.now()) {
                element.errorMessage = 'This date should be before today';
                previousElement.invalid = 'This date should be before today';
                valid = false;
            }
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
    },
    getAssignVisitData: function() {
        let data = _.pickBy(this.data, (value, key) => {
            let properties = ['date_of_field_visit', 'date_of_draft_report_to_ip', 'date_of_comments_by_ip',
                                'date_of_draft_report_to_unicef', 'date_of_comments_by_unicef'];
            if (!~properties.indexOf(key)) { return false; }

            return !this.originalData || this.originalData[key] !== value;
        });

        return _.isEmpty(data) ? null : data;
    },
    minDate: function(date) {
        return date ? new Date(date) : false;
    },
    _errorHandler: function(errorData) {
        if (!errorData) { return; }
        this.set('errors', this.refactorErrorObject(errorData));
    },
    _checkFieldInvalid: function(error) {
        return !!error;
    }
});
