import {PolymerElement, html} from '@polymer/polymer/polymer-element';
import {property, query} from '@polymer/decorators';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import EtoolsPageRefreshMixin from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin.js';
import {fireEvent} from '../../../utils/fire-custom-event';
import famEndpoints from '../../../config/endpoints';
import {HeaderStyles} from './header-styles';
import {BASE_PATH} from '../../../config/config';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsPageRefreshMixin
 */
class OrganizationsDropdown extends EtoolsPageRefreshMixin(PolymerElement) {
  public static get template() {
    return html`
      ${HeaderStyles}
      <style>
        #organizationSelector {
          width: 170px;
        }
      </style>
      <etools-dropdown
        id="organizationSelector"
        class$="[[checkMustSelectOrganization(user)]]"
        selected="[[currentOrganizationId]]"
        placeholder="Select Organization"
        options="[[organizations]]"
        option-label="name"
        option-value="id"
        trigger-value-change-event
        on-etools-selected-item-changed="onOrganizationChange"
        allow-outside-scroll
        no-label-float
        hide-search
      >
      </etools-dropdown>
    `;
  }

  @property({type: Number})
  currentOrganizationId!: number | null;

  @property({type: Array})
  organizations: any[] = [];

  @property({type: Object})
  user!: any;

  @query('#organizationSelector') organizationSelectorDropdown!: EtoolsDropdownEl;

  public static get observers() {
    return ['onUserChange(user)'];
  }

  public connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      const fitInto = document.querySelector('app-shell')!.shadowRoot!.querySelector('#appHeadLayout');
      if (fitInto && this.organizationSelectorDropdown) {
        this.organizationSelectorDropdown.fitInto = fitInto;
      }
    }, 500);
  }

  public onUserChange(user: any) {
    if (!user || !Object.keys(user).length) {
      return;
    }

    this.set('organizations', this.user.organizations_available);
    this.set('currentOrganizationId', this.user.organization?.id || null);
  }

  checkMustSelectOrganization(user) {
    if (user && Object.keys(user).length && !user.organization) {
      setTimeout(() => {
        fireEvent(this, 'toast', {text: 'Select Organization'});
      }, 2000);
      return 'warning';
    }
    return '';
  }

  onOrganizationChange(e: CustomEvent) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedOrganizationId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedOrganizationId !== this.currentOrganizationId) {
      // send post request to change_organization endpoint
      this.triggerOrganizationChangeRequest(selectedOrganizationId);
    }
  }

  triggerOrganizationChangeRequest(organizationId) {
    const options = {
      method: 'POST',
      body: {organization: organizationId},
      endpoint: famEndpoints.changeOrganization
    };
    sendRequest(options).then(this._handleResponse.bind(this)).catch(this._handleError.bind(this));
  }

  _handleError() {
    this.organizationSelectorDropdown.selected = this.currentOrganizationId;
    fireEvent(this, 'global-loading', {type: 'change-organization'});
    fireEvent(this, 'toast', {text: 'Can not change organization. Please, try again later'});
  }

  _handleResponse() {
    this.refreshInProgress = true;
    this.clearDexieDbs();
  }

  _refreshPage() {
    this.refreshInProgress = false;
    window.location.href = `${window.location.origin}/${BASE_PATH}/`;
  }
}

window.customElements.define('organizations-dropdown', OrganizationsDropdown);
