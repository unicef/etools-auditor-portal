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
import {updateQueries} from '../../app-mixins/query-params-controller';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';

import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
declare const moment: any;
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi';
import {searchAndFilterStyles} from './search-and-filter-styles';

export enum FilterTypes {
  DropdownMulti,
  Date
}

/**
 * @customElement
 * @polymer
 */
class SearchAndFilter extends PolymerElement {

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
                <template is="dom-if" if="[[filterTypeIsDropdownMulti(item.type)]]">
                  <etools-dropdown-multi
                      id="[[item.query]]"
                      class="filter-dropdown"
                      selected-values="{{item.selectedValues}}"
                      label="[[item.label]]"
                      placeholder$="&#8212;"
                      options="[[item.selection]]"
                      option-label="[[item.optionLabel]]"
                      option-value="[[item.optionValue]]"
                      trigger-value-change-event
                      on-etools-selected-items-changed="_filterDropdownMultiHasChanged"
                      hide-search="[[item.hideSearch]]">
                  </etools-dropdown-multi>
                </template>
                <template is="dom-if" if="[[filterTypeIsDate(item.type)]]">
                  <datepicker-lite id="[[item.query]]"
                      class="filter-date"
                      label="[[item.label]]"
                      placeholder="&#8212;"
                      value="{{item.selectedValue}}"
                      on-date-has-changed="_filterDateHasChanged"
                      fire-date-has-changed
                      selected-date-display-format="D MMM YYYY">
                  </datepicker-lite>
              </template>
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
              <template is="dom-repeat" items="[[availableFilters]]">
                <paper-icon-item on-tap="addFilter" selected$="[[_isSelected(item, availableFilters)]]">
                  <iron-icon icon="check" slot="item-icon" hidden$="[[!_isSelected(item, availableFilters)]]"></iron-icon>
                  <paper-item-body>[[item.name]]</paper-item-body>
                </paper-icon-item>
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

  @property({type: Boolean})
  filtersDataLoaded: boolean = false;

  private _searchKeyDownDebounce!: Debouncer;
  private _restoreFiltersDebounce!: Debouncer;

  static get observers() {
    return [
      '_restoreFilters(queryParams.*)'
    ];
  }

  searchKeyDown(_event, {value}) {
    if ((!this.previousSearchValue && !value) || value === this.previousSearchValue) {
      return;
    }
    this.previousSearchValue = value;

    this._searchKeyDownDebounce = Debouncer.debounce(this._searchKeyDownDebounce,
      timeOut.after(300),
      () => {
        if (this.searchString.length !== 1) {
          const query = this.searchString ? encodeURIComponent(this.searchString) : undefined;
          updateQueries({search: query, page: '1'});
        }
      });
  }

  _isSelected(filter) {
    const query = typeof filter === 'string' ? filter : filter.query;
    return this.usedFilters.findIndex(usedFilter => usedFilter.query === query) !== -1;
  }

  addFilter(e) {
    const query = (typeof e === 'string') ? e : e.model.item.query;
    const isSelected = this._isSelected(query);

    if (!isSelected) {
      const newFilter = this.filters.find((filter) => {
        return filter.query === query;
      });
      this._setFilterValue(newFilter);
      this.push('usedFilters', newFilter);
    } else {
      this.removeFilter(e);
    }
    this.set('availableFilters', [...this.availableFilters]);
  }

  removeFilter(e) {
    const query = (typeof e === 'string') ? e : e.model.item.query;
    const indexToRemove = this.usedFilters.findIndex((filter) => {
      return filter.query === query;
    });
    if (indexToRemove === -1) {
      return;
    }

    const queryObject: GenericObject = {};
    queryObject[query] = undefined;

    if (this.queryParams[query]) {
      queryObject.page = '1';
    }

    if (indexToRemove !== -1) {
      this.splice('usedFilters', indexToRemove, 1);
    }

    if (this.queryParams[query] !== undefined) {
      updateQueries(queryObject);
    }
  }

  _reloadFilters() {
    this.set('usedFilters', []);
    this.filtersDataLoaded = true;
    this._restoreFilters();
  }

  _restoreFilters() {
    this._restoreFiltersDebounce = Debouncer.debounce(this._restoreFiltersDebounce,
      timeOut.after(50),
      () => {
        const queryParams = this.queryParams;

        if (!queryParams || !this.filtersDataLoaded) {
          return;
        }

        this.filters.forEach((filter) => {
          const usedFilter = this.usedFilters.find(used => used.query === filter.query);

          if (!usedFilter && queryParams[filter.query] !== undefined) {
            this.addFilter(filter.query);
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

    const filterValue = this.get(`queryParams.${filter.query}`);

    if (filter.type === FilterTypes.DropdownMulti) {
      this._setDropDownFilterValue(filterValue, filter);
    } else if (filter.type === FilterTypes.Date) {
      this._setDateFilterValue(filterValue, filter);
    }
  }

  _setDropDownFilterValue(filterValue, filter) {
    filter.selectedValues = filterValue ? this._getDropdownFilterValue(filterValue, filter) : undefined;
  }

  _setDateFilterValue(filterValue, filter) {
    filter.selectedValue = filterValue ? this._getDatepickerFilterValue(filterValue) : undefined;
  }

  _getDatepickerFilterValue(filterValue) {
    const date = moment(filterValue);
    return date.isValid() ? date.format() : undefined;
  }

  _getDropdownFilterValue(filterValue, filter) {
    if (!filter || !filter.selection || filterValue === undefined) {
      return;
    }
    const splitValues = filterValue.split(',');
    const optionValue = filter.optionValue;

    return filter.selection.filter((option: any) =>
      splitValues.includes(String(option[optionValue]))).map((option: any) => option[optionValue]);
  }

  _getFilter(query) {
    const filterIndex = this.filters.findIndex((filter) => {
      return filter.query === query;
    });

    if (filterIndex !== -1) {
      return this.get(`filters.${filterIndex}`);
    } else {
      return {};
    }
  }

  _filterDropdownMultiHasChanged(e, detail) {
    if (!e || !e.currentTarget || !detail) {
      return;
    }

    const query = e.currentTarget.id;
    const queryObject = {page: '1'};

    if (detail.selectedItems && query) {
      const filter = this._getFilter(query);
      const optionValue = filter.optionValue || 'value';
      queryObject[query] = detail.selectedItems.map(val => val[optionValue]).join(',');
    }
    updateQueries(queryObject);
  }

  _filterDateHasChanged(e, detail) {
    if (!e || !e.currentTarget || !detail) {
      return;
    }

    const query = e.currentTarget.id;
    const queryObject = {page: '1'};
    if (query) {
      queryObject[query] = detail.date ? moment(detail.date).format('YYYY-MM-DD') : undefined;
    }
    updateQueries(queryObject);
  }

  filterTypeIsDropdownMulti(checkedTypeValue: FilterTypes) {
    return checkedTypeValue === FilterTypes.DropdownMulti;
  }

  filterTypeIsDate(checkedTypeValue: FilterTypes) {
    return checkedTypeValue === FilterTypes.Date;
  }

}

window.customElements.define('search-and-filter', SearchAndFilter);

export {SearchAndFilter as SearchAndFilterEl};
