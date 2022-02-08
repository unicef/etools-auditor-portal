import {PolymerElement} from '@polymer/polymer';
import {property} from '@polymer/decorators';
import clone from 'lodash-es/clone';
import isString from 'lodash-es/isString';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import isObject from 'lodash-es/isObject';
import {readonlyPermission, isRequired, getFieldAttribute, getChoices} from './permission-controller';
import {setStaticData, getStaticData} from './static-data-controller';
import {Constructor, GenericObject} from '../../types/global';
import {fireEvent} from '../utils/fire-custom-event';
import {refactorErrorObject, checkNonField} from './error-handler';

/**
 * @polymer
 * @mixinFunction
 */
function CommonMethodsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class CommonMethodsMixinClass extends baseClass {
    @property({type: Boolean})
    requestInProcess!: boolean;

    @property({type: Object})
    tabTexts!: GenericObject;

    @property({type: Object})
    errors!: GenericObject;

    @property({type: Boolean})
    dialogOpened = false;

    @property({type: String})
    errorBaseText!: string;

    @property({type: Boolean})
    confirmDialogOpened = false;

    _resetFieldError(event) {
      if (!event || !event.target) {
        return false;
      }

      const field = event.target.getAttribute('field');
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

      const required = isRequired(`${basePermissionPath}.${field}`);

      return required ? 'required' : false;
    }

    _resetDialogOpenedFlag(event) {
      this.set(event.currentTarget.getAttribute('openFlag'), false);
    }

    _errorHandler(errorData) {
      if (!errorData || !Object.keys(errorData).length) {
        return false;
      }
      if (this.requestInProcess) {
        this.requestInProcess = false;
      }
      this.set('errors', clone(refactorErrorObject(errorData)));
      if (this.tabTexts && this.tabTexts.fields.some((field) => !!this.errors[field])) {
        fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
      }
    }

    _complexErrorHandler(errorData) {
      this.requestInProcess = false;
      if (!errorData) {
        return false;
      }

      const data = refactorErrorObject(errorData);
      const nonField = checkNonField(errorData);

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
      return (
        getFieldAttribute(`${base}.${path}`, 'label', 'POST') || getFieldAttribute(`${base}.${path}`, 'label', 'GET')
      );
    }

    getDisplayName(path, base, value) {
      if (!base) {
        return '';
      }

      const choices = this._getSavedChoices(`${base}.${path}`);
      if (!choices) {
        return '';
      }

      const choice = choices.find((choice) => {
        return choice && choice.value === value;
      });
      return choice && choice.display_name ? choice.display_name : '';
    }

    getMaxLength(path, base) {
      if (!base) {
        return '';
      }
      return getFieldAttribute(`${base}.${path}`, 'max_length', 'GET');
    }

    getPlaceholderText(path, base, datepicker) {
      if (readonlyPermission(`${base}.${path}`)) {
        return '–';
      }

      const label = this.getLabel(path, base);
      const prefix = datepicker ? 'Select' : 'Enter';
      return `${prefix} ${label}`;
    }

    getReadonlyPlaceholder(_data) {
      return '–';
    }

    _getSavedChoices(path) {
      if (!path) {
        return;
      }

      let choices = getStaticData(`${path}_choices`);
      if (!choices) {
        choices = getChoices(path);
      }

      if (choices instanceof Array) {
        setStaticData(`${path}_choices`, choices);
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
      const tooltip: any[] = [];
      each(selectedValues, (value) => {
        const displayValue = filter(options, ['id', +value]);
        if (displayValue.length > 0) {
          tooltip.push(displayValue[0][field]);
        }
      });
      return tooltip.join(', ');
    }

    isSpecialAudit(type: string) {
      return type === 'sa';
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

    handleUsersNoLongerAssignedToCurrentCountry = (availableUsers: any[], savedUsers: any[]) => {
      savedUsers = savedUsers || [];
      if (savedUsers.length > 0 && availableUsers && availableUsers.length > 0) {
        let changed = false;
        savedUsers.forEach((savedUser) => {
          if (availableUsers.findIndex((user) => user.id === savedUser.id) < 0) {
            availableUsers.push(savedUser);
            changed = true;
          }
        });
        if (changed) {
          availableUsers.sort((a, b) => (a.name < b.name ? -1 : 1));
        }
      }
    };

    dateHasChanged(e: CustomEvent) {
      const selDate = e.detail.date;
      // @ts-ignore
      this.set('data.' + e.target.getAttribute('property-name'), selDate);
    }
  }

  return CommonMethodsMixinClass;
}

export default CommonMethodsMixin;
