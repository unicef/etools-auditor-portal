import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import '../engagements/engagements-list-view/engagements-list-view';
import '../engagements/new-engagement-view/new-engagement-view';
import {clearQueries, updateQueries} from '../../mixins/query-params-controller';
import {actionAllowed} from '../../mixins/permission-controller';
import {getEndpoint} from '../../config/endpoints-controller';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import isUndefined from 'lodash-es/isUndefined';
import isEqual from 'lodash-es/isEqual';
import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
import {GenericObject} from '../../../types/global';
import {BASE_PATH} from '../../config/config';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @customElement
 * @LitElement
 */
@customElement('staff-sc-page-main')
export class StaffScPageMain extends LitElement {
  static get styles() {
    return [pageLayoutStyles, moduleStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }
      </style>

      <app-route
        .route="${this.route}"
        @route-changed="${this._routeChanged}"
        pattern="/:view"
        @data-changed="${this._routeDataChanged}"
        .tail="${this.subroute}"
        @tail-changed="${this._tailChanged}"
      >
      </app-route>

      <iron-pages id="categoryPages" .selected="${this.routeData?.view}" attr-for-selected="name" role="main">
        <engagements-list-view
          name="list"
          id="listPage"
          .queryParams="${this.queryParams}"
          .baseRoute="${this.baseRoute}"
          has-collapse
          .requestQueries="${this.partnersListQueries}"
          .endpointName="${this.endpointName}"
          basePermissionPath="new_engagement"
          add-btn-text="Add New Staff Spot Checks"
          .newBtnLink="${this.newBtnLink}"
          is-staff-sc
        >
        </engagements-list-view>

        ${this.allowNew
          ? html` <new-engagement-view
              name="new"
              id="creationPage"
              basePermissionPath="new_staff_sc"
              .auditFirm="${this.auditFirm}"
              page-title="Add New Staff Spot Check"
              isStaffSc
              .page="${this.routeData.view}"
              .queryParams="${this.queryParams}"
              .route="${this.subroute}"
              @sub-route-changed="${({detail}: CustomEvent) => {
                if (!isJsonStrMatch(this.subroute, detail.value)) {
                  this.subroute = detail.value;
                }
              }}"
              .requestQueries="${this.partnersListQueries}"
              basePermissionPath="new_engagement"
              .partner="${this.partnerDetails}"
              .endpointName="${this.endpointName}"
            >
            </new-engagement-view>`
          : ''}
      </iron-pages>
    `;
  }

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  baseRoute!: string;

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: Number})
  initiation = 0;

  @property({type: Object})
  partnerDetails: GenericObject = {};

  @property({type: String})
  newBtnLink = `${BASE_PATH}staff-sc/new/overview`;

  @property({type: String})
  endpointName = 'staffSCList';

  @property({type: Object})
  route: GenericObject = {};

  @property({type: Object})
  routeData: GenericObject = {};

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

  connectedCallback() {
    super.connectedCallback();
    this.allowNew = actionAllowed('new_staff_sc', 'create');
    this._fireUpdateEngagementsFilters = debounce(this._fireUpdateEngagementsFilters.bind(this), 100) as any;
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

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('queryParams')) {
      this._queryParamsChanged();
    }
    if (changedProperties.has('routeData')) {
      this._routeConfig(this.routeData.view);
    }
  }

  _routeConfig(view) {
    if (!this.route || !~this.route.prefix.indexOf('/staff-sc')) {
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
      this.route = {...this.route, path: '/list'};
    } else {
      clearQueries();
      fireEvent(this, '404');
    }

    if (view !== this.lastView) {
      fireEvent(this, `close-toasts`);
    }
    this.lastView = view;
  }

  resetLastView() {
    if (this.lastView) {
      this.lastView = null;
    }
  }

  _fireUpdateEngagementsFilters() {
    document.dispatchEvent(new CustomEvent('update-engagements-filters'));
  }

  _configListParams(noNotify?) {
    const queries = this.route.__queryParams || {};
    const queriesUpdates: GenericObject = clone(queries);

    if (!queries.page_size) {
      queriesUpdates.page_size = '10';
    }
    if (!queries.ordering) {
      queriesUpdates.ordering = 'reference_number';
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

  _routeChanged({detail}: CustomEvent) {
    if (detail.value.path && detail.value.prefix && !isJsonStrMatch(this.route, detail.value)) {
      this.route = detail.value;
    }
  }

  _routeDataChanged({detail}: CustomEvent) {
    if (!isJsonStrMatch(this.routeData, detail.value)) {
      this.routeData = detail.value;
    }
  }

  _tailChanged({detail}: CustomEvent) {
    if (!detail.value?.path) {
      return;
    }
    if (!isJsonStrMatch(this.subroute, detail.value)) {
      this.subroute = detail.value;
    }
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
      EtoolsLogger.error('Error fetching audit firm.');
    } else {
      this.auditFirm = results[0];
    }
  }
}
