import {GenericObject} from '../../types/global';

// For simple objects, no nesting
export const objectsAreTheSame = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  }
  if (!obj1 && !obj2) {
    return true;
  }
  const props1: GenericObject = obj1 ? Object.keys(obj1) : {};
  const props2: GenericObject = obj2 ? Object.keys(obj2) : {};

  if (props1.length !== props2.length) {
    return false;
  }
  if (props1.length === 0) {
    return true;
  }

  let areDiff = false;
  props1.forEach((p: string) => {
    if (obj1[p] !== obj2[p]) {
      areDiff = true;
    }
  });
  return !areDiff;
};
