import famEndpoints from './endpoints';
import clone from 'lodash-es/clone';
import {GenericObject} from '../../types/global';

export function getEndpoint(endpointName, data?) {
  const endpoint = clone(famEndpoints[endpointName]);
  if (endpoint && Object.prototype.hasOwnProperty.call(endpoint, 'template') && endpoint.template !== '') {
    endpoint.url = window.location.origin + _generateUrlFromTemplate(endpoint.template, data);
  } else {
    endpoint.url = window.location.origin + endpoint.url;
  }
  return endpoint;
}

function _generateUrlFromTemplate(tmpl: string, data: GenericObject | undefined) {
  if (!tmpl) {
    throw new Error('To generate URL from endpoint url template you need valid template string');
  }

  if (data && Object.keys(data).length > 0) {
    for (const k in data) {
      if (Object.prototype.hasOwnProperty.call(data, k)) {
        const replacePattern = new RegExp('<%=' + k + '%>', 'gi');
        tmpl = tmpl.replace(replacePattern, (data as any)[k]);
      }
    }
  }

  return tmpl;
}
