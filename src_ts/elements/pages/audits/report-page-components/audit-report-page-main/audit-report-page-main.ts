import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {GenericObject} from '../../../../../types/global';

import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../../../../common-elements/engagement-report-components/send-back-comment/send-back-comment';
// eslint-disable-next-line
import {AssignEngagement} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../findings-summary/findings-summary';
import {FindingsSummary} from '../findings-summary/findings-summary';
import '../financial-findings/financial-findings';
import {FinancialFindings} from '../financial-findings/financial-findings';
import '../assessment-of-controls/assessment-of-controls';
import {AssessmentOfControls} from '../assessment-of-controls/assessment-of-controls';
import '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';
import {KeyInternalControlsWeaknesses} from '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';
import {AnyObject} from '@unicef-polymer/etools-types';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

/**
 * @LitEelement
 * @customElement
 */
@customElement('audit-report-page-main')
export class AuditReportPageMain extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        .mb-24 {
          margin-bottom: 24px;
        }
      </style>

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

      <findings-summary
        id="findingsSummary"
        class="mb-24"
        .data="${this.engagement}"
        .errorObject="${this.errorObject}"
        .optionsData="${this.optionsData}"
      >
      </findings-summary>

      <financial-findings
        id="financialFindings"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement?.financial_finding_set}"
        .exchangeRate="${this.engagement?.exchange_rate}"
        .priorFaceForms="${this.engagement?.prior_face_forms}"
        .optionsData="${this.optionsData}"
      >
      </financial-findings>

      <assessment-of-controls
        id="assessmentOfControls"
        class="mb-24"
        .dataItems="${this.engagement?.key_internal_controls}"
        .errorObject="${this.errorObject}"
        .optionsData="${this.optionsData}"
      >
      </assessment-of-controls>

      <key-internal-controls-weaknesses
        id="keyInternalControlsWeaknesses"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .subjectAreas="${this.engagement?.key_internal_weakness}"
        .optionsData="${this.optionsData}"
      >
      </key-internal-controls-weaknesses>
    `;
  }

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: Object})
  optionsData!: AnyObject;

  @property({type: Boolean})
  showSendBackComments = false;

  validate(forSave) {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).validate(forSave);
  }

  getAssignVisitData() {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).getAssignVisitData();
  }

  getFinancialFindingsData() {
    return (this.shadowRoot!.querySelector('#financialFindings') as FinancialFindings).getTabData();
  }

  getFindingsSummaryData() {
    return (this.shadowRoot!.querySelector('#findingsSummary') as FindingsSummary).getFindingsSummaryData();
  }

  getAssessmentOfControlsData() {
    return (this.shadowRoot!.querySelector('#assessmentOfControls') as AssessmentOfControls).getTabData();
  }

  getKeyInternalWeaknessData() {
    return (
      this.shadowRoot!.querySelector('#keyInternalControlsWeaknesses') as KeyInternalControlsWeaknesses
    ).getKeyInternalWeaknessData();
  }
}
