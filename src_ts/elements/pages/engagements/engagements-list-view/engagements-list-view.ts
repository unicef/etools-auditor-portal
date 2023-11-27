import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {
  EngagementFilterKeys,
  getEngagementFilters,
  EngagementsFiltersHelper
} from '../engagement-filters';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState, store} from '../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import {ListViewBase} from './list-view-base';

/**
 * @customElement
 */
@customElement('engagements-list-view')
export class EngagementsListView extends connect(store)(ListViewBase) {
  connectedCallback() {
    /**
     * Disable loading message for main list elements load,
     * triggered by parent element on stamp
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'engagements-list'
    });
    this.isStaffSc = false;
    this.prevQueryStringObj = {ordering: 'reference_number', page_size: 10, page: 1};
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (!state.app?.routeDetails?.path.includes('engagements/list')) {
      return;
    }
    this.baseStateChanged(state);
  }

  getFilters() {
    return JSON.parse(JSON.stringify(getEngagementFilters()));
  }

  populateFilterOptionsFromCommonData(state: RootState, filters: EtoolsFilter[]) {
    EngagementsFiltersHelper.updateFilterSelectionOptions(filters, EngagementFilterKeys.partner__in, state.commonData.filterPartners || []);
    EngagementsFiltersHelper.updateFilterSelectionOptions(
      filters,
      EngagementFilterKeys.agreement__auditor_firm__in,
      state.commonData.filterAuditors || []
    );
    EngagementsFiltersHelper.updateFilterSelectionOptions(filters, EngagementFilterKeys.status__in, this.columnValuesFromOptions.status || []);
    EngagementsFiltersHelper.updateFilterSelectionOptions(
      filters,
      EngagementFilterKeys.engagement_type__in,
      this.columnValuesFromOptions.engagementTypes || []
    );
  }
}
