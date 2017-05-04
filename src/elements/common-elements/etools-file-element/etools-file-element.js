'use strict';

(function() {

    Polymer({

        is: 'etools-file-element',

        properties: {
            files: {
                type: Object,
                value: function() {
                    return [];
                },
                notify: true
            },
            deletedAttachments: {
                type: Array,
                value: function() {
                    return [];
                }
            },
            multiple: {
                type: Boolean,
                value: false
            },
            disabled: {
                type: Boolean,
                value: false
            },
            accept: {
                type: String
            },
            uploadLabel: {
                type: String,
                value: 'Upload File'
            },
            readonly: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
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
            fileModel: {
                type: Object,
                value: null
            },
            useDeleteEvents: {
                type: Boolean,
                value: function() {
                    return false;
                }
            },
            activateFileTypes: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
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
            allowDownload: {
                type: Boolean,
                value: false
            },
            allowChange: {
                type: Boolean,
                value: false
            },
            allowDelete: {
                type: Boolean,
                value: false
            },
            fileCheckboxVisible: {
                type: Boolean,
                value: false
            },
            fileCheckboxTitle: {
                type: String,
                value: ''
            },
            fileCheckboxLabel: {
                type: String,
                value: 'Allow'
            }
        },
        observers: [
            '_filesChange(files.*)'
        ],
        ready: function() {
            if (!Array.isArray(this.files)) {
                this.files = [];
            }
        },
        _showReadonlyType: function(readonly, fileTypesLength) {
            return readonly || fileTypesLength <= 0;
        },
        _getFileType: function(fileType) {
            if (this.fileTypes.length > 0) {
                let type = this.fileTypes.filter(function(type) {
                    return parseInt(type.value, 10) === parseInt(fileType, 10);
                })[0];
                if (type) {
                    return type;
                }
                return null;
            }
            return null;
        },

        _showUploadBtn: function(filesLength, readonly) {
            if (readonly === true) {
                return false;
            }

            if (!this.multiple && filesLength > 0) {
                return false;
            }

            return true;
        },

        _showDownloadBtn: function(file, allowDownload) {
            let hasUrl = (file.file && typeof file.file === 'string') || file.raw instanceof File;
            return !!(allowDownload && file && hasUrl);
        },
        _showChangeBtn: function(file, allowChange, readonly) {
            return !!(file && allowChange && readonly === false);
        },
        _showDeleteBtn: function(file, allowDelete, readonly) {
            return !!(file && allowDelete && readonly === false);
        },
        _getFileSelectedClass: function(file, allowDownload) {
            if (!this._showDownloadBtn(file, allowDownload)) {
                return 'only-selected';
            }
            return '';
        },

        _openFileChooser: function() {
            let elem = this.$.fileInput;
            if (elem && document.createEvent) {
                let evt = document.createEvent('MouseEvents');
                evt.initEvent('click', true, false);
                elem.dispatchEvent(evt);
            }
        },

        _replaceFile: function(newFile) {
            if (this.changeFileIndex >= 0 && newFile && newFile instanceof File) {
                this.$.fileInput.setAttribute('multiple', this.multiple);

                if (this.files[this.changeFileIndex]) {
                    let fileAlreadySelected = this._checkFileAlreadySelected(newFile);

                    if (fileAlreadySelected.length > 0) {
                        this._displayAlreadySelectedWarning();

                        this.changeFileIndex = -1;
                        this.$.fileInput.value = '';
                        return false;
                    }

                    let oldFile = this.files[this.changeFileIndex];
                    let newFileObj = JSON.parse(JSON.stringify(oldFile));

                    if (oldFile.file && oldFile.id) {
                        this._deleteAttachedFile(oldFile);
                        newFileObj.file = undefined;
                        newFileObj.id = undefined;
                    }

                    newFileObj.file_name = newFile.name;
                    newFileObj.raw = newFile;
                    newFileObj.path = null;
                    this.set('files.' + this.changeFileIndex, newFileObj);
                }

                this.changeFileIndex = -1;
                // reset file input
                this.$.fileInput.value = '';
                return true;
            }

            this.changeFileIndex = -1;
            return false;
        },

        _addMultipleFiles: function(files) {
            if (!files || (files instanceof Array === false && files instanceof FileList === false)) {
                return;
            }

            let filesAlreadySelected = [];

            for (let i = 0; i < files.length; i++) {
                let fileAlreadySelected = this._checkFileAlreadySelected(files[i]);

                if (fileAlreadySelected.length === 0 && files[i] instanceof File) {
                    let fileObj = this._getFileModel();

                    fileObj.file_name = files[i].name;
                    fileObj.raw = files[i];

                    this.push('files', fileObj);
                } else if (fileAlreadySelected.length) {
                    filesAlreadySelected.push(fileAlreadySelected[0]);
                }
            }

            if (filesAlreadySelected.length > 0) {
                this._displayAlreadySelectedWarning();
            }
        },

        _checkFileAlreadySelected: function(file) {
            let fileAlreadySelected = this.files.filter(function(f) {
                return f.file_name === file.name && (f.path === '' || f.path === null || typeof f.path === 'undefined');
            });

            return fileAlreadySelected;
        },

        _displayAlreadySelectedWarning: function() {
            this.fire('toast', {text: 'The following file are already selected'});
        },

        _getFileModel: function() {
            if (this.fileModel) {
                return JSON.parse(JSON.stringify(this.fileModel));
            } else {
                return {
                    id: null,
                    file_name: null,
                    path: null,
                    raw: null
                };
            }
        },

        _addSingleFile: function(file) {
            if (file && file instanceof File && this.files.length === 0) {
                let fileObj = this._getFileModel();

                fileObj.file_name = file.name;
                fileObj.raw = file;

                this.push('files', fileObj);
            }
        },

        _fileSelected: function(e) {
            if (!e || !e.target) {
                return;
            }

            let files = e.target.files;
            // replace file if case
            if (this._replaceFile(files[0]) === true) {
                return;
            }

            // new files selected
            if (this.multiple) {
                this._addMultipleFiles(files);
            } else {
                // single file upload
                let file = e.target.files[0];
                this._addSingleFile(file);
            }
            // reset file input
            this.$.fileInput.value = '';
        },

        _changeFile: function(e) {
            if (e && e.model && e.model.index >= 0) {
                this.changeFileIndex = e.model.index;
                this.$.fileInput.removeAttribute('multiple');
                this._openFileChooser();
            }
        },

        _deleteFile: function(e) {
            if (!e || !e.model) {
                return;
            }

            if (typeof e.model.index !== 'number' || e.model.index < 0 || this.files.length === 0) {
                return;
            }

            let file = this.files[e.model.index];

            if (this.useDeleteEvents) {
                this.fire('delete-file', {file: file, index: e.model.index});
            } else {
                this.splice('files', e.model.index, 1);
            }

            if (file.file && file.id) {
                this._deleteAttachedFile(file);
            }
        },

        _deleteAttachedFile: function(file) {
            if (file) {
                this.deletedAttachments.push({
                    id: file.id,
                    _delete: true
                });
            }
        },

        _filesChange: function() {
            if (this.files instanceof Array && this.files.length > 0) {
                this.set('showFilesContainer', true);
            } else {
                this.set('showFilesContainer', false);
                return;
            }

            this.files.forEach((file, index) => {
                if (file.file && file.id && !file.file_name) {
                    file.file_name = this._getFilenameFromUrl(file.file);
                }

                if (!file.file_name) {
                    this.splice('files', index, 1);
                }
            });

            if (!this.multiple) {
                if (this.files instanceof Array && this.files.length > 1) {
                    this.set('files', [this.files[0]]);
                }
            }
        },

        _getFilenameFromUrl: function(url) {
            if (typeof url !== 'string' || url === '') {
                return;
            }

            return url.split('/').pop();
        },

        _downloadFile: function(e) {
            if (e && e.model && this.files.length > 0) {
                let file = this.files[e.model.index];
                let a = this.$.downloader;

                if (file && file.raw) {
                    let blob = new Blob([file.raw]);
                    a.href = URL.createObjectURL(blob);
                } else if (file && file.file) {
                    a.href = file.file;
                } else {
                    return;
                }

                a.download = file.file_name;
                a.target = '_blank';
                a.click();
                URL.revokeObjectURL(a.href);
            }
        },

        _getMultipleClass: function(multiple) {
            if (multiple) {
                return 'multiple';
            }
            return '';
        },

        _getFileTypeRequiredClass: function() {
            return this.fileTypeRequired ? 'required' : '';
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

        getFiles: function() {
            return new Promise((resolve, reject) => {
                let promises = this.files.map((fileModel) => {
                    if (fileModel && fileModel.raw && fileModel.raw instanceof File) {
                        return this._getUploadedFile(fileModel);
                    }
                });

                promises = promises.filter((promise) => {
                    return promise !== undefined;
                });

                Promise.all(promises)
                    .then((uploadedFiles) => {
                        resolve(uploadedFiles.concat(this.deletedAttachments));
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        },

        validate: function() {
            if (!this.fileTypeRequired || (this.files  && this.files.length === 0)) {
                this.invalid = false;
                this.errorMessage = '';
                return true;
            }

            if (!this.fileTypes || !this.fileTypes.length) {
                this.invalid = true;
                this.errorMessage = 'File type field is required but types are not defined';
                return false;
            }

            let dropdowns = Polymer.dom(this.root).querySelectorAll('etools-searchable-multiselection-menu');
            let dropdownsLength = dropdowns.length;
            let isValid = true;

            for (let i = 0; i < dropdownsLength; i++) {
                if (!dropdowns[i].validate()) {
                    isValid = false;
                }
            }

            return isValid;
        },

        _resetFieldError: function(event) {
            event.target.invalid = false;
        },

        _setFileType: function(e, value) {
            let index = e.target.getAttribute('data-index');

            if (value.selectedValues) {
                this.set(`files.${index}.file_type`, value.selectedValues.value);
            }
        }

    });
})();
