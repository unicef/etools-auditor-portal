import {Reducer} from 'redux';
import {UPDATE_USER_DATA} from '../actions/actionsConstants';
import {RootAction} from '../store';
import {EtoolsUser} from '@unicef-polymer/etools-types';

export interface UserState {
  data: EtoolsUser | null;
}

const INITIAL_USER_DATA: UserState = {
  data: null
};

const userData: Reducer<UserState, RootAction> = (state = INITIAL_USER_DATA, action) => {
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        ...state,
        data: action.data
      };
    default:
      return state;
  }
};

export default userData;
