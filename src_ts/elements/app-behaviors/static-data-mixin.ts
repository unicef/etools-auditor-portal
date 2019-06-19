import {PolymerElement} from '@polymer/polymer';
import cloneDeep from 'lodash-es/cloneDeep';


export const StaticDataMixin = (baseClass) => class extends PolymerElement(baseClass) {

    let _staticData = {};

    _setData(key, data) {
        if (!key || !data || _staticData[key]) { return false; }
        _staticData[key] = cloneDeep(data);
        return true;
    };

    getData(key) {
        return cloneDeep(_staticData[key]);
    };

    _updateData(key, data) {
        if (!key || !data || !_staticData[key]) { return false; }
        _staticData[key] = cloneDeep(data);
        return true;
    };

};
