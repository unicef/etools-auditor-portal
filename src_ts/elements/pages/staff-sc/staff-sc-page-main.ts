import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {sharedStyles} from '../../styles/shared-styles';
import {moduleStyles} from '../../styles/module-styles';
import '../engagements/engagements-list-view/engagements-list-view';
import '../engagements/new-engagement-view/new-engagement-view';
import {clearQueries, updateQueries} from '../../mixins/query-params-controller';
import {actionAllowed} from '../../mixins/permission-controller';
import {property} from '@polymer/decorators';
import {getEndpoint} from '../../config/endpoints-controller';

import {fireEvent} from '../../utils/fire-custom-event';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import isUndefined from 'lodash-es/isUndefined';
import isEqual from 'lodash-es/isEqual';
import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
import {GenericObject} from '../../../types/global';
import {BASE_PATH} from '../../config/config';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {FilterTypes} from '../../common-elements/search-and-filter-element/search-and-filter';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

class StaffScPageMain extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          position: relative;
          display: block;
        }
      </style>
      ${pageLayoutStyles} ${sharedStyles} ${moduleStyles}
      <app-route route="{{route}}" pattern="/:view" data="{{routeData}}" tail="{{subroute}}"> </app-route>
      <iron-pages id="categoryPages" selected="{{view}}" attr-for-selected="name" role="main">
        <engagements-list-view
          name="list"
          id="listPage"
          query-params="{{queryParams}}"
          base-route="[[baseRoute]]"
          has-collapse
          request-queries="[[partnersListQueries]]"
          base-permission-path="new_engagement"
          filters="[[filters]]"
          add-btn-text="Add New Staff Spot Checks"
          new-btn-link="{{newBtnLink}}"
          endpoint-name="{{endpointName}}"
          is-staff-sc
        >
        </engagements-list-view>

        <template is="dom-if" if="[[allowNew]]" restamp>
          <new-engagement-view
            name="new"
            id="creationPage"
            page="{{routeData.view}}"
            query-params="{{queryParams}}"
            route="{{subroute}}"
            request-queries="{{partnersListQueries}}"
            base-permission-path="new_staff_sc"
            partner="{{partnerDetails}}"
            audit-firm="[[auditFirm]]"
            page-title="Add New Staff Spot Check"
            endpoint-name="{{endpointName}}"
            is-staff-sc
          >
          </new-engagement-view>
        </template>
      </iron-pages>
    `;
  }

  @property({type: Object, notify: true, observer: '_queryParamsChanged'})
  queryParams!: GenericObject;

  @property({type: String})
  baseRoute!: string;

  @property({type: Number})
  initiation = 0;

  @property({type: String})
  newBtnLink = `/${BASE_PATH}/staff-sc/new/overview`;

  @property({type: Array})
  filters = [
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
      name: 'unicef user',
      label: 'Unicef User',
      query: 'staff_members__user__in',
      optionValue: 'id',
      optionLabel: 'full_name',
      selection: []
    },
    {
      type: FilterTypes.Date,
      name: 'date IP was contacted before',
      label: 'Date IP was contacted before',
      query: 'partner_contacted_at__lte',
      hideSearch: true
    },
    {
      type: FilterTypes.Date,
      name: 'date IP was contacted after',
      label: 'Date IP was contacted after',
      query: 'partner_contacted_at__gte',
      hideSearch: true
    }
  ];

  @property({type: String})
  endpointName = 'staffSCList';

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object})
  partnersListQueries!: GenericObject;

  @property({type: String})
  view!: string;

  @property({type: String})
  lastView!: string | null;

  @property({type: Object})
  lastParams!: GenericObject;

  @property({type: Object})
  auditFirm: GenericObject = {};

  @property({type: Boolean})
  allowNew = false;

  static get observers() {
    return ['_routeConfig(routeData.view, selectedPage)'];
  }

  private _updateEngagementsFiltersDebouncer!: Debouncer;

  connectedCallback() {
    super.connectedCallback();
    this.allowNew = actionAllowed('new_staff_sc', 'create');
    sendRequest({
      endpoint: {url: getEndpoint('auditFirms').url + '?unicef_users_allowed=true'}
    })
      .then((resp) => {
        this._auditFirmLoaded(resp);
      })
      .catch((err) => {
        throw new Error(err);
      });
  }

  _routeConfig(view, selectedPage) {
    if (!this.route || !~this.route.prefix.indexOf('/staff-sc') || selectedPage !== 'staff-sc') {
      this.resetLastView();
      return;
    }

    if (view === this.lastView) {
      return;
    }
    if (view === 'list') {
      const queries = this._configListParams(this.initiation++);
      this._setEngagementsListQueries(queries);
      this._fireUpdateEngagementsFilters();
      this.view = 'list';
    } else if (view === 'new' && actionAllowed('new_staff_sc', 'create')) {
      clearQueries();
      this.view = 'new';
    } else if (view === '' || isUndefined(view)) {
      this.set('route.path', '/list');
    } else {
      clearQueries();
      fireEvent(this, '404');
    }

    if (view !== this.lastView) {
      fireEvent(this, 'toast', {reset: true});
    }
    this.lastView = view;
  }

  resetLastView() {
    if (this.lastView) {
      this.lastView = null;
    }
  }

  _fireUpdateEngagementsFilters() {
    this._updateEngagementsFiltersDebouncer = Debouncer.debounce(
      this._updateEngagementsFiltersDebouncer,
      timeOut.after(100),
      () => {
        document.dispatchEvent(new CustomEvent('update-engagements-filters'));
      }
    );
  }

  _configListParams(noNotify?) {
    const queries = this.route.__queryParams || {};
    const queriesUpdates: GenericObject = clone(queries);

    if (!queries.page_size) {
      queriesUpdates.page_size = '10';
    }
    if (!queries.ordering) {
      queriesUpdates.ordering = 'unique_id';
    }
    if (!queries.page) {
      queriesUpdates.page = '1';
    }

    const page = +queries.page;
    if (
      isNaN(page) ||
      (this.lastParams &&
        (queries.page_size !== this.lastParams.page_size || queries.ordering !== this.lastParams.ordering))
    ) {
      queriesUpdates.page = '1';
    }

    if (!this.lastParams || !isEqual(this.lastParams, queries)) {
      this.lastParams = clone(queries);
    }

    updateQueries(queriesUpdates, null, noNotify);
    return queriesUpdates;
  }

  _queryParamsChanged() {
    if (!this.route) {
      return;
    }
    if (!~this.route.prefix.indexOf('/staff-sc') || !this.routeData) {
      return;
    }
    if (this.routeData.view === 'list') {
      const queries = this._configListParams();
      this._setEngagementsListQueries(queries);
    } else if (!isNaN(+this.routeData.view)) {
      clearQueries();
    }
  }

  _setEngagementsListQueries(queries) {
    if (!isEmpty(queries) && (!this.partnersListQueries || !isEqual(this.partnersListQueries, queries))) {
      this.partnersListQueries = queries;
    }
  }

  _auditFirmLoaded({results}) {
    if (!results.length) {
      logError('Error fetching audit firm.');
    } else {
      this.auditFirm = results[0];
    }
  }
}

window.customElements.define('staff-sc-page-main', StaffScPageMain);
