/*
* The type Constructor<T> is an alias for the construct signature
* that describes a type which can construct objects of the generic type T
* and whose constructor function accepts an arbitrary number of parameters of any type
* On the type level, a class can be represented as a newable function
*/
export type Constructor<T> = new (...args: any[]) => T;

export interface GenericObject {
  [key: string]: any;
}

export interface ValueAndDisplayName {
  value: string;
  display_name: string;
}

export interface AppRoute {
  prefix: string; // The part of route.path consumed by the 'pattern' of parent app-route component
  path: string;
  __queryParams: GenericObject;
}

