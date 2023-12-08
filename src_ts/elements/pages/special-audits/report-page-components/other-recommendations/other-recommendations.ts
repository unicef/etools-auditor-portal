import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel.js';
import '@shoelace-style/shoelace/dist/components/tooltip/tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject} from '../../../../../types/global';
import {checkNonField} from '../../../../mixins/error-handler';
import {getHeadingLabel} from '../../../../mixins/permission-controller';
import {getTableRowIndexText} from '../../../../utils/utils';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('other-recommendations')
export class OtherRecommendations extends TableElementsMixin(CommonMethodsMixin(LitElement)) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          .repeatable-item-container[without-line] {
            min-width: 0 !important;
            margin-bottom: 0 !important;
          }

          .confirm-text {
            padding: 5px 86px 0 23px !important;
          }
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('other_recommendations', this.optionsData)}"
        list
      >
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <sl-tooltip content="Add">
              <etools-icon-button class="panel-button" @click="${this.openAddDialog}" name="add-box">
              </etools-icon-button>
            </sl-tooltip>
          </div>
        </div>

        <etools-data-table-header no-collapse no-title>
          <etools-data-table-column class="col-3">Recommendation Number</etools-data-table-column>
          <etools-data-table-column class="col-9"
            >${getHeadingLabel(
              this.optionsData,
              'other_recommendations.description',
              'Description'
            )}</etools-data-table-column
          >
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row no-collapse>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-3">${getTableRowIndexText(index)}</span>
                <span class="col-data col-9">${item.description}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <etools-icon-button name="create" @click="${() => this.openEditDialog(index)}"></etools-icon-button>
                  <etools-icon-button name="delete" @click="${() => this.openDeleteDialog(index)}"></etools-icon-button>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}
        <etools-data-table-row no-collapse ?hidden="${this.dataItems?.length}">
          <div slot="row-data" class="layout-horizontal editable-row">
            <span class="col-data col-3">–</span>
            <span class="col-data col-9">–</span>
          </div>
        </etools-data-table-row>
      </etools-content-panel>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        dialog-title="${this.dialogTitle}"
        .okBtnText="${this.confirmBtnText}"
        ?show-spinner="${this.requestInProcess}"
        ?disable-confirm-btn="${this.requestInProcess}"
        @confirm-btn-clicked="${this._addItemFromDialog}"
        openFlag="dialogOpened"
        @close="${this._resetDialogOpenedFlag}"
      >
        <div class="layout-horizontal">
          <div class="col col-12">
            <!-- Description -->
            <etools-textarea
              class="${this._setRequired(
                'other_recommendations.description',
                this.optionsData
              )} fixed-width validate-input w100"
              .value="${this.editedItem.description}"
              allowed-pattern="[\\d\\s]"
              label="${this.getLabel('other_recommendations.description', this.optionsData)}"
              placeholder="${this.getPlaceholderText('other_recommendations.description', this.optionsData)}"
              ?required="${this._setRequired('other_recommendations.description', this.optionsData)}"
              ?disabled="${this.requestInProcess}"
              max-rows="4"
              ?invalid="${this._checkInvalid(this.errors[0]?.description)}"
              .errorMessage="${this.errors[0]?.description}"
              @value-changed="${({detail}: CustomEvent) =>
                (this.editedItem = {...this.editedItem, description: detail.value})}"
            >
              @focus="${this._resetFieldError}" >
            </etools-textarea>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array})
  dataItems: GenericObject[] = [];

  @property({type: String})
  mainProperty = 'other_recommendations';

  @property({type: Object})
  itemModel: GenericObject = {description: ''};

  @property({type: Object})
  addDialogTexts: GenericObject = {title: 'Add New Recommendation'};

  @property({type: Object})
  editDialogTexts: GenericObject = {title: 'Edit Recommendation'};

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this Recommendation?';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('show-confirm-dialog', this.openConfirmDeleteDialog as any);
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.other_recommendations);
      this._checkNonField(this.errorObject?.other_recommendations);
    }
  }

  openConfirmDeleteDialog() {
    openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: this.deleteTitle,
        confirmBtnText: 'Delete',
        cancelBtnText: 'Cancel'
      }
    }).then(({confirmed}) => {
      if (confirmed) {
        this.removeItem();
      }
    });
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Other Recommendations: ${nonField}`});
    }
  }

  _checkInvalid(value) {
    return !!value;
  }
}
