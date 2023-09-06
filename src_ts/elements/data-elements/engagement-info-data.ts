import {LitElement, PropertyValues, property, customElement} from 'lit-element';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import EngagementMixin from '../mixins/engagement-mixin';
import {
  getActionPointOptions,
  getEngagementAttachmentOptions,
  getEngagementData,
  getEngagementOptions,
  getEngagementReportAttachmentsOptions,
  setEngagementData
} from '../../redux/actions/engagement';
import {store} from '../../redux/store';
import {EngagementState} from '../../redux/reducers/engagement';
import {getValueFromResponse} from '../utils/utils';
import {addAllowedActions} from '../../elements/mixins/permission-controller';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('engagement-info-data')
export class EngagementInfoData extends EngagementMixin(LitElement) {
  @property({type: Number})
  engagementId: number | null = null;

  @property({type: String})
  engagementType!: string;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('engagementId') || changedProperties.has('engagementType')) {
      this.engagementChanged(this.engagementId, this.engagementType);
    }
  }

  engagementChanged(id: number | null, engagementType) {
    if (!id || isNaN(id) || !engagementType) {
      return;
    }
    fireEvent(this, 'global-loading', {message: 'Loading engagement data...', active: true, type: 'engagement-info'});
    Promise.allSettled([
      getEngagementData(id, engagementType),
      getEngagementOptions(id, engagementType),
      getEngagementAttachmentOptions(id),
      getEngagementReportAttachmentsOptions(id),
      getActionPointOptions(id)
    ]).then((response: any[]) => {
      store.dispatch(setEngagementData(this.formatResponse(response)));
      fireEvent(this, 'global-loading', {active: false});
    });
  }

  private formatResponse(response: any[]) {
    const resp: Partial<EngagementState> = {};
    resp.data = getValueFromResponse(response[0]);
    resp.options = addAllowedActions(getValueFromResponse(response[1]) || {});
    resp.attachmentOptions = getValueFromResponse(response[2]) || {};
    resp.reportAttachmentOptions = getValueFromResponse(response[3]) || {};
    resp.apOptions = getValueFromResponse(response[4]) || {};
    return resp;
  }
}
