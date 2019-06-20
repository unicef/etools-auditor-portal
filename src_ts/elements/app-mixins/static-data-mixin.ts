import cloneDeep from 'lodash-es/cloneDeep';


function StaticDataMixin <T extends Constructor>(baseClass: T) {
    class StaticDataMixin extends (baseClass) {
        let _staticData = {};

        _setData(key, data) {
            if (!key || !data || _staticData[key]) { return false; }
            _staticData[key] = cloneDeep(data);
            return true;
        }

        getData(key) {
            return cloneDeep(_staticData[key]);
        }

        _updateData(key, data) {
            if (!key || !data || !_staticData[key]) { return false; }
            _staticData[key] = cloneDeep(data);
            return true;
        }
    }
    return StaticDataMixin;


}

export default StaticDataMixin;
