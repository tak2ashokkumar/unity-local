var app = angular.module('uldb');

app.controller('ExampleController', [
    '$scope',
    function ($scope) {
        $scope.heading = "Example app";
    }
]);


app.factory('HypervisorService', [
    'Server',
    function (Server) {
        var getServers = function () {
            // return promise from the Resource function
            return Server.query({}).$promise.then(function (response) {
                return response.results;  // accessed as parameter from function passed to promise on completion
            });
        };

        return {
            getAllHypervisors: getServers
        };
    }
]);
app.controller('Widget1Controller', [
    '$scope',
    'HypervisorService',
    function ($scope, HypervisorService) {
        $scope.panel_heading = "Datacenter Locations";
        $scope.datacenters = [
            { name: "SF", lat: 65.00, long: -129.0 },
            { name: "LA", lat: 30.00, long: -129.0 },
            { name: "ASH", lat: 45.00, long: -100.0 }
        ];

    }
]);

app.controller('Widget2Controller', [
    '$scope',
    'HypervisorService',
    function ($scope, HypervisorService) {
        $scope.panel_heading = "Heading 2";
        $scope.servers = HypervisorService.servers;

        // consume promise
        HypervisorService.getAllHypervisors().then(function (results) {  // parameter mentioned above
            $scope.servers = results;
        });
    }
]);

app.controller('Widget3Controller', [
    '$scope',
    // 'uiGmapGoogleMapApi',
    function ($scope
        // , uiGmapGoogleMapApi
    ) {
        $scope.panel_heading = "Map";
        // uiGmapGoogleMapApi.then(function (maps) {
        //     $scope.map = {
        //         center: { latitude: 37.7749, longitude: -122.4194 },
        //         zoom: 8,
        //         options: {
        //             styles: [{
        //                 featureType: "road",
        //                 // stylers: [ { visibility: "off" } ]
        //             }]
        //         }
        //     };
        // });
    }
]);

app.factory('ExampleDataService', [
    function () {
        var model = [];

        return {
            model: model
        };
    }
]);

app.controller('ExampleDataController', [
    '$scope',
    '$http',
    'ExampleData',
    'ExampleDataService',
    'TaskService2',
    function ($scope, $http, ExampleData, ExampleDataService, TaskService2) {
        $scope.host = "";
        $scope.interface = "";

        $scope.examples = [];

        $scope.getExampleData = function () {
            // essentially, REST API call
            ExampleData.query().$promise.then(function (response) {
                angular.extend($scope.examples, response.results);
            });
        };

        $scope.currentModel = ExampleDataService.model;
        $scope.saveAngularModel = function () {
            angular.extend($scope.currentModel, $scope.examples);
        };

        $scope.getPortInfo = function () {
            $http.get('/rest/example_data/observium_port', {params: {host:$scope.host, interface: $scope.interface}})
            .then(function (response) {
            TaskService2.processTask(response.data.task_id).then(function (result) {
                $scope.result = result;
                });
            });
        };

        // ExampleData.query().$promise.then(function (response) {
        //     $scope.examples = response.results;
        // });


        // var p = $http.get('/rest/example_data/cron').then(function (response) {
        //     TaskService2.processTask(response.data.task_id, 10).then(function (result) {
        //         $scope.result = result;
        //     })
        // });


    }
]);
