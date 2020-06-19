import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import '../overview-element/overview-element';
import '../summary-findings-element/summary-findings-element';
import '../internal-controls/internal-controls';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';

import concat from 'lodash-es/concat';
import isNull from 'lodash-es/isNull';
// eslint-disable-next-line
import {AssignEngagementEl} from '../../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import {SummaryFindingsElement} from '../summary-findings-element/summary-findings-element';
import {InternalControlsElement} from '../internal-controls/internal-controls';
import {OverviewElement} from '../overview-element/overview-element';

/**
 * @polymer
 */
class ScReportPageMain extends PolymerElement {
  static get template() {
    // language=HTML
    return html`
      <assign-engagement
        id="assignEngagement"
        data="{{engagement}}"
        audit-type="Spot Check"
        error-object="{{errorObject}}"
        original-data="[[originalData]]"
        base-permission-path="{{permissionBase}}"
      >
      </assign-engagement>

      <overview-element
        id="overviewEngagement"
        data="{{engagement}}"
        original-data="[[originalData]]"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}"
      >
      </overview-element>

      <summary-findings-element
        id="findingsHighPriority"
        data-items="{{engagement.findings}}"
        error-object="{{errorObject}}"
        original-data="[[originalData.findings]]"
        priority="{{priorities.high}}"
        base-permission-path="{{permissionBase}}"
      >
      </summary-findings-element>

      <summary-findings-element
        id="findingsLowPriority"
        data-items="{{engagement.findings}}"
        error-object="{{errorObject}}"
        original-data="[[originalData.findings]]"
        priority="{{priorities.low}}"
        base-permission-path="{{permissionBase}}"
      >
      </summary-findings-element>

      <internal-controls
        id="internalControls"
        error-object="{{errorObject}}"
        data="{{engagement.internal_controls}}"
        original-data="[[originalData.internal_controls]]"
        base-permission-path="{{permissionBase}}"
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

  @property({type: Object, notify: true})
  engagement: GenericObject = {};

  validate(forSave) {
    const assignTabValid = (this.shadowRoot!.querySelector('#assignEngagement')! as AssignEngagementEl).validate(
      forSave
    );

    return assignTabValid;
  }

  getFindingsData() {
    const findingsLowPriority = (this.$.findingsLowPriority as SummaryFindingsElement).getFindingsData();
    const findingsHighPriority = (this.$.findingsHighPriority as SummaryFindingsElement).getFindingsData();
    const findings = concat(findingsLowPriority || [], findingsHighPriority || []);
    return findings.length ? findings : null;
  }

  getInternalControlsData() {
    const internalControlsData = (this.$.internalControls as InternalControlsElement).getInternalControlsData();
    return !isNull(internalControlsData) ? internalControlsData : null;
  }

  getAssignVisitData() {
    return (this.$.assignEngagement as AssignEngagementEl).getAssignVisitData() || null;
  }

  getOverviewData() {
    return (this.$.overviewEngagement as OverviewElement).getOverviewData() || null;
  }
}

window.customElements.define('sc-report-page-main', ScReportPageMain);
