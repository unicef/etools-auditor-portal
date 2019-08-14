import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '@polymer/paper-input/paper-textarea';

import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-dialog/etools-dialog';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';

import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import TableElementsMixin from '../../../../app-mixins/table-elements-mixin';
import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';

/**
 * @customElement
 * @polymer
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
class AssessmentOfControls extends
  CommonMethodsMixin(TableElementsMixin(PolymerElement)) {

  static get template() {
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
      <style>
        .repeatable-item-container[without-line] {
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }
      </style>

      <etools-content-panel
            class="content-section clearfix"
            panel-title="[[getLabel('key_internal_controls', basePermissionPath)]]" list>
        <div class="header-content">
            <div class="static-text">
                We have reviewed the status of implementation of the recommendations from the micro assessment
                or previous audit. The recommendations that have not been implemented are presented below:
            </div>
        </div>
        <div slot="panel-btns">
            <div hidden$="[[!_canBeChanged(basePermissionPath)]]">
                <paper-icon-button
                        class="panel-button"
                        on-tap="openAddDialog"
                        icon="add-box">
                </paper-icon-button>
                <paper-tooltip offset="0">Add</paper-tooltip>
            </div>
        </div>

        <list-header
                id="list-header"
                no-ordered
                data="[[columns]]"
                base-permission-path="[[basePermissionPath]]">
        </list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
            <list-element
                    class="list-element"
                    data="[[item]]"
                    base-permission-path="[[basePermissionPath]]"
                    item-index="[[index]]"
                    headings="[[columns]]"
                    details="[[details]]"
                    has-collapse
                    no-animation>
                <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
                    <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
                    <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"></paper-icon-button>
                </div>
            </list-element>
        </template>

        <template is="dom-if" if="[[!dataItems.length]]">
            <list-element
                    class="list-element"
                    data="[[emptyObj]]"
                    headings="[[columns]]"
                    no-animation>
            </list-element>
        </template>
    </etools-content-panel>

    <etools-dialog theme="confirmation" size="md"
            keep-dialog-open
            opened="{{confirmDialogOpened}}"
            disable-confirm-btn="{{requestInProcess}}"
            on-confirm-btn-clicked="removeItem"
            ok-btn-text="Delete">
        [[deleteTitle]]
    </etools-dialog>

    <etools-dialog no-padding keep-dialog-open
            size="md"
            opened="{{dialogOpened}}"
            dialog-title="[[dialogTitle]]"
            ok-btn-text="[[confirmBtnText]]"
            show-spinner="{{requestInProcess}}"
            disable-confirm-btn="{{requestInProcess}}"
            on-confirm-btn-clicked="_addItemFromDialog">
        <div class="row-h repeatable-item-container" without-line>
            <div class="repeatable-item-content">
                <div class="row-h group">
                    <div class="input-container input-container-l">
                        <!-- Recommendation -->
                        <paper-textarea
                                class$="validate-input disabled-as-readonly [[_setRequired('key_internal_controls.recommendation', basePermissionPath)]]"
                                value="{{editedItem.recommendation}}"
                                label="[[getLabel('key_internal_controls.recommendation', basePermissionPath)]]"
                                placeholder="[[getPlaceholderText('key_internal_controls.recommendation', basePermissionPath)]]"
                                required$="[[_setRequired('key_internal_controls.recommendation', basePermissionPath)]]"
                                disabled$="[[requestInProcess]]"
                                readonly$="[[requestInProcess]]"
                                invalid$="{{errors.recommendation}}"
                                error-message="{{errors.recommendation}}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </paper-textarea>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-l">
                        <!-- Audit Observation -->
                        <paper-textarea
                                class$="validate-input disabled-as-readonly [[_setRequired('key_internal_controls.audit_observation', basePermissionPath)]]"
                                value="{{editedItem.audit_observation}}"
                                label="[[getLabel('key_internal_controls.audit_observation', basePermissionPath)]]"
                                placeholder="[[getPlaceholderText('key_internal_controls.audit_observation', basePermissionPath)]]"
                                required$="[[_setRequired('key_internal_controls.audit_observation', basePermissionPath)]]"
                                disabled$="[[requestInProcess]]"
                                readonly$="[[requestInProcess]]"
                                invalid$="{{errors.audit_observation}}"
                                error-message="{{errors.audit_observation}}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </paper-textarea>
                    </div>
                </div>

                <div class="row-h group">
                    <div class="input-container input-container-l">
                        <!-- IP Response -->
                        <paper-textarea
                                class$="validate-input disabled-as-readonly [[_setRequired('key_internal_controls.ip_response', basePermissionPath)]]"
                                value="{{editedItem.ip_response}}"
                                label="[[getLabel('key_internal_controls.ip_response', basePermissionPath)]]"
                                placeholder="[[getPlaceholderText('key_internal_controls.ip_response', basePermissionPath)]]"
                                required$="[[_setRequired('key_internal_controls.ip_response', basePermissionPath)]]"
                                disabled$="[[requestInProcess]]"
                                readonly$="[[requestInProcess]]"
                                invalid$="{{errors.ip_response}}"
                                error-message="{{errors.ip_response}}"
                                on-focus="_resetFieldError"
                                on-tap="_resetFieldError">
                        </paper-textarea>
                    </div>
                </div>
            </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array, notify: true})
  dataItems: GenericObject[] = [];

  @property({type: String})
  mainProperty: string = 'key_internal_controls'

  @property({type: Object})
  itemModel: GenericObject = {};

  @property({type: Array})
  columns: GenericObject[] = [{
    'label': 'Audit Observation',
    'path': 'audit_observation',
    'size': 100
  }];

  @property({type: Array})
  details: GenericObject[] = [{
    'label': 'Recommendation',
    'path': 'recommendation',
    'size': 100
  }, {
    'label': 'IP response',
    'path': 'ip_response',
    'size': 100
  }];

  @property({type: Object})
  addDialogTexts: GenericObject = {
    title: 'Add New Assessment of Key Internal Controls'
  };

  @property({type: Object})
  editDialogTexts: GenericObject = {
    title: 'Edit Assessment of Key Internal Controls'
  };

  @property({type: String})
  deleteTitle: string = 'Are you sure that you want to delete this assessment?'

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      '_errorHandler(errorObject.key_internal_controls)',
      '_checkNonField(errorObject.key_internal_controls)',
    ];
  }

  _checkNonField(error) {
    if (!error) {
      return;
    }

    let nonField = this.checkNonField(error);
    if (nonField) {
      fireEvent(this, 'toast', {text: `Assessment of Key Internal Controls: ${nonField}`});
    }
  }

}

window.customElements.define('assessment-of-controls', AssessmentOfControls);
