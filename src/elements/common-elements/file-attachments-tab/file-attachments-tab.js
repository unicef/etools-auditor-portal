'use strict';

(function() {
    Polymer({
        is: 'file-attachments-tab',

        behaviors: [
            APBehaviors.TableElementsBehavior,
            APBehaviors.CommonMethodsBehavior,
            APBehaviors.ErrorHandlerBehavior
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
                    'size': '100px',
                    'name': 'date',
                    'label': 'Date Uploaded!',
                    'labelPath': `created`,
                    'path': 'created'
                }, {
                    'size': 35,
                    'label': 'Document Type!',
                    'labelPath': `file_type`,
                    'path': 'display_name'
                }, {
                    'size': 65,
                    'label': 'File Attachment!',
                    'labelPath': `file`,
                    'property': 'filename',
                    'custom': true,
                    'doNotHide': false
                }]
            },
            dataItems: {
                type: Array,
                value: () => []
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
            errorProperty: String
        },

        listeners: {
            'attachments-request-completed': '_requestCompleted'
        },

        observers: [
            '_setBasePath(dataBasePath, pathPostfix)',
            '_filesChange(dataItems.*, fileTypes.*)',
            '_resetDialog(dialogOpened)',
            '_errorHandler(errorObject)',
            'updateStyles(requestInProcess, editedItem, basePermissionPath)',
        ],

        _setBasePath: function(dataBase, pathPostfix) {
            let base = dataBase && pathPostfix ? `${dataBase}_${pathPostfix}` : '';
            this.set('basePermissionPath', base);
            if (base) {
                let title = this.getFieldAttribute(base, 'title');
                this.set('tabTitle', title);
                this.fileTypes = this.getChoices(`${base}.file_type`);
            }
        },

        isTabReadonly: function(basePath) {
            return !basePath || (!this.collectionExists(`${basePath}.PUT`) && !this.collectionExists(`${basePath}.POST`));
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
            if (!e || !e.target) { return false; }

            let files = e.target.files || {};
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

        _saveAttachment: function() {

            if (!this.validate()) {
                return;
            }

            this.requestInProcess = true;

            if (!this.baseId) {
                this._processDelayedRequest();
                return;
            }

            let attachmentsData = this._getFileData();
            let method = attachmentsData.id ? 'PATCH' : 'POST';

            attachmentsData = method === 'PATCH' ? this._getChanges(attachmentsData) : attachmentsData;
            if (!attachmentsData) {
                this._requestCompleted(null, {success: true});
                return;
            }

            this.requestData = {method, attachmentsData};
        },

        _deleteAttachment(event) {
            if (this.deleteCanceled(event)) {
                return;
            }
            if (!this.baseId) {
                this._processDelayedRequest();
                return;
            }
            this.requestInProcess = true;

            this.requestData = {
                method: 'DELETE',
                attachmentsData: {id: this.editedItem.id}
            };
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

        _processDelayedRequest: function() {
            let fileData = this._getFileData(true);
            let index = _.findIndex(this.dataItems, (file) => file.unique_id === this.editedItem.unique_id);

            if (this.deleteDialog && ~index) {
                this.splice('dataItems', index, 1);
            } else if (~index) {
                this.splice('dataItems', index, 1, fileData);
            } else if (!this.deleteDialog) {
                this.push('dataItems', fileData);
            }

            this._requestCompleted(null, {success: true});
        },

        _requestCompleted: function(event, detail = {}) {
            this.requestInProcess = false;
            if (detail.success) {
                this.dialogOpened = false;
            }
            this._resetDialog(false);
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
        }

    });
})();
