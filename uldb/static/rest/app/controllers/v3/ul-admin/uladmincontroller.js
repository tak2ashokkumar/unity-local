var app = angular.module('uldb');
app.controller('UladminController', [
    '$scope',
    '$http',
    '$q',
    '$filter',
    '$rootScope',
    '$routeParams',
    '$location',
    '$uibModal',
    // 'uiGmapGoogleMapApi',
    // 'uiGmapIsReady',
    'uladminService',
    'CustomDataService',
    'OrganizationFast',
    'DataFormattingService',
    'TableHeaders',
    'UIService',
    'AbstractControllerFactory2',
    'AlertService2',
    'ULDBService2',
    'TicketOrg',
    'ZendeskTicket',
    function ($scope,
              $http,
              $q,
              $filter,
              $rootScope,
              $routeParams,
              $location,
              $uibModal,
              // uiGmapGoogleMapApi,
              // uiGmapIsReady,
              uladminService,
              CustomDataService,
              OrganizationFast,
              DataFormattingService,
              TableHeaders,
              UIService,
              AbstractControllerFactory2,
              AlertService2,
              ULDBService2,
              TicketOrg,
              ZendeskTicket) {

        UIService.setTitle('Unity');
        $scope.names = [];
        $scope.organization_dict_list = [];
        $scope.selectednames = [];
        $scope.allcustomers = [];
        $scope.map_markers = [];
        $scope.ms_headers = TableHeaders.mschedules_headers;
        $scope.tickets_headers = TableHeaders.tickets;
        $scope.alerts_headers = TableHeaders.alerts;

        $scope.alerts = [];

        var ticket_org = [];
        var ticket_data = {};

        var subnavItems = {
            overview: {
                url: 'overview.html'
            },
            stack: {
                url: 'fullStack.html'
            }
        };

        $scope.goto = function (key) {
            $scope.p = subnavItems[key];
            $location.search({ t: key });
            $scope.currentNavItem = key;
        };

        var tab = $routeParams.t;
        if (tab) {
            if (subnavItems.hasOwnProperty(tab)) {
                $scope.goto(tab);
            }
        } else {
            $scope.p = subnavItems['overview'];
            $scope.currentNavItem = 'overview';
        }


        $scope.nagios_model = { modifiable: false };
        $scope.nagios_ctrl_config = {
            paginate: true,
            page_size: 5,
            filterFunc: function (fieldList) {
                if (!angular.isDefined(fieldList)) {
                    return;
                }
                return fieldList.filter(function (e) {
                    if (angular.isDefined(e)) {
                        return ['instance', 'last_known_state', 'last_checked'].indexOf(e.name) !== -1;
                    }
                    return false;
                });
            }
        };
        $scope.nagios_ctrl = AbstractControllerFactory2(
            $scope.nagios_model,
            ULDBService2.hostMonitor(),
            $scope.nagios_ctrl_config
        );


        $scope.maintenance_model = { modifiable: false };
        $scope.maintenance_config = {};
        $scope.maintenance_ctrl = AbstractControllerFactory2(
            $scope.maintenance_model,
            ULDBService2.maintenace_schedule(),
            $scope.maintenance_config
        );



        // var status_dict = {
        //     'C': 'Completed',
        //     'F': 'Future Plan',
        //     'O': 'Ongoing'
        // };
        // CustomDataService.get_ms_data().then(function (result) {
        //     angular.forEach(result.data.info, function (value, key) {
        //         if (value.status in status_dict) {
        //             value.status = status_dict[value.status];
        //         }
        //     });
        //     $scope.ms_content = result;
        // });

        $scope.load_customer_widget = function load_customer_widget() {
            CustomDataService.get_pinned_organization_data().then(function (result) {
                var obj = result;
                angular.forEach(result, function (value, key) {
                    angular.forEach(value.info, function (info_value, key) {
                        $scope.selectednames.push(info_value.name);
                    });
                });
                $scope.CustomersWidgetData = DataFormattingService.formatGraphDetails(obj);
            });
        };

        $scope.load_customer_widget();

        OrganizationFast.query().$promise.then(function (success) {
            angular.forEach(success.results, function (value, key) {
                $scope.names.push(value.name);
            });
        }).catch(function (error) {
            console.log(error);
        });

        CustomDataService.get_datacenters_data().then(function (result) {

            $scope.datacenternames = DataFormattingService.formatGraphDetails(result);
        });

        CustomDataService.get_alerts_data().then(function (result) {
            $scope.alerts_content = DataFormattingService.formatLocationDetails(result);
        });

        ZendeskTicket.query().$promise.then(function (success) {
            $scope.zendesk_fields = ULDBService2.zendeskTicket().fields;
            $scope.zendesk_tickets = success.results;
        });

        uladminService.get_datacenter_count().then(function (result) {
            $scope.datacenter_count = result;
        });
        uladminService.get_colocation_count().then(function (result) {
            $scope.colocation_count = result;
        });
        uladminService.get_private_cloud_count().then(function (result) {
            $scope.private_cloud_count = result;
        });
        uladminService.get_public_cloud_count().then(function (result) {
            $scope.public_cloud_count = result;
        });

        $scope.map = {
            center: {
                latitude: 44.0,
                longitude: -100.0
            },
            zoom: 3,
            draggable: 'true',
            control: {},
            markers: []
        };

        uladminService.get_markers().then(function (result) {
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
            //     $scope.map.control.refresh();
            // });
        });
        $scope.polylines = [];

        // uiGmapGoogleMapApi.then(function () {
        //     $scope.clickMarker = function (gMarker, eventName, model) {
        //         alert('Details: ' + gMarker.coords.latitude + ',' + gMarker.coords.longitude);
        //     };
        // });
        $scope.deleteCustomer = function (customer) {
            var index = $scope.customers.indexOf(customer);
            $scope.customers.splice(index, 1);
            // $scope.customers.splice($index, 1);
            alert('customerDeleted', customer);
        };

        $scope.redirect_cust = function (redirect_url) {
            window.location = '#/customer-dashboard/' + redirect_url;
        };


        $scope.addCustomerItem = function () {
            if ($scope.names.indexOf($scope.selected) === -1) {
                alert('Please add a valid Customer');
            }
            else {
                if ($scope.selectednames.indexOf($scope.selected) === -1) {
                    return $http({
                        url: '/rest/pinned_organizations/',
                        method: 'POST',
                        data: { 'org_name': $scope.selected }
                    })
                        .then(function (response) {
                            $scope.selectednames.push($scope.selected);
                            $scope.load_customer_widget();
                        }, function (response) {
                        });
                }
                else {
                    alert('Customer is already pinned.');
                }
            }
        };

        $scope.addCustomer = function () {
            $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/addCustomerWidgetModal.html',
                controller: 'AddCustomerWidgetModalController',
                scope: $scope,
                size: 'md'
            });
        };

        $scope.popCust = function (customer) {
            $http.delete('/rest/pinned_organization/{id}'.fmt(customer))
                .then(function (response) {
                    if (response.status > 200 && response.status < 300) {
                        AlertService2.showToast("Deleted customer widget.");
                        $scope.load_customer_widget();
                    }
                });
        };
    }
]);


app.controller('AddCustomerWidgetModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, AlertService2) {
        $scope.approve = function (obj) {
            $http.post('/rest/pinned_organization/', obj)
                .then(function (response) {
                    //$scope.selectednames.push(response);
                    $scope.load_customer_widget();
                    AlertService2.showToast("Added customer widget.");
                })
                .catch(function (error) {
                    AlertService2.showToast("Could not add customer widget.");
                });
            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
