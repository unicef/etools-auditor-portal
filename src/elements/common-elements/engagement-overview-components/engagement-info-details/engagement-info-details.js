'use strict';

Polymer({
    is: 'engagement-info-details',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        },
        auditTypes: {
            type: Array,
            value: function() {
                return [{
                    label: 'Micro Assessment',
                    link: 'micro-assessments',
                    value: 'ma'
                }, {
                    label: 'Audit',
                    link: 'audits',
                    value: 'audit'
                }, {
                    label: 'Spot Check',
                    link: 'spot-checks',
                    value: 'sc'
                }];
            }
        },
        partners: Array,
        data: {
            type: Object,
            notify: true
        }
    },
    listeners: {
        'agreement-loaded': '_agreementLoaded'
    },
    ready: function() {
        this.set('partners', this.getData('partners'));
        this.$.purchaseOrder.validate = this._validatePurchaseOrder.bind(this, this.$.purchaseOrder);
    },
    _basePathChanged: function() {
        this.updateStyles();
    },
    validate: function() {
        let typeValid = this.$.auditType.validate(),
            partnerValid = this.$.partner.validate(),
            orderValid = this.$.purchaseOrder.validate();

        return typeValid && partnerValid && orderValid;
    },
    resetValidationErrors: function() {
        this.$.auditType.invalid = false;
        this.$.partner.invalid = false;
        this.$.purchaseOrder.invalid = false;
    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.${field}`);

        return required ? 'required' : false;
    },
    _resetFieldError: function(event) {
        event.target.invalid = false;
    },
    _processValue: function(value) {
        if (typeof value === 'string') {
            return this.auditTypes.filter((type) => {
                return type.value === value;
            })[0];
        } else {
            return value;
        }
    },
    _setAuditType: function(e, value) {
        this.set('data.type', value.selectedValues);
    },
    isReadOnly: function(field) {
        if (!this.basePermissionPath) { return true; }

        let readOnly = this.isReadonly(`${this.basePermissionPath}.${field}`);
        if (readOnly === null) { readOnly = true; }

        return readOnly;
    },
    _requestAgreement: function(event) {
        if (this.requestInProcess) { return; }

        let input = event && event.target,
            value = input && +input.value;

        this.resetAgreement();

        if (!value) { return; }

        this.requestInProcess = true;
        this.orderNumber = value;
        return true;
    },
    _agreementLoaded: function() {
        this.requestInProcess = false;
        this.$.purchaseOrder.validate();
    },
    resetAgreement: function() {
        this.set('data.agreement', {order_number: this.data && this.data.agreement && this.data.agreement.order_number});
    },
    _validatePurchaseOrder: function(orderInput) {
        if (this.requestInProcess) {
            this.orderInputInvalid = true;
            this.orderNumberErrorText = 'Please, wait until Purchase Order loaded';
            return false;
        }
        let value = orderInput && orderInput.value;
        if (!value && orderInput && orderInput.required) {
            this.orderInputInvalid = true;
            this.orderNumberErrorText = 'Purchase order is required';
            return false;
        }
        if (!this.data || !this.data.agreement || !this.data.agreement.id) {
            this.orderNumberErrorText = 'Purchase order not found';
            this.orderInputInvalid = true;
            return false;
        }
        this.orderInputInvalid = false;
        return true;
    },
    resetType: function() {
        this.$.auditType.value = '';
    }
});
