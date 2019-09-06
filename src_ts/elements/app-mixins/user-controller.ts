import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';

let _user: any = null;

let _groups: object[] | string[] = [];

export function setUserData(user: any) {
  if (_user) {
    throw 'User already exists!';
  }

  if (!user || !isObject(user) || isArray(user)) {
    throw new Error('User must be an object');
  }
  if (!user || !(user as any).user || !(user as any).groups) {
    throw new Error('User must have id and groups fields!');
  }

  _user = cloneDeep(user);
  _setGroups(user);
}

export function getUserData() {
  return cloneDeep(_user);
}

function _setGroups(user) {
  if (!user.groups.length) {
    throw new Error('Can not find user group!');
  }
  _groups = user.groups.map((group) => {
    return group.name;
  });
}

