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
        '_setActivePd(activePd)',
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
            this.authorizedOfficer = !!engagementOfficer && ~_.findIndex(partner.partnerOfficers, officer => { return officer.id === engagementOfficer.id; }) ?
                engagementOfficer : partnerOfficer;
        }
    },

    ready: function() {
        this.set('partners', this.getData('partners'));
    },

    validate: function() {
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
        this.$.partner.invalid = false;
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

    _setActivePd: function() {
        if (this.isReadOnly('partner', this.basePermissionPath) && !this.activePd) {
            if (!this.engagement || !this.engagement.active_pd) { return; }

            let activePd = this.engagement.active_pd.map((pd) => {
                return pd.id;
            });
            this.set('activePd', activePd);
            return true;
        }
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
        this.validate();
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
        if (!this.originalData || this.originalData.partner.id !== this.engagement.partner.id) {
            let partnerId = this.engagement.partner.id;

            return {
                partner: partnerId,
                active_pd: this.activePd
            };
        } else {
            return null;
        }
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
        return this.getPlaceholderText('active_pd', basePermissionPath, 'selector');
    },

    _setPlaceholderColor: function(partner) {
        return (!partner || !partner.id) ? 'no-data-fetched' : '';
    },

    isOfficersReadonly: function(basePermissionPath, requestInProcess, partner) {
        return this.isReadOnly('authorized_officers', basePermissionPath, requestInProcess) ||
            !partner || !partner.partnerOfficers || !partner.partnerOfficers.length ||
            partner.partnerOfficers.length < 2;
    },

    _setPartnerAddres: function(partner) {
        if (!partner || !((partner.address || partner.street_address) && partner.postal_code && partner.city)) { return ''; }

        let address = partner.street_address || partner.address;
        return `${partner.city ? partner.city + ', ' : ''} ${address ? address + ', ' : ''} ${partner.postal_code || ''}`;
    }
});
