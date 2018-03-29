'use strict';

Polymer({
    is: 'subject-area-element',

    behaviors: [
        APBehaviors.CommonMethodsBehavior,
    ],

    properties: {
        area: {
            type: Object,
            notify: true
        }
    },

    observers: ['_setData(area, riskOptions)'],

    ready: function() {
        let riskOptions = this.getChoices(`${this.basePermissionPath}.test_subject_areas.blueprints.risk.value`) || [];
        this.set('riskOptions', riskOptions);
    },

    _setData: function(data) {
        if (!data) { return; }
        if (!data.changed) {
            this.originalData = _.cloneDeep(data);
        }

        if (data.blueprints[0].risk && _.isNumber(data.blueprints[0].risk.value)) {
            this.area.blueprints[0].risk.value = this.riskOptions[this.area.blueprints[0].risk.value];
        }

        let risk = _.get(data, 'blueprints[0].risk') || {extra: {}};
        if (this.isJSONObj(risk.extra)) {
            risk.extra = JSON.parse(risk.extra);
        }
        data.blueprints[0].risk = risk;

        this.areaData = _.clone(data.blueprints[0]);
    },

    openEditDialog: function() {
        this.fire('open-edit-dialog', {data: this.area});
    },

    getRiskData: function() {
        if (!this.area.blueprints[0].risk || !this.area.blueprints[0].risk.value) { return null; }
        if (this.area.blueprints[0].risk.value.value === this.originalData.blueprints[0].risk.value &&
            _.isEqual(this.area.blueprints[0].risk.extra, this.originalData.blueprints[0].risk.extra)) { return null; }

        let risk = {
            extra: this.area.blueprints[0].risk.extra,
            value: this.area.blueprints[0].risk.value.value
        };

        let blueprint = {
            id: this.area.blueprints[0].id,
            risk: risk
        };

        return {
            id: this.area.id,
            blueprints: [blueprint]
        };
    },

    validate: function() {
        return !!this.area.blueprints[0].risk.value && this.area.blueprints[0].risk.extra !== null;
    }
});
