import {PolymerElement} from '@polymer/polymer';
import clone from 'lodash-es/clone';
import isString from 'lodash-es/isString';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import isObject from 'lodash-es/isObject';
import ErrorHandlerMixin from './error-handler-mixin';
import {readonlyPermission, isRequired, getFieldAttribute, getChoices} from './permission-controller';
import StaticDataMixin from './static-data-mixin';
import {Constructor} from "../../types/global";
import {fireEvent} from "../utils/fire-custom-event";

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin StaticDataMixin
 */
function CommonMethodsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class CommonMethodsMixinClass extends StaticDataMixin(ErrorHandlerMixin(baseClass as Constructor<PolymerElement>)) {

    _resetFieldError(event) {
      if (!event || !event.target) {
        return false;
      }

      let field = event.target.getAttribute('field');
      if (field) {
        this.set(`errors.${field}`, false);
      }

      event.target.invalid = false;
    }

    isReadOnly(field, basePermissionPath, inProcess?) {
      if (!basePermissionPath || inProcess) {
        return true;
      }

      let readOnly = readonlyPermission(`${basePermissionPath}.${field}`);
      if (readOnly === null) {
        readOnly = true;
      }

      return readOnly;
    }

    _setRequired(field, basePermissionPath) {
      if (!basePermissionPath) {
        return false;
      }

      let required = isRequired(`${basePermissionPath}.${field}`);

      return required ? 'required' : false;
    }

    _errorHandler(errorData) {
      if (!errorData) {
        return false;
      }
      if (this.requestInProcess) {
        this.requestInProcess = false;
      }
      this.set('errors', clone(this.refactorErrorObject(errorData)));
      if (this.tabTexts && this.tabTexts.fields.some(field => !!this.errors[field])) {
        fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
      }
    }

    _complexErrorHandler(errorData) {
      this.requestInProcess = false;
      if (!errorData) {
        return false;
      }

      let data = this.refactorErrorObject(errorData);
      let nonField = this.checkNonField(errorData);

      if (!this.dialogOpened && isString(data)) {
        fireEvent(this, 'toast', {text: `${this.errorBaseText}${data}`});
      } else {
        this.set('errors', data);
      }

      if (nonField) {
        fireEvent(this, 'toast', {text: `${this.errorBaseText}${nonField}`});
      }
    }

    _basePathChanged() {
      this.updateStyles();
    }

    _dataChanged() {
      if (this.dialogOpened) {
        this.requestInProcess = false;
        this.dialogOpened = false;
      }
      if (this.confirmDialogOpened) {
        this.requestInProcess = false;
        this.confirmDialogOpened = false;
      }
    }

    getLabel(path, base) {
      if (!base) {
        return '';
      }
      return getFieldAttribute(`${base}.${path}`, 'label', 'POST') ||
        getFieldAttribute(`${base}.${path}`, 'label', 'GET');
    }

    getDisplayName(path, base, value) {
      if (!base) {
        return '';
      }

      let choices = this._getSavedChoices(`${base}.${path}`);
      if (!choices) {
        return '';
      }

      let choice = choices.find((choice) => {
        return choice && choice.value === value;
      });
      return (choice && choice.display_name) ? choice.display_name : '';
    }

    getMaxLength(path, base) {
      if (!base) {
        return '';
      }
      return getFieldAttribute(`${base}.${path}`, 'max_length', 'GET');
    }

    getPlaceholderText(path, base, datepicker) {
      if (readonlyPermission(`${base}.${path}`)) {
        return 'Empty Field'
      }

      let label = this.getLabel(path, base),
        prefix = datepicker ? 'Select' : 'Enter';
      return `${prefix} ${label}`;
    }

    getReadonlyPlaceholder(data) {
      return !!(data && data.id) ? 'Empty Field' : '-';
    }

    _getSavedChoices(path) {
      if (!path) {
        return;
      }

      let choices = this.getData(`${path}_choices`);
      if (!choices) {
        choices = getChoices(path);
      }

      if (choices instanceof Array) {
        this._setData(`${path}_choices`, choices);
        return choices;
      }
    }

    _setReadonlyFieldClass(data) {
      return !data || !data.id ? 'no-data-fetched' : '';
    }

    _showPrefix(path, base, value, readonly) {
      return (!readonlyPermission(`${base}.${path}`) && !readonly) || !!value;
    }

    getTooltipText(selectedValues, options, field) {
      let tooltip:any[] = [];
      each(selectedValues, (value) => {
        let displayValue = filter(options, ['id', +value]);
        if (displayValue.length > 0) {
          tooltip.push(displayValue[0][field]);
        }
      });
      return tooltip.join(', ');
    }

    isSpecialAudit(type) {
      return type === 'sa' || type && type.value === 'sa';
    }

    isJSONObj(str) {
      let json;
      try {
        json = JSON.parse(str);
      } catch (e) {
        return false;
      }
      return isObject(json);
    }
  }

  return CommonMethodsMixinClass;

}

export default CommonMethodsMixin
