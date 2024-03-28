import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';

import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';
import {moduleStyles} from '../../styles/module-styles';
import '../share-documents/share-documents';
import DateMixin from '../../mixins/date-mixin';

import EngagementMixin from '../../mixins/engagement-mixin';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {ShareDocuments} from '../share-documents/share-documents';

/**
 * @customElement
 * @LitElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EngagementMixin
 * @appliesMixin DateMixin
 */

@customElement('share-documents-dialog')
export class ShareDocumentsDialog extends CommonMethodsMixin(
  TableElementsMixin(EngagementMixin(DateMixin(LitElement)))
) {
  static get styles() {
    return [moduleStyles, tabInputsStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        no-padding
        keep-dialog-open
        size="lg"
        dialog-title="Share Documents"
        id="share-documents"
        ok-btn-text="Share"
        @confirm-btn-clicked="${this.saveSharedRequest}"
        ?disableConfirmBtn="${this.requestInProcess || !this.shareParams?.attachments?.length}"
        @close="${this._onClose}"
      >
        <share-documents
          id="shareDocuments"
          .partnerName="${this.partnerName}"
          .shareParams="${this.shareParams}"
          .optionsData="${this.optionsData}"
          @share-params-changed="${({detail}) => {
            this.shareParams = detail;
          }}"
        >
        </share-documents>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  opener!: GenericObject;

  @property({type: Object})
  shareParams!: GenericObject;

  @property({type: String})
  partnerName!: string;

  set dialogData(data: any) {
    const {opener, partnerName, optionsData}: any = data;
    this.opener = opener;
    this.partnerName = partnerName;
    this.optionsData = optionsData;
    this.shareParams = [];
  }

  connectedCallback() {
    super.connectedCallback();
    (this.shadowRoot?.querySelector('#shareDocuments') as ShareDocuments)?.updateShareParams();
  }

  saveSharedRequest() {
    this.opener._saveSharedDocsRequest(this.shareParams);
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
