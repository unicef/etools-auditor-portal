import PolymerElement from '@polymer/polymer';
import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';
import {Constructor} from '../../types/global';
import {property} from "@polymer/decorators/lib/decorators";

/**
 * @polymer
 * @mixinFunction
 */
function UserControllerMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class UserControllerMixinClass extends (baseClass) {

    // TODO:  this might not work... _user & _groups is not used like this in old app (global variables)
    @property({type: Object})
    _user: object = null;

    @property({type: Object})
    _groups: object[] | string[] = [];

    _setUserData(user) {
      if (this._user) {
        throw 'User already exists!';
      }

      if (!user || !isObject(user) || isArray(user)) {
        throw new Error('User must be an object');
      }
      if (!user.user || !user.groups) {
        throw new Error('User must have id and groups fields!');
      }

      this._user = cloneDeep(user);
      this._setGroups(user);
    }

    _setGroups(user) {
      if (!user.groups.length) {
        throw new Error('Can not find user group!');
      }
      this._groups = user.groups.map((group) => {
        return group.name;
      });
    }

    getUserData() {
      return cloneDeep(this._user);
    }

    isAuditor() {
      if (!this._groups) {
        throw new Error('User data is missing or incorrect');
      }
      return !!~this._groups.indexOf('Auditor');
    }

  }

  return UserControllerMixinClass;
}

export default UserControllerMixin;
