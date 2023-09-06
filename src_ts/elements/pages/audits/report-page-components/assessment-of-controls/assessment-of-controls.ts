import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-input/paper-textarea';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import TableElementsMixin from '../../../../mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {checkNonField} from '../../../../mixins/error-handler';
import ModelChangedMixin from '@unicef-polymer/etools-modules-common/dist/mixins/model-changed-mixin';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
@customElement('assessment-of-controls')
export class AssessmentOfControls extends CommonMethodsMixin(TableElementsMixin(ModelChangedMixin(LitElement))) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        .repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        etools-content-panel::part(ecp-content) {
          padding: 0;
        }

        .mt-30 {
          margin-top: 30px
        }
      </style>

      <etools-content-panel
        class="content-section clearfix"
        .panelTitle="${this.getLabel('key_internal_controls', this.optionsData)}"
        list
      >
        <div class="header-content">
          <div class="static-text">
            We have reviewed the status of implementation of the recommendations from the micro assessment or previous
            audit. The recommendations that have not been implemented are presented below:
          </div>
        </div>
        <div slot="panel-btns">
          <div ?hidden="${!this._canBeChanged(this.optionsData)}">
            <paper-icon-button class="panel-button" @click="${this.openAddDialog}" icon="add-box"> </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <etools-data-table-header no-title>
          <etools-data-table-column class="col-12">Audit Observation</etools-data-table-column>
        </etools-data-table-header>

        ${(this.dataItems || []).map(
          (item, index) => html`
            <etools-data-table-row>
              <div slot="row-data" class="layout-horizontal editable-row">
                <span class="col-data col-12">${item.audit_observation}</span>
                <div class="hover-block" ?hidden="${!this._canBeChanged(this.optionsData)}">
                  <paper-icon-button icon="create" @click="${() => this.openEditDialog(index)}"></paper-icon-button>
                  <paper-icon-button icon="delete" @click="${() => this.openDeleteDialog(index)}"></paper-icon-button>
                </div>
              </div>
              <div slot="row-data-details">
                <div class="row-details-content col-12">
                  <span class="rdc-title">Recommendation</span>
                  <span>${item.recommendation}</span>
                </div>
                <div class="row-details-content col-12 mt-30">
                  <span class="rdc-title">IP response</span>
                  <span>${item.ip_response}</span>
                </div>
              </div>
            </etools-data-table-row>
          `
        )}

        <etools-dialog
          theme="confirmation"
          size="md"
          keep-dialog-open
          .opened="${this.confirmDialogOpened}"
          ?disable-confirm-btn="${this.requestInProcess}"
          @confirm-btn-clicked="${this.removeItem}"
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
          ?showSpinner="${this.requestInProcess}"
          ?disable-confirm-btn="${this.requestInProcess}"
          @confirm-btn-clicked="${this._addItemFromDialog}"
          openFlag="dialogOpened"
          @close="${this._resetDialogOpenedFlag}"
        >
          <div class="container">
            <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Recommendation -->
                  <paper-textarea
                    class="w100 ${this._setRequired(
                      'key_internal_controls.recommendation',
                      this.optionsData
                    )} validate-input"
                    .value="${this.editedItem.recommendation}"
                    label="${this.getLabel('key_internal_controls.recommendation', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('key_internal_controls.recommendation', this.optionsData)}"
                    ?required="${this._setRequired('key_internal_controls.recommendation', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.recommendation}"
                    .errorMessage="${this.errors.recommendation}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'recommendation', this.editedItem)}""
                  >
                  </paper-textarea>
                </div>
              </div>

              <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- Audit Observation -->
                  <paper-textarea
                    class="w100 ${this._setRequired(
                      'key_internal_controls.audit_observation',
                      this.optionsData
                    )} validate-input"
                    .value="${this.editedItem.audit_observation}"
                    label="${this.getLabel('key_internal_controls.audit_observation', this.optionsData)}"
                    placeholder="${this.getPlaceholderText(
                      'key_internal_controls.audit_observation',
                      this.optionsData
                    )}"
                    ?required="${this._setRequired('key_internal_controls.audit_observation', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.audit_observation}"
                    .errorMessage="${this.errors.audit_observation}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'audit_observation', this.editedItem)}""
                  >
                  </paper-textarea>
                </div>
              </div>

               <div class="layout-horizontal">
                <div class="col col-12">
                  <!-- IP Response -->
                  <paper-textarea
                    class="w100 ${this._setRequired('key_internal_controls.ip_response', this.optionsData)}
                                          validate-input"
                    .value="${this.editedItem.ip_response}"
                    label="${this.getLabel('key_internal_controls.ip_response', this.optionsData)}"
                    placeholder="${this.getPlaceholderText('key_internal_controls.ip_response', this.optionsData)}"
                    ?required="${this._setRequired('key_internal_controls.ip_response', this.optionsData)}"
                    ?disabled="${this.requestInProcess}"
                    ?invalid="${this.errors.ip_response}"
                    .errorMessage="${this.errors.ip_response}"
                    @focus="${this._resetFieldError}"
                    @value-changed="${({detail}: CustomEvent) =>
                      this.valueChanged(detail, 'ip_response', this.editedItem)}""
                  >
                  </paper-textarea>
                </div>
              </div>
            </div>
        </etools-dialog>
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  dataItems: GenericObject[] = [];

  @property({type: String})
  mainProperty = 'key_internal_controls';

  @property({type: Object})
  itemModel: GenericObject = {};

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Array})
  columns: GenericObject[] = [
    {
      label: 'Audit Observation',
      path: 'audit_observation',
      size: 100
    }
  ];

  @property({type: Array})
  details: GenericObject[] = [
    {
      label: 'Recommendation',
      path: 'recommendation',
      size: 100
    },
    {
      label: 'IP response',
      path: 'ip_response',
      size: 100
    }
  ];

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Add New Assessment of Key Internal Controls'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Assessment of Key Internal Controls'
  };

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this assessment?';

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('dialogOpened')) {
      this.resetDialog(this.dialogOpened);
    }
    if (changedProperties.has('confirmDialogOpened')) {
      this.resetDialog(this.confirmDialogOpened);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject.key_internal_controls);
      this._checkNonField(this.errorObject.key_internal_controls);
    }
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    const nonField = checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Assessment of Key Internal Controls: ${nonField}`});
    }
  }
}
