'use strict';

Polymer({
    is: 'engagement-info-details',
    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior
    ],
    properties: {
        basePermissionPath: {
            type: String,
            observer: '_basePathChanged'
        },
        engagementTypes: {
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
        data: {
            type: Object,
            notify: true
        },
        originalData: {
            type: Object,
            value: function() {
                return {};
            }
        },
        errors: {
            type: Object,
            value: function() {
                return {};
            }
        },
        engagementType: {
            type: String,
            value: ''
        },
        maxDate: {
            type: Date,
            value: function() {
                let nextDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1);
                return new Date(nextDay - 1);
            }
        }
    },
    listeners: {
        'agreement-loaded': '_agreementLoaded'
    },
    observers: [
        '_errorHandler(errorObject)',
        '_setShowInput(data.type)'
    ],
    ready: function() {
        this.$.purchaseOrder.validate = this._validatePurchaseOrder.bind(this, this.$.purchaseOrder);
    },
    _basePathChanged: function() {
        this.updateStyles();
    },
    validate: function() {
        let typeValid = this.$.engagementType.validate(),
            orderValid = this.$.purchaseOrder.validate();

        if (!typeValid) {
            this.set('errors.type', 'AuditType is required');
        }

        let elements = Polymer.dom(this.root).querySelectorAll('.validate-field');
        let valid = true;
        _.each(elements, element => {
            if (element.required && !element.validate()) {
                element.errorMessage = 'Field is required';
                element.invalid = true;
                valid = false;
            }
        });

        let periodStart = Polymer.dom(this.root).querySelector('#periodStartDateInput'),
            periodEnd = Polymer.dom(this.root).querySelector('#periodEndDateInput'),
            startValue = periodStart ? Date.parse(periodStart.value) : 0,
            endValue = periodEnd ? Date.parse(periodEnd.value) : 0;

        if (periodEnd && periodStart && periodEnd && startValue && startValue > endValue) {
            periodEnd.errorMessage = 'This date should be after Period Start Date';
            periodEnd.invalid = true;
            valid = false;
        }

        return typeValid && orderValid && valid;
    },
    resetValidationErrors: function() {
        this.set('errors.type', false);
        this.set('errors.agreement', false);
    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }

        let required = this.isRequired(`${this.basePermissionPath}.${field}`);

        return required ? 'required' : false;
    },
    _resetFieldError: function(event) {
        this.set(`errors.${event.target.getAttribute('field')}`, false);
        event.target.invalid = false;
    },
    _processValue: function(value) {
        if (typeof value === 'string') {
            return this.engagementTypes.filter((type) => {
                return type.value === value;
            })[0];
        } else {
            return value;
        }
    },
    _setEngagementType: function(e, value) {
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
            value = input && input.value;

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
            this.set('errors.agreement', 'Please, wait until Purchase Order loaded');
            return false;
        }
        let value = orderInput && orderInput.value;
        if (!value && orderInput && orderInput.required) {
            this.set('errors.agreement', 'Purchase order is required');
            return false;
        }
        if (!this.data || !this.data.agreement || !this.data.agreement.id) {
            this.set('errors.agreement', 'Purchase order not found');
            return false;
        }
        this.set('errors.agreement', false);
        return true;
    },
    resetType: function() {
        this.$.engagementType.value = '';
    },
    getEngagementData: function() {
        let data = {};

        if (this.originalData.start_date !== this.data.start_date) { data.start_date = this.data.start_date; }
        if (this.originalData.end_date !== this.data.end_date) { data.end_date = this.data.end_date; }
        if (this.originalData.partner_contacted_at !== this.data.partner_contacted_at) { data.partner_contacted_at = this.data.partner_contacted_at; }
        if (!this.originalData.agreement || this.originalData.agreement.id !== this.data.agreement.id) { data.agreement = this.data.agreement.id; }
        if (this.originalData.total_value !== this.data.total_value) { data.total_value = this.data.total_value; }
        if (this.originalData.type !== this.data.type.value) { data.type = this.data.type.value; }

        return data;
    },
    _errorHandler: function(errorData) {
        if (!errorData) { return; }
        this.set('errors', _.clone(this.refactorErrorObject(errorData)));
    },
    _setContractDates: function(agreement) {
        if (!agreement) { return; }
        let start = agreement.contract_start_date,
            end = agreement.contract_end_date;

        if (!start || !end) { return ''; }
        return `${this.prettyDate(start)} - ${this.prettyDate(end)}`;
    },
    _setShowInput: function(type) {
        if (typeof type === 'string' && type !== 'ma') {
            this.showInput = true;
        } else if (typeof type === 'object' && type && type.value && type.value !== 'ma') {
            this.showInput = true;
        } else {
            this.showInput = false;
        }
    }
});
