'use strict';

Polymer({
    is: 'special-audits-page-main',

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
        tabsList: {
            type: Array,
            value: function() {
                return ['overview', 'report', 'attachments', 'follow-up'];
            }
        },
        engagementPrefix: {
            type: String,
            value: '/special-audits'
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

        //FollowUp data
        let followUpPage = this.getElement('#follow-up'),
            followUpData = followUpPage && followUpPage.getFollowUpData() || {};
        _.assign(data, followUpData);

        //Report Data
        let reportPage = this.getElement('#report');
        if (!reportPage) { return data; }

        let specificProceduresData = reportPage.getSpecificProceduresData();
        let otherRecommendationsData = reportPage.getOtherRecommendationsData();

        if (!_.isNull(specificProceduresData)) {
            data.specific_procedures = specificProceduresData;
        }

        if (!_.isNull(otherRecommendationsData)) {
            data.other_recommendations = otherRecommendationsData;
        }

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
    }

});
