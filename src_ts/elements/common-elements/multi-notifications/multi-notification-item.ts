import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/paper-button/paper-button';
import {property} from '@polymer/decorators';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @polymer
 * @customElement
 */
class MultiNotificationItem extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
          overflow: auto;
          position: relative;
          bottom: 15px;
          left: 15px;
          background-color: var(--paper-toast-background-color, #323232);
          color: var(--paper-toast-color, #f1f1f1);
          min-height: 48px;
          min-width: 288px;
          padding: 16px 0 16px 24px;
          box-sizing: border-box;
          box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);
          border-radius: 2px;
          margin: 20px 12px;
          font-size: 14px;
          cursor: default;
          -webkit-transition: -webkit-transform 0.3s, opacity 0.3s;
          transition: transform 0.3s, opacity 0.3s;
          opacity: 0;
          z-index: 1001;
          @apply --paper-font-common-base;
        }
        :host(.notification-open) {
          opacity: 1;
        }
        span {
          float: left;
          line-height: 41px;
        }
        paper-button {
          float: right;
          color: #09f;
        }
      </style>

      <span>{{text}}</span>
      <paper-button on-tap="close">OK</paper-button>
    `;
  }

  @property({type: Boolean, observer: '_openedChanged'})
  opened!: boolean;

  @property({type: String})
  text = '';

  connectedCallback() {
    super.connectedCallback();
    this._initListeners();
  }

  _initListeners() {
    this._onTransitionEnd = this._onTransitionEnd.bind(this);
    this.addEventListener('transitionend', this._onTransitionEnd as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  _removeListeners() {
    this.removeEventListener('transitionend', this._onTransitionEnd as any);
  }

  _onTransitionEnd(e) {
    if (e.propertyName === 'opacity') {
      if (!this.opened) {
        fireEvent(this, 'notification-shift', this.id);
      }
    }
  }

  _renderOpened() {
    requestAnimationFrame(() => {
      this.classList.add('notification-open');
    });
  }

  _renderClosed() {
    requestAnimationFrame(() => {
      this.classList.remove('notification-open');
    });
  }

  _openedChanged(opened) {
    if (opened) {
      this._renderOpened();
    } else {
      this._renderClosed();
    }
  }

  close() {
    this.opened = false;
  }
}
window.customElements.define('multi-notification-item', MultiNotificationItem);
