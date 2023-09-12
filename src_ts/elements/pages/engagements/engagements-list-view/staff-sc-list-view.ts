import {customElement} from 'lit-element';
import {EtoolsFilter} from '@unicef-polymer/etools-filters/src/etools-filters';
import {
  updateFilterSelectionOptions,
  setselectedValueTypeByFilterKey
} from '@unicef-polymer/etools-filters/src/filters';
import {
  StaffScFilterKeys,
  getStaffScFilters,
  StaffScSelectedValueTypeByFilterKey
} from '../../staff-sc/staff-sc-filters';

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
    super.connectedCallback();
  }

  stateChanged(state: RootState): void {
    if (state.app?.routeDetails?.routeName !== 'staff-sc') {
      return;
    }
    this.baseStateChanged(state);
  }

  getFilters() {
    return JSON.parse(JSON.stringify(getStaffScFilters()));
  }

  populateFilterOptionsFromCommonData(state: RootState, filters: EtoolsFilter[]) {
    updateFilterSelectionOptions(filters, StaffScFilterKeys.partner__in, state.commonData.filterPartners || []);
    updateFilterSelectionOptions(filters, StaffScFilterKeys.status__in, this.columnValuesFromOptions.status || []);
    updateFilterSelectionOptions(
      filters,
      StaffScFilterKeys.staff_members__user__in,
      state.commonData.staffMembersUsers || []
    );
  }

  setValueTypeByFilterKey() {
    setselectedValueTypeByFilterKey(StaffScSelectedValueTypeByFilterKey);
  }
}
