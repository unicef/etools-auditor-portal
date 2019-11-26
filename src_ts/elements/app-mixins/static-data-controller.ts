import cloneDeep from 'lodash-es/cloneDeep';

const _staticData = {
  engagementTypes: [],
  offices: [],
  partners: [],
  sections: [],
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
  },
  statuses: [],
  users: []
};

export function setStaticData(key, data) {
  if (!key || !data) {
    return false;
  }
  _staticData[key] = cloneDeep(data);
  return true;
}

export function getStaticData(key) {
  return cloneDeep(_staticData[key]);
}

export function updateStaticData(key, data) {
  if (!key || !data || !_staticData[key]) {
    return false;
  }
  _staticData[key] = cloneDeep(data);
  return true;
}
