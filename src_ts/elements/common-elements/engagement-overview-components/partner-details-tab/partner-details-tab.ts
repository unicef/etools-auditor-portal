import {LitElement, html, PropertyValues, property, customElement} from 'lit-element';

import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/polymer/lib/elements/dom-if';

import '@unicef-polymer/etools-loading/etools-loading.js';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';

import findIndex from 'lodash-es/findIndex';
import get from 'lodash-es/get';
import isEqual from 'lodash-es/isEqual';
import {GenericObject} from '../../../../types/global';
import CommonMethodsMixin from '../../../mixins/common-methods-mixin';
import {readonlyPermission} from '../../../mixins/permission-controller';
import {getStaticData} from '../../../mixins/static-data-controller';

import {tabInputsStyles} from '../../../styles/tab-inputs-styles-lit';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles-lit';
import {moduleStyles} from '../../../styles/module-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '../../../data-elements/get-partner-data';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('partner-details-tab')
export class PartnerDetailsTab extends CommonMethodsMixin(LitElement) {
  static get styles() {
    return [moduleStyles, tabLayoutStyles, tabInputsStyles];
  }

  render() {
    return html`
    ${sharedStyles}
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
        etools-dropdown,
        etools-dropdown-multi {
          --esmm-dropdown-menu-position: absolute;
        }
      </style>

      <get-partner-data .partnerId="${this.partnerId}" @partner-loaded="${this._partnerLoaded}"></get-partner-data>

      <etools-content-panel class="content-section clearfix" panel-title="Partner Details" show-expand-btn>
        <div class="row-h group">
          <div class="input-container">
            <!-- Partner -->
            ${this.isReadOnly('partner', this.basePermissionPath)
              ? html`<paper-input
                  label="${this.getLabel('partner', this.basePermissionPath)}"
                  .value="${this.partner?.name}"
                  readonly
                ></paper-input>`
              : html`<etools-dropdown
                  id="partner"
                  class="${this._setRequired('partner', this.basePermissionPath)} ${this._setReadonlyClass(
                    this.requestInProcess,
                    this.basePermissionPath
                  )}"
                  .selected="${this.engagement.partner?.id}"
                  label="${this.getLabel('partner', this.basePermissionPath)}"
                  placeholder="${this.getPlaceholderText('partner', this.basePermissionPath, 'dropdown')}"
                  .options="${this.partners}"
                  option-label="name"
                  option-value="id"
                  ?required="${this._setRequired('partner', this.basePermissionPath)}"
                  ?invalid="${this.errors.partner}"
                  .errorMessage="${this.errors.partner}"
                  @focus="${this._resetFieldError}"
                  trigger-value-change-event
                  @etools-selected-item-changed="${this._requestPartner}"
                  dynamic-align
                >
                </etools-dropdown>`}

            <etools-loading .active="${this.requestInProcess}" no-overlay loading-text="" class="partner-loading">
            </etools-loading>
          </div>
          <div class="input-container input-container-m">
            <!-- Partner Address -->
            <paper-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this._setPartnerAddress(this.partner)}"
              label="Partner Address"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </paper-input>
          </div>
        </div>

        <div class="row-h group">
          <div class="input-container">
            <!-- Partner Phone Number -->
            <paper-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this.partner?.phone_number}"
              label="${this.getLabel('partner.phone_number', this.basePermissionPath)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </paper-input>
          </div>

          <div class="input-container">
            <!-- Partner E-mail Address -->
            <paper-input
              class="${this._setReadonlyFieldClass(this.partner)}"
              .value="${this.partner?.email}"
              label="${this.getLabel('partner.email', this.basePermissionPath)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </paper-input>
          </div>

          <div class="input-container">
            <!-- Partner  Officers-->
            <etools-dropdown
              id="authorizedOfficer"
              class="${this._setRequired('authorized_officers', this.basePermissionPath)} ${this._setPlaceholderColor(
                this.partner
              )}"
              .selected="${this.authorizedOfficer?.id}"
              label="${this.getLabel('authorized_officers', this.basePermissionPath)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              .options="${this.partner?.partnerOfficers}"
              option-label="fullName"
              option-value="id"
              ?required="${this._setRequired('authorized_officers', this.basePermissionPath)}"
              ?invalid="${this._checkInvalid(this.errors.authorized_officers)}"
              ?readonly="${this.isOfficersReadonly(this.basePermissionPath, this.requestInProcess, this.partner)}"
              .errorMessage="${this.errors.authorized_officers}"
              @focus="${this._resetFieldError}"
              dynamic-align
              data-value-path="detail.selectedItem"
              data-field-path="authorizedOfficer"
              @etools-selected-item-changed="${this._setField}"
              trigger-value-change-event
            >
            </etools-dropdown>
          </div>
        </div>

        ${this._showActivePd(this.partner?.partner_type, this.specialPartnerTypes)
          ? html` <div class="row-h group">
              <div class="input-container input-container-l">
                <!-- Active PD -->
                <etools-dropdown-multi
                  id="activePd"
                  class="${this._setPlaceholderColor(this.partner)}"
                  .selectedValues="${this.activePdIds}"
                  label="${this.getLabel('active_pd', this.basePermissionPath)}"
                  placeholder="${this.activePdPlaceholder(this.basePermissionPath, this.partner)}"
                  .options="${this.partner?.interventions}"
                  option-label="number"
                  option-value="id"
                  ?readonly="${this.isPdReadonly(this.basePermissionPath, this.requestInProcess, this.partner)}"
                  ?invalid="${this.errors.active_pd}"
                  .errorMessage="${this.errors.active_pd}"
                  @focus="${this._resetFieldError}"
                  dynamic-align
                  trigger-value-change-event
                  data-value-path="target.selectedValues"
                  data-field-path="activePdIds"
                  @etools-selected-items-changed="${this._setField}"
                >
                </etools-dropdown-multi>
              </div>
            </div>`
          : ``}
      </etools-content-panel>
    `;
  }

  @property({type: Array})
  partners!: [];

  @property({type: Array})
  specialPartnerTypes = ['Bilateral / Multilateral', 'Government'];

  @property({type: Boolean})
  requestInProcess = false;

  @property({type: Object})
  errors: GenericObject = {};

  @property({type: Object})
  errorObject!: GenericObject;

  @property({type: Object})
  originalData!: GenericObject;

  @property({type: Object})
  tabTexts: GenericObject = {
    name: 'Partner Details',
    fields: ['authorized_officers', 'active_pd', 'partner']
  };

  @property({type: Object})
  partner!: GenericObject;

  @property({type: Array})
  activePdIds!: any[];

  @property({type: Object})
  authorizedOfficer!: GenericObject;

  @property({type: Object})
  engagement!: GenericObject;

  @property({type: Object})
  partnerId!: GenericObject | null;

  connectedCallback() {
    super.connectedCallback();
    this.partners = getStaticData('partners');
    this._initListeners();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('basePermissionPath')) {
      this._basePathChanged();
    }
    if (changedProperties.has('engagement') || changedProperties.has('basePermissionPath')) {
      this._engagementChanged(this.engagement);
    }
    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
    }
    if (changedProperties.has('engagement') || changedProperties.has('partner') || changedProperties.has('partnerId')) {
      this._setActivePd(this.engagement, this.partner?.interventions);
    }
    if (
      changedProperties.has('engagement') ||
      changedProperties.has('partner') ||
      changedProperties.has('basePermissionPath')
    ) {
      this.setOfficers(this.partner, this.engagement);
    }
    // @dci 'updateStyles(basePermissionPath, requestInProcess, partner, engagement.engagement_type)',
  }

  _initListeners() {
    this._partnerLoaded = this._partnerLoaded.bind(this);
  }

  _partnerLoaded(event: CustomEvent) {
    if (event.detail) {
      this.partner = event.detail;
    }
    this.partnerId = null;
    this.errors = {};
    this.requestInProcess = false;
    this.validatePartner();
  }

  setOfficers(partner, engagement) {
    if (!partner || !partner.id) {
      this.authorizedOfficer = null;
      return;
    }
    const engagementOfficer = engagement && engagement.authorized_officers && engagement.authorized_officers[0];
    const partnerOfficer = partner && partner.partnerOfficers && partner.partnerOfficers[0];
    if (engagementOfficer) {
      engagementOfficer.fullName = `${engagementOfficer.first_name} ${engagementOfficer.last_name}`;
    }

    if (this.isReadOnly('partner', this.basePermissionPath) && engagementOfficer) {
      this.partner.partnerOfficers = [engagementOfficer];
      this.authorizedOfficer = engagementOfficer;
    } else if (partner.partnerOfficers && partner.partnerOfficers.length) {
      const officerIndex = !!(
        engagementOfficer &&
        ~findIndex(partner.partnerOfficers, (officer: any) => {
          return officer.id === engagementOfficer.id;
        })
      );

      this.authorizedOfficer = officerIndex ? engagementOfficer : partnerOfficer;
    }
  }

  validate() {
    return this.validatePartner() && this.validateActivePd();
  }

  validateActivePd() {
    // TODO - this logic doesn't seem to be needed, because activePdInput.required is always false, confirm & remove
    const activePdInput = this.shadowRoot!.querySelector('#activePd') as EtoolsDropdownMultiEl;
    const partnerType = this.engagement.partner?.partner_type;
    const partnerRequiresActivePd = this.specialPartnerTypes.indexOf(partnerType) === -1;

    if (activePdInput && activePdInput.required && partnerRequiresActivePd && !activePdInput.validate()) {
      activePdInput.invalid = true;
      activePdInput.errorMessage = 'Active PD is required';
      return false;
    }

    return true;
  }

  validatePartner() {
    const partnerEl = this.shadowRoot!.querySelector('#partner') as EtoolsDropdownEl;
    if (!partnerEl || !partnerEl.required) {
      if (partnerEl) {
        partnerEl.invalid = false;
      }
      return true;
    }
    if (!this.engagement?.partner?.id) {
      this.errors = {...this.errors, partner: 'Partner is required'};
      partnerEl.invalid = true;
      return false;
    } else if (!this.partner.id) {
      this.errors = {...this.errors, partner: 'Can not find partner data'};
      partnerEl.invalid = true;
      return false;
    } else {
      partnerEl.invalid = false;
      return true;
    }
  }

  resetValidationErrors() {
    this.errors = {};
  }

  _setReadonlyClass(inProcess, basePermissionPath) {
    return inProcess || this.isReadOnly('partner', basePermissionPath) ? 'readonly' : '';
  }

  _showActivePd(partnerType, types) {
    return typeof partnerType === 'string' && types.every((type) => !~partnerType.indexOf(type));
  }

  _setActivePd(engagement, partnerInterv) {
    if (!partnerInterv || !engagement) {
      this.activePdIds = [];
      return;
    }
    // let partnerType = this.get('engagement.partner.partner_type');

    // check <etools-searchable-multiselection-menu> debouncer state
    // TODO: polymer 3 migration, need to be tested mught not be needed(to be removed)
    // INFINITE LOOP on engagements list :) ... to be removed soon
    // if (this.specialPartnerTypes.indexOf(partnerType) === -1) {
    //   microTask.run(this._setActivePd.bind(this));
    //   return false;
    // }

    const originalPartnerId = this.originalData?.partner?.id;
    const partnerId = this.partner.id;

    if (!Number.isInteger(originalPartnerId) || !Number.isInteger(partnerId) || originalPartnerId !== partnerId) {
      this.activePdIds = [];
      this.validateActivePd();
      return false;
    }

    const activePd = this.engagement.active_pd || [];
    this.activePdIds = activePd.map((pd) => pd.id);
    this.validateActivePd();
    return true;
  }

  _requestPartner(event, id) {
    if (this.requestInProcess) {
      return;
    }

    this.partner = {};
    this.activePdIds = null;
    this.authorizedOfficer = null;

    const selectedPartner = event && event.detail && event.detail.selectedItem;

    const partnerId = (selectedPartner && selectedPartner.id) || +id;
    if (!partnerId) {
      return;
    }

    if (this.isReadOnly('partner', this.basePermissionPath)) {
      this.partner = this.engagement.partner;
      this.partner.interventions = this.engagement.active_pd;
      return;
    } else {
      this.engagement.partner = selectedPartner;
    }

    this.requestInProcess = true;
    this.partnerId = partnerId; // triggers GET request for partner
    return true;
  }

  _engagementChanged(engagement) {
    if (!engagement || !engagement.partner) {
      this.partner = {};
      this.activePdIds = null;
    } else {
      this._requestPartner(null, engagement.partner.id);
    }
  }

  getPartnerData() {
    if (!this.validate()) {
      return null;
    }

    const data = {} as any;
    const originalPartnerId = this.originalData.partner.id;
    const partnerId = this.engagement.partner.id;
    const partnerType = this.engagement.partner.partner_type;
    let originalActivePd = this.originalData.active_pd || [];
    const activePdIds = (this.activePdIds || []).map((id) => +id);

    originalActivePd = originalActivePd.map((pd) => +pd.id);

    if (originalPartnerId !== partnerId) {
      data.partner = partnerId;
    }

    if (!isEqual(originalActivePd.sort(), activePdIds.sort()) && this.specialPartnerTypes.indexOf(partnerType) === -1) {
      data.active_pd = activePdIds;
    }

    if (isEqual(data, {})) {
      return null;
    }

    return data;
  }

  getAuthorizedOfficer() {
    if (this.isReadOnly('partner', this.basePermissionPath) || !this.authorizedOfficer || !this.authorizedOfficer.id) {
      return null;
    }
    const engagementOfficer = get(this, 'engagement.authorized_officers[0].id');
    return this.authorizedOfficer.id === engagementOfficer ? null : this.authorizedOfficer.id;
  }

  isPdReadonly(basePermissionPath, requestInProcess, partner) {
    return this.isReadOnly('active_pd', basePermissionPath, requestInProcess) || !partner.id;
  }

  activePdPlaceholder(basePermissionPath, partner) {
    if (!partner || !partner.id) {
      return '–';
    }
    return readonlyPermission(`${basePermissionPath}.active_pd`) ? '–' : 'Select Relevant PD(s) or SSFA(s)';
    // return this.getPlaceholderText('active_pd', basePermissionPath, 'selector');
  }

  _setPlaceholderColor(partner) {
    return !partner || !partner.id ? 'no-data-fetched' : '';
  }

  isOfficersReadonly(basePermissionPath, requestInProcess, partner) {
    return (
      this.isReadOnly('authorized_officers', basePermissionPath, requestInProcess) ||
      !partner ||
      !partner.partnerOfficers ||
      !partner.partnerOfficers.length ||
      partner.partnerOfficers.length < 2
    );
  }

  _setPartnerAddress(partner) {
    if (!partner) {
      return '';
    }

    return [partner.address, partner.postal_code, partner.city, partner.country].filter((info) => !!info).join(', ');
  }

  _checkInvalid(value) {
    return !!value;
  }
}
