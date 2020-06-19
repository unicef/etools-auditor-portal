import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import {moduleStyles} from '../../styles-elements/module-styles';

/**
 * @polymer
 * @customElement
 */
class SimpleListItem extends PolymerElement {
  static get template() {
    return html`
      ${moduleStyles}
      <style>
        :host {
          display: block;
          overflow: visible;
          border-bottom: 1px solid var(--dark-divider-color, rgba(0, 0, 0, 0.12));
        }
        :host(:hover) {
          paper-material {
            background-color: #eeeeee;
            @apply --hover-style;
          }
        }
        .paper-material {
          display: flex;
          width: 100%;
          height: 48px;
          min-height: 48px;
          font-size: 13px;
          color: var(--gray-dark, rgba(0, 0, 0, 0.87));
          background-color: var(--primary-background-color, #ffffff);
          padding: 0 16px 0 24px;
          box-sizing: border-box;
          @apply --simple-list-item-custom-style;
        }
        iron-icon {
          color: var(--dark-icon-color, rgba(0, 0, 0, 0.54));
        }
        .paper-material ::slotted(*) {
          width: 100%;
          display: flex;
          align-items: center;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .download-icon {
          --iron-icon-width: 25px;
          --iron-icon-height: 25px;
          --iron-icon-fill-color: var(--gray-50);
        }
        .delete-btn {
          color: var(--module-error);
          font-weight: 500;
        }
      </style>
      <div class="paper-material" elevation="0">
        <slot></slot>
      </div>
    `;
  }
}
window.customElements.define('simple-list-item', SimpleListItem);
