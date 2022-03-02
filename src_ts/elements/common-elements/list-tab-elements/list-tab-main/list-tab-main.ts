import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-card/paper-card.js';
import '@polymer/polymer/lib/elements/dom-if';

import {sharedStyles} from '../../../styles/shared-styles';
import {moduleStyles} from '../../../styles/module-styles';

import {GenericObject} from '../../../../types/global';
import {ListTabMainStyles} from './list-tab-main-styles';
import '../list-header/list-header';
import '../list-element/list-element';
import '../list-pagination/list-pagination';

/**
 * @polymer
 * @customElement
 */
class ListTabMain extends PolymerElement {
  static get template() {
    return html`
      ${sharedStyles} ${moduleStyles} ${ListTabMainStyles}
      <style>
        :host {
          display: block;
          margin-top: 25px;
          --paper-card-background-color: white;
          --paper-card-margin: 0 24px;
          --paper-card-width: calc(100% - 48px);
        }
        :host .data-table .data-card-heading {
          display: block;
          font-size: 20px;
          margin-left: 20px;
          font-weight: 500;
          line-height: 64px;
        }
        :host .data-table .data-card-heading.table-title {
          margin-left: 0;
          text-align: center;
          background-color: var(--primary-color);
          line-height: 48px;
          color: #fff;
          margin-bottom: 17px;
        }
        .data-table {
          margin-bottom: 24px;
          padding-bottom: 5px;
        }
      </style>

      <paper-card class="data-table">
        <template is="dom-if" if="[[!withoutPagination]]" restamp>
          <span class="textprim data-card-heading">{{showingResults}} {{headerTitle}}</span>
        </template>

        <template is="dom-if" if="[[withoutPagination]]" restamp>
          <span class="textprim data-card-heading table-title">{{headerTitle}}</span>
        </template>

        <list-header
          id="list-header"
          data="[[headings]]"
          no-additional$="[[noAdditional]]"
          order-by="{{orderBy}}"
          base-permission-path="[[basePermissionPath]]"
        >
        </list-header>

        <template
          id="list-elements"
          is="dom-repeat"
          items="[[data]]"
          initial-count="10"
          on-dom-change="_listDataChanged"
        >
          <list-element
            class="list-element"
            data="[[item]]"
            headings="[[headings]]"
            details="[[details]]"
            no-additional$="[[noAdditional]]"
            has-collapse="[[hasCollapse]]"
            no-animation="[[noAnimation]]"
            base-permission-path="[[basePermissionPath]]"
          >
          </list-element>
        </template>

        <template is="dom-if" if="[[!data.length]]">
          <list-element class="list-element" no-additional data="[[emptyObj]]" headings="[[headings]]"> </list-element>
        </template>

        <template is="dom-if" if="[[!withoutPagination]]" restamp>
          <list-pagination
            id="list-pagination"
            page-size="{{queryParams.page_size}}"
            page-number="{{queryParams.page}}"
            datalength="[[listLength]]"
            page-marker="[[pageMarker]]"
            showing-results="{{showingResults}}"
          >
          </list-pagination>
        </template>
      </paper-card>
    `;
  }
  static get observers() {
    return ['_orderChanged(orderBy, headings)'];
  }

  @property({type: String})
  basePermissionPath = '';

  @property({type: Object, notify: true, observer: '_paramsChanged'})
  queryParams!: GenericObject;

  @property({type: String, computed: '_computeResultsToShow(listLength, queryParams.page_size)'})
  showingResults!: string;

  @property({type: String})
  orderBy = '';

  @property({type: Number})
  listLength!: number;

  @property({type: Array, notify: true})
  data!: any[];

  @property({type: Object})
  emptyObj: GenericObject = {empty: true};

  @property({type: Boolean})
  withoutPagination = false;

  @property({type: Boolean})
  hasCollapse = false;

  @property({type: Array})
  headings: any[] = [];

  @property({type: Array})
  details: any[] = [];

  @property({type: Boolean})
  noAdditional = false;

  @property({type: Boolean})
  noAnimation!: boolean;

  _orderChanged(newOrder) {
    if (!newOrder || !(this.headings instanceof Array)) {
      return false;
    }

    let direction = 'asc';
    let name = newOrder;

    if (name.startsWith('-')) {
      direction = 'desc';
      name = name.slice(1);
    }

    this.headings.forEach((heading, index) => {
      if (heading.name === name) {
        this.set(`headings.${index}.ordered`, direction);
      } else {
        this.set(`headings.${index}.ordered`, false);
      }
    });

    if (this.queryParams && this.queryParams.ordering !== this.orderBy) {
      this.set('queryParams.ordering', this.orderBy);
    }
  }

  _paramsChanged(newParams) {
    if (this.orderBy !== newParams.ordering) {
      this.orderBy = newParams.ordering;
    }
  }

  _computeResultsToShow(lengthAmount, size) {
    const page = (this.queryParams.page || 1) - 1;
    size = +size || 10;

    let last = size * page + size;
    if (last > lengthAmount) {
      last = lengthAmount;
    }
    const first = last ? size * page + 1 : 0;

    return `${first} - ${last} of ${lengthAmount}`;
  }

  _listDataChanged() {
    const rows = this.shadowRoot!.querySelectorAll('.list-element');

    if (rows && rows.length) {
      this.noAnimation = true;

      for (let i = 0; i < rows.length; i++) {
        if ((rows[i] as any).detailsOpened) {
          (rows[i] as any)._toggleRowDetails();
        }
      }

      this.noAnimation = false;
    }
  }
}

window.customElements.define('list-tab-main', ListTabMain);
