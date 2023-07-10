import {LitElement, customElement, html, property} from 'lit-element';
import {repeat} from 'lit-html/directives/repeat';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/polymer/lib/elements/dom-if';

import {IronCollapseElement} from '@polymer/iron-collapse/iron-collapse.js';
declare const dayjs: any;
import {GenericObject} from '../../../../types/global';

import LocalizationMixin from '../../../mixins/localization-mixin-lit';

import {sharedStyles} from '../../../styles/shared-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import '../../insert-html/insert-html';
import {getChoices} from '../../../mixins/permission-controller';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizationMixin
 */
@customElement('list-element')
export class ListElement extends LocalizationMixin(LitElement) {
  render() {
    return html`
      ${sharedStyles} ${moduleStyles} ${tabInputsStyles}
      <style>
        *[hidden] {
          display: none !important;
        }
        :host {
          display: block;
          border-bottom: 1px solid var(--dark-divider-color, rgba(0, 0, 0, 0.12));
        }
        :host .question-title {
          font-weight: 500;
          font-size: 14px !important;
          letter-spacing: 0.5px;
        }
        :host .partner-data {
          display: table-cell;
          vertical-align: middle;
          width: 100%;
          box-sizing: border-box;
          white-space: nowrap;
          font-size: 0;
          overflow: inherit;
        }
        :host .partner-data .col-data {
          display: inline-block;
          overflow: hidden;
          font-size: 13px;
          text-overflow: ellipsis;
          padding-right: 16px;
          padding-left: 1px;
          box-sizing: border-box;
          vertical-align: var(--multiline-align, middle);
        }
        :host .partner-data .col-data.caps {
          text-transform: capitalize;
        }
        :host .partner-data .col-data:not(.truncate) {
          padding-right: 0;
          overflow: visible;
        }
        :host .partner-data .col-data .truncate {
          white-space: nowrap;
        }
        :host .partner-data .col-data .additional {
          color: var(--dark-secondary-text-color);
          font-size: 11px;
        }
        :host .partner-data .col-data.right {
          text-align: right;
        }
        :host .partner-data .col-data.center {
          text-align: center;
        }
        :host .partner-data a.col-data {
          color: var(--primary-color);
          font-weight: 500;
          cursor: pointer;
        }
        :host .partner-data a.col-data[href='#'] {
          cursor: default;
          font-weight: 400;
          color: initial;
          pointer-events: none;
        }
        :host .partner-data a.col-data iron-icon {
          display: none;
          width: 16px;
          color: var(--primary-color);
        }
        :host .partner-data a.col-data.with-icon iron-icon {
          display: inline-flex;
        }
        :host .partner-data .hover-icons-block {
          position: absolute;
          top: 0;
          right: 14px;
          bottom: 0;
          line-height: 48px;
          opacity: 0;
          background-color: var(--hover-block-bg-color, #eee);
        }
        :host .partner-data:hover .hover-icons-block {
          opacity: 1;
        }
        :host .partners-data-details {
          position: relative;
          display: block;
          width: 100%;
        }
        :host .partners-data-details .row-details-content {
          float: left;
          box-sizing: border-box;
          padding-right: 0;
          padding-bottom: 20px;
          vertical-align: top;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        :host .partners-data-details .row-details-content .rdc-title {
          display: inline-block;
          width: 100%;
          color: rgba(0, 0, 0, 0.54);
          font-weight: 500;
          font-size: 13px;
          margin-bottom: 10px;
        }
        :host .partners-data-details .row-details-content .data {
          font-size: 13px;
        }
        :host([hover]) div[list-item] {
          background-color: #eee;
        }
        div[list-item] {
          position: relative;
          display: table;
          table-layout: fixed;
          width: 100%;
          height: 48px;
          min-height: 48px;
          font-size: 13px;
          color: var(--gray-dark, rgba(0, 0, 0, 0.87));
          background-color: var(--primary-background-color, #fff);
          padding: 0 14px 0 72px !important;
          box-sizing: border-box;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        :host([no-additional]) div[list-item] {
          padding: 0 16px 0 24px !important;
        }
        :host([multiline]) .partner-data .col-data {
          padding-top: 5px;
          padding-bottom: 5px;
        }
        :host([multiline]) .partner-data .col-data .truncate {
          white-space: normal;
        }
        :host([multiline]) paper-tooltip {
          display: none;
        }
        :host([no-hover]) div[list-item]:hover {
          background-color: initial;
        }
        #iconWrapper {
          position: absolute;
          top: 50%;
          margin-top: -24px;
          padding: 0 24px;
          margin-left: -72px;
          line-height: 48px;
          cursor: pointer;
        }
        iron-icon {
          color: var(--dark-icon-color, rgba(0, 0, 0, 0.54));
        }
        #collapse-wrapper {
          padding: 14px 24px 4px 24px;
          background-color: #eee;
          border-top: 1px solid var(--dark-divider-color, rgba(0, 0, 0, 0.12));
        }
        .truncate div {
          overflow: hidden;
        }
      </style>

      <div list-item id="wrapper">
        ${this.showCollapse
          ? html`<div id="iconWrapper">
              <iron-icon
                id="more"
                icon="expand-more"
                ?hidden="${this.detailsOpened}"
                @click="${this._toggleRowDetails}"
              >
              </iron-icon>

              <iron-icon
                id="less"
                icon="expand-less"
                ?hidden="${!this.detailsOpened}"
                @click="${this._toggleRowDetails}"
              >
              </iron-icon>
            </div>`
          : ``}
        <div class="partner-data" style="padding-right: ${this.paddingRight}">
          ${repeat(
            this.headings || [],
            (item: any) => html`

              ${
                this._isOneOfType(item, 'link')
                  ? html`<a
                class=col-data w${`${item.size} ${item.align} ${item.class}`} truncate"
                href="${this._getLink(item.link, this.data)}"
                target="${item.target}"
              >
                <span class="truncate">
                  ${
                    this._getValue(item, this.data)
                      ? html`${this._getValue(item, this.data)} <iron-icon icon="icons:launch"></iron-icon>`
                      : html`<span class="">–</span>`
                  }
                </span>
              </a>`
                  : ``
              }

              ${
                !this._isOneOfType(item, 'link', 'checkbox', 'icon', 'custom', 'html')
                  ? html` <span class="col-data w${`${item.size} ${item.align} ${item.class}`} truncate">
                      <span class="${this.getCellClass(item)}">
                        ${this._getValue(item, this.data) || '<span class="">–</span>'}
                        ${item.additional
                          ? html`<span class="additional">(${this._getAdditionalValue(item)})</span>`
                          : ``}
                      </span>
                    </span>`
                  : ``
              }

              ${
                this._isOneOfType(item, 'html')
                  ? html`<span class="col-data w${`${item.size} ${item.align} ${item.class}`} truncate">
                      <span class="truncate">
                        <insert-html .html="${this._getValue(item, this.data)}"></insert-html>
                      </span>
                    </span>`
                  : ``
              }

              ${
                this._isOneOfType(item, 'checkbox')
                  ? html`<span class="col-data w${`${item.size} ${item.align} ${item.class}`} truncate">
                      ${this._emtyObj(this.data)
                        ? html`<slot name="checkbox">
                            <paper-checkbox ?checked="${this._getValue(item, this.data, 'bool')}" label="">
                            </paper-checkbox>
                          </slot>`
                        : html`<span class="">–</span>`}
                    </span>`
                  : ``
              }

              ${
                this._isOneOfType(item, 'icon')
                  ? html`<span class="col-data w${`${item.size} ${item.align} ${item.class}`} truncate">
                      ${this._emtyObj(this.data) ? html`<slot name="icon"> </slot>` : html`<span class="">–</span>`}
                    </span>`
                  : ``
              }

              ${
                this._isOneOfType(item, 'custom')
                  ? html`<span class="col-data w${`${item.size} ${item.align} ${item.class}`} truncate">
                      ${this._hasProperty(this.data, item.property, item.doNotHide)
                        ? html`<slot name="custom"> </slot>`
                        : html`<span class="">–</span>`}
                    </span>`
                  : ``
              }


            <span class="hover-icons-block">
              <slot name="hover"></slot>
            </span>
        </div>
        `
          )}
        </div>

        ${this.showCollapse ? html`` : ``}

        <iron-collapse id="details" ?opened="${this.detailsOpened}" ?no-animation="${this.noAnimation}">
          <slot name="custom-details">
            <div id="collapse-wrapper">
              <div class="partners-data-details group">
                ${this.details.map(
                  (item) => html`<div class="row-details-content w${item.size}">
                    <span class="rdc-title">${this.getHeadingLabel(this.basePermissionPath, item)}</span>
                    ${this._getValue(item, this.data) || html`<span class="">–</span>`}
                  </div>`
                )}
              </div>
            </div>
          </slot>
        </iron-collapse>
      </div>
    `;
  }
  static get observers() {
    return ['_setRightPadding(headings.*)'];
  }

  @property({type: String})
  basePermissionPath = '';

  @property({type: Object})
  itemValues: GenericObject = {};

  @property({type: Array})
  details: any[] = [];

  @property({type: Boolean})
  hasCollapse = false;

  @property({type: Boolean})
  showCollapse!: boolean;

  @property({type: Object})
  data!: GenericObject;

  @property({type: Number})
  itemIndex!: number;

  @property({type: Boolean})
  multiline = false;

  @property({type: Boolean})
  noHover = false;

  @property({type: Boolean, reflect: true})
  hover!: boolean;

  @property({type: Array})
  headings!: any[];

  @property({type: String})
  paddingRight = '';

  @property({type: Boolean})
  detailsOpened = false;

  @property({type: Boolean})
  noAnimation = true;

  public connectedCallback() {
    super.connectedCallback();
    this._initListeners();
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  private _initListeners(): void {
    this._setHover = this._setHover.bind(this);
    this._resetHover = this._resetHover.bind(this);

    this.addEventListener('mouseover', this._setHover);
    this.addEventListener('mouseleave', this._resetHover);
  }

  private _removeListeners(): void {
    this.removeEventListener('mouseover', this._setHover);
    this.removeEventListener('mouseleave', this._resetHover);
  }

  updated(changedProperties) {
    super.updated(changedProperties);

    if (changedProperties.has('details') || changedProperties.has('hasCollapse')) {
      this._computeShowCollapse(this.details, this.hasCollapse);
    }
    if (changedProperties.has('basePermissionPath')) {
      this._setItemValues(this.basePermissionPath);
    }
  }

  _setHover() {
    this.hover = true;
  }

  _resetHover() {
    this.hover = false;
  }

  _setRightPadding() {
    if (!this.headings) {
      return;
    }
    let rightPadding = 0;
    let padding;

    this.headings.forEach((heading) => {
      if (typeof heading.size === 'string') {
        padding = parseInt(heading.size, 10) || 0;
        rightPadding += padding;
      }
    });

    this.paddingRight = `${rightPadding}px`;
  }

  _computeShowCollapse(details: any[], hasCollapse: boolean) {
    this.showCollapse = details.length > 0 && hasCollapse;
  }

  _toggleRowDetails() {
    (this.shadowRoot!.querySelector('#details') as IronCollapseElement).toggle();
    this.detailsOpened = !this.detailsOpened;
  }

  _isOneOfType(item: GenericObject, ...theRestOfArgs) {
    if (!item) {
      return false;
    }

    const types = theRestOfArgs || [];

    return !!types.find((type) => {
      return !!item[type];
    });
  }

  _getValue(item: GenericObject, _data?: GenericObject, bool?: any) {
    let value;

    if (!item.path) {
      value = this.data[item.name];
    } else {
      value = this.data[item.path];
    }

    if (item.name === 'engagement_type' || item.name === 'status') {
      value = this._refactorValue(item.name, value);
    } else if (item.name === 'date') {
      value = this._refactorTime(value);
    } else if (item.name === 'currency') {
      value = this._refactorCurrency(value);
    } else if (item.name === 'percents') {
      value = this._refactorPercents(value);
    } else if (item.name === 'finding' || item.name === 'autoNumber') {
      value = this._refactorFindingNumber();
    }

    // if (typeof value === 'string') { value = value.trim(); }
    if (bool) {
      value = !!value;
    } else if (!value && value !== 0) {
      return false;
    }

    return value;
  }

  _refactorValue(type, value) {
    const values = this.itemValues[type];
    if (values) {
      return values[value];
    }
  }

  _refactorTime(value, format = 'DD MMM YYYY') {
    if (!value) {
      return;
    }

    const date = new Date(value);
    if (date.toString() !== 'Invalid Date') {
      return dayjs.utc(date).format(format);
    }
  }

  _refactorCurrency(value) {
    if ((!value || isNaN(+value)) && value !== 0) {
      return;
    }
    return (+value).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
  }

  _refactorPercents(value) {
    const regexp = /[\d]+.[\d]{2}/;
    return regexp.test(value) ? `${value}%` : null;
  }

  _refactorBoolean(value) {
    return value ? `&#10003;` : '–';
  }

  _refactorFindingNumber() {
    const value = this.itemIndex;
    if (!value && value !== 0) {
      return;
    }
    return `000${value + 1}`;
  }

  _getAdditionalValue(item: GenericObject) {
    if (!item.additional) {
      return;
    }

    const additional = item.additional;
    let value = this._getValue(additional);
    const type = additional.type;

    if (type === 'date') {
      value = this._refactorTime(value);
    }

    return value || '–';
  }

  _getStatus(synced) {
    if (synced) {
      return 'Synced from VISION';
    }
  }

  _getLink(pattern, data: GenericObject) {
    if (typeof pattern !== 'string') {
      return '#';
    }

    const link = pattern
      .replace('*ap_link*', data.url)
      .replace('*data_id*', data.id)
      .replace('*engagement_type*', this._refactorValue('link_type', data.engagement_type));

    return link.indexOf('undefined') === -1 ? link : '#';
  }

  getCellClass(item: GenericObject) {
    return item.customCss ? item.customCss : 'truncate';
  }

  _emtyObj(data) {
    return data && !data.empty;
  }

  _hasProperty(data, property, doNotHide) {
    return data && (doNotHide || (property && this.data[property]));
  }

  _setItemValues(base) {
    if (!base) {
      return;
    }
    if (!this.itemValues) {
      this.itemValues = {};
    }
    this.setField(getChoices(`${base}.engagement_type`), 'engagement_type');
    this.setField(getChoices(`${base}.status`), 'status');
    this.itemValues.link_type = {
      ma: 'micro-assessments',
      audit: 'audits',
      sc: 'spot-checks',
      sa: 'special-audits'
    };
  }

  setField(choices, field) {
    if (!choices || !field) {
      return;
    }

    const data = {};
    choices.forEach((choice) => {
      data[choice.value] = choice.display_name;
    });

    this.itemValues[field] = data;
  }
}
