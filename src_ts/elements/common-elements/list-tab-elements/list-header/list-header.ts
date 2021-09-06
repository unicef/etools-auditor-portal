import {PolymerElement, html} from '@polymer/polymer';

import '@polymer/iron-icon/iron-icon.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';

import {property} from '@polymer/decorators';
import get from 'lodash-es/get';
import {GenericObject} from '../../../../types/global';
import {sharedStyles} from '../../../styles/shared-styles';
import {moduleStyles} from '../../../styles/module-styles';

import LocalizationMixin from '../../../mixins/localization-mixin';

/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizationMixin
 */
class ListHeader extends LocalizationMixin(PolymerElement) {
  static get template() {
    return html`
      ${sharedStyles} ${moduleStyles}
      <style>
        :host {
          display: block;
          padding: 0 15px 0 72px;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.26);
        }
        :host .heading-row-header {
          display: block;
          height: 56px;
          width: 100%;
          box-sizing: border-box;
          white-space: nowrap;
          font-size: 0;
        }
        :host .heading-row-header .empty-icon-wrapper {
          width: 72px;
        }
        :host .heading-row-header .local-headings {
          display: inline-block;
          box-sizing: border-box;
          padding-right: 10px;
          font-weight: 500;
          color: var(--gray-mid);
          overflow: hidden;
          height: 56px;
          line-height: 56px;
          white-space: normal;
          vertical-align: middle;
        }
        :host .heading-row-header .local-headings:hover {
          cursor: pointer;
        }
        :host .heading-row-header .local-headings:hover .heading {
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings:hover iron-icon.up-icon {
          display: inline-flex;
        }
        :host .heading-row-header .local-headings[ordered='asc'] iron-icon.up-icon {
          display: inline-flex;
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='asc'] .heading {
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='desc'] .heading {
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='desc'] iron-icon.down-icon {
          display: inline-flex;
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='desc'] iron-icon.up-icon {
          display: none;
        }
        :host .heading-row-header .local-headings[ordered='desc'] .heading {
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='desc'] iron-icon.down-icon {
          display: inline-flex;
          color: var(--gray-dark);
        }
        :host .heading-row-header .local-headings[ordered='desc'] iron-icon.up-icon {
          display: none;
        }
        :host .heading-row-header .local-headings.no-order {
          cursor: auto;
        }
        :host .heading-row-header .local-headings.no-order:hover .heading {
          color: inherit;
        }
        :host .heading-row-header .local-headings.no-order iron-icon.up-icon,
        :host .heading-row-header .local-headings.no-order iron-icon.down-icon {
          display: none;
        }
        :host .heading-row-header .local-headings.right {
          text-align: right;
        }
        :host .heading-row-header .local-headings.center {
          text-align: center;
        }
        :host .heading-row-header .local-headings .heading {
          display: inline-block;
          vertical-align: middle;
          line-height: normal;
          font-size: 12px;
        }
        :host .heading-row-header .local-headings .group-heading {
          position: relative;
          display: block;
          height: 40%;
        }
        :host .heading-row-header .local-headings .group-heading span {
          position: absolute;
          top: 50%;
          left: 0;
          margin-top: -7px;
        }
        :host .heading-row-header .local-headings iron-icon {
          display: none;
          width: 16px;
          height: 16px;
        }
        :host .heading-row-header .group-local-headings {
          white-space: nowrap;
        }
        :host .heading-row-header .group-local-headings .group-local-heading {
          line-height: normal;
          height: auto;
          vertical-align: top;
          font-size: 0;
          padding-right: 12px;
        }
        :host([no-ordered]) iron-icon {
          display: none !important;
        }
        :host([no-ordered]) .local-headings:hover {
          cursor: auto;
        }
        :host([no-ordered]) .local-headings:hover .heading {
          color: inherit;
        }
        :host([no-additional]) {
          padding: 0 16px 0 24px !important;
        }
      </style>

      <div class="heading-row-header clearfix" style$="padding-right: [[paddingRight]];">
        <template is="dom-repeat" items="[[data]]">
          <template is="dom-if" if="[[!item.group]]">
            <div
              class$="local-headings w[[item.size]] [[item.align]] [[item.class]]"
              ordered$="{{item.ordered}}"
              on-tap="_changeOrder"
            >
              <template is="dom-if" if="[[!item.htmlLabel]]">
                <span class="textsec heading">[[getHeadingLabel(basePermissionPath, item)]]</span>
              </template>

              <template is="dom-if" if="[[item.htmlLabel]]">
                <span class="textsec heading"><insert-html html="[[item.htmlLabel]]"></insert-html></span>
              </template>

              <iron-icon class="down-icon" icon="icons:arrow-downward"> </iron-icon>

              <iron-icon class="up-icon" icon="icons:arrow-upward"> </iron-icon>
            </div>
          </template>

          <template is="dom-if" if="[[item.group]]">
            <div
              class$="local-headings group-local-headings w[[item.size]] [[item.align]]"
              ordered$="{{item.ordered}}"
              on-tap="_changeOrder"
            >
              <div class$="group-heading textsec heading [[item.align]]">
                <span>[[item.label]]</span>
              </div>

              <template is="dom-repeat" items="[[item.columns]]" as="groupColumn">
                <div
                  class$="local-headings group-local-heading w[[groupColumn.size]] [[groupColumn.align]]"
                  ordered$="{{groupColumn.ordered}}"
                  on-tap="_changeOrder"
                >
                  <span class="textsec heading">[[getHeadingLabel(basePermissionPath, groupColumn)]]</span>

                  <iron-icon class="down-icon" icon="icons:arrow-downward"> </iron-icon>

                  <iron-icon class="up-icon" icon="icons:arrow-upward"> </iron-icon>
                </div>
              </template>
            </div>
          </template>
        </template>
      </div>
    `;
  }
  static get observers() {
    return ['_setRightPadding(data.*)'];
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  basePermissionPath = '';

  @property({type: String, notify: true})
  orderBy!: string;

  @property({type: Boolean})
  noOrdered!: boolean;

  @property({type: Boolean})
  noAdditional!: boolean;

  _setRightPadding() {
    if (!this.data) {
      return;
    }
    let rightPadding = 0;
    let padding;

    this.data.forEach((heading) => {
      if (typeof heading.size === 'string') {
        padding = parseInt(heading.size, 10) || 0;
        rightPadding += padding;
      }
    });

    (this as any).paddingRight = `${rightPadding}px`;
  }

  _changeOrder(event) {
    if (this.noOrdered) {
      return;
    }

    const item = get(event, 'model.item');
    if (!item || (item.class && ~item.class.indexOf('no-order'))) {
      return;
    }
    const newOrderName = item.name;
    let currentOrderName = this.orderBy || '';
    let direction = '-';

    if (currentOrderName.startsWith('-')) {
      direction = '';
      currentOrderName = currentOrderName.slice(1);
    }

    if (newOrderName !== currentOrderName) {
      direction = '';
    }

    this.orderBy = `${direction}${newOrderName}`;
  }
}
window.customElements.define('list-header', ListHeader);
