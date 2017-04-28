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
        '_setPermissionBase(engagement.id)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded',
        'save-progress': '_saveProgress',
        'main-action-activated': '_submitReport'
    },

    _submitReport: function() {
        //TODO: ?replace this method to common engagement behavior?
    },

    _validateEngagement: function() {

    }
});
