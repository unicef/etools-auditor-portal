import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-pages/iron-pages';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import '../engagements/engagements-list-view/engagements-list-view';
import '../engagements/new-engagement-view/new-engagement-view';
import {clearQueries} from '../../mixins/query-params-controller';
import {isValidCollection} from '../../mixins/permission-controller';
import {getEndpoint} from '../../config/endpoints-controller';

import {GenericObject} from '../../../types/global';
import {BASE_PATH} from '../../config/config';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import get from 'lodash-es/get';
import {pageIsNotCurrentlyActive} from '../../utils/utils';

/**
 * @customElement
 * @LitElement
 */
@customElement('staff-sc-page-main')
export class StaffScPageMain extends connect(store)(LitElement) {
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

      <engagements-list-view
        name="list"
        id="listPage"
        has-collapse
        ?hidden="${!this.isActivePage(this.activePath, 'list')}"
        .endpointName="${this.endpointName}"
        add-btn-text="Add New Staff Spot Checks"
        .newBtnLink="${this.newBtnLink}"
        is-staff-sc
      >
      </engagements-list-view>

      ${this.allowNew
        ? html` <new-engagement-view
            name="new"
            id="creationPage"
            ?hidden="${!this.isActivePage(this.activePath, 'new')}"
            .auditFirm="${this.auditFirm}"
            page-title="Add New Staff Spot Check"
            isStaffSc
            .requestQueries="${this.partnersListQueries}"
            .partner="${this.partnerDetails}"
            .endpointName="${this.endpointName}"
          >
          </new-engagement-view>`
        : ''}
    `;
  }

  @property({type: Number})
  initiation = 0;

  @property({type: Object})
  partnerDetails: GenericObject = {};

  @property({type: String})
  newBtnLink = `${BASE_PATH}staff-sc/new/overview`;

  @property({type: String})
  endpointName = 'staffSCList';

  @property({type: Object})
  partnersListQueries!: GenericObject;

  @property({type: String})
  activePath!: string;

  @property({type: Object})
  lastParams!: GenericObject;

  @property({type: Object})
  auditFirm: GenericObject = {};

  @property({type: Boolean})
  allowNew!: boolean;

  @property({type: Object})
  reduxRouteDetails?: EtoolsRouteDetails;

  connectedCallback() {
    super.connectedCallback();

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

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails.routeName'), 'staff-sc')) {
      return;
    }
    if (typeof this.allowNew === 'undefined' && state.commonData.loadedTimestamp) {
      this.allowNew = !!isValidCollection(state.commonData.new_staff_scOptions.actions?.POST);
    }
    if (state.app.routeDetails && !isJsonStrMatch(state.app.routeDetails, this.reduxRouteDetails)) {
      this.reduxRouteDetails = state.app.routeDetails;
      this.activePath = this.reduxRouteDetails.path;
      this._routeChanged(this.activePath);
    }
  }

  _routeChanged(activePage) {
    if (activePage !== 'list') {
      clearQueries();
    }
  }

  isActivePage(activePath: string, expected: string) {
    return activePath.indexOf(expected) > -1;
  }
  // @dci - do we need these ??
  // _routeConfig(view) {
  //   if (!this.route || !~this.route.prefix.indexOf('/staff-sc')) {
  //     this.resetLastView();
  //     return;
  //   }

  //   if (view === this.lastView) {
  //     return;
  //   }
  //   if (view === 'list') {
  //     const queries = this._configListParams(this.initiation++);
  //     this._setEngagementsListQueries(queries);
  //     this._fireUpdateEngagementsFilters();
  //     this.view = 'list';
  //   } else if (view === 'new' && actionAllowed('new_staff_sc', 'create')) {
  //     clearQueries();
  //     this.view = 'new';
  //   } else if (view === '' || isUndefined(view)) {
  //     this.route = {...this.route, path: '/list'};
  //   } else {
  //     clearQueries();
  //     fireEvent(this, '404');
  //   }

  //   if (view !== this.lastView) {
  //     fireEvent(this, `close-toasts`);
  //   }
  //   this.lastView = view;
  // }

  // resetLastView() {
  //   if (this.lastView) {
  //     this.lastView = null;
  //   }
  // }

  // _fireUpdateEngagementsFilters() {
  //   document.dispatchEvent(new CustomEvent('update-engagements-filters'));
  // }

  // _configListParams(noNotify?) {
  //   const queries = this.route.__queryParams || {};
  //   const queriesUpdates: GenericObject = clone(queries);

  //   if (!queries.page_size) {
  //     queriesUpdates.page_size = '10';
  //   }
  //   if (!queries.ordering) {
  //     queriesUpdates.ordering = 'reference_number';
  //   }
  //   if (!queries.page) {
  //     queriesUpdates.page = '1';
  //   }

  //   const page = +queries.page;
  //   if (
  //     isNaN(page) ||
  //     (this.lastParams &&
  //       (queries.page_size !== this.lastParams.page_size || queries.ordering !== this.lastParams.ordering))
  //   ) {
  //     queriesUpdates.page = '1';
  //   }

  //   if (!this.lastParams || !isEqual(this.lastParams, queries)) {
  //     this.lastParams = clone(queries);
  //   }

  //   updateQueries(queriesUpdates, null, noNotify);
  //   return queriesUpdates;
  // }

  // _queryParamsChanged() {
  //   if (!this.route) {
  //     return;
  //   }
  //   if (!~this.route.prefix.indexOf('/staff-sc') || !this.routeData) {
  //     return;
  //   }
  //   if (this.routeData.view === 'list') {
  //     const queries = this._configListParams();
  //     this._setEngagementsListQueries(queries);
  //   } else if (!isNaN(+this.routeData.view)) {
  //     clearQueries();
  //   }
  // }

  // _setEngagementsListQueries(queries) {
  //   if (!isEmpty(queries) && (!this.partnersListQueries || !isEqual(this.partnersListQueries, queries))) {
  //     this.partnersListQueries = queries;
  //   }
  // }

  _auditFirmLoaded({results}) {
    if (!results.length) {
      EtoolsLogger.error('Error fetching audit firm.');
    } else {
      this.auditFirm = results[0];
    }
  }
}
