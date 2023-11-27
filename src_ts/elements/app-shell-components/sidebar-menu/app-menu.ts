import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {apIcons} from '../../styles/ap-icons';
import {BASE_PATH} from '../../config/config';

/**
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
@customElement('app-menu')
export class AppMenu extends MatomoMixin(LitElement) {
  render() {
    // main template
    // language=HTML
    return html`
      ${navMenuStyles} ${apIcons}
      <div class="menu-header">
        <span id="app-name">
          FINANCIAL <br />
          ASSURANCE <br />
          MODULE
        </span>

        <span class="ripple-wrapper main">
          <etools-icon id="menu-header-top-icon" name="fam-icon" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>
        <paper-tooltip for="menu-header-top-icon" position="right"> FINANCIAL ASSURANCE MODULE </paper-tooltip>

        <span class="chev-right">
          <etools-icon id="expand-menu" name="chevron-right" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>

        <span class="ripple-wrapper">
          <etools-icon id="minimize-menu" name="chevron-left" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>
      </div>

      <div class="nav-menu">
        <iron-selector .selected="${this.selectedOption}" attr-for-selected="menu-name" role="navigation">
          <a class="nav-menu-item" menu-name="engagements" href="${BASE_PATH}engagements/list">
            <etools-icon id="iconEngagements" name="av:playlist-add-check"></etools-icon>
            <div class="name">Engagements</div>
          </a>
          <paper-tooltip for="iconEngagements" position="right"> Engagements </paper-tooltip>

          ${this.showSscPage
            ? html`<a class="nav-menu-item" menu-name="staff-sc" href="${BASE_PATH}staff-sc/list">
                  <etools-icon id="iconStaffSpotCk" name="av:recent-actors"></etools-icon>
                  <div class="name">Staff Spot Checks</div>
                </a>
                <paper-tooltip for="iconStaffSpotCk" position="right"> Staff Spot Checks </paper-tooltip>`
            : ``}
        </iron-selector>
        <div class="nav-menu-item section-title">
          <span>eTools Community Channels</span>
        </div>

        <a
          class="nav-menu-item lighter-item no-transform"
          href="${this.etoolsNowLink}"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Implementation Intelligence"
        >
          <etools-icon id="power-bi-icon" name="power-bi"></etools-icon>
          <div class="name">Implementation Intelligence</div>
        </a>
        <paper-tooltip for="power-bi-icon" position="right"> Implementation Intelligence </paper-tooltip>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <etools-icon id="knoledge-icon" name="maps:local-library"></etools-icon>
          <div class="name">Knowledge base</div>
        </a>
        <paper-tooltip for="knoledge-icon" position="right"> Knowledge base </paper-tooltip>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <etools-icon id="discussion-icon" name="question-answer"></etools-icon>
          <div class="name">Discussion</div>
        </a>
        <paper-tooltip for="discussion-icon" position="right"> Discussion </paper-tooltip>

        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Information"
        >
          <etools-icon id="information-icon" name="info"></etools-icon>
          <div class="name">Information</div>
        </a>
        <paper-tooltip for="information-icon" position="right"> Information </paper-tooltip>
      </div>
    `;
  }

  @property({type: String})
  selectedPage!: string;

  @property({type: String})
  selectedOption!: string;

  @property({type: Boolean, reflect: true, attribute: 'small-menu'})
  smallMenu!: boolean;

  @property({type: Boolean})
  showSscPage = false;

  @property({type: String})
  // eslint-disable-next-line max-len
  etoolsNowLink = `https://app.powerbi.com/groups/me/apps/2c83563f-d6fc-4ade-9c10-bbca57ed1ece/reports/9726e9e7-c72f-4153-9fd2-7b418a1e426c/ReportSection?ctid=77410195-14e1-4fb8-904b-ab1892023667`;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('selectedPage')) {
      this._pageChanged();
    }
    if (changedProperties.has('smallMenu')) {
      this._smallMenuChanged();
    }
  }

  _toggleSmallMenu(e: Event): void {
    e.stopImmediatePropagation();
    this.smallMenu = !this.smallMenu;
    fireEvent(this, 'toggle-small-menu');
  }

  _pageChanged() {
    this.selectedOption = this._getSelectedMenu(this.selectedPage);
  }

  _smallMenuChanged() {
    setTimeout(() => fireEvent(this, 'resize-main-layout'));
  }

  _getSelectedMenu(page: string) {
    if (
      page.indexOf('staff-sc') !== -1 ||
      page.indexOf('spot-checks') !== -1 ||
      page.indexOf('staff-spot-checks') !== -1
    ) {
      return 'staff-sc';
    } else {
      return 'engagements';
    }
  }
}
