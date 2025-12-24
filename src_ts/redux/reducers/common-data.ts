import {Reducer} from 'redux';
import {SET_ALL_STATIC_DATA, UPDATE_STATIC_DATA} from '../actions/actionsConstants';
import {RootAction} from '../store';
import {AnyObject} from '@unicef-polymer/etools-types';

export interface CommonDataState {
  users: [];
  offices: [];
  partners: [];
  allPartners: [];
  sections: [];
  staffMembersUsers: AnyObject[];
  staticDropdown: {
    cso_types: [];
    agency_choices: [];
    agreement_amendment_types: [];
    agreement_status: [];
    agreement_types: [];
    attachment_types_active: [];
    currencies: [];
    intervention_amendment_types: [];
    intervention_doc_types: [];
    intervention_status: [];
    local_curency: null;
    location_types: [];
    partner_file_types: [];
    partner_types: [];
    attachment_types: [];
  };
  filterAuditors: [];
  filterPartners: [];
  new_engagementOptions: AnyObject;
  new_staff_scOptions: AnyObject;
  new_attachOptions: AnyObject;
  loadedTimestamp: number;
}

const INITIAL_COMMON_DATA: CommonDataState = {
  partners: [],
  allPartners: [],
  users: [],
  sections: [],
  offices: [],
  staffMembersUsers: [],
  staticDropdown: {
    cso_types: [],
    agency_choices: [],
    agreement_amendment_types: [],
    agreement_status: [],
    agreement_types: [],
    attachment_types_active: [],
    currencies: [],
    intervention_amendment_types: [],
    intervention_doc_types: [],
    intervention_status: [],
    local_curency: null,
    location_types: [],
    partner_file_types: [],
    partner_types: [],
    attachment_types: []
  },
  filterAuditors: [],
  filterPartners: [],
  new_engagementOptions: {},
  new_staff_scOptions: {},
  new_attachOptions: {},
  loadedTimestamp: 0
};

const commonData: Reducer<CommonDataState, RootAction> = (state = INITIAL_COMMON_DATA, action) => {
  switch (action.type) {
    case SET_ALL_STATIC_DATA:
      return {
        ...state,
        allPartners: action.staticData.partners,
        partners: (action.staticData.partners || []).filter((p) => !p.hidden),
        users: action.staticData.users,
        sections: action.staticData.sections,
        offices: action.staticData.offices,
        staffMembersUsers: action.staticData.staffMembersUsers,
        staticDropdown: action.staticData.staticDropdown,
        filterAuditors: action.staticData.filterAuditors,
        filterPartners: action.staticData.filterPartners,
        new_engagementOptions: action.staticData.new_engagementOptions,
        new_staff_scOptions: action.staticData.new_staff_scOptions,
        new_attachOptions: action.staticData.new_attachOptions,
        loadedTimestamp: new Date().getTime()
      };
    case UPDATE_STATIC_DATA:
      return {
        ...state,
        ...action.staticData
      };
    default:
      return state;
  }
};

export default commonData;
