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
        if (id && !isNaN(+id)) {
            this.engagementId = +id;
        } else {
            this.fire('404');
        }
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
        if (isNaN(+length)) { length = 0; }
        return +length || 0;
    },
    _setPermissionBase: function(id) {
        if ( (!id && id !== 0 )|| isNaN(+id)) {
            this.permissionBase = null;
        } else {
            this.permissionBase = `engagement_${id}`;
        }
    }
});
