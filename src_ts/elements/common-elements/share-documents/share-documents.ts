import {LitElement, html, customElement, property, PropertyValues} from 'lit-element';
import '@polymer/paper-checkbox/paper-checkbox.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/polymer/lib/elements/dom-repeat';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import '@unicef-polymer/etools-data-table/etools-data-table.js';
import {GenericObject} from '../../../types/global';
import clone from 'lodash-es/clone';
import remove from 'lodash-es/remove';
import uniqBy from 'lodash-es/uniqBy';
import isEmpty from 'lodash-es/isEmpty';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {moduleStyles} from '../../styles/module-styles';
import {tabInputsStyles} from '../../styles/tab-inputs-styles-lit';

import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import DateMixin from '../../mixins/date-mixin';
import {getEndpoint} from '../../config/endpoints-controller';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {getStaticData} from '../../mixins/static-data-controller';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';

/**
 * @LitElement
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('share-documents')
export class ShareDocuments extends TableElementsMixin(CommonMethodsMixin(DateMixin(LitElement))) {
  static get styles() {
    return [moduleStyles, tabInputsStyles, gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          overflow: hidden;
        }
        :host .modal-pad,
        :host .subtitle {
          padding: 16px 24px;
          display: block;
        }
        :host .subtitle {
          background-color: #eee;
        }
        :host etools-dropdown {
          padding: 0 24px;
        }
        .content-wrapper {
          padding-bottom: 8px;
        }
        etools-data-table-header {
          --list-bg-color: #f3eee9;
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
      </style>

      <div>
        <div class="subtitle" without-line>Showing documents for ${this.partnerName}</div>

        <div class="row-h repeatable-item-container" without-line>
          <div class="layout-horizontal w50">
            <etools-dropdown
              class="validate-input"
              .selected="${this.selectedFiletype}"
              label="${this.getLabel('file_type', this.basePermissionPath)}"
              placeholder="Select"
              .options="${this.fileTypes}"
              option-label="label"
              option-value="value"
              trigger-value-change-event
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                this.selectedFiletype = detail.selectedItem ? detail.selectedItem.value : null;
                this._filterByFileType(this.selectedFiletype);
              }}"
              enable-none-option
              dynamic-align
            >
            </etools-dropdown>
          </div>
        </div>

          <etools-data-table-header no-collapse no-title>
            <etools-data-table-column class="col-3">Agreement Ref</etools-data-table-column>
            <etools-data-table-column class="col-3">Document Type</etools-data-table-column>
            <etools-data-table-column class="col-4">Document</etools-data-table-column>
            <etools-data-table-column class="col-2">Date Uploaded</etools-data-table-column>
          </etools-data-table-header>
          ${
            !this.attachmentsList || !this.attachmentsList.length
              ? html`<span class="modal-pad">There are no attachments for this partner. </span>`
              : html` ${this.attachmentsList.map(
                  (item) => html` <etools-data-table-row no-collapse>
                    <div slot="row-data" class="layout-horizontal row-data">
                      <span class="col-data col-3">
                        <paper-checkbox @tap="${(e) => this._toggleChecked(e, item.id)}"></paper-checkbox>
                        <span class="pd"> ${this._getReferenceNumber(item.agreement_reference_number)} </span>
                      </span>
                      <span class="col-data col-3">${item.file_type}</span>
                      <span class="col-data col-4 wrap-text">
                        <iron-icon icon="icons:attachment" class="download-icon"> </iron-icon>
                        <a href="${item.file_link}" class="truncate" title="${item.filename}" target="_blank"
                          >${item.filename}
                        </a>
                      </span>
                      <span class="col-data col-2">
                        <span>${this.prettyDate(String(item.created), '') || '-'}</span>
                      </span>
                    </div>
                  </etools-data-table-row>`
                )}`
          }
        </div>
      </div>
    `;
  }

  @property({type: Object, reflect: true})
  shareParams!: GenericObject;

  @property({type: String})
  partnerName!: string;

  @property({type: String})
  dataBasePath!: string;

  @property({type: String})
  selectedFiletype = '';

  @property({type: Array})
  selectedAttachments: GenericObject[] = [];

  @property({type: Array})
  fileTypes!: GenericObject[];

  @property({type: Array})
  attachmentsList!: GenericObject;

  @property({type: Array})
  originalList!: GenericObject;

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('partnerName')) {
      this._handlePartnerChanged(this.partnerName);
      this._setFileTypesFromStatic();
    }
    if (changedProperties.has('selectedFiletype')) {
      this._filterByFileType(this.selectedFiletype);
    }
  }

  _handlePartnerChanged(partnerName) {
    if (!partnerName) {
      return;
    }
    this._getPartnerAttachments(partnerName);
  }

  _getPartnerAttachments(partner) {
    const options = {
      endpoint: getEndpoint('globalAttachments'),
      params: {
        partner: partner
      }
    };

    sendRequest(options)
      .then((resp) => {
        this.attachmentsList = resp;
        this.originalList = resp;
      })
      .catch((err) => fireEvent(this, 'toast', {text: `Error fetching documents for ${partner}: ${err}`}));
  }

  _setFileTypesFromStatic() {
    const fileTypes = getStaticData('staticDropdown')
      .attachment_types.filter((val) => !isEmpty(val))
      .map((typeStr) => ({label: typeStr, value: typeStr}));
    this.fileTypes = uniqBy(fileTypes, 'label');
  }

  _getReferenceNumber(refNumber) {
    return refNumber || 'n/a';
  }

  _toggleChecked(e, id) {
    const isChecked = (e.target as PaperCheckboxElement).checked;
    if (isChecked) {
      this.selectedAttachments.push({attachment: id});
    } else {
      const cloned = clone(this.selectedAttachments);
      remove(cloned, {attachment: id});
      this.selectedAttachments = cloned;
    }

    this.updateShareParams();
  }

  updateShareParams() {
    this.shareParams = {attachments: this.selectedAttachments};
    fireEvent(this, 'share-params-changed', this.shareParams);
  }

  _filterByFileType(selectedFileType) {
    if (selectedFileType === '') {
      return;
    }
    if (selectedFileType === null) {
      // resets list when doc-type filter is cleared
      this.attachmentsList = this.originalList;
      return;
    }
    const file_type = selectedFileType.toLowerCase();
    const newFilteredList = this.originalList.filter((row) => row.file_type.toLowerCase() === file_type);
    this.attachmentsList = newFilteredList;
  }
}
