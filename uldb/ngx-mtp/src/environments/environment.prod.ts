export const environment = {
  production: true,
  assetsUrl: 'static/mtpdist/assets/img/',
  staticData: 'static/mtpdist/assets/static-data/',
  unityDateFormat: 'MMM dd, y, H:mm:ss',
  dateLocateForAngularDatePipe: 'en-US',
  pollingInterval: 30000,
  gmk: 'AIzaSyAtO2aDDnFIBISFiPOi2-ucP_pB16cJKTU',
  gmId: 'da696c0425f1f845',
  DISABLE_WORLD_MAP: process.env.DISABLE_WORLD_MAP === 'true' ? true : false
};
