import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../../../../common-elements/engagement-report-components/send-back-comment/send-back-comment';
import '../findings-summary-sc/findings-summary-sc';
import '../summary-findings-element/summary-findings-element';
import '../internal-controls/internal-controls';
import {GenericObject} from '../../../../../types/global';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import concat from 'lodash-es/concat';
import isNull from 'lodash-es/isNull';
// eslint-disable-next-line
import {AssignEngagement} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import {SummaryFindingsElement} from '../summary-findings-element/summary-findings-element';
import {InternalControls} from '../internal-controls/internal-controls';
import {FindingsSummarySC} from '../findings-summary-sc/findings-summary-sc';
import {FinancialFindings} from '../../../audits/report-page-components/financial-findings/financial-findings';

/**
 * @LitElement
 */
@customElement('sc-report-page-main')
export class ScReportPageMain extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <send-back-comments
        ?hidden="${!this.showSendBackComments}"
        .comments="${this.engagement.send_back_comment}"
      ></send-back-comments>

      <assign-engagement
        id="assignEngagement"
        .data="${this.engagement}"
        .originalData="${this.originalData}"
        .errorObject="${this.errorObject}"
        audit-type="Audit"
        .optionsData="${this.optionsData}"
      >
      </assign-engagement>

      <findings-summary-sc
        id="findingsSummarySc"
        .data="${this.engagement}"
        .originalData="${this.originalData}"
        .errorObject="${this.errorObject}"
        .optionsData="${this.optionsData}"
      >
      </findings-summary-sc>

      <financial-findings
        id="financialFindings"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement?.financial_finding_set}"
        .exchangeRate="${this.engagement?.exchange_rate}"
        .priorFaceForms="${this.engagement?.prior_face_forms}"
        .optionsData="${this.optionsData}"
        is-staff-sc
      >
      </financial-findings>

      <summary-findings-element
        id="findingsHighPriority"
        .dataItems="${this.getFindingsDataFiltered(this.engagement.findings, this.priorities.high.value)}"
        .errorObject="${this.errorObject}"
        .originalData="${this.getFindingsDataFiltered(this.originalData.findings, this.priorities.high.value)}"
        .priority="${this.priorities.high}"
        .optionsData="${this.optionsData}"
      >
      </summary-findings-element>

      <summary-findings-element
        id="findingsLowPriority"
        .dataItems="${this.getFindingsDataFiltered(this.engagement.findings, this.priorities.low.value)}"
        .errorObject="${this.errorObject}"
        .originalData="${this.getFindingsDataFiltered(this.originalData.findings, this.priorities.low.value)}"
        .priority="${this.priorities.low}"
        .optionsData="${this.optionsData}"
      >
      </summary-findings-element>

      <internal-controls
        id="internalControls"
        .errorObject="${this.errorObject}"
        .data="${this.engagement.internal_controls}"
        .originalData="${this.originalData?.internal_controls}"
        .optionsData="${this.optionsData}"
      >
      </internal-controls>
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

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Object})
  optionsData: GenericObject = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: Boolean})
  showSendBackComments = false;

  validate(forSave) {
    const assignTabValid = (this.shadowRoot!.querySelector('#assignEngagement')! as AssignEngagement).validate(forSave);

    return assignTabValid;
  }

  getFindingsData() {
    const findingsLowPriority = (
      this.shadowRoot!.querySelector('#findingsLowPriority') as SummaryFindingsElement
    )?.getFindingsData();
    const findingsHighPriority = (
      this.shadowRoot!.querySelector('#findingsHighPriority') as SummaryFindingsElement
    )?.getFindingsData();
    const findings = concat(findingsLowPriority || [], findingsHighPriority || []);
    return findings.length ? findings : null;
  }

  getFinancialFindingsData() {
    return (this.shadowRoot!.querySelector('#financialFindings') as FinancialFindings).getTabData();
  }

  getInternalControlsData() {
    const internalControlsData = (
      this.shadowRoot!.querySelector('#internalControls') as InternalControls
    ).getInternalControlsData();
    return !isNull(internalControlsData) ? internalControlsData : null;
  }

  getFindingsDataFiltered(findings: any[], priority: string) {
    return (findings || []).filter((item) => item.priority === priority);
  }

  getAssignVisitData() {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).getAssignVisitData() || null;
  }

  getFindingsSummarySCData() {
    return (
      (this.shadowRoot!.querySelector('#findingsSummarySc') as FindingsSummarySC).getFindingsSummarySCData() || null
    );
  }
}
