'use strict';

Polymer({
    is: 'list-header',

    behaviors: [
        APBehaviors.PermissionController,
    ],

    properties: {
        orderBy: {
            type: String,
            notify: true
        },
        noOrdered: Boolean,
        noAdditional: Boolean
    },

    observers: [
        '_setRightPadding(data.*)'
    ],

    _setRightPadding: function() {
        if (!this.data) { return; }
        let rightPadding = 0;
        let padding;

        this.data.forEach((heading) => {
            if (typeof heading.size === 'string') {
                padding = parseInt(heading.size, 10) || 0;
                rightPadding += padding;
            }
        });

        this.paddingRight = `${rightPadding}px`;
    },

    _changeOrder: function(event) {
        if (this.noOrdered) { return; }

        let newOrderName = event && event.model && event.model.item && event.model.item.name;
        let currentOrderName = this.orderBy || '';
        let direction = '-';

        if (currentOrderName.startsWith('-')) {
            direction = '';
            currentOrderName = currentOrderName.slice(1);
        }

        if (newOrderName !== currentOrderName) {
            direction = '';
        }

        this.orderBy = `${direction}${newOrderName}`;
    },

    getHeadingLabel: function(base, item) {
        if (!base || !item) { return; }

        let labelPath = item.path || item.labelPath;
        let label = this.getFieldAttribute(`${base}.${labelPath}`, 'label', 'GET');

        return (label && typeof label === 'string') ? label : item.label;
    },
});
