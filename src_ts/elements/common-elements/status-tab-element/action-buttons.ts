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
import {AnyObject} from '@unicef-polymer/etools-types';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import './finalize-warning-dialog';

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
      <style>
        #infoDialog etools-dialog::part(ed-button-styles) {
          display: none;
        }
        sl-dialog.confirmation:part(ed-button-styles) {
          display: none;
        }
        .action-icon {
          --etools-icon-font-size: var(--etools-font-size-28, 28px);
          vertical-align: middle;
          padding-block-end: 4px;
        }
      </style>
      <etools-button-group>
        <etools-button id="primary" variant="primary" @click="${this._handlePrimaryClick}">
          ${this.actions?.length ? this._setButtonText(this.actions[0]) : ''}
        </etools-button>
        ${this._showOtherActions(this.actions?.length)
          ? html`<sl-dropdown
              id="splitBtn"
              placement="bottom-end"
              @click="${(event: MouseEvent) => event.stopImmediatePropagation()}"
            >
              <etools-button slot="trigger" variant="primary">
                <etools-icon name="caret" class="action-icon"></etools-icon>
              </etools-button>
              <sl-menu>
                ${(this.actions || [])
                  .filter((x) => this._filterActions(x))
                  .map(
                    (item: any) =>
                      html`<sl-menu-item @click="${() => this._handleSecondaryClick(item)}">
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
    create: 'assignment-turned-in',
    send_back: 'av:skipPrevious'
  };

  @property({type: Boolean})
  statusBtnMenuOpened!: boolean;

  @property({type: Object})
  engagementData!: AnyObject;

  @property({type: Array})
  apItems: AnyObject[] = [];

  getExpenditureText() {
    const isSC = this.engagementData?.engagement_type === 'sc';
    const isAudit = this.engagementData?.engagement_type === 'audit';
    if (!isSC && !isAudit) {
      return '';
    }
    if (isAudit && !(Number(this.engagementData.audited_expenditure_local) > 0)) {
      return `<p>Warning! Audited Expenditure is not set.</p>`;
    } else if (isSC && !(Number(this.engagementData.total_amount_tested_local) > 0)) {
      return `<p>Warning! Total Amount Tested is not set.</p>`;
    }
    return '';
  }

  openConfirmSubmitDialog() {
    const dialogContent = document.createElement('span');
    // @dci not needed for now
    // const expenditureWarningText = this.getExpenditureText();
    dialogContent.innerHTML = `Are you sure you want to submit the final report to the UNICEF Audit Focal Point?
                               You will not be able to make any further changes to the report.`;
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: dialogContent,
        confirmBtnText: 'Yes',
        cancelBtnText: 'No'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this.submitConfirmationClosed(true);
      }
    });
  }

  closeMenu() {
    this.statusBtnMenuOpened = false;
    this.requestUpdate();
  }

  _setButtonText(item) {
    if (!item) {
      return '';
    }
    const text = (item.display_name || item.replace('_', ' ')).replace('_', ' ');

    if (!text) {
      throw new Error('Can not get button text!');
    }

    return text.toUpperCase();
  }

  _handlePrimaryClick() {
    const action = this.actions[0].code || this.actions[0];
    if (action === 'submit') {
      this.openConfirmSubmitDialog();
    } else if (action === 'finalize') {
      this.onFinalize();
    } else {
      this.fireActionActivated(action);
    }
  }

  _handleSecondaryClick(item: any) {
    const action = item.code;
    if (action) {
      if (action === 'submit') {
        this.openConfirmSubmitDialog();
      } else if (action === 'finalize') {
        this.onFinalize();
      } else {
        this.fireActionActivated(action);
      }
    }
  }

  async onFinalize() {
    let msg = '';
    let hasFinancialOrPriorityFindings = false;
    if (this.engagementData?.financial_finding_set?.length) {
      hasFinancialOrPriorityFindings = true;
      msg = 'Financial';
    }
    if ((this.engagementData?.findings || []).some((x: any) => x.priority === 'high')) {
      hasFinancialOrPriorityFindings = true;
      msg += msg !== '' ? ' and Priority Findings' : 'Priority Findings';
    } else {
      msg += ' Findings';
    }

    if (hasFinancialOrPriorityFindings && !this.apItems?.length) {
      openDialog({
        dialog: 'finalize-warning-dialog',
        dialogData: {
          content: `Engagement has ${msg}. <br /> Please provide Follow-Up Actions.`
        }
      });
    } else {
      this.fireActionActivated('finalize');
    }
  }

  submitConfirmationClosed(confirmed: boolean) {
    if (confirmed) {
      this.fireActionActivated('submit');
    }
  }

  fireActionActivated(action: string) {
    fireEvent(this, `action-activated`, {type: action});
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
