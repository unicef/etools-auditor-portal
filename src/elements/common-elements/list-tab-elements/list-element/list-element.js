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
                        partner_contacted: 'Partner was Contacted',
                        field_visit: 'Field Visit',
                        draft_issued_to_partner: 'Draft Report Issued To IP',
                        comments_received_by_partner: 'Comments Received By IP',
                        draft_issued_to_unicef: 'Draft Report Issued To UNICEF',
                        comments_received_by_unicef: 'Comments Received By UNICEF',
                        report_submitted: 'Report Submitted',
                        final: 'Final Report'
                    }
                };
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
        },
        data: {
            type: Object,
            notify: true
        }
    },
    _computeShowCollapse(details, hasCollapse) {
        return details.length > 0 && hasCollapse;
    },
    _toggleRowDetails: function() {
        Polymer.dom(this.root).querySelector('#details').toggle();
    },
    _isOneOfType: function(item) {
        if (!item) { return false; }

        let types = Array.prototype.slice.call(arguments, 1) || [];

        return !!types.filter(type => {
            return !!item[type];
        }).length;
    },
    _getValue: function(item, data, bool) {
        let value;

        if (!item.path) {
            value = this.get('data.' + item.name);
        } else {
            value = this.get('data.' + item.path);
        }

        if (item.name === 'type' || item.name === 'status') {
            value = this._refactorValue(item.name, value);
        } else if (item.name === 'date') {
            value = this._refactorTime(value);
        }

        if (bool) {
            value = !!value;
        } else if (!value) {
            value = '--';
        }

        return value;
    },
    _refactorValue: function(type, value) {
        let values = this.itemValues[type];
        if (values) { return values[value]; }
    },
    _refactorTime: function(value, format = 'DD MMM YYYY') {
        if (!value) { return; }

        let date = new Date(value);
        if (date.toString() !== 'Invalid Date') {
            return moment.utc(date).format(format);
        }
    },
    _getAdditionalValue: function(item) {
        if (!item.additional) { return; }

        let additional = item.additional;
        let value = this._getValue(additional);
        let type = additional.type;

        if (type === 'date') {
            value = this._refactorTime(value);
        }

        return value || '--';
    },
    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },
    _getLink: function(pattern) {
        return pattern
            .replace('*data_id*', this.data.id)
            .replace('*engagement_type*', this._refactorValue('link_type', this.data.type));
    },
    _emtyObj: function(data) {
        return data && !data.empty;
    },
    _hasProperty: function(data, property) {
        return data && property && this.get('data.' + property);
    }
});
