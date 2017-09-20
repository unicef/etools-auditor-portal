'use strict';

Polymer({
    is: 'partner-details-tab',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.CommonMethodsBehavior
    ],

    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        },
        partners: Array,
        requestInProcess: {
            type: Boolean,
            value: false
        },
        errors: {
            type: Object,
            value: function() {
                return {};
            }
        }
    },

    observers: [
        '_engagementChanged(engagement, basePermissionPath)',
        '_errorHandler(errorObject)',
        '_setActivePd(engagement, partner.interventions)',
        'updateStyles(basePermissionPath, requestInProcess, partner)',
        'setOfficers(partner, engagement, basePermissionPath)'
    ],

    listeners: {
        'partner-loaded': '_partnerLoaded'
    },

    setOfficers: function(partner, engagement) {
        if (!partner || !partner.id) {
            this.set('authorizedOfficer', null);
            return;
        }
        let engagementOfficer = engagement && engagement.authorized_officers && engagement.authorized_officers[0],
            partnerOfficer = partner && partner.partnerOfficers && partner.partnerOfficers[0];
        if (engagementOfficer) { engagementOfficer.fullName = `${engagementOfficer.first_name} ${engagementOfficer.last_name}`; }

        if (this.isReadOnly('partner', this.basePermissionPath) && engagementOfficer) {
            this.partner.partnerOfficers = [engagementOfficer];
            this.authorizedOfficer = engagementOfficer;
        } else if (partner.partnerOfficers && partner.partnerOfficers.length) {
            let officerIndex = !!(engagementOfficer && ~_.findIndex(partner.partnerOfficers, officer => {
                return officer.id === engagementOfficer.id;
            }));

            this.authorizedOfficer = officerIndex ? engagementOfficer : partnerOfficer;
        }
    },

    ready: function() {
        this.set('partners', this.getData('partners'));
    },

    validate: function() {
        let activePd = Polymer.dom(this.root).querySelector('#activePd');
        let partnerType = this.get('engagement.partner.partner_type');
        let activePdValid = activePd ? activePd.validate() : false;

        if (!activePdValid) { this.set('errors.active_pd', 'Active PD is required'); }

        return this.validatePartner() && (activePdValid || !this._showActivePd(partnerType));
    },

    validatePartner: function() {
        if (!this.$.partner || !this.$.partner.required) { return true; }
        if (!this.engagement || !this.engagement.partner || !this.engagement.partner.id) {
            this.set('errors.partner', 'Partner is required');
            return false;
        } else if (!this.partner.id) {
            this.set('errors.partner', 'Can not find partner data');
            this.$.partner.invalid = true;
            return false;
        } else {
            return true;
        }
    },

    resetValidationErrors: function() {
        this.set('errors.partner', '');
        // this.$.partner.invalid = false;
    },

    _resetFieldError: function() {
        this.set('errors.partner', false);
        this.set('errors.active_pd', false);
    },

    _setReadonlyClass: function(inProcess, basePermissionPath) {
        if (this.isReadOnly('partner', basePermissionPath)) {
            return 'disabled-as-readonly';
        } else {
            return inProcess ? 'readonly' : '';
        }
    },

    _showActivePd: function(partnerType) {
        return typeof partnerType === 'string' && partnerType !== 'Government';
    },

    _setActivePd: function() {
        let esmm = Polymer.dom(this.root).querySelector('#activePd');
        let partnerType = this.get('engagement.partner.partner_type');

        //check <etools-searchable-multiselection-menu> debouncer state
        if ((!esmm || esmm.isDebouncerActive('selectionChanged')) && partnerType !== 'Government') {
            this.async(this._setActivePd, 50);
            return false;
        }

        let originalPartnerId = this.get('originalData.partner.id');
        let partnerId = this.get('partner.id');

        if (!Number.isInteger(originalPartnerId) || !Number.isInteger(partnerId) || originalPartnerId !== partnerId) {
            this.set('activePd', []);
            return false;
        }

        let activePd = this.get('engagement.active_pd') || [];
        this.set('activePd', activePd);
        return true;
    },

    _requestPartner: function(event, id) {
        if (this.requestInProcess) { return; }

        this.set('partner', {});
        this.set('activePd', null);
        this.set('authorizedOfficer', null);

        let partnerId = (event && event.detail && event.detail.selectedValues && event.detail.selectedValues.id) || +id;
        if (!partnerId) { return; }
        if (this.isReadOnly('partner', this.basePermissionPath)) {
            this.partner = this.engagement.partner;
            this.set('partner.interventions', this.engagement.active_pd);
            return;
        }

        this.requestInProcess = true;
        this.partnerId = partnerId;
        return true;
    },

    _partnerLoaded: function() {
        this.requestInProcess = false;
        this.validatePartner();
    },

    _engagementChanged: function(engagement) {
        if (!engagement || !engagement.partner) {
            this.set('partner', {});
            this.set('activePd', null);
        } else {
            this._requestPartner(null, engagement.partner.id);
        }
    },

    getPartnerData: function() {
        if (!this.validate()) { return null; }

        let data = {};
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

        if (!_.isEqual(originalActivePd.sort(), activePd.sort()) && partnerType !== 'Government') {
            data.active_pd = activePd;
        }

        if (_.isEqual(data, {})) {
            return null;
        }

        return data;
    },

    getAuthorizedOfficer: function() {
        if (this.isReadOnly('partner', this.basePermissionPath) || !this.authorizedOfficer || !this.authorizedOfficer.id) { return null; }
        return this.authorizedOfficer.id;
    },

    isPdReadonly: function(basePermissionPath, requestInProcess, partner) {
        return this.isReadOnly('active_pd', basePermissionPath, requestInProcess) || !partner.id;
    },

    activePdPlaceholder: function(basePermissionPath, partner) {
        if (!partner || !partner.id) { return '-'; }
        return this.isReadonly(`${basePermissionPath}.active_pd`) ? 'Empty Field' : 'Select Relevant PD(s)';
        // return this.getPlaceholderText('active_pd', basePermissionPath, 'selector');
    },

    _setPlaceholderColor: function(partner) {
        return (!partner || !partner.id) ? 'no-data-fetched' : '';
    },

    isOfficersReadonly: function(basePermissionPath, requestInProcess, partner) {
        return this.isReadOnly('authorized_officers', basePermissionPath, requestInProcess) ||
            !partner || !partner.partnerOfficers || !partner.partnerOfficers.length ||
            partner.partnerOfficers.length < 2;
    },

    _setPartnerAddress: function(partner) {
        if (!partner) { return ''; }

        let address = partner.street_address || partner.address;
        return [partner.city, address, partner.postal_code]
            .filter((info) => !!info)
            .join(', ');
    }
});
