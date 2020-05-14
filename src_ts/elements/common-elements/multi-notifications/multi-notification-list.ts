import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import './multi-notification-item';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../types/global';


/**
 * @polymer
 * @customElement
 */
class MultiNotificationList extends PolymerElement {
  static get template() {
    return html`
        <style>
            :host {
                display: block;
                position: fixed;
                left: 0;
                bottom: 0;
                z-index: 105;
            }
        </style>

        <template is="dom-repeat" items="[[notifications]]">
            <multi-notification-item id="[[item.id]]" opened text="{{item.text}}"></multi-notification-item>
        </template>
    `;
  }

  @property({type: Array, notify: true})
  notifications: GenericObject[] = [];

  @property({type: Array})
  notificationsQueue: GenericObject[] = [];

  @property({type: Number})
  limit: number = 3;

  @property({type: Number})
  count: number = 1;

  connectedCallback() {
    super.connectedCallback();
    this._initListeners();
  }

  _initListeners() {
    this._onNotificationPush = this._onNotificationPush.bind(this);
    this.addEventListener('notification-push', this._onNotificationPush as any);

    this._onNotificationShift = this._onNotificationShift.bind(this);
    this.addEventListener('notification-shift', this._onNotificationShift as any);

    this._resetNotifications = this._resetNotifications.bind(this);
    this.addEventListener('reset-notifications', this._resetNotifications as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  _removeListeners() {
    this.removeEventListener('notification-push', this._onNotificationPush as any);
    this.removeEventListener('notification-shift', this._onNotificationShift as any);
    this.removeEventListener('reset-notifications', this._resetNotifications as any);
  }

  _onNotificationShift(_e, id) {
    const index = this.notifications.findIndex((notification) => {
      return notification.id === id;
    });

    if (index !== undefined) {
      this.splice('notifications', index, 1);
    }

    // Check and show notifications from queue
    if (this.notificationsQueue.length) {
      this.push('notifications', this.shift('notificationsQueue'));
    }
  }

  _onNotificationPush(e) {
    const notification = {
      id: `toast___${this.count++}`,
      text: e.detail.text
    };

    if (this.limit > this.notifications.length) {
      this.push('notifications', notification);
    } else {
      this.push('notificationsQueue', notification);
    }
  }

  _resetNotifications() {
    ['notifications', 'notificationsQueue'].forEach((arrayName) => {
      const result = this[arrayName].filter(toast => toast.fixed);
      this.set(arrayName, result);
    });
  }

}
window.customElements.define('multi-notification-list', MultiNotificationList);

