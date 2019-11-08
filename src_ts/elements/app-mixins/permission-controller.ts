import omit from 'lodash-es/omit';
import get from 'lodash-es/get';
import {GenericObject} from '../../types/global';
import '@unicef-polymer/etools-behaviors/etools-logging';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging';

const _permissionCollection: {
  edited_ap_options?: {allowed_actions: []};
  new_engagement?: {POST: GenericObject; GET: GenericObject; allowed_actions: []};
  new_staff_sc?: {POST: GenericObject; GET: GenericObject; title: string; allowed_actions: []};
  [key: string]: any;
} = {};

export function addToCollection(collectionName, data, title?) {
  // check arguments
  if (!collectionName || !data) {
    logWarn('collectionName and data arguments must be provided!');
    return false;
  }
  if (typeof collectionName !== 'string') {
    logWarn('collectionName must be a string');
    return false;
  }
  if (typeof data !== 'object' || typeof data.forEach === 'function') {
    logWarn('data must be an object');
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
    logWarn(`Collection ${collectionName} does not exist!`);
    return false;
  }
  if (typeof data !== 'object' || typeof data.forEach === 'function') {
    logWarn('data must be an object');
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
    logWarn(`Collection ${collectionName} does not exist!`);
    return false;
  }

  const allowed_actions = collection.allowed_FSM_transitions as any || [];

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

export function getFieldAttribute(path, attribute, actionType?) {
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

export function readonlyPermission(path) {// isReadonly
  return !collectionExists(path, 'POST') && !collectionExists(path, 'PUT');
}

export function isRequired(path) {
  return getFieldAttribute(path, 'required', 'POST') ||
    getFieldAttribute(path, 'required', 'PUT');
}

export function collectionExists(path, actionType?) {
  if (!path) {
    throw new Error('path argument must be provided');
  }
  if (typeof path !== 'string') {
    throw new Error('path argument must be a string');
  }

  return !!getCollection(path, actionType);
}

export function getChoices(path) {
  return getFieldAttribute(path, 'choices', 'GET') ||
    getFieldAttribute(path, 'choices', 'POST');
}

export function getCollection(path, actionType?) {
  path = path.split('.');

  let value = _permissionCollection;

  while (path.length) {
    const key = path.shift();
    if (value[key]) {
      value = value[key];
    } else {
      const action = actionType ? value[actionType] : isValidCollection(value.POST) ||
        isValidCollection(value.PUT) ||
        isValidCollection(value.GET);

      value = action || value.child || value.children;
      path.unshift(key);
    }

    if (!value) {
      break;
    }
  }

  return value;
}

export function isValidCollection(collection) {
  const testedCollection = omit(collection, 'allowed_actions');
  const actions = get(collection, 'allowed_actions', []);
  if (collection && (Object.keys(testedCollection).length || actions.length)) {
    return collection;
  } else {
    return false;
  }
}

export function actionAllowed(collection, action) {
  if (!action || !collection) {
    return false;
  }
  if (typeof collection !== 'string') {
    throw new Error('collection argument must be a string');
  }
  if (typeof action !== 'string') {
    throw new Error('action argument must be a string');
  }
  collection = _permissionCollection[collection];

  let actions = collection && collection.allowed_actions;

  if (!actions || !actions.length) {
    return false;
  }
  if (typeof actions[0] !== 'string') {
    actions = actions.map(action => action.code);
  }

  return !!~actions.indexOf(action);
}

function noActionsAllowed(collection) {
  if (!collection) {
    return true;
  }
  if (typeof collection !== 'string') {
    throw new Error('Collection argument must be a string');
  }
  collection = _permissionCollection[collection];

  return !(collection && collection.allowed_actions && collection.allowed_actions.length);
}

export function getActions(collection) {
  if (!collection) {
    return null;
  }
  if (typeof collection !== 'string') {
    throw new Error('Collection argument must be a string');
  }
  collection = _permissionCollection[collection];

  return collection && collection.allowed_actions || null;
}
