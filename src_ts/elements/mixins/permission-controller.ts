import omit from 'lodash-es/omit';
import get from 'lodash-es/get';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';

export function addAllowedActions(options: AnyObject) {
  if (!options || !options.actions) {
    return options;
  }
  const permissions = options.actions;
  const allowed_actions = (permissions.allowed_FSM_transitions as any) || [];

  const actions: any[] = [];
  if (isValidCollection(permissions.PUT)) {
    actions.push(_createAction('save', allowed_actions[0]));
  }
  if (isValidCollection(permissions.POST)) {
    actions.push(_createAction('create', allowed_actions[0]));
  }

  permissions.allowed_actions = actions.concat(allowed_actions);
  return options;
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

export function readonlyPermission(path: string, optionsData: AnyObject) {
  return !collectionExists(path, optionsData, 'POST') && !collectionExists(path, optionsData, 'PUT');
}

export function getHeadingLabel(options: AnyObject, labelPath, defaultLabel) {
  if (!options || !labelPath) {
    return defaultLabel || '';
  }
  const actions = options.actions ? options.actions : options;
  const label = get(actions, `GET.${labelPath}.label`);

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

export function getLabelFromOptions(optionsData, labelPath, defaultLabel) {
  if (!optionsData || !labelPath) {
    return defaultLabel || '';
  }
  const actions = get(optionsData, 'actions') || {};
  let labelFound = get(actions, `GET.${labelPath}`);
  if (!labelFound) {
    labelFound = getCollection(labelPath, actions, 'GET');
  }
  if (labelFound) {
    if (typeof labelFound === 'string') {
      return labelFound;
    }
    if (labelFound.label) {
      return labelFound.label;
    }
  }
  return defaultLabel || '';
}

export function getOptionsChoices(optionsData: AnyObject, path: string) {
  const actions = get(optionsData, 'actions') || optionsData;
  let choices = get(actions, `GET.${path}.choices`) || get(actions, `POST.${path}.choices`);
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
    if (typeof value[key] !== 'undefined') {
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

  let actions = options.actions && options.actions.allowed_actions;

  if (!actions || !actions.length) {
    return false;
  }
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
