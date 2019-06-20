import { PolymerElement } from '@polymer/polymer';
import PermissionController from './permission-controller';

function LocalizationMixin <T extends Constructor<PolymerElement>>(baseClass: T) {
    class LocalizationMixin extends (PermissionController(baseClass)) {
        getHeadingLabel(base, item) {
            if (!item) { return ''; }
            if (!base) { return item.label || ''; }

            let labelPath = item.labelPath || item.path;
            let label = this.getFieldAttribute(`${base}.${labelPath}`, 'label', 'GET');

            return (label && typeof label === 'string') ? label : (item.label || '');
        }
    }
    return LocalizationMixin;

}

export default LocalizationMixin;
