'use strict';

(function() {
    Polymer({
        is: 'file-attachments-tab',
        behaviors: [
            APBehaviors.TableElementsBehavior
        ],
        properties: {
            mainProperty: {
                type: String
            },
            itemModel: {
                type: Object,
                value: function() {
                    return {
                        id: undefined,
                        date: undefined,
                        file: undefined,
                        file_name: undefined,
                        raw: undefined,
                        file_type: undefined,
                        display_name: undefined,
                        type: {}
                    };
                }
            },
            headings: {
                type: Array,
                notify: true,
                value: []
            },
            addDialogTexts: {
                type: Object,
                value: {
                    title: 'Add new File'
                }
            },
            editDialogTexts: {
                type: Object,
                value: {
                    title: 'Edit File'
                }
            },
            multiple: {
                type: Boolean,
                value: false
            },
            uploadLabel: {
                type: String,
                value: 'Upload File'
            },
            readonly: {
                type: Boolean,
                value: false
            },
            invalid: {
                type: Boolean,
                value: function() {
                    return false;
                }
            },
            errorMessage: {
                type: String,
                value: function() {
                    return '';
                }
            },
            fileTypes: {
                type: Array,
                value: function() {
                    return [];
                }
            },
            fileTypeRequired: {
                type: Boolean,
                value: false
            },
            fileTypesLabel: {
                type: String,
                value: 'File Type'
            },
            allowDelete: {
                type: Boolean,
                value: false
            }
        },
        listeners: {
            'dialog-confirmed': '_addItemFromDialog'
        },
        observers: [
            '_filesChange(dataItems.*, fileTypes.*)',
            '_updateHeadings(allowDelete, readonly, fileTypeRequired)',
            'resetDialog(dialogOpened)',
            'changePermission(basePermissionPath)'
        ],
        _getFileType: function(fileType) {
            if (this.fileTypes && this.fileTypes.length > 0) {
                let type = this.fileTypes.filter(function(type) {
                    return parseInt(type.value, 10) === parseInt(fileType, 10);
                })[0];
                return type || null;
            }
            return null;
        },

        _showAddBtn: function(filesLength, readonly) {
            if (readonly === true) {
                return false;
            }

            if (!this.multiple && filesLength > 0) {
                return false;
            }

            return true;
        },

        _updateHeadings: function(allowDelete, readonly, fileTypeRequired) {
            let showDeleteButton = allowDelete && readonly === false;
            let headings = [{
                'size': 20,
                'name': 'date',
                'label': 'Date Uploaded',
                'path': 'date'
            }, {
                'size': 45,
                'label': 'File Attachment',
                'property': 'file_name',
                'custom': true
            }];

            if (showDeleteButton) {
                headings.push({
                    'size': 5,
                    'label': 'Edit',
                    'icon': true
                });
            }

            if (fileTypeRequired) {
                headings.splice(1, 0, {
                    'size': 30,
                    'label': 'Document Type',
                    'path': 'display_name'
                });
            }

            this.set('headings', headings);
        },

        _openFileChooser: function() {
            let elem = Polymer.dom(this.root).querySelector('#fileInput');
            if (elem && document.createEvent) {
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('click', true, false);
                elem.dispatchEvent(evt);
            }
        },

        _fileSelected: function() {
            let files = Polymer.dom(this.root).querySelector('#fileInput').files || {};
            let file = files[0];

            if (file && file instanceof File) {
                let blob = new Blob([file.raw]);

                this.editedItem.file_name = file.name;
                this.editedItem.raw = file;
                this.editedItem.date = new Date().getTime();
                this.editedItem.file = URL.createObjectURL(blob);
            }

            console.log('_fileSelected');
            this._checkAlreadySelected();
        },

        _setFileType: function(e, detail) {
            if (detail && detail.selectedValues) {
                this.editedItem.type = detail.selectedValues;
                this.editedItem.display_name = detail.selectedValues.display_name;
                this.editedItem.file_type = detail.selectedValues.value;
            }
        },

        _filesChange: function() {
            if (!this.dataItems) {return;}

            this.dataItems.forEach((file, index) => {
                if (file.file && file.id && !file.file_name) {
                    file.file_name = this._getFilenameFromUrl(file.file);
                }

                if (!file.file_name) {
                    this.splice('dataItems', index, 1);
                    return;
                }

                if (file.file_type !== undefined && !file.display_name) {
                    let type = this._getFileType(file.file_type) || {};
                    file.type = type;
                    file.display_name = type.display_name;
                }
            });

            if (!this.multiple) {
                if (this.dataItems instanceof Array && this.dataItems.length > 1) {
                    this.set('dataItems', [this.dataItems[0]]);
                }
            }
        },

        _getFilenameFromUrl: function(url) {
            if (typeof url !== 'string' || url === '') {
                return;
            }

            return url.split('/').pop();
        },

        _getUploadedFile: function(fileModel) {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                let uploadedFile = {
                    file_name: fileModel.file_name,
                    file_type: fileModel.file_type
                };

                reader.readAsDataURL(fileModel.raw);

                reader.onload = function() {
                    uploadedFile.file = reader.result;
                    resolve(uploadedFile);
                };

                reader.onerror = function(error) {
                    reject(error);
                };
            });
        },

        //TODO: refactor method
        getFiles: function() {
            return new Promise((resolve, reject) => {
                let files = [];
                let changedFiles = [];

                if (this.saveWithButton) {
                    files = this.dataItems || [];
                } else if (this.editedItem.file) {
                    files.push(this.editedItem);
                }

                let promises = files.map((fileModel) => {
                    if (fileModel && fileModel.raw && fileModel.raw instanceof File) {
                        return this._getUploadedFile(fileModel);
                    } else if (!this.saveWithButton) {
                        changedFiles.push({
                            id: this.editedItem.id,
                            file_type: this.editedItem.file_type,
                            _delete: this.editedItem._delete,
                            hyperlink: this.editedItem.file
                        });
                    }
                });

                promises = promises.filter((promise) => {
                    return promise !== undefined;
                });

                Promise.all(promises)
                    .then((uploadedFiles) => {
                        uploadedFiles = uploadedFiles.concat(changedFiles);
                        if (!uploadedFiles.length) { uploadedFiles = null; }
                        console.log(this.mainProperty, uploadedFiles);
                        resolve(uploadedFiles);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        _checkAlreadySelected: function() {
            if (!this.dataItems) {return;}

            let alreadySelectedIndex = this.dataItems.findIndex((file) => {
                return file.file_name === this.editedItem.file_name;
            });
            console.log('_checkAlreadySelected');
            if (alreadySelectedIndex !== -1) {
                this.invalid = true;
                this.errorMessage = 'File already selected';
                return false;
            }

            this.invalid = false;
            this.errorMessage = '';
            return true;
        },

        validate: function() {
            let dropdown = Polymer.dom(this.root).querySelector('#fileType');
            let editedItem = this.editedItem;
            let valid = true;

            if (!this.fileTypes || !this.fileTypes.length) {
                this.invalid = true;
                this.errorMessage = 'File type field is required but types are not defined';
                valid = false;
            }

            if (!this.canBeRemoved && !this._checkAlreadySelected()) {
                valid = false;
            }

            if (valid) {
                this.invalid = false;
                this.errorMessage = '';
            }

            console.log(editedItem);
            if (this.fileTypeRequired && (editedItem.file_type === null || editedItem.file_type === undefined)) { valid = false; }

            if (!this.canBeRemoved && (!dropdown.validate() || !editedItem.file_name || !editedItem.raw ||
                !editedItem.date || !editedItem.file)) { valid = false; }

            console.log(valid);
            return valid;
        }
    });
})();
