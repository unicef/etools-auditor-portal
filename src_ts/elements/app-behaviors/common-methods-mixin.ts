import { PolymerElement } from '@polymer/polymer';
import clone from 'lodash-es/clone';
import isString from 'lodash-es/isString';
import each from 'lodash-es/each';
import filter from 'lodash-es/filter';
import isObject from 'lodash-es/isObject';
import {ErrorHandlerMixin} from './error-handler-mixin';
import {PermissionController} from './permission-controller';
import {StaticDataMixin} from './static-data-mixin';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin ErrorHandlerMixin
 * @appliesMixin PermissionController
 * @appliesMixin StaticDataMixin
 */
export const CommonMethodsMixin = (baseClass) => class extends (StaticDataMixin(PermissionController(ErrorHandlerMixin(PolymerElement(baseClass))))) {

        _resetFieldError(event) {
            if (!event || !event.target) { return false; }

            let field = event.target.getAttribute('field');
            if (field) { this.set(`errors.${field}`, false); }

            event.target.invalid = false;
        };

        isReadOnly(field, basePermissionPath, inProcess) {
            if (!basePermissionPath || inProcess) { return true; }

            let readOnly = this.isReadonly(`${basePermissionPath}.${field}`);
            if (readOnly === null) { readOnly = true; }

            return readOnly;
        };

        _setRequired(field, basePermissionPath) {
            if (!basePermissionPath) { return false; }

            let required = this.isRequired(`${basePermissionPath}.${field}`);

            return required ? 'required' : false;
        };

        _errorHandler(errorData) {
            if (!errorData) { return false; }
            if (this.requestInProcess) { this.requestInProcess = false; }
            this.set('errors', clone(this.refactorErrorObject(errorData)));
            if (this.tabTexts && this.tabTexts.fields.some(field => !!this.errors[field])) {
                this.fire('toast', {text: `${this.tabTexts.name}: Please correct errors`});
            }
        };

        _complexErrorHandler(errorData) {
            this.requestInProcess = false;
            if (!errorData) { return false; }

            let data = this.refactorErrorObject(errorData);
            let nonField = this.checkNonField(errorData);

            if (!this.dialogOpened && isString(data)) {
                this.fire('toast', {text: `${this.errorBaseText}${data}`});
            } else {
                this.set('errors', data);
            }

            if (nonField) {
                this.fire('toast', {text: `${this.errorBaseText}${nonField}`});
            }
        };

        _basePathChanged() {
            this.updateStyles();
        };

        _dataChanged() {
            if (this.dialogOpened) {
                this.requestInProcess = false;
                this.dialogOpened = false;
            }
            if (this.confirmDialogOpened) {
                this.requestInProcess = false;
                this.confirmDialogOpened = false;
            }
        };

        getLabel(path, base) {
            if (!base) { return ''; }
            return this.getFieldAttribute(`${base}.${path}`, 'label', 'POST') ||
                this.getFieldAttribute(`${base}.${path}`, 'label', 'GET');
        };

        getDisplayName(path, base, value) {
            if (!base) { return ''; }

            let choices = this._getSavedChoices(`${base}.${path}`);
            if (!choices) { return ''; }

            let choice = choices.find((choice) => {
                return choice && choice.value === value;
            });
            return (choice && choice.display_name) ? choice.display_name : '';
        };

        getMaxLength(path, base) {
            if (!base) { return ''; }
            return this.getFieldAttribute(`${base}.${path}`, 'max_length', 'GET');
        };

        getPlaceholderText(path, base, datepicker) {
            if (this.isReadonly(`${base}.${path}`)) { return 'Empty Field' }

            let label = this.getLabel(path, base),
                prefix = datepicker ? 'Select' : 'Enter';
            return `${prefix} ${label}`;
        };

        getReadonlyPlaceholder(data) {
            return !!(data && data.id) ? 'Empty Field' : '-';
        };

        _getSavedChoices(path) {
            if (!path) { return; }

            let choices = this.getData(`${path}_choices`);
            if (!choices) {
                choices = this.getChoices(path);
            }

            if (choices instanceof Array) {
                this._setData(`${path}_choices`, choices);
                return choices;
            }
        };

        _setReadonlyFieldClass(data) {
            return !data || !data.id ? 'no-data-fetched' : '';
        };

        _showPrefix(path, base, value, readonly) {
            return (!this.isReadonly(`${base}.${path}`) && !readonly) || !!value;
        };

        getTooltipText(selectedValues, options, field) {
            let tooltip = [];
            each(selectedValues, (value) => {
                let displayValue = filter(options, ['id', +value]);
                if (displayValue.length > 0) {
                    tooltip.push(displayValue[0][field]);
                }
            });
            return tooltip.join(', ');
        };

        isSpecialAudit(type) {
            return type === 'sa' || type && type.value === 'sa';
        };

        isJSONObj(str) {
            var json;
            try {
                json = JSON.parse(str);
            } catch (e) {
                return false;
            }
            return isObject(json);
        };

};

// export default CommonMethodsMixin
