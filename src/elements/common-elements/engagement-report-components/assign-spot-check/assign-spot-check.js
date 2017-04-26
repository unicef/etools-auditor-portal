'use strict';

Polymer({
   is: 'assign-spot-check',
    behaviors: [
        APBehaviors.DateBehavior
    ],
    properties: {
        editMode: {
            type: Boolean,
            value: true,
            observer: '_editModeChanged'
        }
    },
    _editModeChanged: function() {
        this.updateStyles();
    }
});