import {LitElement, html, PropertyValues} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-textarea';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../../styles/module-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
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
    return [tabInputsStyles, tabLayoutStyles, moduleStyles, layoutStyles];
  }

  render() {
    return html`
      ${sharedStyles}

      <etools-content-panel
        class="content-section clearfx"
        .panelTitle="${this.getLabel('internal_controls', this.optionsData)}"
      >
        <div class="layout-horizontal">
          <div class="static-text">
            Inquire of IP management whether there have been any changes to internal controls since the prior micro
            assessment from the current programme cycle.<br />
            Inquire whether the high priority recommendations from the micro assessment and previous assurance
            activities have been implemented. Document any changes identified
          </div>
        </div>

        <div class="row">
          <div class="col-12 input-container">
            <etools-textarea
              class="w100 ${this._setRequired('internalControls', this.optionsData)}"
              .value="${this.data}"
              label="Document any changes identified"
              always-float-label
              placeholder="Enter comments"
              ?required="${this._setRequired('internal_controls', this.optionsData)}"
              ?readonly="${this.isReadOnly('internal_controls', this.optionsData)}"
              ?invalid="${this._checkInvalid(this.errors?.internal_controls)}"
              .errorMessage="${this.errors?.internal_controls}"
              @value-changed="${({detail}: CustomEvent) => (this.data = detail.value)}"
              @focus="${this._resetFieldError}"
            >
            </etools-textarea>
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

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Internal controls',
    fields: ['internal_controls']
  };

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject, this.errorObject);
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
