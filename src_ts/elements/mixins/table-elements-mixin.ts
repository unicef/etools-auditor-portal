import {LitElement, PropertyValues} from 'lit';
import {property} from 'lit/decorators.js';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';
import cloneDeep from 'lodash-es/cloneDeep';
import isEqual from 'lodash-es/isEqual';
import each from 'lodash-es/each';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {readonlyPermission} from './permission-controller';
import {refactorErrorObject} from './error-handler';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {getBodyDialog} from '../utils/utils';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';

/**
 * @polymer
 * @mixinFunction
 */
function TableElementsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class TableElementsMixinClass extends baseClass {
    @property({type: Array})
    dataItems: any[] = [];

    @property({type: Object})
    emptyObj: GenericObject = {empty: true};

    @property({type: Object})
    editedItem: GenericObject = {};

    @property({type: Object})
    itemModel: GenericObject = {};

    /**
     * Determines whether Save is performed on dialog confirm (when false),
     * or on click on Save btn in status component (when true)
     */
    @property({type: Boolean})
    saveWithButton = false;

    @property({type: Object})
    errors: GenericObject = {};

    @property({type: Boolean})
    canBeRemoved = false;

    @property({type: Boolean})
    requestInProcess = false;

    @property({type: Boolean})
    isAddDialogOpen = false;

    @property({type: Boolean})
    isConfirmDialogOpen = false;

    @property({type: Number})
    editedIndex!: number;

    @property({type: Object})
    originalEditedObj!: GenericObject | null;

    @property({type: Array})
    originalTableData!: [];

    @property({type: String})
    dialogTitle = '';

    @property({type: String})
    confirmBtnText!: string;

    @property({type: String})
    cancelBtnText!: string;

    @property({type: Object})
    addDialogTexts!: GenericObject;

    @property({type: Object})
    editDialogTexts!: GenericObject;

    @property({type: String})
    mainProperty!: string;

    @property({type: Boolean})
    deleteDialog!: boolean;

    @property({type: String})
    dialogKey = '';

    connectedCallback() {
      super.connectedCallback();
      this.editedItem = cloneDeep(this.itemModel);
    }

    updated(changedProperties: PropertyValues): void {
      super.updated(changedProperties);

      if (changedProperties.has('dataItems')) {
        this._dataItemsChanged(this.dataItems);
      }
    }

    _dataItemsChanged(data) {
      if (!isJsonStrMatch(this.originalTableData, data || [])) {
        this.originalTableData = cloneDeep(data || []);
      }

      this._closeEditDialog();
    }

    getTabData() {
      if ((this.isAddDialogOpen || this.isConfirmDialogOpen) && !this.saveWithButton) {
        return this.getCurrentData();
      }
      if (!this.originalTableData || !this.dataItems) {
        throw Error('originalTableData  and dataItems arrays must exist');
      }
      if (!this.originalTableData.length && !this.dataItems.length) {
        return null;
      }

      const data: any[] = [];

      each(this.dataItems, (item, index) => {
        if (!isEqual(item, this.originalTableData[index])) {
          data.push(item);
        }
      });

      return data.length ? data : null;
    }

    getCurrentData() {
      if (!this.isAddDialogOpen && !this.isConfirmDialogOpen) {
        return null;
      }
      return [cloneDeep(this.editedItem)];
    }

    _canBeChanged(options: AnyObject) {
      let readOnly = readonlyPermission(this.mainProperty, options);
      if (readOnly === null) {
        readOnly = true;
      }

      return !readOnly;
    }

    validate() {
      if (this.editedItem && this.editedItem._delete) {
        return true;
      }
      const elements = this.shadowRoot!.querySelectorAll('.validate-input');
      let valid = true;

      Array.prototype.forEach.call(elements, (element) => {
        if (element.required && !element.validate()) {
          element.invalid = 'This field is required';
          element.errorMessage = 'This field is required';
          valid = false;
        }
      });

      return valid;
    }

    _getFileData(fileData?) {
      if (!fileData && !this.editedItem) {
        return {};
      }
      const {id, attachment, file_type} = fileData || this.editedItem;
      const data: GenericObject = {attachment};

      if (id) {
        data.id = id;
      }
      data.file_type = file_type;

      return data;
    }

    _resetFieldError(e: Event) {
      (e.target! as any).invalid = false;
    }

    openAddDialog() {
      this.dialogTitle = (this.addDialogTexts && this.addDialogTexts.title) || 'Add New Item';
      this.confirmBtnText = (this.addDialogTexts && this.addDialogTexts.confirmBtn) || 'Add';
      this.cancelBtnText = (this.addDialogTexts && this.addDialogTexts.cancelBtn) || 'Cancel';
      this.editedItem = {};
      this.editedIndex = NaN;
      this.isAddDialogOpen = true;
      fireEvent(this, 'show-add-dialog');
    }

    openEditDialog(index) {
      this.dialogTitle = (this.editDialogTexts && this.editDialogTexts.title) || 'Edit Item';
      this.confirmBtnText = (this.editDialogTexts && this.editDialogTexts.confirmBtn) || 'Save';
      this.cancelBtnText = (this.editDialogTexts && this.editDialogTexts.cancelBtn) || 'Cancel';

      this._setDialogData(index);
      this.isAddDialogOpen = true;
      fireEvent(this, 'show-edit-dialog');
    }

    openDeleteDialog(index) {
      this._setDialogData(index);
      this.isConfirmDialogOpen = true;
      fireEvent(this, 'show-confirm-dialog');
    }

    _setDialogData(index) {
      this.editedItem = cloneDeep(this.dataItems[index]);
      this.originalEditedObj = cloneDeep(this.dataItems[index]);
      this.editedIndex = index;
    }

    _addItemFromDialog() {
      if (!this.validate()) {
        return;
      }

      // @ts-ignore Defined in derived class when needed
      if (this.customValidation && !this.customValidation()) {
        return;
      }
      if (!this.isAddDialogOpen && isEqual(this.originalEditedObj, this.editedItem)) {
        // nothing changed, close dialog
        this._closeEditDialog();
        return;
      }

      // Perform save on confirm btn clicked in dialog
      if (!this.saveWithButton) {
        this._triggerSaveEngagement();
        return;
      }

      // Perform save outside dialog (by clicking the Save btn in the status component)
      this._updateDataItemsWithoutSave();

      this._closeEditDialog();
    }

    _closeEditDialog() {
      if (!this.dialogKey) {
        return;
      }

      this.isAddDialogOpen = false;
      // close dialog if opened on data changed (ex: after saving)
      const dialogEl = getBodyDialog(this.dialogKey);
      if (dialogEl) {
        this.isAddDialogOpen = false;
        this.isConfirmDialogOpen = false;
        (dialogEl as any)._onClose();
      }
    }

    _triggerSaveEngagement() {
      this.requestInProcess = true;
      fireEvent(this, 'action-activated', {type: 'save', quietAdding: true});
    }

    _updateDataItemsWithoutSave() {
      const item = cloneDeep(this.editedItem);
      if (!this.dataItems) {
        this.dataItems = [];
      }
      if (!this.isAddDialogOpen && !isNaN(this.editedIndex)) {
        // if is edit popup
        this.dataItems.splice(this.editedIndex, 1, item);
      } else {
        // if is creation popup
        this.dataItems.push(item);
      }
      fireEvent(this, 'data-items-changed', this.dataItems);
    }

    resetDialog(opened?: boolean) {
      if (opened) {
        return;
      }
      this.dialogTitle = '';
      this.confirmBtnText = '';
      this.cancelBtnText = '';
      this.isAddDialogOpen = false;
      this.deleteDialog = false;
      this.editedItem = cloneDeep(this.itemModel);
    }

    _getTitleValue(value) {
      return value || '';
    }

    removeItem() {
      if (this.editedItem && this.editedItem.id !== undefined) {
        this.editedItem._delete = true;
        this._triggerSaveEngagement();
      } else {
        this.dataItems.splice(this.editedIndex, 1);
        fireEvent(this, 'data-items-changed', this.dataItems);
        this.resetDialog();
      }
    }

    _showItems(item) {
      return item && !item._delete;
    }

    _errorHandler(errorData) {
      this.requestInProcess = false;
      if (!errorData) {
        return;
      }
      const refactoredData = this.isAddDialogOpen ? refactorErrorObject(errorData)[0] : refactorErrorObject(errorData);
      this.errors = refactoredData;
    }

    deleteCanceled(event) {
      return event && event.detail && event.detail.confirmed === false;
    }
  }

  return TableElementsMixinClass;
}

export default TableElementsMixin;
