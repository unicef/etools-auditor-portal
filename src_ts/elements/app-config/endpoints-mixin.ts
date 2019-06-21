import { PolymerElement } from '@polymer/polymer';
import famEndpoints from './endpoints';
import clone from 'lodash-es/clone';
import { Constructor } from '../../types/global';


function EndpointsMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class EndpointsMixinClass extends baseClass {

    getEndpoint(endpointName, data) {
      let endpoint = clone(famEndpoints[endpointName]);
      if (endpoint && endpoint.hasOwnProperty('template') && endpoint.template !== '') {
          endpoint.url = window.location.origin + this._generateUrlFromTemplate(endpoint.template, data);
      }
      return endpoint;
    }

    protected _generateUrlFromTemplate(tmpl: string, data: object | undefined) {
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
  }

  return EndpointsMixinClass;
}

export default EndpointsMixin;
