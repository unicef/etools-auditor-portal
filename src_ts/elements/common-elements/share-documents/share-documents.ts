import {PolymerElement, html} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import '../list-tab-elements/list-header/list-header';
import '../simple-list-item/simple-list-item';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';

import {GenericObject} from '../../../types/global';
import clone from 'lodash-es/clone';
import remove from 'lodash-es/remove';
import uniqBy from 'lodash-es/uniqBy';
import isEmpty from 'lodash-es/isEmpty';
import {moduleStyles} from '../../styles-elements/module-styles';
import {tabInputsStyles} from '../../styles-elements/tab-inputs-styles';

import CommonMethodsMixin from '../../app-mixins/common-methods-mixin';
import {getEndpoint} from '../../app-config/endpoints-controller';
import EtoolsAjaxRequestMixin from '@unicef-polymer/etools-ajax/etools-ajax-request-mixin';
import TableElementsMixin from '../../app-mixins/table-elements-mixin';
import {getStaticData} from '../../app-mixins/static-data-controller';
import {fireEvent} from '../../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 */
class ShareDocuments extends
  EtoolsAjaxRequestMixin(
    TableElementsMixin(CommonMethodsMixin(PolymerElement))) {

  static get template() {
    return html`

      ${moduleStyles} ${tabInputsStyles}
      <style>
          :host {
            overflow: hidden;
          }
          :host .modal-pad, :host .subtitle {
            padding: 16px 24px;
            display: block;
          }
          :host .subtitle {
            background-color: #eee;
          }
          :host etools-dropdown{
            padding: 0 24px;
          }
          .content-wrapper {
            padding-bottom: 8px;
          }
          list-header {
            background-color: var(--hover-block-bg-color, #f3eee9);
            padding-left: 56px;
            --list-header-custom-style: {
                height: 48px;
                line-height: 48px;
                flex-shrink: 0;
            }
          }
          simple-list-item {
            --hover-style: {
                background-color: transparent;
            };
          }
          .right {
            text-align: right;
          }
          .row-data > * {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            padding-right: 10px;
          }
          .row-data > paper-checkbox {
            padding-right: 14px;
          }
          a {
            padding-left: 5px;
            color: #09f;
            text-decoration: none;
          }
          .repeatable-item-container.list-items {
            padding: 0;
            max-height: 365px;
            overflow: auto;
          }
          .doc-type {
            flex: 0 0 calc(27% - -2px);
          }
          .document-link {
            flex: 0 0 33%;
          }
          .pd {
            flex: 0 0 14%;
          }

      </style>

      <div>
        <div class="subtitle" without-line>
          Showing documents for [[partnerName]]
        </div>

        <div class="row-h repeatable-item-container" without-line>
          <div class="layout horizontal">
            <etools-dropdown class="validate-input w40"
                    selected="{{selectedFiletype}}"
                    label="[[getLabel('file_type', basePermissionPath)]]"
                    placeholder="Select"
                    options="[[fileTypes]]"
                    empty-value
                    dynamic-align>
            </etools-dropdown>
          </div>
        </div>
        <div class="layout vertical">
          <list-header data="[[headingColumns]]"
                      order-by="{{orderBy}}"
                      on-order-changed="_orderChanged"
                      base-permission-path="[[dataBasePath]]">
          </list-header>
          <template is="dom-if" if="[[!attachmentsList.length]]">
            <span class="modal-pad">There are no attachments for this partner. </span>
          </template>
          <template is="dom-if" if="[[attachmentsList.length]]">
            <div class="row-h repeatable-item-container list-items">

              <template is="dom-repeat"
                        items="[[attachmentsList]]">
                <simple-list-item>
                  <div class="row-data">
                    <paper-checkbox on-tap="_toggleChecked">
                    </paper-checkbox>
                    <span class="pd">[[_getReferenceNumber(item.agreement_reference_number)]]
                      <paper-tooltip>[[_getReferenceNumber(item.agreement_reference_number)]]</paper-tooltip>
                    </span>
                    <span class="doc-type">[[item.file_type]]</span>
                    <div class="document-link">
                      <iron-icon icon="icons:attachment"
                                class="download-icon">
                      </iron-icon>
                      <a href$="[[item.file_link]]"
                              class="truncate"
                              target="_blank">[[item.filename]]
                            </a>
                      <paper-tooltip>[[item.filename]]</paper-tooltip>
                    </div>
                    <span class="w12">[[item.created]]</span>
                  </div>

                </simple-list-item>
              </template>
            </div>
          </template>
        </div>
      </div>
    </div>
      `;
  }

  @property({type: Boolean, notify: true, reflectToAttribute: true})
  shareParams!: boolean;

  @property({type: String, observer: '_handlePartnerChanged'})
  partnerName!: string;

  @property({type: String, observer: '_filterByFileType'})
  selectedFiletype: string = '';

  @property({type: Array})
  selectedAttachments: GenericObject[] = [];

  @property({type: Array, computed: '_getFileTypesFromStatic(partnerName)', notify: true})
  fileTypes!: GenericObject[];

  @property({type: Array})
  headingColumns: GenericObject[] = [
    {
      'size': 18,
      'label': 'Agreement Ref',
      'name': 'ref',
      'ordered': 'asc'
    },
    {
      'size': 30,
      'label': 'Document Type',
      'noOrder': true,
      'class': 'no-order'
    },
    {
      'size': 28,
      'label': 'Document',
      'noOrder': true,
      'class': 'no-order'
    },
    {
      'size': 20,
      'label': 'Date Uploaded',
      'noOrder': true,
      'class': 'no-order right'
    }
  ];

  @property({type: Boolean, reflectToAttribute: true, notify: true})
  confirmDisabled!: boolean;

  @property({type: Array})
  attachmentsList!: GenericObject;

  @property({type: Array})
  originalList!: GenericObject;

  _handlePartnerChanged(partnerName) {
    if (!partnerName) {return;}
    this._getPartnerAttachments(partnerName);
  }

  _getPartnerAttachments(partner) {
    const options = {
      endpoint: getEndpoint('globalAttachments'),
      params: {
        partner: partner,
        source: 'Partnership Management Portal'
      }
    };

    this.sendRequest(options)
      .then((resp) => {
        this.set('attachmentsList', resp);
        this.set('originalList', resp);
      })
      .catch(err => fireEvent(this, 'toast', {text: `Error fetching documents for ${partner}: ${err}`}));

  }

  _getFileTypesFromStatic() {
    const fileTypes = getStaticData('staticDropdown').attachment_types
      .filter(val => !isEmpty(val))
      .map(
        typeStr => ({label: typeStr, value: typeStr})
      );
    const uniques = uniqBy(fileTypes, 'label');
    return uniques;

  }

  _getReferenceNumber(refNumber) {
    return refNumber || 'n/a';
  }

  _toggleChecked(e) {
    const {id} = e.model.item;
    const isChecked = (e.target as PaperCheckboxElement).checked;
    if (isChecked) {
      this.push('selectedAttachments', {attachment: id});
    } else {
      const cloned = clone(this.selectedAttachments);
      remove(cloned, {attachment: id});
      this.set('selectedAttachments', cloned);
    }

    this.updateShareParams();
  }

  updateShareParams() {
    this.set('shareParams', {
      attachments: this.selectedAttachments
    });
    if (this.selectedAttachments.length) {
      this.set('confirmDisabled', false);
    } else {
      this.set('confirmDisabled', true);
    }
  }

  _orderChanged({detail}) {
    const newOrder = detail.item.ordered === 'desc' ? 'asc' : 'desc';
    this.set(`headingColumns.${detail.index}.ordered`, newOrder);
    this._handleSort(newOrder);
  }

  _handleSort(sortOrder) {
    const sorted = this.attachmentsList.slice(0).sort((a, b) => {
      if (a.agreement_reference_number > b.agreement_reference_number) {
        return sortOrder === 'asc' ? -1 : 1;
      } else if (a.agreement_reference_number < b.agreement_reference_number) {
        return sortOrder === 'asc' ? 1 : -1;
      } else {
        return 0;
      }
    });
    this.set('attachmentsList', sorted);
  }

  _filterByFileType(selectedFileType) {
    if (selectedFileType === '') {return;}
    if (selectedFileType === null) {
      // resets list when doc-type filter is cleared
      this.set('attachmentsList', this.originalList);
      return;
    }
    const file_type = selectedFileType.toLowerCase();
    const newFilteredList = this.originalList.filter(row => row.file_type.toLowerCase() === file_type);
    this.set('attachmentsList', newFilteredList);
  }


}
window.customElements.define('share-documents', ShareDocuments);
export {ShareDocuments as ShareDocumentsEl};
