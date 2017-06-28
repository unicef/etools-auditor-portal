'use strict';

Polymer({
    is: 'list-tab-main',
    behaviors: [APBehaviors.QueryParamsController],
    properties: {
        queryParams: {
            type: Object,
            notify: true,
            observer: '_paramsChanged'
        },
        showingResults: {
            type: String,
            computed: '_computeResultsToShow(listLength, queryParams.page_size)'
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
        emptyObj: {
            type: Object,
            value: function() {
                return {empty: true};
            }
        },
        withoutPagination: {
            type: Boolean,
            value: false
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
        noAdditional: {
            type: Boolean,
            value: false
        }
    },
    _orderChanged: function(newOrder) {
        if (!newOrder || !(this.headings instanceof Array)) { return false; }

        let direction = 'asc';
        let name = newOrder;

        if (name.startsWith('-')) {
            direction = 'desc';
            name = name.slice(1);
        }

        this.headings.forEach((heading, index) => {
            if (heading.name === name) {
                this.set(`headings.${index}.ordered`, direction);
            } else {
                this.set(`headings.${index}.ordered`, false);
            }
        });

        if (this.queryParams.ordering !== this.orderBy) { this.set('queryParams.ordering', this.orderBy); }
    },
    _paramsChanged: function(newParams) {
        if (this.orderBy !== newParams.ordering) { this.orderBy = newParams.ordering; }
    },
    _computeResultsToShow: function(lengthAmount, size) {
        let page = (this.queryParams.page || 1) - 1;
        size = +size || 10;

        let last = size * page + size;
        if (last > lengthAmount) { last = lengthAmount; }
        let first = last ? (size * page + 1) : 0;

        return `${first} - ${last} of ${lengthAmount}`;
    },
    _listDataChanged: function() {
        let rows = Polymer.dom(this.root).querySelectorAll('.list-element');

        if (rows && rows.length) {
            this.noAnimation = true;

            for (let i = 0; i < rows.length; i++) {
                if (rows[i].detailsOpened) {
                    rows[i]._toggleRowDetails();
                }
            }

            this.noAnimation = false;
        }
    }
});
