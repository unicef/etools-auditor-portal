import {PolymerElement} from '@polymer/polymer';
import isObject from 'lodash-es/isObject';
import keys from 'lodash-es/keys';
import isString from 'lodash-es/isString';
import {Constructor} from '../../types/global';

/**
 * @polymer
 * @mixinFunction
 */
function QueryParamsController<T extends Constructor<PolymerElement>>(baseClass: T) {
  class QueryParamsControllerClass extends baseClass {

    parseQueries() {
      let queriesOvj = {},
          queries = this.getQueriesString()
              .slice(1)
              .split('&');

      if (queries[0] === '') return {};
      queries.forEach((query) => {
        let [key, value] = query.split('=');
        queriesOvj[key] = value || true;
      });

      return queriesOvj;
    }

    getLocationProperty(property) {
      return window && window.location && window.location[property] || '';
    }

    getQueriesString() {
      return this.getLocationProperty('search');
    }

    getPath() {
      let path = this.getLocationProperty('pathname');
      if (~path.indexOf('/ap')) {
        path = path.replace('/ap','');
      }
      return path.slice(1);
    }

    buildQueryString(queryObj) {
      return keys(queryObj).map((key) => {
        let value = typeof queryObj[key] === 'boolean' ? '' :
            Boolean(queryObj[key]) ? `=${queryObj[key]}` : '';
        return `${key}${value}`;
      }).join('&');
    }

    updateQueries(newQueries, path?, noNotify?) {
      if (!isObject(newQueries)) {
        return false;
      }
      let keys = Object.keys(newQueries);

      if (!keys.length) {
        return false;
      }

      path = path && isString(path) ? path : this.getPath();

      let queries = this.parseQueries();

      keys.forEach((key) => {
        if (newQueries[key] === undefined || newQueries[key] === false) delete queries[key];
        else queries[key] = newQueries[key];
      });

      const queryString = this.buildQueryString(queries);

      window.history.replaceState({}, '', `${path}?${queryString}`);
      if (!noNotify) {
        window.dispatchEvent(new CustomEvent('location-changed'));
      }
      return true;
    }

    clearQueries() {
      window.history.replaceState({}, '', this.getLocationProperty('pathname'));
      window.dispatchEvent(new CustomEvent('location-changed'));
    }

  }

  return QueryParamsControllerClass;

}

export default QueryParamsController;

