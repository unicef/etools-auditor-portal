import {PolymerElement, html} from '@polymer/polymer';
import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import '@unicef-polymer/etools-content-panel/etools-content-panel';
import '@polymer/paper-icon-button/paper-icon-button';
import '@polymer/paper-tooltip/paper-tooltip';
import '../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../common-elements/list-tab-elements/list-element/list-element';
import '@unicef-polymer/etools-dialog/etools-dialog';
import '@polymer/paper-input/paper-input';
import '@polymer/paper-input/paper-textarea';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import TableElementsMixin from '../../../app-mixins/table-elements-mixin';
import {property} from '@polymer/decorators';
import {fireEvent} from '../../../utils/fire-custom-event';
import {checkNonField} from '../../../app-mixins/error-handler';

class ControlFindingsTab extends CommonMethodsMixin(TableElementsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }

        .repeatable-item-container.row-h  {
          width: 100%;
          min-width: 0 !important;
          margin-bottom: 0 !important;
        }

        .confirm-text {
          padding: 5px 86px 0 23px !important;
        }

        .edit-icon-slot {
          overflow: visible !important;
          display: flex;
          align-items: center;
          height: 100%;
        }

        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }
      </style>

      <etools-content-panel panel-title="Detailed Internal Control Findings and Recommendations" list>
        <div slot="panel-btns">
          <div hidden$="[[!_canBeChanged(basePermissionPath)]]">
            <paper-icon-button class="panel-button" on-tap="openAddDialog" icon="add-box">
            </paper-icon-button>
            <paper-tooltip offset="0">Add</paper-tooltip>
          </div>
        </div>

        <list-header no-ordered data="[[columns]]" base-permission-path="[[basePermissionPath]]"></list-header>

        <template is="dom-repeat" items="[[dataItems]]" filter="_showItems">
          <list-element class="list-element" data="[[item]]" base-permission-path="[[basePermissionPath]]"
            headings="[[columns]]" details="[[details]]" has-collapse no-animation>
            <div slot="hover" class="edit-icon-slot" hidden$="[[!_canBeChanged(basePermissionPath)]]">
              <paper-icon-button icon="icons:create" class="edit-icon" on-tap="openEditDialog"></paper-icon-button>
              <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="openDeleteDialog"></paper-icon-button>
            </div>
          </list-element>
        </template>

        <template is="dom-if" if="[[!dataItems.length]]">
          <list-element class="list-element" data="[[emptyObj]]" headings="[[columns]]" no-animation>
          </list-element>
        </template>
      </etools-content-panel>
      <etools-dialog theme="confirmation" size="md" keep-dialog-open opened="{{confirmDialogOpened}}"
        on-confirm-btn-clicked="removeItem" ok-btn-text="Delete">
        [[deleteTitle]]
      </etools-dialog>

      <etools-dialog no-padding keep-dialog-open size="md" opened="{{dialogOpened}}" delete-dialog="[[deleteDialog]]"
        dialog-title="[[dialogTitle]]" ok-btn-text="[[confirmBtnText]]" show-spinner="{{requestInProcess}}"
        disable-confirm-btn="{{requestInProcess}}" on-confirm-btn-clicked="_addItemFromDialog">
        <div class="row-h repeatable-item-container" without-line>
          <div class="repeatable-item-content">
            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Finding -->
                <paper-input class$="validate-input {{_setRequired('findings.finding', basePermissionPath)}}"
                  value="{{editedItem.finding}}"
                  label="[[getLabel('findings.finding', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('findings.finding', basePermissionPath)]]"
                  required$="[[_setRequired('findings.finding', basePermissionPath)]]"
                  disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  maxlength="400"
                  invalid="{{errors.0.finding}}"
                  error-message="{{errors.0.finding}}"
                  on-focus="_resetFieldError"
                  on-tap="_resetFieldError">
                </paper-input>
              </div>
            </div>

            <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Recommendation -->
                <paper-textarea class$="validate-input {{_setRequired('findings.recommendation', basePermissionPath)}}"
                  value="{{editedItem.recommendation}}" allowed-pattern="[\d\s]"
                  label="[[getLabel('findings.recommendation', basePermissionPath)]]"
                  placeholder="[[getPlaceholderText('findings.recommendation', basePermissionPath)]]"
                  required$="[[_setRequired('findings.recommendation', basePermissionPath)]]"
                  disabled="{{requestInProcess}}"
                  readonly$="{{requestInProcess}}"
                  max-rows="4" invalid="{{errors.0.recommendation}}"
                  error-message="{{errors.0.recommendation}}"
                  on-focus="_resetFieldError" on-tap="_resetFieldError">
                </paper-textarea>
              </div>
            </div>
          </div>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Array, notify: true})
  dataItems!: [];

  @property({type: String})
  mainProperty = 'findings';

  @property({type: Object})
  itemModel = {
    finding: '',
    recommendation: ''
  };

  @property({type: Array})
  columns = [
    {
      'size': 100,
      'label': 'Description of Finding',
      'labelPath': 'findings.finding',
      'path': 'finding'
    }
  ];

  @property({type: Array})
  details = [{
    'label': 'Recommendation and IP Management Response',
    'labelPath': 'findings.recommendation',
    'path': 'recommendation',
    'size': 100
  }];

  @property({type: Object})
  addDialogTexts = {
    title: 'Add New Finding'
  };

  @property({type: Object})
  editDialogTexts = {
    title: 'Edit Finding'
  };

  @property({type: String})
  deleteTitle = 'Are you sure that you want to delete this finding?';

  static get observers() {
    return [
      'resetDialog(dialogOpened)',
      'resetDialog(confirmDialogOpened)',
      '_errorHandler(errorObject.findings)',
      '_checkNonField(errorObject.findings)'
    ];
  }

  _checkNonField(error) {
    if (!error) { return; }

    let nonField = checkNonField(error);
    if (nonField) {
        fireEvent(this, 'toast', {text: `Findings and Recommendations: ${nonField}`});
    }
  }

}
window.customElements.define('control-findings-tab', ControlFindingsTab);
