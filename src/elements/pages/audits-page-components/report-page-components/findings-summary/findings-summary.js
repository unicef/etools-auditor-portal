'use strict';

Polymer({
    is: 'findings-summary',
    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior
    ],
    properties: {
        basePermissionPath: {
            type: String
        },
        mainProperty: {
            type: String,
            value: 'financial_findings'
        },
        itemModel: {
            type: Object,
            value: function() {
                return {
                    audited_expenditure: undefined,
                    financial_findings: undefined,
                    percent_of_audited_expenditure: undefined,
                    audit_opinion: undefined,
                    number_of_financial_findings: undefined,
                    high_risk: undefined,
                    medium_risk: undefined,
                    low_risk: undefined,
                    partner: {
                        name: undefined
                    },
                    opinion: {}
                };
            }
        },
        editDialogTexts: {
            type: Object,
            value: {
                title: 'Summary of audit findings'
            }
        },
        auditOpinions: {
            type: Array,
            value: function() {
                return [];
            }
        },
        data: {
            type: Object
        },
        columns: {
            type: Array,
            value: [{
                'size': 25,
                'label': 'IP name',
                'path': 'partner.name'
            }, {
                'size': 20,
                'label': 'Audited Expenditure $ ',
                'path': 'audited_expenditure',
                'align': 'right'
            }, {
                'size': 15,
                'label': 'Financial Findings $ ',
                'path': 'financial_findings',
                'align': 'right'
            }, {
                'size': 20,
                'label': '% Of Audited Expenditure',
                'path': 'percent_of_audited_expenditure',
                'align': 'right'
            }, {
                'size': 20,
                'label': 'Audit Opinion',
                'path': 'display_name',
                'align': 'center'
            }, {
                'size': '50px',
                'label': 'No. of Financial Findings',
                'path': 'number_of_financial_findings',
                'align': 'center'
            }, {
                'size': '50px',
                'label': 'No. of High Risk',
                'path': 'high_risk',
                'align': 'center'
            }, {
                'size': '50px',
                'label': 'No. of Medium Risk',
                'path': 'medium_risk',
                'align': 'center'
            }, {
                'size': '50px',
                'label': 'No. of Low Risk',
                'path': 'low_risk',
                'align': 'center'
            }, {
                'size': '45px',
                'label': 'Edit',
                'name': 'edit',
                'align': 'center',
                'icon': true
            }]
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog'
    },

    observers: [
        'resetDialog(dialogOpened)',
        'changePermission(basePermissionPath)',
        '_errorHandler(errorObject)',
        '_setDataItems(data)',
        '_setAuditOpinion(data.audit_opinion, auditOpinions)'
    ],

    ready: function() {
        this.auditOpinions = this.getData('audit_opinions');
    },
    _setDataItems: function() {
        this.set('dataItems', [this.data]);
        this.set('itemModel.audit_opinion', this.data.audit_opinion);
        this.set('itemModel.partner.name', this.data.partner && this.data.partner.name);
    },
    getFindingsSummaryData: function() {
        if (_.isEqual(this.editedItem, this.itemModel)) { return; }

        let itemModelKeys = _.keys(this.itemModel) || [];
        let originalData;
        let data;

        itemModelKeys = itemModelKeys.filter((key) => {
            return key !== 'partner' && key !== 'opinion';
        });

        if (this.dialogOpened) {
            data = _.pick(this.editedItem, itemModelKeys);
        } else {
            data = _.pick(this.originalData && this.originalData[0], itemModelKeys);
        }
        originalData = _.pick(this.originalData && this.originalData[0], itemModelKeys);

        data.number_of_financial_findings = data.number_of_financial_findings || null;
        data.high_risk = data.high_risk || null;
        data.medium_risk = data.medium_risk || null;
        data.low_risk = data.low_risk || null;

        if (!_.isEqual(data, originalData)) {
            //return only changed values
            return _.transform(data, function(result, value, key) {
                if (value !== originalData[key]) {
                    result[key] = value;
                }
            }, {});
        }
    },
    _changeAuditOpinion: function(e, detail) {
        if (!detail || !detail.selectedValues) { return; }
        this.editedItem.audit_opinion = detail.selectedValues.value;
    },
    _setAuditOpinion: function(auditOpinionValue, auditOpinions) {
        if (auditOpinions && auditOpinions.length > 0) {
            let auditOpinion = auditOpinions.find(function(auditOpinion) {
                return auditOpinion.value === auditOpinionValue;
            }) || {};
            this.data.opinion =  auditOpinion;
            this.data.display_name = auditOpinion.display_name;
        }
    },
    _setRequired: function(field) {
        if (!this.basePermissionPath) { return false; }
        let required = this.isRequired(`${this.basePermissionPath}.${field}`);
        return required ? 'required' : false;
    },
    _errorHandler: function(errorData) {
        this.requestInProcess = false;
        if (!errorData) { return; }

        let refactoredData = this.refactorErrorObject(errorData);
        let itemModelKeys = _.keys(this.itemModel) || [];
        itemModelKeys = itemModelKeys.filter((key) => {
            return key !== 'partner' && key !== 'opinion';
        });
        let findingsSummaryErrors = _.pick(refactoredData, itemModelKeys);

        if (!this.dialogOpened && _.values(findingsSummaryErrors).length) {
            this.fire('toast', {text: `Please fill in the Summary of Audit Findings.`});
        } else {
            this.set('errors', refactoredData);
        }
    }
});
