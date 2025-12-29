import {RouteDetails} from '@unicef-polymer/etools-types';
import {AnyObject} from '@unicef-polymer/etools-utils/dist/types/global.types';

export function setProperty(object: AnyObject, path = '', dataToSet: any): any | null {
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

export function getProperty(object: AnyObject, path: string): any | null {
  const pathArray = path.split('.');
  return pathArray.reduce((data: AnyObject | null, field: string) => (data && data[field]) || null, object);
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

export const setUsersFullName = (users: AnyObject[]) => {
  (users || []).forEach(
    (user) =>
      (user.full_name = user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'Unnamed User')
  );
  return users;
};

export const isActiveTab = (tab: string, expectedTab: string): boolean => {
  return tab === expectedTab;
};

export const _showDialogSpinner = (requestInProcess: boolean, uploadInProgress: boolean) => {
  // When the upload is in progress do not show the dialog spinner
  if (uploadInProgress) {
    return false;
  }
  return requestInProcess;
};

export const getBodyDialog = (dialogKey: string) => {
  return document.body.querySelector(dialogKey);
};

export const getObjectsIDs = (data: AnyObject[]) => {
  return (data || []).map((item: any) => item.id);
};

export const setDataOnSessionStorage = (key: string, data: any): void => {
  sessionStorage.setItem(key, JSON.stringify(data));
};

export const toggleCssClass = (condition: boolean, firstClass: string, secondClass: string): string => {
  return condition ? firstClass : secondClass;
};

export const divideWithExchangeRate = (value: number, exchange_rate: number): number => {
  if (!value) {
    value = 0;
  }
  if (!exchange_rate) {
    exchange_rate = 1;
  }
  return Math.round((value / exchange_rate) * 100) / 100;
};

export const getDataFromSessionStorage = (key: string): any => {
  const data = sessionStorage.getItem(key);
  if (data) {
    try {
      return JSON.parse(data);
    } catch (err) {
      console.log(err);
    }
  }
  return null;
};

export const capitalizeFirstLetter = (key: string): string => {
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : key;
};
