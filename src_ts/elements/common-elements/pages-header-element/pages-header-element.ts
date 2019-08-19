import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/iron-flex-layout/iron-flex-layout-classes';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/paper-button/paper-button';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-listbox/paper-listbox';
import '@polymer/paper-item/paper-item';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../types/global';
import {fireEvent} from '../../utils/fire-custom-event';
import {sharedStyles} from '../../styles-elements/shared-styles';
import {moduleStyles} from '../../styles-elements/module-styles';
import pagesHeaderElementStyles from './pages-header-element-styles';

/**
 * TODO: polymer 3 migration
 *    -  add endponts mixin
 *
 * @customElement
 * @polymer
 */
class PagesHeaderElement extends PolymerElement {

  static get template() {
    // language=HTML
    return html`
      ${sharedStyles} ${moduleStyles} ${pagesHeaderElementStyles}
      <div class="header-wrapper">
        <div class="side-heading horizontal layout center">
          <span class="flex title">[[_setTitle(engagement, pageTitle)]]</span>

          <div class="layout horizontal side-heading-button-holder">
            <div class="export-buttons" hidden$="[[!exportLinks.length]]">
              <paper-menu-button id="dropdown" hidden$="[[!_isDropDown(exportLinks)]]" on-tap="_toggleOpened" horizontal-align="right">
                <paper-button class="grey-buttons" slot="dropdown-trigger" class="dropdown-trigger">
                  <iron-icon icon="file-download"></iron-icon>
                  Export
                </paper-button>

                <paper-listbox id="dropdownMenu" slot="dropdown-content" class="dropdown-content" class="mw-150">
                  <template is="dom-repeat" items="[[exportLinks]]">
                    <paper-item on-tap="exportData">[[item.name]]</paper-item>
                  </template>
                </paper-listbox>
              </paper-menu-button>

              <paper-button class="grey-buttons" hidden$="[[_isDropDown(exportLinks)]]" on-tap="exportData">
                <iron-icon icon="file-download"></iron-icon>
                Export
              </paper-button>
            </div>

            <paper-button
                hidden$="[[hidePrintButton]]"
                class="grey-buttons"
                on-click="print">
              <iron-icon icon="print"></iron-icon>
              Print
            </paper-button>

            <paper-button
                class="add-btn"
                raised
                hidden$="[[_hideAddButton(showAddButton)]]"
                on-tap="addNewTap">
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
  title: string = '';

  @property({type: Object})
  engagement: GenericObject = {};

  @property({type: Boolean})
  showAddButton: boolean = false;

  @property({type: Boolean})
  hidePrintButton: boolean = false;

  @property({type: Object})
  data: GenericObject = {};

  @property({type: String})
  csvEndpoint: string = '';

  @property({type: String})
  baseUrl: string = '';

  @property({type: String})
  link: string = '';

  @property({type: Array})
  exportLinks: string[] = [];


  connectedCallback() {
    super.connectedCallback();
    // TODO: polymer 3 migration - Why?????????
    this.baseUrl = this.basePath;
  }

  _hideAddButton(show) {
    return !show;
  }

  addNewTap() {
    fireEvent(this, 'add-new-tap');
  }

  _showLink(link) {
    return !!link;
  }

  _showBtn(link) {
    return !link;
  }

  _setTitle(engagement, title) {
    if (!engagement || !engagement.unique_id) {
      return title;
    }
    return engagement.unique_id;
  }

  exportData(e) {
    if (this.exportLinks < 1) {
      throw 'Can not find export link!';
    }
    // TODO: polymer 3 migration - check if e.model.item still works
    let url = (e && e.model && e.model.item) ? e.model.item.url : this.exportLinks[0].url;
    window.open(url, '_blank');
  }

  _isDropDown(exportLinks) {
    return exportLinks && (exportLinks.length > 1 ||
        (exportLinks[0] && exportLinks[0].useDropdown));
  }

  _toggleOpened() {
    this.$.dropdownMenu.select(null);
  }

}

window.customElements.define('pages-header-element', PagesHeaderElement);
