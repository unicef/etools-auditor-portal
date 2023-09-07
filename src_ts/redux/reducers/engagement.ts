import {Reducer} from 'redux';
import {
  RESET_CURRENT_ENGAGEMENT,
  SET_CURRENT_ENGAGEMENT,
  SET_ENGAGEMENT_ERROR,
  UPDATE_CURRENT_ENGAGEMENT,
  UPDATE_ENGAGEMENT_ALL_OPTIONS
} from '../actions/actionsConstants';
import {RootAction} from '../store';
import {AnyObject} from '@unicef-polymer/etools-types';

export interface EngagementState {
  data: AnyObject | null;
  originalData: AnyObject | null;
  options: AnyObject | null;
  attachmentOptions: AnyObject | null;
  reportAttachmentOptions: AnyObject | null;
  apOptions: AnyObject | null;
  errorObject: AnyObject | null;
}

const INITIAL_ENGAGEMENT_DATA: EngagementState = {
  data: {},
  originalData: {},
  options: {},
  attachmentOptions: {},
  reportAttachmentOptions: {},
  apOptions: {},
  errorObject: {}
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
        apOptions: action.payload.apOptions,
        errorObject: null
      };
    case UPDATE_CURRENT_ENGAGEMENT:
      return {
        ...state,
        data: action.engagement
      };
    case UPDATE_ENGAGEMENT_ALL_OPTIONS:
      return {
        ...state,
        options: action.payload.options,
        attachmentOptions: action.payload.attachmentOptions,
        reportAttachmentOptions: action.payload.reportAttachmentOptions,
        apOptions: action.payload.apOptions
      };
    case RESET_CURRENT_ENGAGEMENT:
      return {
        ...state,
        data: {},
        originalData: {},
        options: {},
        attachmentOptions: {},
        reportAttachmentOptions: {},
        apOptions: {},
        errorObject: {}
      };
    case SET_ENGAGEMENT_ERROR:
      return {
        ...state,
        errorObject: action.payload
      };
    default:
      return state;
  }
};

export default engagement;
