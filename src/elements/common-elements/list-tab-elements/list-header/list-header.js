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
    _changeOrder: function(event) {
        if (this.noOrdered) { return; }

        let newOrderBy = event.model.item.name,
            [currentOrderName, direction] = this.orderBy.split('.');

        direction = newOrderBy !== currentOrderName || direction !== 'asc' ? 'asc' : 'desc';
        this.orderBy = `${newOrderBy}.${direction}`;
    }
});
