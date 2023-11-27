import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
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
        etools-button {
          text-transform: capitalize;
        }
        etools-icon {
          margin-right: 4px;
        }
      </style>

      <a
        href="https://unicef.service-now.com/cc?id=sc_cat_item&sys_id=c8e43760db622450f65a2aea4b9619ad&sysparm_category=99c51053db0a6f40f65a2aea4b9619af"
        target="_blank"
      >
        <!--    the etools-button fixes the cursor pointer issue when hovering over the icon label    -->
        <etools-button @click="${this.trackAnalytics}" tracker="Support">
          <etools-icon name="communication:textsms"></etools-icon>
          Support
        </etools-button>
      </a>
    `;
  }
}
