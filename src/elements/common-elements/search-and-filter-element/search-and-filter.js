'use strict';

(function() {
    Polymer({
        is: 'search-and-filter',

        behaviors: [
            APBehaviors.QueryParamsController
        ],

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
                value: function() {
                    return [];
                }
            },
            availableFilters: {
                type: Array,
                value: []
            },
            queryParams: {
                type: Object,
                notify: true
            }
        },

        observers: [
            '_restoreFilters(queryParams.*)'
        ],

        searchKeyDown: function() {
            this.debounce('searchKeyDown', () => {
                if (this.searchString.length !== 1) {
                    this.updateQueries({search: this.searchString || undefined, page: '1'});
                }
            }, 300);
        },

        addFilter: function(e) {
            let query = (typeof e === 'string') ? e : e.model.item.query;
            let alreadySelected = this.usedFilters.findIndex((filter) => {
                return filter.query === query;
            });

            if (alreadySelected === -1) {
                let newFilter = this.filters.find((filter) => {
                    return filter.query === query;
                });

                this.set('availableFilters', this.availableFilters.filter((filter) => {
                    return filter.query !== newFilter.query;
                }));

                this._setFilterValue(newFilter);
                this.push('usedFilters', newFilter);

                if (this.queryParams[query] === undefined) {
                    let queryObject = {};
                    queryObject[query] = true;
                    this.updateQueries(queryObject);
                }
            }
        },

        removeFilter: function(e) {
            let query = e.model.item.query;
            let removedFilter = this.filters.find((filter) => {
                return filter.query === query;
            });

            this.push('availableFilters', removedFilter);

            let indexToRemove = this.usedFilters.indexOf(e.model.item);
            let queryObject = {};
            queryObject[query] = undefined;
            queryObject.page = '1';

            this.splice('usedFilters', indexToRemove, 1);
            this.updateQueries(queryObject);
        },

        _restoreFilters: function() {
            this.debounce('_restoreFilters', () => {
                let queryParams = this.queryParams;

                if (!queryParams) {
                    return;
                }

                this.availableFilters = this.filters;
                this.usedFilters = [];

                if (queryParams.search) {
                    this.set('searchString', queryParams.search);
                } else {
                    this.set('searchString', '');
                }

                this.filters.forEach((filter) => {
                    if (queryParams[filter.query] !== undefined) {
                        this.addFilter(filter.query);
                    }
                });
            }, 50);
        },

        _getFilterIndex: function(query) {
            if (!this.filters) { return -1; }

            return this.filters.findIndex((filter) => {
                return filter.query === query;
            });
        },

        _setFilterValue: function(filter) {
            if (!filter) {
                return;
            }

            let filterValue = this.get(`queryParams.${filter.query}`);

            if (filterValue !== undefined) {
                filter.value = this._getFilterValue(filterValue, filter);
            } else {
                filter.value = undefined;
            }
        },

        _getFilterValue: function(filterValue, filter) {
            if (!filter || !filter.selection || filterValue === undefined) {
                return;
            }

            let optionValue = filter.optionValue;

            return filter.selection.find((selectionItem) => {
                return selectionItem[optionValue].toString() === filterValue;
            });
        },

        _getFilter: function(query) {
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
            if (!e || !e.currentTarget || !detail) {
                return;
            }

            let query = e.currentTarget.id;

            if (detail.selectedValues && query) {
                let filter = this._getFilter(query);
                let optionValue = filter.optionValue || 'value';
                let queryObject = {page: '1'};
                queryObject[query] = detail.selectedValues[optionValue];

                this.updateQueries(queryObject);
            }
        }
    });
})();
