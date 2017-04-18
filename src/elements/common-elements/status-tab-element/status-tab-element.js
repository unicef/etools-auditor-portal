'use strict';

Polymer({
    is: 'status-tab-element',
    properties: {
        status: {
            type: String,
            value: 'draft'
        }
    },
    _getStatusContainerClass: function(status, statusNumber) {
        let currentStatusNumber = this._getStatusNumber(status);
        if (+statusNumber === currentStatusNumber) { return 'active'; } else if (+statusNumber < currentStatusNumber) { return 'completed'; } else { return ''; }
    },
    _getStatusNumber: function(status) {
        return ['draft', 'submitted', 'tpm_accepted', 'confirmed', 'tpm_reported', 'approved'].indexOf(status) + 1;
    },
    closeMenu: function() {
        this.statusBtnMenuOpened = false;
    }
});