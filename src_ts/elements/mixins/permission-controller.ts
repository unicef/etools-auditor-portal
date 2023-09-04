import omit from 'lodash-es/omit';
import get from 'lodash-es/get';
import {GenericObject} from '../../types/global';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';

const _permissionCollection: {
  edited_ap_options?: {allowed_actions: []};
  new_engagement?: {POST: GenericObject; GET: GenericObject; allowed_actions: []};
  new_staff_sc?: {POST: GenericObject; GET: GenericObject; title: string; allowed_actions: []};
  [key: string]: any;
} = {};

export function addToCollection(collectionName, data, title?) {
  // check arguments
  if (!collectionName || !data) {
    EtoolsLogger.warn('collectionName and data arguments must be provided!');
    return false;
  }
  if (typeof collectionName !== 'string') {
    EtoolsLogger.warn('collectionName must be a string');
    return false;
  }
  if (typeof data !== 'object' || typeof data.forEach === 'function') {
    EtoolsLogger.warn('data must be an object');
    return false;
  }

  // check existance
  if (_permissionCollection[collectionName]) {
    return false;
  }

  _permissionCollection[collectionName] = data;
  if (title) {
    _permissionCollection[collectionName].title = title;
  }
  _manageActions(collectionName);

  return true;
}

export function updateCollection(collectionName, data, title?) {
  if (!_permissionCollection[collectionName]) {
    EtoolsLogger.warn(`Collection ${collectionName} does not exist!`);
    return false;
  }
  if (typeof data !== 'object' || typeof data.forEach === 'function') {
    EtoolsLogger.warn('data must be an object');
    return false;
  }

  _permissionCollection[collectionName] = data;
  if (title) {
    _permissionCollection[collectionName].title = title;
  }
  _manageActions(collectionName);
  return true;
}

function _manageActions(collectionName) {
  const collection = _permissionCollection[collectionName];
  if (!collection) {
    EtoolsLogger.warn(`Collection ${collectionName} does not exist!`);
    return false;
  }

  const allowed_actions = (collection.allowed_FSM_transitions as any) || [];

  const actions: any[] = [];
  if (isValidCollection(collection.PUT)) {
    actions.push(_createAction('save', allowed_actions[0]));
  }
  if (isValidCollection(collection.POST)) {
    actions.push(_createAction('create', allowed_actions[0]));
  }

  collection.allowed_actions = actions.concat(allowed_actions);
  return true;
}

function _createAction(action, existedAction) {
  if (!existedAction || typeof existedAction === 'string') {
    return action;
  }
  return {
    code: action,
    display_name: action
  };
}

export function getFieldAttribute(path: string, attribute: string, actionType?: string) {
  if (!path || !attribute) {
    throw new Error('path and attribute arguments must be provided');
  }
  if (typeof path !== 'string') {
    throw new Error('path argument must be a string');
  }
  if (typeof attribute !== 'string') {
    throw new Error('attribute argument must be a string');
  }

  let value = getCollection(path, actionType);

  if (value) {
    value = value[attribute];
  }

  return value === undefined ? null : value;
}

export function readonlyPermission(path: string, optionsData: AnyObject) {
  return !collectionExists(path, optionsData, 'POST') && !collectionExists(path, optionsData, 'PUT');
}

export function getHeadingLabel(options: AnyObject, labelPath, defaultLabel) {
  if (!options || !labelPath) {
    return defaultLabel || '';
  }

  const label = get(options, `GET.${labelPath}.label`);

  return label && typeof label === 'string' ? label : defaultLabel || '';
}

export function isRequired(path: string, permissions: AnyObject) {
  return (
    getCollection(`${path}.required`, permissions, 'POST') || getCollection(`${path}.required`, permissions, 'PUT')
  );
}

export function collectionExists(path: string, optionsData: AnyObject, actionType?: string) {
  if (!path) {
    throw new Error('path argument must be provided');
  }
  if (typeof path !== 'string') {
    throw new Error('path argument must be a string');
  }
  return !!getCollection(path, optionsData, actionType);
}

// @dci to be replaced with getOptionsChoices
export function getChoices(path: string) {
  return getFieldAttribute(path, 'choices', 'GET') || getFieldAttribute(path, 'choices', 'POST');
}

export function getLabelFromOptions(optionsData, labelPath, defaultLabel) {
  if (!optionsData || !labelPath) {
    return defaultLabel || '';
  }
  const actions = get(optionsData, 'actions') || {};
  let label = get(actions, `GET.${labelPath}`);
  if (!label) {
    label = getCollection(labelPath, actions, 'GET');
  }
  return label && typeof label === 'string' ? label : defaultLabel || '';
}

export function getOptionsChoices(optionsData: AnyObject, path: string) {
  const actions = get(optionsData, 'actions') || optionsData;
  let choices = get(actions, `actions.GET.${path}.choices`) || get(actions, `actions.POST.${path}.choices`);
  if (!choices) {
    choices = getCollection(`${path}.choices`, actions);
  }
  return choices || [];
}

export function getCollection(path: string, options: AnyObject, actionType?: string) {
  const pathArr = path.split('.');

  let value = get(options, 'actions') || options || {};
  while (pathArr.length) {
    const key = pathArr.shift()!;
    if (value[key]) {
      value = value[key];
    } else {
      const action = actionType
        ? value[actionType]
        : isValidCollection(value.GET) || isValidCollection(value.POST) || isValidCollection(value.PUT);

      value = action || value.child || value.children;
      pathArr.unshift(key);
    }
    if (!value) {
      break;
    }
  }
  return value;
}

export function isValidCollection(options: AnyObject) {
  const testedCollection = omit(options, 'allowed_actions');
  const actions = get(options, 'allowed_actions', []);
  if (options && (Object.keys(testedCollection).length || actions.length)) {
    return options;
  } else {
    return false;
  }
}

export function actionAllowed(options: AnyObject, action: string) {
  if (!action || !options) {
    return false;
  }

  let actions = options && options.allowed_actions;

  if (!actions || !actions.length) {
    return false;
  }
  // @dci
  if (typeof actions[0] !== 'string') {
    actions = actions.map((action) => action.code);
  }

  return !!~actions.indexOf(action);
}

// function noActionsAllowed(collection) {
//   if (!collection) {
//     return true;
//   }
//   if (typeof collection !== 'string') {
//     throw new Error('Collection argument must be a string');
//   }
//   collection = _permissionCollection[collection];

//   return !(collection && collection.allowed_actions && collection.allowed_actions.length);
// }

export function getActions(options: AnyObject) {
  if (!options) {
    return null;
  }

  return (options && options.allowed_actions) || null;
}
