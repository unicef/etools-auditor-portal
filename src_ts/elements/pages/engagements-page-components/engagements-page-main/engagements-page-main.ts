import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-pages/iron-pages';
import '@polymer/app-route/app-route';
import isEqual from 'lodash-es/isEqual';
import clone from 'lodash-es/clone';
import isEmpty from 'lodash-es/isEmpty';
import isUndefined from 'lodash-es/isUndefined';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '../../../utils/fire-custom-event';
import {actionAllowed} from '../../../app-mixins/permission-controller';
import {clearQueries, updateQueries} from '../../../app-mixins/query-params-controller';
import '../engagements-list-view/engagements-list-view';
import '../new-engagement-view/new-engagement-view';
import {pageLayoutStyles} from '../../../styles-elements/page-layout-styles';
import {sharedStyles} from '../../../styles-elements/shared-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';

/**
 * @customElement
 * @polymer
 */
class EngagementsPageMain extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      ${pageLayoutStyles} ${sharedStyles} ${moduleStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }
      </style>

      <app-route
          route="{{route}}"
          pattern="/:view"
          data="{{routeData}}"
          tail="{{subroute}}">
      </app-route>

      <iron-pages
          id="categoryPages"
          selected="{{view}}"
          attr-for-selected="name"
          role="main">
        <engagements-list-view
            name="list"
            id="listPage"
            query-params="{{queryParams}}"
            has-collapse
            request-queries="[[partnersListQueries]]"
            endpoint-name="{{endpointName}}"
            base-permission-path="new_engagement">
        </engagements-list-view>

        <template is="dom-if" if="[[allowNew]]" restamp>
          <new-engagement-view
              name="new"
              id="creationPage"
              page="{{routeData.view}}"
              query-params="{{queryParams}}"
              route="{{subroute}}"
              request-queries="{{partnersListQueries}}"
              base-permission-path="new_engagement"
              partner="{{partnerDetails}}"
              endpoint-name="{{endpointName}}"
              page-title="Add New Engagement">
          </new-engagement-view>
        </template>
      </iron-pages>
    `;
  }

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: GenericObject;

  @property({type: Object, notify: true, observer: '_queryParamsChanged'})
  queryParams!: GenericObject;

  @property({type: String})
  endpointName: string = 'engagementsList';

  @property({type: String})
  view: string = 'list';

  @property({type: String})
  lastView: string = '';

  private _updateEngagementsFiltersDebouncer!: Debouncer;

  @property({type: Object})
  lastParams!: GenericObject;

  @property({type: Object})
  partnersListQueries!: GenericObject;

  @property({type: Boolean})
  allowNew: boolean = false;

  static get observers() {
    return [
      '_routeConfig(routeData.view)'
    ];
  }

  connectedCallback() {
    super.connectedCallback();
    this.allowNew = actionAllowed('new_engagement', 'create');
  }
  _routeConfig(view) {
    if (!this.route || !~this.route.prefix.indexOf('/engagements')) {
      this.resetLastView();
      return;
    }

    if (view === 'list') {
      let queries = this._configListParams(true);
      this._setEngagementsListQueries(queries);
      this._fireUpdateEngagementsFilters();
      this.view = 'list';
    } else if (view === 'new' && actionAllowed('new_engagement', 'create')) {
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
    if (this.lastView) {this.lastView = '';}
  }

  _fireUpdateEngagementsFilters() {
    this._updateEngagementsFiltersDebouncer = Debouncer.debounce(this._updateEngagementsFiltersDebouncer,
      timeOut.after(100),
      () => {document.dispatchEvent(new CustomEvent('update-engagements-filters'))});
  }

  _configListParams(noNotify: boolean = false) {
    let queries = this.route.__queryParams || {};
    let queriesUpdates: GenericObject = clone(queries);


    if (!queries.page_size) {queriesUpdates.page_size = '10';}
    if (!queries.ordering) {queriesUpdates.ordering = 'unique_id';}
    if (!queries.page) {queriesUpdates.page = '1';}

    let page = +queries.page;
    if (isNaN(page) || (this.lastParams &&
      (queries.page_size !== this.lastParams.page_size || queries.ordering !== this.lastParams.ordering))) {
      queriesUpdates.page = '1';
    }

    if (!this.lastParams || !isEqual(this.lastParams, queries)) {
      this.lastParams = clone(queries);
    }

    updateQueries(queriesUpdates, null, noNotify);
    return queriesUpdates;
  }

  _queryParamsChanged() {
    if (!~this.route.prefix.indexOf('/engagements') || !this.routeData) {return;}

    if (this.routeData.view === 'list') {
      let queries = this._configListParams();
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

}

window.customElements.define('engagements-page-main', EngagementsPageMain);
