'use strict';

Polymer({
    is: 'engagement-staff-members-tab',

    behaviors: [
        APBehaviors.RepeatableDataSetsBehavior,
        APBehaviors.PermissionController
    ],
    properties: {},

    ready: function() {
        this.dataSetModel =  {
            user: {
                first_name: '',
                last_name: '',
                email: '',
                is_active: true,
                profile: {
                    job_title: '',
                    phone_number: ''
                }
            },
            receive_audit_notifications: false
        };

        this.$['email-validator'].validate = this._validEmailAddress.bind(this);
    },

    _canBeRemoved: function() {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.staff_members`);
        if (readOnly === null) { readOnly = true; }

        return !readOnly;
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
            //TODO: improve validation
            if (element.required && !element.validate()) { valid = false; }
        });

        return valid;
    },

    _addNewStaffMember: function() {
        if (this._canBeRemoved()) {
            var lastStaffMemberAdded = this.dataItems[this.dataItems.length - 1];
            if (lastStaffMemberAdded &&
                !this._notEmpty(lastStaffMemberAdded.user.profile.job_title) &&
                !this._notEmpty(lastStaffMemberAdded.user.first_name) &&
                !this._notEmpty(lastStaffMemberAdded.user.last_name) &&
                !this._notEmpty(lastStaffMemberAdded.user.profile.phone_number) &&
                !this._notEmpty(lastStaffMemberAdded.user.email)) {
                this.fire('toast', {text: 'Last staff member fields are empty!', showCloseBtn: true});
            } else {
                this._addElement();
            }
        }
    },

    _getTitleValue: function(value) { return value || ''; },

    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.staff_members.${field}`);

        return required ? 'required' : false;
    },

    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.staff_members.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly;
    }

});
