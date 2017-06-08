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
            this.originalData = _.cloneDeep(data);
        }

        if (_.isNumber(data.blueprints[0].value)) {
            this.area.blueprints[0].value = this.riskOptions[this.area.blueprints[0].value];
        }

        this.areaData = _.clone(this.area.blueprints[0]);
    },
    openEditDialog: function() {
        this.fire('open-edit-dialog', {data: this.area});
    },
    getRiskData: function() {
        if (!this.area.blueprints[0].value) { return null; }
        if (this.area.blueprints[0].value.value === this.originalData.blueprints[0].value &&
            this.area.blueprints[0].extra === this.originalData.blueprints[0].extra) { return null; }

        let blueprint = {
            id: this.area.blueprints[0].id,
            extra: this.area.blueprints[0].extra,
            value: this.area.blueprints[0].value.value
        };

        return {
            id: this.area.id,
            blueprints: [blueprint]
        };
    },
    validate: function() {
        return !!this.area.blueprints[0].value && this.area.blueprints[0].extra !== null;
    }
});
