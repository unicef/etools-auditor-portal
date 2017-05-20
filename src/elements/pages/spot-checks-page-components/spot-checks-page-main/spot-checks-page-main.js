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
        return data;
    },

    customBasicValidation: function() {
        return true;
    },

    infoLoaded: function() {
        this.loadChoices('category_of_observation');
    },
    loadChoices: function(property) {
        if (this.getData(property)) { return; }
        let choices = this.getChoices(`engagement_${this.engagement.id}.findings.${property}`);
        if (!choices) {
            choices = [];
            return;
        }
        this._setData(property, choices);
    }
});
