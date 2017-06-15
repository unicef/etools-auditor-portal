'use strict';

Polymer({
    is: 'risk-tab',
    behaviors: [
        APBehaviors.StaticDataController
    ],
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
                        'class': 'pr-45',
                        'label': 'Question',
                        'name': 'header',
                        'html': true
                    }, {
                        'size': '160px',
                        'label': 'Risk Assessment',
                        'name': 'value',
                        'property': 'value',
                        'custom': true,
                        'doNotHide': true
                    },
                    {
                        'size': '45px',
                        'label': 'Edit',
                        'name': 'edit',
                        'align': 'center',
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
                    'path': 'extra.comments',
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

    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },

    changePermission: function(editMode, columns) {
        if (!columns) { return; }
        let editObj = this.columns && this.columns[this.columns.length - 1];
        if (editMode && editObj && editObj.name !== 'edit') {
            this.push('columns', {'size': '45px','label': 'Edit','name': 'edit','align': 'center','icon': true});
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

    _riskValueChanged: function(event, value) {
        let item = event && event.model && event.model.item,
            changedValue = value && value.selectedValues && value.selectedValues.value,
            data;

        if ((!changedValue && changedValue !== 0) || changedValue === item.value) { return; }

        item.value = changedValue;

        let childId = null;
        if (this.questionnaire.children.length) {
            childId = event.target && event.target.getAttribute('category-id');
            if (!childId) { throw 'Can not find category id!'; }
            data = {
                id: this.questionnaire.id,
                children: [{
                    id: childId,
                    blueprints: [{value: changedValue, id: item.id}]
                }]
            };
        } else {
            data = {
                id: this.questionnaire.id,
                blueprints: [{value: changedValue, id: item.id}]
            };
        }
        this.fire('risk-value-changed', {data: data});
    },

    _resetFieldError: function() {
        this.set('errors.partner', false);
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
        let data = _.cloneDeep(item);
        if (data && _.isJSONObj(data.extra)) {
            data.extra = JSON.parse(data.extra);
        } else {
            data.extra = {comments: (data.extra && data.extra.comments) || ''};
        }
        this.fire('edit-blueprint', {data: data, tabId: this.questionnaire.id, childId: childId});
    },
    _setRiskValue: function(value, options) {
        if (!options) { return; }
        if (_.isNumber(value)) {
            return options[value];
        }
        return value;
    },
    _getStringValue: function(value, options, defaultValue) {
        if (!options || !_.isNumber(value)) { return defaultValue; }
        return options[value].label || defaultValue;
    },
    _prepareData: function(data) {
        if (data && _.isJSONObj(data.extra)) { data.extra = JSON.parse(data.extra); }
        return data;
    }
});
