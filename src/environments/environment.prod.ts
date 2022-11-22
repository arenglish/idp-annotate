// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const _e = {
  production: false,
  // apiUrl: '/static/annotate/assets/data',
  apiUrl: '/api',
  staticAssetsPath: '/static/annotate/assets',
  uploadPath: 'upload',
  urlPaths: {
    spims: 'spims',
    spim: 'spim',
    upload: 'upload'
  }
}

export const environment = {
  ..._e,
  urls: {
    spims: `${_e.apiUrl}/${_e.urlPaths.spims}`,
    spim: `${_e.apiUrl}/${_e.urlPaths.spim}/{spimId}`,
    upload: `${_e.apiUrl}/${_e.urlPaths.upload}`
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
