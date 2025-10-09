import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {GenericObject} from '../../../../types/global';

import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-currency';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '../follow-up-actions/follow-up-actions';
import '../follow-up-financial-findings/follow-up-financial-findings';
import {FollowUpFinancialFindings} from '../follow-up-financial-findings/follow-up-financial-findings';

import '../../../pages/spot-checks/report-page-components/summary-findings-element/summary-findings-element';
import '../../../pages/audits/report-page-components/financial-findings/financial-findings';
import assign from 'lodash-es/assign';
import isEmpty from 'lodash-es/isEmpty';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

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
        @ap-loaded="${({detail}: CustomEvent) => {
          fireEvent(this, 'ap-loaded', {data: detail.data || []});
        }}"
        ;
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
            .dataItems="${this.getFindingsDataFiltered(this.engagement.findings, this.priorities.high.value)}"
            .errorObject="${this.errorObject}"
            .originalData="${this.getFindingsDataFiltered(this.originalData.findings, this.priorities.high.value)}"
            .priority="${this.priorities.high}"
            .optionsData="${this.optionsData}"
          >
          </summary-findings-element>`
        : ``}
      ${this._showCard(this.engagement?.engagement_type, 'audit')
        ? html`<financial-findings
            id="financialFindings"
            class="mb-24"
            .errorObject="${this.errorObject}"
            .dataItems="${this.engagement?.financial_finding_set}"
            .exchangeRate="${this.engagement?.exchange_rate}"
            .priorFaceForms="${this.engagement?.prior_face_forms}"
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

  getFindingsDataFiltered(findings: any[], priority: string) {
    return (findings || []).filter((item) => item.priority === priority);
  }

  _showCard(type: any, validType: string) {
    return !!type && validType === type;
  }
}
