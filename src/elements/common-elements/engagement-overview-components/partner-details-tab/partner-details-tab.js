'use strict';

Polymer({
    is: 'partner-details-tab',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
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
        '_errorHandler(errorObject)'
    ],
    listeners: {
        'partner-loaded': '_partnerLoaded'
    },
    ready: function() {
        this.set('partners', this.getData('partners'));
    },
    _basePathChanged: function() {
        this.updateStyles();
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
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.${field}`);

        return required ? 'required' : false;
    },
    _resetFieldError: function() {
        this.set('errors.partner', false);
    },
    isReadOnly: function(field, basePermissionPath, inProcess) {
        if (!basePermissionPath || inProcess) { return true; }

        let readOnly = this.isReadonly(`${basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly;
    },
    _setReadonlyClass: function(inProcess, basePermissionPath) {
        if (this.isReadOnly('partner', basePermissionPath)) {
            return 'disabled-as-readonly';
        } else {
            return inProcess ? 'readonly' : '';
        }
    },
    _requestPartner: function(event, id) {
        if (this.requestInProcess) { return; }

        this.set('partner', {});

        let partnerId = (event && event.detail && event.detail.selectedValues && event.detail.selectedValues.id) || id;
        if (!partnerId) { return; }
        if (this.isReadOnly('partner', this.basePermissionPath)) {
            this.partner = this.engagement.partner;
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
        } else {
            this._requestPartner(null, partner.id);
        }
    },
    getPartnerData: function() {
        let partner = null;
        if (!this.originalData || this.originalData.partner.id !== this.engagement.partner.id) {
            partner = this.engagement.partner.id;
        }
        return partner;
    },
    _errorHandler: function(errorData) {
        if (!errorData) { return; }
        this.set('errors', this.refactorErrorObject(errorData));
    }
});
