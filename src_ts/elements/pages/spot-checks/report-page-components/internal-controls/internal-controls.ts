import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/paper-input/paper-textarea';
import '@unicef-polymer/etools-content-panel/etools-content-panel';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import CommonMethodsMixin from '../../../../mixins/common-methods-mixin';

import {GenericObject} from '../../../../../types/global';

import isEqual from 'lodash-es/isEqual';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMethodsMixin
 */
@customElement('internal-controls')
export class InternalControls extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}

      <etools-content-panel
        class="content-section clearfx"
        .panelTitle="${this.getLabel('internal_controls', this.basePermissionPath)}"
      >
        <div class="layout-horizontal">
          <div class="col col-12">
            Inquire of IP management whether there have been any changes to internal controls since the prior micro
            assessment from the current programme cycle.<br />
            Inquire whether the high priority recommendations from the micro assessment and previous assurance
            activities have been implemented. Document any changes identified
          </div>
        </div>

        <div class="layout-horizontal">
          <div class="col col-12">
            <paper-textarea
              class="w100 ${this._setRequired('internalControls', this.basePermissionPath)}"
              .value="${this.data}"
              label="Document any changes identified"
              always-float-label
              placeholder="Enter comments"
              ?required="${this._setRequired('internal_controls', this.basePermissionPath)}"
              ?readonly="${this.isReadOnly('internal_controls', this.basePermissionPath)}"
              ?invalid="${this._checkInvalid(this.errors?.internal_controls)}"
              .errorMessage="${this.errors?.internal_controls}"
              @value-changed="${({detail}: CustomEvent) => (this.data = detail.value)}"
              @focus="${this._resetFieldError}"
            >
            </paper-textarea>
          </div>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  data: GenericObject | null = {};

  @property({type: Object})
  originalData: GenericObject = {};

  @property({type: Object})
  errors!: GenericObject;

  @property({type: String})
  basePermissionPath!: string;

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Internal controls',
    fields: ['internal_controls']
  };

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
    }
  }

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
