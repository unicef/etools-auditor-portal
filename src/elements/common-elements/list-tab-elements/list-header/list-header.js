'use strict';

Polymer({
    is: 'list-header',
    properties: {
        orderBy: {
            type: String,
            notify: true
        },
        noOrdered: Boolean,
        noAdditional: Boolean
    },
    observers: [
        '_setRightPadding(data)'
    ],
    _setRightPadding(headings = []) {
        let rightPadding = 0;
        let padding;

        headings.forEach((heading) => {
            if (typeof heading.size === 'string') {
                padding = parseInt(heading.size, 10) || 0;
                rightPadding += padding;
            }
        });

        this.paddingRight = `${rightPadding}px`;
    },
    _changeOrder: function(event) {
        if (this.noOrdered) { return; }

        let newOrderBy = event.model.item.name,
            [currentOrderName, direction] = this.orderBy.split('.');

        direction = newOrderBy !== currentOrderName || direction !== 'asc' ? 'asc' : 'desc';
        this.orderBy = `${newOrderBy}.${direction}`;
    }
});
