'use strict';

Polymer({
    is: 'audits-page-main',
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
        data.key_internal_weakness = {};
        return data;
    },

    customBasicValidation: function() {
        return true;
    }
});
