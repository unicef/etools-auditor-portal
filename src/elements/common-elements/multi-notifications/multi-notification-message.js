'use strict';

Polymer({
    is: 'multi-notification-message',
    behaviors: [
        Polymer.IronOverlayBehavior
    ],
    properties: {
        id: {
            type: Number
        },
        text: {
            type: String,
            value: ''
        },
        fitInto: {
            type: Object,
            value: window,
            observer: '_onFitIntoChanged'
        },
        horizontalAlign: {
            type: String,
            value: 'left'
        },
        verticalAlign: {
            type: String,
            value: 'bottom'
        },
        duration: {
            type: Number,
            value: 3000
        },
        noCancelOnOutsideClick: {
            type: Boolean,
            value: true
        },
        offset: {
            type: Number,
            value: 0
        }
    },
    listeners: {
        'transitionend': '_onTransitionEnd',
        'push-up': '_pushUp'
    },
    _onTransitionEnd: function() {
        if (!this.opened) {
            this.fire('notification-shift');
        }
    },
    _renderOpened: function() {
        this.style.opacity = '1';
    },
    _renderClosed: function() {
        this.style.opacity = '0';
    },
    _onFitIntoChanged: function(fitInto) {
        this.positionTarget = fitInto;
    },
    _openedChanged: function() {
        if (this._canAutoClose) {
            this.async(this.close, this.duration);
        }
        Polymer.IronOverlayBehaviorImpl._openedChanged.apply(this, arguments);
    },
    get _canAutoClose() {
        return this.duration > 0 && this.duration !== Infinity;
    },
    _pushUp: function() {
        this.offset += 70;
        this.style.transform = `translateY(-${this.offset}px)`;
    }

});
