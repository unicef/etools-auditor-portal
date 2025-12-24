import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

/**
 * @customElement
 * @mixinFunction
 * @appliesMixin EngagementMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('finalize-warning-dialog')
export class FinalizeWarningDialog extends CommonMethodsMixin(LitElement) {
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
        theme="confirmation"
        hide-confirm-btn
        .cancelBtnText="${'OK'}"
        @close="${this._onClose}"
      >
        <div class="container-dialog">
          <div class="layout-horizontal">
            <div class="col-12">${unsafeHTML(this.content)}</div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  private content!: string;

  set dialogData(data: any) {
    const {content}: any = data;
    this.content = content || '';
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
