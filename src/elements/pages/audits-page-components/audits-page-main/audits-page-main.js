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
        '_configButtonsData(engagement, permissionBase)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'engagement-updated': '_engagementUpdated',
        'save-progress': '_saveProgress',
        'finalize-engagement': '_finalizeReport',
        'submit-engagement': '_submitReport',
        'cancel-engagement': '_openCancelDialog',
        'dialog-confirmed': '_cancelEngagement',
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
        if (!reportPage) { return data; }
        let findingsSummaryData = reportPage.getFindingsSummaryData();
        let assessmentOfControlsData = reportPage.getAssessmentOfControlsData() || [];
        let financialFindingData = reportPage.getFinancialFindingsData();
        let keyInternalWeaknessData = reportPage.getKeyInternalWeaknessData();

        _.assign(data, findingsSummaryData, assessmentOfControlsData);

        if (!_.isNull(financialFindingData)) {
            data.financial_finding_set = financialFindingData;
        }

        if (!_.isNull(keyInternalWeaknessData)) {
            data.key_internal_weakness = keyInternalWeaknessData;
        }

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
