'use strict';

Polymer({
    is: 'list-tab-main',
    behaviors: [TPMBehaviors.QueryParamsController],
    properties: {
        queryParams: {
            type: Object,
            notify: true,
            observer: '_paramsChanged'
        },
        showingResults: {
            type: String,
            computed: '_computeResultsToShow(listLength, queryParams.size)'
        },
        orderBy: {
            type: String,
            value: '',
            observer: '_orderChanged'
        },
        listLength: Number,
        data: {
            type: Array,
            notify: true
        },
        withoutPagination: {
            type: Boolean
        },
        hasCollapse: {
            type: Boolean,
            value: false
        },
        details: {
            type: Array,
            value: function() {
                return [];
            }
        },
    },
    _orderChanged: function(newOrder) {
        if (!newOrder) { return; }

        let [name, direction] = newOrder.split('.');

        this.headings.forEach((heading, index) => {
            if (heading.name === name) {
                this.set(`headings.${index}.ordered`, direction);
            } else {
                this.set(`headings.${index}.ordered`, false);
            }
        });

        if (this.queryParams.ordered_by !== this.orderBy) { this.set('queryParams.ordered_by', this.orderBy); }
    },
    _paramsChanged: function(newParams) {
        if (this.orderBy !== newParams.ordered_by) { this.orderBy = newParams.ordered_by; }
    },
    _computeResultsToShow: function(lengthAmount, size) {
        let page = (this.queryParams.page || 1) - 1;
        size = +(size || 10);

        let last = size * page + size;
        if (last > lengthAmount) { last = lengthAmount; }
        let first = last ? (size * page + 1) : 0;

        return `${first} - ${last} of ${lengthAmount}`;
    },
    _listDataChanged: function() {
        var rows = Polymer.dom(this.root).querySelectorAll('.list-element');
        if (rows && rows.length) {
            for (var i = 0; i < rows.length; i++) {
                if (rows[i].detailsOpened) {
                    this.noAnimation = true;
                    rows[i]._toggleRowDetails();
                    this.noAnimation = false;
                }
            }
        }
    }
});
