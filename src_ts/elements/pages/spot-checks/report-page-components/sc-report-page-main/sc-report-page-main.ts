import {LitElement, html, property, customElement} from 'lit-element';
import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../overview-element/overview-element';
import '../summary-findings-element/summary-findings-element';
import '../internal-controls/internal-controls';
import {GenericObject} from '../../../../../types/global';

import concat from 'lodash-es/concat';
import isNull from 'lodash-es/isNull';
// eslint-disable-next-line
import {AssignEngagement} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import {SummaryFindingsElement} from '../summary-findings-element/summary-findings-element';
import {InternalControls} from '../internal-controls/internal-controls';
import {OverviewElement} from '../overview-element/overview-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

/**
 * @LitElement
 */
@customElement('sc-report-page-main')
export class ScReportPageMain extends LitElement {
  render() {
    // language=HTML
    return html`
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

      <overview-element
        id="overviewEngagement"
        .data="${this.engagement}"
        @data-changed="${({detail}) => {
          this.engagement = detail;
          fireEvent(this, 'data-changed', this.engagement);
        }}"
        .originalData="${this.originalData}"
        .errorObject="${this.errorObject}"
        .basePermissionPath="${this.permissionBase}"
      >
      </overview-element>

      <summary-findings-element
        id="findingsHighPriority"
        .dataItems="${this.engagement.findings}"
        .errorObject="${this.errorObject}"
        .originalData="${this.originalData.findings}"
        .priority="${this.priorities.high}"
        .basePermissionPath="${this.permissionBase}"
      >
      </summary-findings-element>

      <summary-findings-element
        id="findingsLowPriority"
        .dataItems="${this.engagement.findings}"
        .errorObject="${this.errorObject}"
        .originalData="${this.originalData.findings}"
        .priority="${this.priorities.low}"
        .basePermissionPath="${this.permissionBase}"
      >
      </summary-findings-element>

      <internal-controls
        id="internalControls"
        .errorObject="${this.errorObject}"
        .data="${this.engagement.internal_controls}"
        .originalData="${this.originalData?.internal_controls}"
        .basePermissionPath="${this.permissionBase}"
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
  originalData: GenericObject = {};

  @property({type: Object})
  errorObject: GenericObject = {};

  @property({type: String})
  permissionBase!: string;

  validate(forSave) {
    const assignTabValid = (this.shadowRoot!.querySelector('#assignEngagement')! as AssignEngagement).validate(forSave);

    return assignTabValid;
  }

  getFindingsData() {
    const findingsLowPriority = (
      this.shadowRoot!.querySelector('#findingsLowPriority') as SummaryFindingsElement
    ).getFindingsData();
    const findingsHighPriority = (
      this.shadowRoot!.querySelector('#findingsHighPriority') as SummaryFindingsElement
    ).getFindingsData();
    const findings = concat(findingsLowPriority || [], findingsHighPriority || []);
    return findings.length ? findings : null;
  }

  getInternalControlsData() {
    const internalControlsData = (
      this.shadowRoot!.querySelector('#internalControls') as InternalControls
    ).getInternalControlsData();
    return !isNull(internalControlsData) ? internalControlsData : null;
  }

  getAssignVisitData() {
    return (this.shadowRoot!.querySelector('#assignEngagement') as AssignEngagement).getAssignVisitData() || null;
  }

  getOverviewData() {
    return (this.shadowRoot!.querySelector('#overviewEngagement') as OverviewElement).getOverviewData() || null;
  }
}
