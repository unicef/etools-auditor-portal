import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {BASE_PATH} from '../../config/config';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';

/**
 * page footer element
 * @LitElement
 * @customElement
 */
@customElement('page-footer')
export class PageFooter extends LitElement {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    // main template
    // language=HTML
    return html`
      <style>
        :host {
          display: flex;
          align-items: flex-end;
          flex: 1 1 0.000000001px;
          padding: 18px 24px;
          width: 100%;
          min-height: 90px;
          box-sizing: border-box;
        }

        #unicef-logo {
          padding-right: 30px;
        }

        #unicef-logo img {
          height: 28px;
          width: 115px;
        }

        .footer-link {
          margin: auto 16px;
          color: var(--secondary-text-color);
          text-decoration: none;
        }

        .footer-link:first-of-type {
          margin-left: 30px;
        }

        @media print {
          :host {
            display: none;
          }
        }
      </style>
      <footer>
        <div id="footer-content" class="layout-horizontal">
          <span id="unicef-logo" class="layout-horizontal layout-inline">
            <img src="${BASE_PATH}assets/images/UNICEF_logo.webp" alt="UNICEF logo" />
          </span>
          <!-- TODO: modify span to a with proper href values after footer pages are ready -->
          <!--   <span class="footer-link">Contact</span>
            <span class="footer-link">Disclaimers</span>
            <span class="footer-link">Privacy Policy</span> -->
        </div>
      </footer>
    `;
  }
}
