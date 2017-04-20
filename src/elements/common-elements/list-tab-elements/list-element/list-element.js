'use strict';

Polymer({
    is: 'list-element',
    properties: {
        itemValues: {
            type: Object,
            value: function() {
                return {};
            }
        },
        details: {
            type: Array,
            value: function() {
                return [];
            }
        },
        hasCollapse: {
            type: Boolean,
            value: false
        },
        showCollapse: {
            type: Boolean,
            computed: '_computeShowCollapse(details, hasCollapse)'
        }
    },
    _computeShowCollapse(details, hasCollapse) {
        return details.length > 0 && hasCollapse;
    },
    _toggleRowDetails: function() {
        Polymer.dom(this.root).querySelector('#details').toggle();
    },
    _isLink: function(link) {
        return !!link;
    },
    _getValue: function(item) {
        let value;

        if (!item.path) {
            value = this.get('data.' + item.name);
        } else {
            value = this.get('data.' + item.path);
        }
        // if (item.name === 'type' || item.name ==='status') {
        //     value = this._refactorValue(item.name, value);
        // }

        return value || '--';
    },
    _refactorValue: function(type, value) {
        let values = this.itemValues[type];
        if (values) { return values[value]; }
    },
    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },
    _getLink: function(pattern) {
        return pattern
            .replace('*data_id*', this.data.id);
    }
});
