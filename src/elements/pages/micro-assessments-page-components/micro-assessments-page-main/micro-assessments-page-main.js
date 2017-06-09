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
                return [];
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
        '_tabChanged(tab)',
        '_configButtonsData(engagement, permissionBase)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'engagement-updated': '_engagementUpdated',
        'save-progress': '_saveProgress',
        'finalize-engagement': '_finalizeReport',
        'submit-engagement': '_submitReport',
        'main-action-activated': '_mainActionActivated'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo();
        let questionnaireValid = Polymer.dom(this.root).querySelector('#questionnaire').validateComplited();
        let reportValid = Polymer.dom(this.root).querySelector('#report').validate();

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
        let questionnaireTab = Polymer.dom(this.root).querySelector('#questionnaire');
        let questionnaire = questionnaireTab && questionnaireTab.getQuestionnaireData();
        if (questionnaire) {
            data.questionnaire = questionnaire;
        } else {
            delete data.questionnaire;
        }

        let reportTab = Polymer.dom(this.root).querySelector('#report');
        let subjectAreas = reportTab && reportTab.getRisksData();
        data.test_subject_areas = subjectAreas || {};
        let findingsData = reportTab && reportTab.getFindingsData();
        if (findingsData && findingsData.length) { data.findings = findingsData; }

        return data;
    },

    customBasicValidation: function() {
        let reportTab = Polymer.dom(this.root).querySelector('#report');
        if (!reportTab) { return true; }

        let reportValid = reportTab.validate('forSave');

        if (!reportValid) {
            this.set('tab', 'report');
            this.fire('toast', {text: 'Fix invalid fields before saving'});
            return false;
        }
        return true;
    }
});
