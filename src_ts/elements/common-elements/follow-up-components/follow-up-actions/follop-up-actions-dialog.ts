import {LitElement, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-checkbox/etools-checkbox';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-button/etools-button';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {GenericObject} from '../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../mixins/table-elements-mixin';
import DateMixin from '../../../mixins/date-mixin';
import {actionAllowed} from '../../../mixins/permission-controller';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import clone from 'lodash-es/clone';
import famEndpoints from '../../../config/endpoints';
import {AnyObject} from '@unicef-polymer/etools-types';
import isEmpty from 'lodash-es/isEmpty';
import every from 'lodash-es/every';
import isObject from 'lodash-es/isObject';
import get from 'lodash-es/get';

/**
 * @LitElement
 * @customElement
 * @appliesMixin DateMixin
 * @appliesMixin TableElementsMixin
 * @appliesMixin CommonMethodsMixin
 */
const AP_OTHER = 15;

@customElement('follow-up-actions-dialog')
export class FollowUpActionsDialog extends CommonMethodsMixin(TableElementsMixin(DateMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host .copy-warning {
          position: relative;
          margin-bottom: 10px;
          padding: 20px 24px;
          background-color: #ededee;
          color: #212121;
          font-size: var(--etools-font-size-15, 15px);
        }
        .checkbox-container etools-checkbox {
          padding-inline-start: 12px;
          padding-top: 14px;
        }
        .input-container etools-button {
          height: 34px;
          color: rgba(0, 0, 0, 0.54);
          font-weight: 500;
          z-index: 5;
          border: 1px solid rgba(0, 0, 0, 0.54);
          padding: 6px 13px;
        }
        .action-complete {
          padding-inline-start: 16px;
        }
        datepicker-lite::part(dp-calendar) {
          position: fixed;
        }
        .category-warning {
          color: #ea4022;
          margin-top: -6px;
          margin-left: 12px;
          font-size: var(--etools-font-size-12, 12px);
        }
        .flex-column {
          flex-direction: column;
        }
        </style>
        <etools-dialog no-padding keep-dialog-open size="md"
                keep-dialog-open
                dialog-title="${this.dialogTitle}"
                .okBtnText="${this.confirmBtnText}"
                .hideConfirmBtn="${!this.confirmBtnText}"
                ?show-spinner="${this.requestInProcess}"
                ?disable-confirm-btn="${this.requestInProcess}"
                @confirm-btn-clicked="${this._addActionPoint}"
                @close="${this._onClose}">
                  <div class="container-dialog">
                  ${
                    this.notTouched
                      ? html`<div class="copy-warning">It is required to change at least one of the fields below.</div>`
                      : ``
                  }
                    <div class="row">
                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- Partner -->
                            <etools-dropdown
                                    class="${this._setRequired('partner', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.selectedPartnerIdAux}"
                                    label="${this.getLabel('partner', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('partner', this.editedApBase, 'select')}"
                                    .options="${this.partners}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('partner', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('partner', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.partner}"
                                    .errorMessage="${this.errors.partner}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- PD/SSFA -->
                            <etools-dropdown
                                    class="${this._setRequired(
                                      'intervention',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.intervention?.id}"
                                    label="${this.getLabel('intervention', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText(
                                      'intervention',
                                      this.editedApBase,
                                      'select'
                                    )}"
                                    .options="${this.interventions}"
                                    option-label="title"
                                    option-value="id"
                                    ?required="${this._setRequired('intervention', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'intervention',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    ?invalid="${this.errors.intervention}"
                                    .errorMessage="${this.errors.intervention}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.intervention = detail.selectedItem?.id
                                        ? {id: detail.selectedItem?.id}
                                        : null)}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                        <div class="col-12 input-container col-lg-6 col-md-6 flex-column">
                            <!-- Category -->
                            <etools-dropdown
                                    class="${this._setRequired(
                                      'category',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.category}"
                                    label="${this.getLabel('category', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('category', this.editedApBase, 'select')}"
                                    .options="${this.categories}"
                                    option-label="display_name"
                                    option-value="value"
                                    ?required="${this._setRequired('category', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('category', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.category}"
                                    .errorMessage="${this.errors.category}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) => {
                                      this.showWarningCategoryMessage(detail.selectedItem?.value);
                                      this.editedItem.category = detail.selectedItem?.value;
                                    }}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                            <div class="category-warning" ?hidden="${!this.warningCategoryMessage}">
                              ${this.warningCategoryMessage}
                            </div>
                        </div>
                        <div class="col-12 input-container">
                            <!-- Description -->
                            <etools-textarea
                                    class="w100 validate-input ${this._setRequired('description', this.editedApBase)}"
                                    .value="${this.editedItem.description}"
                                    allowed-pattern="[\d\s]"
                                    label="${this.getLabel('description', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('description', this.editedApBase)}"
                                    ?required="${this._setRequired('description', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'description',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    max-rows="4"
                                    ?invalid="${this.errors.description}"
                                    .errorMessage="${this.errors.description}"
                                    @value-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem.description = detail.value)}"
                                    @focus="${this._resetFieldError}">
                            </etools-textarea>
                        </div>
                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- Assigned To -->

                            <etools-dropdown
                                    class="${this._setRequired(
                                      'assigned_to',
                                      this.editedApBase
                                    )} validate-input fua-person"
                                    .selected="${this.editedItem.assigned_to?.id}"
                                    label="${this.getLabel('assigned_to', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('assigned_to', this.editedApBase, 'select')}"
                                    .options="${this.users}"
                                    option-label="name"
                                    option-value="id"
                                    .loadDataMethod="${this.loadUsersDropdownOptions}"
                                    preserve-search-on-close
                                    ?required="${this._setRequired('assigned_to', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly(
                                      'assigned_to',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    ?invalid="${this.errors.assigned_to}"
                                    .errorMessage="${this.errors.assigned_to}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        assigned_to: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>

                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- Sections -->

                            <etools-dropdown
                                    class="${this._setRequired('section', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.editedItem.section?.id}"
                                    label="${this.getLabel('section', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('section', this.editedApBase, 'select')}"
                                    .options="${this.sections}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('section', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('section', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.section}"
                                    .errorMessage="${this.errors.section}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        section: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>
                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- Offices -->

                            <etools-dropdown
                                    class="${this._setRequired('office', this.editedApBase)} validate-input fua-person"
                                    .selected="${this.editedItem.office?.id}"
                                    label="${this.getLabel('office', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('office', this.editedApBase, 'select')}"
                                    .options="${this.offices}"
                                    option-label="name"
                                    option-value="id"
                                    ?required="${this._setRequired('office', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('office', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.office}"
                                    .errorMessage="${this.errors.office}"
                                    trigger-value-change-event
                                    @etools-selected-item-changed="${({detail}: CustomEvent) =>
                                      (this.editedItem = {
                                        ...this.editedItem,
                                        office: {id: detail.selectedItem?.id}
                                      })}"
                                    @focus="${this._resetFieldError}">
                            </etools-dropdown>
                        </div>

                        <div class="col-12 input-container col-lg-6 col-md-6">
                            <!-- Due Date -->
                            <datepicker-lite
                                    id="deadlineAction"
                                    class="${this._setRequired('due_date', this.editedApBase)} validate-input"
                                    .value="${this.editedItem.due_date}"
                                    label="${this.getLabel('due_date', this.editedApBase)}"
                                    placeholder="${this.getPlaceholderText('due_date', this.editedApBase, 'select')}"
                                    ?required="${this._setRequired('due_date', this.editedApBase)}"
                                    ?readonly="${this.isReadOnly('due_date', this.editedApBase, this.requestInProcess)}"
                                    ?invalid="${this.errors.due_date}"
                                    .errorMessage="${this.errors.due_date}"
                                    @focus="${this._resetFieldError}"
                                    selected-date-display-format="D MMM YYYY"
                                    fire-date-has-changed
                                    @date-has-changed="${(e: CustomEvent) => {
                                      this.editedItem.due_date = e.detail.date;
                                    }}"
                                    >
                            </datepicker-lite>
                        </div>
                        <!-- High Priority -->
                        <div class="input-container col-12 checkbox-container">
                            <etools-checkbox
                                    ?checked="${this.editedItem.high_priority}"
                                    ?disabled="${this.isReadOnly(
                                      'high_priority',
                                      this.editedApBase,
                                      this.requestInProcess
                                    )}"
                                    @sl-change="${(e: any) => (this.editedItem.high_priority = e.target.checked)}">
                                    This action point is high priority
                            </etools-checkbox>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-complete" ?hidden="${!this._allowComplete(this.editedApBase)}">
                <etools-button
                  variant="text"
                  class="neutral"
                >
                    <a href="${this.editedItem.url}" target="_blank">Go To action points to complete
                        <etools-icon name="launch"></etools-icon>
                    </a>
                </etools-button>
            </div>
          </div>
        </etools-dialog>
         `;
  }

  @property({type: Object})
  editedApBase!: AnyObject;

  @property({type: Array})
  users: GenericObject[] = [];

  @property({type: Array})
  sections: GenericObject[] = [];

  @property({type: Array})
  offices: GenericObject[] = [];

  @property({type: Array})
  categories!: GenericObject[];

  @property({type: Array})
  partners!: GenericObject[];

  @property({type: Array})
  interventions!: GenericObject[];

  @property({type: Object})
  opener!: GenericObject;

  @property({type: Object})
  originalEditedObj!: GenericObject;

  @property({type: Boolean})
  copyDialog!: boolean;

  @property({type: Boolean})
  notTouched = false;

  @property({type: Number})
  selectedPartnerIdAux!: number | null;

  @property({type: String})
  warningCategoryMessage!: string;

  @property({type: Object})
  loadUsersDropdownOptions?: (search: string, page: number, shownOptionsLimit: number) => void;

  set dialogData(data: any) {
    const {
      editedApBase,
      opener,
      editedItem,
      users,
      sections,
      offices,
      categories,
      partners,
      interventions,
      selectedPartnerIdAux,
      dialogTitle,
      confirmBtnText,
      copyDialog,
      originalEditedObj
    }: any = data;

    this.loadUsersDropdownOptions = this._loadUsersDropdownOptions.bind(this);
    this.opener = opener;
    this.editedItem = editedItem;
    this.editedApBase = editedApBase;
    this.users = users;
    this.sections = sections;
    this.offices = offices;
    this.categories = categories;
    this.partners = partners;
    this.interventions = interventions;
    this.selectedPartnerIdAux = selectedPartnerIdAux;
    this.dialogTitle = dialogTitle;
    this.confirmBtnText = confirmBtnText;
    this.copyDialog = copyDialog;
    this.originalEditedObj = originalEditedObj;
    if (this.copyDialog) {
      this.notTouched = true;
    }
  }

  _addActionPoint() {
    this._checkNotTouched(this.copyDialog, this.editedItem);
    if (!this.validate() || this.notTouched) {
      return;
    }
    this.requestInProcess = true;
    this.opener._addActionPoint(this.editedItem);
  }

  _loadUsersDropdownOptions(search: string, page: number, shownOptionsLimit: number) {
    const endpoint = clone(famEndpoints.users);
    endpoint.url += `?page_size=${shownOptionsLimit}&page=${page}&search=${search || ''}`;
    return sendRequest({
      method: 'GET',
      endpoint: {
        url: endpoint.url
      }
    }).then((resp: GenericObject) => {
      const data = page > 1 ? [...this.users, ...resp.results] : resp.results;
      this.handleUsersNoLongerAssignedToCurrentCountry(
        data,
        this.editedItem.assigned_to ? [this.editedItem.assigned_to] : []
      );
      this.users = data;
    });
  }

  _checkNotTouched(copyDialog, editedItem) {
    if (!copyDialog || isEmpty(this.originalEditedObj)) {
      this.notTouched = false;
      return;
    }
    this.notTouched = every(this.originalEditedObj, (value, key) => {
      const isObj = isObject(value);
      if (isObj) {
        return !(value as AnyObject).id || +(value as AnyObject).id === +get(this, `editedItem.${key}.id`);
      } else {
        return value === editedItem[key];
      }
    });
  }

  showWarningCategoryMessage(category: number) {
    if (Number(category) === AP_OTHER) {
      this.warningCategoryMessage = 'Are you sure that no other categories are suitable for this Action Point?';
    } else {
      this.warningCategoryMessage = '';
    }
  }

  _allowComplete(editedApBase) {
    return actionAllowed(editedApBase, 'complete');
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }
}
