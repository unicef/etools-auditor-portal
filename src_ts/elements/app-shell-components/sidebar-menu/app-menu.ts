import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import {navMenuStyles} from './styles/nav-menu-styles';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY} from '../../config/config';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

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
      ${navMenuStyles}
      <div class="menu-header">
        <span id="app-name">
          FINANCIAL <br />
          ASSURANCE <br />
          MODULE
        </span>

        <sl-tooltip content="FINANCIAL ASSURANCE MODULE" placement="right">
          <span class="ripple-wrapper main">
            <etools-icon id="menu-header-top-icon" name="fam-icon" @click="${this._toggleSmallMenu}"></etools-icon>
          </span>
        </sl-tooltip>
        <span class="chev-right">
          <etools-icon id="expand-menu" name="chevron-right" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>

        <span class="ripple-wrapper">
          <etools-icon size="36" id="minimize-menu" name="chevron-left" @click="${this._toggleSmallMenu}"></etools-icon>
        </span>
      </div>

      <div class="nav-menu">
        <div class="menu-selector" role="navigation">
          <a
            class="nav-menu-item ${this.getItemClass(this.selectedOption, 'engagements')}"
            menu-name="engagements"
            href="${Environment.basePath}engagements/list?ordering=id"
          >
            <sl-tooltip placement="right" hoist ?disabled="${!this.smallMenu}" content="Engagements">
              <etools-icon id="iconEngagements" name="av:playlist-add-check"></etools-icon>
            </sl-tooltip>
            <div class="name">Engagements</div>
          </a>

          ${this.showSscPage
            ? html`<a
                class="nav-menu-item ${this.getItemClass(this.selectedOption, 'staff-sc')}"
                menu-name="staff-sc"
                href="${Environment.basePath}staff-sc/list?ordering=id"
              >
                <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="Staff Spot Checks">
                  <etools-icon id="iconStaffSpotCk" name="av:recent-actors"></etools-icon>
                </sl-tooltip>
                <div class="name">Staff Spot Checks</div>
              </a>`
            : ``}
        </div>
        <div class="nav-menu-item section-title">
          <span>eTools Community Channels</span>
        </div>

        <a
          class="nav-menu-item lighter-item"
          href="http://etools.zendesk.com"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Knowledge base"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="Knowledge base">
            <etools-icon id="knoledge-icon" name="maps:local-library"></etools-icon>
          </sl-tooltip>
          <div class="name">Knowledge base</div>
        </a>

        <a
          class="nav-menu-item lighter-item"
          href="https://www.yammer.com/unicef.org/#/threads/inGroup?type=in_group&feedId=5782560"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Discussion"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="Discussion">
            <etools-icon id="discussion-icon" name="question-answer"></etools-icon>
          </sl-tooltip>
          <div class="name">Discussion</div>
        </a>

        <a
          class="nav-menu-item lighter-item last-one"
          href="https://etools.unicef.org/landing"
          target="_blank"
          @click="${this.trackAnalytics}"
          tracker="Information"
        >
          <sl-tooltip placement="right" ?disabled="${!this.smallMenu}" content="Information">
            <etools-icon id="information-icon" name="info"></etools-icon>
          </sl-tooltip>
          <div class="name">Information</div>
        </a>
      </div>
    `;
  }

  @property({type: String})
  selectedPage!: string;

  @property({type: String})
  selectedOption!: string;

  @property({type: Boolean, reflect: true, attribute: 'small-menu'})
  smallMenu = false;

  @property({type: Boolean})
  showSscPage = false;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('selectedPage')) {
      this._pageChanged();
    }
    if (changedProperties.has('smallMenu')) {
      this._smallMenuChanged();
    }
  }

  _toggleSmallMenu(): void {
    this.smallMenu = !this.smallMenu;
    const localStorageVal: number = this.smallMenu ? 1 : 0;
    localStorage.setItem(SMALL_MENU_ACTIVE_LOCALSTORAGE_KEY, String(localStorageVal));
    fireEvent(this, 'toggle-small-menu', {value: this.smallMenu});
  }

  _pageChanged() {
    this.selectedOption = this._getSelectedMenu(this.selectedPage);
  }

  _smallMenuChanged() {
    setTimeout(() => fireEvent(this, 'resize-main-layout'));
  }

  getItemClass(selectedValue: string, itemValue: string) {
    return selectedValue === itemValue ? 'selected' : '';
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
