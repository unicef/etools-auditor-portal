import {PolymerElement, html} from '@polymer/polymer/polymer-element';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/polymer/lib/elements/dom-if';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';

import findIndex from 'lodash-es/findIndex';
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../app-mixins/common-methods-mixin';
import {readonlyPermission} from '../../../app-mixins/permission-controller';
import {getStaticData} from '../../../app-mixins/static-data-controller';

import {tabInputsStyles} from '../../../styles-elements/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles-elements/tab-layout-styles';
import {moduleStyles} from '../../../styles-elements/module-styles';
import '../../../data-elements/get-partner-data';


/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMethodsMixin
 */
class PartnerDetailsTab extends CommonMethodsMixin(PolymerElement) {

  static get template() {
    return html`
      ${tabInputsStyles} ${tabLayoutStyles} ${moduleStyles}
        <style>
          .partner-loading {
              position: absolute;
              top: 28px;
              left: auto;
              background-color: #fff;
          }
          .partner-loading:not([active]) {
              display: none !important;
          }

      </style>

      <get-partner-data partner="{{partner}}" partner-id="{{partnerId}}"></get-partner-data>

      <etools-content-panel class="content-section clearfix" panel-title="Partner Details" show-expand-btn>
          <div class="row-h group">
              <div class="input-container">
                  <!-- Partner -->
                  <template is="dom-if" if="[[isReadOnly('partner', basePermissionPath)]]">
                    <paper-input
                            value="{{partner.name}}"
                            disabled
                            readonly>
                    </paper-input>
                  </template>
                  <template is="dom-if" if="[[!isReadOnly('partner', basePermissionPath)]]">
                    <etools-dropdown
                            id="partner"
                            class$="[[_setRequired('partner', basePermissionPath)]] [[_setReadonlyClass(requestInProcess, basePermissionPath)]]"
                            selected="{{engagement.partner.id}}"
                            label="[[getLabel('partner', basePermissionPath)]]"
                            placeholder="[[getPlaceholderText('partner', basePermissionPath, 'dropdown')]]"
                            options="[[partners]]"
                            option-label="name"
                            option-value="id"
                            required$="{{_setRequired('partner', basePermissionPath)}}"
                            invalid="{{errors.partner}}"
                            error-message="{{errors.partner}}"
                            on-focus="_resetFieldError"
                            on-tap="_resetFieldError"
                            trigger-value-change-event
                            on-etools-selected-item-changed="_requestPartner"
                            dynamic-align>
                    </etools-dropdown>
                  </template>
                  <etools-loading active="{{requestInProcess}}" no-overlay loading-text="" class="partner-loading"></etools-loading>
                  <paper-tooltip offset="0">[[engagement.partner.name]]</paper-tooltip>

              </div>
              <div class="input-container input-container-m">
                  <!-- Partner Address -->
                  <paper-input
                          class$="without-border [[_setReadonlyFieldClass(partner)]]"
                          value="[[_setPartnerAddress(partner)]]"
                          label="Partner Address"
                          placeholder="[[getReadonlyPlaceholder(partner)]]"
                          disabled
                          readonly>
                  </paper-input>
                  <paper-tooltip offset="0">[[_setPartnerAddress(partner)]]</paper-tooltip>
              </div>
          </div>

          <div class="row-h group">
              <div class="input-container">
                  <!-- Partner Phone Number -->
                  <paper-input
                          class$="without-border [[_setReadonlyFieldClass(partner)]]"
                          value="{{partner.phone_number}}"
                          label="[[getLabel('partner.phone_number', basePermissionPath)]]"
                          placeholder="[[getReadonlyPlaceholder(partner)]]"
                          disabled
                          readonly>
                  </paper-input>
                  <paper-tooltip offset="0">[[partner.phone_number]]</paper-tooltip>
              </div>

              <div class="input-container">
                  <!-- Partner E-mail Address -->
                  <paper-input
                          class$="without-border [[_setReadonlyFieldClass(partner)]]"
                          value="{{partner.email}}"
                          label="[[getLabel('partner.email', basePermissionPath)]]"
                          placeholder="[[getReadonlyPlaceholder(partner)]]"
                          disabled
                          readonly>
                  </paper-input>
                  <paper-tooltip offset="0">[[partner.email]]</paper-tooltip>
              </div>

              <div class="input-container">
                  <!-- Partner  Officers-->
                  <etools-dropdown
                          id="authorizedOfficer"
                          class$="disabled-as-readonly [[_setRequired('authorized_officers', basePermissionPath)]] [[_setPlaceholderColor(partner)]]"
                          selected="{{authorizedOfficer.id}}"
                          label="[[getLabel('authorized_officers', basePermissionPath)]]"
                          placeholder="[[getReadonlyPlaceholder(partner)]]"
                          options="[[partner.partnerOfficers]]"
                          option-label="fullName"
                          option-value="id"
                          required="{{_setRequired('authorized_officers', basePermissionPath)}}"
                          invalid="{{_checkInvalid(errors.authorized_officers)}}"
                          disabled="[[isOfficersReadonly(basePermissionPath, requestInProcess, partner)]]"
                          readonly="[[isOfficersReadonly(basePermissionPath, requestInProcess, partner)]]"
                          error-message="{{errors.authorized_officers}}"
                          on-focus="_resetFieldError"
                          on-tap="_resetFieldError"
                          dynamic-align>
                  </etools-dropdown>
                  <paper-tooltip offset="0">[[authorizedOfficer.fullName]]</paper-tooltip>
              </div>
          </div>

          <template is="dom-if" if="[[_showActivePd(partner.partner_type, specialPartnerTypes)]]">
              <div class="row-h group">
                  <div class="input-container input-container-l">
                      <!-- Active PD -->
                      <etools-dropdown-multi
                              id="activePd"
                              class$="disabled-as-readonly [[_setPlaceholderColor(partner)]]"
                              selected-items="{{activePd}}"
                              label="[[getLabel('active_pd', basePermissionPath)]]"
                              placeholder="[[activePdPlaceholder(basePermissionPath, partner)]]"
                              options="[[partner.interventions]]"
                              option-label="number"
                              option-value="id"
                              disabled$="[[isPdReadonly(basePermissionPath, requestInProcess, partner)]]"
                              readonly$="[[isPdReadonly(basePermissionPath, requestInProcess, partner)]]"
                              invalid="{{errors.active_pd}}"
                              error-message="{{errors.active_pd}}"
                              on-focus="_resetFieldError"
                              on-tap="_resetFieldError"
                              dynamic-align>
                      </etools-dropdown-multi>
                  </div>
              </div>
          </template>
      </etools-content-panel>
  `;
  }
  static get observers() {
    return [
      '_engagementChanged(engagement, basePermissionPath)',
      '_errorHandler(errorObject)',
      '_setActivePd(engagement, partner.interventions, partnerId)',
      'updateStyles(basePermissionPath, requestInProcess, partner, engagement.engagement_type)',
      'setOfficers(partner, engagement, basePermissionPath)'
    ];
  }

  @property({type: String, observer: '_basePathChanged'})
  basePermissionPath!: string;

  @property({type: Array})
  partners!: [];

  @property({type: Array})
  specialPartnerTypes = ['Bilateral / Multilateral', 'Government'];

  @property({type: Boolean})
  requestInProcess: boolean = false;

  @property({type: Object})
  errors: GenericObject = {};

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Partner Details',
    fields: [
      'authorized_officers', 'active_pd', 'partner'
    ]
  };

  @property({type: Object})
  partner!: GenericObject;

  @property({type: Object})
  activePd!: GenericObject;

  @property({type: Object})
  authorizedOfficer!: GenericObject;

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  partnerId!: GenericObject;

  connectedCallback() {
    super.connectedCallback();
    this.set('partners', getStaticData('partners'));
    this._initListeners();
  }

  _initListeners() {
    this._partnerLoaded = this._partnerLoaded.bind(this);
    this.addEventListener('partner-loaded', this._partnerLoaded as any);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  _removeListeners() {
    this.removeEventListener('partner-loaded', this._partnerLoaded as any);
  }

  _partnerLoaded() {
    this.set('errors', {});
    this.requestInProcess = false;
    this.validatePartner();
  }

  setOfficers(partner, engagement) {
    if (!partner || !partner.id) {
      this.set('authorizedOfficer', null);
      return;
    }
    let engagementOfficer = engagement && engagement.authorized_officers && engagement.authorized_officers[0],
      partnerOfficer = partner && partner.partnerOfficers && partner.partnerOfficers[0];
    if (engagementOfficer) {engagementOfficer.fullName = `${engagementOfficer.first_name} ${engagementOfficer.last_name}`;}

    if (this.isReadOnly('partner', this.basePermissionPath) && engagementOfficer) {
      this.set('partner.partnerOfficers', [engagementOfficer]);
      this.authorizedOfficer = engagementOfficer;
    } else if (partner.partnerOfficers && partner.partnerOfficers.length) {
      let officerIndex = !!(engagementOfficer && ~findIndex(partner.partnerOfficers, (officer: any) => {
        return officer.id === engagementOfficer.id;
      }));

      this.authorizedOfficer = officerIndex ? engagementOfficer : partnerOfficer;
    }
  }

  validate() {
    return this.validatePartner() && this.validateActivePd();
  }

  validateActivePd() {
    let activePdInput = this.shadowRoot!.querySelector('#activePd') as EtoolsDropdownMultiEl;
    let partnerType = this.get('engagement.partner.partner_type');
    let partnerRequiresActivePd = this.specialPartnerTypes.indexOf(partnerType) === -1;

    if (activePdInput && activePdInput.required && partnerRequiresActivePd && !activePdInput.validate()) {
      activePdInput.invalid = true;
      activePdInput.errorMessage = 'Active PD is required';
      return false;
    }

    return true;
  }

  validatePartner() {
    if (!this.$.partner || !(this.$.partner as EtoolsDropdownEl).required) {return true;}
    if (!this.engagement || !this.engagement.partner || !this.engagement.partner.id) {
      this.set('errors.partner', 'Partner is required');
      (this.$.partner as EtoolsDropdownEl).invalid = true;
      return false;
    } else if (!this.partner.id) {
      this.set('errors.partner', 'Can not find partner data');
      (this.$.partner as EtoolsDropdownEl).invalid = true;
      return false;
    } else {
      return true;
    }
  }

  resetValidationErrors() {
    this.set('errors', {});
  }

  _setReadonlyClass(inProcess, basePermissionPath) {
    if (this.isReadOnly('partner', basePermissionPath)) {
      return 'disabled-as-readonly';
    } else {
      return inProcess ? 'readonly' : '';
    }
  }

  _showActivePd(partnerType, types) {
    return typeof partnerType === 'string' && types.every(type => !~partnerType.indexOf(type));
  }

  _setActivePd(engagement, partnerInterv) {
    if (!partnerInterv || !engagement) {
      this.set('activePd', []);
      return;
    }
    //let partnerType = this.get('engagement.partner.partner_type');

    //check <etools-searchable-multiselection-menu> debouncer state
    // TODO: polymer 3 migration, need to be tested mught not be needed(to be removed)
    // INFINITE LOOP on engagements list :) ... to be removed soon
    // if (this.specialPartnerTypes.indexOf(partnerType) === -1) {
    //   microTask.run(this._setActivePd.bind(this));
    //   return false;
    // }

    let originalPartnerId = this.get('originalData.partner.id');
    let partnerId = this.get('partner.id');

    if (!Number.isInteger(originalPartnerId) || !Number.isInteger(partnerId) || originalPartnerId !== partnerId) {
      this.set('activePd', []);
      this.validateActivePd();
      return false;
    }

    let activePd = this.get('engagement.active_pd') || [];
    this.set('activePd', activePd);
    this.validateActivePd();
    return true;
  }

  _requestPartner(event, id) {
    if (this.requestInProcess) {return;}

    this.set('partner', {});
    this.set('activePd', null);
    this.set('authorizedOfficer', null);

    let selectedPartner = event && event.detail && event.detail.selectedItem;

    let partnerId = (selectedPartner && selectedPartner.id || +id);
    if (!partnerId) {
      return;
    }

    if (this.isReadOnly('partner', this.basePermissionPath)) {
      this.partner = this.engagement.partner;
      this.set('partner.interventions', this.engagement.active_pd);
      return;
    } else {
      this.set('engagement.partner', selectedPartner);
    }

    this.requestInProcess = true;
    this.partnerId = partnerId; // triggers GET request for partner
    return true;
  }

  _engagementChanged(engagement) {
    if (!engagement || !engagement.partner) {
      this.set('partner', {});
      this.set('activePd', null);
    } else {
      this._requestPartner(null, engagement.partner.id);
    }
  }

  getPartnerData() {
    if (!this.validate()) {return null;}

    let data = {} as any;
    let originalPartnerId = this.get('originalData.partner.id');
    let partnerId = this.get('engagement.partner.id');
    let partnerType = this.get('engagement.partner.partner_type');
    let originalActivePd = this.get('originalData.active_pd') || [];
    let activePd = this.activePd || [];

    originalActivePd = originalActivePd.map(pd => +pd.id);
    activePd = activePd.map(pd => +pd.id);

    if (originalPartnerId !== partnerId) {
      data.partner = partnerId;
    }

    if (!isEqual(originalActivePd.sort(), activePd.sort()) && this.specialPartnerTypes.indexOf(partnerType) === -1) {
      data.active_pd = activePd;
    }

    if (isEqual(data, {})) {
      return null;
    }

    return data;
  }

  getAuthorizedOfficer() {
    if (this.isReadOnly('partner', this.basePermissionPath) || !this.authorizedOfficer || !this.authorizedOfficer.id) {return null;}
    let engagementOfficer = get(this, 'engagement.authorized_officers[0].id');
    return this.authorizedOfficer.id === engagementOfficer ? null : this.authorizedOfficer.id;
  }

  isPdReadonly(basePermissionPath, requestInProcess, partner) {
    return this.isReadOnly('active_pd', basePermissionPath, requestInProcess) || !partner.id;
  }

  activePdPlaceholder(basePermissionPath, partner) {
    if (!partner || !partner.id) {return '-';}
    return readonlyPermission(`${basePermissionPath}.active_pd`) ? 'Empty Field' : 'Select Relevant PD(s) or SSFA(s)';
    // return this.getPlaceholderText('active_pd', basePermissionPath, 'selector');
  }

  _setPlaceholderColor(partner) {
    return (!partner || !partner.id) ? 'no-data-fetched' : '';
  }

  isOfficersReadonly(basePermissionPath, requestInProcess, partner) {
    return this.isReadOnly('authorized_officers', basePermissionPath, requestInProcess) ||
      !partner || !partner.partnerOfficers || !partner.partnerOfficers.length ||
      partner.partnerOfficers.length < 2;
  }

  _setPartnerAddress(partner) {
    if (!partner) {return '';}

    return [partner.address, partner.postal_code, partner.city, partner.country]
      .filter((info) => !!info)
      .join(', ');
  }

  _checkInvalid(value) {
    return !!value;
  }

}
window.customElements.define('partner-details-tab', PartnerDetailsTab);

export {PartnerDetailsTab as PartnerDetailsTabEl}
