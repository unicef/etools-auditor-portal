import {LitElement} from 'lit-element';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';

let _engagementData: GenericObject | null = null;

/**
 * @polymer
 * @mixinFunction
 */
function LastCreatedMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
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

export default LastCreatedMixinLit;
