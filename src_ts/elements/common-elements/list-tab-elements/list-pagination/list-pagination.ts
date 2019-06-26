
import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';

import QueryParamsController from '../../../app-mixins//query-params-controller';
import {sharedStyles} from '../../../styles-elements/shared-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin QueryParamsController
 */
class ListPagination extends QueryParamsController(PolymerElement){

    static get template() {
    return html`
        ${sharedStyles} ${moduleStyles}
         <style>
            :host {
                display: block;
                margin-top: 0;
                --paper-dropdown-menu: #{'{ width: 50px; padding: 0 30px; }'};
                --paper-input-container-input: #{'{ font-size: 12px; color: var(--gray-mid); }'};
                --paper-input-container-underline: #{'{ display: none; }'};
            }

            .dropdown-content {
                background-color: white;
            }

            .chevron-container {
                width: 200px;
                margin: 0 0 0 30px;
            }

            paper-icon-button {
               cursor: pointer;
            }

            paper-icon-button.single, paper-icon-button.back-arr.first, paper-icon-button.next-arr.last {
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
0
            .lh {
                line-height: 56px;
            }

            span.textsec.lh {
                font-size: 12px;
            }

            paper-dropdown-menu {
            color: var(--gray-mid);
            --paper-input-container-input: {
                    font-size: 13px;
                    box-sizing: border-box;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    padding-left: 3px;
                    color: var(--gray-mid);
                    line-height: 24px;
                    height: 24px;
                };
            --paper-input-container-focus-color: var(--module-primary);
            }

            paper-item {
            --paper-item: {
                    height: 1px;
                };
            }
         </style>

            <div class="clearfix rightfloat horizontal layout center">
                <span class="textsec lh">Rows per page:</span>

                <paper-dropdown-menu
                        id="item-nr-select"
                        no-label-float
                        vertical-align="bottom"
                        horizontal-align="right">
                    <paper-listbox id="selecta" class="dropdown-content" attr-for-selected="name" selected="{{pageSize}}">
                        <!--on-iron-select="itemsNrChanged"-->
                        <template is="dom-repeat" items="[[sizesAllowed]]">
                            <paper-item name="[[item]]">[[item]]</paper-item>
                        </template>
                    </paper-listbox>
                </paper-dropdown-menu>

                <span class="textsec lh unselectable">{{showingResults}}</span>

                <div class="chevron-container layout around-justified horizontal">
                    <paper-icon-button
                            disabled$="{{_disableButton(currentPage, datalength)}}"
                            icon="pagination:first-page"
                            on-click="goToFirst"
                            class$="chev back-arr [[pageMarker]]">
                    </paper-icon-button>

                    <paper-icon-button
                            disabled$="{{_disableButton(currentPage, datalength)}}"
                            icon="icons:chevron-left"
                            class$="chev back-arr [[pageMarker]]"
                            on-click="goToLeft">
                    </paper-icon-button>

                    <paper-icon-button
                            disabled$="{{_disableButton(currentPage, datalength, pageSize)}}"
                            icon="icons:chevron-right"
                            class$="chev next-arr [[pageMarker]]"
                            on-click="goToRight">
                    </paper-icon-button>

                    <paper-icon-button
                            disabled$="{{_disableButton(currentPage, datalength, pageSize)}}"
                            icon="pagination:last-page"
                            on-click="goToLast"
                            class$="chev next-arr [[pageMarker]]">
                    </paper-icon-button>
                </div>
            </div>
    `;
    }

    @property({type: Array})
    sizesAllowed: any[] = ['10', '25', '50', '100'];

    @property({type: String, notify: true,  observer: '_sizeChanged'})
    pageSize!: string;

    @property({type: String, notify: true,  observer: '_pageChanged'})
    pageNumber!: string;

    @property({type: Number})
    currentPage: number = 1;

    @property({type: Number, computed: '_calcLastPage(datalength, pageSize)'})
    lastPage!: number;

    @property({type: Boolean})
    withoutQueries: boolean = false;


    _sizeChanged(newSize) {
        if (this.sizesAllowed.indexOf(newSize) < 0) { this.set('pageSize', '10'); }
    }

    goToFirst() { this.set('pageNumber', '1'); }

    goToLeft() {
        this.set('pageNumber', `${(+this.currentPage || 1) - 1}`);
    }

    goToRight() {
        if (this.currentPage !== this.lastPage) { this.set('pageNumber', `${(+this.currentPage || 1) + 1}`); }
    }

    goToLast() { this.set('pageNumber', this.lastPage); }

    _disableButton(currentPage, datalength, pageSize) {
        if ((+this.currentPage === 1 && !pageSize) || (+this.currentPage === +this.lastPage && pageSize) || this.pageSize >= datalength) { return true; }
    }

    _calcLastPage(dataLength, size) {
        return dataLength % size ? Math.ceil(dataLength / size) : dataLength / size;
    }

    _pageChanged(pageNumber) {
        this.currentPage = pageNumber || 1;
    }

}
window.customElements.define('list-pagination', ListPagination);
