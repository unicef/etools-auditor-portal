import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {EtoolsCheckbox} from '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table.js';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {GenericObject} from '../../../types/global';
import clone from 'lodash-es/clone';
import remove from 'lodash-es/remove';
import uniqBy from 'lodash-es/uniqBy';
import isEmpty from 'lodash-es/isEmpty';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {moduleStyles} from '../../styles/module-styles';
import {tabInputsStyles} from '../../styles/tab-inputs-styles';

import CommonMethodsMixin from '../../mixins/common-methods-mixin';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {RootState, store} from '../../../redux/store';
import DateMixin from '../../mixins/date-mixin';
import {getEndpoint} from '../../config/endpoints-controller';
import TableElementsMixin from '../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';

/**
 * @LitElement
 * @customElement
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
@customElement('share-documents')
export class ShareDocuments extends connect(store)(TableElementsMixin(CommonMethodsMixin(DateMixin(LitElement)))) {
  static get styles() {
    return [moduleStyles, tabInputsStyles, layoutStyles];
  }
  render() {
    return html`
      ${sharedStyles}
      <style>
        ${dataTableStylesLit}
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
        .row-data > etools-checkbox {
          padding-right: 14px;
        }
        a {
          padding-left: 5px;
          color: #09f;
          text-decoration: none;
          line-height: 15px;
        }
        .repeatable-item-container.list-items {
          padding: 0;
          max-height: 365px;
          overflow: auto;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <div>
        <div class="subtitle" without-line>Showing documents for ${this.partnerName}</div>

        <div class="row-h repeatable-item-container" without-line>
          <div class="row">
            <etools-dropdown
              class="validate-input col-12 col-md-6"
              .selected="${this.selectedFiletype}"
              label="${this.getLabel('file_type', this.optionsData)}"
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

          <etools-data-table-header no-collapse no-title .lowResolutionLayout="${this.lowResolutionLayout}">
            <etools-data-table-column class="col-3">Agreement Ref</etools-data-table-column>
            <etools-data-table-column class="col-3">Document Type</etools-data-table-column>
            <etools-data-table-column class="col-4">Document</etools-data-table-column>
            <etools-data-table-column class="col-2">Date Uploaded</etools-data-table-column>
          </etools-data-table-header>
          ${
            !this.attachmentsList || !this.attachmentsList.length
              ? html`<span class="modal-pad">There are no attachments for this partner. </span>`
              : html` ${this.attachmentsList.map(
                  (item) => html` <etools-data-table-row
                    no-collapse
                    secondary-bg-on-hover
                    .lowResolutionLayout="${this.lowResolutionLayout}"
                  >
                    <div slot="row-data" class="layout-horizontal row-data">
                      <span class="col-data col-3" data-col-header-label="Agreement Ref">
                        <etools-checkbox @click="${(e) => this._toggleChecked(e, item.id)}"></etools-checkbox>
                        <span class="pd"> ${this._getReferenceNumber(item.agreement_reference_number)} </span>
                      </span>
                      <span class="col-data col-3" data-col-header-label="Document Type">${item.file_type}</span>
                      <span class="col-data col-4 wrap-text" data-col-header-label="Document">
                        <etools-icon name="attachment" class="download-icon"> </etools-icon>
                        <a href="${item.file_link}" title="${item.filename}" target="_blank">${item.filename} </a>
                      </span>
                      <span class="col-data col-2" data-col-header-label="Date Uploaded">
                        <span>${this.prettyDate(String(item.created), '') || '–'}</span>
                      </span>
                    </div>
                  </etools-data-table-row>`
                )}`
          }
          <etools-data-table-row no-collapse ?hidden="${this.attachmentsList?.length}">
            <div slot="row-data" class="layout-horizontal editable-row">
              <span class="col-data col-12">No records found.</span>
            </div>
          </etools-data-table-row>
        </div>
      </div>
    `;
  }

  @property({type: Object, reflect: true})
  shareParams!: GenericObject;

  @property({type: String})
  partnerName!: string;

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
    }
    if (changedProperties.has('selectedFiletype')) {
      this._filterByFileType(this.selectedFiletype);
    }
  }

  stateChanged(state: RootState) {
    if (state.commonData.loadedTimestamp && !this.fileTypes) {
      const fileTypes = (state.commonData.staticDropdown.attachment_types || [])
        .filter((val) => !isEmpty(val))
        .map((typeStr) => ({label: typeStr, value: typeStr}));
      this.fileTypes = uniqBy(fileTypes, 'label');
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

  _getReferenceNumber(refNumber) {
    return refNumber || 'n/a';
  }

  _toggleChecked(e, id) {
    const isChecked = (e.target as EtoolsCheckbox).checked;
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
