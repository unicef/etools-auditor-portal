import {PolymerElement, html} from '@polymer/polymer';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/iron-collapse/iron-collapse.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import {IronCollapseElement} from '@polymer/iron-collapse/iron-collapse.js';
declare const dayjs: any;
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';

import LocalizationMixin from '../../../app-mixins/localization-mixin';

import {sharedStyles} from '../../../styles-elements/shared-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import '../../insert-html/insert-html';
import {getChoices} from '../../../app-mixins/permission-controller';
/**
 * @polymer
 * @customElement
 * @appliesMixin LocalizationMixin
 */
class ListElement extends LocalizationMixin(PolymerElement) {
  static get template() {
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
          padding-right: 10px;
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
          color: var(--module-primary);
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
          color: var(--module-primary);
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
        :host div[list-item] {
          overflow: var(--list-item-overflow, hidden);
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
      </style>

      <div list-item id="wrapper">
        <template is="dom-if" if="[[showCollapse]]">
          <div id="iconWrapper">
            <iron-icon id="more" icon="expand-more" hidden$="[[detailsOpened]]" on-tap="_toggleRowDetails"> </iron-icon>

            <iron-icon id="less" icon="expand-less" hidden$="[[!detailsOpened]]" on-tap="_toggleRowDetails">
            </iron-icon>
          </div>
        </template>
        <div class="partner-data" style$="padding-right: [[paddingRight]];">
          <template is="dom-repeat" items="[[headings]]">
            <template is="dom-if" if="[[_isOneOfType(item, 'link')]]">
              <a
                class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate"
                href$="[[_getLink(item.link, data)]]"
                target="[[item.target]]"
              >
                <span class="truncate">
                  <template is="dom-if" if="[[_getValue(item, data)]]">
                    [[_getValue(item, data)]] <iron-icon icon="icons:launch"></iron-icon>
                    <paper-tooltip offset="0">[[_getValue(item, data)]]</paper-tooltip>
                  </template>

                  <template is="dom-if" if="[[!_getValue(item, data)]]">
                    <span class="">–</span>
                  </template>
                </span>
              </a>
            </template>

            <template is="dom-if" if="[[!_isOneOfType(item, 'link', 'checkbox', 'icon', 'custom', 'html')]]" restamp>
              <span class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate">
                <span class="truncate">
                  <template is="dom-if" if="[[_getValue(item, data)]]">
                    [[_getValue(item, data)]]
                    <paper-tooltip offset="0">[[_getValue(item, data)]]</paper-tooltip>
                  </template>

                  <template is="dom-if" if="[[!_getValue(item, data)]]">
                    <span class="">–</span>
                  </template>

                  <template is="dom-if" if="[[item.additional]]">
                    <span class="additional">([[_getAdditionalValue(item, data)]])</span>
                  </template>
                </span>
              </span>
            </template>

            <template is="dom-if" if="[[_isOneOfType(item, 'html')]]">
              <span class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate">
                <span class="truncate">
                  <insert-html html="[[_getValue(item, data)]]"></insert-html>
                </span>
              </span>
            </template>

            <template is="dom-if" if="[[_isOneOfType(item, 'checkbox')]]">
              <span class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate">
                <template is="dom-if" if="{{_emtyObj(data)}}">
                  <slot name="checkbox">
                    <paper-checkbox checked="{{_getValue(item, data, 'bool')}}" label=""> </paper-checkbox>
                  </slot>
                </template>

                <template is="dom-if" if="{{!_emtyObj(data)}}">
                  <span class="">–</span>
                </template>
              </span>
            </template>

            <template is="dom-if" if="[[_isOneOfType(item, 'icon')]]">
              <span class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate">
                <template is="dom-if" if="{{_emtyObj(data)}}">
                  <slot name="icon"> </slot>
                </template>

                <template is="dom-if" if="{{!_emtyObj(data)}}">
                  <span class="">–</span>
                </template>
              </span>
            </template>

            <template is="dom-if" if="[[_isOneOfType(item, 'custom')]]">
              <span class$="col-data w[[item.size]] [[item.align]] [[item.class]] truncate">
                <template is="dom-if" if="{{_hasProperty(data, item.property, item.doNotHide)}}" restamp>
                  <slot name="custom"> </slot>
                </template>

                <template is="dom-if" if="{{!_hasProperty(data, item.property, item.doNotHide)}}">
                  <span class="">–</span>
                </template>
              </span>
            </template>

            <span class="hover-icons-block">
              <slot name="hover"></slot>
            </span>
          </template>
        </div>
      </div>

      <template is="dom-if" if="[[showCollapse]]">
        <iron-collapse id="details" opened="{{detailsOpened}}" no-animation="[[noAnimation]]">
          <slot name="custom-details">
            <div id="collapse-wrapper">
              <div class="partners-data-details group">
                <template is="dom-repeat" items="[[details]]">
                  <div class$="row-details-content w[[item.size]]">
                    <span class="rdc-title">[[getHeadingLabel(basePermissionPath, item)]]</span>

                    <template is="dom-if" if="[[_getValue(item, data)]]">
                      [[_getValue(item, data)]]
                    </template>

                    <template is="dom-if" if="[[!_getValue(item, data)]]">
                      <span class="">–</span>
                    </template>
                  </div>
                </template>
              </div>
            </div>
          </slot>
        </iron-collapse>
      </template>
    `;
  }
  static get observers() {
    return ['_setRightPadding(headings.*)'];
  }

  @property({type: String, observer: '_setItemValues'})
  basePermissionPath = '';

  @property({type: Object})
  itemValues: GenericObject = {};

  @property({type: Array})
  details: any[] = [];

  @property({type: Boolean})
  hasCollapse = false;

  @property({type: Boolean, computed: '_computeShowCollapse(details, hasCollapse)'})
  showCollapse: any[] = [];

  @property({type: Object, notify: true})
  data!: GenericObject;

  @property({type: Number})
  itemIndex!: number;

  @property({type: Boolean})
  multiline = false;

  @property({type: Boolean})
  noHover = false;

  @property({type: Boolean, reflectToAttribute: true})
  hover!: boolean;

  @property({type: Array})
  headings!: any[];

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

    (this as any).paddingRight = `${rightPadding}px`;
  }

  _computeShowCollapse(details: any[], hasCollapse: boolean) {
    return details.length > 0 && hasCollapse;
  }

  _toggleRowDetails() {
    (this.shadowRoot!.querySelector('#details') as IronCollapseElement).toggle();
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
      value = this.get('data.' + item.name);
    } else {
      value = this.get('data.' + item.path);
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

  _getLink(pattern) {
    if (typeof pattern !== 'string') {
      return '#';
    }

    const link = pattern
      .replace('*ap_link*', this.data.url)
      .replace('*data_id*', this.data.id)
      .replace('*engagement_type*', this._refactorValue('link_type', this.data.engagement_type));

    return link.indexOf('undefined') === -1 ? link : '#';
  }

  _emtyObj(data) {
    return data && !data.empty;
  }

  _hasProperty(data, property, doNotHide) {
    return data && (doNotHide || (property && this.get('data.' + property)));
  }

  _setItemValues(base) {
    if (!base) {
      return;
    }
    if (!this.get('itemValues')) {
      this.set('itemValues', {});
    }
    this.setField(getChoices(`${base}.engagement_type`), 'engagement_type');
    this.setField(getChoices(`${base}.status`), 'status');
    this.set('itemValues.link_type', {
      ma: 'micro-assessments',
      audit: 'audits',
      sc: 'spot-checks',
      sa: 'special-audits'
    });
  }

  setField(choices, field) {
    if (!choices || !field) {
      return;
    }

    const data = {};
    choices.forEach((choice) => {
      data[choice.value] = choice.display_name;
    });

    this.set(`itemValues.${field}`, data);
  }
}
window.customElements.define('list-element', ListElement);
