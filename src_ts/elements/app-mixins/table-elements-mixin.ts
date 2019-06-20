import {Constructor} from '../../types/global';
import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import each from 'lodash-es/each';

/**
 * @polymer
 * @mixinFunction
 */
function TableElementsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
    class TableElementsMixinClass extends baseClass {

        @property({observer: TableElementsMixinClass.prototype._dataItemsChanged, type: Array})
        dataItems: any[] = [];

        @property({type: Object})
        emptyObj: object = {empty: true};

        @property({type: Object})
        editedItem: object = {};

        @property({type: Object})
        itemModel: object = {};

        /**
         * Determines whether Save is performed on dialog confirm (when false),
         * or on click on Save btn in status component (when true)
         */
        @property({type: Boolean})
        saveWithButton: boolean = false;

        @property({type: Object})
        errors: object = {};

        @property({type: Boolean})
        canBeRemoved: boolean = false;

        @property({type: Boolean})
        requestInProcess: boolean = false;

        @property({type: Boolean})
        confirmDialogOpened: boolean = false;

        // TODO: added only for ts-lint, find a better way to make this accessible... might not be the best solution
        @property({type: Object})
        shadowRoot: ShadowRoot;

        connectedCallback() {
            super.connectedCallback();

            this.editedItem = cloneDeep(this.itemModel);
            this._addObserverEffect('requestInProcess', 'updateStyles');
            this._addObserverEffect('canBeRemoved', 'updateStyles');

        }

        _dataItemsChanged(data) {
            this.originalTableData = cloneDeep(data);
            if (this.dialogOpened) {
                this.requestInProcess = false;
                this.dialogOpened = false;
            }
            if (this.confirmDialogOpened) {
                this.requestInProcess = false;
                this.confirmDialogOpened = false;
            }
        }

        getTabData() {
            if ((this.dialogOpened || this.confirmDialogOpened) && !this.saveWithButton) {
                return this.getCurrentData();
            }
            if (!this.originalTableData  || !this.dataItems) {
                throw Error('originalTableData  and dataItems arrays must exist');
            }
            if (!this.originalTableData .length && !this.dataItems.length) { return null; }

            let data = [];

            each(this.dataItems, (item, index) => {
                if (!isEqual(item, this.originalTableData[index])) {
                    data.push(item);
                }
            });

            return data.length ? data : null;
        }

        getCurrentData() {
            if (!this.dialogOpened && !this.confirmDialogOpened) { return null; }
            return [cloneDeep(this.editedItem)];
        }

        _canBeChanged(basePath) {
            let path = basePath || this.basePermissionPath;
            if (!path) {
                return true;
            }

            let readOnly = this.isReadonly(`${path}.${this.mainProperty}`);
            if (readOnly === null) { readOnly = true; }

            return !readOnly;
        }

        validate() {
            if (this.editedItem && this.editedItem._delete) { return true; }
            let elements = this.shadowRoot.querySelectorAll('.validate-input'),
                valid = true;

            Array.prototype.forEach.call(elements, (element) => {
                if (element.required && !element.validate()) {
                    element.invalid = 'This field is required';
                    element.errorMessage = 'This field is required';
                    valid = false;
                }
            });

            return valid;
        }

        _setRequired(field) {
            if (!this.basePermissionPath) {
                return false;
            }

            let required = this.isRequired(`${this.basePermissionPath}.${this.mainProperty}.${field}`);

            return required ? 'required' : false;
        }

        _resetFieldError(e: Event) {
            e.target.invalid = false;
        }

        openAddDialog() {
            this.dialogTitle = (this.addDialogTexts && this.addDialogTexts.title) || 'Add New Item';
            this.confirmBtnText = (this.addDialogTexts && this.addDialogTexts.confirmBtn) || 'Add';
            this.cancelBtnText = (this.addDialogTexts && this.addDialogTexts.cancelBtn) || 'Cancel';
            this.addDialog = true;
            this.dialogOpened = true;
        }

        openEditDialog(event = {}) {
            let index = event.itemIndex;
            if (isNaN(index) || !~index) {
                index = this._getIndex(event);
            }

            this.dialogTitle = (this.editDialogTexts && this.editDialogTexts.title) || 'Edit Item';
            this.confirmBtnText = (this.editDialogTexts && this.editDialogTexts.confirmBtn) || 'Save';
            this.cancelBtnText = (this.editDialogTexts && this.editDialogTexts.cancelBtn) || 'Cancel';

            this._setDialogData(index);
            this.dialogOpened = true;
        }

        openDeleteDialog(event) {
            let index = this._getIndex(event);

            this._setDialogData(index);

            this.confirmDialogOpened = true;
        }

        _getIndex(event) {
            let item = event && event.model && event.model.item,
                index = this.dataItems && this.dataItems.indexOf(item);

            if ((!index && index !== 0) || index < 0) { throw Error('Can not find user data'); }

            return index;
        }

        _setDialogData(index) {
            this.editedItem = cloneDeep(this.dataItems[index]);
            this.originalEditedObj = cloneDeep(this.dataItems[index]);
            this.editedIndex = index;
        }

        _addItemFromDialog(event) {
            //* This if might be deprecated and unused
            if(event && event.detail && event.detail.dialogName === 'deleteConfirm') {
                this.removeItem();
                return;
            }

            if (!this.validate()) {
                return;
            }
            if (this.customValidation && !this.customValidation()) { return; }

            if (!this.addDialog && isEqual(this.originalEditedObj, this.editedItem)) {
                this.dialogOpened = false;
                this.resetDialog();
                return;
            }

            //Perform save on confirm btn clicked in dialog
            if (!this.saveWithButton && this.dialogOpened) {
                this._triggerSaveEngagement();
                return;
            }

            //Perform save outside dialog (by clicking the Save btn in the status component)
            this._updateDataItemsWithoutSave();

            this.dialogOpened = false;
            this.resetDialog();
        }

        _triggerSaveEngagement() {
            this.requestInProcess = true;
            this.fire('action-activated', {type: 'save', quietAdding: true});
        }

        _updateDataItemsWithoutSave() {
            let item = cloneDeep(this.editedItem);
            if (!this.addDialog && !isNaN(this.editedIndex)) {
                //if is edit popup
                this.splice('dataItems', this.editedIndex, 1, item);
            } else {
                //if is creation popup
                this.push('dataItems', item);
            }
        }

        resetDialog(opened) {
            if (opened) {
                return;
            }
            let elements = this.shadowRoot.querySelectorAll('.validate-input');

            Array.prototype.forEach.call(elements, element => {
                element.invalid = false;
                element.value = '';
                element.selected = '';
            });

            this.dialogTitle = '';
            this.confirmBtnText = '';
            this.cancelBtnText = '';
            this.addDialog = false;
            this.deleteDialog = false;
            this.editedItem = cloneDeep(this.itemModel);
        }

        _getTitleValue(value) {
            return value || '';
        }

        removeItem() {
            if (this.editedItem && this.editedItem.id !== undefined) {
                this.set('editedItem._delete', true);
                this._triggerSaveEngagement();
            } else {
                this.splice('dataItems', this.editedIndex, 1);
                this.resetDialog();
                this.confirmDialogOpened = false;
            }
        }

        _showItems(item) {
            return item && !item._delete;
        }

        _openDeleteConfirmation() {
            this.confirmDialogOpened = true;
        }

        _errorHandler(errorData) {
            this.requestInProcess = false;
            if (!errorData) { return; }
            let refactoredData = this.dialogOpened ? this.refactorErrorObject(errorData)[0] : this.refactorErrorObject(errorData);
            this.set('errors', refactoredData);
        }

        deleteCanceled(event) {
            return event && event.detail && event.detail.confirmed === false;
        }
    }
    return TableElementsMixinClass;
}

export default TableElementsMixin;
