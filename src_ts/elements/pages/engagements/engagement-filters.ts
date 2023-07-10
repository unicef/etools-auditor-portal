import {AnyObject} from '@unicef-polymer/etools-types/dist/global.types';
import {setselectedValueTypeByFilterKey} from '@unicef-polymer/etools-filters/src/filters';
import {EtoolsFilterTypes} from '@unicef-polymer/etools-filters/src/etools-filters';

export enum EngagementFilterKeys {
  search = 'search',
  agreement__auditor_firm__in = 'agreement__auditor_firm__in',
  engagement_type__in = 'engagement_type__in',
  partner__in = 'partner__in',
  status__in = 'status__in',
  joint_audit = 'joint_audit',
  year_of_audit = 'year_of_audit',
  partner_contacted_at__lte = 'partner_contacted_at__lte',
  partner_contacted_at__gte = 'partner_contacted_at__gte',
  date_of_draft_report_to_ip__lte = 'date_of_draft_report_to_ip__lte',
  date_of_draft_report_to_ip__gte = 'date_of_draft_report_to_ip__gte'
}

export const selectedValueTypeByFilterKey: AnyObject = {
  [EngagementFilterKeys.search]: 'string',
  [EngagementFilterKeys.agreement__auditor_firm__in]: 'Array',
  [EngagementFilterKeys.engagement_type__in]: 'Array',
  [EngagementFilterKeys.partner__in]: 'Array',
  [EngagementFilterKeys.status__in]: 'Array',
  [EngagementFilterKeys.joint_audit]: 'Array',
  [EngagementFilterKeys.year_of_audit]: 'string',
  [EngagementFilterKeys.partner_contacted_at__lte]: 'string',
  [EngagementFilterKeys.partner_contacted_at__gte]: 'string',
  [EngagementFilterKeys.date_of_draft_report_to_ip__lte]: 'string',
  [EngagementFilterKeys.date_of_draft_report_to_ip__gte]: 'string'
};

setselectedValueTypeByFilterKey(selectedValueTypeByFilterKey);

export function getEngagementFilters() {
  return [
    {
      filterName: 'Search partner or auditor',
      filterKey: EngagementFilterKeys.search,
      type: EtoolsFilterTypes.Search,
      selectedValue: '',
      selected: true
    },
    {
      filterName: 'Audit Firm',
      filterKey: EngagementFilterKeys.agreement__auditor_firm__in,
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
      filterName: 'Engagement Type',
      filterKey: EngagementFilterKeys.engagement_type__in,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'value',
      optionLabel: 'display_name',
      selectedValue: [],
      selected: false,
      minWidth: '300px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: 'Partner',
      filterKey: EngagementFilterKeys.partner__in,
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
      filterName: 'Status',
      filterKey: EngagementFilterKeys.status__in,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [],
      optionValue: 'value',
      optionLabel: 'display_name',
      selectedValue: [],
      selected: false,
      minWidth: '300px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: 'Joint Audit',
      filterKey: EngagementFilterKeys.joint_audit,
      type: EtoolsFilterTypes.DropdownMulti,
      selectionOptions: [
        {display_name: 'Yes', value: 'true'},
        {display_name: 'No', value: 'false'}
      ],
      optionValue: 'value',
      optionLabel: 'display_name',
      selectedValue: [],
      selected: false,
      hideSearch: true,
      disabled: false
    },
    {
      filterName: 'Year of Audit',
      type: EtoolsFilterTypes.Dropdown,
      filterKey: EngagementFilterKeys.year_of_audit,
      selectedValue: getYearOfAuditOptions(),
      optionValue: 'value',
      optionLabel: 'label',
      selectionOptions: [],
      singleSelection: true,
      selected: false,
      minWidth: '200px',
      hideSearch: true,
      disabled: false
    },
    {
      filterName: 'Date IP Was Contacted Before',
      type: EtoolsFilterTypes.Date,
      filterKey: EngagementFilterKeys.partner_contacted_at__lte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Date IP Was Contacted After',
      type: EtoolsFilterTypes.Date,
      filterKey: EngagementFilterKeys.partner_contacted_at__gte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Draft Report Issued to IP Before',
      type: EtoolsFilterTypes.Date,
      filterKey: EngagementFilterKeys.date_of_draft_report_to_ip__lte,
      selectedValue: '',
      selected: false
    },
    {
      filterName: 'Draft Report Issued to IP After',
      type: EtoolsFilterTypes.Date,
      filterKey: EngagementFilterKeys.date_of_draft_report_to_ip__gte,
      selectedValue: '',
      selected: false
    }
  ];
}

function getYearOfAuditOptions() {
  const currYear = new Date().getFullYear();
  return [
    {label: currYear - 1, value: currYear - 1},
    {label: currYear, value: currYear},
    {label: currYear + 1, value: currYear + 1}
  ];
}
