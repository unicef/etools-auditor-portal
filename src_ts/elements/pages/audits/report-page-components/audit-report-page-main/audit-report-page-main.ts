import {LitElement, html, property, customElement} from 'lit-element';
import {GenericObject} from '../../../../../types/global';

import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
// eslint-disable-next-line
import {AssignEngagement} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../findings-summary/fundings-summary';
import {FindingsSummary} from '../findings-summary/fundings-summary';
import '../financial-findings/financial-findings';
import {FinancialFindings} from '../financial-findings/financial-findings';
import '../assessment-of-controls/assessment-of-controls';
import {AssessmentOfControls} from '../assessment-of-controls/assessment-of-controls';
import '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';
import {KeyInternalControlsWeaknesses} from '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitEelement
 * @customElement
 */
@customElement('audit-report-page-main')
export class AuditReportPageMain extends LitElement {
  render() {
    // language=HTML
    return html`
      <style>
        .mb-24 {
          margin-bottom: 24px;
        }
      </style>

      <assign-engagement
        id="assignEngagement"
        .data="${this.engagement}"
        .originalData="${this.originalData}"
        .errorObject="${this.errorObject}"
        @data-changed="${({detail}) => {
          this.engagement = detail;
          fireEvent(this, 'data-changed', this.engagement);
        }}"
        audit-type="Audit"
        .basePermissionPath="${this.permissionBase}"
      >
      </assign-engagement>

      <findings-summary
        id="findingsSummary"
        class="mb-24"
        .data="${this.engagement}"
        .errorObject="${this.errorObject}"
        .basePermissionPath="${this.permissionBase}"
      >
      </findings-summary>

      <financial-findings
        id="financialFindings"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement?.financial_finding_set}"
        .basePermissionPath="${this.permissionBase}"
      >
      </financial-findings>

      <assessment-of-controls
        id="assessmentOfControls"
        class="mb-24"
        .dataItems="${this.engagement?.key_internal_controls}"
        .errorObject="${this.errorObject}"
        .basePermissionPath="${this.permissionBase}"
      >
      </assessment-of-controls>

      <key-internal-controls-weaknesses
        id="keyInternalControlsWeaknesses"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .subjectAreas="${this.engagement?.key_internal_weakness}"
        .basePermissionPath="${this.permissionBase}"
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

  @property({type: String})
  permissionBase!: string;

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
