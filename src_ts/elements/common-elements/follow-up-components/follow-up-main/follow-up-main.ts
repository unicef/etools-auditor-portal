import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../types/global';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-input/paper-textarea.js';
import '../follow-up-actions/follow-up-actions';
import '../follow-up-financial-findings/follow-up-financial-findings';
import FollowUpFinancialFindings from '../follow-up-financial-findings/follow-up-financial-findings';
import assign from 'lodash-es/assign';
import isEmpty from 'lodash-es/isEmpty';
import {SummaryFindingsElement} from '../../../pages/spot-checks-page-components/report-page-components/summary-findings-element/summary-findings-element';

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
      <follow-up-actions
            engagement-id="[[engagement.id]]"
            partner-data="[[engagement.partner]]"
            base-engagement-path="{{permissionBase}}">
      </follow-up-actions>

      <template is="dom-if" if="[[showFindings(engagement.engagement_type)]]" restamp>
            <follow-up-financial-findings
                  id="followUpFF"
                  engagement="[[engagement]]"
                  original-data="[[originalData]]"
                  error-object="{{errorObject}}"
                  base-permission-path="{{permissionBase}}">
            </follow-up-financial-findings>
      </template>

      <summary-findings-element
            id="findingsHighPriority"
            data-items="{{engagement.findings}}"
            error-object="{{errorObject}}"
            original-data="[[originalData.findings]]"
            priority="{{priority}}"
            base-permission-path="{{permissionBase}}">
      </summary-findings-element>
      `;
  }

  @property({type: Object})
  priority: GenericObject = {
    high: {
      display_name: 'High',
      value: 'high'
    }
  };

  getFollowUpData() {
    let data = {};
    // Audit Financial Findings
    let followUpFindings = this.shadowRoot!.querySelector('#followUpFF');
    const followUpFindingsData = followUpFindings && (followUpFindings as FollowUpFinancialFindings).getFindingsData();
    // Findings High Priority
    // let findingsHighPriority = this.shadowRoot!.querySelector('#findingsHighPriority');
    // const findingsHighPriorityData = findingsHighPriority && (findingsHighPriority as SummaryFindingsElement).getFindingsData();

    if (followUpFindingsData) {
      assign(data, followUpFindingsData);
    }
    // if (findingsHighPriorityData) {
    //   assign(data, findingsHighPriorityData);
    // }

    return isEmpty(data) ? null : data;
  }

  showFindings(type) {
    if (typeof type === 'object' && type && type.hasOwnProperty('value')) {
      type = type.value;
    }
    return !!type && !~['ma', 'sa'].indexOf(type);
  }
}
window.customElements.define('follow-up-main', FollowUpMain);
