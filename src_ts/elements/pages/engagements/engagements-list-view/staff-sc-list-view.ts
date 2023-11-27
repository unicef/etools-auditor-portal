import {customElement} from 'lit/decorators.js';
import {EtoolsFilter} from '@unicef-polymer/etools-unicef/src/etools-filters/etools-filters';
import {StaffScFilterKeys, getStaffScFilters, StaffScFiltersHelper} from '../../staff-sc/staff-sc-filters';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {RootState, store} from '../../../../redux/store';
import {ListViewBase} from './list-view-base';
import {connect} from 'pwa-helpers/connect-mixin';

/**
 * @customElement
 */
@customElement('staff-sc-list-view')
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
    this.isStaffSc = true;
    this.prevQueryStringObj = {ordering: 'reference_number', page_size: 10, page: 1};
    this.addBtnText = 'Add New Staff Spot Checks';
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (!state.app?.routeDetails?.path.includes('staff-sc/list')) {
      return;
    }
    this.baseStateChanged(state);
  }

  getFilters() {
    return JSON.parse(JSON.stringify(getStaffScFilters()));
  }

  populateFilterOptionsFromCommonData(state: RootState, filters: EtoolsFilter[]) {
    StaffScFiltersHelper.updateFilterSelectionOptions(
      filters,
      StaffScFilterKeys.partner__in,
      state.commonData.filterPartners || []
    );
    StaffScFiltersHelper.updateFilterSelectionOptions(
      filters,
      StaffScFilterKeys.status__in,
      this.columnValuesFromOptions.status || []
    );
    StaffScFiltersHelper.updateFilterSelectionOptions(
      filters,
      StaffScFilterKeys.staff_members__user__in,
      state.commonData.staffMembersUsers || []
    );
  }
}
