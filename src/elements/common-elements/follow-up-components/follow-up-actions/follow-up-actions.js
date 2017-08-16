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
                    description: '',
                    person_responsible: '',
                    due_date: '',
                    comments: ''
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 50,
                        'label': 'Description',
                        'labelPath': 'action_points.description',
                        'path': 'description'
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
                    'label': 'Comments',
                    'labelPath': 'action_points.comments',
                    'path': 'comments',
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
        descriptionOptions: {
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
        'setDescriptionChoices(basePermissionPath)',
        'setFullName(dataItems)'
    ],

    attached: function() {
        APBehaviors.TextareaMaxRowsBehavior.attached.call(this, arguments);
        this.set('users', this.getData('users') || []);
    },

    setDescriptionChoices: function(basePath) {
        let choices = this.getChoices(`${basePath}.action_points.description`);
        this.set('descriptionOptions', choices || []);
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

        this.editedItem.person_responsible = this.editedItem.person_responsible.id;
        if (this.addDialog) { return [_.clone(this.editedItem)]; }
        //add changed data except person_responsible
        let data = _.pickBy(this.editedItem, (value, key) => {
            return (this.originalEditedObj[key] !== value && key !== 'person_responsible');
        });
        //check person_responsible
        if (this.editedItem.person_responsible !== this.originalEditedObj.person_responsible.id) {
            data.person_responsible = this.editedItem.person_responsible;
        }

        return _.isEmpty(data) ? null : [_.set(data, 'id', this.editedItem.id)];
    }
});
