import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property} from '@polymer/decorators/lib/decorators';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';

import CommonMethodsMixin from '../../../../app-mixins/common-methods-mixin';

import {GenericObject} from '../../../../../types/global';

import isEqual from 'lodash-es/isEqual';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 */
class InternalControls extends CommonMethodsMixin(PolymerElement) {

  static get template() {
    // language=HTML
    return html`
        ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}

      <etools-content-panel
                class="content-section clearfx"
                panel-title="[[getLabel('internal_controls', basePermissionPath)]]">
            <div class="row-h" group>
                <div class="static-text">
                    Inquire of IP management whether there have been any changes to internal controls since the prior
                    micro assessment from the current programme cycle.<br>
                    Inquire whether the high priority recommendations
                    from the micro assessment and previous assurance activities have been implemented. Document any
                    changes identified
                </div>
            </div>

            <div class="row-h group">
                <paper-textarea
                        class$="disabled-as-readonly [[_setRequired('internalControls', basePermissionPath)]]"
                        value="{{data}}"
                        label="Document any changes identified"
                        always-float-label
                        placeholder="Enter comments"
                        required$="[[_setRequired('internal_controls', basePermissionPath)]]"
                        disabled$="[[isReadOnly('internal_controls', basePermissionPath)]]"
                        invalid="{{_checkInvalid(errors.internal_controls)}}"
                        error-message="{{errors.internal_controls}}"
                        on-focus="_resetFieldError"
                        on-tap="_resetFieldError">
                </paper-textarea>
            </div>
      </etools-content-panel>
    `;
  }

  static get observers() {
    return [
      'updateStyles(basePermissionPath)',
      '_errorHandler(errorObject)'
    ];
  }

  @property({type: Object, notify: true})
  data: GenericObject | null = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Array})
  errors!: any[];

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Internal controls',
    fields: ['internal_controls']
  };

  getInternalControlsData() {
    let data: GenericObject | null = null;
    if (!isEqual(this.originalData, this.data)) {
      data = this.data;
    }
    return data;
  }

  _checkInvalid(value) {
    return !!value;
  }


}

window.customElements.define('internal-controls', InternalControls);
export {InternalControls as InternalControlsElement};
