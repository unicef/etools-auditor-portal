import {RouteDetails} from '@unicef-polymer/etools-types';
import {GenericObject} from '../../types/global';

export function setProperty(object: GenericObject, path = '', dataToSet: any): any | null {
  const pathArray = path.split('.');
  let data = object;
  while (pathArray.length) {
    const field: string = pathArray.shift() as string;
    if (pathArray.length) {
      data = data[field] || (data[field] = {});
    } else {
      data[field] = dataToSet;
    }
  }
}

export function getTableRowIndexText(index) {
  if (!index && index !== 0) {
    return;
  }
  return `000${index + 1}`;
}

export function getProperty(object: GenericObject, path: string): any | null {
  const pathArray = path.split('.');
  return pathArray.reduce((data: GenericObject | null, field: string) => (data && data[field]) || null, object);
}

export const validateRequiredFields = (element) => {
  let isValid = true;
  element.shadowRoot.querySelectorAll('[required]:not([readonly]):not([hidden])').forEach((el) => {
    if (el && el.validate && !el.validate()) {
      isValid = false;
    }
  });
  return isValid;
};

export const getValueFromResponse = (response: {status: string; value?: any; reason?: any}, defaultValue: any = []) => {
  return response.status === 'fulfilled' ? response.value : defaultValue;
};

export const pageIsNotCurrentlyActive = (routeName: string, pageName: string) => {
  if (!routeName) {
    return true;
  }
  const arrPageName = pageName.split('|');
  return !arrPageName.includes(routeName);
};

export const commingFromDetailsToList = (
  prevRouteDetails: RouteDetails | undefined,
  routeDetails: RouteDetails | null
) => {
  return (
    routeDetails &&
    prevRouteDetails &&
    prevRouteDetails.subRouteName !== 'list' &&
    routeDetails?.subRouteName === 'list'
  );
};
