import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@shoelace-style/shoelace/dist/components/dropdown/dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@shoelace-style/shoelace/dist/components/menu/menu.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import {GenericObject} from '../../../types/global';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {pagesHeaderElementStyles} from './pages-header-element-styles';

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
              <sl-dropdown id="pdExportMenuBtn" ?hidden="${!this._isDropDown(this.exportLinks)}" close-on-activate>
                <etools-button slot="trigger" variant="text" class="neutral" caret>
                  <etools-icon name="file-download" slot="prefix"></etools-icon>
                  Export
                </etools-button>
                <sl-menu>
                  ${this.exportLinks?.map(
                    (item) =>
                      html`
                        <sl-menu-item tracker="Export ${item.name}" url="${item.url}" @click="${this.exportData}">
                          ${item.name}</sl-menu-item
                        >
                      `
                  )}
                </sl-menu>
              </sl-dropdown>
              <etools-button
                class="neutral"
                variant="text"
                ?hidden="${this._isDropDown(this.exportLinks)}"
                tracker="Export"
                @click="${this.exportData}"
              >
                <etools-icon name="file-download"></etools-icon>
                Export
              </etools-button>
            </div>

            <etools-button ?hidden="${this.hidePrintButton}" class="neutral" variant="text" on-click="print">
              <etools-icon name="print"></etools-icon>
              Print
            </etools-button>

            <etools-button
              class="add-btn"
              variant="primary"
              raised
              ?hidden="${this.hideAddButton || typeof this.hideAddButton === 'undefined'}"
              tracker="Add New Engagement"
              @click="${this.addNewTap}"
            >
              <a href="${this.link}" class="btn-link" ?hidden="${!this._showLink(this.link)}"></a>
              <etools-icon name="add"></etools-icon>
              <span>${this.btnText}</span>
            </etools-button>
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
    const url = e?.target?.getAttribute('url');
    window.open(url || this.exportLinks[0].url, '_blank');
  }

  _isDropDown(exportLinks) {
    return exportLinks && (exportLinks.length > 1 || (exportLinks[0] && exportLinks[0].useDropdown));
  }
}
