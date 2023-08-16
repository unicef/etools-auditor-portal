import {LitElement, html, property, customElement} from 'lit-element';
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
        .originalData="${this.originalData}"
        .errorObject="${this.errorObject}"
        @data-changed="${({detail}) => (this.engagement = detail)}"
        audit-type="Micro Assessment"
        .basePermissionPath="${this.permissionBase}"
      >
      </assign-engagement>

      ${this.engagement.overall_risk_assessment
        ? html`<primary-risk-element
            id="primaryRisk"
            .riskData="${this.engagement.overall_risk_assessment}"
            .dialogOpened="${this.riskDialogOpened}"
            .errorObject="${this.errorObject}"
            .basePermissionPath="${this.permissionBase}"
          >
          </primary-risk-element>`
        : ``}
      ${this.engagement.test_subject_areas
        ? html`<key-internal-controls-tab
            id="internalControls"
            .subjectAreas="${this.engagement.test_subject_areas}"
            .dialogOpened="${this.riskDialogOpened}"
            .errorObject="${this.errorObject}"
            .basePermissionPath="${this.permissionBase}"
          >
          </key-internal-controls-tab>`
        : ``}

      <control-findings-tab
        id="controlFindings"
        .dataItems="${this.engagement.findings}"
        .errorObject="${this.errorObject}"
        .basePermissionPath="${this.permissionBase}"
        @data-changed="${({detail}) => (this.engagement = {...this.engagement, findings: detail})}"
      >
      </control-findings-tab>
    `;
  }

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Boolean})
  riskDialogOpened!: boolean;

  @property({type: Object})
  primaryArea!: GenericObject;

  validate(forSave) {
    const assignTabValid = this.getElement('#assignEngagement').validate(forSave);
    const primaryValid = this.getElement('#primaryRisk').validate(forSave);
    const internalControlsValid = this.getElement('#internalControls').validate(forSave);

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
