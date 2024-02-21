import {Action, ActionCreator} from 'redux';
import {EtoolsUser} from '@unicef-polymer/etools-types';
import {UPDATE_USER_DATA} from './actionsConstants';

export interface UserActionUpdate extends Action<'UPDATE_USER_DATA'> {
  data: EtoolsUser;
}

export type UserAction = UserActionUpdate;
// @ts-ignore - for now
// type ThunkResult = ThunkAction<void, RootState, undefined, UserAction>;

export const updateUserData: ActionCreator<UserActionUpdate> = (data: EtoolsUser) => {
  return {
    type: UPDATE_USER_DATA,
    data
  };
};
