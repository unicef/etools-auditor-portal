Polymer({

    is: 'app-sidebar-menu',

    properties: {
        page: String
    },

    _toggleDrawer: function() {
        this.fire('drawer-toggle-tap');
    }

});
