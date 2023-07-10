import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import {GenericObject} from '../../../../types/global';
import {getStaticData} from '../../../mixins/static-data-controller';
import CommonMethodsMixinLit from '../../../mixins/common-methods-mixin-lit';
import {buildQueryString, updateQueries} from '../../../mixins/query-params-controller';
import {getEndpoint} from '../../../config/endpoints-controller';
import {pageLayoutStyles} from '../../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {elevationStyles} from '@unicef-polymer/etools-modules-common/dist/styles/elevation-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {moduleStyles} from '../../../styles/module-styles-lit';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import '../../../data-elements/engagements-list-data';
import '../../../common-elements/pages-header-element/pages-header-element-lit';
import {BASE_PATH, ROOT_PATH} from '../../../config/config';
import {EtoolsTableColumnType} from '@unicef-polymer/etools-table';
import {
  EtoolsPaginator,
  defaultPaginator,
  getPaginatorWithBackend
} from '@unicef-polymer/etools-table/pagination/etools-pagination';
import '@unicef-polymer/etools-filters/src/etools-filters';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import {
  updateFilterSelectionOptions,
  updateFiltersSelectedValues,
  setselectedValueTypeByFilterKey
} from '@unicef-polymer/etools-filters/src/filters';
import {EngagementFilterKeys, getEngagementFilters, selectedValueTypeByFilterKey} from '../engagement-filters';

/**
 * @customElement
 */
@customElement('engagements-list-view')
export class EngagementsListView extends CommonMethodsMixinLit(LitElement) {
  static get styles() {
    return [pageLayoutStyles, moduleStyles, gridLayoutStylesLit, elevationStyles];
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

        paper-input.vendor-number-input {
          max-width: 45%;
          margin-top: 6px !important;
        }

        pages-header-element {
          box-shadow: 1px -3px 9px 0 #000000;
        }
      </style>

      <engagements-list-data
        id="listData"
        @data-loaded="${({detail}: CustomEvent) => this.onDataLoaded(detail)}"
        .endpointName="${this.endpointName}"
        .requestQueries="${this.requestQueries}"
        .reloadData="${this.reloadData}"
      >
      </engagements-list-data>

      <pages-header-element-lit
        show-export-button
        hide-print-button
        .exportLinks="${this.exportLinks}"
        .link="${this.newBtnLink}"
        .hideAddButton="${this._hideAddButton()}"
        .btnText="${this.addBtnText}"
        page-title="Engagements"
      >
      </pages-header-element-lit>

      <section class="elevation page-content filters" elevation="1">
        <etools-filters .filters="${this.filters}" @filter-change="${this.filtersChange}"></etools-filters>
      </section>

      <section class="elevation page-content no-padding" elevation="1">
        <etools-table
          .caption="${this.tableTitle}"
          .columns="${this.listColumns}"
          .items="${this.engagementsList}"
          .paginator="${this.paginator}"
          singleSort
          @paginator-change="${this.paginatorChange}"
          @sort-change="${this.sortChange}"
        ></etools-table>
      </section>
    `;
  }

  @property({type: String})
  basePermissionPath = '';

  @property({type: Object}) // , notify: true
  queryParams!: GenericObject;

  @property({type: String})
  baseRoute!: string;

  @property({type: Array})
  listColumns: GenericObject[] = [
    {
      label: 'Unique ID #',
      name: 'reference_number',
      link_tmpl: `${ROOT_PATH}/:engagement_type/:id/overview`,
      type: EtoolsTableColumnType.Link,
      sort: 'reference_number'
    },
    {
      label: 'Audit Firm',
      name: 'agreement.auditor_firm.name',
      type: EtoolsTableColumnType.Text,
      sort: 'agreement__auditor_firm__name'
    },
    {
      label: 'Partner Name',
      name: 'partner.name',
      type: EtoolsTableColumnType.Text,
      sort: 'partner__name'
    },
    {
      label: 'Engagement Type',
      name: 'engagement_type',
      type: EtoolsTableColumnType.Text,
      sort: 'engagement_type'
    },
    {
      label: 'Status',
      name: 'status',
      type: EtoolsTableColumnType.Custom,
      sort: 'status',
      customMethod: (item: any, _key: string) => {
        return `${item.status} ${prettyDate(item.status_date)})`;
      }
    }
  ];

  @property({type: Object})
  paginator: EtoolsPaginator = {...defaultPaginator};

  @property({type: Array})
  filters!: EtoolsFilter[];

  @property({type: Array})
  engagementsList: any[] = [];

  @property({type: String})
  newBtnLink = `/${BASE_PATH}/engagements/new/overview`;

  @property({type: String})
  tableTitle = '';

  @property({type: String})
  addBtnText = 'Add New Engagement';

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Boolean}) // , notify: true
  reloadData = false;

  @property({type: Array})
  exportLinks: any[] = [];

  @property({type: String})
  endpointName = '';

  @property({type: Object})
  requestQueries!: GenericObject;

  connectedCallback() {
    super.connectedCallback();
    this.filtersDataLoaded = this.filtersDataLoaded.bind(this);
    document.addEventListener('engagements-filters-data-loaded', this.filtersDataLoaded);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('engagements-filters-data-loaded', this.filtersDataLoaded);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('isStaffSc') || changedProperties.has('listColumns')) {
      this._changeLinkTemplate(this.isStaffSc, this.listColumns);
    }
    if (changedProperties.has('endpointName')) {
      this._setExportLinks();
    }
  }

  filtersDataLoaded() {
    this.initFiltersForDisplay();
  }

  initFiltersForDisplay() {
    setselectedValueTypeByFilterKey(selectedValueTypeByFilterKey);
    const availableFilters = JSON.parse(JSON.stringify(getEngagementFilters()));
    this.populateDropdownFilterOptionsFromCommonData(availableFilters);
    const currentParams = Object.assign({}, this.queryParams || {});
    ['page', 'page_size', 'sort'].forEach((key) => {
      if (currentParams[key]) {
        delete currentParams[key];
      }
    });
    this.filters = availableFilters;
    this.filters = updateFiltersSelectedValues(currentParams, this.filters);
  }

  populateDropdownFilterOptionsFromCommonData(filters: EtoolsFilter[]) {
    updateFilterSelectionOptions(filters, EngagementFilterKeys.partner__in, getStaticData('filterPartners') || []);
    updateFilterSelectionOptions(
      filters,
      EngagementFilterKeys.agreement__auditor_firm__in,
      getStaticData('filterAuditors') || []
    );
    updateFilterSelectionOptions(filters, EngagementFilterKeys.status__in, getStaticData('statuses') || []);
    updateFilterSelectionOptions(
      filters,
      EngagementFilterKeys.engagement_type__in,
      getStaticData('engagementTypes') || []
    );
    // updateFilterSelectionOptions(
    //   filters,
    //   EngagementFilterKeys.staff_members__user__in,
    //   getStaticData('staffMembersUsers') || []
    // );
  }

  paginatorChange(e: CustomEvent) {
    this.paginator = {...e.detail};
    const {page, page_size}: EtoolsPaginator = e.detail;
    updateQueries({page: page, page_size: page_size});
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
    updateQueries({ordering: `${sortCol.sort === 'asc' ? '' : '-'}${colKeyToSortKey[sortCol.name]}`});
  }

  filtersChange(e: CustomEvent) {
    this.paginator.page = 1;
    updateQueries({...e.detail, page: 1, page_size: this.paginator.page_size});
  }

  _hideAddButton() {
    return this.isReadOnly('partner', this.isStaffSc ? 'new_staff_sc' : 'new_engagement');
  }

  onDataLoaded(data: GenericObject) {
    debugger;
    this.engagementsList = data.results;
    this.paginator = getPaginatorWithBackend(this.paginator, data.count);
    this.tableTitle = `${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of
      ${this.paginator.count}`;
    this._setExportLinks();
  }

  _setExportLinks() {
    const endpoint = getEndpoint(this.endpointName);
    const queryString = buildQueryString(this.queryParams);
    const exportLinks = endpoint ? [{name: 'Export Engagements', url: `${endpoint.url}csv/?${queryString}`}] : [];
    this.exportLinks = exportLinks;
  }

  _changeLinkTemplate(isStaffSc, headings) {
    if (!headings) {
      return;
    }
    if (isStaffSc) {
      this.listColumns[0].link = 'staff-spot-checks/*data_id*/overview';
    } else {
      this.listColumns[0].link = '*engagement_type*/*data_id*/overview';
    }
  }
}
