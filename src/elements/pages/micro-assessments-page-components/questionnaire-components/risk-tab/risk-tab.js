'use strict';

Polymer({
    is: 'risk-tab',
    properties: {
        questionnaire: {
            type: Object,
            value: function() {
                return {};
            },
            notify: true
        },
        index: Number,
        opened: {
            type: Boolean,
            value: false
        },
        completed: {
            type: Boolean,
            reflectToAttribute: true,
            value: false
        },
        disabled: {
            type: Boolean
        },
        riskRatingOptions: {
            type: Object,
            value: function() {
                return {
                    'na': 'N/A',
                    'low': 'Low',
                    'medium': 'Medium',
                    'significant': 'Significant',
                    'high': 'High',
                    'moderate': 'Moderate'
                };
            }
        },
        columns: {
            type: Array,
            value: function() {
                return [
                    {
                        'size': 100,
                        'label': 'Question',
                        'name': 'header',
                        'html': true
                    }, {
                        'size': '100px',
                        'label': 'Risk Points',
                        'name': 'value',
                        'align': 'center'
                    },
                    {
                        'size': '40px',
                        'label': 'Edit',
                        'name': 'edit',
                        'icon': true
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Comments',
                    'path': 'extra',
                    'size': 100
                }];
            }
        },
        categoryHeader: {
            type: Array,
            value: function() {
                return [{
                    'path': 'header',
                    'size': 100,
                    'html': true,
                    'class': 'question-title'
                }];
            }
        }
    },

    observers: [
        '_setOpen(disabled, completed, firstRun, questionnaire)',
        'changePermission(editMode, columns)'
    ],

    changePermission: function(editMode, columns) {
        if (!columns) { return; }
        let editObj = this.columns && this.columns[this.columns.length - 1];
        if (editMode && editObj && editObj.name !== 'edit') {
            this.push('columns', {'size': '40px','label': 'Edit','name': 'edit','icon': true});
        } else if (!editMode && editObj && editObj.name === 'edit') {
            this.pop('columns');
        }
    },

    showResults: function(completed, open) {
        if (!completed) { return false; }
        return !open;
    },

    getScore: function(score) {
        return score || 0;
    },

    getRating: function(rating) {
        return this.riskRatingOptions[rating] || rating;
    },

    _setOpen: function(disabled, completed, firstRun) {
        if (!firstRun) { return; }
        this.set('opened', !completed && !disabled);
    },

    setPanelTitle: function(header, complited) {
        if (!complited) { return header; }
        return `${header} - ${this.riskRatingOptions[this.questionnaire.risk_rating].toUpperCase()}`;
    },

    getElements: function(className) {
        return Polymer.dom(this.root).querySelectorAll(`.${className}`);
    },

    openEditDialog: function(event) {
        let item = event && event.model && event.model.item;

        if (!item) { throw Error('Can not find user data'); }

        let childId = null;
        if (this.questionnaire.children.length) {
            childId = event.target && event.target.getAttribute('category-id');
            if (!childId) { throw 'Can not find category id!'; }
        }
        this.fire('edit-blueprint', {data: _.cloneDeep(item), tabId: this.questionnaire.id, childId: childId});
    },
});
