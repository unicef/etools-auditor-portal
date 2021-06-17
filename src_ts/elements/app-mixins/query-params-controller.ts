import isObject from 'lodash-es/isObject';
import keys from 'lodash-es/keys';
import isString from 'lodash-es/isString';
import {GenericObject} from '../../types/global';
import {BASE_PATH} from '../../elements/app-config/config';

export function parseQueries(): GenericObject {
  const queriesOvj: GenericObject = {};
  const queries = getQueriesString().slice(1).split('&');

  if (queries[0] === '') return {};
  queries.forEach((query) => {
    const [key, value] = query.split('=');
    queriesOvj[key] = value || true;
  });

  return queriesOvj;
}

function _getLocationProperty(property) {
  return (window && window.location && window.location[property]) || '';
}

export function getQueriesString() {
  return _getLocationProperty('search');
}

function getPath() {
  let path = _getLocationProperty('pathname');
  if (~path.indexOf(`/${BASE_PATH}`)) {
    path = path.replace(`/${BASE_PATH}`, '');
  }
  return path.slice(1);
}

export function buildQueryString(queryObj) {
  return keys(queryObj)
    .map((key) => {
      const value = typeof queryObj[key] === 'boolean' ? '' : queryObj[key] ? `=${queryObj[key]}` : '';
      return `${key}${value}`;
    })
    .join('&');
}

export function updateQueries(newQueries, path?, noNotify?) {
  if (!isObject(newQueries)) {
    return false;
  }
  const keys = Object.keys(newQueries);

  if (!keys.length) {
    return false;
  }

  path = path && isString(path) ? path : getPath();

  const queries = parseQueries();

  keys.forEach((key) => {
    if (newQueries[key] === undefined || newQueries[key] === false || newQueries[key] === '') {
      delete queries[key];
    } else {
      queries[key] = newQueries[key];
    }
  });

  const queryString = buildQueryString(queries);

  window.history.replaceState({}, '', `${path}?${queryString}`);
  if (!noNotify) {
    window.dispatchEvent(new CustomEvent('location-changed'));
  }

  return true;
}

export function clearQueries() {
  window.history.replaceState({}, '', _getLocationProperty('pathname'));
  window.dispatchEvent(new CustomEvent('location-changed'));
}

export function getQueryParams(route: GenericObject = {}) {
  const queries = route.__queryParams || {};
  if (location.search) {
    const searchString = decodeURIComponent(location.search);
    const qsStartIndex = searchString.indexOf('?');
    if (qsStartIndex > -1) {
      const paramsStr = searchString.split('?')[1];
      if (paramsStr) {
        const qs = paramsStr.split('&');
        qs.forEach((qp: string) => {
          const qParam = qp.split('=');
          queries[qParam[0] as string] = qParam[1];
        });
      }
    }
  }
  return queries;
}
