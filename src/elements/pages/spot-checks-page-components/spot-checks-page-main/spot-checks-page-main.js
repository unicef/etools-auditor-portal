'use strict';

Polymer({
    is: 'spot-checks-page-main',
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
        '_tabChanged(tab)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'save-progress': '_saveProgress',
        'main-action-activated': '_submitReport'
    },

    _validateEngagement: function() {
        let basicInfoValid = this._validateBasicInfo(),
            //TODO: add report vlidation
            reportValid = false;

        if (!basicInfoValid) { return false; }
        if (!reportValid) {
            this.set('tab', 'report');
            this.fire('toast', {text: 'Fill report before submiting!'});
            return false;
        }
        return true;
    },

    customDataPrepare: function(data) {
        return data;
    },

    customBasicValidation: function() {
        return true;
    }
});
