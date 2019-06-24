import {PolymerElement} from '@polymer/polymer';
import {Constructor} from "../../types/global";
import {property} from "@polymer/decorators/lib/decorators";

/**
 * @polymer
 * @mixinFunction
 */
function LastCreatedMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class LastCreatedMixinClass extends (baseClass) {

        @property({type: Object})
        _engagementData: object | null = null;

        _setLastEngagementData(data) {
            if (!data || !data.id) { return false; }
            this._engagementData = data;
            return true;
        }

        getLastEngagementData(id) {
            if (!this._engagementData) { return null; }

            let data = this._engagementData as any;
            this._engagementData = null;

            return +data.id === +id ? data : null;
        }
    }
    return LastCreatedMixinClass;
}

export default LastCreatedMixin;
