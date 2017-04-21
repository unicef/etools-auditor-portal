'use strict';

Polymer({
    is: 'engagement-staff-members-tab',

    behaviors: [
        APBehaviors.RepeatableDataSetsBehavior
    ],
    properties: {},

    ready: function() {
        this.dataSetModel = {
            title: '',
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            active: true,
            notify: false
        };

        this.$['email-validator'].validate = this._validEmailAddress.bind(this);
    },

    _canBeRemoved: function() {
        return this.editMode;

    },

    _validEmailAddress: function(emailAddress) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return !!(emailAddress && re.test(emailAddress));
    },

    _notEmpty: function(value) {
        return typeof value !== 'undefined' && value !== null && value !== '';
    },

    validate: function() {
        if (!this.dataItems.length) { return true; }

        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input'),
            valid = true;
        Array.prototype.forEach.call(elements, (element) => {
            if (!element.validate()) { valid = false; }
        });

        return valid;
    },

    _addNewStaffMember: function() {
        if (this.editMode) {
            var lastStaffMemberAdded = this.dataItems[this.dataItems.length - 1];
            if (lastStaffMemberAdded &&
                !this._notEmpty(lastStaffMemberAdded.title) &&
                !this._notEmpty(lastStaffMemberAdded.first_name) &&
                !this._notEmpty(lastStaffMemberAdded.last_name) &&
                !this._notEmpty(lastStaffMemberAdded.phone) &&
                !this._notEmpty(lastStaffMemberAdded.email)) {
                this.fire('toast', {text: 'Last staff member fields are empty!', showCloseBtn: true});
            } else {
                this._addElement();
            }
        }
    },

    _getTitleValue: function(value) { return value || ''; },

    _setRequired: function(editMode) {
        if (editMode) { return 'required'; }
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    }

});
