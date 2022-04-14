import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-dropdown-menu/paper-dropdown-menu.js';
import '@polymer/paper-listbox/paper-listbox.js';
import '@polymer/polymer/lib/elements/dom-repeat';

import {moduleStyles} from '../../../styles/module-styles';
import {sharedStyles} from '../../../styles/shared-styles';
import {fireEvent} from '../../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 */
class ListPagination extends PolymerElement {
  static get template() {
    return html`
      ${sharedStyles} ${moduleStyles}
      <style>
        :host {
          /*flex-direction: row;*/
          display: block;
          margin-top: 0;
          --paper-dropdown-menu-padding: 0 30px;
          --paper-input-container-input-font-size: 12px;
          --paper-input-container-input-color: var(--gray-mid);
          --paper-input-container-underline-display: none;
        }
        .dropdown-content {
          background-color: white;
        }
        .chevron-container {
          display: inline;
          width: 200px;
          margin: 0 0 0 30px;
        }
        paper-icon-button {
          cursor: pointer;
        }
        paper-icon-button.single,
        paper-icon-button.back-arr.first,
        paper-icon-button.next-arr.last {
          color: var(--gray-light);
          cursor: default;
          --paper-icon-button-ink-color: rgba(0, 0, 0, 0);
        }
        paper-icon-button.textsec {
          cursor: default;
        }
        .rightfloat {
          float: right;
          @apply --list-pagination-styles;
        }
        .lh {
          line-height: 56px;
        }
        span.textsec.lh {
          font-size: 12px;
          margin-left: 40px;
        }
        paper-dropdown-menu {
          color: var(--gray-mid);
          width: 30px;
          vertical-align: middle;
          margin-left: 30px;
          --paper-input-container-input-box-sizing: border-box;
          --paper-input-container-input-white-space: nowrap;
          --paper-input-container-input-overflow: hidden;
          --paper-input-container-input-text-overflow: ellipsis;
          --paper-input-container-input-color: var(--gray-mid);
          --paper-input-container-focus-color: var(--primary-color);
          --iron-icon-height: 18px;
          --paper-input-container-shared-input-style: {
            font-size: 12px;
            line-height: 12px;
            vertical-align: middle;
          }
          --paper-input-container-underline: {
            display: none;
          }
        }
        paper-item {
          --paper-item: {
            height: 1px;
          }
        }
      </style>

      <div class="clearfix rightfloat horizontal layout center">
        <span class="textsec lh">Rows per page:</span>

        <paper-dropdown-menu id="item-nr-select" no-label-float vertical-align="bottom" horizontal-align="right">
          <paper-listbox
            slot="dropdown-content"
            id="selecta"
            class="dropdown-content"
            attr-for-selected="name"
            selected="{{pageSize}}"
            on-iron-select="itemsNrChanged"
          >
            <!--on-iron-select="itemsNrChanged"-->
            <template is="dom-repeat" items="[[sizesAllowed]]">
              <paper-item name="[[item]]">[[item]]</paper-item>
            </template>
          </paper-listbox>
        </paper-dropdown-menu>

        <span class="textsec lh unselectable">[[showingResults]]</span>

        <div class="chevron-container layout around-justified horizontal">
          <paper-icon-button
            disabled$="[[_disableButton(currentPage, datalength)]]"
            icon="first-page"
            on-click="goToFirst"
            class$="chev back-arr [[pageMarker]]"
          >
          </paper-icon-button>

          <paper-icon-button
            disabled$="[[_disableButton(currentPage, datalength)]]"
            icon="icons:chevron-left"
            class$="chev back-arr [[pageMarker]]"
            on-click="goToLeft"
          >
          </paper-icon-button>

          <paper-icon-button
            disabled$="[[_disableButton(currentPage, datalength, pageSize)]]"
            icon="icons:chevron-right"
            class$="chev next-arr [[pageMarker]]"
            on-click="goToRight"
          >
          </paper-icon-button>

          <paper-icon-button
            disabled$="[[_disableButton(currentPage, datalength, pageSize)]]"
            icon="last-page"
            on-click="goToLast"
            class$="chev next-arr [[pageMarker]]"
          >
          </paper-icon-button>
        </div>
      </div>
    `;
  }

  @property({type: Array})
  sizesAllowed: any[] = ['10', '25', '50', '100'];

  @property({type: String, observer: '_sizeChanged'})
  pageSize!: string;

  @property({type: String, observer: '_pageChanged'})
  pageNumber!: string;

  @property({type: Number})
  currentPage = 1;

  @property({type: Number, computed: '_calcLastPage(datalength, pageSize)'})
  lastPage!: number;

  @property({type: Boolean})
  withoutQueries = false;

  _sizeChanged(newSize) {
    if (this.sizesAllowed.indexOf(newSize) < 0) {
      this.fireEvent(this.pageNumber, '10');
    }
  }

  itemsNrChanged(event) {
    if (this.pageSize !== event.target.selected) {
      this.fireEvent(this.pageNumber, event.target.selected);
    }
  }

  goToFirst() {
    this.fireEvent('1');
  }

  goToLeft() {
    this.fireEvent(`${(+this.currentPage || 1) - 1}`);
  }

  goToRight() {
    if (this.currentPage !== this.lastPage) {
      this.fireEvent(`${(+this.currentPage || 1) + 1}`);
    }
  }

  goToLast() {
    this.fireEvent(String(this.lastPage));
  }

  _disableButton(currentPage, datalength, pageSize) {
    if (
      (+currentPage === 1 && !pageSize) ||
      (+currentPage === +this.lastPage && pageSize) ||
      this.pageSize >= datalength
    ) {
      return true;
    }
  }

  _calcLastPage(dataLength, size) {
    return dataLength % size ? Math.ceil(dataLength / size) : dataLength / size;
  }

  _pageChanged(pageNumber) {
    this.currentPage = pageNumber || 1;
  }

  private fireEvent(pageNumber = this.pageNumber, pageSize = this.pageSize): void {
    fireEvent(this, 'pagination-changed', {pageNumber, pageSize});
  }
}
window.customElements.define('list-pagination', ListPagination);
