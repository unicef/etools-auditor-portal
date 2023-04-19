import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../types/global';
import {getStaticData} from '../../../mixins/static-data-controller';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {buildQueryString} from '../../../mixins/query-params-controller';
import {getEndpoint} from '../../../config/endpoints-controller';
import {pageLayoutStyles} from '../../../styles/page-layout-styles';
import {sharedStyles} from '../../../styles/shared-styles';
import {moduleStyles} from '../../../styles/module-styles';
import '../../../data-elements/engagements-list-data';
import '../../../common-elements/pages-header-element/pages-header-element';
import '../../../common-elements/search-and-filter-element/search-and-filter';
import '../../../common-elements/list-tab-elements/list-tab-main/list-tab-main';
import {SearchAndFilterEl, FilterTypes} from '../../../common-elements/search-and-filter-element/search-and-filter';
import {BASE_PATH} from '../../../config/config';

function getYearOfAuditOptions() {
  const currYear = new Date().getFullYear();
  return [
    {label: currYear - 1, value: currYear - 1},
    {label: currYear, value: currYear},
    {label: currYear + 1, value: currYear + 1}
  ];
}

/**
 * @customElement
 * @polymer
 */
class EngagementsListView extends CommonMethodsMixin(PolymerElement) {
  static get template() {
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${moduleStyles}
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
        engagements-list="{{engagementsList}}"
        list-length="{{listLength}}"
        request-queries="[[requestQueries]]"
        without-pagination="[[withoutPagination]]"
        on-update-export-links="_setExportLinks"
        endpoint-name="[[endpointName]]"
        reload-data="{{reloadData}}"
      >
      </engagements-list-data>

      <pages-header-element
        show-export-button
        hide-print-button
        export-links="[[exportLinks]]"
        link="{{newBtnLink}}"
        hide-add-button="[[_hideAddButton()]]"
        btn-text="{{addBtnText}}"
        page-title="Engagements"
      >
      </pages-header-element>

      <search-and-filter
        id="filters"
        search-label="Search partner or auditor"
        filters="[[filters]]"
        query-params="{{queryParams}}"
        base-route="[[baseRoute]]"
        search-params="[[searchParams]]"
      >
      </search-and-filter>

      <list-tab-main
        header-title="results to show"
        data="[[engagementsList]]"
        list-length="[[listLength]]"
        headings="[[listHeadings]]"
        has-collapse="[[hasCollapse]]"
        query-params="{{queryParams}}"
        no-additional
        base-permission-path="[[basePermissionPath]]"
      >
      </list-tab-main>
    `;
  }

  @property({type: String})
  basePermissionPath = '';

  @property({type: Object, notify: true})
  queryParams!: GenericObject;

  @property({type: String})
  baseRoute!: string;

  @property({type: Array})
  listHeadings: GenericObject[] = [
    {
      size: 15,
      label: 'Unique ID #',
      name: 'reference_number',
      link: '*engagement_type*/*data_id*/overview',
      ordered: false,
      path: 'reference_number'
    },
    {
      size: 20,
      label: 'Audit Firm',
      labelPath: 'agreement.audit_firm',
      name: 'agreement__auditor_firm__name',
      ordered: false,
      path: 'agreement.auditor_firm.name'
    },
    {
      size: 20,
      label: 'Partner Name',
      name: 'partner__name',
      ordered: false,
      path: 'partner.name'
    },
    {
      size: 15,
      label: 'Engagement Type',
      labelPath: 'engagement_type',
      name: 'engagement_type',
      ordered: false
    },
    {
      size: 30,
      label: 'Status',
      labelPath: 'status',
      name: 'status',
      ordered: false,
      additional: {
        type: 'date',
        path: 'status_date'
      }
    }
  ];

  @property({type: Array})
  filters: GenericObject[] = [
    {
      type: FilterTypes.DropdownMulti,
      name: 'audit firm',
      label: 'Audit Firm',
      query: 'agreement__auditor_firm__in',
      optionValue: 'id',
      optionLabel: 'name',
      selection: []
    },
    {
      type: FilterTypes.DropdownMulti,
      name: 'engagement type',
      label: 'Engagement Type',
      query: 'engagement_type__in',
      hideSearch: true,
      optionValue: 'value',
      optionLabel: 'display_name',
      selection: []
    },
    {
      type: FilterTypes.DropdownMulti,
      name: 'partner',
      label: 'Partner',
      query: 'partner__in',
      optionValue: 'id',
      optionLabel: 'name',
      selection: []
    },
    {
      type: FilterTypes.DropdownMulti,
      name: 'status',
      label: 'Status',
      query: 'status__in',
      hideSearch: true,
      optionValue: 'value',
      optionLabel: 'display_name',
      selection: []
    },
    {
      type: FilterTypes.DropdownMulti,
      name: 'joint audit',
      label: 'Joint Audit',
      query: 'joint_audit',
      hideSearch: true,
      optionValue: 'value',
      optionLabel: 'display_name',
      selection: [
        {display_name: 'Yes', value: 'true'},
        {display_name: 'No', value: 'false'}
      ]
    },
    {
      type: FilterTypes.Dropdown,
      name: 'year of audit',
      label: 'Year of Audit',
      query: 'year_of_audit',
      hideSearch: true,
      optionValue: 'value',
      optionLabel: 'label',
      selection: getYearOfAuditOptions()
    },
    {
      type: FilterTypes.Date,
      name: 'date IP was contacted before',
      label: 'Date IP Was Contacted Before',
      query: 'partner_contacted_at__lte',
      hideSearch: true
    },
    {
      type: FilterTypes.Date,
      name: 'date IP was contacted after',
      label: 'Date IP Was Contacted After',
      query: 'partner_contacted_at__gte',
      hideSearch: true
    },
    {
      type: FilterTypes.Date,
      name: 'draft report issued to ip before',
      label: 'Draft Report Issued to IP Before',
      query: 'date_of_draft_report_to_ip__lte',
      hideSearch: true
    },
    {
      type: FilterTypes.Date,
      name: 'draft report issued to ip after',
      label: 'Draft Report Issued to IP After',
      query: 'date_of_draft_report_to_ip__gte',
      hideSearch: true
    }
  ];

  @property({type: Array})
  engagementsList: any[] = [];

  @property({type: String})
  newBtnLink = `/${BASE_PATH}/engagements/new/overview`;

  @property({type: Boolean})
  hasCollapse = false;

  @property({type: String})
  addBtnText = 'Add New Engagement';

  @property({type: Boolean})
  isStaffSc = false;

  @property({type: Boolean, notify: true})
  reloadData = false;

  @property({type: Array})
  exportLinks: any[] = [];

  @property({type: String})
  endpointName = '';

  static get observers() {
    return ['_changeLinkTemplate(isStaffSc, listHeadings)', '_setExportLinks(endpointName)'];
  }

  connectedCallback() {
    super.connectedCallback();
    this._engagementsFiltersUpdated = this._engagementsFiltersUpdated.bind(this);
    document.addEventListener('engagements-filters-updated', this._engagementsFiltersUpdated);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('engagements-filters-updated', this._engagementsFiltersUpdated);
  }

  _engagementsFiltersUpdated() {
    const filtersElement = this.shadowRoot!.querySelector('#filters') as SearchAndFilterEl;
    this.setFiltersSelections();

    if (filtersElement) {
      filtersElement._reloadFilters();
    }
  }

  _hideAddButton() {
    return this.isReadOnly('partner', this.isStaffSc ? 'new_staff_sc' : 'new_engagement');
  }

  _getFilterIndex(query) {
    if (!(this.filters instanceof Array)) {
      return -1;
    }

    return this.filters.findIndex((filter) => {
      return filter.query === query;
    });
  }

  setFiltersSelections() {
    const queryAndKeyPairs = [
      {query: 'partner__in', dataKey: 'filterPartners'},
      {query: 'agreement__auditor_firm__in', dataKey: 'filterAuditors'},
      {query: 'status__in', dataKey: 'statuses'},
      {query: 'engagement_type__in', dataKey: 'engagementTypes'},
      {query: 'staff_members__user__in', dataKey: 'staffMembersUsers'}
    ];

    queryAndKeyPairs.forEach((pair) => {
      const filterIndex = this._getFilterIndex(pair.query);
      const data = getStaticData(pair.dataKey) || [];
      this.setFilterSelection(filterIndex, data);
    });
  }

  setFilterSelection(filterIndex, data) {
    if (filterIndex !== undefined && filterIndex !== -1) {
      this.set(`filters.${filterIndex}.selection`, data);
      return true;
    }
  }

  _setExportLinks() {
    const endpoint = getEndpoint(this.endpointName);
    const queryString = buildQueryString(this.queryParams);
    const exportLinks = endpoint ? [{name: 'Export Engagements', url: `${endpoint.url}csv/?${queryString}`}] : [];
    this.set('exportLinks', exportLinks);
  }

  _changeLinkTemplate(isStaffSc, headings) {
    if (!headings) {
      return;
    }
    if (isStaffSc) {
      this.set('listHeadings.0.link', 'staff-spot-checks/*data_id*/overview');
    } else {
      this.set('listHeadings.0.link', '*engagement_type*/*data_id*/overview');
    }
  }
}

window.customElements.define('engagements-list-view', EngagementsListView);
