Polymer({

    is: 'countries-dropdown',

    properties: {
        opened: {
            type: Boolean,
            reflectToAttribute: true,
            value: false
        }
    },

    listeners: {
        'paper-dropdown-close': '_toggleOpened',
        'paper-dropdown-open': '_toggleOpened'
    },

    _toggleOpened: function() {
        this.set('opened', this.$.dropdown.opened);
    },

    _countrySelected: function(e) {
        this.set('country', this.$.repeat.itemForElement(e.detail.item));
    }

});
