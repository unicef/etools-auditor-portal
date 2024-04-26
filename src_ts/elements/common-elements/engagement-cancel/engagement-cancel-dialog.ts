import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsTextarea} from '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('engagement-cancel-dialog')
export class EngagementCancelDialog extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        dialog-title="${this.dialogTitle}"
        ok-btn-text="Continue"
        @confirm-btn-clicked="${this._cancelOrSendBackEngagement}"
        @close="${this._onClose}"
      >
        <div class="container-dialog">
          <div class="layout-horizontal">
            <div class="col-12">
              <etools-textarea
                id="reasonInput"
                class="required"
                .value="${this.reasonText}"
                label="${this.inputLabel}"
                placeholder="${this.inputPlaceholder}"
                required
                max-rows="4"
                error-message="This field is required."
                @focus="${this._resetFieldError}"
              >
              </etools-textarea>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private dialogTitle!: string;
  private inputLabel!: string;
  private inputPlaceholder!: string;
  private reasonText!: string;

  set dialogData(data: any) {
    const {action, reasonText}: any = data;
    const isCancelAction = action === 'cancel';
    this.dialogTitle = isCancelAction ? 'Cancellation of Engagement' : 'Send Back Engagement';
    this.inputLabel = isCancelAction ? 'Cancellation Reason' : 'Send Back Reason';
    this.inputPlaceholder = isCancelAction ? 'Enter reason of cancellation' : 'Enter reason of send back';
    this.reasonText = reasonText || '';
  }

  _cancelOrSendBackEngagement() {
    const input = this.shadowRoot?.querySelector('#reasonInput') as EtoolsTextarea;
    if (!input || !input.validate() || !input.value?.trim()) {
      input.invalid = true;
      return;
    }
    this.requestInProcess = true;
    fireEvent(this, 'dialog-closed', {confirmed: true, response: input.value});
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
