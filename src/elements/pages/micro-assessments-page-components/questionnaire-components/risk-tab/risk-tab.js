'use strict';

Polymer({
    is: 'risk-tab',

    behaviors: [
        APBehaviors.CommonMethodsBehavior
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
                        'property': 'risk.value',
                        'custom': true,
                        'doNotHide': true
                    }
                ];
            }
        },
        details: {
            type: Array,
            value: function() {
                return [{
                    'label': 'Comments',
                    'path': 'risk.extra.comments',
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
        '_setOpen(disabled, completed, firstRun, questionnaire)'
    ],

    ready: function() {
        let riskOptions = this.getChoices(`${this.basePermissionPath}.questionnaire.blueprints.risk.value`) || [];
        this.set('riskOptions', riskOptions);
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

        if (!item.risk) { item.risk = {}; }
        if ((!changedValue && changedValue !== 0) || changedValue === item.risk.value) { return; }

        item.risk.value = changedValue;

        let childId = null;
        if (this.questionnaire.children.length) {
            childId = event.target && event.target.getAttribute('category-id');
            if (!childId) { throw 'Can not find category id!'; }
            data = {
                id: this.questionnaire.id,
                children: [{
                    id: childId,
                    blueprints: [{risk: {value: changedValue}, id: item.id}]
                }]
            };
        } else {
            data = {
                id: this.questionnaire.id,
                blueprints: [{risk: {value: changedValue}, id: item.id}]
            };
        }
        this.fire('risk-value-changed', {data: data});
    },

    _resetFieldError: function() {
        this.set('errors.partner', false);
    },

    setPanelTitle: function(header, complited) {
        if (!complited) { return header; }
        let label = this.riskRatingOptions && this.riskRatingOptions[this.questionnaire.risk_rating];
        if (!label) { return header; }
        return `${header} - ${label.toUpperCase()}`;
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
        if (!data.risk) { data.risk = {}; }
        if (this.isJSONObj(data.risk.extra)) {
            data.risk.extra = JSON.parse(data.risk.extra);
        } else {
            data.risk.extra = {comments: (data.risk.extra && data.risk.extra.comments) || ''};
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
        return options[value] && options[value].display_name || defaultValue;
    },

    _prepareData: function(data) {
        if (data && data.risk && this.isJSONObj(data.risk.extra)) { data.risk.extra = JSON.parse(data.risk.extra); }
        return data;
    }
});
