


function LastCreatedMixin <T extends Constructor>(baseClass: T) {
    class LastCreatedMixin extends (baseClass){
        let _engagementData;

        _setLastEngagementData(data) {
            if (!data || !data.id) { return false; }
            _engagementData = data;
            return true;
        }

        getLastEngagementData(id) {
            if (!_engagementData) { return null; }

            let data = _engagementData;
            _engagementData = null;

            return +data.id === +id ? data : null;
        }
    }
    return LastCreatedMixin;
}

export default LastCreatedMixin;