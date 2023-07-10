import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import isEqual from 'lodash-es/isEqual';
import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
import isUndefined from 'lodash-es/isUndefined';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {actionAllowed} from '../../mixins/permission-controller';
import {clearQueries, updateQueries} from '../../mixins/query-params-controller';
import './engagements-list-view/engagements-list-view';
import './new-engagement-view/new-engagement-view';
import {pageLayoutStyles} from '../../styles/page-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles-lit';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @customElement
 * @LitElement
 */
@customElement('engagements-page-main')
export class EngagementsPageMain extends LitElement {
  static get styles() {
    return [pageLayoutStyles, moduleStyles];
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
      </style>

      <app-route
        .route="${this.route}"
        @route-changed="${this._routeChanged}"
        pattern="/:view"
        @data-changed="${this._routeDataChanged}"
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
          .basePermissionPath="new_engagement"
          .reloadData="${this.reloadListData}"
        >
        </engagements-list-view>

        ${this.allowNew
          ? html` <new-engagement-view
              name="new"
              id="creationPage"
              .page="${this.routeData.view}"
              .queryParams="${this.queryParams}"
              .route="${this.subroute}"
              .requestQueries="${this.partnersListQueries}"
              .basePermissionPath="new_engagement"
              .partner="${this.partnerDetails}"
              .endpointName="${this.endpointName}"
              page-title="Add New Engagement"
            >
            </new-engagement-view>`
          : ''}
      </iron-pages>
    `;
  }

  @property({type: Object})
  route: GenericObject = {};

  @property({type: Object})
  subroute!: GenericObject;

  @property({type: Object})
  routeData: GenericObject = {};

  @property({type: Object})
  partnerDetails: GenericObject = {};

  @property({type: Object})
  queryParams!: GenericObject;

  @property({type: String})
  baseRoute!: string;

  @property({type: String})
  endpointName = 'engagementsList';

  @property({type: String})
  view = 'list';

  @property({type: String})
  lastView = '';

  private _updateEngagementsFiltersDebouncer!: Debouncer;

  @property({type: Object})
  lastParams!: GenericObject;

  @property({type: Object})
  partnersListQueries!: GenericObject;

  @property({type: Boolean})
  allowNew = false;

  @property({type: Boolean})
  hasEngagementUpdated = false;

  @property({type: Boolean})
  reloadListData = false;

  connectedCallback() {
    super.connectedCallback();
    this.allowNew = actionAllowed('new_engagement', 'create');
    this._engagementStatusUpdated = this._engagementStatusUpdated.bind(this);
    document.addEventListener('global-loading', this._engagementStatusUpdated as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('', this._engagementStatusUpdated as any);
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

  _engagementStatusUpdated(e: CustomEvent) {
    if (e.detail && e.detail.saved && e.detail.type) {
      const type = e.detail.type;
      if (type === 'update-engagement' || type === 'finalize-engagement' || type === 'submit-engagement') {
        this.hasEngagementUpdated = true;
      }
    }
  }

  _routeChanged({detail}: CustomEvent) {
    const path = detail?.value?.path;
    if (!path || !path.match(/[^\\/]/g)) {
      this.route = {...this.route, path: '/list'};
      fireEvent(this, 'route-changed', {value: this.route});
      return;
    }

    if (!['list', 'new', 'not-found'].includes(path.split('/')[1])) {
      this.route = {...this.route, path: '/not-found'};
      return;
    }
  }

  _routeDataChanged({detail}: CustomEvent) {
    this.routeData = detail.value;
  }

  _tailChanged({detail}: CustomEvent) {
    if (!detail.value?.path) {
      return;
    }
    if (!isJsonStrMatch(this.subroute, detail.value)) {
      this.subroute = detail.value;
      this.requestUpdate();
    }
  }

  _routeConfig(view) {
    if (!this.route || !~this.route.prefix.indexOf('/engagements')) {
      this.resetLastView();
      return;
    }

    if (view === 'list') {
      this._fireUpdateEngagementsFilters();
      this.view = 'list';
    } else if (view === 'new' && actionAllowed('new_engagement', 'create')) {
      clearQueries();
      this.view = 'new';
    } else if (view === '' || isUndefined(view)) {
      this.route.path = '/list';
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
      this.lastView = '';
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

  _configListParams(noNotify = false) {
    const queries = this.route.__queryParams || {};
    const queriesUpdates: GenericObject = clone(queries);

    if (!queries.page_size) {
      queriesUpdates.page_size = '20';
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

  _queryParamsChanged() {
    if (!~this.route.prefix.indexOf('/engagements') || !this.routeData) {
      return;
    }

    if (this.routeData.view === 'list') {
      const queries = this._configListParams();
      this._setEngagementsListQueries(queries);
      if (this.hasEngagementUpdated) {
        // force reload data for engagement list because we have an engagement changed
        this.reloadListData = true;
        this.hasEngagementUpdated = false;
      }
    } else if (!isNaN(+this.routeData.view)) {
      clearQueries();
    }
  }

  _setEngagementsListQueries(queries) {
    if (!isEmpty(queries) && (!this.partnersListQueries || !isEqual(this.partnersListQueries, queries))) {
      this.partnersListQueries = queries;
    }
  }
}
