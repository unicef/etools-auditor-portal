import { PolymerElement } from '@polymer/polymer';
import * as _ from 'lodash';
import {ErrorHandlerBehavior} from './error-handler-behavior';
// import {permission-controller}
// import {static-data-behavior}


/**
 * @polymer
 * @mixinFunction
 */
export class CommonMethodsBehavior extends PolymerElement {


    window.APBehaviors = window.APBehaviors || {};
    APBehaviors.CommonMethodsBehaviorImpl = {
        _resetFieldError: function(event) {
            if (!event || !event.target) { return false; }

            let field = event.target.getAttribute('field');
            if (field) { this.set(`errors.${field}`, false); }

            event.target.invalid = false;
        },

        isReadOnly: function(field, basePermissionPath, inProcess) {
            if (!basePermissionPath || inProcess) { return true; }

            let readOnly = this.isReadonly(`${basePermissionPath}.${field}`);
            if (readOnly === null) { readOnly = true; }

            return readOnly;
        },

        _setRequired: function(field, basePermissionPath) {
            if (!basePermissionPath) { return false; }

            let required = this.isRequired(`${basePermissionPath}.${field}`);

            return required ? 'required' : false;
        },

        _errorHandler: function(errorData) {
            if (!errorData) { return false; }
            if (this.requestInProcess) { this.requestInProcess = false; }
            this.set('errors', _.clone(this.refactorErrorObject(errorData)));
            if (this.tabTexts && this.tabTexts.fields.some(field => !!this.errors[field])) {
                this.fire('toast', {text: `${this.tabTexts.name}: Please correct errors`});
            }
        },

        _complexErrorHandler: function(errorData) {
            this.requestInProcess = false;
            if (!errorData) { return false; }

            let data = this.refactorErrorObject(errorData);
            let nonField = this.checkNonField(errorData);

            if (!this.dialogOpened && _.isString(data)) {
                this.fire('toast', {text: `${this.errorBaseText}${data}`});
            } else {
                this.set('errors', data);
            }

            if (nonField) {
                this.fire('toast', {text: `${this.errorBaseText}${nonField}`});
            }
        },

        _basePathChanged: function() {
            this.updateStyles();
        },

        _dataChanged: function() {
            if (this.dialogOpened) {
                this.requestInProcess = false;
                this.dialogOpened = false;
            }
            if (this.confirmDialogOpened) {
                this.requestInProcess = false;
                this.confirmDialogOpened = false;
            }
        },

        getLabel: function(path, base) {
            if (!base) { return ''; }
            return this.getFieldAttribute(`${base}.${path}`, 'label', 'POST') ||
                this.getFieldAttribute(`${base}.${path}`, 'label', 'GET');
        },

        getDisplayName: function(path, base, value) {
            if (!base) { return ''; }

            let choices = this._getSavedChoices(`${base}.${path}`);
            if (!choices) { return ''; }

            let choice = choices.find((choice) => {
                return choice && choice.value === value;
            });
            return (choice && choice.display_name) ? choice.display_name : '';
        },

        getMaxLength: function(path, base) {
            if (!base) { return ''; }
            return this.getFieldAttribute(`${base}.${path}`, 'max_length', 'GET');
        },

        getPlaceholderText: function(path, base, datepicker) {
            if (this.isReadonly(`${base}.${path}`)) { return 'Empty Field' }

            let label = this.getLabel(path, base),
                prefix = datepicker ? 'Select' : 'Enter';
            return `${prefix} ${label}`;
        },

        getReadonlyPlaceholder: function(data) {
            return !!(data && data.id) ? 'Empty Field' : '-';
        },

        _getSavedChoices: function (path) {
            if (!path) { return; }

            let choices = this.getData(`${path}_choices`);
            if (!choices) {
                choices = this.getChoices(path);
            }

            if (choices instanceof Array) {
                this._setData(`${path}_choices`, choices);
                return choices;
            }
        },

        _setReadonlyFieldClass: function(data) {
            return !data || !data.id ? 'no-data-fetched' : '';
        },

        _showPrefix: function(path, base, value, readonly) {
            return (!this.isReadonly(`${base}.${path}`) && !readonly) || !!value;
        },

        getTooltipText: function(selectedValues, options, field) {
            let tooltip = [];
            _.each(selectedValues, (value) => {
                let displayValue = _.filter(options, ['id', +value]);
                if (displayValue.length > 0) {
                    tooltip.push(displayValue[0][field]);
                }
            });
            return tooltip.join(', ');
        },

        isSpecialAudit: function(type) {
            return type === 'sa' || type && type.value === 'sa';
        },

        isJSONObj: function(str) {
            var json;
            try {
                json = JSON.parse(str);
            } catch (e) {
                return false;
            }
            return _.isObject(json);
        }
    };

    APBehaviors.CommonMethodsBehavior = [
        APBehaviors.CommonMethodsBehaviorImpl,
        APBehaviors.PermissionController,
        APBehaviors.ErrorHandlerBehavior,
        APBehaviors.StaticDataController,
    ];

}

customElements.define('common-methods-behavior', CommonMethodsBehavior);
