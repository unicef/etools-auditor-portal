import isObject from 'lodash-es/isObject';
import keys from 'lodash-es/keys';
import isString from 'lodash-es/isString';
import {GenericObject} from '../../types/global';
import {BASE_PATH} from '../../elements/app-config/config';

export function parseQueries(): GenericObject {
  let queriesOvj: GenericObject = {},
    queries = getQueriesString()
      .slice(1)
      .split('&');

  if (queries[0] === '') return {};
  queries.forEach((query) => {
    let [key, value] = query.split('=');
    queriesOvj[key] = value || true;
  });

  return queriesOvj;
}

function _getLocationProperty(property) {
  return window && window.location && window.location[property] || '';
}

export function getQueriesString() {
  return _getLocationProperty('search');
}

function getPath() {
  let path = _getLocationProperty('pathname');
  if (~path.indexOf(`/${BASE_PATH}`)) { // TODO sqitch to '/ap'
    path = path.replace(`/${BASE_PATH}`, '');
  }
  return path.slice(1);
}

export function buildQueryString(queryObj) {
  return keys(queryObj).map((key) => {
    let value = typeof queryObj[key] === 'boolean' ? '' :
      Boolean(queryObj[key]) ? `=${queryObj[key]}` : '';
    return `${key}${value}`;
  }).join('&');
}

export function updateQueries(newQueries, path?, noNotify?) {
  if (!isObject(newQueries)) {
    return false;
  }
  let keys = Object.keys(newQueries);

  if (!keys.length) {
    return false;
  }

  path = path && isString(path) ? path : getPath();

  let queries = parseQueries();

  keys.forEach((key) => {
    if (newQueries[key] === undefined || newQueries[key] === false) delete queries[key];
    else queries[key] = newQueries[key];
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
