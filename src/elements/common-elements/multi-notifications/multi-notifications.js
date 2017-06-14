'use strict';

Polymer({
    is: 'multi-notifications',
    properties: {
        messages: {
            type: Array,
            value: function() {
                return [];
            },
            notify: true,
        },
        messagesQueue: {
            type: Array,
            value: function() {
                return [];
            },
            notify: true
        },
        limit: {
            type: Number,
            value: 3
        }
    },
    listeners: {
        'notification-push': '_onNotificationPush',
        'notification-shift': '_onNotificationShift'
    },
    _onNotificationShift: function() {
        this.shift('messages');
    },
    _onNotificationPush: function(e, message) {
        this.push('messages', message);
        this.pushNotification();
    },
    pushNotification: function() {
        let notifications = Polymer.dom(this.root).querySelectorAll('multi-notification-message');
        notifications.forEach(notification => notification.fire('push-up'));
    }
});
