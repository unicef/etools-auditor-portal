'use strict';

(function() {

    Polymer({

        is: 'etools-file-element',

        properties: {
            label: {
                type: String,
                value: 'File attachment'
            },
            files: {
                type: Object,
                value: function() {
                    return [];
                },
                notify: true
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
                value: function() {
                    return false;
                },
                reflectToAttribute: true
            },
            fileTypes: {
                type: Array,
                value: function() {
                    return [];
                }
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
            if (this.multiple && this.label === 'File attachment') {
                this.set('label', this.label + '(s)');
            }
            if (!Array.isArray(this.files)) {
                this.files = [];
            }
        },
        _showFileType: function(fileTypesLength, readonly) {
            return this.activateFileTypes && fileTypesLength > 0 && readonly === false;
        },
        _showReadonlyType: function(readonly) {
            return readonly && this.activateFileTypes;
        },
        _getFileTypeStr: function(fileType) {
            if (this.fileTypes.length > 0) {
                let type = this.fileTypes.filter(function(type) {
                    return parseInt(type.id, 10) === parseInt(fileType, 10);
                })[0];
                if (type) {
                    return type.name;
                }
                return null;
            }
            return null;
        },

        _showLabel: function(label) {
            return typeof label === 'string' && label !== '';
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
            let hasUrl = (typeof file.attachment_file === 'string' && file.attachment_file) || file.raw instanceof File;
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

            if (this.useDeleteEvents) {
                this.fire('delete-file', {file: this.files[e.model.index], index: e.model.index});
            } else {
                this.splice('files', e.model.index, 1);
            }
        },

        _filesChange: function() {
            if (this.files instanceof Array && this.files.length > 0) {
                this.set('showFilesContainer', true);
            } else {
                this.set('showFilesContainer', false);
            }

            if (!this.multiple) {
                if (this.files instanceof Array && this.files.length > 1) {
                    this.set('files', [this.files[0]]);
                }
            }
        },

        _downloadFile: function(e) {
            if (e && e.model && this.files.length > 0) {
                let file = this.files[e.model.index];
                let a = this.$.downloader;

                if (file && file.raw) {
                    let blob = new Blob([file.raw]);
                    a.href = URL.createObjectURL(blob);
                } else if (file && file.attachment_file) {
                    a.href = file.attachment_file;
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

        _getUploadedFile: function(fileModel) {
            return new Promise((resolve, reject) => {
                let reader = new FileReader();
                let uploadedFile = {
                    name: fileModel.file_name,
                    type: fileModel.type
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

        uploadFiles: function() {
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
                        resolve(uploadedFiles);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }

    });
})();
