import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import '@polymer/polymer/lib/elements/dom-repeat';
import '@polymer/polymer/lib/elements/dom-if';
import '@polymer/iron-icons/iron-icons';
import '@polymer/paper-icon-button/paper-icon-button';

import {tabInputsStyles} from '../../../../styles-elements/tab-inputs-styles';
import {moduleStyles} from '../../../../styles-elements/module-styles';

import '../../../../common-elements/list-tab-elements/list-header/list-header';
import '../../../../common-elements/list-tab-elements/list-element/list-element';
import {property} from '@polymer/decorators/lib/decorators';
import {GenericObject} from '../../../../../types/global';
import {fireEvent} from '../../../../utils/fire-custom-event';
import cloneDeep from 'lodash-es/cloneDeep';

/**
 * @customElement
 * @polymer
 */
class KicwRisk extends PolymerElement {
  static get template() {
    return html`
      ${tabInputsStyles} ${moduleStyles}
      <style>
        :host {
          position: relative;
          display: block;
        }
        .hover-icons {
          background-color: #eee;
        }
        .edit-icon-slot {
          align-items: flex-start;
        }
        list-element.list-element {
          border-bottom: none;
          --primary-background-color: #eee;
          --multiline-align: top;
          --hover-block-bg-color: transparent;
        }
        list-header {
          box-shadow: none;
        }
      </style>

      <list-header no-ordered data="[[columns]]"> </list-header>

      <template is="dom-repeat" items="[[risksData]]">
        <list-element
          class="list-element"
          data="[[item]]"
          headings="[[columns]]"
          item-index="[[index]]"
          multiline
          no-animation
        >
          <div slot="hover" class="edit-icon-slot" hidden$="[[!isEditable]]">
            <div class="hover-icons">
              <paper-icon-button icon="icons:create" class="edit-icon" on-tap="editRisk"></paper-icon-button>
              <paper-icon-button icon="icons:delete" class="edit-icon" on-tap="removeRisk"></paper-icon-button>
            </div>
          </div>
        </list-element>
      </template>

      <template is="dom-if" if="[[!risksData.length]]">
        <list-element class="list-element" data="[[emptyObj]]" headings="[[columns]]" no-animation> </list-element>
      </template>
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

  @property({type: Array})
  columns: GenericObject[] = [
    {
      size: '80px',
      label: 'Risk #',
      name: 'autoNumber',
      align: 'center'
    },
    {
      size: 10,
      label: 'Risks Rating',
      path: 'value_display'
    },
    {
      size: 30,
      label: 'Key control observation',
      path: 'extra.key_control_observation'
    },
    {
      size: 30,
      label: 'Recommendation',
      path: 'extra.recommendation'
    },
    {
      size: 30,
      label: 'IP response',
      path: 'extra.ip_response'
    }
  ];

  editRisk(event) {
    const blueprint = this._createBlueprintFromEvent(event);
    fireEvent(this, 'kicw-risk-edit', {blueprint});
  }

  removeRisk(event) {
    const blueprint = this._createBlueprintFromEvent(event);
    blueprint.risks[0]._delete = true;
    fireEvent(this, 'kicw-risk-delete', {blueprint, delete: true});
  }

  _createBlueprintFromEvent(event) {
    const item = event && event.model && event.model.item;
    const index = this.risksData.indexOf(item);

    if ((!index && index !== 0) || !~index) {
      throw new Error('Can not find data');
    }

    return {
      id: this.blueprintId,
      risks: [cloneDeep(item)]
    };
  }
}

window.customElements.define('kicw-risk', KicwRisk);
