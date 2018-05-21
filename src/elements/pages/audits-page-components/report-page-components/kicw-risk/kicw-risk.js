'use strict';

Polymer({
    is: 'kicw-risk',

    properties: {
        isEditable: Boolean,
        risksData: {
            type: Array,
            value: () => []
        },
        emptyObj: {
            type: Object,
            value: () => ({
                value: {},
                extra: {}
            })
        },
        blueprintId: Number,
        columns: {
            type: Array,
            value: function() {
                return [{
                    'size': '80px',
                    'label': 'Risk #',
                    'name': 'autoNumber',
                    'align': 'center'
                }, {
                    'size': 10,
                    'label': 'Risks Rating',
                    'path': 'value_display'
                }, {
                    'size': 30,
                    'label': 'Key control observation',
                    'path': 'extra.key_control_observation',
                }, {
                    'size': 30,
                    'label': 'Recommendation',
                    'path': 'extra.recommendation',
                }, {
                    'size': 30,
                    'label': 'IP response',
                    'path': 'extra.ip_response',
                }];
            }
        }
    },

    editRisk: function(event) {
        let blueprint = this._createBlueprintFromEvent(event);
        this.fire('kicw-risk-edit', {blueprint});
    },

    removeRisk: function() {
        let blueprint = this._createBlueprintFromEvent(event);
        blueprint.risks[0]._delete = true;
        this.fire('kicw-risk-edit', {blueprint, delete: true});
    },

    _createBlueprintFromEvent: function(event) {
        let item = event && event.model && event.model.item,
            index = this.risksData.indexOf(item);

        if ((!index && index !== 0) || !~index) {
            throw 'Can not find data';
        }

        return {
            id: this.blueprintId,
            risks: [_.cloneDeep(item)]
        };
    }

});
