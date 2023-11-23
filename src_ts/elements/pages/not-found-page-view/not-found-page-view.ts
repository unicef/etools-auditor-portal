import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import '@polymer/paper-styles/element-styles/paper-material-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {BASE_PATH} from '../../../elements/config/config';

@customElement('not-found-page-view')
export class NotFoundPageView extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        :host {
          display: block;
        }

        a.link {
          color: #40c4ff;
        }

        div[elevation] {
          padding: 15px 20px;
          background-color: var(--light-theme-content-color);
        }
      </style>

      <div id="pageContent">
        <div class="paper-material" elevation="1">
          404 <a href="${BASE_PATH}engagements/list" class="link">Head back home.</a>
        </div>
      </div>
    `;
  }

  openDrawer() {
    fireEvent(this, 'drawer');
  }
}
