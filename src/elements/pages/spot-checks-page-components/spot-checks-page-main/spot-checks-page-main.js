'use strict';

Polymer({
    is: 'spot-checks-page-main',

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
            value: '/spot-checks'
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
            reportValid = this.getElement('#report').validate();

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
            this.fire('toast', {text: 'Fill report before submiting!'});
            return false;
        }
        return true;
    },

    customDataPrepare: function(data) {
        data = data || {};
        let reportPage = this.getElement('#report');
        if (!reportPage) { return data; }

        let findingData = reportPage.getFindingsData();
        if (findingData) { data.findings = findingData; }

        let internalControlsData = reportPage.getInternalControlsData();
        if (!_.isNull(internalControlsData)) { data.internal_controls = internalControlsData; }

        let overviewData = reportPage.getOverviewData() || {};
        _.assign(data, overviewData);

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
    },

    infoLoaded: function() {
        this.loadChoices('category_of_observation');
    },

    loadChoices: function(property) {
        if (this.getData(property)) { return; }
        let choices = this.getChoices(`engagement_${this.engagement.id}.findings.${property}`);
        if (!choices) { return; }
        this._setData(property, choices);
    }
});
