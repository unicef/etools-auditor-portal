import {PolymerElement} from '@polymer/polymer';
import {getFieldAttribute} from './permission-controller';
import {Constructor} from "../../types/global";

/**
 * @polymer
 * @mixinFunction
 */
function LocalizationMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class LocalizationMixinClass extends (baseClass  as Constructor<PolymerElement>) {

        getHeadingLabel(base, item) {
            if (!item) { return ''; }
            if (!base) { return item.label || ''; }

            let labelPath = item.labelPath || item.path;
            let label = getFieldAttribute(`${base}.${labelPath}`, 'label', 'GET');

            return (label && typeof label === 'string') ? label : (item.label || '');
        }
    }
    return LocalizationMixinClass;

}

export default LocalizationMixin;
