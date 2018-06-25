'use strict';

(function() {
    Polymer({
        is: 'file-attachments-tab',

        behaviors: [
            APBehaviors.TableElementsBehavior,
            APBehaviors.CommonMethodsBehavior
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
            'dialog-confirmed': '_sendRequest',
            'delete-confirmed': '_sendRequest',
            'attachments-request-completed': '_requestCompleted'
        },

        observers: [
            '_setBasePath(dataBasePath, pathPostfix)',
            '_filesChange(dataItems.*, fileTypes.*)',
            'resetDialog(dialogOpened)',
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
                this.set('editedItem.file_name', file.name);
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

        _sendRequest: function() {
            if (!this.dialogOpened || !this.validate()) { return; }

            this.requestInProcess = true;
            let attachmentsData, method;

            if (!this.baseId) {
                this._processDelayedRequest(method, this.editedItem);
            }

            if (this.deleteDialog) {
                attachmentsData = {id: this.editedItem.id};
                method = 'DELETE';
            } else {
                attachmentsData = this._getFileData();
                method = attachmentsData.id ? 'PATCH' : 'POST';
            }

            this.requestData = {method, attachmentsData};
        },

        _getFileData: function(addName, fileData) {
            if (!this.dialogOpened && !fileData) { return {}; }
            let {id, file, type} = fileData || this.editedItem,
                data;

            if (id) {
                data = {id};
            } else {
                data = {file};
            }

            if (type) {
                data.file_type = type.value;
            }

            if (addName) {
                data.filename = this.editedItem.file_name || this.editedItem.filename;
            }

            return data;
        },

        _processDelayedRequest: function() {
            let fileData = this._getFileData(true);
            let index = _.findIndex(this.dataItems, (file) => file.filename === fileData.filename);

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
        },

        _fileAlreadySelected: function() {
            if (!this.dataItems) {return false;}

            let alreadySelectedIndex = this.dataItems.findIndex((file) => {
                return file.filename === this.editedItem.file_name;
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
                    let fileName = this.dataItems[index].file_name;
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
