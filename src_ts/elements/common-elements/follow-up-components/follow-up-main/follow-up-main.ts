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
// eslint-disable-next-line
import '../../../../elements/pages/spot-checks-page-components/report-page-components/summary-findings-element/summary-findings-element';
import '../../../../elements/pages/audits-page-components/report-page-components/financial-findings/financial-findings';
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
      <follow-up-actions
        engagement-id="[[engagement.id]]"
        partner-data="[[engagement.partner]]"
        base-engagement-path="{{permissionBase}}"
      >
      </follow-up-actions>

      <template is="dom-if" if="[[showFindings(engagement.engagement_type)]]" restamp>
        <follow-up-financial-findings
          id="followUpFF"
          engagement="[[engagement]]"
          original-data="[[originalData]]"
          error-object="{{errorObject}}"
          base-permission-path="{{permissionBase}}"
        >
        </follow-up-financial-findings>
      </template>

      <template is="dom-if" if="{{_showCard(engagement.engagement_type, 'sc')}}" restamp>
        <summary-findings-element
          id="followUpFindingsHighPriority"
          data-items="{{engagement.findings}}"
          error-object="{{errorObject}}"
          original-data="[[originalData.findings]]"
          priority="{{priorities.high}}"
          base-permission-path="{{permissionBase}}"
        >
        </summary-findings-element>
      </template>

      <template is="dom-if" if="{{_showCard(engagement.engagement_type, 'audit')}}" restamp>
        <financial-findings
          id="financialFindings"
          class="mb-24"
          error-object="{{errorObject}}"
          data-items="{{engagement.financial_finding_set}}"
          base-permission-path="{{permissionBase}}"
        >
        </financial-findings>
      </template>
    `;
  }

  @property({type: Object})
  priorities: GenericObject = {
    low: {
      display_name: 'Low',
      value: 'low'
    },
    high: {
      display_name: 'High',
      value: 'high'
    }
  };

  getFollowUpData() {
    const data = {};
    // Audit Financial Findings
    const followUpFindings = this.shadowRoot!.querySelector('#followUpFF');
    const followUpFindingsData = followUpFindings && (followUpFindings as FollowUpFinancialFindings).getFindingsData();

    if (followUpFindingsData) {
      assign(data, followUpFindingsData);
    }

    return isEmpty(data) ? null : data;
  }

  showFindings(type) {
    return !!type && !~['ma', 'sa'].indexOf(type);
  }

  _showCard(type: any, validType: string) {
    return !!type && validType === type;
  }
}
window.customElements.define('follow-up-main', FollowUpMain);
