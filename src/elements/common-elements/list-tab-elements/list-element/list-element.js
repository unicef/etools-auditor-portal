'use strict';

Polymer({
    is: 'list-element',
    properties: {
        itemValues: {
            type: Object,
            value: function() {
                return {
                    type: {
                        ma: 'Micro Assessment',
                        audit: 'Audit',
                        sc: 'Spot Check'
                    },
                    link_type: {
                        ma: 'micro-assessments',
                        audit: 'audits',
                        sc: 'spot-checks'
                    },
                    status: {
                        partner_contacted: 'Partner was Contacted'
                    }
                }
            }
        }
    },
    _toggleRowDetails: function() {
        this.$.details.toggle();
    },
    _isLink: function(link) {
        return !!link;
    },
    _getValue: function(item) {
        let value = this.data;
        if (!item.path) {
            value = value[item.name] || '--';
        } else {
            let fields = item.path.split('.');

            while (fields.length && value) {
                value = value[fields.shift()];
            }
        }
        if (item.name === 'type' || item.name ==='status') {
            value = this._refactorValue(item.name, value);
        }

        return value || '--';
    },
    _refactorValue: function(type, value) {
        let values = this.itemValues[type];
        if (values) { return values[value]; }
    },
    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },
    _getDisplayValue: function(value) {
        return value || '--';
    },
    _getLink: function(pattern) {
        return pattern
            .replace('*data_id*', this.data.id)
            .replace('*engagement_type*', this._refactorValue('link_type', this.data.type));
    }
});
