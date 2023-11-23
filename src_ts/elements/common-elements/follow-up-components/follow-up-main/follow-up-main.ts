import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {GenericObject} from '../../../../types/global';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-currency-amount-input/etools-currency-amount-input.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/paper-input/paper-textarea.js';
import '../follow-up-actions/follow-up-actions';
import '../follow-up-financial-findings/follow-up-financial-findings';
import {FollowUpFinancialFindings} from '../follow-up-financial-findings/follow-up-financial-findings';
// eslint-disable-next-line
import '../../../pages/spot-checks/report-page-components/summary-findings-element/summary-findings-element';
import '../../../pages/audits/report-page-components/financial-findings/financial-findings';
import assign from 'lodash-es/assign';
import isEmpty from 'lodash-es/isEmpty';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';

/**
 * @LitElement
 * @customElement
 */
@customElement('follow-up-main')
export class FollowUpMain extends LitElement {
  render() {
    return html`
      <style>
        :host {
          position: relative;
          display: block;
        }
      </style>

      <follow-up-actions
        .engagementId="${this.engagement.id}"
        .partnerData="${this.engagement.partner}"
        .optionsData="${this.apOptionsData}"
      >
      </follow-up-actions>

      ${this.showFindings(this.engagement?.engagement_type)
        ? html` <follow-up-financial-findings
            id="followUpFF"
            .engagement="${this.engagement}"
            .originalData="${this.originalData}"
            .errorObject="${this.errorObject}"
            .optionsData="${this.optionsData}"
          >
          </follow-up-financial-findings>`
        : ``}
      ${this._showCard(this.engagement?.engagement_type, 'sc')
        ? html`<summary-findings-element
            id="followUpFindingsHighPriority"
            .dataItems="${this.engagement.findings}"
            .errorObject="${this.errorObject}"
            .originalData="${this.originalData.findings}"
            .priority="${this.priorities.high}"
            .optionsData="${this.apOptionsData}"
          >
          </summary-findings-element>`
        : ``}
      ${this._showCard(this.engagement?.engagement_type, 'audit')
        ? html`<financial-findings
            id="financialFindings"
            class="mb-24"
            .errorObject="${this.errorObject}"
            .dataItems="${this.engagement.financial_finding_set}"
            .optionsData="${this.optionsData}"
          >
          </financial-findings>`
        : ``}
    `;
  }

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  optionsData!: AnyObject;

  @property({type: Object})
  apOptionsData!: AnyObject;

  @property({type: Object})
  errorObject: GenericObject = {};

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
