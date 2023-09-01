import {Action} from 'redux';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import famEndpoints from '../../elements/config/endpoints';
import {getEndpoint} from '../../elements/config/endpoints-controller';
import {AnyObject} from '@unicef-polymer/etools-types';
import clone from 'lodash-es/clone';

export interface CommonDataActionSetAllStaticData extends Action<'SET_ALL_STATIC_DATA'> {
  data: AnyObject[];
}

export interface CommonDataActionUpdateStaticData extends Action<'UPDATE_STATIC_DATA'> {
  data: AnyObject[];
}

export type CommonDataAction = CommonDataActionSetAllStaticData | CommonDataActionUpdateStaticData;

export const getPartners = () => {
  return sendRequest({endpoint: {url: getEndpoint('partnerOrganisations').url}});
};

export const getUsers = () => {
  const usersEndpoint = clone(famEndpoints.users);
  usersEndpoint.url += '?page=1&page_size=30';
  return sendRequest({endpoint: {url: usersEndpoint.url}});
};

export const getStaffUsers = () => {
  return sendRequest({endpoint: {url: famEndpoints.staffMembersUsers.url}});
};

export const getOffices = () => {
  return sendRequest({endpoint: {url: famEndpoints.offices.url}});
};

export const getSections = () => {
  return sendRequest({endpoint: {url: famEndpoints.sectionsCovered.url}});
};

export const getStaticDropdownData = () => {
  const reqOpts = {
    csrf: true,
    endpoint: famEndpoints.static
  };

  return sendRequest(reqOpts);
};

export const getFilterAuditors = () => {
  const time = new Date().getTime();
  const filterAuditorsEndpoint = getEndpoint('filterAuditors');
  filterAuditorsEndpoint.url += `?reload=${time}`;
  return sendRequest({endpoint: {url: filterAuditorsEndpoint.url}});
};

export const getFilterPartners = () => {
  const time = new Date().getTime();
  const filterAuditorsEndpoint = getEndpoint('filterPartners');
  filterAuditorsEndpoint.url += `?reload=${time}`;
  return sendRequest({endpoint: {url: filterAuditorsEndpoint.url}});
};

export const getEngagementOptions = () => {
  const options = {
    endpoint: famEndpoints.createEngagement,
    csrf: true,
    method: 'OPTIONS'
  };
  return sendRequest(options);
};

export const getNewStaffSCOptions = () => {
  const options = {
    endpoint: famEndpoints.staffSCList,
    csrf: true,
    method: 'OPTIONS'
  };
  return sendRequest(options);
};

export const getAtmOptions = () => {
  const options = {
    endpoint: getEndpoint('attachments', {id: 'new'}),
    csrf: true,
    method: 'OPTIONS'
  };
  sendRequest(options);
};
