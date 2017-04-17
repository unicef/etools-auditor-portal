'use strict';

Polymer({
    is: 'list-element',
    _toggleRowDetails: function() {
        this.$.details.toggle();
    },
    _isLink: function(link) {
        return !!link;
    },
    _getValue: function(item) {
        if (!item.path) {
            return this.data[item.name] || '--';
        } else {
            let fields = item.path.split('.'),
                value = this.data;

            while (fields.length && value) {
                value = value[fields.shift()];
            }

            return value || '--';
        }
    },
    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },
    _getDisplayValue: function(value) {
        return value || '--';
    },
    _getLink: function(pattern) {
        return pattern.replace('*data_id*', this.data.id);
    }
});
