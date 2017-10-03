'use strict';

Polymer({

    is: 'action-buttons',

    properties: {
        actions: {
            type: Array,
            value: function() {
                return [];
            }
        },
        icons: {
            type: Object,
            value: function() {
                return {
                    'cancel': 'cancel',
                    'save': 'save',
                    'submit': 'assignment-turned-in',
                    'finalize': 'assignment-turned-in',
                    'create': 'assignment-turned-in'
                };
            }
        }
    },

    closeMenu: function() {
        this.statusBtnMenuOpened = false;
    },

    _setButtonText: function(item) {
        if (!item) { return ''; }
        let text = item.display_name || item.replace('_', ' ');

        if (!text) { throw 'Can not get button text!'; }

        return text.toUpperCase();
    },

    _btnClicked: function(event) {
        if (!event || !event.target) { return; }
        let target = event.target.classList.contains('other-options') ? event.target : event.target.parentElement || event.target,
            isMainAction = event.target.classList.contains('main-action');

        let action = isMainAction ?
            (this.actions[0].code || this.actions[0]) :
            target && target.getAttribute('action-code');

        if (action) { this.fire(`action-activated`, {type: action}); }
    },

    _showOtherActions: function(length) {
        return length > 1;
    },

    withActionsMenu: function(length) {
        return length > 1 ? 'with-menu' : '';
    },

    _filterActions: function(action) {
        return !_.isEqual(action, this.actions[0]);
    },

    _setIcon: function(item, icons) {
        if (!icons || !item) { return ''; }
        return icons[(item.code || item)] || '';
    },

    _setActionCode: function(item) {
        return item && (item.code || item);
    }

});
