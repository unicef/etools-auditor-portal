import {PolymerElement} from '@polymer/polymer/polymer-element';
import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import {Constructor} from '../../types/global';

let _user: any = null;

let _groups: object[] | string[] = [];

/**
 * @polymer
 * @mixinFunction
 */
function UserControllerMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class UserControllerMixinClass extends (baseClass) {

    _setUserData(user: any) {
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
      this._setGroups(user);
    }

    _setGroups(user) {
      if (!user.groups.length) {
        throw new Error('Can not find user group!');
      }
      _groups = user.groups.map((group) => {
        return group.name;
      });
    }

    getUserData() {
      return cloneDeep(_user);
    }

    isAuditor() {
      if (!_groups) {
        throw new Error('User data is missing or incorrect');
      }
      return !!~_groups.indexOf('Auditor');
    }

  }

  return UserControllerMixinClass;
}

export default UserControllerMixin;
