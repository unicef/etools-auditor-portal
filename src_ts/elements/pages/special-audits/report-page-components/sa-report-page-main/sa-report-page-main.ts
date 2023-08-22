import {LitElement, html,  customElement, property} from 'lit-element';
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
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

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
        @data-changed="${({detail}) => {
          this.engagement = detail;
          fireEvent(this, 'data-changed', this.engagement);
        }}"
        audit-type="Special Audit"
        .basePermissionPath="${this.permissionBase}"
      >
      </assign-engagement>

      <specific-procedure
        id="specificProcedures"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement.specific_procedures}"
        .basePermissionPath="${this.permissionBase}"
      >
      </specific-procedure>

      <other-recommendations
        id="otherRecommendations"
        class="mb-24"
        .errorObject="${this.errorObject}"
        .dataItems="${this.engagement.other_recommendations}"
        .basePermissionPath="${this.permissionBase}"
      >
      </other-recommendations>
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
