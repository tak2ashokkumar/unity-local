var app = angular.module('uldb');
app.controller('ClientMegaportController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$http',
    '$location',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    'ValidationService',
    '$window',
    '$uibModalInstance',
    function ($scope, $rootScope, $routeParams, $q, $http, $location, DataFormattingService, RestService, AlertService2,
              ValidationService, $window, $uibModalInstance) {

        $scope.tabs = [
            {name: 'Private VXC', url: 'privatevxc.html', short_name: "privatevxc"},
            {name: 'VXC to AWS', url: 'awsvxc.html', short_name: "awsvxc"},
            {name: 'VXC to Azure', url: 'azurevxc.html', short_name: "azurevxc"},
        ];

        $scope.show_table = "privatevxc";
        $scope.show_tab_table = function (tab, para) {
            $scope.show_table = tab;
        };


        $scope.intervals = {};
        $scope.private_obj = {};
        $scope.aws_obj = {};
        $scope.azure_obj = {};

        $scope.aws_port_list = [];
        $http.get('/rest/unitedconnect/megaport_partner_location/').then(function (response) {
            if (response.data['status'] == "success") {
                $scope.megaport_partner_locations = response.data['data'];
                angular.forEach(response.data['data'], function (value, key) {
                    if (value.connectType == "AWS") {
                        $scope.aws_port_list.push({short: value.productUid, long: value.title});
                    }
                });
            }
            else {
                $scope.megaport_partner_locations = [];
                // AlertService2.addAlert({ msg: response.data['message'], severity: 'danger' });
                AlertService2.danger(response.data['message']);
            }
        });
        $scope.port_list = [];
        $scope.port_dict = {};
        $http.get('/rest/unitedconnect').then(function (response) {
            angular.forEach(response.data['results'], function (value, key) {
                $scope.port_list.push({short: value.product_uid, long: value.label});
                $scope.port_dict[value.product_uid] = value.id;
            });
        });
        $scope.target_port_options = [];
        $scope.target_azure_list = [];
        $scope.private_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["number", "bend_vlan", "Target VLAN", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit(Mb)", "required"]),
            DataFormattingService.generate_row(["select", "target_port", "Target Port", $scope.target_port_options, "required"]),
        ];
        $scope.aws_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["select", "target_cloud", "Target Cloud", $scope.aws_port_list, "required"]),
            DataFormattingService.generate_row(["number", "asn", "ASN", "required"]),
            DataFormattingService.generate_row(["text", "account_id", "Account Id", "required"]),
            DataFormattingService.generate_row(["password", "password", "Password", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit(Mb)", "required"]),
        ];
        $scope.azure_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["text", "service_key", "Azure Service Key", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit(Mb)", "required"]),
            DataFormattingService.generate_row(["select", "target_cloud", "Target Port", $scope.target_azure_list, "required"]),

        ];

        // For adding private target port
        $scope.load_target_port = function (port) {
            $scope.target_port_options.length = 0;
            angular.forEach($scope.port_list, function (value, key) {
                if (value.short != port.short) {
                    $scope.target_port_options.push({short: value.short, long: value.long});
                }
            });
        };

        // For adding target Azure port
        $scope.azure_target_port = function (obj) {
            $scope.loading_target_port = true;
            if (obj === undefined) return;
            RestService.send_modal_data({"service_key": obj}, "/rest/vxc/get_azure_vxc/").then(function (response) {
                // console.log("Response:" + JSON.stringify(response));
                if (response.status == 200) {
                    $scope.azure_blan = response.data.data['vlan'];
                    $scope.service_key = response.data.data['service_key'];
                    if (response.data.data['megaports']) {
                        $scope.target_azure_list.length = 0;
                        angular.forEach(response.data.data['megaports'], function (value, key) {
                            if (value.vxc === null) {
                                $scope.loading_target_port = false;
                                $scope.target_azure_list.push({short: value.productUid, long: value.description});
                            }
                        });
                    }
                }
                else {
                    $scope.loading_target_port = false;
                    if (response.data.includes('500 Internal Server Error')) {
                        // Megaport API itself is throwing 500 erro for incorrect key we need to handle it manually
                        $scope.azure_api_error = 'Invalid Azure service key';
                    } else {
                        if (response.status == 500) {
                            $scope.azure_api_error = 'Server Error';
                        }
                        else {
                            $scope.azure_api_error = response.data;
                        }
                    }

                }
            });
        };
        var vxc_rows_dict = {
            "Private": $scope.private_vxc_rows,
            "AWS": $scope.aws_vxc_rows,
            "Azure": $scope.azure_vxc_rows
        };

        $scope.disableButton = false;
        $scope.show_loader = false;
        $scope.buy_vxc = function (obj, type) {
            var valid = ValidationService.validate_data(obj, vxc_rows_dict[type]);
            if (!valid.is_validated) {
                return valid;
            }
            delete obj.is_validated;
            var url = "/rest/vxc/";
            if (type == "Private") {
                var params = {
                    "label": obj.name,
                    "parent_port_uid": obj.parent_port.short,
                    "target_port_uid": obj.target_port.short,
                    "aend_vlan": obj.aend_vlan,
                    "bend_vlan": obj.bend_vlan,
                    "speed_limit": obj.speed_limit,
                    "target_port_label": obj.target_port.long,
                    "connection_type": type,
                    "parent_port": $scope.port_dict[obj.parent_port.short]
                };
            }
            else if (type == "AWS") {
                var params = {
                    "label": obj.name,
                    "parent_port_uid": obj.parent_port.short,
                    "target_port_uid": obj.target_cloud.short,
                    "aend_vlan": obj.aend_vlan,
                    "speed_limit": obj.speed_limit,
                    "target_port_label": obj.target_cloud.long,
                    "connection_type": type,
                    "parent_port": $scope.port_dict[obj.parent_port.short],
                    "asn": obj.asn,
                    "account_id": obj.account_id,
                    "password": obj.password
                };
            }
            else if (type == "Azure") {
                var params = {
                    "label": obj.name,
                    "parent_port_uid": obj.parent_port.short,
                    "target_port_uid": obj.target_cloud.short,
                    "aend_vlan": obj.aend_vlan,
                    "speed_limit": obj.speed_limit,
                    "target_port_label": obj.target_cloud.long,
                    "connection_type": type,
                    "parent_port": $scope.port_dict[obj.parent_port.short],
                    "bend_vlan": $scope.azure_blan,
                    "service_key": $scope.service_key
                };
            }
            $scope.show_loader = true;
            $scope.disableButton = true;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    AlertService2.success('VXC Created Successfully');
                    $uibModalInstance.close(result.data);
                    $window.location.href = '/main#/unitedconnect/vxcs';
                }
                else {
                    $scope.show_loader = false;
                    if (type == "AWS") {
                        $scope.aws_buy_vxc_error = result.data;
                    }
                    if (type == "Private") {
                        $scope.private_buy_vxc_error = result.data;
                    }
                    if (type == "Azure") {
                        $scope.azure_buy_vxc_error = result.data;
                    }
                }
                $scope.disableButton = false;
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }
]);


app.controller('ClientUnitedConnectController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$window',
    '$http',
    '$location',
    '$uibModal',
    'RestService',
    'AlertService2',
    function ($scope, $rootScope, $routeParams, $q, $window, $http, $location, $uibModal, RestService, AlertService2) {

        // $scope.title = {
        //     singular: 'UnitedConnect',
        //     plural: 'UnitedConnect'
        // };
        // $scope.$root.title = $scope.title;

        // $scope.tabs = [
        //     { name: 'VXCs', url: 'vxclist.html' },
        // ];

        console.log("calling here......");
        $scope.intervals = {};

        $scope.getVxcTickets = function () {
            $scope.loader = true;
            $http.get('/rest/ticketvxc/').then(function (response) {
                if (response['data']['results']) {
                    $scope.vxc_list = response["data"]["results"];
                    $scope.loader = false;
                }
                else {
                    $scope.vxc_list = [];
                    $scope.loader = false;
                }

            }).catch(function (e) {
                // handle errors in processing or in error.
                AlertService2.danger("Unable to fetch VXCs for United Connect. Please Contact Adminstrator");
                $scope.vxc_list = [];
                $scope.loader = false;
            });
        };
        $scope.getVxcTickets();
        $scope.buy_vxc_modal = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/buy_vxc_modal.html',
                controller: 'ClientMegaportController',
                scope: $scope,
                size: 'lg',
                resolve: {
                    new_vxc: function () {
                        return $scope.new_vxc;
                    }
                }
            });
            modalInstance.result.then(function (result) {
                if (angular.isDefined(result)) {
                    $scope.new_vxc = result;
                    $scope.vxc_list.push($scope.new_vxc);
                }
            });
        };

        $scope.create_vxc_ticket = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'static/rest/app/client/templates/create_vxc_ticket.html',
                controller: 'VXCRequestController',
                scope: $scope,
                size: 'lg',
                resolve: {
                    new_vxc: function () {
                        return $scope.new_vxc;
                    }
                }
            });
            modalInstance.result.then(function (result) {
                if (angular.isDefined(result)) {
                    $scope.new_vxc = result;
                    $scope.vxc_list.push($scope.new_vxc);
                }
            });
        };
    }

]);

app.controller('ClientBandwidthBillingController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$window',
    '$http',
    '$location',
    '$uibModal',
    'RestService',
    'AlertService2',
    function ($scope, $rootScope, $routeParams, $q, $window, $http, $location, $uibModal, RestService, AlertService2) {

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.setLoader(true);
        $scope.billings = [];
        $scope.getBillings = function () {
            $http({
                method: "GET",
                url: '/customer/observium/billing/bill_data',
            }).then(function (response) {
                $scope.setLoader(false);
                console.log("Billings : "+angular.toJson(response.data));
                $scope.billings = response.data;
            }).catch(function (error) {
                $scope.setLoader(false);
                $scope.error_details = error;
            });
        };

        $scope.getBillings();

    }]);


app.controller('ClientNetworkBandwidthController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$window',
    '$http',
    '$location',
    '$uibModal',
    'RestService',
    'AlertService2',
    function ($scope, $rootScope, $routeParams, $q, $window, $http, $location, $uibModal, RestService, AlertService2) {

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.portDetails = [];

        $scope.getPortGraphs = function (port) {
            var params = {
                'port_id': port.port_id
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + port.switch_id + '/get_port_details_graph_set/',
                params: params
            }).then(function (response) {
                port.graph = response.data;
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
            });
        };

        var get_port_data = function (switch_uuid) {
            $scope.setLoader(true);
            var result = [];
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + switch_uuid + '/get_device_port_details/',
            }).then(function (response) {
                // $scope.portDetails.push(response.data.ports)
                $scope.count = $scope.count + 1;
                if(response.data.ports && response.data.ports.length == 0){
                    $scope.setLoader(false);
               }
                angular.forEach(response.data.ports, function (value, key) {
                    value['switch_id'] = switch_uuid;
                    $scope.portDetails.push(value);
                    $scope.setLoader(false);
                 });
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
                $scope.count = $scope.count + 1;
                if ($scope.numOfPortLinkedSwitches == $scope.count){
                    $scope.setLoader(false);
                }
            });
        };

        $scope.get_port_linked_switches = function () {
            $scope.setLoader(true);
            $http.get('/customer/switchport/').then(function (response) {
                if(response.data.results.length == 0){
                    $scope.setLoader(false);
               }
                $scope.numOfPortLinkedSwitches = response.data.results.length;
                $scope.count = 0;
                angular.forEach(response.data.results, function (value, key) {
                   // console.log("Value :"+angular.toJson(value));

                   get_port_data(value.switch.uuid);
                });
                // handle errors in processing or in error.

                // $timeout(function () {
                //     $scope.setLoader(false);
                // }, 500);
            });
        };


        $scope.get_port_linked_switches();

    }

]);

app.controller('ClientNetworkBandwidthGraphController', [
    '$scope',
    '$state',
    '$stateParams',
    '$timeout',
    '$http',
    '$location',
    'OberviumGraphConfig',
    function ($scope, $state, $stateParams, $timeout, $http, $location, OberviumGraphConfig) {

        $scope.setLoader = function (value) {
            $scope.loader = value;
        };

        $scope.setActiveSubTab = function (value) {
            $scope.activeSubTab = value;
        };

        $scope.goToPreviousPage = function () {
            $state.go('unityconnect.network_bandwidth', null, {reload: false});
            $timeout(function () {
                $scope.addClassforTabs('.actonecls ul', 0);
            }, 1000);
        };

        $scope.switch_graph_data = [];
        $scope.submenutabs = [
            {
                'tabname': 'Bandwidth Usage',
                'name': 'graphs_bandwidth_usage'
            },
        ];

        var count = 0;
        var get_switch_graphs = function (graphconfig, graphnameconfig) {
            var params = {
                'graph_type': graphconfig.graphType,
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $stateParams.uuidb + '/get_graph_set_by_id/?port_id='+$stateParams.uuidc,
                params: params
            }).then(function (response) {
                graphconfig.graphDetails = response.data;
                $scope.switch_graph_data.push(graphconfig);
                count = count + 1;
                // if (angular.equals(count, graphnameconfig.length)) {
                //     $scope.setLoader(false);
                // }
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.switch_details = {};
                count = count + 1;
                $scope.setLoader(false);
                // if (angular.equals(count, graphnameconfig.length)) {
                //     $scope.setLoader(false);
                // }
            });
        };

        var get_ports_graphs = function () {
            angular.forEach(angular.copy(OberviumGraphConfig.PORTS), function (value, key) {
                var graphObj = {};
                graphObj.displayName = value.DISPLAYNAME;
                graphObj.graphType = value.GRAPHNAME;
                get_switch_graphs(graphObj, angular.copy(OberviumGraphConfig.PORTS));
            });
        };

        $scope.getGraphSubtabsData = function (subtab) {
            $scope.switch_graph_data = [];
            $scope.setLoader(true);
            // $scope.setshowDetailsView(false);
            count = 0;
            switch (subtab.name) {
                case 'graphs_bandwidth_usage' :
                    $scope.setActiveSubTab(0);
                    get_ports_graphs();
                    break;
                default:
            }
        };

        $scope.getDetailedView = function (switch_graph_obj) {
            $scope.setLoader(true);
            $scope.selectedGraphObj = angular.copy(switch_graph_obj);
            $scope.showDetailsView = true;
            var params = {
                'graph_type': switch_graph_obj.graphType,
                'from_date': new Date(Date.parse(switch_graph_obj.from_date)).getTime() / 1000,
                'to_date': new Date(Date.parse(switch_graph_obj.to_date)).getTime() / 1000,
                'observium_id': $stateParams.uuidc
            };
            $http({
                method: "GET",
                url: '/customer/observium/switch/' + $stateParams.uuidb + '/get_graph_by_observium_id/',
                params: params
            }).then(function (response) {
                $scope.selectedGraphObj.graphDetails = response.data;
                $scope.setLoader(false);
            }).catch(function (error) {
                $scope.error_details = error;
                $scope.selectedGraphObj.graphDetails = {};
                $scope.setLoader(false);
            });
        };

        $scope.graphDateObj = {};
        $scope.getGraphforDefaultDateRange = function (switch_graph_obj) {
            $scope.graphDateObj = switch_graph_obj;
            $scope.graphDateObj.from_date = new Date(Date.now() - 86400000);
            $scope.graphDateObj.to_date = new Date();
            $scope.getDetailedView($scope.graphDateObj);
        };

        $scope.getGraphforUpdatedDateRange = function () {
            var graph_obj = angular.copy($scope.selectedGraphObj);
            graph_obj.from_date = $scope.graphDateObj.from_date;
            graph_obj.to_date = $scope.graphDateObj.to_date;
            $scope.getDetailedView(graph_obj);
        };
        //$scope.getGraphSubtabsData(angular.copy($scope.submenutabs[0]));
    }
]);