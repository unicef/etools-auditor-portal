import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/app-route/app-route';
import '@polymer/app-route/app-location';
// app-layout
// lodash
import '@polymer/paper-tabs/paper-tabs';
import '@polymer/iron-pages/iron-pages';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import './../app-main-header/page-header.js';
import '../../../common-elements/pages-header-element/pages-header-element';
import '../../../common-elements/file-attachments-tab/file-attachments-tab';
import '../../../common-elements/status-tab-element/status-tab-element';
import '../../../common-elements/engagement-overview-components/engagement-staff-members-tab/engagement-staff-members-tab';
import '../../../common-elements/engagement-overview-components/engagement-info-details/engagement-info-details';
import '../../../data-elements/update-engagement';


import { sharedStyles } from "../../../styles-elements/shared-styles";
import { moduleStyles } from "../../../styles-elements/module-styles";
import { mainPageStyles } from "../../../styles-elements/main-page-styles";
import { tabInputsStyles } from '../../../styles-elements/tab-inputs-styles';



class SpotChecksPageMain extends (PolymerElement) {

  static get template() {
    // language=HTML
    return html`
        ${sharedStyles} ${moduleStyles} ${mainPageStyles} ${tabInputsStyles}
      <style>
        .repeatable-item-container {
          margin-bottom: 0 !important;
        }
      </style>
    
    `;
  }

}

window.customElements.define('spot-checks-page-main', SpotChecksPageMain);
