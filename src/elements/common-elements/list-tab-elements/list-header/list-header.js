'use strict';

Polymer({
    is: 'list-header',
    properties: {
        orderBy: {
            type: String,
            notify: true
        }
    },
    _changeOrder: function(event) {
        let newOrderBy = event.model.item.name,
            [currentOrderName, direction] = this.orderBy.split('.');

        direction = newOrderBy !== currentOrderName || direction !== 'asc' ? 'asc' : 'desc';
        this.orderBy = `${newOrderBy}.${direction}`;
    }
});
