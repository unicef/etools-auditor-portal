import {Reducer} from 'redux';
import {RESET_CURRENT_ENGAGEMENT, SET_CURRENT_ENGAGEMENT, UPDATE_CURRENT_ENGAGEMENT} from '../actions/actionsConstants';
import {RootAction} from '../store';
import {AnyObject} from '@unicef-polymer/etools-types';

export interface EngagementState {
  data: AnyObject | null;
  originalData: AnyObject | null;
  options: AnyObject | null;
  attachmentOptions: AnyObject | null;
  reportAttachmentOptions: AnyObject | null;
  apOptions: AnyObject | null;
}

const INITIAL_ENGAGEMENT_DATA: EngagementState = {
  data: null,
  originalData: null,
  options: null,
  attachmentOptions: null,
  reportAttachmentOptions: null,
  apOptions: null
};

const engagement: Reducer<EngagementState, RootAction> = (state = INITIAL_ENGAGEMENT_DATA, action) => {
  switch (action.type) {
    case SET_CURRENT_ENGAGEMENT:
      return {
        ...state,
        data: action.payload.data,
        originalData: {...action.payload.data},
        options: action.payload.options,
        attachmentOptions: action.payload.attachmentOptions,
        reportAttachmentOptions: action.payload.reportAttachmentOptions,
        apOptions: action.payload.apOptions
      };
    case UPDATE_CURRENT_ENGAGEMENT:
      return {
        ...state,
        data: action.payload
      };
    case RESET_CURRENT_ENGAGEMENT:
      return {
        ...state,
        data: null,
        originalData: null,
        options: null,
        attachmentOptions: null,
        reportAttachmentOptions: null,
        apOptions: null
      };
      break;
    default:
      return state;
  }
};

export default engagement;
