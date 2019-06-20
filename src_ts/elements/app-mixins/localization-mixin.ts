import {PolymerElement} from '@polymer/polymer';
import {Constructor} from '../../types/global';
import PermissionControllerMixin from './permission-controller-mixin';


function LocalizationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class LocalizationMixin extends (PermissionControllerMixin(baseClass)) {
    getHeadingLabel(base, item) {
      if (!item) {
        return '';
      }
      if (!base) {
        return item.label || '';
      }

      let labelPath = item.labelPath || item.path;
      let label = this.getFieldAttribute(`${base}.${labelPath}`, 'label', 'GET');

      return (label && typeof label === 'string') ? label : (item.label || '');
    }
  }
  return LocalizationMixin;
}

export default LocalizationMixin;
