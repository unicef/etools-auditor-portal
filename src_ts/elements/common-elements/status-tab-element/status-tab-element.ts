import {PolymerElement, html} from '@polymer/polymer';
import {StatusTabElementStyles} from './status-tab-element-styles';
import {moduleStyles} from '../../styles-elements/module-styles';
import {property} from '@polymer/decorators';
import each from 'lodash-es/each';
import {getActions} from '../../app-mixins/permission-controller';
import CommonMethodsMixin from '../../app-mixins/common-methods-mixin';
import {GenericObject} from '../../../types/global';
declare const moment: any;
import '../insert-html/insert-html';
import './action-buttons';


class StatusTabElement extends CommonMethodsMixin(PolymerElement) {

  static get template() {
    return html`
      ${StatusTabElementStyles} ${moduleStyles}

      <etools-content-panel panel-title="Status">
        <div class="status-list" id="statusList">
          <div class="cancelled-status" id="cancelledStatus" hidden$="[[!cancelled]]">
            <div class="divider cancelled">
              <div class="status-divider"></div>
            </div>

            <div class="status-container cancelled">
              <div class="status-icon">
                <span class="icon-wrapper">
                  <iron-icon icon="cancel"></iron-icon>
                </span>
              </div>

              <div class$="status [[statusStates.canceled.class]]">
                <span class="status-header">
                  <insert-html html="[[statusStates.cancelled.statusText]]"></insert-html>
                </span>
                <span class="status-date">{{_getFormattedDate('date_of_cancel', engagementData.date_of_cancel)}}</span>
              </div>
            </div>
          </div>

          <div class$="status-container first [[_getStatusState(1, engagementData)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(1, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.partner_contacted.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.partner_contacted.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('partner_contacted_at', engagementData.partner_contacted_at)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class$="status-container [[_getStatusState(2, engagementData.date_of_field_visit)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(2, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.field_visit.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.field_visit.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('date_of_field_visit', engagementData.date_of_field_visit)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div
            class$="status-container [[_getStatusState(3, engagementData.date_of_field_visit, engagementData.date_of_draft_report_to_ip)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(3, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.draft_issued_to_partner.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.draft_issued_to_partner.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('date_of_draft_report_to_ip', engagementData.date_of_draft_report_to_ip)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div
            class$="status-container [[_getStatusState(4, engagementData.date_of_draft_report_to_ip, engagementData.date_of_comments_by_ip)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(4, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.comments_received_by_partner.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.comments_received_by_partner.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('date_of_comments_by_ip', engagementData.date_of_comments_by_ip)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div
            class$="status-container [[_getStatusState(5, engagementData.date_of_comments_by_ip, engagementData.date_of_draft_report_to_unicef)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(5, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.draft_issued_to_unicef.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.draft_issued_to_unicef.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('date_of_draft_report_to_unicef', engagementData.date_of_draft_report_to_unicef)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div
            class$="status-container [[_getStatusState(6, engagementData.date_of_draft_report_to_unicef, engagementData.date_of_comments_by_unicef)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(6, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.comments_received_by_unicef.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.comments_received_by_unicef.statusText]]"></insert-html>
              </span>
              <span
                class="status-date">{{_getFormattedDate('date_of_comments_by_unicef', engagementData.date_of_comments_by_unicef)}}</span>
            </div>
          </div>

          <div class="divider">
            <div class="status-divider"></div>
          </div>

          <div class$="status-container first [[_getStatusState(8, engagementData)]]">
            <div class="status-icon">
              <span class="icon-wrapper">
                <span class="status-nr">[[_refactorStatusNumber(7, engagementData.status)]]</span>
                <iron-icon icon="check"></iron-icon>
              </span>
            </div>

            <div class$="status [[statusStates.final.class]]">
              <span class="status-header">
                <insert-html html="[[statusStates.final.statusText]]"></insert-html>
              </span>
            </div>
          </div>
        </div>

        <template is="dom-if" if="{{_showActionButtons(actions)}}">
          <div class="status-buttons">
            <action-buttons actions="{{actions}}"></action-buttons>
          </div>
        </template>
      </etools-content-panel>
      </template>
    `;
  }

  @property({type: Object})
  engagementData: GenericObject = {};

  @property({type: Array})
  actions = [];

  @property({type: Object})
  statusStates = {};

  @property({type: Boolean})
  cancelled: boolean = false;

  @property({type: String})
  permissionBase!: string;

  private statuses = ['partner_contacted', 'field_visit', 'draft_issued_to_unicef',
    'comments_received_by_partner', 'draft_issued_to_partner',
    'comments_received_by_unicef', 'report_submitted', 'final', 'cancelled'];

  private statusFields = [null, null, 'date_of_field_visit', 'date_of_draft_report_to_ip',
    'date_of_comments_by_ip', 'date_of_draft_report_to_unicef',
    'date_of_comments_by_unicef', 'date_of_report_submit', 'date_of_report_submit'];

  static get observers() {
    return [
      'checkCancelled(engagementData.status)',
      'setActions(permissionBase)',
      'setStatusStates(permissionBase, engagementData)'
    ];
  }

  setActions(permissionBase) {
    let actions = permissionBase ? getActions(permissionBase) : [];
    this.set('actions', actions);
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

    let temp = this.statusStates;
    this.set('statusStates', {});
    this.set('statusStates', temp);
  }

  _getStatusText(displayName) {
    if (typeof displayName !== 'string') {return '';}

    let breakLength = 15;
    displayName = displayName.trim();

    if (displayName.length < breakLength) {return displayName;}

    let nextWordIndex = displayName.indexOf(' ', breakLength);
    if (nextWordIndex === -1) {return displayName;}

    return displayName.slice(0, nextWordIndex) + '<br>' + displayName.slice(nextWordIndex + 1);
  }

  _getStatusClass(displayName) {
    if (typeof displayName !== 'string') {return '';}
    return (displayName.indexOf('<br>') !== -1) ? 'multi-line' : '';
  }

  _getStatusState(statusNumber) {
    if (!this.engagementData || this.engagementData.status === undefined) {return;}

    if (isNaN(statusNumber)) {
      statusNumber = this._getStatusNumber(statusNumber);
    }
    let currentStatusNumber = this._getStatusNumber(this.engagementData.status);
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
    // @ts-ignore
    if (this.engagementData[this.statusFields[statusNumber]]) {
      return 'completed';
    } else {
      return 'pending';
    }
  }

  _getStatusNumber(status) {
    return this.statuses.indexOf(status) + 1;
  }

  _refactorStatusNumber(number: number, status) {
    // @ts-ignore
    return (status === 'cancelled' && !this.engagementData[this.statusFields[+number]]) ? +number + 1 : number;
  }

  _getFormattedDate(field) {
    if (!this.engagementData || !this.engagementData[field]) {return;}
    let date = new Date(this.engagementData[field]),
      format = 'on DD MMMM, YYYY';

    return moment.utc(date).format(format);
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
      // @ts-ignore
      if (!this.engagementData[field]) {
        number = index;
        return false;
      }
    });

    if (isNaN(number)) {
      this.$.statusList.appendChild(this.$.cancelledStatus);
    } else {
      let statuses = this.shadowRoot!.querySelectorAll('.divider:not(.cancelled)'),
        lastComplited = statuses && statuses[number];

      if (!lastComplited) {throw 'Can not find last complited status element!';}
      if (!this.$.statusList || !this.$.cancelledStatus) {throw 'Can not find elements!';}
      this.$.statusList.insertBefore(this.$.cancelledStatus, lastComplited);
    }

    this.cancelled = true;
  }

}

window.customElements.define('status-tab-element', StatusTabElement);
