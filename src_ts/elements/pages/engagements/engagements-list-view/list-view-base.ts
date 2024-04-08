import {LitElement, html, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {buildQueryString, updateQueries} from '../../../mixins/query-params-controller';
import {getEndpoint} from '../../../config/endpoints-controller';
import {pageLayoutStyles} from '../../../styles/page-layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '../../../common-elements/pages-header-element/pages-header-element';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import '@unicef-polymer/etools-unicef/src/etools-table/etools-table';
import {EtoolsTableColumnType} from '@unicef-polymer/etools-unicef/src/etools-table/etools-table.js';
import {
  EtoolsPaginator,
  defaultPaginator,
  getPaginatorWithBackend
} from '@unicef-polymer/etools-unicef/src/etools-table/pagination/etools-pagination';
import '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {getLabelFromOptions, getOptionsChoices} from '../../../mixins/permission-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState, store} from '../../../../redux/store';
import {RouteDetails, RouteQueryParams} from '@unicef-polymer/etools-types/dist/router.types';
import {buildUrlQueryString, cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import pick from 'lodash-es/pick';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {CommonDataState} from '../../../../redux/reducers/common-data';
import {updateFiltersSelectedValues} from '@unicef-polymer/etools-unicef/src/etools-filters/filters';
import omit from 'lodash-es/omit';
import {getDataFromSessionStorage, setDataOnSessionStorage} from '../../../utils/utils';

/**
 * @customElement
 */
export class ListViewBase extends connect(store)(CommonMethodsMixin(LitElement)) {
  static get styles() {
    return [pageLayoutStyles, moduleStyles, layoutStyles, elevationStyles];
  }

  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }

        etools-input.vendor-number-input {
          max-width: 45%;
          margin-top: 6px !important;
        }

        pages-header-element {
          box-shadow: 1px -3px 9px 0 #000000;
        }
        section {
          position: relative;
        }
        .search-filters {
          flex-grow: 1;
          margin-block: 8px;
          width: 100%;
        }
        etools-filters::part(filter-search) {
            min-width: 370px;
        }
        @media (max-width: 640px) {
            etools-filters::part(filter-search) {
              min-width: 100%;
              width: 100%;
          }
          etools-filters::part(filters) {
            width: 100%;
          }
        }
      </style>

      <pages-header-element
        show-export-button
        hide-print-button
        .exportLinks="${this.exportLinks}"
        .link="${this.newBtnLink}"
        .hideAddButton="${this.hideAddButton}"
        .btnText="${this.addBtnText}"
        page-title=""
      >
      </pages-header-element>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters
          class="search-filters"
          .filters="${this.filters}"
          @filter-change="${this.filtersChange}"
          @click="${() => {
            this.filtersInitialized = !!this.filters?.length;
          }}"
        ></etools-filters>
      </section>

      <section class="elevation page-content" elevation="1">
        <etools-loading
          ?active="${this.listLoadingActive}"
          loading-text="Loading of engagements list..."
        ></etools-loading>
        <etools-table
          .caption="${this.tableTitle}"
          .columns="${this.listColumns}"
          .items="${this.engagementsList}"
          .paginator="${this.paginator}"
          .extraCSS="${this.getTableStyle()}"
          singleSort
          @paginator-change="${this.paginatorChange}"
          @sort-change="${this.sortChange}"
        ></etools-table>
      </section>
    `;
  }

  @property({type: Boolean})
  hideAddButton!: boolean;

  @property({type: Boolean})
  listLoadingActive!: boolean;

  @property({type: Object})
  columnValuesFromOptions!: GenericObject;

  @property({type: Array})
  listColumns: GenericObject[] = [
    {
      label: 'Unique ID #',
      name: 'reference_number',
      link_tmpl: `${ROOT_PATH}:engagement_link/:id/overview`,
      type: EtoolsTableColumnType.Link,
      sort: 'reference_number',
      path: 'reference_number'
    },
    {
      label: 'Audit Firm',
      name: 'agreement.auditor_firm.name',
      type: EtoolsTableColumnType.Text,
      sort: 'agreement__auditor_firm__name',
      path: 'agreement.audit_firm'
    },
    {
      label: 'Name',
      name: 'partner.name',
      type: EtoolsTableColumnType.Text,
      sort: 'partner__name',
      path: 'partner.name'
    },
    {
      label: 'Engagement Type',
      name: 'engagement_type',
      type: EtoolsTableColumnType.Text,
      sort: 'engagement_type',
      path: 'engagement_type'
    },
    {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Custom,
      sort: 'status',
      path: 'status',
      customMethod: (item: any, _key: string) => {
        return html`${item.status} <span class="dateLabel">(${prettyDate(item.status_date)})</span>`;
      }
    }
  ];

  @property({type: Object})
  paginator: EtoolsPaginator = {...defaultPaginator};

  @property({type: Array})
  filters!: EtoolsFilter[];

  @property({type: Object})
  itemValues: GenericObject = {};

  @property({type: Array})
  engagementsList: any[] = [];

  @property() filtersInitialized = false;

  @property({type: String})
  newBtnLink = `engagements/new/overview`;

  @property({type: String})
  tableTitle = '';

  @property({type: String})
  addBtnText = 'Add New Engagement';

  @property({type: Boolean})
  isStaffSc!: boolean;

  @property({type: Array})
  exportLinks: any[] = [];

  @property({type: String})
  endpointName = '';

  @property({type: String})
  prevQueryObjKey!: string;

  set prevQueryStringObj(val: GenericObject) {
    setDataOnSessionStorage(this.prevQueryObjKey, val);
  }

  get prevQueryStringObj() {
    return getDataFromSessionStorage(this.prevQueryObjKey);
  }

  private routeDetails!: RouteDetails | null;

  connectedCallback() {
    super.connectedCallback();
    this.getListData = debounce(this.getListData.bind(this), 400) as any;
  }

  baseStateChanged(state: RootState) {
    if (!isJsonStrMatch(state.app.routeDetails, this.routeDetails)) {
      this.routeDetails = cloneDeep(state.app.routeDetails);
      if (this.hadToinitializeUrlWithPrevQueryString(this.routeDetails)) {
        return;
      }
      this.setReferenceNumberLink(this.isStaffSc);
      this.initializePaginatorFromUrl(this.routeDetails?.queryParams);
      this.getListData();
    }
    this.checkAddButtonVisibility(state.commonData);
    this.initFiltersForDisplay(state);
  }

  hadToinitializeUrlWithPrevQueryString(stateRouteDetails: any) {
    if (
      (!stateRouteDetails.queryParams || Object.keys(stateRouteDetails.queryParams).length === 0) &&
      this.prevQueryStringObj
    ) {
      this.updateCurrentParams(this.prevQueryStringObj);
      return true;
    }
    return false;
  }

  private updateCurrentParams(paramsToUpdate: GenericObject<any>, reset = false): void {
    let currentParams = this.routeDetails ? this.routeDetails.queryParams : this.prevQueryStringObj;
    if (reset) {
      currentParams = pick(currentParams, ['ordering', 'page_size', 'page']);
    }
    const newQueryObj = cloneDeep({...currentParams, ...paramsToUpdate});
    this.prevQueryStringObj = newQueryObj;
    const stringParams: string = buildUrlQueryString(newQueryObj);
    EtoolsRouter.replaceAppLocation(`${this.isStaffSc ? 'staff-sc' : 'engagements'}/list?${stringParams}`);
  }

  initializePaginatorFromUrl(queryParams: any) {
    if (queryParams.page) {
      this.paginator.page = Number(queryParams.page);
    } else {
      this.paginator.page = 1;
    }

    if (queryParams.page_size) {
      this.paginator.page_size = Number(queryParams.page_size);
    }
  }

  getListData() {
    this.listLoadingActive = true;
    const endpoint = getEndpoint(this.endpointName);
    endpoint.url += `?${buildUrlQueryString(this.routeDetails!.queryParams! || {})}`;
    sendRequest({
      endpoint: endpoint
    })
      .then((resp) => {
        this.onDataLoaded(resp);
      })
      .catch((err) => {
        console.log('onDataLoadError:', err);
        this.onDataLoadError(err);
      })
      .finally(() => {
        this.listLoadingActive = false;
      });
  }

  onDataLoadError(err) {
    const {status} = (err || {}) as any;

    // wrong page in queries
    if (status === 404 && this.routeDetails!.queryParams!.page !== '1') {
      updateQueries({page: '1'});
      return;
    }
    fireEvent(this, 'toast', {text: 'Error loading data.'});
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('endpointName')) {
      this._setExportLinks();
    }
  }

  private initFiltersForDisplay(state: RootState) {
    if (!this.filters && this.dataRequiredByFiltersHasBeenLoaded(state)) {
      this.setValuesFromOptions(
        this.isStaffSc ? state.commonData.new_staff_scOptions : state.commonData.new_engagementOptions
      );
      this.setValueTypeByFilterKey();
      const availableFilters = JSON.parse(JSON.stringify(this.getFilters()));
      this.populateFilterOptionsFromCommonData(state, availableFilters);
      const currentParams: RouteQueryParams = state.app!.routeDetails.queryParams || {};
      this.filters = updateFiltersSelectedValues(
        omit(currentParams, ['ordering', 'page_size', 'page']),
        availableFilters
      );
    }
  }

  private dataRequiredByFiltersHasBeenLoaded(state: RootState): boolean {
    return !!(
      state.commonData?.loadedTimestamp &&
      this.routeDetails?.queryParams &&
      Object.keys(this.routeDetails?.queryParams).length > 0
    );
  }

  setValuesFromOptions(optionsData) {
    if (!optionsData) {
      return;
    }
    this.setHeadersText(optionsData);
    this.columnValuesFromOptions = {
      engagementTypes: getOptionsChoices(optionsData, 'engagement_type'),
      status: getOptionsChoices(optionsData, 'status'),
      linkTypes: [
        {value: 'ma', display_name: 'micro-assessments'},
        {value: 'audit', display_name: 'audits'},
        {value: 'sc', display_name: 'spot-checks'},
        {value: 'sa', display_name: 'special-audits'}
      ]
    };
  }

  setHeadersText(optionsData) {
    this.listColumns.forEach((col) => {
      col.label = getLabelFromOptions(optionsData, col.path, col.label);
    });
  }

  _refactorValue(type, value) {
    const values = this.itemValues[type];
    if (values) {
      return values[value];
    }
  }

  setReferenceNumberLink(isStaffSc: boolean) {
    this.listColumns[0].link_tmpl = isStaffSc
      ? `${ROOT_PATH}staff-spot-checks/:id/overview`
      : `${ROOT_PATH}:engagement_link/:id/overview`;
  }

  protected populateFilterOptionsFromCommonData(_state: RootState, _filters: EtoolsFilter[]) {
    console.log('populateFilterOptionsFromCommonData / To be implemented in derived class');
  }

  protected getFilters() {
    console.log('getFilters / To be implemented in derived class');
    return [];
  }

  protected setValueTypeByFilterKey() {
    console.log('setValueTypeByFilterKey / To be implemented in derived class');
  }

  paginatorChange(e: CustomEvent) {
    const {page, page_size}: EtoolsPaginator = e.detail;
    this.updateCurrentParams({page, page_size});
  }

  sortChange(e: CustomEvent) {
    const colKeyToSortKey = {
      reference_number: 'reference_number',
      'agreement.auditor_firm.name': 'agreement__auditor_firm__name',
      'partner.name': 'partner__name',
      engagement_type: 'engagement_type',
      status: 'status'
    };
    const sortCol = e.detail.filter((c) => c.sort)[0];
    this.updateCurrentParams({ordering: `${sortCol.sort === 'asc' ? '' : '-'}${colKeyToSortKey[sortCol.name]}`});
  }

  filtersChange(e: CustomEvent) {
    this.filtersInitialized = !!this.filters?.length;
    if (this.filtersInitialized) {
      this.updateCurrentParams({...e.detail, page: 1}, true);
    }
  }

  checkAddButtonVisibility(commonData: CommonDataState) {
    if (
      typeof this.hideAddButton === 'undefined' &&
      typeof this.isStaffSc !== 'undefined' &&
      commonData.loadedTimestamp
    ) {
      this.hideAddButton = this.isReadOnly(
        'partner',
        this.isStaffSc ? commonData.new_staff_scOptions : commonData.new_engagementOptions
      );
    }
  }

  onDataLoaded(data: GenericObject) {
    this.waitForValuesFromOptions().then(() => {
      this.formatTableDataForDisplay(data.results);
      this.engagementsList = data.results;
      this.paginator = getPaginatorWithBackend(this.paginator, data.count);
      this.tableTitle = `${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of
      ${this.paginator.count}`;
      this._setExportLinks();
    });
  }

  waitForValuesFromOptions() {
    return new Promise((resolve) => {
      const check = setInterval(() => {
        if (this.columnValuesFromOptions) {
          clearInterval(check);
          resolve(true);
        }
      }, 50);
    });
  }

  formatTableDataForDisplay(data: GenericObject[]) {
    (data || []).forEach((item) => {
      item.status = `${this.formatColText(item.status, this.columnValuesFromOptions.status)}`;
      item.engagement_link = `${this.formatColText(item.engagement_type, this.columnValuesFromOptions.linkTypes)}`;
      item.engagement_type = `${this.formatColText(
        item.engagement_type,
        this.columnValuesFromOptions.engagementTypes
      )}`;
    });
  }

  formatColText(itemValue: string, colValues: GenericObject[]) {
    const item = colValues.find((x) => x.value === itemValue) || {
      display_name: '—'
    };
    return item.display_name;
  }

  getTableStyle() {
    return html`<style>
      .dateLabel {
        font-size: var(--etools-font-size-11, 11px);
        color: var(--dark-secondary-text-color);
      }
      td[data-label='Reference Number'],
      td[data-label='Engagement Type'] {
        width: 15%;
      }
      td[data-label='Audit Firm'],
      td[data-label='Name'] {
        width: 21%;
      }
      td[data-label='Status'] {
        width: 28%;
      }
    </style>`;
  }

  _setExportLinks() {
    const endpoint = getEndpoint(this.endpointName);
    const queryString = buildQueryString(this.routeDetails?.queryParams);
    const exportLinks = endpoint ? [{name: 'Export Engagements', url: `${endpoint.url}csv/?${queryString}`}] : [];
    this.exportLinks = exportLinks;
  }
}
