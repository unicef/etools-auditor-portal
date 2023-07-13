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
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {BASE_PATH} from '../../../config/config';
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
import {
  EngagementFilterKeys,
  getEngagementFilters,
  EngagementSelectedValueTypeByFilterKey
} from '../engagement-filters';
import {
  StaffScFilterKeys,
  getStaffScFilters,
  StaffScSelectedValueTypeByFilterKey
} from '../../staff-sc/staff-sc-filters';
import {getChoices, getHeadingLabel} from '../../../mixins/permission-controller';

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
          .extraCSS="${this.getTableStyle()}"
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

  @property({type: Object})
  columnValuesFullText!: GenericObject;

  @property({type: Array})
  riskTypes!: [];

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
        return html`${item.status} (<span class="dateLabel">${prettyDate(item.status_date)}</span>)`;
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

  @property({type: String})
  newBtnLink = `/${BASE_PATH}/engagements/new/overview`;

  @property({type: String})
  tableTitle = '';

  @property({type: String})
  addBtnText = 'Add New Engagement';

  private _isStaffSc = false;
  @property({type: Boolean})
  get isStaffSc() {
    return this._isStaffSc;
  }

  set isStaffSc(isStaffSc: boolean) {
    if (this._isStaffSc !== isStaffSc) {
      this._isStaffSc = isStaffSc;
      this.setReferenceNumberLink(this._isStaffSc);
    }
  }

  @property({type: Boolean})
  reloadData = false;

  @property({type: Array})
  exportLinks: any[] = [];

  @property({type: String})
  endpointName = '';

  @property({type: Object})
  requestQueries!: GenericObject;

  connectedCallback() {
    super.connectedCallback();
    this.setHeadersText();
    this._setItemValues(this.basePermissionPath);
    this.filtersDataLoaded = this.filtersDataLoaded.bind(this);
    document.addEventListener('engagements-filters-data-loaded', this.filtersDataLoaded);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('engagements-filters-data-loaded', this.filtersDataLoaded);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('endpointName')) {
      this._setExportLinks();
    }
  }

  setHeadersText() {
    this.listColumns.forEach((col) => {
      col.label = getHeadingLabel(this.basePermissionPath, col.path, col.label);
    });
  }

  _setItemValues(base) {
    if (!base) {
      return;
    }
    this.columnValuesFullText = {
      engagementTypes: getChoices(`${base}.engagement_type`),
      status: getChoices(`${base}.status`),
      linkTypes: [
        {value: 'ma', display_name: 'micro-assessments'},
        {value: 'audit', display_name: 'audits'},
        {value: 'sc', display_name: 'spot-checks'},
        {value: 'sa', display_name: 'special-audits'}
      ]
    };
  }

  _refactorValue(type, value) {
    const values = this.itemValues[type];
    if (values) {
      return values[value];
    }
  }

  filtersDataLoaded() {
    this.initFiltersForDisplay();
  }

  setReferenceNumberLink(isStaffSc: boolean) {
    this.listColumns[0].link_tmpl = isStaffSc
      ? `${ROOT_PATH}:engagement_type/:id/overview`
      : `${ROOT_PATH}:staff-spot-checks/:id/overview`;
  }

  initFiltersForDisplay() {
    setselectedValueTypeByFilterKey(
      this.isStaffSc ? StaffScSelectedValueTypeByFilterKey : EngagementSelectedValueTypeByFilterKey
    );
    const availableFilters = JSON.parse(JSON.stringify(this.isStaffSc ? getStaffScFilters() : getEngagementFilters()));
    this.populateFilterOptionsFromCommonData(availableFilters);
    const currentParams = Object.assign({}, this.queryParams || {});
    ['page', 'page_size', 'sort'].forEach((key) => {
      if (currentParams[key]) {
        delete currentParams[key];
      }
    });
    this.filters = availableFilters;
    this.filters = updateFiltersSelectedValues(currentParams, this.filters);
  }

  populateFilterOptionsFromCommonData(filters: EtoolsFilter[]) {
    this.isStaffSc
      ? this.populateStaffScFilterOptionsFromCommonData(filters)
      : this.populateEngagementsFilterOptionsFromCommonData(filters);
  }

  populateEngagementsFilterOptionsFromCommonData(filters: EtoolsFilter[]) {
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
  }

  populateStaffScFilterOptionsFromCommonData(filters: EtoolsFilter[]) {
    updateFilterSelectionOptions(filters, StaffScFilterKeys.partner__in, getStaticData('filterPartners') || []);
    updateFilterSelectionOptions(filters, StaffScFilterKeys.status__in, getStaticData('statuses') || []);
    updateFilterSelectionOptions(
      filters,
      StaffScFilterKeys.staff_members__user__in,
      getStaticData('staffMembersUsers') || []
    );
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
    this.formatTableDataForDisplay(data.results);
    this.engagementsList = data.results;
    this.paginator = getPaginatorWithBackend(this.paginator, data.count);
    this.tableTitle = `${this.paginator.visible_range[0]}-${this.paginator.visible_range[1]} of
      ${this.paginator.count}`;
    this._setExportLinks();
  }

  formatTableDataForDisplay(data: GenericObject[]) {
    (data || []).forEach((item) => {
      item.status = `${this.formatColText(item.status, this.columnValuesFullText.status)}`;
      item.engagement_link = `${this.formatColText(item.engagement_type, this.columnValuesFullText.linkTypes)}`;
      item.engagement_type = `${this.formatColText(item.engagement_type, this.columnValuesFullText.engagementTypes)}`;
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
        font-size: 11px;
        color: var(--dark-secondary-text-color);
      }
    </style>`;
  }

  _setExportLinks() {
    const endpoint = getEndpoint(this.endpointName);
    const queryString = buildQueryString(this.queryParams);
    const exportLinks = endpoint ? [{name: 'Export Engagements', url: `${endpoint.url}csv/?${queryString}`}] : [];
    this.exportLinks = exportLinks;
  }
}
