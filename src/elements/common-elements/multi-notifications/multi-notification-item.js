Polymer({
    is: 'multi-notification-item',
    properties: {
        duration: {
            type: Number,
            value: 3000
        },
        opened: {
            type: Boolean,
            observer: '_openedChanged'
        },
        text: {
            type: String,
            value: ''
        }
    },
    listeners: {
        'transitionend': '_onTransitionEnd',
        'move-up': '_moveUp'
    },
    _onTransitionEnd: function(e) {
        if (e && e.target === this && e.propertyName === 'opacity') {
            if (!this.opened) {
                this.fire('notification-shift', this.id);
            }
        }
    },
    _renderOpened: function() {
        requestAnimationFrame(() => {
            this.classList.add('notification-open');
        });
    },
    _renderClosed: function() {
        requestAnimationFrame(() => {
            this.classList.remove('notification-open');
        });
    },
    _openedChanged: function(opened) {
        if (opened) {
            this.async(this.close, this.duration);
            this._renderOpened();
        } else {
            this._renderClosed();
        }
    },
    close: function() {
        this.opened = false;
    },
    _moveUp: function() {
        let m = this;
        requestAnimationFrame(() => {
            m.offset = !m.offset && m.offset !== 0 ? 0 : m.offset + 70;
            this.transform(`translateY(-${m.offset}px)`);
        });
    }

    /**
     * Fired when notification should be moved up
     *
     * @event move-up
     */
});
