'use strict';

Polymer({
    is: 'micro-assessments-page-main',

    behaviors: [
        APBehaviors.EngagementBehavior,
        APBehaviors.CommonMethodsBehavior,
    ],

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
        '_checkAvailableTab(engagement, permissionBase, route)',
        '_setPermissionBase(engagement.id)',
        '_tabChanged(tab)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'engagement-updated': '_engagementUpdated',
        'main-action-activated': '_mainActionActivated'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo();
        let questionnaireValid = this.getElement('#questionnaire').validateComplited();
        let reportValid = this.getElement('#report').validate();

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
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
        const hasReport  = this.hasReportAccess(this.permissionBase, this.engagement);
        let reportTab = hasReport ? this.getElement('#report'): null;

        let subjectAreas = reportTab && reportTab.getInternalControlsData();
        if (subjectAreas) { data.test_subject_areas = subjectAreas; }

        let overallRisk = reportTab && reportTab.getPrimaryRiskData();
        if (overallRisk) { data.overall_risk_assessment = overallRisk; }

        let findingsData = reportTab && reportTab.getFindingsData();
        if (findingsData && findingsData.length) { data.findings = findingsData; }

        //FollowUp data
        let followUpPage = this.getElement('#follow-up'),
            followUpData = followUpPage && followUpPage.getFollowUpData() || {};
        _.assign(data, followUpData);

        return data;
    },

    customBasicValidation: function() {
        const hasReport  = this.hasReportAccess(this.permissionBase, this.engagement);
        if (!hasReport) {
            return true;
        }
        let reportTab = this.getElement('#report');

        let reportValid = reportTab.validate('forSave');

        if (!reportValid) {
            this.set('tab', 'report');
            return false;
        }
        return true;
    }
});
