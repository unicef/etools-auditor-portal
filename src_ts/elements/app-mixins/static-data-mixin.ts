import {PolymerElement} from '@polymer/polymer';
import cloneDeep from 'lodash-es/cloneDeep';
import {Constructor} from "../../types/global";
import {property} from "@polymer/decorators/lib/decorators";

/**
 * @polymer
 * @mixinFunction
 */
function StaticDataMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class StaticDataMixin extends baseClass {

    // TODO:  this might not work as expected... it was a global variable before
    @property({type: Object})
    _staticData: object = {};

    _setData(key, data) {
      if (!key || !data || this._staticData[key]) {
        return false;
      }
      this._staticData[key] = cloneDeep(data);
      return true;
    }

    getData(key) {
      return cloneDeep(this._staticData[key]);
    }

    _updateData(key, data) {
      if (!key || !data || !this._staticData[key]) {
        return false;
      }
      this._staticData[key] = cloneDeep(data);
      return true;
    }
  }

  return StaticDataMixin;
}

export default StaticDataMixin;
