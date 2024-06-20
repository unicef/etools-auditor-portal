import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {
  EtoolsRouteCallbackParams,
  EtoolsRouteDetails
} from '@unicef-polymer/etools-utils/dist/interfaces/router.interfaces';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';

const routeParamRegex = '([^\\/?#=+]+)';

EtoolsRouter.init({
  baseUrl: Environment.basePath,
  redirectPaths: {
    notFound: '/not-found',
    default: '/engagements/list'
  },
  redirectedPathsToSubpageLists: ['staff-spot-checks', 'audits', 'micro-assessments']
});

EtoolsRouter.addRoute(new RegExp('^engagements/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
  return {
    routeName: 'engagements',
    subRouteName: 'list',
    path: params.matchDetails[0],
    queryParams: params.queryParams,
    params: null
  };
})
  .addRoute(new RegExp('^staff-sc/list$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'staff-sc',
      subRouteName: 'list',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^engagements/new$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'engagements',
      subRouteName: 'new',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(new RegExp('^staff-sc/new$'), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'staff-sc',
      subRouteName: 'new',
      path: params.matchDetails[0],
      queryParams: params.queryParams,
      params: null
    };
  })
  .addRoute(
    new RegExp(`^audits\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'audits',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^special-audits\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'special-audits',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^staff-spot-checks\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'staff-spot-checks',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^spot-checks\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'spot-checks',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^micro-assessments\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: 'micro-assessments',
        subRouteName: params.matchDetails[2], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          id: params.matchDetails[1]
        }
      };
    }
  )
  .addRoute(new RegExp(`^not-found$`), (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
    return {
      routeName: 'not-found',
      subRouteName: null,
      path: params.matchDetails[0],
      queryParams: null,
      params: null
    };
  })
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: params.matchDetails[1],
        subRouteName: params.matchDetails[3], // tab name
        path: params.matchDetails[0],
        queryParams: params.queryParams,
        params: {
          itemId: params.matchDetails[2]
        }
      };
    }
  )
  .addRoute(
    new RegExp(`^${routeParamRegex}\\/${routeParamRegex}$`),
    (params: EtoolsRouteCallbackParams): EtoolsRouteDetails => {
      return {
        routeName: params.matchDetails[0],
        subRouteName: 'list',
        path: params.matchDetails[1],
        queryParams: params.queryParams,
        params: null
      };
    }
  );
