import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-icon-button/paper-icon-button';
import {moduleStyles} from '../../styles/module-styles';
import {ActionButtonsStyles} from './action-buttons-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import isEqual from 'lodash-es/isEqual';
import {ConfigObj, createDynamicDialog, removeDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import EtoolsDialog from '@unicef-polymer/etools-dialog';

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
      <paper-button
        class="main-action status-tab-button ${this.withActionsMenu(this.actions.length)}"
        raised
        @click="${this._btnClicked}"
      >
        <span class="main-action text">${this._setButtonText(this.actions[0])}</span>
        ${this._showOtherActions(this.actions.length)
          ? html`<paper-menu-button class="option-button" dynamic-align close-on-activate>
              <paper-icon-button slot="dropdown-trigger" class="option-button" icon="expand-more"></paper-icon-button>
              <div slot="dropdown-content">
                ${(this.actions || [])
                  .filter((x) => this._filterActions(x))
                  .map(
                    (item: any) => html`<div class="other-options" action-code="${this._setActionCode(item)}">
                      <iron-icon icon="${this._setIcon(item, this.icons)}" class="option-icon"></iron-icon>
                      <span>${this._setButtonText(item)}</span>
                    </div>`
                  )}
              </div>
            </paper-menu-button>`
          : ``}
      </paper-button>
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
    const dialogConfig: ConfigObj = {
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

  _btnClicked(event) {
    if (!event || !event.target) {
      return;
    }
    const target = event.target.classList.contains('other-options')
      ? event.target
      : event.target.parentElement || event.target;
    const isMainAction = event.target.classList.contains('main-action');

    const action = isMainAction
      ? this.actions[0].code || this.actions[0]
      : target && target.getAttribute('action-code');

    if (action) {
      const paperMenuBtn = this.shadowRoot!.querySelector('paper-button')!.querySelector('paper-menu-button');
      if (paperMenuBtn && paperMenuBtn.opened) {
        paperMenuBtn.close();
      }

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

  _setActionCode(item) {
    return item && (item.code || item);
  }
}
