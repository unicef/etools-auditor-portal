import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from "@polymer/decorators/lib/decorators";
import {GenericObject} from "../../../../../types/global";

import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';

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
          base-permission-path="{{permissionBase}}">
      </assign-engagement>

      <findings-summary
          id="findingsSummary"
          class="mb-24"
          data="{{engagement}}"
          error-object="{{errorObject}}"
          base-permission-path="{{permissionBase}}">
      </findings-summary>

      <financial-findings
          id="financialFindings"
          class="mb-24"
          error-object="{{errorObject}}"
          data-items="{{engagement.financial_finding_set}}"
          base-permission-path="{{permissionBase}}">
      </financial-findings>

      <assessment-of-controls
          id="assessmentOfControls"
          class="mb-24"
          data-items="{{engagement.key_internal_controls}}"
          error-object="{{errorObject}}"
          base-permission-path="{{permissionBase}}">
      </assessment-of-controls>

      <key-internal-controls-weaknesses
          id="keyInternalControlsWeaknesses"
          class="mb-24"
          error-object="{{errorObject}}"
          subject-areas="[[engagement.key_internal_weakness]]"
          base-permission-path="{{permissionBase}}">
      </key-internal-controls-weaknesses>
    `;
  }

  @property({type: Object, notify: true})
  engagement: GenericObject = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: Object})
  permissionBase: GenericObject = {};

  // TODO: polymer 3 migration - is this still used???
  validate(forSave) {
    return this.shadowRoot.querySelector('#assignEngagement')!.validate(forSave);
  }

  getAssignVisitData() {
    return this.$.assignEngagement.getAssignVisitData();
  }

  getFinancialFindingsData() {
    return this.$.financialFindings.getTabData();
  }

  getFindingsSummaryData() {
    return this.$.findingsSummary.getFindingsSummaryData();
  }

  getAssessmentOfControlsData() {
    return this.$.assessmentOfControls.getTabData();
  }

  getKeyInternalWeaknessData() {
    return this.$.keyInternalControlsWeaknesses.getKeyInternalWeaknessData();
  }

}

window.customElements.define('audit-report-page-main', AuditReportPageMain);
