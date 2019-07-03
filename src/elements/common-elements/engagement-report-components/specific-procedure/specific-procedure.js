'use strict';

(function() {
    const findingColumn = {
        'size': 40,
        'label': 'Finding',
        'labelPath': 'specific_procedures.finding',
        'path': 'finding'
    };

    Polymer({
        is: 'specific-procedure',

        behaviors: [
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
                value: 'specific_procedures'
            },
            itemModel: {
                type: Object,
                value: function() {
                    return {
                        description: '',
                        finding: ''
                    };
                }
            },
            columns: {
                type: Array,
                value: function() {
                    return [{
                        'size': 20,
                        'name': 'finding',
                        'label': 'Procedure',
                    }, {
                        'size': 40,
                        'label': 'Description',
                        'labelPath': 'specific_procedures.description',
                        'path': 'description'
                    }, {
                        'size': 40,
                        'label': 'Finding',
                        'labelPath': 'specific_procedures.finding',
                        'path': 'finding'
                    }];
                }
            },
            addDialogTexts: {
                type: Object,
                value: function() {
                    return {
                        title: 'Add New Procedure'
                    };
                }
            },
            editDialogTexts: {
                type: Object,
                value: function() {
                    return {
                        title: 'Edit Finding'
                    };
                }
            },
            deleteTitle: {
                type: String,
                value: 'Are you sure that you want to delete this finding?'
            },
            withoutFindingColumn: {
                type: Boolean,
                value: false,
                reflectToAttibute: true
            },
            readonlyTab: {
                type: Boolean,
                value: false
            }
        },

        observers: [
            'resetDialog(dialogOpened)',
            '_errorHandler(errorObject.specific_procedures)',
            '_checkNonField(errorObject.specific_procedures)',
            '_manageColumns(withoutFindingColumn, columns)'
        ],

        _checkNonField: function(error) {
            if (!error || !this._canBeChanged(this.basePermissionPath) || this._hideEditIcon()) { return; }

            let nonField = this.checkNonField(error);
            if (nonField || _.isString(error)) {
                this.fire('toast', {text: `Specific Procedures: ${nonField || error}`});
            }
        },

        _manageColumns: function(removeFinding, columns) {
            if (removeFinding && columns.length === 3) {
                this.splice('columns', 2, 1);
            } else if (!removeFinding && columns.length === 2) {
                this.splice('columns', 2, 0, findingColumn);
            }
        },

        _hideEditIcon: function(basePermissionPath, withoutFindingColumn, readonlyTab) {
            return withoutFindingColumn || readonlyTab || !this._canBeChanged(basePermissionPath);
        },

        canAddSP: function(basePermissionPath, readonlyTab, withoutFindingColumn) {
            return this._canBeChanged(basePermissionPath) && !readonlyTab && withoutFindingColumn;
        },

        _removeItem: function(event) {
            if (this.deleteCanceled(event)) {
                return;
            }
            this.removeItem();
        }

    });
})();
