import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';

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
            <paper-icon-button class="panel-button" @click="${this.openAddDialog}" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
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
                  <paper-icon-button icon="create" @click="${() => this.openEditDialog(index)}"></paper-icon-button>
                  <paper-icon-button icon="delete" @click="${() => this.openDeleteDialog(index)}"></paper-icon-button>
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
        theme="confirmation"
        size="md"
        keep-dialog-open
        .opened="${this.confirmDialogOpened}"
        @confirm-btn-clicked="${this.removeItem}"
        ?disable-confirm-btn="${this.requestInProcess}"
        ok-btn-text="Delete"
        openFlag="confirmDialogOpened"
        @close="${this._resetDialogOpenedFlag}"
      >
        ${this.deleteTitle}
      </etools-dialog>

      <etools-dialog
        no-padding
        keep-dialog-open
        size="md"
        .opened="${this.dialogOpened}"
        .dialogTitle="${this.dialogTitle}"
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
            <paper-textarea
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
            </paper-textarea>
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

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('confirmDialogOpened')) {
      this.resetDialog(this.confirmDialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject?.other_recommendations);
      this._checkNonField(this.errorObject?.other_recommendations);
    }
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
