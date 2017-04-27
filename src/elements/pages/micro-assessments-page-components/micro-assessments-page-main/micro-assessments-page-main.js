'use strict';

Polymer({
    is: 'micro-assessments-page-main',
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
        }
    },

    observers: [
        '_routeConfig(route)',
        '_setPermissionBase(engagement.id)'
    ],

    listeners: {
        'engagement-info-loaded': '_infoLoaded'
    },

    _routeConfig: function(route) {
        if (this.route && !~this.route.prefix.indexOf('/micro-assessments')) { return; }

        let id = this.routeData ? this.routeData.id : route.path.split('/')[1];
        if (!isNaN(+id)) {
            this.engagementId = +id;
        } else {
            this.fire('404');
        }
    },
    _allowEdit: function() {
        return false;
    },
    _infoLoaded: function() {
        let tab = this.routeData ? this.routeData.tab : this.route.path.split('/')[2];
        if (!~['overview', 'report', 'questionnaire', 'attachments'].indexOf(tab)) {
            this.routeData.tab = 'overview';
            return;
        }

        this.tab = tab;
    },
    _getMembersLength: function(length) {
        return length || 0;
    },
    _setPermissionBase: function(id) {
        this.permissionBase = id ? `engagement_${id}` : null;
    }
});
