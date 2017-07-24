'use strict';

Polymer({
    is: 'findings-summary',

    behaviors: [
        APBehaviors.StaticDataController,
        APBehaviors.TableElementsBehavior,
        APBehaviors.CommonMethodsBehavior
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
                'name': 'currency',
                'label': 'Audited Expenditure $ ',
                'path': 'audited_expenditure',
                'align': 'right'
            }, {
                'size': 15,
                'name': 'currency',
                'label': 'Financial Findings $ ',
                'path': 'financial_findings',
                'align': 'right'
            }, {
                'size': 20,
                'name': 'percents',
                'label': '% Of Audited Expenditure',
                'path': 'percent_of_audited_expenditure',
                'align': 'right'
            }, {
                'size': 20,
                'label': 'Audit Opinion',
                'path': 'display_name',
                'align': 'center'
            }, {
                'size': '80px',
                'label': 'No. of Financial Findings',
                'path': 'number_of_financial_findings',
                'align': 'center'
            }, {
                'size': '60px',
                'label': 'High Risk',
                'path': 'key_internal_weakness.high_risk_count',
                'align': 'center'
            }, {
                'size': '60px',
                'label': 'Medium Risk',
                'path': 'key_internal_weakness.medium_risk_count',
                'align': 'center'
            }, {
                'size': '60px',
                'label': 'Low Risk',
                'path': 'key_internal_weakness.low_risk_count',
                'align': 'center'
            }]
        }
    },

    listeners: {
        'dialog-confirmed': '_addItemFromDialog'
    },

    observers: [
        'resetDialog(dialogOpened)',
        '_errorHandler(errorObject)',
        '_setDataItems(data)',
        '_setAuditOpinion(data.audit_opinion, auditOpinions)',
        'updateStyles(basePermissionPath, requestInProcess)',
    ],

    ready: function() {
        this.auditOpinions = this.getData('audit_opinions') || [];
        let headerColumns = _.cloneDeep(this.columns),
            group = headerColumns.slice(-3),
            groupColumn = {'group': true, 'label': 'No. of Key Control Weaknesses', 'align': 'center', 'size': '180px', 'columns': group};
        this.headerColumns = headerColumns.slice(0, -3).concat([groupColumn]);
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

        data.audited_expenditure = data.audited_expenditure || 0;
        data.financial_findings = data.financial_findings || 0;
        data.percent_of_audited_expenditure = data.percent_of_audited_expenditure || 0;

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
            this.fire('toast', {text: 'Please fill in the Summary of Audit Findings.'});
        } else {
            this.set('errors', refactoredData);
        }
    }
});
