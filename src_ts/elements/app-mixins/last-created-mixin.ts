import {PolymerElement} from '@polymer/polymer/polymer-element';
import {Constructor, GenericObject} from '../../types/global';

let _engagementData: GenericObject | null = null;

/**
 * @polymer
 * @mixinFunction
 */
function LastCreatedMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class LastCreatedMixinClass extends baseClass {
    _setLastEngagementData(data) {
      if (!data || !data.id) {
        return false;
      }
      _engagementData = data;
      return true;
    }

    getLastEngagementData(id) {
      if (!_engagementData) {
        return null;
      }

      const data = _engagementData as any;
      _engagementData = null;

      return +data.id === +id ? data : null;
    }
  }
  return LastCreatedMixinClass;
}

export default LastCreatedMixin;
