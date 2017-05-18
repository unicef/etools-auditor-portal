'use strict';

Polymer({
    is: 'subject-area-element',
    behaviors: [APBehaviors.StaticDataController],
    properties: {
        area: {
            type: Object,
            notify: true
        }
    },
    observers: ['_setData(area, riskOptions)'],
    ready: function() {
        this.riskOptions = this.getData('riskOptions');
    },
    _setData: function(data) {
        if (!data) { return; }
        if (!data.changed) {
            this.originalData = _.clone(data);
        }
        if (data.value && typeof data.value !== 'object') {
            this.area.value = this.riskOptions[this.area.value];
        }
        this.areaData = _.clone(this.area);
    },
    openEditDialog: function() {
        this.fire('open-edit-dialog', {index: this.index, data: this.areaData});
        this.$.listElement.detailsOpened = true;
    },
    getRiskData: function() {
        if (!this.area.value) { return null; }
        if (this.area.value.value === this.originalData.value && this.area.extra === this.originalData.extra) { return null; }

        let data = {
            id: this.area.id,
            extra: this.area.extra,
            value: this.area.value.value
        };

        return data;
    },
    validate: function() {
        return !!this.area.value && this.area.extra !== null;
    }
});
