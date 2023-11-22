/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
/* eslint-disable max-len*/
import {Action, ActionCreator} from 'redux';
import {UPDATE_ROUTE_DETAILS} from './actionsConstants';
export const RESET_CURRENT_ITEM = 'RESET_CURRENT_ITEM';
import {BASE_URL} from '../../elements/config/config';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {EtoolsRedirectPath} from '@unicef-polymer/etools-utils/dist/enums/router.enum';
import {EtoolsRouteDetails} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {resetCurrentEngagement} from './engagement';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';

export interface AppActionUpdateDrawerState extends Action<'UPDATE_DRAWER_STATE'> {
  opened: boolean;
}
export interface AppActionShowToast extends Action<'SHOW_TOAST'> {
  active: boolean;
  message: string;
  showCloseBtn: boolean;
}

export type AppActionCloseToast = Action<'CLOSE_TOAST'>;
export interface AppActionUpdateRouteDetails extends Action<'UPDATE_ROUTE_DETAILS'> {
  routeDetails: EtoolsRouteDetails;
}
export type AppAction =
  | AppActionUpdateDrawerState
  | AppActionShowToast
  | AppActionCloseToast
  | AppActionUpdateRouteDetails;

export const updateStoreRouteDetails: ActionCreator<AppActionUpdateRouteDetails> = (routeDetails: any) => {
  return {
    type: UPDATE_ROUTE_DETAILS,
    routeDetails
  };
};

const getPage = (routeName: string) => {
  if (routeName.includes('engagements')) {
    return 'engagements';
  }
  if (routeName.includes('staff-sc')) {
    return 'staff-sc';
  }
  if (routeName.includes('special-audits')) {
    return 'special-audits';
  }
  if (routeName.includes('audits')) {
    return 'audits';
  }
  if (routeName.includes('micro-assessments')) {
    return 'micro-assessments';
  }
  if (routeName.includes('spot-checks') || routeName.includes('staff-spot-checks')) {
    return 'spot-checks';
  }
  return '';
};

const loadPageComponents = (routeDetails: EtoolsRouteDetails) => (_dispatch: any, _getState: any) => {
  if (!routeDetails) {
    // invalid route => redirect to 404 page
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
    return;
  }
  const page = getPage(routeDetails.routeName);
  if (page) {
    const appShell = document.body.querySelector('app-shell');
    import(`${window.location.origin}/ap/src/elements/pages/${page}/${page}-page-main.js`)
      .then()
      .catch((err) => {
        console.log(err);
        EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.NOT_FOUND));
      })
      .finally(() =>
        fireEvent(appShell, 'global-loading', {
          active: false,
          loadingSource: 'initialisation'
        })
      );
  }
  if (!page || routeDetails.routeName == 'not-found') {
    import(`${window.location.origin}/ap/src/elements/pages/not-found-page-view/not-found-page-view.js`);
  }
};

/** Update Redux route details and import lazy loaded pages */
export const handleUrlChange = (path: string) => (dispatch: any, getState: any) => {
  // if app route is accessed, redirect to default route (if not already on it)
  // @ts-ignore
  if (path === BASE_URL && BASE_URL !== EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT)) {
    EtoolsRouter.updateAppLocation(EtoolsRouter.getRedirectPath(EtoolsRedirectPath.DEFAULT));
    return;
  }

  // some routes need redirect to subRoute list
  const redirectPath: string | undefined = EtoolsRouter.getRedirectToListPath(path);
  if (redirectPath) {
    EtoolsRouter.updateAppLocation(redirectPath);
    return;
  }

  // handle can Access
  const currentRouteDetails = getState().app.routeDetails;
  const routeDetails = EtoolsRouter.getRouteDetails(path);

  dispatch(loadPageComponents(routeDetails!));
  if (currentRouteDetails?.params?.id && routeDetails?.params?.id !== currentRouteDetails.params.id) {
    dispatch(resetCurrentEngagement());
  }
  if (!isJsonStrMatch(routeDetails, currentRouteDetails)) {
    dispatch(updateStoreRouteDetails(routeDetails));
  }
};