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
            },
            previousSearchValue: String
        },

        observers: [
            '_restoreFilters(queryParams.*)'
        ],

        searchKeyDown: function(event, {value}) {
            if ((!this.previousSearchValue && !value) || value === this.previousSearchValue) { return; }
            this.previousSearchValue = value;

            this.debounce('searchKeyDown', () => {
                if (this.searchString.length !== 1) {
                    let query = this.searchString ? encodeURIComponent(this.searchString) : undefined;
                    this.updateQueries({search: query, page: '1'});
                }
            }, 300);
        },

        _isSelected: function(filter) {
            const query = typeof filter === 'string' ? filter : filter.query;
            return this.usedFilters.findIndex(usedFilter => usedFilter.query === query) !== -1;
        },

        addFilter: function(e) {
            let query = (typeof e === 'string') ? e : e.model.item.query;
            let isSelected = this._isSelected(query);

            if (!isSelected) {
                let newFilter = this.filters.find((filter) => {
                    return filter.query === query;
                });

                this._setFilterValue(newFilter);
                this.push('usedFilters', newFilter);

                if (this.queryParams[query] === undefined) {
                    let queryObject = {};
                    queryObject[query] = true;
                    this.updateQueries(queryObject);
                }
            } else {
                this.removeFilter(e);
            }
        },

        removeFilter: function(e) {
            let query = (typeof e === 'string') ? e : e.model.item.query;
            let indexToRemove = this.usedFilters.findIndex((filter) => {
                return filter.query === query;
            });
            if (indexToRemove === -1) { return; }

            let queryObject = {};
            queryObject[query] = undefined;

            if (this.queryParams[query]) {
                queryObject.page = '1';
            }

            if (indexToRemove !== -1) {
                this.splice('usedFilters', indexToRemove, 1);
            }
            this.updateQueries(queryObject);
        },

        _reloadFilters: function() {
            this.set('usedFilters', []);
            this._restoreFilters();
        },

        _restoreFilters: function() {
            this.debounce('_restoreFilters', () => {
                let queryParams = this.queryParams;

                if (!queryParams) {
                    return;
                }

                this.filters.forEach((filter) => {
                    let usedFilter = this.usedFilters.find(used => used.query === filter.query);

                    if (!usedFilter && queryParams[filter.query] !== undefined) {
                        this.addFilter(filter.query);
                    } else if (queryParams[filter.query] === undefined) {
                        this.removeFilter(filter.query);
                    }
                });

                if (queryParams.search) {
                    this.set('searchString', queryParams.search);
                } else {
                    this.set('searchString', '');
                }
                this.set('availableFilters', _.clone(this.filters));
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
                filter.selectedValues = this._getFilterValue(filterValue, filter);
            } else {
                filter.selectedValues = undefined;
            }
        },

        _getFilterValue: function(filterValue, filter) {
            if (!filter || !filter.selection || filterValue === undefined) {
                return;
            }
            let splitValues = filterValue.split(',');
            let optionValue = filter.optionValue;

            const exists = filter.selection.find((selectionItem) => filterValue.indexOf(selectionItem[optionValue].toString()) !== -1);
            
            if (!exists) {
                return;
            }

            return filter.selection.filter(selectionItem => {
                let filVal = selectionItem[optionValue].toString();
                return splitValues.includes(filVal);
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
            let queryObject = {page: '1'};

            if (detail.selectedValues && query) {
                let filter = this._getFilter(query);
                let optionValue = filter.optionValue || 'value';
                queryObject[query] = detail.selectedValues.
                    map(val => val[optionValue]).
                    join(',');
            }
            this.updateQueries(queryObject);

        },
    });
})();
