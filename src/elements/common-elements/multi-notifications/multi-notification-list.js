Polymer({
    is: 'multi-notification-list',
    properties: {
        notifications: {
            type: Array,
            value: function() {
                return [];
            },
            notify: true,
        },
        notificationsQueue: {
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
        this.shift('notifications');
        Polymer.dom.flush();
        //Check and show notifications from queue
        if (this.notificationsQueue.length) {
            this.push('notifications', this.shift('notificationsQueue'));
            this.moveUpNotifications();
        }
    },
    _onNotificationPush: function(e, notification) {
        if (this.limit > this.notifications.length) {
            this.push('notifications', notification);
            this.moveUpNotifications();
        } else {
            this.push('notificationsQueue', notification);
        }
    },
    moveUpNotifications: function() {
        Polymer.dom.flush();
        let notifications = Polymer.dom(this.root).querySelectorAll('multi-notification-item');
        notifications.forEach((notification) => {
            notification.fire('move-up');
        });

    }

    /**
     * Fired when notification added in queue
     *
     * @event notification-push
     */

    /**
     * Fired when notification removed from queue after showing
     *
     * @event notification-shift
     */
});
