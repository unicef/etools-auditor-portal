import {LitElement, html, CSSResult, css} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';

/**
 * @polymer
 * @customElement
 */
@customElement('support-btn')
export class SupportBtn extends MatomoMixin(LitElement) {
  static get styles(): CSSResult {
    // language=CSS
    return css`
      :host(:hover) {
        cursor: pointer;
      }

      a {
        color: var(--light-secondary-text-color);
        text-decoration: none;
        font-size: var(--etools-font-size-16, 16px);
      }

      etools-icon {
        margin-right: 4px;
        color: var(--light-secondary-text-color);
      }

      @media (max-width: 650px) {
        .support-text {
          display: none;
        }
      }
    `;
  }
  render() {
    return html`
      <a
        href="https://unicef.service-now.com/cc?id=sc_cat_item&sys_id=c8e43760db622450f65a2aea4b9619ad&sysparm_category=99c51053db0a6f40f65a2aea4b9619af"
        target="_blank"
      >
        <etools-icon name="communication:textsms"></etools-icon>
      </a>
    `;
  }
}
