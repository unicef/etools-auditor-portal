import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import famEndpoints from '../../../config/endpoints';
import {HeaderStyles} from './header-styles';
import {BASE_PATH} from '../../../config/config';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsPageRefreshMixin
 */
@customElement('organizations-dropdown')
export class OrganizationsDropdown extends LitElement {
  render() {
    return html`
      ${HeaderStyles}
      <etools-dropdown
        transparent
        id="organizationSelector"
        class="${this.checkMustSelectOrganization(this.user)}"
        .selected="${this.currentOrganizationId}"
        placeholder="Select Organization"
        .options="${this.organizations}"
        option-label="name"
        option-value="id"
        trigger-value-change-event
        @etools-selected-item-changed="${this.onOrganizationChange}"
        allow-outside-scroll
        no-label-float
        hide-search
        min-width="180px"
        placement="bottom-end"
        .syncWidth="${false}"
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

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('user')) {
      this.onUserChange(this.user);
    }
  }

  public onUserChange(user: any) {
    if (!user || !Object.keys(user).length) {
      return;
    }

    this.organizations = this.user.organizations_available;
    this.currentOrganizationId = this.user.organization?.id || null;
  }

  checkMustSelectOrganization(user) {
    if (user && user.user && !user.organization) {
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
    // @dci check below, these were from EtoolsPageRefreshMixinLit (removed)
    // this.refreshInProgress = true;
    // this.clearDexieDbs();
    // this.refreshInProgress = false;
    window.location.href = `${window.location.origin}${BASE_PATH}`;
  }
}
