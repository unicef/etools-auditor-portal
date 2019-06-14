'use strict';

(function() {
    Polymer({
        is: 'file-attachments-tab',

        behaviors: [
            APBehaviors.TableElementsBehavior,
            APBehaviors.CommonMethodsBehavior,
            APBehaviors.ErrorHandlerBehavior,
            APBehaviors.EngagementBehavior,
            APBehaviors.UserController,
            APBehaviors.DateBehavior,
            EtoolsAjaxRequestBehavior
        ],

        properties: {
            basePermissionPath: String,
            dataBasePath: String,
            pathPostfix: String,
            baseId: Number,
            itemModel: {
                type: Object,
                value: function() {
                    return {
                        file: undefined,
                        file_name: undefined,
                        file_type: undefined,
                        type: {},
                    };
                }
            },
            headings: {
                type: Array,
                notify: true,
                value: [{
                    'size': 18,
                    'name': 'date',
                    'label': 'Date Uploaded!',
                    'labelPath': `created`,
                    'path': 'created'
                }, {
                    'size': 30,
                    'name': 'documentType',
                    'label': 'Document Type!',
                    'labelPath': `file_type`,
                    'path': 'display_name'
                }, {
                    'size': 30,
                    'name': 'document',
                    'label': 'File Attachment!',
                    'labelPath': `file`,
                    'property': 'filename',
                    'custom': true,
                    'doNotHide': false
                }, {
                    'size': 12,
                    'label': 'Source',
                    'labelPath': 'tpm_activities.date',
                    'path': 'source'
                },

            ],
            },
            ENGAGEMENT_TYPE_ENDPOINT_MAP: {
                type: Object,
                value: () => ({
                    'micro-assessments': 'micro-assessment',
                    'spot-checks': 'spot-check',
                    'staff-spot-checks': 'spot-check',
                    'audits': 'audit',
                    'special-audits': 'special-audit'
                })
            },
            dataItems: {
                type: Array,
                value: () => []
            },
            engagement: {
                type: Object
            },
            addDialogTexts: {
                type: Object,
                value: {
                    title: 'Attach File',
                    confirmBtn: 'Attach'
                }
            },
            editDialogTexts: {
                type: Object,
                value: {
                    title: 'Edit Attachment',
                    confirmBtn: 'Edit',
                }
            },
            uploadLabel: {
                type: String,
                value: 'Upload File'
            },
            shareDialogOpened: {
                type: Boolean,
                value: false
            },
            shareParams: {
                type: Object,
            },
            auditLinksOptions: {
                type: Object,
                value: {}
            },
            linkedAttachments: {
                type: Array,
                value: [],
                notify: true
            },
            fileTypes: {
                type: Array,
                value: function() {
                    return [];
                }
            },
            deleteTitle: {
                type: String,
                value: 'Are you sure that you want to delete this attachment?'
            },
            errorProperty: String,
            isReportTab: {
                type: Boolean,
                value: () => false,
            },
            _hideShare:{
                type: Boolean,
                computed: '_shouldHideShare(_isUnicefUser, baseId)'
            },
            _isUnicefUser: {
                type: Boolean,
                computed: '_checkIsUnicefUser(dataBasePath)'
            }
        },

        listeners: {
            'dialog-confirmed': '_sendRequest',
            'delete-confirmed': '_sendRequest',
            'attachments-request-completed': '_requestCompleted'
        },

        observers: [
            '_setBasePath(dataBasePath, pathPostfix)',
            '_filesChange(dataItems.*, fileTypes.*)',
            '_resetDialog(dialogOpened)',
            '_errorHandler(errorObject)',
            'updateStyles(requestInProcess, editedItem, basePermissionPath)',
        ],

        _checkIsUnicefUser: function () {
            const user = this.getUserData();
            return Boolean(user.groups.find(({ name }) => name === 'UNICEF User'));
        },


        _hanldeLinksForEngagement: function () {
            this._setLinksEndpoint();
            this._getLinkedAttachments();
        },

        _setLinksEndpoint: function () {
            const {details: engagement, type: engagementType} = this.getCurrentEngagement();
            this.set('engagement', engagement);
            this.set('auditLinksOptions', {
                endpoint: this.getEndpoint('auditLinks', {
                    type: this.ENGAGEMENT_TYPE_ENDPOINT_MAP[engagementType],
                    id: engagement.id
                })
            });
        },

        _getLinkedAttachments: function () {
            this.set('requestInProcess', true);
            const options = Object.assign(this.auditLinksOptions, { method: 'GET' })
            this.sendRequest(options)
                .then(res=>{
                    this.set('linkedAttachments', _.uniqBy(res, 'attachment'));
                    this.set('requestInProcess', false);
                })
                .catch(this._errorHandler.bind(this));
        },

        _setBasePath: function(dataBase, pathPostfix) {
            this._handleLinksInDetailsView(dataBase);
            let base = dataBase && pathPostfix ? `${dataBase}_${pathPostfix}` : '';
            this.set('basePermissionPath', base);
            if (base) {
                let title = this.getFieldAttribute(base, 'title');
                this.set('tabTitle', title);
                this.fileTypes = this.getChoices(`${base}.file_type`);
            }
        },

        _handleLinksInDetailsView: function (dataBase) {
            if(!dataBase){ //null check
                dataBase = '';
            }
            const isEngagementDetailsView = !dataBase.includes('new');
            if (isEngagementDetailsView && !this.isReportTab){
                this._hanldeLinksForEngagement();
            }
        },

        isTabReadonly: function(basePath) {
            return !basePath || (!this.collectionExists(`${basePath}.PUT`) && !this.collectionExists(`${basePath}.POST`));
        },

        _hideShare: function(basePermissionPath) {
            return this.isTabReadonly(basePermissionPath) || basePermissionPath.includes('new');
        },

        showFileTypes: function(basePath) {
            return !!basePath && this.collectionExists(`${basePath}.file_type`, 'GET');
        },

        _resetDialog: function(dialogOpened) {
            if (!dialogOpened) {
                this.originalEditedObj = null;
            }
            this.resetDialog(dialogOpened);
        },

        _getFileType: function(fileType) {
            let length = _.get(this, 'fileTypes.length');
            if (!length) { return; }

            let type = this.fileTypes.find((type) => parseInt(type.value, 10) === parseInt(fileType, 10));
            return type || null;
        },

        _openFileChooser: function() {
            let elem = Polymer.dom(this.root).querySelector('#fileInput');
            if (elem && document.createEvent) {
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('click', true, false);
                elem.dispatchEvent(evt);
                this.set('errors.file', '');
            }
        },

        _fileSelected: function(e) {
            if (!e || !Polymer.dom(e).localTarget) { return false; }

            let files = Polymer.dom(e).localTarget.files || {};
            let file = files[0];

            if (file && file instanceof File) {
                this.set('editedItem.filename', file.name);
                this.editedItem.file = file;

                return !this._fileAlreadySelected();
            }
        },



        _filesChange: function() {
            if (!this.dataItems) { return false; }

            this.dataItems.forEach((file) => {
                if (file.file_type !== undefined && !file.display_name) {
                    let type = this._getFileType(file.file_type) || {};
                    file.type = type;
                    file.display_name = type.display_name;
                }
            });
        },

        _sendRequest: function(e) {
            if (!this.dialogOpened || !this.validate()) { return; }

            this.requestInProcess = true;
            let attachmentsData, method;

            if (this.deleteDialog) {
                attachmentsData = {id: this.editedItem.id};
                method = 'DELETE';
            } else {
                attachmentsData = this._getFileData();
                method = attachmentsData.id ? 'PATCH' : 'POST';
            }

            attachmentsData = method === 'PATCH' ? this._getChanges(attachmentsData) : attachmentsData;
            if (!attachmentsData) {
                this._requestCompleted(null, {success: true});
                return;
            }
            this.requestData = {method, attachmentsData};
        },

        _getChanges: function(attachmentsData) {
            let original = this.originalEditedObj && this._getFileData(false, this.originalEditedObj);
            if (!original) { return attachmentsData; }

            let data = _.pickBy(attachmentsData, (value, key) => original[key] !== value);
            if (data.file && this._fileAlreadySelected()) {
                delete data.file;
            }

            if (_.isEmpty(data)) {
                return null;
            } else {
                data.id = attachmentsData.id;
                return data;
            }
        },

        _getFileData: function(addName, fileData) {
            if (!this.dialogOpened && !fileData) { return {}; }
            let {id, file, type} = fileData || this.editedItem,
                data = {file};

            if (id) {
                data.id = id;
            }

            if (type) {
                data.file_type = type.value;
            }

            if (addName) {
                data.filename = this.editedItem.filename;
                data.unique_id = _.uniqueId();
            }

            return data;
        },

        _getAttachmentType: function(attachment){
            return this.fileTypes.find(fileType=> fileType.value === attachment.file_type).display_name;
        },

        _requestCompleted: function(event, detail = {}) {
            this.requestInProcess = false;
            if (detail.success) {
                this.dialogOpened = false;
            }
        },

        _fileAlreadySelected: function() {
            if (!this.dataItems) {return false;}

            let alreadySelectedIndex = this.dataItems.findIndex((file) => {
                return file.filename === this.editedItem.filename;
            });

            if (alreadySelectedIndex !== -1) {
                this.set('errors.file', 'File already selected');
                return true;
            }

            this.set('errors.file', '');
            return false;
        },

        validate: function() {
            let dropdown = Polymer.dom(this.root).querySelector('#fileType');
            let editedItem = this.editedItem;
            let valid = true;

            let fileTypeRequired = this._setRequired('file_type', this.basePermissionPath);
            if (fileTypeRequired && (!this.fileTypes || !this.fileTypes.length)) {
                this.set('errors.file_type', 'File types are not defined');
                valid = false;
            } else {
                this.set('errors.file_type', false);
            }

            if (fileTypeRequired && !dropdown.validate()) {
                this.set('errors.file_type', 'This field is required');
                valid = false;
            }

            if (this.addDialog && this._fileAlreadySelected()) {
                valid = false;
            }

            if (this.addDialog && !editedItem.file) {
                this.set('errors.file', 'File is not selected');
                valid = false;
            }

            return valid;
        },

        _openAddDialog: function() {
            this.editedItem = _.clone(this.itemModel);
            this.openAddDialog();
        },

        _errorHandler: function(errorData) {
            let mainProperty = this.errorProperty;
            this.requestInProcess = false;
            if (!errorData || !errorData[mainProperty]) { return; }
            let refactoredData = this.refactorErrorObject(errorData[mainProperty]);
            let nonField = this.checkNonField(errorData[mainProperty]);

            if (this.dialogOpened && typeof refactoredData[0] === 'object') {
                this.set('errors', refactoredData[0]);
            }
            if (typeof errorData[mainProperty] === 'string') {
                this.fire('toast', {text: `Attachments: ${errorData[mainProperty]}`});
            }
            if (nonField) {
                this.fire('toast', {text: `Attachments: ${nonField}`});
            }

            if (!this.dialogOpened) {
                let filesErrors = this.getFilesErrors(refactoredData);

                filesErrors.forEach((fileError) => {
                    this.fire('toast', {text: `${fileError.fileName}: ${fileError.error}`});
                });
            }
        },

        getFilesErrors: function(errors) {
            if (this.dataItems instanceof Array && errors instanceof Array && errors.length === this.dataItems.length) {
                let filesErrors = [];

                errors.forEach((error, index) => {
                    let fileName = this.dataItems[index].filename;
                    fileName = this._cutFileName(fileName);

                    if (fileName && typeof error.file === 'string') {
                        filesErrors.push({
                            fileName: fileName,
                            error: error.file
                        });
                    }
                });

                return filesErrors;
            }

            return [];
        },

        _cutFileName: function(fileName) {
            if (typeof fileName !== 'string') {
                return;
            }

            if (fileName.length <= 20) {
                return fileName;
            } else {
                return fileName.slice(0, 10) + '...' + fileName.slice(-7);
            }
        },

        getFiles: function() {
            return this.dataItems.map((file) => this._getFileData(false, file));
        },

        resetData: function() {
            this.set('dataItems', []);
        },

        _openShareDialog: function() {
            this.shareDialogOpened = true;
            const shareModal = this.querySelector('#shareDocuments');
            shareModal.updateShareParams();
        },

        _SendShareRequest: function() {
            const { attachments } = this.shareParams;
            const options = Object.assign(this.auditLinksOptions,{
                csrf: true,
                body:  { attachments } ,
                method: 'POST'
            });
            this.set('requestInProcess', true);
            this.sendRequest(options)
                .then(()=> {
                    this.fire('toast', {
                        text: 'Documents shared successfully.'
                    });
                })
                .catch(this._handleShareError.bind(this))
                .finally(() => {
                    this.set('requestInProcess', false);
                    this.set('shareDialogOpened', false);
                    this._getLinkedAttachments(); // refresh the list
                })
        },

        _handleShareError: function(err){
            let nonField = this.checkNonField(err);
            let message;
            if (nonField) {
                message = `Nonfield error: ${nonField}`
            } else {
                message = err.response && err.response.detail ? `Error: ${err.response.detail}`
                : 'Error sharing documents.';
            }
            this.fire('toast', {
                text: message
            });
        },

        _getClassFor: function (field) {
            return `w${this.headings.find(
                heading => heading.name === field
            ).size}`
        },

        _openDeleteLinkDialog: function (e) {
            const { linkedAttachment } = e.model;
            this.set('linkToDeleteId', linkedAttachment.id);
            this.deleteLinkOpened = true;
        },

        _removeLink: function ({ detail }) {
            this.deleteLinkOpened = false;
            const id = detail.dialogName;

            this.sendRequest({
                method: 'DELETE',
                endpoint: this.getEndpoint('linkAttachment', { id })
            }).then(this._getLinkedAttachments.bind(this))
                .catch(err => this._errorHandler(err));
        },

        _shouldHideShare: function (isUnicefUser, baseId) {
            return this.isReportTab || !isUnicefUser || this._isNewEngagement();
        },

        _isNewEngagement: function() {
            return !this.baseId;
        },

        _hideAddAttachments: function(basePermissionPath, _baseId) {
            return this.isTabReadonly(basePermissionPath) || this._isNewEngagement();
        },

        _showEmptyRow: function(length1, length2) {
            return !length1 && !length2 && !this._isNewEngagement();
        }

    });
})();
