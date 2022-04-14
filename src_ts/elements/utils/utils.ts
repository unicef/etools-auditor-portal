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

export function getProperty(object: GenericObject, path: string): any | null {
  const pathArray = path.split('.');
  return pathArray.reduce((data: GenericObject | null, field: string) => (data && data[field]) || null, object);
}
