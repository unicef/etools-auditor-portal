Polymer({
    is: 'app-sidebar-menu',

    properties: {
        page: String,
        user: {
            type: Object,
            observer: 'checkPermissions'
        },
        showSscPage: {
            type: Boolean,
            value: false
        }
    },

    behaviors: [
        etoolsAppConfig.globals
    ],

    _toggleDrawer: function() {
        this.fire('drawer-toggle-tap');
    }
});
