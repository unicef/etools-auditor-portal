import {LitElement, html, property, customElement} from 'lit-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';

import {tabInputsStyles} from '../../../../styles/tab-inputs-styles-lit';
import {moduleStyles} from '../../../../styles/module-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import cloneDeep from 'lodash-es/cloneDeep';
import {getTableRowIndexText} from '../../../../utils/utils';

/**
 * @customElement
 * @polymer
 */
@customElement('kicw-risk')
export class KicwRisk extends LitElement {
  static get styles() {
    return [tabInputsStyles, moduleStyles, gridLayoutStylesLit];
  }

  render() {
    return html`
      ${sharedStyles}
      <style>
        :host {
          position: relative;
          display: block;
          background: transparent;
        }
        .hover-icons {
          background-color: #eee;
        }
        .edit-icon-slot {
          align-items: flex-start;
        }
        etools-data-table-header {
          --list-divider-color: none !important;
          --list-bg-color: transparent;
        }
        etools-data-table-row::part(edt-list-row-wrapper) {
          border-bottom: none !important;
          background: transparent;
        }
      </style>

      <etools-data-table-header no-collapse no-title>
        <etools-data-table-column class="col-1">Risk #</etools-data-table-column>
        <etools-data-table-column class="col-2">Risks Rating</etools-data-table-column>
        <etools-data-table-column class="col-3">Key control observation</etools-data-table-column>
        <etools-data-table-column class="col-3">Recommendation</etools-data-table-column>
        <etools-data-table-column class="col-3">IP response</etools-data-table-column>
      </etools-data-table-header>

      ${(this.risksData || []).map(
        (item, index) => html`
          <etools-data-table-row no-collapse>
            <div slot="row-data" class="layout-horizontal editable-row">
              <span class="col-data col-1">${getTableRowIndexText(index)}</span>
              <span class="col-data col-2">${item.value_display}</span>
              <span class="col-data col-3">${item.extra.key_control_observation}</span>
              <span class="col-data col-3">${item.extra.recommendation}</span>
              <span class="col-data col-3">${item.extra.ip_response}</span>
              <div class="hover-block" ?hidden="${!this.isEditable}">
                <paper-icon-button icon="create" @click="${() => this.editRisk(index)}"></paper-icon-button>
                <paper-icon-button icon="delete" @click="${() => this.removeRisk(index)}"></paper-icon-button>
              </div>
            </div>
          </etools-data-table-row>
        `
      )}
    `;
  }

  @property({type: Boolean})
  isEditable!: boolean;

  @property({type: Array})
  risksData: GenericObject[] = [];

  @property({type: Object})
  emptyObj: GenericObject = {
    risks: [
      {
        value: {},
        extra: {}
      }
    ]
  };

  @property({type: Number})
  blueprintId!: number;

  editRisk(index) {
    const blueprint = this._createBlueprintFromEvent(index);
    fireEvent(this, 'kicw-risk-edit', {blueprint});
  }

  removeRisk(index) {
    const blueprint = this._createBlueprintFromEvent(index);
    blueprint.risks[0]._delete = true;
    fireEvent(this, 'kicw-risk-delete', {blueprint, delete: true});
  }

  _createBlueprintFromEvent(index) {
    const item = this.risksData[index];
    return {
      id: this.blueprintId,
      risks: [cloneDeep(item)]
    };
  }
}
