import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';
import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {apIcons, famIcon} from '../../styles/ap-icons';
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
      ${navMenuStyles} ${apIcons} ${famIcon}

      <div class="menu-header">
        <span id="app-name">
          FINANCIAL <br />
          ASSURANCE <br />
          MODULE
        </span>

        <span class="ripple-wrapper main">
          <iron-icon
            id="menu-header-top-icon"
            icon="fam-main-icon:fam-icon"
            @click="${this._toggleSmallMenu}"
          ></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
        <paper-tooltip for="menu-header-top-icon" position="right"> FINANCIAL ASSURANCE MODULE </paper-tooltip>

        <span class="chev-right">
          <iron-icon id="expand-menu" icon="chevron-right" @click="${this._toggleSmallMenu}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <span class="ripple-wrapper">
          <iron-icon id="minimize-menu" icon="chevron-left" @click="${this._toggleSmallMenu}"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
      </div>

      <div class="nav-menu">
        <iron-selector .selected="${this.selectedOption}" attr-for-selected="menu-name" role="navigation">
          <a class="nav-menu-item" menu-name="engagements" href="${BASE_PATH}engagements/list">
            <iron-icon id="iconEngagements" icon="av:playlist-add-check"></iron-icon>
            <div class="name">Engagements</div>
          </a>
          <paper-tooltip for="iconEngagements" position="right"> Engagements </paper-tooltip>

          ${this.showSscPage
            ? html`<a class="nav-menu-item" menu-name="staff-sc" href="${BASE_PATH}staff-sc/list">
                  <iron-icon id="iconStaffSpotCk" icon="av:recent-actors"></iron-icon>
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
          @tap="${this.trackAnalytics}"
          tracker="Implementation Intelligence"
        >
          <iron-icon id="power-bi-icon" icon="ap-icons:power-bi"></iron-icon>
          <div class="name">Implementation Intelligence</div>
        </a>
        <paper-tooltip for="power-bi-icon" position="right"> Implementation Intelligence </paper-tooltip>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <iron-icon id="knoledge-icon" icon="maps:local-library"></iron-icon>
          <div class="name">Knowledge base</div>
        </a>
        <paper-tooltip for="knoledge-icon" position="right"> Knowledge base </paper-tooltip>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <iron-icon id="discussion-icon" icon="icons:question-answer"></iron-icon>
          <div class="name">Discussion</div>
        </a>
        <paper-tooltip for="discussion-icon" position="right"> Discussion </paper-tooltip>

        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @tap="${this.trackAnalytics}"
          tracker="Information"
        >
          <iron-icon id="information-icon" icon="icons:info"></iron-icon>
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
