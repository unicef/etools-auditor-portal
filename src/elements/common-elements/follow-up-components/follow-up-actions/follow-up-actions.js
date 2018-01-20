'use strict';

Polymer({
    is: 'follow-up-actions',

    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.TextareaMaxRowsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        dataItems: {
            type: Array,
            notify: true
        },
        mainProperty: {
            type: String,
            value: 'action_points'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    category: '',
                    person_responsible: {full_name: ''},
                    due_date: '',
                    description: '',
                    status: '',
                    high_priority: '',
                    action_taken: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 50,
                        'label': 'Category',
                        'labelPath': 'action_points.category',
                        'path': 'category'
                    }, {
                        'size': 25,
                        'label': 'Due Date',
                        'labelPath': 'action_points.due_date',
                        'path': 'due_date',
                        'name': 'date',
                        'align': 'right'
                    }, {
                        'size': 25,
                        'label': 'Person Responsible',
                        'labelPath': 'action_points.person_responsible',
                        'path': 'person_responsible.full_name',
                        'align': 'right'
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Description',
                    'labelPath': 'action_points.description',
                    'path': 'description',
                    'size': 100
                }];
            }
        },
        addDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Add new Action'
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: function() {
                return {
                    title: 'Edit Follow-Up Action'
                };
            }
        },
        deleteTitle: {
            type: String,
            value: 'Are you sure that you want to delete this action?'
        },
        categoryOptions: {
            type: Array,
            value: function() {
                return [];
            }
        },
        statusOptions: {
            type: Array,
            value: function() {
                return [];
            }
        },
        users: {
            type: Array,
            value: function() {
                return [];
            }
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog',
        'delete-confirmed': 'removeItem'
    },

    observers: [
        'resetDialog(dialogOpened)',
        '_errorHandler(errorObject)',
        '_checkNonField(errorObject)',
        'setChoices(basePermissionPath)',
        'setFullName(dataItems)'
    ],

    attached: function() {
        APBehaviors.TextareaMaxRowsBehavior.attached.call(this, arguments);
        this.set('users', this.getData('users') || []);
    },

    setChoices: function(basePath) {
        let category = this.getChoices(`${basePath}.action_points.category`);
        let status = this.getChoices(`${basePath}.action_points.status`);
        this.set('categoryOptions', category || []);
        this.set('statusOptions', status || []);
    },

    setFullName: function(actions) {
        _.each(actions, (action, index) => {
            let fullName = `${action.person_responsible.first_name} ${action.person_responsible.last_name}`;
            this.set(`dataItems.${index}.person_responsible.full_name`, fullName);
        });
    },

    _checkNonField: function(error) {
        if (!error) { return; }

        let nonField = this.checkNonField(error);
        if (nonField) {
            this.fire('toast', {text: `Follow-Up Actions: ${nonField}`});
        }
    },

    getActionsData: function() {
        if (!this.dialogOpened) { return null; }

        this.editedItem.person_responsible = this.editedItem.person_responsible && this.editedItem.person_responsible.id;
        if (this.addDialog) {
            let data = _.clone(this.editedItem) || {};
            if (!data.person_responsible) { delete data.person_responsible; }
            return [data];
        }
        //add changed data except person_responsible
        let data = _.pickBy(this.editedItem, (value, key) => {
            return (this.originalEditedObj[key] !== value && key !== 'person_responsible');
        });
        //check person_responsible
        if (this.editedItem.category !== 'Escalate to Investigation' &&
            this.editedItem.person_responsible !== this.originalEditedObj.person_responsible.id) {
            data.person_responsible = this.editedItem.person_responsible;
        }

        return _.isEmpty(data) ? null : [_.set(data, 'id', this.editedItem.id)];
    },

    _showPersonField: function(category) {
        return !category || category.value !== 'Escalate to Investigation';
    },

    isValidateInput: function(category) {
        return this._showPersonField(category) ? 'validate-input' : '';
    }

});
