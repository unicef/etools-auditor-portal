import {LitElement, html, customElement, property} from 'lit-element';
import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
// eslint-disable-next-line
import {AssignEngagement} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../../../../common-elements/engagement-report-components/specific-procedure/specific-procedure';
// eslint-disable-next-line
import {SpecificProcedure} from '../../../../common-elements/engagement-report-components/specific-procedure/specific-procedure';
// eslint-disable-next-line
import '../other-recommendations/other-recommendations';
// eslint-disable-next-line
import {OtherRecommendations} from '../other-recommendations/other-recommendations';
import {GenericObject} from '@unicef-polymer/etools-types';

@customElement('sa-report-page-main')
export class SaReportPageMain extends LitElement {
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
        audit-type="Special Audit"
        .optionsData="${this.optionsData}"
      >
      </assign-engagement>

      <specific-procedure
        id="specificProcedures"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement.specific_procedures}"
        .optionsData="${this.optionsData}"
      >
      </specific-procedure>

      <other-recommendations
        id="otherRecommendations"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement.other_recommendations}"
        .optionsData="${this.optionsData}"
      >
      </other-recommendations>
    `;
  }

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Object})
  optionsData: GenericObject = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: String})
  permissionBase!: string;

  validate(forSave) {
    const assignTabValid = (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).validate(forSave);

    return assignTabValid;
  }

  getAssignVisitData() {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).getAssignVisitData();
  }

  getSpecificProceduresData() {
    return (this.shadowRoot!.querySelector('#specificProcedures') as SpecificProcedure).getTabData();
  }

  getOtherRecommendationsData() {
    return (this.shadowRoot!.querySelector('#otherRecommendations') as OtherRecommendations).getTabData();
  }
}
