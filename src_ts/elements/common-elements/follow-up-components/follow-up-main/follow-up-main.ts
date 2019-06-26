import {PolymerElement, html} from '@polymer/polymer';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-input/paper-textarea.js';
import '../follow-up-actions';
import FollowUpActions from '../follow-up-actions.js';
import assign from 'lodash-es/assign';
import isEmpty from 'lodash-es/isEmpty';

/**
 * @polymer
 * @customElement
 */
class FollowUpMain extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
            position: relative;
            display: block;
        }
      </style>
      <template is="dom-if" if="[[showFindings(engagement.engagement_type)]]" restamp>
            <follow-up-financial-findings
                    id="followUpFF"
                    engagement="[[engagement]]"
                    original-data="[[originalData]]"
                    error-object="{{errorObject}}"
                    base-permission-path="{{permissionBase}}"
            ></follow-up-financial-findings>
        </template>
        <follow-up-actions
                engagement-id="[[engagement.id]]"
                partner-data="[[engagement.partner]]"
                base-engagement-path="{{permissionBase}}">
        </follow-up-actions>
      `;
  }

  getFollowUpData() {
    let data = {},
      //Audit Financial Findings
      followUpFindings = this.shadowRoot!.querySelector('#followUpFF'),
      followUpFindingsData = followUpFindings && (followUpFindings as FollowUpActions).getFindingsData();

    if (followUpFindingsData) {
      assign(data, followUpFindingsData);
    }

    return isEmpty(data) ? null : data;
  }

  showFindings(type) {
    return !!type && !~['ma', 'sa'].indexOf(type);
  }
}
window.customElements.define('follow-up-main', FollowUpMain);
