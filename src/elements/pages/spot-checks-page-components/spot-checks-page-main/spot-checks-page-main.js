'use strict';

Polymer({
    is: 'spot-checks-page-main',

    behaviors: [
        APBehaviors.EngagementBehavior,
        APBehaviors.StaticDataController,
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
                return ['overview', 'report', 'attachments', 'follow-up'];
            }
        },
        engagementPrefix: {
            type: String,
            value: '/spot-checks'
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
        'dialog-confirmed': '_cancelEngagement',
        'main-action-activated': '_mainActionActivated'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo(),
            reportValid = this.getElement('#report').validate();

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
            return false;
        }
        return true;
    },

    customDataPrepare: function(data) {
        data = data || {};
        //Rport data
        let reportPage = this.getElement('#report');

        let findingData = reportPage && reportPage.getFindingsData();
        if (findingData) { data.findings = findingData; }

        let internalControlsData = reportPage && reportPage.getInternalControlsData();
        if (!_.isNull(internalControlsData)) { data.internal_controls = internalControlsData; }

        let overviewData = reportPage && reportPage.getOverviewData() || {};
        _.assign(data, overviewData);

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
