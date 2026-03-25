// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  assetsUrl: 'static/assets/images/',
  assetsPath: 'static/assets/',
  staticData: 'static/assets/custom-data/',
  unityOneDateFormat: 'MMM DD, y, H:mm:ss',
  unityDateFormat: 'MMM dd, y, H:mm:ss',
  dateLocateForAngularDatePipe: 'en-US',
  pollingInterval: 3000,
  gmk: 'AIzaSyBqymWM02elVMqsILC51xw1dzIci6fLMhU',
  gmId: 'da696c0425f1f845',
  DISABLE_WORLD_MAP: process.env.DISABLE_WORLD_MAP === 'false' ? false : true,
  networkAgentHostUrl: 'http://10.192.11.72:8003/',
  theme: {
    allowSwitch: true,
    defaultTheme: 'light',
    availableThemes: ['light', 'dark'] as string[],
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
