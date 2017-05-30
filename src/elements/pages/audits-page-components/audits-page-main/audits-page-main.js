'use strict';

Polymer({
    is: 'audits-page-main',
    behaviors: [
        APBehaviors.EngagementBehavior,
        APBehaviors.StaticDataController
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
                return ['overview', 'report', 'attachments'];
            }
        },
        engagementPrefix: {
            type: String,
            value: '/audits'
        }
    },

    observers: [
        '_routeConfig(route)',
        '_setPermissionBase(engagement.id)',
        '_tabChanged(tab)',
        '_configButtonsData(engagement.type)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'engagement-updated': '_engagementUpdated',
        'save-progress': '_saveProgress',
        'main-action-activated': '_mainActionActivated'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo(),
            reportValid = Polymer.dom(this.root).querySelector('#report').validate();

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
            this.fire('toast', {text: 'Fill report before submiting!'});
            return false;
        }
        return true;
    },

    customDataPrepare: function(data) {
        let reportPage = Polymer.dom(this.root).querySelector('#report');
        let findingsSummaryData = reportPage.getFindingsSummaryData() || [];
        let assessmentOfControlsData = reportPage.getAssessmentOfControlsData() || [];
        _.assign(data, findingsSummaryData[0], assessmentOfControlsData[0]);
        data.financial_finding_set = reportPage.getFinancialFindingsData() || [];
        data.key_internal_weakness = {};
        return data;
    },

    customBasicValidation: function() {
        return true;
    },

    infoLoaded: function() {
        if (this.getData('audit_opinions')) { return; }
        let auditOpinions = this.getChoices(`engagement_${this.engagement.id}.audit_opinion`);
        if (!auditOpinions) {
            auditOpinions = [];
            return;
        }
        this._setData('audit_opinions', auditOpinions);
    }
});
