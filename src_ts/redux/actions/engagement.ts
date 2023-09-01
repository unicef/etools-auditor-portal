import {Action, ActionCreator} from 'redux';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {getEndpoint} from '../../elements/config/endpoints-controller';
import {AnyObject} from '@unicef-polymer/etools-types';
import {RESET_CURRENT_ENGAGEMENT, SET_CURRENT_ENGAGEMENT, UPDATE_CURRENT_ENGAGEMENT} from './actionsConstants';

export interface EngagementActionSetData extends Action<'SET_CURRENT_ENGAGEMENT'> {
  payload: AnyObject;
}

export interface EngagementActionUpdateData extends Action<'UPDATE_CURRENT_ENGAGEMENT'> {
  payload: AnyObject;
}

export type EngagementAction = EngagementActionSetData | EngagementActionUpdateData;

export const setEngagementData: ActionCreator<EngagementAction> = (payload: AnyObject) => {
  return {
    type: SET_CURRENT_ENGAGEMENT,
    payload
  };
};

export const getEngagementData = (id: number, type: string) => {
  const options = {
    endpoint: getEndpoint('engagementInfo', {id, type: type})
  };
  return sendRequest(options);
};

export const updateCurrentEngagement = (engagement: AnyObject | null) => {
  return {
    type: UPDATE_CURRENT_ENGAGEMENT,
    engagement
  };
};

export const resetCurrentEngagement = () => {
  return {type: RESET_CURRENT_ENGAGEMENT};
};

export const getEngagementOptions = (id: number, type: string) => {
  const options = {
    method: 'OPTIONS',
    endpoint: getEndpoint('engagementInfo', {id, type: type})
  };
  return sendRequest(options);
};

export const getEngagementAttachmentOptions = (id: number) => {
  const options = {
    method: 'OPTIONS',
    endpoint: getEndpoint('attachments', {id})
  };
  return sendRequest(options);
};

export const getEngagementReportAttachmentsOptions = (id: number) => {
  const options = {
    method: 'OPTIONS',
    endpoint: getEndpoint('reportAttachments', {id})
  };
  return sendRequest(options);
};

export const getActionPointOptions = (id: number) => {
  const apBaseUrl = getEndpoint('engagementInfo', {id: id, type: 'engagements'}).url;
  const options = {
    method: 'OPTIONS',
    endpoint: {url: `${apBaseUrl}action-points/`}
  };
  return sendRequest(options);
};
