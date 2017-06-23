Polymer({

    is: 'user-dropdown',

    behaviors: [
        etoolsAppConfig.globals
    ],

    properties: {
        opened: {
            type: Boolean,
            reflectToAttribute: true,
            value: false
        },
        isAdmin: {
            type: Boolean,
            value: false
        }
    },

    listeners: {
        'paper-dropdown-close': '_toggleOpened',
        'paper-dropdown-open': '_toggleOpened'
    },

    _toggleOpened: function() {
        this.$.dropdownMenu.select(null);
        this.set('opened', this.$.dropdown.opened);
    },

    _changeLocation: function(path) {
        window.location.href = window.location.origin + '/' + path + '/';
    },

    _navigateToAdminPage: function() {
        this._changeLocation('admin');
    },

    _logout: function() {
        this.resetOldUserData();
        this._changeLocation('accounts/logout');
    }

});
