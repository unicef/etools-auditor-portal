import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-icons/av-icons.js';
import '@polymer/iron-icons/maps-icons.js';
import '@polymer/iron-selector/iron-selector.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-ripple/paper-ripple.js';
import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {property} from '@polymer/decorators';
import {apIcons, famIcon} from '../../styles/ap-icons';

/**
 * @polymer
 * @customElement
 * @appliesMixin GestureEventListeners
 */
class AppMenu extends GestureEventListeners(MatomoMixin(PolymerElement)) {
  public static get template() {
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
          <iron-icon id="menu-header-top-icon" icon="fam-main-icon:fam-icon" on-tap="_toggleSmallMenu"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
        <paper-tooltip for="menu-header-top-icon" position="right"> FINANCIAL ASSURANCE MODULE </paper-tooltip>

        <span class="chev-right">
          <iron-icon id="expand-menu" icon="chevron-right" on-tap="_toggleSmallMenu"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>

        <span class="ripple-wrapper">
          <iron-icon id="minimize-menu" icon="chevron-left" on-tap="_toggleSmallMenu"></iron-icon>
          <paper-ripple class="circle" center></paper-ripple>
        </span>
      </div>

      <div class="nav-menu">
        <iron-selector selected="[[selectedOption]]" attr-for-selected="menu-name" role="navigation">
          <a class="nav-menu-item" menu-name="engagements" href$="[[rootPath]]engagements/list?reload=true">
            <iron-icon id="iconEngagements" icon="av:playlist-add-check"></iron-icon>
            <div class="name">Engagements</div>
          </a>
          <paper-tooltip for="iconEngagements" position="right"> Engagements </paper-tooltip>

          <template is="dom-if" if="[[showSscPage]]">
            <a class="nav-menu-item" menu-name="staff-sc" href$="[[rootPath]]staff-sc/list?reload=true">
              <iron-icon id="iconStaffSpotCk" icon="av:recent-actors"></iron-icon>
              <div class="name">Staff Spot Checks</div>
            </a>
            <paper-tooltip for="iconStaffSpotCk" position="right"> Staff Spot Checks </paper-tooltip>
          </template>
        </iron-selector>
        <div class="nav-menu-item section-title">
          <span>eTools Community Channels</span>
        </div>

        <a
          class="nav-menu-item lighter-item no-transform"
          href="[[etoolsNowLink]]"
          target="_blank"
          on-tap="trackAnalytics"
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
          on-tap="trackAnalytics"
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
          on-tap="trackAnalytics"
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
          on-tap="trackAnalytics"
          tracker="Information"
        >
          <iron-icon id="information-icon" icon="icons:info"></iron-icon>
          <div class="name">Information</div>
        </a>
        <paper-tooltip for="information-icon" position="right"> Information </paper-tooltip>
      </div>
    `;
  }

  @property({type: String, observer: '_pageChanged'})
  selectedPage!: string;

  @property({type: String})
  selectedOption!: string;

  @property({type: String})
  rootPath!: string;

  @property({type: Boolean, reflectToAttribute: true, observer: '_menuSizeChange'})
  smallMenu!: boolean;

  @property({type: Boolean})
  showSscPage = false;

  @property({type: String})
  // eslint-disable-next-line max-len
  etoolsNowLink = `https://app.powerbi.com/groups/me/apps/2c83563f-d6fc-4ade-9c10-bbca57ed1ece/reports/9726e9e7-c72f-4153-9fd2-7b418a1e426c/ReportSection?ctid=77410195-14e1-4fb8-904b-ab1892023667`;

  // @ts-ignore
  private _menuSizeChange(newVal: boolean, oldVal: boolean): void {
    if (newVal !== oldVal) {
      setTimeout(() => fireEvent(this, 'resize-main-layout'));
    }
  }

  // @ts-ignore
  private _toggleSmallMenu(e: Event): void {
    e.stopImmediatePropagation();
    fireEvent(this, 'toggle-small-menu');
  }

  _pageChanged() {
    this.selectedOption = this._getSelectedMenu(this.selectedPage);
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

window.customElements.define('app-menu', AppMenu);
