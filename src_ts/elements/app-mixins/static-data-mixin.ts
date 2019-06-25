import {PolymerElement} from '@polymer/polymer';
import cloneDeep from 'lodash-es/cloneDeep';
import {Constructor} from "../../types/global";

let _staticData!: {
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
    local_curency: number,
    location_types: [],
    partner_file_types: [],
    partner_types: []
  },
  statuses: [],
  users: []
};


/**
 * @polymer
 * @mixinFunction
 */
function StaticDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class StaticDataMixin extends baseClass {

    _setData(key, data) {
      if (!key || !data || _staticData[key]) {
        return false;
      }
      _staticData[key] = cloneDeep(data);
      return true;
    }

    getData(key) {
      return cloneDeep(_staticData[key]);
    }

    _updateData(key, data) {
      if (!key || !data || !_staticData[key]) {
        return false;
      }
      _staticData[key] = cloneDeep(data);
      return true;
    }
  }

  return StaticDataMixin;
}

export default StaticDataMixin;
