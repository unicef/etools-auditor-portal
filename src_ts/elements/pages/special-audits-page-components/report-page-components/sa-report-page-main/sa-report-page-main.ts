import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '../../../../../elements/common-elements/engagement-report-components/assign-engagement/assign-engagement';
// eslint-disable-next-line
import {AssignEngagementEl} from '../../../../../elements/common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../../../../../elements/common-elements/engagement-report-components/specific-procedure/specific-procedure';
// eslint-disable-next-line
import {SpecificProcedureEl} from '../../../../../elements/common-elements/engagement-report-components/specific-procedure/specific-procedure';
// eslint-disable-next-line
import '../../../../../elements/pages/special-audits-page-components/report-page-components/other-recommendations/other-recommendations';
// eslint-disable-next-line
import {OtherRecommendationsEl} from '../../../../../elements/pages/special-audits-page-components/report-page-components/other-recommendations/other-recommendations';

class SaReportPageMain extends PolymerElement {
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
        audit-type="Special Audit"
        base-permission-path="{{permissionBase}}"
      >
      </assign-engagement>

      <specific-procedure
        id="specificProcedures"
        class="mb-24"
        error-object="{{errorObject}}"
        data-items="{{engagement.specific_procedures}}"
        base-permission-path="{{permissionBase}}"
      >
      </specific-procedure>

      <other-recommendations
        id="otherRecommendations"
        class="mb-24"
        error-object="{{errorObject}}"
        data-items="{{engagement.other_recommendations}}"
        base-permission-path="{{permissionBase}}"
      >
      </other-recommendations>
    `;
  }

  validate(forSave) {
    const assignTabValid = (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagementEl).validate(
      forSave
    );

    return assignTabValid;
  }

  getAssignVisitData() {
    return (this.$.assignEngagement as AssignEngagementEl).getAssignVisitData();
  }

  getSpecificProceduresData() {
    return (this.$.specificProcedures as SpecificProcedureEl).getTabData();
  }

  getOtherRecommendationsData() {
    return (this.$.otherRecommendations as OtherRecommendationsEl).getTabData();
  }
}

window.customElements.define('sa-report-page-main', SaReportPageMain);
