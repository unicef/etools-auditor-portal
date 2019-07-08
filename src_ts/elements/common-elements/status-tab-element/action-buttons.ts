import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-button/paper-button';
import '@polymer/paper-menu-button/paper-menu-button';
import '@polymer/iron-icon/iron-icon';
import '@polymer/paper-icon-button/paper-icon-button';
import {moduleStyles} from '../../styles-elements/module-styles';
import {ActionButtonsStyles} from './action-buttons-styles';
import {property} from '@polymer/decorators';
import {fireEvent} from '../../utils/fire-custom-event';
import isEqual from 'lodash-es/isEqual';

class ActionButtons extends PolymerElement {
  static get template() {
    return html`
    ${moduleStyles} ${ActionButtonsStyles}
    <paper-button class$="main-action status-tab-button {{withActionsMenu(actions.length)}}" raised on-tap="_btnClicked">
      <span class="main-action text">[[_setButtonText(actions.0)]]</span>
      <template is="dom-if" if="{{_showOtherActions(actions.length)}}">

        <paper-menu-button class="option-button" dynamic-align opened="{{statusBtnMenuOpened}}">
          <paper-icon-button slot="dropdown-trigger" class="option-button" icon="expand-more"></paper-icon-button>
          <div slot="dropdown-content">
            <template class="other-btns-template" is="dom-repeat" items="[[actions]]" filter="_filterActions">
              <div class="other-options" on-click="closeMenu" action-code$="[[_setActionCode(item)]]">
                <iron-icon icon="[[_setIcon(item, icons)]]" class="option-icon"></iron-icon>
                <span>{{_setButtonText(item)}}</span>
              </div>
            </template>

          </div>
        </paper-menu-button>

      </template>

    </paper-button>
    `;
  }

  @property({type: Array})
  actions = [];

  @property({type: Object})
  icons = {
    'cancel': 'cancel',
    'save': 'save',
    'submit': 'assignment-turned-in',
    'finalize': 'assignment-turned-in',
    'create': 'assignment-turned-in'
  };

  @property({type: Boolean})
  statusBtnMenuOpened!: boolean;

  closeMenu() {
    this.statusBtnMenuOpened = false;
  }

  _setButtonText(item) {
      if (!item) { return ''; }
      let text = item.display_name || item.replace('_', ' ');

      if (!text) { throw 'Can not get button text!'; }

      return text.toUpperCase();
  }

  _btnClicked(event) {
      if (!event || !event.target) { return; }
      let target = event.target.classList.contains('other-options') ? event.target : event.target.parentElement || event.target,
          isMainAction = event.target.classList.contains('main-action');

      let action = isMainAction ?
          (this.actions[0].code || this.actions[0]) :
          target && target.getAttribute('action-code');

      if (action) {
          fireEvent(this, `toast`, {reset: true});
          fireEvent(this, `action-activated`, {type: action});
      }
  }

  _showOtherActions(length) {
      return length > 1;
  }

  withActionsMenu(length) {
      return length > 1 ? 'with-menu' : '';
  }

  _filterActions(action) {
      return !isEqual(action, this.actions[0]);
  }

  _setIcon(item, icons) {
      if (!icons || !item) { return ''; }
      return icons[(item.code || item)] || '';
  }

  _setActionCode(item) {
      return item && (item.code || item);
  }

}

window.customElements.define('action-buttons', ActionButtons);
