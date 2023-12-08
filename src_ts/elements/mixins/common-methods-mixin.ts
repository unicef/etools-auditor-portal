import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import clone from 'lodash-es/clone';
import isString from 'lodash-es/isString';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import isObject from 'lodash-es/isObject';
import {readonlyPermission, isRequired, getOptionsChoices, getCollection} from './permission-controller';
import {GenericObject} from '../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {refactorErrorObject, checkNonField} from './error-handler';
import {AnyObject, Constructor} from '@unicef-polymer/etools-types';
import get from 'lodash-es/get';

/**
 * @polymer
 * @mixinFunction
 */
function CommonMethodsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class CommonMethodsMixinClass extends baseClass {
    @property({type: Boolean})
    requestInProcess!: boolean;

    @property({type: Object})
    tabTexts!: GenericObject;

    @property({type: Object})
    errors!: GenericObject;

    @property({type: Object})
    errorObject!: GenericObject;

    @property({type: Boolean})
    dialogOpened = false;

    @property({type: String})
    errorBaseText!: string;

    @property({type: Object})
    engagementData!: AnyObject;

    @property({type: Object})
    optionsData!: AnyObject;

    _resetFieldError(event) {
      if (!event || !event.target) {
        return false;
      }

      const field = event.target.getAttribute('field');
      if (field) {
        this.errors[field] = false;
        this.requestUpdate();
      }

      event.target.invalid = false;
    }

    isReadOnly(field: string, permissions: AnyObject, inProcess?: boolean) {
      if (!permissions || inProcess) {
        return true;
      }

      let readOnly = readonlyPermission(field, permissions);
      if (readOnly === null) {
        readOnly = true;
      }

      return readOnly;
    }

    _setRequired(field: string, permissions: AnyObject) {
      if (!permissions) {
        return false;
      }

      const required = isRequired(field, permissions);

      return required ? 'required' : false;
    }

    _resetDialogOpenedFlag(event) {
      this[event.currentTarget.getAttribute('openFlag')] = false;
    }

    _errorHandler(errorData) {
      if (!errorData || !Object.keys(errorData).length) {
        return false;
      }
      if (this.requestInProcess) {
        this.requestInProcess = false;
      }
      this.errors = clone(refactorErrorObject(errorData));
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
        this.errors = data;
      }

      if (nonField) {
        fireEvent(this, 'toast', {text: `${this.errorBaseText}${nonField}`});
      }
    }

    _dataChanged() {
      if (this.dialogOpened) {
        this.requestInProcess = false;
        this.dialogOpened = false;
      }
    }

    getLabel(path: string, options: AnyObject) {
      if (!options) {
        return '';
      }
      const actions = get(options, 'actions') || {};
      let label = get(actions, `POST.${path}.label`) || get(actions, `GET.${path}.label`);

      if (!label && path.includes('.')) {
        const labelObj = getCollection(path, actions, 'GET') || getCollection(path, actions, 'POST');
        if (labelObj) {
          label = labelObj.label || '';
        }
      }
      return label;
    }

    getDisplayName(path: string, options: AnyObject, value: string) {
      if (!options) {
        return '';
      }

      const choices = getOptionsChoices(options, path);
      if (!choices) {
        return '';
      }

      const choice = choices.find((choice) => {
        return choice && choice.value === value;
      });
      return choice && choice.display_name ? choice.display_name : '';
    }

    getMaxLength(path, options: AnyObject) {
      if (!options) {
        return '';
      }
      return get(options, `GET.${path}.max_length`);
    }

    getPlaceholderText(path, options: AnyObject, datepicker?) {
      if (readonlyPermission(path, options)) {
        return '–';
      }

      const label = this.getLabel(path, options);
      const prefix = datepicker ? 'Select' : 'Enter';
      return `${prefix} ${label}`;
    }

    getReadonlyPlaceholder(_data) {
      return '–';
    }

    _setReadonlyFieldClass(data) {
      return !data || !data.id ? 'no-data-fetched' : '';
    }

    _showPrefix(path: string, engagementOptions: AnyObject, value, readonly) {
      return (!readonlyPermission(path, engagementOptions) && !readonly) || !!value;
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

    isAudit(type: string) {
      return type === 'audit';
    }

    isAuditOrSpecialAudit(type: string) {
      return ['audit', 'sa'].includes(type);
    }

    getFileNameFromURL(url: string) {
      if (!url) {
        return '';
      }
      const urlSplit = url.split('?');
      if (urlSplit.length) {
        return urlSplit.shift()!.split('/').pop();
      }
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

    _updatePath(path: string) {
      history.pushState(window.history.state, '', path);
      window.dispatchEvent(new CustomEvent('popstate'));
    }

    handleUsersNoLongerAssignedToCurrentCountry = (availableUsers: any[], savedUsers: any[]) => {
      savedUsers = savedUsers || [];
      availableUsers = availableUsers || [];
      if (savedUsers.length > 0) {
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
  }
  return CommonMethodsMixinClass;
}

export default CommonMethodsMixin;
