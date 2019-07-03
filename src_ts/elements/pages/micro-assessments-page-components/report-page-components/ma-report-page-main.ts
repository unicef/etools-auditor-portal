import {PolymerElement, html} from '@polymer/polymer';
import EngagementMixin from '../../../app-mixins/engagement-mixin';
import {property} from '@polymer/decorators';
import '../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import './primary-risk-element';
import './key-internal-controls-tab';
import './control-findings-tab';

class MaReportPageMain extends EngagementMixin(PolymerElement) {
  static get template() {
    return html`
    <assign-engagement id="assignEngagement" data="{{engagement}}" original-data="[[originalData]]"
      error-object="{{errorObject}}" audit-type="Micro Assessment" base-permission-path="{{permissionBase}}">
    </assign-engagement>

    <template is="dom-if" if="[[engagement.overall_risk_assessment]]" restamp>
      <primary-risk-element id="primaryRisk"
        risk-data="[[engagement.overall_risk_assessment]]"
        dialog-opened="[[riskDialogOpened]]"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}">
      </primary-risk-element>
    </template>

    <template is="dom-if" if="[[engagement.test_subject_areas]]">
      <key-internal-controls-tab id="internalControls"
        subject-areas="[[engagement.test_subject_areas]]"
        dialog-opened="{{riskDialogOpened}}"
        error-object="{{errorObject}}"
        base-permission-path="{{permissionBase}}">
      </key-internal-controls-tab>
    </template>

    <control-findings-tab id="controlFindings"
      data-items="{{engagement.findings}}" error-object="{{errorObject}}"
      base-permission-path="{{permissionBase}}">
    </control-findings-tab>
    `;
  }

  @property({type: Object, notify: true})
  engagement!: object;

  @property({type: Object})
  primaryArea!: object;


  validate(forSave) {
    let assignTabValid = this.getElement('#assignEngagement').validate(forSave);
    let primaryValid = this.getElement('#primaryRisk').validate(forSave);
    let internalControlsValid = this.getElement('#internalControls').validate(forSave);

    return assignTabValid && primaryValid && internalControlsValid;
  }

  getInternalControlsData() {
      let internalControls = this.getElement('#internalControls');
      let data = internalControls && internalControls.getRiskData() || [];
      return data.length ? {children: data} : null;
  }

  getPrimaryRiskData() {
      let primaryRisk = this.getElement('#primaryRisk');
      let primaryRiskData = primaryRisk && primaryRisk.getRiskData();
      return primaryRiskData || null;
  }

  getAssignVisitData() {
      return this.getElement('#assignEngagement').getAssignVisitData();
  }

  getFindingsData() {
      return this.getElement('#controlFindings').getTabData();
  }
}

window.customElements.define('ma-report-page-main', MaReportPageMain)
