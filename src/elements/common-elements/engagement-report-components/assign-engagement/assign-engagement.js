'use strict';

Polymer({
    is: 'assign-engagement',

    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.PermissionController,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        basePermissionPath: {
            type: String,
            observer: '_updateStyles'
        },
        maxDate: {
            type: Date,
            value: function() {
                let nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
                return new Date(nextDay - 1);
            }
        },
        datepickerModal: {
            type: Boolean,
            value: false
        },
        falseValue: {
            type: Boolean,
            value: false,
            readOnly: true
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
        return !!(date);
    },

    _updateStyles: function() {
        this.updateStyles();
        this.checkDateValues();
    },

    _isReadOnly: function(field, prevDate, nextDate, basePermissionPath) {
        return this.isReadOnly(field, basePermissionPath) || !(prevDate && !nextDate);
    },

    validate: function(forSave) {
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-date');
        let valid = true;
        _.each(elements, (element, index) => {
            let previousElement = index > 1 ? elements[index - 1] : null;

            if (!forSave && element.required && (!previousElement || !!previousElement.value) && !element.validate()) {
                element.errorMessage = 'Field is required';
                element.invalid = true;
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
        return date ? new Date(moment(date).format()) : false;
    },

    _checkFieldInvalid: function(error) {
        return !!error;
    }
});
