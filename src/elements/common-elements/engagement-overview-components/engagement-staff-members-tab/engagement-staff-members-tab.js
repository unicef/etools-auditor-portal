'use strict';

Polymer({
    is: 'engagement-staff-members-tab',

    behaviors: [
        APBehaviors.PermissionController
    ],
    properties: {
        emptyObj: {
            type: Object,
            value: function() {
                return {empty: true};
            }
        },
        userModel: {
            type: Object,
            value: function() {
                return {
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
            }
        },
        staffMember: Object,
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 16,
                        'label': 'Position',
                        'name': 'user.profile.job_title'
                    }, {
                        'size': 16,
                        'label': 'First Name',
                        'name': 'user.first_name'
                    }, {
                        'size': 16,
                        'label': 'Last Name',
                        'name': 'user.last_name'
                    }, {
                        'size': 16,
                        'label': 'Phone Number',
                        'name': 'user.profile.phone_number'
                    }, {
                        'size': 16,
                        'label': 'E-mail Address',
                        'name': 'user.email'
                    },
                    {
                        'size': 16,
                        'label': 'Notif. on Audit Tasks',
                        'name': 'user.is_active',
                        'checkbox': true
                    },
                    {
                        'size': 4,
                        'label': 'Edit',
                        'name': 'edit',
                        'icon': true
                    }
                ];
            }
        }
    },

    listeners: {
        'dialog-confirmed': '_addStaffFromDialog'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)'
    ],

    ready: function() {
        this.$.emailInput.validate = this._validEmailAddress.bind(this, this.$.emailInput);
        this.staffMember = _.cloneDeep(this.userModel);
    },

    _canBeChanged: function() {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.staff_members`);
        if (readOnly === null) { readOnly = true; }

        return !readOnly;
    },

    changePermission: function(basePermissionPath) {
        if (!basePermissionPath) { return; }
        if (this._canBeChanged() && this.columns[this.columns.length - 1].name !== 'edit') {
            this.push('columns', {'size': 4,'label': 'Edit','name': 'edit','icon': true});
        } else if (!this._canBeChanged() && this.columns[this.columns.length - 1].name === 'edit') {
            this.pop('columns');
        }
    },

    _validEmailAddress: function(emailInput) {
        let value = emailInput.value,
            required = emailInput.required;

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (required && !value) {
            emailInput.invalid = true;
            return false;
        }
        if (value && !re.test(value)) {
            emailInput.invalid = true;
            return false;
        }

        return true;
    },

    _notEmpty: function(value) {
        return typeof value !== 'undefined' && value !== null && value !== '';
    },

    validate: function() {
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input'),
            valid = true;

        Array.prototype.forEach.call(elements, (element) => {
            //TODO: improve validation
            if (element.required && !element.validate()) { valid = false; }
        });

        return valid;
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
    },
    openAddDialog: function() {
        this.dialogTitle = 'Add new Staff Member';
        this.confirmBtnText = 'Add';
        this.canBeRemoved = false;
        this.dialogOpened = true;
    },

    openEditDialog: function(event) {
        let model = event && event.model,
            index = model && model.index;

        if (!index && index !== 0) { console.error('Can not find user data'); return; }

        this.staffMember = _.cloneDeep(this.dataItems[index]);
        this.dialogTitle = 'Edit Staff Member';
        this.confirmBtnText = 'Save';
        this.canBeRemoved = true;
        this.editedIndex = index;
        this.dialogOpened = true;
    },

    _addStaffFromDialog: function() {
        if (!this.validate()) { return; }

        let user = _.cloneDeep(this.staffMember);
        if (this.canBeRemoved && !isNaN(this.editedIndex)) {
            //if is edit popup
            this.splice('dataItems', this.editedIndex, 1, user);
        } else {
            //if is creation popup
            this.push('dataItems', user);
        }

        this.dialogOpened = false;
        this.resetDialog();
    },

    resetDialog: function(opened) {
        if (opened) { return; }
        let elements = Polymer.dom(this.root).querySelectorAll('.validate-input');

        Array.prototype.forEach.call(elements, element => {
            element.invalid = false;
            element.value = '';
        });

        this.dialogTitle = '';
        this.confirmBtnText = '';
        this.staffMember = _.cloneDeep(this.userModel);
    }

});
