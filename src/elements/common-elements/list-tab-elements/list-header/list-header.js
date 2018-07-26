'use strict';

Polymer({
    is: 'list-header',

    behaviors: [
        APBehaviors.LocalizationBehavior,
    ],

    properties: {
        basePermissionPath: {
            type: String,
            value: ''
        },
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

        let item = _.get(event, 'model.item');
        if (!item || (item.class && ~item.class.indexOf('no-order'))) { return; }
        let newOrderName = item.name;
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
});
