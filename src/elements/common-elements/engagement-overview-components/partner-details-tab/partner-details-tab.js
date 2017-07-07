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
        '_engagementChanged(engagement.partner)',
        '_errorHandler(errorObject)',
        '_setActivePd(activePd)'
    ],

    listeners: {
        'partner-loaded': '_partnerLoaded'
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
        }
    },

    _requestPartner: function(event, id) {
        if (this.requestInProcess) { return; }

        this.set('partner', {});
        this.set('activePd', null);

        let partnerId = (event && event.detail && event.detail.selectedValues && event.detail.selectedValues.id) || id;
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

    _engagementChanged: function(partner) {
        if (!partner) {
            this.set('partner', {});
            this.set('activePd', null);
        } else {
            this._requestPartner(null, partner.id);
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

    isPdReadonly: function(basePermissionPath, requestInProcess, partner) {
        return this.isReadOnly('active_pd', basePermissionPath, requestInProcess) || !partner.id;
    }

});
