import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';

import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
// eslint-disable-next-line
import {AssignEngagementEl} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../findings-summary/fundings-summary';
import {FindingsSummaryEl} from '../findings-summary/fundings-summary';
import '../financial-findings/financial-findings';
import {FinancialFindingsEl} from '../financial-findings/financial-findings';
import '../assessment-of-controls/assessment-of-controls';
import {AssessmentOfControlsEl} from '../assessment-of-controls/assessment-of-controls';
import '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';
import {KeyInternalControlsWeaknessesEl} from '../key-internal-controls-weaknesses/key-internal-controls-weaknesses';

/**
 * @customElement
 * @polymer
 */
class AuditReportPageMain extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <style>
        .mb-24 {
          margin-bottom: 24px;
        }
      </style>

      <assign-engagement
        id="assignEngagement"
        original-data="[[originalData]]"
        class="mb-24"
        error-object="{{errorObject}}"
        data="{{engagement}}"
        audit-type="Audit"
        base-permission-path="{{permissionBase}}"
      >
      </assign-engagement>

      <findings-summary
        id="findingsSummary"
        class="mb-24"
        data="{{engagement}}"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}"
      >
      </findings-summary>

      <financial-findings
        id="financialFindings"
        class="mb-24"
        error-object="{{errorObject}}"
        data-items="{{engagement.financial_finding_set}}"
        base-permission-path="{{permissionBase}}"
      >
      </financial-findings>

      <assessment-of-controls
        id="assessmentOfControls"
        class="mb-24"
        data-items="{{engagement.key_internal_controls}}"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}"
      >
      </assessment-of-controls>

      <key-internal-controls-weaknesses
        id="keyInternalControlsWeaknesses"
        class="mb-24"
        error-object="{{errorObject}}"
        subject-areas="[[engagement.key_internal_weakness]]"
        base-permission-path="{{permissionBase}}"
      >
      </key-internal-controls-weaknesses>
    `;
  }

  @property({type: Object, notify: true})
  engagement: GenericObject = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: String})
  permissionBase!: string;

  validate(forSave) {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagementEl).validate(forSave);
  }

  getAssignVisitData() {
    return (this.$.assignEngagement as AssignEngagementEl).getAssignVisitData();
  }

  getFinancialFindingsData() {
    return (this.$.financialFindings as FinancialFindingsEl).getTabData();
  }

  getFindingsSummaryData() {
    return (this.$.findingsSummary as FindingsSummaryEl).getFindingsSummaryData();
  }

  getAssessmentOfControlsData() {
    return (this.$.assessmentOfControls as AssessmentOfControlsEl).getTabData();
  }

  getKeyInternalWeaknessData() {
    return (this.$.keyInternalControlsWeaknesses as KeyInternalControlsWeaknessesEl).getKeyInternalWeaknessData();
  }
}

window.customElements.define('audit-report-page-main', AuditReportPageMain);
