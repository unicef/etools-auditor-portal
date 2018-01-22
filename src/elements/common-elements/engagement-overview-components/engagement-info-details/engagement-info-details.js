'use strict';

Polymer({
    is: 'engagement-info-details',

    behaviors: [
        APBehaviors.DateBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.CommonMethodsBehavior
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
                }, {
                    label: 'Special Audit',
                    link: 'special-audits',
                    value: 'sa'
                }];
            },
            computed: '_setEngagementTypes(basePermissionPath)'
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
        },
        datepickerModal: {
            type: Boolean,
            value: false
        },
        contractExpiryDate: {
            type: String,
            value: null
        },
        tabTexts: {
            type: Object,
            value: {
                name: 'Engagement Overview',
                fields: [
                    'agreement', 'end_date', 'start_date', 'engagement_type', 'partner_contacted_at', 'total_value'
                ]
            }
        },
        sharedIpWithOptions: {
            type: Array,
            value: function() {
                return [];
            },
            computed: '_setSharedIpWith(basePermissionPath)'
        },
        sharedIpWith: {
            type: Array,
            value: function() {
                return [];
            }
        }
    },

    listeners: {
        'agreement-loaded': '_agreementLoaded'
    },

    observers: [
        '_errorHandler(errorObject)',
        '_setShowInput(data.engagement_type)',
        '_setAdditionalInput(data.engagement_type)',
        'updateStyles(poPermissionPath, poUpdating)',
        'updateStyles(data.engagement_type)',
        'updatePoBasePath(data.agreement.id)',
        '_prepareData(data)'
    ],

    ready: function() {
        this.$.purchaseOrder.validate = this._validatePurchaseOrder.bind(this, this.$.purchaseOrder);
    },

    _prepareData: function() {
        let poItem = this.get('data.po_item');
        if (!poItem) { return; }

        poItem = {
            id: poItem.id,
            number: `${poItem.number}`
        };
        this.set('data.po_item', poItem);
    },

    _setSharedIpWith: function(basePermissionPath) {
        let sharedIpWithOptions = this.getChoices(`${basePermissionPath}.shared_ip_with.child`);
        return sharedIpWithOptions || [];
    },

    validate: function() {
        let orderField = this.$.purchaseOrder,
            orderValid = orderField && orderField.validate(orderField);

        let elements = Polymer.dom(this.root).querySelectorAll('.validate-field');
        let valid = true;
        _.each(elements, element => {
            if (element.required && !element.disabled && !element.validate()) {
                let label = element.label || 'Field';
                element.errorMessage = `${label} is required`;
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

        return orderValid && valid;
    },

    resetValidationErrors: function() {
        this.set('errors.agreement', false);

        let elements = Polymer.dom(this.root).querySelectorAll('.validate-field');
        _.each(elements, element => {
            element.errorMessage = '';
            element.invalid = false;
        });
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
        this.set('data.engagement_type', value.selectedValues);
    },

    poKeydown: function(event) {
        if (event.keyCode === 13) {
            this._requestAgreement(event);
        }
    },

    _requestAgreement: function(event) {
        if (this.requestInProcess) { return; }

        let input = event && event.target,
            value = input && input.value;

        if ((+value || +value === 0) && value === this.orderNumber) { return; }
        this.resetAgreement();

        if (!value) {
            this.orderNumber = null;
            return;
        }

        if (!this._validatePOLength(value)) {
            this.set('errors.agreement', 'Purchase order number must be 10 digits');
            this.orderNumber = null;
            return;
        }

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
        this.set('contractExpiryDate', null);
        this.set('orderNumber', null);
    },

    _validatePurchaseOrder: function(orderInput) {
        if (orderInput && (orderInput.readonly || orderInput.disabled)) { return true; }
        if (this.requestInProcess) {
            this.set('errors.agreement', 'Please, wait until Purchase Order loaded');
            return false;
        }
        let value = orderInput && orderInput.value;
        if (!value && orderInput && orderInput.required) {
            this.set('errors.agreement', 'Purchase order is required');
            return false;
        }
        if (!this._validatePOLength(value)) {
            this.set('errors.agreement', 'Purchase order number must be 10 digits');
            return false;
        }
        if (!this.data || !this.data.agreement || !this.data.agreement.id) {
            this.set('errors.agreement', 'Purchase order not found');
            return false;
        }
        this.set('errors.agreement', false);
        return true;
    },

    _validatePOLength: function(po) {
        return !po || `${po}`.length === 10;
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
        if (this.originalData.engagement_type !== this.data.engagement_type.value) { data.engagement_type = this.data.engagement_type.value; }
        if (this.data.po_item && (this.originalData.po_item !== +this.data.po_item.id)) { data.po_item = this.data.po_item.id; }
        if (this.originalData.joint_audit !== this.data.joint_audit) { data.joint_audit = this.data.joint_audit; }

        let originalSharedIpWith = this.get('originalData.shared_ip_with') || [];
        let sharedIpWith = this.sharedIpWith || [];
        sharedIpWith = sharedIpWith.map(shared => shared.value);
        if (!_.isEqual(originalSharedIpWith.sort(), sharedIpWith.sort()) && sharedIpWith.length) {
            data.shared_ip_with = sharedIpWith;
        }

        return data;
    },

    _setShowInput: function(type) {
        if (typeof type === 'string' && type !== 'ma') {
            this.showInput = true;
        } else if (typeof type === 'object' && type && type.value && type.value !== 'ma') {
            this.showInput = true;
        } else {
            this.showInput = false;
        }
    },

    _setAdditionalInput: function(type) {
        if (typeof type === 'string' && type !== 'sc') {
            this.showAdditionalInput = true;
        } else if (typeof type === 'object' && type && type.value && type.value !== 'sc') {
            this.showAdditionalInput = true;
        } else {
            this.showAdditionalInput = false;
        }
    },

    updatePoBasePath: function(id) {
        let path = id ? `po_${id}` : '';
        this.set('poPermissionPath', path);
    },

    _setExpiryMinDate: function(minDate) {
        if (!minDate) { return false; }
        let today = new Date(new Date(minDate).getFullYear(), new Date(minDate).getMonth(), new Date(minDate).getDate());
        return new Date(today - 1);
    },

    _hideTooltip: function(basePermissionPath, showInput, type) {
        return this.isReadOnly('engagement_type', basePermissionPath) ||
            this.isSpecialAudit(type) ||
            !showInput;
    },

    _setEngagementTypes: function(basePermissionPath) {
        let types = this.getChoices(`${basePermissionPath}.engagement_type`);
        if (!types) { return; }

        let links = {
            ma: 'micro-assessments',
            audit: 'audits',
            sc: 'spot-checks',
            sa: 'special-audits'
        };

        return types.map((typeObject) => {
            return {
                value: typeObject.value,
                label: typeObject.display_name,
                link: links[typeObject.value]
            };
        });
    },

    _getEngagementTypeLabel: function(type) {
        let value = this._processValue(type) || {};
        return value.label || '';
    },

    _isAdditionalFieldRequired: function(field, basePath, type) {
        if (this.isSpecialAudit(type)) { return ''; }
        return this._setRequired(field, basePath);
    },

    _getPoItems: function(agreement) {
        let poItems = [];

        if (agreement && Array.isArray(agreement.items)) {
            agreement.items = agreement.items.filter(item => item);

            poItems = agreement.items.map((item) => {
                return {
                    id: item.id,
                    number: `${item.number}`
                };
            });
        }

        return poItems;
    },
    _isDataAgreementReaonly: function(field, basePermissionPath, agreement) {
        return this.isReadOnly(field, basePermissionPath) || !agreement.order_number;
    }

});
