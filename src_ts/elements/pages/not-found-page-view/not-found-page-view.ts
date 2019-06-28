import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {fireEvent} from "../../utils/fire-custom-event";
import '@polymer/paper-styles/element-styles/paper-material-styles';
import {sharedStyles} from '../../styles-elements/shared-styles';


class NotFoundPageView extends (PolymerElement) {

  static get template() {
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
            404 <a href$="[[getLink()]]" class="link">Head back home.</a>
        </div>
      </div>
    `;

    // behaviors: [
    //   etoolsAppConfig.globals
    // ]

  }

  getLink() {
    return this.getAbsolutePath('engagements/list');
  }

  openDrawer() {
    fireEvent(this, 'drawer');
  }


}

window.customElements.define('not-found-page-view', NotFoundPageView);
