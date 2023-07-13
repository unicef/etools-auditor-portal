import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';

export enum StaffScFilterKeys {
  search = 'search',
  partner__in = 'partner__in',
  status__in = 'status__in',
  staff_members__user__in = 'staff_members__user__in',
  partner_contacted_at__lte = 'partner_contacted_at__lte',
  partner_contacted_at__gte = 'partner_contacted_at__gte',
  date_of_draft_report_to_ip__lte = 'date_of_draft_report_to_ip__lte',
  date_of_draft_report_to_ip__gte = 'date_of_draft_report_to_ip__gte'
}

export const StaffScSelectedValueTypeByFilterKey: AnyObject = {
  [StaffScFilterKeys.search]: 'string',
  [StaffScFilterKeys.partner__in]: 'Array',
  [StaffScFilterKeys.status__in]: 'Array',
  [StaffScFilterKeys.staff_members__user__in]: 'Array',
  [StaffScFilterKeys.partner_contacted_at__lte]: 'string',
  [StaffScFilterKeys.partner_contacted_at__gte]: 'string',
  [StaffScFilterKeys.date_of_draft_report_to_ip__lte]: 'string',
  [StaffScFilterKeys.date_of_draft_report_to_ip__gte]: 'string'
};

export function getStaffScFilters() {
  return [
    {
      filterName: 'Search partner or auditor',
      filterKey: StaffScFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: 'Partner',
      filterKey: StaffScFilterKeys.partner__in,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'id',
      optionLabel: 'name',
      selectedValue: [],
      selected: false,
      minWidth: '300px',
      hideSearch: false,
      disabled: false
    },
    {
      filterName: 'Unicef User',
      filterKey: StaffScFilterKeys.staff_members__user__in,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'id',
      optionLabel: 'full_name',
      selectedValue: [],
      selected: false,
      minWidth: '300px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: 'Date IP Was Contacted Before',
      type: EtoolsFilterTypes.Date,
      filterKey: StaffScFilterKeys.partner_contacted_at__lte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Date IP Was Contacted After',
      type: EtoolsFilterTypes.Date,
      filterKey: StaffScFilterKeys.partner_contacted_at__gte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Draft Report Issued to IP Before',
      type: EtoolsFilterTypes.Date,
      filterKey: StaffScFilterKeys.date_of_draft_report_to_ip__lte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Draft Report Issued to IP After',
      type: EtoolsFilterTypes.Date,
      filterKey: StaffScFilterKeys.date_of_draft_report_to_ip__gte,
      selectedValue: '',
      selected: false
    }
  ];
}
