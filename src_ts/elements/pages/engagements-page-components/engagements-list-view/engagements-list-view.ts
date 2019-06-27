import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../types/global';
import StaticDataMixin from '../../../app-mixins/static-data-mixin';
import PermissionControllerMixin from '../../../app-mixins/permission-controller-mixin';
import QueryParamsController from '../../../app-mixins/query-params-controller';
import EndpointsMixin from '../../../app-config/endpoints-mixin';
import {pageLayoutStyles} from '../../../styles-elements/page-layout-styles';
import {sharedStyles} from '../../../styles-elements/shared-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import '../../../data-elements/engagements-list-data';
import '../../../common-elements/pages-header-element/pages-header-element';

/**
 * TODO: polymer 3 migration:
 *    - migrate and use:
 *        - engagements-list-data
 *        - pages-header-element
 *        - search-and-filter
 *        - list-tab-main
 *
 * @customElement
 * @polymer
 * @appliesMixin EndpointsMixin
 * @appliesMixin QueryParamsController
 * @appliesMixin PermissionControllerMixin
 * @appliesMixin StaticDataMixin
 */
class EngagementsListView extends
    EndpointsMixin(QueryParamsController(PermissionControllerMixin(StaticDataMixin(PolymerElement)))) {

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
          endpoint-name="[[endpointName]]">
      </engagements-list-data>

      <pages-header-element
          show-export-button
          hide-print-button
          export-links="[[exportLinks]]"
          link="{{newBtnLink}}"
          show-add-button="{{_showAddButton(hideAddButton)}}"
          btn-text="{{addBtnText}}"
          page-title="Engagements">
      </pages-header-element>

      <search-and-filter
          id="filters"
          search-label="Search partner or auditor"
          filters="[[filters]]"
          query-params="{{queryParams}}"
          search-params="[[searchParams]]">
      </search-and-filter>

      <list-tab-main
          header-title="results to show"
          data="[[engagementsList]]"
          list-length="[[listLength]]"
          headings="[[listHeadings]]"
          has-collapse="[[hasCollapse]]"
          query-params="{{queryParams}}"
          no-additional
          base-permission-path="[[basePermissionPath]]">
      </list-tab-main>
    `;
  }

  @property({type: String})
  basePermissionPath: string = '';

  @property({type: Object, notify: true})
  queryParams!: GenericObject;

  @property({type: Array})
  listHeadings: GenericObject[] = [{
    'size': 15,
    'label': 'Unique ID #',
    'name': 'unique_id',
    'link': '*engagement_type*/*data_id*/overview',
    'ordered': false,
    'path': 'unique_id'
  }, {
    'size': 20,
    'label': 'Audit Firm',
    'labelPath': 'agreement.audit_firm',
    'name': 'agreement__auditor_firm__name',
    'ordered': false,
    'path': 'agreement.auditor_firm.name'
  }, {
    'size': 20,
    'label': 'Partner Name',
    'name': 'partner__name',
    'ordered': false,
    'path': 'partner.name'
  }, {
    'size': 15,
    'label': 'Engagement Type',
    'labelPath': 'engagement_type',
    'name': 'engagement_type',
    'ordered': false
  }, {
    'size': 30,
    'label': 'Status',
    'labelPath': 'status',
    'name': 'status',
    'ordered': false,
    'additional': {
      'type': 'date',
      'path': 'status_date'
    }
  }];

  @property({type: Array})
  filters: GenericObject[] = [{
    name: 'audit firm',
    label: 'Audit Firm',
    query: 'agreement__auditor_firm__in',
    optionValue: 'id',
    optionLabel: 'name',
    selection: []
  }, {
    name: 'engagement type',
    label: 'Engagement Type',
    query: 'engagement_type__in',
    hideSearch: true,
    optionValue: 'value',
    optionLabel: 'display_name',
    selection: []
  }, {
    name: 'partner',
    label: 'Partner',
    query: 'partner__in',
    optionValue: 'id',
    optionLabel: 'name',
    selection: []
  }, {
    name: 'status',
    label: 'Status',
    query: 'status__in',
    hideSearch: true,
    optionValue: 'value',
    optionLabel: 'display_name',
    selection: []
  }, {
    name: 'joint audit',
    label: 'Joint Audit',
    query: 'joint_audit',
    hideSearch: true,
    optionValue: 'value',
    optionLabel: 'display_name',
    selection: [{display_name: 'Yes', value: 'true'}, {display_name: 'No', value: 'false'}]
  }];

  @property({type: Object})
  engagementsList: any[] = [];

  @property({type: String})
  newBtnLink: string = '/engagements/new/overview';

  @property({type: Boolean})
  hasCollapse: boolean = false;

  @property({type: Boolean})
  hideAddButton: boolean = false;

  @property({type: String})
  addBtnText: string = 'Add New Engagement';

  @property({type: Boolean})
  isStaffSc: boolean = false;

  @property({type: Array})
  isStaffSc: any[] = [];

  @property({type: Array})
  exportLinks: any[] = [];

  @property({type: String})
  endpointName: string = '';

  static get observers() {
    return [
      '_changeLinkTemplate(isStaffSc, listHeadings)',
      '_setExportLinks(endpointName)'
    ];
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
    let filtersElement = this.$.filters;
    this.setFiltersSelections();

    if (filtersElement) {
      filtersElement._reloadFilters();
    }
  }

  _showAddButton(hideAddButton) {
    return this.actionAllowed('new_engagement', 'create') && !hideAddButton;
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
    let queryAndKeyPairs = [
      {query: 'partner__in', dataKey: 'filterPartners'},
      {query: 'agreement__auditor_firm__in', dataKey: 'filterAuditors'},
      {query: 'status__in', dataKey: 'statuses'},
      {query: 'engagement_type__in', dataKey: 'engagementTypes'},
      {query: 'staff_members__user__in', dataKey: 'staffMembersUsers'}
    ];

    queryAndKeyPairs.forEach((pair) => {
      let filterIndex = this._getFilterIndex(pair.query);
      let data = this.getData(pair.dataKey) || [];
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
    const endpoint = this.getEndpoint(this.endpointName);
    const queryString = this.buildQueryString(this.queryParams);
    const exportLinks = endpoint ? [{
      name: 'Export Engagements',
      url: `${endpoint.url}csv/?${queryString}`
    }] : [];
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
