import {Constructor} from '../../types/global';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';

/**
 * @polymer
 * @mixinFunction
 */
function TableElementsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class TableElementsMixinClass extends baseClass {

    }
    return TableElementsMixinClass;
}

export default TableElementsMixin;
