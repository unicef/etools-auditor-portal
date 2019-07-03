import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '../../../../../elements/common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../../../../../elements/common-elements/engagement-report-components/specific-procedure/specific-procedure';
import '../../../../../elements/pages/special-audits-page-components/report-page-components/other-recommendations/other-recommendations';


class SaReportPageMain extends (PolymerElement) {
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
              base-permission-path="{{permissionBase}}">
      </assign-engagement>

      <specific-procedure
              id="specificProcedures"
              class="mb-24"
              error-object="{{errorObject}}"
              data-items="{{engagement.specific_procedures}}"
              base-permission-path="{{permissionBase}}">
      </specific-procedure>

      <other-recommendations
              id="otherRecommendations"
              class="mb-24"
              error-object="{{errorObject}}"
              data-items="{{engagement.other_recommendations}}"
              base-permission-path="{{permissionBase}}">
      </other-recommendations>

    `;
  }

  validate(forSave) {
    let assignTabValid = this.shadowRoot!.querySelector('#assignEngagement').validate(forSave);

    return assignTabValid;
  }

  getAssignVisitData() {
    return this.$.assignEngagement.getAssignVisitData();
  }

  getSpecificProceduresData() {
    return this.$.specificProcedures.getTabData();
  }

  getOtherRecommendationsData() {
    return this.$.otherRecommendations.getTabData();
  }

}

window.customElements.define('sa-report-page-main', SaReportPageMain);

