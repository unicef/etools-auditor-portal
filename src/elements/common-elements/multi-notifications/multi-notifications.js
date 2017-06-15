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
            }
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
        if (this.messagesQueue.length) {
            this.push('messages', this.shift('messagesQueue'));
            this.pushNotification();
        }
    },
    _onNotificationPush: function(e, message) {
        if (this.limit > this.messages.length) {
            this.push('messages', message);
            this.pushNotification();
        } else {
            this.push('messagesQueue', message);
        }
    },
    pushNotification: function() {
        let notifications = Polymer.dom(this.root).querySelectorAll('multi-notification-message');
        notifications.forEach(notification => {
            if (notification.opened) {
                notification.fire('push-up');
            }
        });
    }
});
