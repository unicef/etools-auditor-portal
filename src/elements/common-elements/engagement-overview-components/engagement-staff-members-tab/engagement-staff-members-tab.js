'use strict';

Polymer({
    is: 'engagement-staff-members-tab',

    behaviors: [
        APBehaviors.TableElementsBehavior
    ],
    properties: {
        mainProperty: {
            type: String,
            value: 'staff_members'
        },
        itemModel: {
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
                    hasAccess: false
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 17,
                        'label': 'Position',
                        'name': 'user.profile.job_title'
                    }, {
                        'size': 17,
                        'label': 'First Name',
                        'name': 'user.first_name'
                    }, {
                        'size': 17,
                        'label': 'Last Name',
                        'name': 'user.last_name'
                    }, {
                        'size': 17,
                        'label': 'Phone Number',
                        'name': 'user.profile.phone_number'
                    }, {
                        'size': 17,
                        'label': 'E-mail Address',
                        'name': 'user.email'
                    },
                    {
                        'size': 8,
                        'label': 'Notify',
                        'name': 'receive_audit_notifications',
                        'property': 'receive_audit_notifications',
                        'checkbox': true
                    },
                    {
                        'size': 7,
                        'label': 'Edit',
                        'name': 'edit',
                        'icon': true
                    }
                ];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add new Staff Member'
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Edit Staff Member'
                };
            }
        },
        queries: {
            type: Object,
            value: function() {
                return {
                    page: 1,
                    size: 10
                };
            }
        },
        engagementStaffs: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },

    listeners: {
        'dialog-confirmed': '_addStaffFromDialog',
        'staff-updated': '_staffUpdated'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)',
        '_errorHandler(errorObject.staff_members)'
    ],

    attached: function() {
        this.$.emailInput.validate = this._validEmailAddress.bind(this, this.$.emailInput);
    },

    _validEmailAddress: function(emailInput) {
        let value = emailInput.value,
            required = emailInput.required;

        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if (required && !value) {
            this.errors = {user: {email: 'Email is required'}};
            return false;
        }
        if (value && !re.test(value)) {
            this.errors = {user: {email: 'Email is incorrect'}};
            return false;
        }

        let valid = true;

        if (this.saveWithButton) {
            _.each(this.dataItems, item => {
                if (item.user && item.user.email === this.editedItem.user.email &&
                    item.id && item.id === this.editedItem.id) {
                    this.errors = {user: {email: 'Email must be unique'}};
                    valid = false;
                }
            });
        }

        return valid;
    },
    _isActive: function() {
        return false;
    },
    _emailDisabled: function(request, editPopup) {
        return editPopup || request;
    },
    _addStaffFromDialog: function(event) {
        if (this.requestInProcess) { return; }

        if (event && event.detail && event.detail.dialogName === 'deleteConfirm') {
            this.removeStaff();
            return;
        }

        if (!this.validate()) { return; }

        this.requestInProcess = true;

        let item = _.cloneDeep(this.editedItem);
        if (this.canBeRemoved && !isNaN(this.editedIndex)) {
            //if is edit popup
            // this.splice('dataItems', this.editedIndex, 1, item);
            this.set('newData', {
                method: 'PATCH',
                data: item,
                staffIndex: this.editedIndex,
                id: `${item.id}/`
            });
        } else {
            //if is creation popup
            // this.push('dataItems', item);
            this.set('newData', {
                method: 'POST',
                data: item,
                id: ''
            });
        }
    },
    removeStaff: function() {
        this.set('newData', {
            method: 'DELETE',
            data: {},
            staffIndex: this.editedIndex,
            id: `${this.editedItem.id}/`
        });
    },
    _staffUpdated: function(event, details) {
        if (!details) { throw 'Detail are not provided!'; }
        if (details.error) {
            this._handleUpdateError(details.errorData);
            return;
        }

        details.data.hasAccess = this.editedItem.hasAccess;
        if (details.action === 'patch') {
            this.splice('dataItems', details.index, 1, details.data);
        } else if (details.action === 'post') {
            this.manageEngagementStaff(details.data);
            this.set('queries', {
                size: this.listSize,
                page: 1
            });
        } else if (details.action === 'delete') {
            let email = this.editedItem.user.email;
            this.manageEngagementStaff({user: {email: email}});
            this.set('queries', {
                size: this.listSize,
                page: this.listPage
            });
        }
        this.dialogOpened = false;
        this.resetDialog();
    },
    manageEngagementStaff: function(staff) {
        if (staff.hasAccess) {
            this.engagementStaffs[staff.user.email] = staff.id;
        } else {
            delete this.engagementStaffs[staff.user.email];
        }
    }

});
