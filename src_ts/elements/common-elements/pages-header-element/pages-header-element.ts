import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';
import {sharedStyles} from '../../styles/shared-styles';
import {moduleStyles} from '../../styles/module-styles';
import pagesHeaderElementStyles from './pages-header-element-styles';
import {PaperListboxElement} from '@polymer/paper-listbox/paper-listbox';

/**
 * @polymer
 * @customElement
 */
class PagesHeaderElement extends MatomoMixin(PolymerElement) {
  static get template() {
    return html`
      ${sharedStyles} ${moduleStyles} ${pagesHeaderElementStyles}
      <div class="header-wrapper">
        <div class="side-heading horizontal layout center">
          <span class="flex title">[[_setTitle(engagement, pageTitle)]]</span>

          <div class="layout horizontal side-heading-button-holder">
            <div class="export-buttons" hidden$="[[!exportLinks.length]]">
              <paper-menu-button
                id="dropdown"
                hidden$="[[!_isDropDown(exportLinks)]]"
                on-tap="_toggleOpened"
                horizontal-align="right"
              >
                <paper-button class="grey-buttons" slot="dropdown-trigger" class="dropdown-trigger">
                  <iron-icon icon="file-download"></iron-icon>
                  Export
                </paper-button>

                <paper-listbox id="dropdownMenu" slot="dropdown-content" class="dropdown-content" class="mw-150">
                  <template is="dom-repeat" items="[[exportLinks]]">
                    <paper-item tracker$="[[item.name]]" on-tap="exportData">[[item.name]]</paper-item>
                  </template>
                </paper-listbox>
              </paper-menu-button>

              <paper-button
                class="grey-buttons"
                hidden$="[[_isDropDown(exportLinks)]]"
                tracker="Export"
                on-tap="exportData"
              >
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
            </div>

            <paper-button hidden$="[[hidePrintButton]]" class="grey-buttons" on-click="print">
              <iron-icon icon="print"></iron-icon>
              Print
            </paper-button>

            <paper-button
              class="add-btn"
              raised
              hidden$="[[hideAddButton]]"
              tracker="Add New Engagement"
              on-tap="addNewTap"
            >
              <template is="dom-if" if="{{_showLink(link)}}">
                <a href="{{link}}" class="btn-link"></a>
              </template>

              <iron-icon icon="add"></iron-icon>

              <span>[[btnText]]</span>
            </paper-button>
          </div>
        </div>

        <slot></slot>
      </div>
    `;
  }

  @property({type: String})
  title = '';

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Boolean})
  hideAddButton = true;

  @property({type: Boolean})
  hidePrintButton = false;

  @property({type: Object})
  data: GenericObject = {};

  @property({type: String})
  csvEndpoint = '';

  @property({type: String})
  link = '';

  @property({type: Array})
  exportLinks: GenericObject[] = [];

  connectedCallback() {
    super.connectedCallback();
  }

  addNewTap(e) {
    this.trackAnalytics(e);
  }

  _showLink(link) {
    return !!link;
  }

  _showBtn(link) {
    return !link;
  }

  _setTitle(engagement, title) {
    if (!engagement || !engagement.reference_number) {
      return title;
    }
    return engagement.reference_number;
  }

  exportData(e) {
    if (this.exportLinks.length < 1) {
      throw new Error('Can not find export link!');
    }
    this.trackAnalytics(e);
    const url = e && e.model && e.model.item ? e.model.item.url : this.exportLinks[0].url;
    window.open(url, '_blank');
  }

  _isDropDown(exportLinks) {
    return exportLinks && (exportLinks.length > 1 || (exportLinks[0] && exportLinks[0].useDropdown));
  }

  _toggleOpened() {
    const dropdownMenu = this.shadowRoot!.querySelector('#dropdownMenu') as PaperListboxElement;
    dropdownMenu.select(-1);
  }
}

window.customElements.define('pages-header-element', PagesHeaderElement);
