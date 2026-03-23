var app = angular.module('uldb');
app.controller('CustomerDasboardController', [
    '$scope',
    '$routeParams',
    '$rootScope',
    '$q',
    '$filter',
    // 'uiGmapGoogleMapApi',
    // 'uiGmapIsReady',
    'CustomerDashboardService',
    'DataFormattingService',
    'TableHeaders',
    'Organization',
    'UIService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope,
              $routeParams,
              $rootScope,
              $q,
              $filter,
              // uiGmapGoogleMapApi,
              // uiGmapIsReady,
              CustomerDashboardService,
              DataFormattingService,
              TableHeaders,
              Organization,
              UIService,
              AbstractControllerFactory2,
              ULDBService2) {
        var org = Organization.get({ id: $routeParams.id }).$promise.then(function (response) {
            $scope.organization_name = response.name;
        });
        UIService.setTitle($scope.organization_name);

        // todo: add these for nagios integration
        $scope.nagios_model = { modifiable: false };
        $scope.nagios_ctrl_config = {
            paginate: true,
            page_size: 5
        };
        $scope.nagios_ctrl = AbstractControllerFactory2($scope.nagios_model,
            ULDBService2.hostMonitor($routeParams.id), $scope.nagios_ctrl_config);

        $scope.ms_headers = TableHeaders.mschedules_headers;
        $scope.tickets_headers = TableHeaders.tickets;
        $scope.alerts_headers = TableHeaders.alerts;

        $scope.id = $routeParams.id;

        var status_dict = { "C": "Completed", "F": "Future Plan", "O": "Ongoing" };
        CustomerDashboardService.get_ms_data($routeParams.id).then(function (result) {
            // console.log('Maintennace Data : '+angular.toJson(result));
            angular.forEach(result.data.info, function (value, key) {
                if (value.status in status_dict) {
                    value.status = status_dict[value.status];
                }
            });
            $scope.ms_content = result;
        });

        CustomerDashboardService.get_datacenters_data($routeParams.id).then(function (result) {
            $scope.datacenternames = DataFormattingService.formatGraphDetails(result);
        });

        CustomerDashboardService.get_alerts_data().then(function (result) {
            $scope.alerts_content = DataFormattingService.formatLocationDetails(result);
        });

        $scope.load_tickets = function (results) {

            var tickets_data = [];
            angular.forEach(results, function (value, key) {

                var ticket_json = {};
                ticket_json.ticket_id = '' + value.id.toString() + ' ';
                ticket_json.subject = value.subject;
                ticket_json.customer = $scope.organization_name;
                angular.forEach(value.custom_fields, function (v, k) {
                    if (v.id == 32509407) {
                        if (v.value != null && v.value != '') {
                            ticket_json.datacenter = v.value.toUpperCase();
                        }
                        else {
                            ticket_json.datacenter = 'N/A';
                        }

                    }

                });

                ticket_json.status = value.status;
                if (value.priority == null) {
                    ticket_json.priority = 'N/A';
                }
                else {
                    ticket_json.priority = value.priority;
                }

                ticket_json.last_updated = $filter('date')(value.updated_at, 'medium');
                tickets_data.push(ticket_json);

            });
            return tickets_data;
        };


        CustomerDashboardService.get_tickets_data($routeParams.id).then(function (result) {

            var obj = { data: null };
            obj.data = { info: null };

            var tickets_data = [];
            var tickets = [];

            if (result.result.results) {
                tickets = $scope.load_tickets(result.result.results);
            }
            else {
                tickets = $scope.load_tickets(result.result.tickets);
            }

            obj.data.info = tickets;
            $scope.tickets_content = obj;
        });

        CustomerDashboardService.get_datacenter_count($routeParams.id).then(function (result) {
            $scope.datacenter_count = result;
        });
        CustomerDashboardService.get_colocation_count($routeParams.id).then(function (result) {
            $scope.colocation_count = result;
        });
        CustomerDashboardService.get_private_cloud_count($routeParams.id).then(function (result) {
            $scope.private_cloud_count = result;
        });
        CustomerDashboardService.get_public_cloud_count($routeParams.id).then(function (result) {
            $scope.public_cloud_count = result;
        });

        //$scope.map = {center: {latitude: 44, longitude: -100}, zoom: 3, draggable: "true"};

        $scope.map = {
            center: {
                latitude: 44.0,
                longitude: -100.0
            },
            zoom: 3,
            draggable: "true",
            control: {},
            markers: []
        };


        // CustomerDashboardService.get_markers($routeParams.id).then( function(result) {
        //     $scope.markers = result;
        // });
        $scope.polylines = [];

        CustomerDashboardService.get_markers($routeParams.id).then(function (result) {
            var result_adjusted = [];

            angular.forEach(result, function (value, key) {
                var lat_count = 0;
                var long_count = 0;
                var offset = 0.01;
                angular.forEach(result, function (value_internal, key_internal) {
                    if (value.coords.latitude == value_internal.coords.latitude) {
                        lat_count += 1;
                    }
                    if (value.coords.latitude == value_internal.coords.latitude) {
                        long_count += 1;
                    }
                });
                if (lat_count > 1) {
                    value.coords.latitude = parseFloat(value.coords.latitude) + offset;
                }
                if (long_count > 1) {
                    value.coords.latitude = parseFloat(value.coords.latitude) + offset;

                }
                result_adjusted.push(value);
            });
            Array.prototype.push.apply($scope.map.markers, result_adjusted);
            // uiGmapIsReady.promise(1).then(function (instances) {
            //     //$scope.map.control.refresh();
            //      $scope.map.markers = result_adjusted;
            //      //$scope.$digest();
            // });
        });


        // uiGmapGoogleMapApi.then(function () {
        //     //$scope.polylines = CustomDataService.get_map_data();
        //     $scope.map_markers = $scope.markers;
        //     $scope.clickMarker = function (gMarker, eventName, model) {
        //         //alert("Details: " + gMarker.coords.latitude + "," + gMarker.coords.longitude);
        //     };
        // });


        $scope.deleteCustomer = function (customer) {
            var index = $scope.customers.indexOf(customer);
            $scope.customers.splice(index, 1);
            // $scope.customers.splice($index, 1);
            alert('customerDeleted', customer);
        };

        $scope.addCustomerItem = function () {
            //Check id the user is already pinned inside
            if ($scope.names.indexOf($scope.selected) == -1) {
                alert('Please add a valid user');
            }
            else {
                if ($scope.selectednames.indexOf($scope.selected) == -1) {
                    $scope.selectednames.push($scope.selected);
                }
                else {
                    alert('User added already');
                }
            }
        };


        $scope.horizantalOptions = {
            chart: {
                type: 'multiBarHorizontalChart',
                height: 40,
                width: 170,
                margin: {
                    top: 0,
                    right: 1,
                    bottom: 0,
                    left: 80
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                showValues: true,
                valueFormat: function (d) {
                    return d3.format(',.0f')(d);
                },
                "showXAxis": true,
                "showYAxis": false,
                "showLegend": false,
                "showControls": false,
                "stacked": true,
                "tooltips": false
            }
        };
    }
]);
