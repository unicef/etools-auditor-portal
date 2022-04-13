import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/iron-icons/communication-icons';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/* eslint-disable max-len */

/**
 * @polymer
 * @customElement
 */
class SupportBtn extends MatomoMixin(PolymerElement) {
  static get is() {
    return 'support-btn';
  }

  static get template() {
    return html`
      <style>
        a,
        a:hover {
          color: inherit;
          text-decoration: none;
          font-size: 16px;
          cursor: pointer;
        }
        paper-button {
          text-transform: capitalize;
        }
        iron-icon {
          margin-right: 4px;
        }
      </style>

      <a
        href="https://unicef.service-now.com/cc?id=sc_cat_item&sys_id=c8e43760db622450f65a2aea4b9619ad&sysparm_category=99c51053db0a6f40f65a2aea4b9619af"
        target="_blank"
      >
        <!--    the paper-button fixes the cursor pointer issue when hovering over the icon label    -->
        <paper-button on-tap="trackAnalytics" tracker="Support">
          <iron-icon icon="communication:textsms"></iron-icon>
          Support
        </paper-button>
      </a>
    `;
  }
}

window.customElements.define('support-btn', SupportBtn);
