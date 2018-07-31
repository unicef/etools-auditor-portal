'use strict';

Polymer({
    is: 'new-engagement-view',

    behaviors: [
        etoolsAppConfig.globals,
        APBehaviors.LastCreatedController,
        APBehaviors.EngagementBehavior,
        APBehaviors.StaticDataController,
        APBehaviors.PermissionController,
        APBehaviors.CommonMethodsBehavior,
        APBehaviors.QueryParamsController
    ],

    properties: {
        engagement: {
            type: Object,
            value: function() {
                return {
                    status: '',
                    staff_members: [],
                    engagement_type: {},
                    engagement_attachments: [],
                    agreement: {},
                    date_of_field_visit: null,
                    date_of_draft_report_to_ip: null,
                    date_of_comments_by_ip: null,
                    date_of_draft_report_to_unicef: null,
                    date_of_comments_by_unicef: null,
                    partner_contacted_at: null,
                    specific_procedures: []
                };
            }
        },
        tabsList: {
            type: Array,
            value: function() {
                return ['overview', 'attachments'];
            }
        },
        _attachmentErrors: {
            type: Array,
            value: []
        },
        queryParams: {
            type: Object,
            notify: true,
            value: () => ({})
        },
        pageTitle: {
            type: String,
            value: ''
        },
        isStaffSc: {
            type: Boolean,
            value: false
        },
        auditFirm: {
            type: Object,
            value: () => ({})
        }
    },

    observers: [
        '_pageChanged(page, isStaffSc, auditFirm)'
    ],

    listeners: {
        'engagement-created': '_engagementCreated'
    },

    attached: function() {
        this._routeConfig();
    },

    _routeConfig: function() {
        if (!this.route || !~this.route.prefix.indexOf('new')) {
            return;
        }

        let currentTab = this.routeData && this.routeData.tab;
        if (currentTab === '' || _.isUndefined(currentTab)) {
            this.set('route.path', '/overview');
        } else if (!_.includes(this.tabsList, currentTab)) {
            this.fire('404');
        }
        this.clearQueries();
    },

    _saveNewEngagement: function() {
        if (!this._validateBasicInfo('routeData.tab')) { return; }

        this._prepareData()
            .then((data) => {
                this.newEngagementData = data;
            });
    },

    customDataPrepare: function(data) {
        if (!this.isSpecialAudit(this.engagement.engagement_type)) { return data; }

        let specificProcedures = this.getElement('#specificProcedures');
        let specificProceduresData = specificProcedures && specificProcedures.getTabData();
        if (specificProceduresData) {
            _.assign(data, {specific_procedures: specificProceduresData});
        }
        return data;
    },

    _engagementCreated: function(event) {
        if (!event && !event.detail) { return; }
        if (event.detail.success && event.detail.data) {
            //save response data before redirecting
            let data = event.detail.data;
            this._setLastEngagementData(data);
            this.engagement.id = data.id;

            let attachmentsTab = this.$.engagement_attachments,
                attachments = attachmentsTab && attachmentsTab.getFiles();

            if (attachments && attachments.length) {
                this.fire('global-loading', {type: 'upload-attachments', active: true, message: 'Uploading documents...'});
                this.fire('global-loading', {type: 'create-engagement'});
                this.atmUrl = this.getEndpoint('attachments', {id: data.id}).url;
                this._attachmentsToUpload = attachments;
                this.attachmentsPostData = attachments.shift();
            } else {
                this._finishEngagementCreation();
            }
        }
    },

    _handleAtmResponse: function(event, detail) {
        if (detail.error) {
            let name = this.attachmentsPostData.file.name;
            this._attachmentErrors.push(name);
        }

        if (this._attachmentsToUpload.length) {
            this.attachmentsPostData = this._attachmentsToUpload.shift();
        } else {
            _.each(this._attachmentErrors, (fileName) => this.fire('toast', {text: `File upload failed: ${fileName}`, fixed: true}));
            this._finishEngagementCreation();
        }
    },

    _finishEngagementCreation: function() {
        this.reloadEngagementsList();

        //redirect
        let link = _.get(this, 'engagement.engagement_type.link');
        if (!link && this.isStaffSc) { link = 'staff-spot-checks'; }
        let path = `${link}/${this.engagement.id}/overview`;
        this.set('path', this.getAbsolutePath(path));

        //reset data
        this.engagement = {
            status: '',
            staff_members: [],
            type: {}
        };
        this._attachmentsToUpload = [];
        this._attachmentErrors = [];

        this.fire('global-loading', {type: 'upload-attachments'});
        this.fire('global-loading', {type: 'create-engagement'});
    },

    reloadEngagementsList: function() {
        this.set('requestQueries.reload', true);
    },

    _pageChanged: function(page, isStaffSc, auditFirm) {
        if (page === 'new' || page === 'list') {
            this.set('engagement', {
                status: '',
                staff_members: [],
                engagement_type: {},
                engagement_attachments: [],
                agreement: {},
                date_of_field_visit: null,
                date_of_draft_report_to_ip: null,
                date_of_comments_by_ip: null,
                date_of_draft_report_to_unicef: null,
                date_of_comments_by_unicef: null,
                partner_contacted_at: null,
                specific_procedures: []
            });

            this.$.engagement_attachments.resetData();
            this.$.engagementDetails.resetValidationErrors();
            this.$.engagementDetails.resetAgreement();
            this.$.partnerDetails.resetValidationErrors();
            this.$.engagementDetails.resetType();
        }

        if (page === 'new' && isStaffSc) {
            this.set('engagement.agreement.auditor_firm', auditFirm);
            this.set('engagement.engagement_type', {value: 'sc', label: 'Spot Check'});
        }
    }
});
