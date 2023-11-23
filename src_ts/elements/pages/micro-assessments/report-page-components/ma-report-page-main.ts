import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import EngagementMixin from '../../../mixins/engagement-mixin';
import {GenericObject} from '../../../../types/global';
import '../../../common-elements/engagement-report-components/assign-engagement/assign-engagement';
import './primary-risk-element';
import './key-internal-controls-tab';
import './control-findings-tab';

/**
 * @LitEelement
 * @customElement
 * @appliesMixin EngagementMixinLit
 */
@customElement('ma-report-page-main')
export class MaReportPageMain extends EngagementMixin(LitElement) {
  render() {
    return html`
      <assign-engagement
        id="assignEngagement"
        .data="${this.engagement}"
        .originalData="${this.engagementOptions}"
        .errorObject="${this.errorObject}"
        audit-type="Micro Assessment"
        .optionsData="${this.engagementOptions}"
      >
      </assign-engagement>

      ${this.engagement.overall_risk_assessment
        ? html`<primary-risk-element
            id="primaryRisk"
            .riskData="${this.engagement.overall_risk_assessment}"
            .dialogOpened="${this.riskDialogOpened}"
            .errorObject="${this.errorObject}"
            .optionsData="${this.engagementOptions}"
          >
          </primary-risk-element>`
        : ``}
      ${this.engagement.test_subject_areas
        ? html`<key-internal-controls-tab
            id="internalControls"
            .subjectAreas="${this.engagement.test_subject_areas}"
            .dialogOpened="${this.riskDialogOpened}"
            .errorObject="${this.errorObject}"
            .optionsData="${this.engagementOptions}"
          >
          </key-internal-controls-tab>`
        : ``}

      <control-findings-tab
        id="controlFindings"
        .dataItems="${this.engagement.findings}"
        .errorObject="${this.errorObject}"
        .optionsData="${this.engagementOptions}"
      >
      </control-findings-tab>
    `;
  }

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Boolean})
  riskDialogOpened!: boolean;

  @property({type: Object})
  primaryArea!: GenericObject;

  validate(forSave) {
    const assignTabValid = this.getElement('#assignEngagement').validate(forSave);
    const primaryRiskEl = this.getElement('#primaryRisk');
    const primaryValid = primaryRiskEl ? primaryRiskEl.validate(forSave) : true;
    const internalControlsEl = this.getElement('#internalControls');
    const internalControlsValid = internalControlsEl ? internalControlsEl.validate(forSave) : true;

    return assignTabValid && primaryValid && internalControlsValid;
  }

  getInternalControlsData() {
    const internalControls = this.getElement('#internalControls');
    const data = (internalControls && internalControls.getRiskData()) || [];
    return data.length ? {children: data} : null;
  }

  getPrimaryRiskData() {
    const primaryRisk = this.getElement('#primaryRisk');
    const primaryRiskData = primaryRisk && primaryRisk.getRiskData();
    return primaryRiskData || null;
  }

  getAssignVisitData() {
    return this.getElement('#assignEngagement').getAssignVisitData();
  }

  getFindingsData() {
    return this.getElement('#controlFindings').getTabData();
  }
}
