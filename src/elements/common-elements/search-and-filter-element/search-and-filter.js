'use strict';

(function() {
    Polymer({
        is: 'search-and-filter',
        behaviors: [TPMBehaviors.QueryParamsController],
        properties: {
            filters: Array,
            usedFilters: {
                type: Array,
                value: [],
            },
            availableFilters: Array,
            queryParams: {
                type: Object,
                notify: true
            }
        },
        observers: ['hiddenOn(queryParams.show_hidden)'],
        searchKeyDown: function() {
            //    search logic
        },
        addFilter: function(e) {
            var newFilter = this.filters.filter(function(filter) {
                return filter.name === e.model.item.name;
            })[0];

            this.set('availableFilters', this.availableFilters.filter(function(filter) {
                return filter.name !== newFilter.name;
            }));

            this.push('usedFilters', newFilter);
        },
        removeFilter: function(e) {

            var filterName = e.model.item.name;
            var pristineFilter = this.filters.filter(function(filter) {
                return filter.name === filterName;
            })[0];

            this.push('availableFilters', pristineFilter);

            var indexToRemove = this.usedFilters.indexOf(e.model.item);

            this.splice('usedFilters', indexToRemove, 1);
        },
        _changeShowHidden: function() {
            if (this.showHidden) {
                this.updateQueries({show_hidden: 'true'});
            } else {
                this.updateQueries({show_hidden: false});
            }
        },
        hiddenOn: function(on) {
            if (on && !this.showHidden) {
                this.showHidden = true;
            } else if (!on && this.showHidden) {
                this.showHidden = false;
            }
        },
        ready: function() {
            this.availableFilters = this.filters;
        }
    });
})();
