import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-textarea.js';
import '@polymer/iron-icons/iron-icons.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';

import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';
import TableElementsMixin from '../../../../app-mixins/table-elements-mixin';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {GenericObject} from '../../../../../types/global';
import {checkNonField} from '../../../../app-mixins/error-handler';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 * @appliesMixin TableElementsMixin
 */
class OtherRecommendations extends
  TableElementsMixin(CommonMethodsMixin(PolymerElement)) {
    static get template() {
      return html`
        ${tabInputsStyles} ${moduleStyles} ${tabLayoutStyles}
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

        etools-content-panel {
          --ecp-content: {
            padding: 0;
          };
        }

      </style>

      <etools-content-panel
                class="content-section clearfix"
                panel-title="[[getLabel('other_recommendations', basePermissionPath)]]" list>
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
                no-additional
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
                  no-additional
                  multiline
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
                  no-additional
                  no-animation>
          </list-element>
        </template>

        </etools-content-panel>
        <etools-dialog theme="confirmation" size="md"
                keep-dialog-open
                opened="{{confirmDialogOpened}}"
                on-confirm-btn-clicked="removeItem"
                disable-confirm-btn="{{requestInProcess}}"
                ok-btn-text="Delete">
            [[deleteTitle]]
        </etools-dialog>
        <etools-dialog no-padding keep-dialog-open size="md"
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
                      <!-- Description -->
                    <paper-textarea
                            class$="disabled-as-readonly fixed-width validate-input [[_setRequired('other_recommendations.description', basePermissionPath)]]"
                            value="{{editedItem.description}}"
                            allowed-pattern="[\\d\\s]"
                            label="[[getLabel('other_recommendations.description', basePermissionPath)]]"
                            placeholder="[[getPlaceholderText('other_recommendations.description', basePermissionPath)]]"
                            required$="[[_setRequired('other_recommendations.description', basePermissionPath)]]"
                            disabled$="[[requestInProcess]]"
                            readonly$="[[requestInProcess]]"
                            max-rows="4"
                            invalid="[[_checkInvalid(errors.0.description)]]"
                            error-message="[[errors.0.description]]"
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
dataItems: [] = [];

@property({type: String})
mainProperty: string = 'other_recommendations';

@property({type: Object})
itemModel: {} = {description: ''};

@property({type: Array})
columns: GenericObject[] = [{
  'size': 25,
  'name': 'finding',
  'label': 'Recommendation Number',
}, {
  'size': 75,
  'label': 'Description',
  'labelPath': 'other_recommendations.description',
  'path': 'description'
}];

@property({type: Object})
addDialogTexts: GenericObject = {title: 'Add New Recommendation'};

@property({type: Object})
editDialogTexts: GenericObject = {title: 'Edit Recommendation'};

@property({type: String})
deleteTitle: string = 'Are you sure that you want to delete this Recommendation?';

  static get observers() {
  return [
    'resetDialog(dialogOpened)',
    'resetDialog(confirmDialogOpened)',
    '_errorHandler(errorObject.other_recommendations)',
    '_checkNonField(errorObject.other_recommendations)'
  ];
}

_checkNonField(error) {
  if (!error) {return;}

  let nonField = checkNonField(error);
  if (nonField) {
    fireEvent(this, 'toast', {text: `Other Recommendations: ${nonField}`});
  }
}

_checkInvalid(value) {
  return !!value;
}


}

window.customElements.define('other-recommendations', OtherRecommendations);
