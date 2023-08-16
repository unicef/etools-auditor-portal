import {LitElement, html, customElement} from 'lit-element';
import '@polymer/iron-icons/communication-icons';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/**
 * @polymer
 * @customElement
 */
@customElement('support-btn')
export class SupportBtn extends MatomoMixin(LitElement) {
  render() {
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
        <paper-button @tap="${this.trackAnalytics}" tracker="Support">
          <iron-icon icon="communication:textsms"></iron-icon>
          Support
        </paper-button>
      </a>
    `;
  }
}
