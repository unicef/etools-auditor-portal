'use strict';

Polymer({
    is: 'micro-assessments-page-main',
    behaviors: [APBehaviors.EngagementBehavior],
    properties: {
        engagement: {
            type: Object,
            value: function() {
                return {};
            }
        },
        otherActions: {
            type: Array,
            value: function() {
                return [{name: 'save', event: 'save-progress'}];
            }
        },
        tabsList: {
            type: Array,
            value: function() {
                return ['overview', 'report', 'questionnaire', 'attachments'];
            }
        },
        engagementPrefix: {
            type: String,
            value: '/micro-assessments'
        }
    },

    observers: [
        '_routeConfig(route)',
        '_setPermissionBase(engagement.id)',
        '_tabChanged(tab)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'save-progress': '_saveProgress',
        'main-action-activated': '_submitReport'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo();
        let questionnaireValid = Polymer.dom(this.root).querySelector('#questionnaire').validate();
        let reportValid = Polymer.dom(this.root).querySelector('#assignEngagement').validate();

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
            this.fire('toast', {text: 'Fill report before submiting!'});
            return false;
        }
        if (!questionnaireValid) {
            this.set('tab', 'questionnaire');
            this.fire('toast', {text: 'Fill questionnaire before submiting!'});
            return false;
        }
        return true;
    },

    customDataPrepare: function(data) {
        let questionnaire = Polymer.dom(this.root).querySelector('#questionnaire').getData();
        if (questionnaire) {
            data.questionnaire = questionnaire;
        } else {
            delete data.questionnaire;
        }

        return data;
    },

    customBasicValidation: function() {
        let questionnaireValid = Polymer.dom(this.root).querySelector('#questionnaire').validate('forSave');

        if (!questionnaireValid) {
            this.set('tab', 'questionnaire');
            this.fire('toast', {text: 'Fix invalid fields before saving'});
            return false;
        }
        return true;
    }
});
