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
                        name: ''
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
                'path': 'financial_findings',
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
                'size': '40px',
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
    }
});
