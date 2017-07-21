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
                    'activate': 'check',
                    'confirm': 'check',
                    'assign': 'check'
                };
            }
        }
    },

    closeMenu: function() {
        this.statusBtnMenuOpened = false;
    },

    _setButtonText: function(text) {
        if (!text) { return ''; }
        if (!_.isString(text)) { throw 'Button text must be a string!'; }

        return text.replace('_', ' ').toUpperCase();
    },

    _btnClicked: function(event) {
        if (!event || !event.target) { return; }
        let target = event.target.classList.contains('other-options') ? event.target : event.target.parentElement || event.target,
            isMainAction = !target.classList.contains('other-options') && !target.classList.contains('option-button') ;

        let action = isMainAction ? this.actions[0] : target && target.getAttribute('event-name');
        if (action) { this.fire(`action-activated`, {type: action}); }
    },

    _setBtnClass: function(length) {
        return this._showOtherActions(length) ? 'with-actions' : '';
    },

    _showOtherActions: function(length) {
        return length > 1;
    },

    _setIcon: function(icon, icons) {
        if (!icons || !icons) { return ''; }
        return icons[icon] || '';
    }

});
