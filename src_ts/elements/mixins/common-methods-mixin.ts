import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';
import clone from 'lodash-es/clone';
import isString from 'lodash-es/isString';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import isObject from 'lodash-es/isObject';
import {prettyDate} from '@unicef-polymer/etools-utils/dist/date.util';
import {readonlyPermission, isRequired, getOptionsChoices, getCollection} from './permission-controller';
import {GenericObject} from '../../types/global';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {refactorErrorObject, checkNonField} from './error-handler';
import {AnyObject, Constructor} from '@unicef-polymer/etools-types';
import get from 'lodash-es/get';
import {getBodyDialog} from '../utils/utils';

/**
 * @polymer
 * @mixinFunction
 */
function CommonMethodsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class CommonMethodsMixinClass extends baseClass {
    [x: string]: any;

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

    @property({type: Boolean})
    lowResolutionLayout = false;

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

    _errorHandler(componentError, allErrors) {
      if (!allErrors || !Object.keys(allErrors).length) {
        return false;
      }
      // hide requestInProcess if has error, even if they are not coming form the current control
      this.requestInProcess = false;

      this.closeDialogLoading();

      if (!componentError || !Object.keys(componentError).length) {
        return false;
      }
      this.errors = {};
      this.requestUpdate();

      setTimeout(() => {
        this.errors = clone(refactorErrorObject(componentError));
        this.requestUpdate();
        if (this.tabTexts && this.tabTexts.fields.some((field) => !!this.errors[field])) {
          fireEvent(this, 'toast', {text: `${this.tabTexts.name}: Please correct errors`});
        }
      }, 20);
    }

    closeDialogLoading(dialogKey = this.dialogKey) {
      // dialogKey is defined in TableElementsMixin
      if (!dialogKey) {
        return;
      }
      // close dialog if opened on data changed (ex: after saving)
      const dialogEl = getBodyDialog(dialogKey);
      if (dialogEl) {
        (dialogEl as any).requestInProcess = false;
      }
    }

    closeEditDialog(dialogKey = this.dialogKey) {
      if (!dialogKey) {
        return;
      }
      // close dialog if opened on data changed (ex: after saving)
      const dialogEl = getBodyDialog(dialogKey);
      if (dialogEl) {
        (dialogEl as any)._onClose();
      }
    }

    _complexErrorHandler(componentError, allErrors) {
      this.requestInProcess = false;

      if (!allErrors || !Object.keys(allErrors).length) {
        return false;
      }
      // hide requestInProcess if has error, even if they are not coming form the current control
      this.closeDialogLoading();

      if (!componentError || !Object.keys(componentError).length) {
        return false;
      }

      const data = refactorErrorObject(componentError);
      const nonField = checkNonField(componentError);

      if (!this.dialogOpened && isString(data)) {
        fireEvent(this, 'toast', {text: `${this.errorBaseText}${data}`});
      } else {
        this.errors = data;
      }

      if (nonField) {
        fireEvent(this, 'toast', {text: `${this.errorBaseText}${nonField}`});
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

    getNumericPlaceholderText(path, options: AnyObject) {
      if (readonlyPermission(path, options)) {
        return '0';
      }

      const label = this.getLabel(path, options);
      return `Enter ${label}`;
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
      return ['audit', 'sa', 'sc'].includes(type);
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
      } catch {
        return false;
      }
      return isObject(json);
    }

    _updatePath(path: string) {
      history.pushState(window.history.state, '', path);
      window.dispatchEvent(new CustomEvent('popstate'));
    }

    /**
     * Prepare date string and return it in a user readable format
     */
    getDateDisplayValue(dateString: string) {
      const formatedDate = prettyDate(dateString);
      return formatedDate ? formatedDate : '-';
    }

    public getRiskRatingClass(riskRating: string) {
      let riskRatingClass = '';
      if (riskRating) {
        if (riskRating.includes('High')) {
          riskRating = 'high';
        } else if (riskRating.includes('Moderate')) {
          riskRating = 'moderate';
        } else if (riskRating.includes('Low')) {
          riskRating = 'low';
        } else if (riskRating.includes('Significant')) {
          riskRating = 'significant';
        } else if (riskRating.includes('Required')) {
          riskRating = 'not-required';
        } else if (riskRating.includes('Assessed')) {
          riskRating = 'not-assessed';
        }
        riskRatingClass = riskRating.toLowerCase().split(' ').join('-');
      } else {
        riskRatingClass = 'unavailable';
      }
      return riskRatingClass + ' risk-rating-field';
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
