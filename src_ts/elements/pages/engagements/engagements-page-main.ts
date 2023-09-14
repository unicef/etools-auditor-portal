import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/iron-pages/iron-pages';
import {GenericObject} from '../../../types/global';
import {isValidCollection} from '../../mixins/permission-controller';
import './engagements-list-view/engagements-list-view';
import './new-engagement-view/new-engagement-view';
import {pageLayoutStyles} from '../../styles/page-layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../redux/store';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {pageIsNotCurrentlyActive} from '../../utils/utils';
import get from 'lodash-es/get';

/**
 * @customElement
 * @LitElement
 */
@customElement('engagements-page-main')
export class EngagementsPageMain extends connect(store)(LitElement) {
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

      <engagements-list-view
        name="list"
        id="listPage"
        ?hidden="${!this.isActivePage(this.activePath, 'list')}"
        has-collapse
        .endpointName="${this.endpointName}"
      >
      </engagements-list-view>

      ${this.allowNew
        ? html` <new-engagement-view
            name="new"
            id="creationPage"
            ?hidden="${!this.isActivePage(this.activePath, 'new')}"
            .partner="${this.partnerDetails}"
            .endpointName="${this.endpointName}"
            page-title="Add New Engagement"
          >
          </new-engagement-view>`
        : ''}
    `;
  }

  @property({type: Object})
  partnerDetails: GenericObject = {};

  @property({type: String})
  endpointName = 'engagementsList';

  @property({type: String})
  activePath!: string;

  @property({type: Object})
  lastParams!: GenericObject;

  @property({type: Boolean})
  allowNew!: boolean;

  @property({type: Boolean})
  hasEngagementUpdated = false;

  @property({type: Boolean})
  reloadListData = false;

  @property({type: Boolean})
  hideAddButton!: boolean;

  @property({type: Object})
  reduxRouteDetails?: EtoolsRouteDetails;

  connectedCallback() {
    super.connectedCallback();

    this._engagementStatusUpdated = this._engagementStatusUpdated.bind(this);
    document.addEventListener('global-loading', this._engagementStatusUpdated as any);
    // this._fireUpdateEngagementsFilters = debounce(this._fireUpdateEngagementsFilters.bind(this), 100) as any;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('', this._engagementStatusUpdated as any);
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails.routeName'), 'engagements')) {
      return;
    }
    if (typeof this.allowNew === 'undefined' && state.commonData.loadedTimestamp) {
      this.allowNew = !!isValidCollection(state.commonData.new_engagementOptions?.actions?.POST);
    }
    if (state.app.routeDetails && !isJsonStrMatch(state.app.routeDetails, this.reduxRouteDetails)) {
      this.reduxRouteDetails = state.app.routeDetails;
      this.activePath = this.reduxRouteDetails.path;
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

  isActivePage(activePath: string, expected: string) {
    return activePath.indexOf(expected) > -1;
  }
}
