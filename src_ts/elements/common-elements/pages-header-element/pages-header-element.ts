import {LitElement, property, html, customElement} from 'lit-element';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {GenericObject} from '../../../types/global';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {pagesHeaderElementStyles} from './pages-header-element-styles';
import {PaperListboxElement} from '@polymer/paper-listbox/paper-listbox';

/**
 * @polymer
 * @LitElement
 */
@customElement('pages-header-element')
export class PagesHeaderElement extends MatomoMixin(LitElement) {
  static get styles() {
    return [moduleStyles, pagesHeaderElementStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <div class="header-wrapper">
        <div class="side-heading horizontal layout center">
          <span class="flex title">${this._setTitle(this.engagement, this.pageTitle)}</span>
          <div class="layout horizontal side-heading-button-holder">
            <div class="export-buttons" ?hidden="${!this.exportLinks || !this.exportLinks.length}">
              <paper-menu-button
                id="dropdown"
                ?hidden="${!this._isDropDown(this.exportLinks)}"
                @tap="${this._toggleOpened}"
                horizontal-align="right"
              >
                <paper-button class="grey-buttons" slot="dropdown-trigger" class="dropdown-trigger">
                  <iron-icon icon="file-download"></iron-icon>
                  Export
                </paper-button>

                <paper-listbox id="dropdownMenu" slot="dropdown-content" class="dropdown-content" class="mw-150">
                  ${this.exportLinks?.map(
                    (item) =>
                      html`
                        <paper-item tracker="Export ${item.name}" @tap="${this.exportData}">${item.name}</paper-item>
                      `
                  )}
                </paper-listbox>
              </paper-menu-button>

              <paper-button
                class="grey-buttons"
                ?hidden="${this._isDropDown(this.exportLinks)}"
                tracker="Export"
                @tap="${this.exportData}"
              >
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
            </div>

            <paper-button ?hidden="${this.hidePrintButton}" class="grey-buttons" on-click="print">
              <iron-icon icon="print"></iron-icon>
              Print
            </paper-button>

            <paper-button
              class="add-btn"
              raised
              ?hidden="${this.hideAddButton}"
              tracker="Add New Engagement"
              @tap="${this.addNewTap}"
            >
              <a href="${this.link}" class="btn-link" ?hidden="${!this._showLink(this.link)}"></a>
              <iron-icon icon="add"></iron-icon>
              <span>${this.btnText}</span>
            </paper-button>
          </div>
        </div>

        <slot></slot>
      </div>
    `;
  }

  @property({type: String, attribute: 'page-title'})
  pageTitle!: string;

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Boolean})
  hideAddButton = true;

  @property({type: String, attribute: 'btn-text'})
  btnText!: string;

  @property({type: Boolean, reflect: true, attribute: 'hide-print-button'})
  hidePrintButton = false;

  @property({type: Object})
  data: GenericObject = {};

  @property({type: String})
  csvEndpoint = '';

  @property({type: String})
  link = '';

  @property({type: Array})
  exportLinks: GenericObject[] = [];

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
