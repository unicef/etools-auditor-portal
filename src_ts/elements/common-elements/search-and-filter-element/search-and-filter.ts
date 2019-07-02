import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-flex-layout/iron-flex-layout-classes'; // to include iron-flex style classes
import '@polymer/paper-card/paper-card';
import '@polymer/paper-input/paper-input';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-icon-item';

import {sharedStyles} from '../../styles-elements/shared-styles';
import {moduleStyles} from '../../styles-elements/module-styles';
import {tabInputsStyles} from '../../styles-elements/tab-inputs-styles';
import QueryParamsController from '../../app-mixins/query-params-controller';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';

import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import {searchAndFilterStyles} from './search-and-filter-styles';

/**
 * @customElement
 * @polymer
 * @appliesMixin QueryParamsController
 */
class SearchAndFilter extends QueryParamsController(PolymerElement) {

  static get template() {
    // language=HTML
    return html`
      <style include="iron-flex"></style>
      ${sharedStyles} ${moduleStyles} ${tabInputsStyles} ${searchAndFilterStyles}
      <paper-card class="second-header horizontal layout center">
        <div class="flex horizontal layout wrap">
          <div class="layout horizontal search-input-container">
            <paper-input
                type="search"
                value="{{searchString}}"
                label="[[searchLabel]]"
                on-value-changed="searchKeyDown"
                inline>

              <iron-icon icon="search" slot="prefix"></iron-icon>
            </paper-input>
          </div>

          <!-- FILTERS -->
          <template is="dom-repeat" items="[[usedFilters]]">
            <div class="layout horizontal">
              <etools-dropdown-multi
                  id="[[item.query]]"
                  class="filter-dropdown"
                  selected-values="[[item.selectedValues]]"
                  label="[[item.label]]"
                  placeholder$="&#8212;"
                  options="[[item.selection]]"
                  option-label="[[item.optionLabel]]"
                  option-value="[[item.optionValue]]"
                  trigger-value-change-event
                  on-etools-selected-items-changed="_changeFilterValue"
                  hide-search="[[item.hideSearch]]">
              </etools-dropdown-multi>
            </div>
          </template>
        </div>

        <!-- ADD FILTERS -->
        <div id="add-filter-container">
          <paper-menu-button horizontal-align="right"
                             ignore-select
                             no-overlap>
            <paper-button slot="dropdown-trigger">
              <iron-icon icon="filter-list"
                         class="filter-list-icon"></iron-icon>

              <span class="add-filter-text">ADD FILTER</span>

            </paper-button>

            <paper-listbox multi slot="dropdown-content" selected="0">
              <template is="dom-repeat"
                        items="[[availableFilters]]">
                <paper-icon-item on-tap="addFilter">
                  <iron-icon icon="check"
                             item-icon
                             hidden$="[[!_isSelected(item, availableFilters)]]"></iron-icon>
                  [[item.name]]
                  </paper-item>
              </template>
            </paper-listbox>
          </paper-menu-button>

        </div>
      </paper-card>
    `;
  }

  @property({type: Array})
  filters: any[] = [];

  @property({type: String})
  searchLabel: string = '';

  @property({type: String})
  searchString: string = '';

  @property({type: Array})
  usedFilters: any[] = [];

  @property({type: Array})
  availableFilters: any[] = [];

  @property({type: Object, notify: true})
  queryParams: GenericObject = {};

  @property({type: String})
  previousSearchValue: string = '';

  private _searchKeyDownDebounce!: Debouncer;
  private _restoreFiltersDebounce!: Debouncer;

  static get observers() {
    return [
      '_restoreFilters(queryParams.*)'
    ];
  }

  searchKeyDown(event, {value}) {
    if ((!this.previousSearchValue && !value) || value === this.previousSearchValue) {
      return;
    }
    this.previousSearchValue = value;

    this._searchKeyDownDebounce = Debouncer.debounce(this._searchKeyDownDebounce,
        timeOut.after(300),
        () => {
          if (this.searchString.length !== 1) {
            let query = this.searchString ? encodeURIComponent(this.searchString) : undefined;
            this.updateQueries({search: query, page: '1'});
          }
        });
  }

  _isSelected(filter) {
    const query = typeof filter === 'string' ? filter : filter.query;
    return this.usedFilters.findIndex(usedFilter => usedFilter.query === query) !== -1;
  }

  addFilter(e) {
    // TODO: polymer 3 migration - make sure e.model.item works
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
  }

  removeFilter(e) {
    let query = (typeof e === 'string') ? e : e.model.item.query;
    let indexToRemove = this.usedFilters.findIndex((filter) => {
      return filter.query === query;
    });
    if (indexToRemove === -1) {
      return;
    }

    let queryObject = {};
    queryObject[query] = undefined;

    if (this.queryParams[query]) {
      queryObject.page = '1';
    }

    if (indexToRemove !== -1) {
      this.splice('usedFilters', indexToRemove, 1);
    }
    this.updateQueries(queryObject);
  }

  _reloadFilters() {
    this.set('usedFilters', []);
    this._restoreFilters();
  }

  _restoreFilters() {
    this._restoreFiltersDebounce = Debouncer.debounce(this._restoreFiltersDebounce,
        timeOut.after(50),
        () => {
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
          this.set('availableFilters', clone(this.filters));
        });
  }

  _getFilterIndex(query) {
    if (isEmpty(this.filters)) {
      return -1;
    }

    return this.filters.findIndex((filter) => {
      return filter.query === query;
    });
  }

  _setFilterValue(filter) {
    if (!filter) {
      return;
    }

    let filterValue = this.get(`queryParams.${filter.query}`);

    if (filterValue !== undefined) {
      filter.selectedValues = this._getFilterValue(filterValue, filter);
    } else {
      filter.selectedValues = undefined;
    }
  }

  _getFilterValue(filterValue, filter) {
    if (!filter || !filter.selection || filterValue === undefined) {
      return;
    }
    let splitValues = filterValue.split(',');
    let optionValue = filter.optionValue;

    const exists = filter.selection.find(
        (selectionItem) => filterValue.indexOf(selectionItem[optionValue].toString()) !== -1);

    if (!exists) {
      return;
    }

    return filter.selection.filter(selectionItem => {
      let filVal = selectionItem[optionValue].toString();
      return splitValues.includes(filVal);
    });

  }

  _getFilter(query) {
    let filterIndex = this.filters.findIndex((filter) => {
      return filter.query === query;
    });

    if (filterIndex !== -1) {
      return this.get(`filters.${filterIndex}`);
    } else {
      return {};
    }
  }

  // TODO: polymer 3 migration - test this on selection change handler for etools-dropdown-multi
  _changeFilterValue(e, detail) {
    if (!e || !e.currentTarget || !detail) {
      return;
    }

    let query = e.currentTarget.id;
    let queryObject = {page: '1'};

    if (detail.selectedValues && query) {
      let filter = this._getFilter(query);
      let optionValue = filter.optionValue || 'value';
      queryObject[query] = detail.selectedValues.map(val => val[optionValue]).join(',');
    }
    this.updateQueries(queryObject);

  }

}

window.customElements.define('search-and-filter', SearchAndFilter);
