import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-pages/iron-pages';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import '../engagements/engagements-list-view/staff-sc-list-view';
import '../engagements/new-engagement-view/new-engagement-view';
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

      <staff-sc-list-view
        name="list"
        id="listPage"
        has-collapse
        ?hidden="${!this.isActivePage(this.activePath, 'list')}"
        .endpointName="${this.endpointName}"
        add-btn-text="Add New Staff Spot Checks"
        .newBtnLink="${this.newBtnLink}"
        is-staff-sc
      >
      </staff-sc-list-view>

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
    }
  }

  isActivePage(activePath: string, expected: string) {
    return activePath.indexOf(expected) > -1;
  }

  _auditFirmLoaded({results}) {
    if (!results.length) {
      EtoolsLogger.error('Error fetching audit firm.');
    } else {
      this.auditFirm = results[0];
    }
  }
}
