'use strict';
var app = angular.module('uldb');

app.controller('NetworkingController', [
    '$scope',
    '$http',
    '$resource',
    '$filter',
    '$location',
    '$routeParams',
    'Switch',
    'SwitchMonitor',
    'MonitoredSwitchPort',
    'TaskService',
    'SearchService',
    'OrganizationFast',
    'GraphedPort',
    'AbstractControllerFactory',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope,
              $http,
              $resource,
              $filter,
              $location,
              $routeParams,
              Switch,
              SwitchMonitor,
              MonitoredSwitchPort,
              TaskService,
              SearchService,
              OrganizationFast,
              GraphedPort,
              AbstractControllerFactory,
              AbstractControllerFactory2,
              ULDBService2) {
        $scope.tab = $routeParams.t;
        $scope.tabs = [
            { name: 'Customer Utilization', url: 'obsCust.html' },
            { name: 'Port List', url: 'obsPort.html' },
            { name: 'Raw Observium Host List', url: 'obsHost.html' },
            { name: 'Transit Ports', url: 'obsTransit.html' },
            { name: 'Transit Port Graphs', url: 'obsOrg.html' }
        ];
        // select the tab based on param
        $scope.activeTab = 0;
        var tab = $scope.tab;
        if (tab) {
            $scope.tabs.forEach(function (e, i) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.updateTab = function (idx) {
            $location.search({ t: $scope.tabs[idx].name });
        };
        $scope.customer = null;
        $scope.getOrgs = new SearchService(OrganizationFast).search;
        $scope.ports = [];

        $scope.observiumScope = {};
        $scope.transitScope = {};
        $scope.observium_ctrl = AbstractControllerFactory2($scope.observiumScope, ULDBService2.observium_host());
        $scope.transit_ctrl = AbstractControllerFactory2($scope.transitScope, ULDBService2.transit_port());

        GraphedPort.query({ organization_id: 1 }).$promise.then(function (response) {
            $scope.org_ports = response.results;
        });
        $scope.intervals = {};

        $scope.day_opts = {
            chart: {
                type: 'multiBarHorizontalChart',
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                height: 432,
                margin: {
                    left: 200
                },
                showControls: false,
                'showValues': true,
                'duration': 500,
                'xAxis': {
                    'showMaxMin': false
                },
                'yAxis': {
                    'axisLabel': 'Values'
                },
                showLegend: true,
                legendPosition: 'right'
            }
        };


        $scope.stats = {
            day: [{ key: 'Percentile', color: '#03A9F4', values: [] }],
            week: [{ key: 'Percentile', color: '#03A9F4', values: [] }],
            month: [{ key: 'Percentile', color: '#03A9F4', values: [] }],
            year: [{ key: 'Percentile', color: '#03A9F4', values: [] }]
        };

        $scope.load = function (org) {
            $location.search('u', org.uuid);
            GraphedPort.query({ organization_id: org.id }).$promise.then(function (response) {
                $scope.loaded = true;
                $scope.ports = response.results;
            });
            $http.get('/rest/org/' + org.id + '/network_stats/').then(function (response) {
                for (var key in $scope.stats) {
                    if ($scope.stats.hasOwnProperty(key)) {
                        for (var intf in response.data[key]) {
                            if (response.data[key].hasOwnProperty(intf)) {
                                //noinspection JSUnresolvedVariable
                                var res = { label: intf, value: response.data[key][intf].total.percentile };
                                $scope.stats[key][0].values.push(res);
                            }
                        }
                    }
                }
            });
        };
        $scope.loaded = false;


        if (angular.isDefined($routeParams.u)) {
            var org_uuid = $routeParams.u;
            OrganizationFast.get({ uuid: org_uuid }).$promise.then(function (response) {
                if (response.results.length > 0) {
                    $scope.customer = response.results[0];
                    $scope.load($scope.customer);
                }
            });
        }

        $scope.graphedPortScope = { modifiable: true };
        $scope.graphedPortCtrl = AbstractControllerFactory2($scope.graphedPortScope,
            ULDBService2.graphedPort()
        );
    }
]);

app.controller('RawObserviumController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.observium_host());
    }
]);

app.controller('TransitPortController', [
    '$scope',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.transit_port());
    }
]);

app.controller('UtilizationController', [
    '$scope',
    'SearchService',
    'OrganizationFast',
    function ($scope,
              SearchService,
              OrganizationFast) {

    }
]);
