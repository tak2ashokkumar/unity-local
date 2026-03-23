/**
 * Created by rt on 11/16/16.
 */
'use strict';

var app = angular.module('uldb');

app.factory('NagiosService', [
    '$http',
    'AlertService2',
    function ($http,
              AlertService2) {

        var appendValues = function (response, mapping) {
            return function (e, i, arr) {
                var values = [];
                for (var j = 0; j < response.data.results.length; j++) {
                    values.push({
                        series: i,
                        x: new Date(response.data.results[j].timestamp).getTime(),
                        y: response.data.results[j][mapping[e.key]]
                    });
                }
                e['values'] = values;
            };
        };
        var httpError = function (error) {
            AlertService2.danger(error.data);
        };
        var hostHistory = function (params) {
            return $http.get('/rest/nagios_host_history/', { params: params }).then(function (response) {
                var data = [
                    { key: 'UP', color: '#67b998' },
                    { key: 'DOWN', color: '#e75353' },
                    { key: 'UNKNOWN', color: '#ef6c00' },
                    { key: 'PENDING', color: '#616161' }
                ];

                var mapping = {
                    'UP': 'host_up',
                    'DOWN': 'host_down',
                    'UNKNOWN': 'host_unknown',
                    'PENDING': 'host_pending'
                };
                data.forEach(appendValues(response, mapping));
                // $scope.host_history_data = data;
                return data;
            }).catch(httpError);
        };

        var parseStats = function (response) {
            var service_keys = [
                'SERVICE_OK',
                'SERVICE_PENDING',
                'SERVICE_UNKNOWN',
                'SERVICE_WARNING',
                'SERVICE_CRITICAL'
            ];
            var color_mapping = {
                'SERVICE_OK': '#67b998',
                'SERVICE_WARNING': '#ef6c00',
                'SERVICE_CRITICAL': '#e75353',
                'SERVICE_UNKNOWN': '#D4E157',
                'SERVICE_PENDING': '#616161',
                'HOST_UP': '#67b998',
                'HOST_DOWN': '#e75353',
                'HOST_UNKNOWN': '#D4E157',
                'HOST_PENDING': '#616161'
            };
            var results = response.data;
            var data = {
                service_data: [],
                host_data: []
            };
            for (var key in results) {
                if (!(results.hasOwnProperty(key))) {
                    continue;
                }
                var datum = {
                    label: key,
                    color: color_mapping[key],
                    value: results[key]
                };
                if (service_keys.indexOf(key) !== -1) {
                    data.service_data.push(datum);
                } else {
                    data.host_data.push(datum);
                }
            }
            return data;
        };

        var serviceHistory = function (params) {
            return $http.get('/rest/nagios_service_history/', { params: params }).then(function (response) {
                var data = [
                    { key: 'OK', color: '#67b998' },
                    { key: 'WARNING', color: '#ef6c00' },
                    { key: 'CRITICAL', color: '#e75353' },
                    { key: 'UNKNOWN', color: '#D4E157' },
                    { key: 'PENDING', color: '#616161' }
                ];
                var mapping = {
                    'OK': 'service_ok',
                    'WARNING': 'service_warning',
                    'CRITICAL': 'service_critical',
                    'UNKNOWN': 'service_unknown',
                    'PENDING': 'service_pending'
                };
                data.forEach(appendValues(response, mapping));
                return data;
            }).catch(httpError);
        };

        var stats = function () {
            return $http.get('/rest/host_monitor/stats/').then(function (response) {
                return parseStats(response);
            }).catch(httpError);
        };

        var problemHosts = function () {
            return $http.get('/rest/host_monitor/problem_hosts/').then(function (response) {
                return response.data;
            });
        };
        var problemServices = function () {
            return $http.get('/rest/host_monitor/problem_services/').then(function (response) {
                return response.data;
            });
        };

        return {
            hostHistory: hostHistory,
            serviceHistory: serviceHistory,
            stats: stats,
            problemHosts: problemHosts,
            problemServices: problemServices,

            // utility
            parseStats: parseStats
        };
    }
]);
