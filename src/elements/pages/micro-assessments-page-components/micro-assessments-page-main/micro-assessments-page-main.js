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
                return ['overview', 'report', 'questionnaire', 'attachments', 'follow-up'];
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
        'engagement-updated': '_engagementUpdated',
        'dialog-confirmed': '_cancelEngagement',
        'main-action-activated': '_mainActionActivated'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo();
        let questionnaireValid = this.getElement('#questionnaire').validateComplited();
        let reportValid = this.getElement('#report').validate();

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
        data = data || {};
        let questionnaireTab = this.getElement('#questionnaire');
        let questionnaire = questionnaireTab && questionnaireTab.getQuestionnaireData();
        if (questionnaire) {
            data.questionnaire = questionnaire;
        } else {
            delete data.questionnaire;
        }

        let reportTab = this.getElement('#report');
        let subjectAreas = reportTab && reportTab.getRisksData();
        data.test_subject_areas = subjectAreas || {};
        let findingsData = reportTab && reportTab.getFindingsData();
        if (findingsData && findingsData.length) { data.findings = findingsData; }

        //FollowUp data
        let followUpPage = this.getElement('#follow-up'),
            followUpData = followUpPage && followUpPage.getFollowUpData() || {};
        _.assign(data, followUpData);

        return data;
    },

    customBasicValidation: function() {
        let reportTab = this.getElement('#report');
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
