// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
let _e = {
  production: false,
  // apiUrl: '/assets/data',
  apiHost: 'http://localhost:8000',

  appAssetsPath: 'assets',
  uploadPath: 'upload',
  urlPaths: {
    api: 'api',
    spims: 'spims',
    spim: 'spim',
    mask: 'mask',
    upload: 'upload'
  }
}

const _e2 = {
  ..._e,
  serverAssetsPath: _e.apiHost,
  urls: {
    api: `${_e.apiHost}/${_e.urlPaths.api}`
  }
}

export let environment = {
  ..._e,
  ..._e2,

  urls: {
    ..._e2.urls,
    spims: `${_e2.urls.api}/${_e.urlPaths.spims}`,
    spim: `${_e2.urls.api}/${_e.urlPaths.spim}/{spimId}`,
    mask: `${_e2.urls.api}/${_e.urlPaths.mask}/{maskId}`,
    upload: `${_e2.urls.api}/${_e.urlPaths.upload}`
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
