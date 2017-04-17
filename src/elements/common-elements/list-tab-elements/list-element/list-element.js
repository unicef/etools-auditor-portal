'use strict';

Polymer({
    is: 'list-element',
    _toggleRowDetails: function() {
        this.$.details.toggle();
    },
    _isLink: function(link) {
        return !!link;
    },
    _getValue: function(fieldName) {
        return fieldName === 'status' ? this._getStatus(this.data.vision_synced) : this.data[fieldName] || '--';
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
