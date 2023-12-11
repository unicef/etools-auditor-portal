import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
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
    return [moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        dialog-title="Cancellation of Engagement"
        ok-btn-text="Continue"
        @confirm-btn-clicked="${this._cancelEngagement}"
        @close="${this._onClose}"
      >
        <div class="container">
          <div class="layout-horizontal">
            <div class="col-12">
              <etools-textarea
                id="cancellationReasonInput"
                class="required"
                label="Cancellation Reason"
                placeholder="Enter reason of cancellation"
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

  _cancelEngagement() {
    const input = this.shadowRoot?.querySelector('#cancellationReasonInput') as EtoolsTextarea;
    if (!input || !input.validate()) {
      return;
    }
    fireEvent(this, 'dialog-closed', {confirmed: true, response: input.value});
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
