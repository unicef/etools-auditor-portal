'use strict';

Polymer({
    is: 'list-element',

    behaviors: [
        APBehaviors.LocalizationBehavior,
    ],

    properties: {
        basePermissionPath: {
            type: String,
            value: '',
            observer: '_setItemValues'
        },
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
        },
        data: {
            type: Object,
            notify: true
        },
        itemIndex: {
            type: Number
        },
        multiline: {
            type: Boolean,
            value: false
        },
        noHover: {
            type: Boolean,
            value: false
        },
        hover: {
            type: Boolean,
            reflectToAttribute: true
        }
    },

    listeners: {
        'mouseover': '_setHover',
        'mouseleave': '_resetHover',
    },

    observers: [
        '_setRightPadding(headings.*)'
    ],

    _setHover: function() {
        this.hover = true;
    },

    _resetHover: function() {
        this.hover = false;
    },

    _setRightPadding: function() {
        if (!this.headings) { return; }
        let rightPadding = 0;
        let padding;

        this.headings.forEach((heading) => {
            if (typeof heading.size === 'string') {
                padding = parseInt(heading.size, 10) || 0;
                rightPadding += padding;
            }
        });

        this.paddingRight = `${rightPadding}px`;
    },

    _computeShowCollapse: function(details, hasCollapse) {
        return details.length > 0 && hasCollapse;
    },

    _toggleRowDetails: function() {
        Polymer.dom(this.root).querySelector('#details').toggle();
    },

    _isOneOfType: function(item) {
        if (!item) { return false; }

        let types = Array.prototype.slice.call(arguments, 1) || [];

        return !!types.find(type => {
            return !!item[type];
        });
    },

    _getValue: function(item, data, bool) {
        let value;

        if (!item.path) {
            value = this.get('data.' + item.name);
        } else {
            value = this.get('data.' + item.path);
        }

        if (item.name === 'engagement_type' || item.name === 'status') {
            value = this._refactorValue(item.name, value);
        } else if (item.name === 'date') {
            value = this._refactorTime(value);
        } else if (item.name === 'currency') {
            value = this._refactorCurrency(value);
        } else if (item.name === 'percents') {
            value = this._refactorPercents(value);
        } else if (item.name === 'finding' || item.name === 'autoNumber') {
            value = this._refactorFindingNumber();
        }
        // if (typeof value === 'string') { value = value.trim(); }
        if (bool) {
            value = !!value;
        } else if (!value && value !== 0) {
            return false;
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

    _refactorCurrency: function(value) {
        if ((!value || isNaN(+value)) && value !== 0) { return; }
        return (+value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
    },

    _refactorPercents: function(value) {
        let regexp = /[\d]+.[\d]{2}/;
        return regexp.test(value) ? `${value}%` : null;
    },

    _refactorFindingNumber: function() {
        let value = this.itemIndex;
        if (!value && value !== 0) { return; }
        return `000${value + 1}`;
    },

    _getAdditionalValue: function(item) {
        if (!item.additional) { return; }

        let additional = item.additional;
        let value = this._getValue(additional);
        let type = additional.type;

        if (type === 'date') {
            value = this._refactorTime(value);
        }

        return value || '–';
    },

    _getStatus: function(synced) {
        if (synced) { return 'Synced from VISION'; }
    },

    _getLink: function(pattern) {
        if (typeof pattern !== 'string') { return '#'; }

        let link = pattern
            .replace('*data_id*', this.data.id)
            .replace('*engagement_type*', this._refactorValue('link_type', this.data.engagement_type));

        return link.indexOf('undefined') === -1 ? link : '#';
    },

    _emtyObj: function(data) {
        return data && !data.empty;
    },

    _hasProperty: function(data, property, doNotHide) {
        return data && (doNotHide || property && this.get('data.' + property));
    },

    _setItemValues: function(base) {
        if (!base) { return; }
        if (!this.get('itemValues')) { this.set('itemValues', {}); }
        this.setField(this.getChoices(`${base}.engagement_type`), 'engagement_type');
        this.setField(this.getChoices(`${base}.status`), 'status');
        this.set('itemValues.link_type', {
            ma: 'micro-assessments',
            audit: 'audits',
            sc: 'spot-checks',
            sa: 'special-audits'
        });
    },

    setField: function(choices, field) {
        if (!choices || !field) { return; }

        let data = {};
        _.each(choices, (choice) => {
            data[choice.value] = choice.display_name;
        });

        this.set(`itemValues.${field}`, data);
    }

});
