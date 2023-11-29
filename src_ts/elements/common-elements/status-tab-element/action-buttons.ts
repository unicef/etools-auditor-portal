import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button-group';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import {moduleStyles} from '../../styles/module-styles';
import {ActionButtonsStyles} from './action-buttons-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isEqual from 'lodash-es/isEqual';
import {createDynamicDialog, removeDialog} from '@unicef-polymer/etools-unicef/src/etools-dialog/dynamic-dialog';
import EtoolsDialog from '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('action-buttons')
export class ActionButtons extends LitElement {
  static get styles() {
    return [moduleStyles];
  }

  render() {
    return html`
      ${ActionButtonsStyles}
      <etools-button-group>
        <etools-button id="primary" variant="primary" @click="${this._handlePrimaryClick}">
          ${this._setButtonText(this.actions[0])}
        </etools-button>
        ${this._showOtherActions(this.actions.length)
          ? html`<sl-dropdown
              id="splitBtn"
              placement="bottom-end"
              @click="${(event: MouseEvent) => event.stopImmediatePropagation()}"
            >
              <etools-button slot="trigger" variant="primary" caret></etools-button>
              <sl-menu>
                ${(this.actions || [])
                  .filter((x) => this._filterActions(x))
                  .map(
                    (item: any) => html`<sl-menu-item @click="${() => this._handleSecondaryClick(item)}">
                      <etools-icon name="${this._setIcon(item, this.icons)}" class="option-icon"></etools-icon>
                      <span>${this._setButtonText(item)}</span>
                    </sl-menu-item>`
                  )}
              </sl-menu>
            </sl-dropdown>`
          : ``}
      </etools-button-group>
    `;
  }

  @property({type: Array})
  actions: any[] = [];

  @property({type: Object})
  icons = {
    cancel: 'cancel',
    save: 'save',
    submit: 'assignment-turned-in',
    finalize: 'assignment-turned-in',
    create: 'assignment-turned-in'
  };

  @property({type: Boolean})
  statusBtnMenuOpened!: boolean;

  @property({type: Object})
  submitConfirmationDialog!: EtoolsDialog;

  connectedCallback() {
    super.connectedCallback();
    this.createSubmitConfirmationDialog();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    removeDialog(this.submitConfirmationDialog);
  }

  createSubmitConfirmationDialog() {
    const dialogContent = document.createElement('span');
    dialogContent.innerText = `Are you sure you want to submit the final report to the UNICEF Audit Focal Point?
                               You will not be able to make any further changes to the report.`;
    const dialogConfig = {
      title: 'Submit',
      size: 'md',
      okBtnText: 'Yes',
      cancelBtnText: 'No',
      closeCallback: this.submitConfirmationClosed.bind(this),
      content: dialogContent
    };

    this.submitConfirmationDialog = createDynamicDialog(dialogConfig);
  }

  closeMenu() {
    this.statusBtnMenuOpened = false;
    this.requestUpdate();
  }

  _setButtonText(item) {
    if (!item) {
      return '';
    }
    const text = item.display_name || item.replace('_', ' ');

    if (!text) {
      throw new Error('Can not get button text!');
    }

    return text.toUpperCase();
  }

  _handlePrimaryClick() {
    const action = this.actions[0].code || this.actions[0];
    if (action === 'submit') {
      this.showSubmitConfirmation();
    } else {
      this.fireActionActivated(action);
    }
  }

  _handleSecondaryClick(item: any) {
    const action = item.code;
    if (action) {
      if (action === 'submit') {
        this.showSubmitConfirmation();
      } else {
        this.fireActionActivated(action);
      }
    }
  }

  submitConfirmationClosed(event: CustomEvent) {
    if (event.detail.confirmed) {
      this.fireActionActivated('submit');
    }
  }

  fireActionActivated(action: string) {
    fireEvent(this, `close-toasts`);
    fireEvent(this, `action-activated`, {type: action});
  }

  showSubmitConfirmation() {
    this.submitConfirmationDialog.opened = true;
  }

  _showOtherActions(length) {
    return length > 1;
  }

  withActionsMenu(length) {
    return length > 1 ? 'with-menu' : '';
  }

  _filterActions(action) {
    return !isEqual(action, this.actions[0]);
  }

  _setIcon(item, icons) {
    if (!icons || !item) {
      return '';
    }
    return icons[item.code || item] || '';
  }
}
