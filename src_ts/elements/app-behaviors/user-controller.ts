import cloneDeep from 'lodash-es/cloneDeep';
import isObject from 'lodash-es/isObject';
import isArray from 'lodash-es/isArray';


function UserController <T extends Constructor>(baseClass: T) {
    class UserController extends (baseClass) {

        _setUserData(user) {
            if (_user) { throw 'User already exists!'; }

            if (!user || !isObject(user) || isArray(user)) { throw new Error('User must be an object'); }
            if (!user.user || !user.groups) { throw new Error('User must have id and groups fields!'); }

            _user = cloneDeep(user);
            this._setGroups(user);
        }

        _setGroups(user) {
            if (!user.groups.length) { throw new Error('Can not find user group!'); }
            _groups = user.groups.map((group) => {
                return group.name;
            });
        }

        getUserData() {
            return cloneDeep(_user);
        }

        isAuditor() {
            if (!_groups) { throw new Error('User data is missing or incorrect'); }
            return !!~_groups.indexOf('Auditor');
        }

    }
    return UserController;

}

export default UserController;
