'use strict';

Polymer({
    is: 'assessment-of-controls',

    behaviors: [
        APBehaviors.TableElementsBehavior,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        basePermissionPath: {
            type: String
        },
        data: {
            type: Object
        }
    },

    observers: [
        '_errorHandler(errorObject)',
        '_setDataItems(data)'
    ],

    ready: function() {
        let textareas = Polymer.dom(this.root).querySelectorAll('paper-textarea');

        if (textareas) {
            textareas.forEach((textarea) => {
                this.listen(textarea, 'focused-changed', '_saveData');
            });
        }
        this.requestInProcess = false;
    },

    _setDataItems: function() {
        this.set('dataItems', [this.data]);
    },

    getAssessmentOfControlsData: function() {
        let keys = ['recommendation', 'audit_observation', 'ip_response'];
        let data = _.pick(this.data, keys);
        let originalData = _.pick(this.originalData && this.originalData[0], keys);

        if (!_.isEqual(data, originalData)) {
            return data;
        }
    }
});
