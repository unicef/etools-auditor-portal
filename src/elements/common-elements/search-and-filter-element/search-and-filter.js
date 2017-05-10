'use strict';

(function() {
    Polymer({
        is: 'search-and-filter',
        behaviors: [APBehaviors.QueryParamsController],
        properties: {
            filters: {
                type: Array,
                value: function() {
                    return [];
                }
            },
            searchLabel: {
                type: String
            },
            searchString: {
                type: String
            },
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
        observers: [
            'hiddenOn(queryParams.show_hidden)',
            '_restoreFilters(filters.*)'
        ],
        ready: function() {
            this.availableFilters = this.filters;
        },
        searchKeyDown: function() {
            this.debounce('searchKeyDown', () => {
                this.updateQueries({search: this.searchString});
            }, 300);
        },
        addFilter: function(e) {
            let query = (typeof e === 'string') ? e : e.model.item.query;
            let newFilter = this.filters.find((filter) => {
                return filter.query === query;
            });

            this.set('availableFilters', this.availableFilters.filter((filter) => {
                return filter.query !== newFilter.query;
            }));

            this._setFilterValue(newFilter);
            this.push('usedFilters', newFilter);
        },
        removeFilter: function(e) {
            let query = (typeof e === 'string') ? e : e.model.item.query;
            let pristineFilter = this.filters.find((filter) => {
                return filter.query === query;
            });

            this.push('availableFilters', pristineFilter);

            let indexToRemove = this.usedFilters.indexOf(e.model.item);
            let queryObject = {};

            queryObject[query] = undefined;

            this.updateQueries(queryObject);
            this.splice('usedFilters', indexToRemove, 1);
        },
        _restoreFilters: function() {
            if (this.queryParams && this.queryParams.search) {
                this.set('searchString', this.queryParams.search);
            }

            this.filters.forEach((filter) => {
                if (this.queryParams && this.queryParams[filter.query] !== undefined) {
                    this.addFilter(filter.query);
                }
            });
        },
        _getFilterIndex: function(query) {
            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },
        _setFilterValue: function(filter) {
            let queryValue = this.get(`queryParams.${filter.query}`);

            if (queryValue !== undefined) {
                filter.value = this._getFilterValue(queryValue, filter);
            }
        },
        _getFilterValue: function(queryValue, filter) {
            let optionValue = filter.optionValue;

            return filter.selection.find((selectionItem) => {
                return selectionItem[optionValue].toString() === queryValue;
            });
        },
        _getFilterSettings: function(query) {
            let filterIndex = this.filters.findIndex((filter) => {
                return filter.query === query;
            });

            if (filterIndex !== -1) {
                return this.get(`filters.${filterIndex}`);
            } else {
                return {};
            }
        },
        _changeFilterValue: function(e, detail) {
            let queryObject = {};
            let query = e.path[0].id;

            if (detail.selectedValues && query) {
                let filterSettings = this._getFilterSettings(query);
                let optionValue = filterSettings.optionValue || 'value';

                queryObject[query] = detail.selectedValues[optionValue];
                this.updateQueries(queryObject);
            }
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
        }
    });
})();
