import {LitElement} from 'lit-element';
import {getFieldAttribute} from './permission-controller';
import {Constructor} from '../../types/global';

/**
 * @polymer
 * @mixinFunction
 */
function LocalizationMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class LocalizationMixinClass extends (baseClass as Constructor<LitElement>) {
    getHeadingLabel(base, item) {
      if (!item) {
        return '';
      }
      if (!base) {
        return item.label || '';
      }

      const labelPath = item.labelPath || item.path;
      const label = getFieldAttribute(`${base}.${labelPath}`, 'label', 'GET');

      return label && typeof label === 'string' ? label : item.label || '';
    }
  }
  return LocalizationMixinClass;
}

export default LocalizationMixinLit;
