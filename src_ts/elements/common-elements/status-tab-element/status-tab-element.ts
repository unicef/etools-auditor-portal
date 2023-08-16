import {LitElement, html, PropertyValues, property, customElement} from 'lit-element';
import {StatusTabElementStyles} from './status-tab-element-styles';
import {moduleStyles} from '../../styles/module-styles';
import each from 'lodash-es/each';
import {getActions} from '../../mixins/permission-controller';
import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {GenericObject} from '../../../types/global';
declare const dayjs: any;
import '../insert-html/insert-html';
import './action-buttons';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('status-tab-element')
export class StatusTabElement extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [StatusTabElementStyles, moduleStyles];
  }

  render() {
    return html`
      <etools-content-panel panel-title="Status">
        <div class="status-list" id="statusList">
          <div class="cancelled-status" id="cancelledStatus" ?hidden="${!this.cancelled}">
            <div class="divider cancelled">
              <div class="status-divider"></div>
            </div>

            <div class="status-container cancelled">
              <div class="status-icon">
                <span class="icon-wrapper">
                  <iron-icon icon="cancel"></iron-icon>
                </span>
              </div>

              <div class="status ${this.statusStates.canceled?.class}">
                <span class="status-header">
                  <insert-html .html="${this.statusStates.cancelled?.statusText}"></insert-html>
                </span>
                <span class="status-date">${this._getFormattedDate('date_of_cancel')}</span>
              </div>
            </div>
          </div>

          <div class="status-container first ${this._getStatusState(1)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(1, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.partner_contacted?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.partner_contacted?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('partner_contacted_at')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container ${this._getStatusState(2)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(2, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.field_visit?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.field_visit?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('date_of_field_visit')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container ${this._getStatusState(3)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(3, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.draft_issued_to_partner?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.draft_issued_to_partner?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('date_of_draft_report_to_ip')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container ${this._getStatusState(4)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(4, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.comments_received_by_partner?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.comments_received_by_partner?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('date_of_comments_by_ip')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container ${this._getStatusState(5)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(5, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.draft_issued_to_unicef?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.draft_issued_to_unicef?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('date_of_draft_report_to_unicef')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container ${this._getStatusState(6)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(6, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.comments_received_by_unicef?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.comments_received_by_unicef?.statusText}"></insert-html>
              </span>
              <span class="status-date"> ${this._getFormattedDate('date_of_comments_by_unicef')} </span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class="status-container first ${this._getStatusState(8)}">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">${this._refactorStatusNumber(7, this.engagementData.status)}</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class="status ${this.statusStates.final?.class}">
              <span class="status-header">
                <insert-html .html="${this.statusStates.final?.statusText}"></insert-html>
              </span>
            </div>
          </div>
        </div>

        ${this._showActionButtons(this.actions)
          ? html`<div class="status-buttons">
              <action-buttons .actions="${this.actions}"></action-button>
            </div>`
          : ``}
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  engagementData: GenericObject = {};

  @property({type: Array})
  actions = [];

  @property({type: Object})
  statusStates: GenericObject = {};

  @property({type: Boolean})
  cancelled = false;

  @property({type: String})
  permissionBase!: string;

  private statuses = [
    'partner_contacted',
    'field_visit',
    'draft_issued_to_unicef',
    'comments_received_by_partner',
    'draft_issued_to_partner',
    'comments_received_by_unicef',
    'report_submitted',
    'final',
    'cancelled'
  ];

  private statusFields = [
    null,
    null,
    'date_of_field_visit',
    'date_of_draft_report_to_ip',
    'date_of_comments_by_ip',
    'date_of_draft_report_to_unicef',
    'date_of_comments_by_unicef',
    'date_of_report_submit',
    'date_of_report_submit'
  ];

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('engagementData')) {
      this.checkCancelled(this.engagementData.status);
      this.setStatusStates();
    }
    if (changedProperties.has('permissionBase')) {
      this.setActions(this.permissionBase);
      this.setStatusStates();
    }
  }

  setActions(permissionBase) {
    const actions = permissionBase ? getActions(permissionBase) : [];
    this.actions = actions;
  }

  setStatusStates() {
    let displayName;
    this.statuses.forEach((statusKey) => {
      if (!this.statusStates[statusKey]) {
        this.statusStates[statusKey] = {};
      }

      displayName = this.getDisplayName('status', this.permissionBase, statusKey);
      displayName = this._getStatusText(displayName);

      this.statusStates[statusKey].statusText = displayName;
      this.statusStates[statusKey].class = this._getStatusClass(displayName);
    });

    this.statusStates = {...this.statusStates};
  }

  _getStatusText(displayName) {
    if (typeof displayName !== 'string') {
      return '';
    }

    const breakLength = 15;
    displayName = displayName.trim();

    if (displayName.length < breakLength) {
      return displayName;
    }

    const nextWordIndex = displayName.indexOf(' ', breakLength);
    if (nextWordIndex === -1) {
      return displayName;
    }

    return displayName.slice(0, nextWordIndex) + '<br>' + displayName.slice(nextWordIndex + 1);
  }

  _getStatusClass(displayName) {
    if (typeof displayName !== 'string') {
      return '';
    }
    return displayName.indexOf('<br>') !== -1 ? 'multi-line' : '';
  }

  _getStatusState(statusNumber) {
    if (!this.engagementData || this.engagementData.status === undefined) {
      return;
    }

    if (isNaN(statusNumber)) {
      statusNumber = this._getStatusNumber(statusNumber);
    }
    const currentStatusNumber = this._getStatusNumber(this.engagementData.status);
    if (statusNumber === 1 || statusNumber === 8) {
      return this._classByStatus(statusNumber, currentStatusNumber);
    } else {
      return this._classByDate(statusNumber);
    }
  }

  _classByStatus(statusNumber, currentStatusNumber) {
    if (+statusNumber === currentStatusNumber + 1) {
      return 'active';
    } else if (statusNumber === 8 && this.engagementData.status === 'cancelled') {
      return 'pending';
    } else if (+statusNumber <= currentStatusNumber) {
      return 'completed';
    } else {
      return 'pending';
    }
  }

  _classByDate(statusNumber: number) {
    if (this.engagementData[String(this.statusFields[statusNumber])]) {
      return 'completed';
    } else {
      return 'pending';
    }
  }

  _getStatusNumber(status) {
    return this.statuses.indexOf(status) + 1;
  }

  _refactorStatusNumber(number: number, status: string) {
    return status === 'cancelled' && !this.engagementData[String(this.statusFields[+number])] ? +number + 1 : number;
  }

  _getFormattedDate(field) {
    if (!this.engagementData || !this.engagementData[field]) {
      return;
    }
    const date = new Date(this.engagementData[field]);
    const format = 'on DD MMMM, YYYY';

    return dayjs.utc(date).format(format);
  }

  _showActionButtons(actions) {
    return !!(actions && actions.length);
  }

  checkCancelled(status) {
    if (!status || status !== 'cancelled') {
      this.cancelled = false;
      return;
    }

    let number;
    each(this.statusFields.slice(2), (field, index) => {
      if (!this.engagementData[String(field)]) {
        number = index;
        return false;
      }
    });

    const statusList = this.shadowRoot!.querySelector('#statusList')!;
    const cancelledStatus = this.shadowRoot!.querySelector('#cancelledStatus')!;

    if (isNaN(number)) {
      statusList.appendChild(cancelledStatus);
    } else {
      const statuses = this.shadowRoot!.querySelectorAll('.divider:not(.cancelled)');
      const lastComplited = statuses && statuses[number];

      if (!lastComplited) {
        throw new Error('Can not find last complited status element!');
      }
      if (!statusList || !cancelledStatus) {
        throw new Error('Can not find elements!');
      }
      statusList.insertBefore(cancelledStatus, lastComplited);
    }

    this.cancelled = true;
  }
}
