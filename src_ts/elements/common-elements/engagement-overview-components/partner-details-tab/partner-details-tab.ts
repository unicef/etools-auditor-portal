import {LitElement, PropertyValues, html} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import '@polymer/paper-tooltip/paper-tooltip.js';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import '@polymer/paper-input/paper-input-container.js';

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

import {tabInputsStyles} from '../../../styles/tab-inputs-styles';
import {tabLayoutStyles} from '../../../styles/tab-layout-styles';
import {moduleStyles} from '../../../styles/module-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import '../../../data-elements/get-partner-data';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../redux/store';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {updateCurrentEngagement} from '../../../../redux/actions/engagement';

/**
 * main menu
 * @LitElement
 * @customElement
 */
@customElement('partner-details-tab')
export class PartnerDetailsTab extends connect(store)(CommonMethodsMixin(LitElement)) {
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
            ${this.isReadOnly('partner', this.optionsData)
              ? html`<paper-input
                  label="${this.getLabel('partner', this.optionsData)}"
                  .value="${this.partner?.name}"
                  readonly
                ></paper-input>`
              : html`<etools-dropdown
                  id="partner"
                  class="${this._setRequired('partner', this.optionsData)} ${this._setReadonlyClass(
                    this.requestInProcess,
                    this.optionsData
                  )}"
                  .selected="${this.engagement.partner?.id}"
                  label="${this.getLabel('partner', this.optionsData)}"
                  placeholder="${this.getPlaceholderText('partner', this.optionsData, 'dropdown')}"
                  .options="${this.partners}"
                  option-label="name"
                  option-value="id"
                  ?required="${this._setRequired('partner', this.optionsData)}"
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
              label="${this.getLabel('partner.phone_number', this.optionsData)}"
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
              label="${this.getLabel('partner.email', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              readonly
            >
            </paper-input>
          </div>

          <div class="input-container">
            <!-- Partner  Officers-->
            <etools-dropdown
              id="authorizedOfficer"
              class="${this._setRequired('authorized_officers', this.optionsData)} ${this._setPlaceholderColor(
                this.partner
              )}"
              .selected="${this.authorizedOfficer?.id}"
              label="${this.getLabel('authorized_officers', this.optionsData)}"
              placeholder="${this.getReadonlyPlaceholder(this.partner)}"
              .options="${this.partner?.partnerOfficers}"
              option-label="fullName"
              option-value="id"
              ?required="${this._setRequired('authorized_officers', this.optionsData)}"
              ?invalid="${this._checkInvalid(this.errors.authorized_officers)}"
              ?readonly="${this.isOfficersReadonly(this.optionsData, this.requestInProcess, this.partner)}"
              .errorMessage="${this.errors.authorized_officers}"
              @focus="${this._resetFieldError}"
              dynamic-align
              @etools-selected-item-changed="${(event: CustomEvent) => {
                if (this.authorizedOfficer) {
                  this.authorizedOfficer.id = event.detail.selectedItem?.id;
                }
              }}"
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
                  label="${this.getLabel('active_pd', this.optionsData)}"
                  placeholder="${this.activePdPlaceholder(this.optionsData, this.partner)}"
                  .options="${this.partner?.interventions}"
                  option-label="number"
                  option-value="id"
                  ?readonly="${this.isPdReadonly(this.optionsData, this.requestInProcess, this.partner)}"
                  ?invalid="${this.errors.active_pd}"
                  .errorMessage="${this.errors.active_pd}"
                  @focus="${this._resetFieldError}"
                  dynamic-align
                  trigger-value-change-event
                  @etools-selected-items-changed="${({detail}: CustomEvent) => {
                    const newIds = detail.selectedItems.map((i: any) => i.id);
                    this.activePdIds = newIds;
                  }}"
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
  authorizedOfficer: GenericObject | null = null;

  _engagement!: AnyObject;

  set engagement(engagement: AnyObject) {
    const isInitialSet = !this._engagement;
    this._engagement = engagement;
    if (isInitialSet) {
      this._engagementChanged(this.engagement);
    }
  }

  @property({type: Object})
  get engagement() {
    return this._engagement;
  }

  @property({type: String})
  partnerId!: string | null;

  connectedCallback() {
    super.connectedCallback();
    this._initListeners();
  }

  stateChanged(state: RootState) {
    if (state.commonData.loadedTimestamp && !isJsonStrMatch(this.partners, state.commonData.partners)) {
      this.partners = [...state.commonData.partners];
    }
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('errorObject')) {
      this._errorHandler(this.errorObject);
    }
  }

  _initListeners() {
    this._partnerLoaded = this._partnerLoaded.bind(this);
  }

  _partnerLoaded(event: CustomEvent) {
    if (event.detail) {
      this.partner = event.detail;
    }
    this.setOfficers(this.partner, this.engagement);
    this._setActivePd(this.engagement, this.partner?.interventions);
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

    if (this.isReadOnly('partner', this.optionsData) && engagementOfficer) {
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
    const activePdInput = this.shadowRoot?.querySelector('#activePd') as EtoolsDropdownMultiEl;
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
    const partnerEl = this.shadowRoot?.querySelector('#partner') as EtoolsDropdownEl;
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

  _setReadonlyClass(inProcess, optionsData) {
    return inProcess || this.isReadOnly('partner', optionsData) ? 'readonly' : '';
  }

  _showActivePd(partnerType, types) {
    return typeof partnerType === 'string' && types.every((type) => !~partnerType.indexOf(type));
  }

  _setActivePd(engagement, partnerInterv) {
    if (!engagement || !partnerInterv) {
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
    this.activePdIds = [];
    this.authorizedOfficer = null;
    const selectedPartner = event && event.detail && event.detail.selectedItem;

    const partnerId = (selectedPartner && selectedPartner.id) || +id;
    if (!partnerId) {
      return;
    }

    if (this.isReadOnly('partner', this.optionsData)) {
      this.partner = this.engagement.partner;
      this.partner.interventions = this.engagement.active_pd;
      return;
    } else {
      this.engagement.partner = selectedPartner;
      store.dispatch(updateCurrentEngagement(this.engagement));
    }

    this.requestInProcess = true;
    this.partnerId = partnerId; // triggers GET request for partner
    return true;
  }

  _engagementChanged(engagement) {
    if (!engagement || !engagement.partner) {
      this.partner = {};
      this.activePdIds = [];
    } else {
      this._requestPartner(null, engagement.partner.id);
    }
    this._setActivePd(this.engagement, this.partner?.interventions);
    this.setOfficers(this.partner, this.engagement);
  }

  getPartnerData() {
    if (!this.validate()) {
      return null;
    }

    const data = {} as any;
    const originalPartnerId = this.originalData?.partner?.id;
    const partnerId = this.engagement?.partner?.id;
    const partnerType = this.engagement?.partner?.partner_type;
    let originalActivePd = this.originalData?.active_pd || [];
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
    if (this.isReadOnly('partner', this.optionsData) || !this.authorizedOfficer || !this.authorizedOfficer.id) {
      return null;
    }
    const engagementOfficer = get(this, 'engagement.authorized_officers[0].id');
    return this.authorizedOfficer.id === engagementOfficer ? null : this.authorizedOfficer.id;
  }

  isPdReadonly(permissions: AnyObject, requestInProcess, partner) {
    return this.isReadOnly('active_pd', permissions, requestInProcess) || !partner.id;
  }

  activePdPlaceholder(permissions: AnyObject, partner) {
    if (!partner || !partner.id) {
      return '–';
    }
    return readonlyPermission('active_pd', permissions) ? '–' : 'Select Relevant PD(s) or SSFA(s)';
    // return this.getPlaceholderText('active_pd', permissions, 'selector');
  }

  _setPlaceholderColor(partner) {
    return !partner || !partner.id ? 'no-data-fetched' : '';
  }

  isOfficersReadonly(permissions: AnyObject, requestInProcess, partner) {
    return (
      this.isReadOnly('authorized_officers', permissions, requestInProcess) ||
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
