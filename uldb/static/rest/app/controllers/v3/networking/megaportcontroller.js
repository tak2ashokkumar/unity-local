var app = angular.module('uldb');
app.controller('MegaportController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$http',
    '$location',
    'DataFormattingService',
    'RestService',
    'AlertService2',
    '$window',
    'ValidationService',
    function ($scope, $rootScope, $routeParams, $q, $http, $location, DataFormattingService, RestService, AlertService2,
              $window, ValidationService) {
        //  TAB CONTROL FUNCTIONALITY
        $scope.tabs = [
            { name: 'UC Locations', url: 'megaportlocationData.html' },
            { name: 'UC Partner Locations', url: 'megaportpartnerlocationData.html' },
            { name: 'Buy Port', url: 'buymegaport.html' },
//            { name: 'Private VXC', url: 'privatevxc.html' },
        ];
        $scope.vxc_tabs = [
            { name: 'Private VXC', url: 'privatevxc.html' },
            { name: 'VXC to AWS', url: 'awsvxc.html' },
            { name: 'VXC to Azure', url: 'azurevxc.html' }
        ];

        $scope.intervals = {};

        $scope.obj = {};
        // select the tab based on param
        $scope.activeTab = 0;
        var tab = $routeParams.t;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
            $scope.vxc_tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.updateTab = function (idx) {
            $location.search({ t: $scope.tabs[idx].name });
            window.dispatchEvent(new Event('resize'));  // fixes charts in data
        };
        $scope.updateVXCTab = function (idx) {
            $location.search({ t: $scope.vxc_tabs[idx].name });
            window.dispatchEvent(new Event('resize'));  // fixes charts in data
        };
        //  END TAB CONTROL FUNCTIONALITY
        var deferred = $q.defer();
        $scope.terms = [];
        $scope.speed = [];
        $scope.locations = [];
        $scope.market = [];
        $scope.market_location_dict = {};
        $http.get('/rest/unitedconnect/megaport_location/').then(function (response) {
            if (response.data['status'] == "success") {
                $scope.megaport_locations = response.data['data'];
                angular.forEach(response.data['data'], function (value, key) {
                    if (!$scope.market_location_dict[value.market]) {
                        $scope.market_location_dict[value.market] = [];
                    }
                    $scope.market_location_dict[value.market].push({ short: value.id, long: value.name });
                });
                $scope.marketplace_list = [];
                angular.forEach(response.data['data'], function (value, key) {
                    if ($scope.marketplace_list.indexOf(value.market) == -1) {
                        $scope.marketplace_list.push(value.market);
                        $scope.market.push({ short: value.market, long: value.market });
                    }
                });
            }
            else {
                $scope.megaport_locations = [];
                AlertService2.addAlert({ msg: response.data['message'], severity: 'danger' });
            }
        });
        $scope.aws_port_list = [];
        $http.get('/rest/unitedconnect/megaport_partner_location/').then(function (response) {
            if (response.data['status'] == "success") {
                $scope.megaport_partner_locations = response.data['data'];
                angular.forEach(response.data['data'], function (value, key) {
                    if (value.connectType == "AWS") {
                        $scope.aws_port_list.push({ short: value.productUid, long: value.title });
                    }
                });
            }
            else {
                $scope.megaport_partner_locations = [];
                AlertService2.addAlert({ msg: response.data['message'], severity: 'danger' });
            }
        });
        $scope.terms = [
            { short: "1", long: "1 Month" },
            { short: "12", long: "12 Months" },
            { short: "24", long: "24 Months" },
            { short: "36", long: "36 Months" }
        ];
        $scope.speed = [
            { short: "1000", long: "1 Gbps" },
            { short: "10000", long: "10 Gbps" },
        ];
        $scope.port_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "terms", "Terms", $scope.terms, "required"]),
            DataFormattingService.generate_row(["select", "market", "Market", $scope.market, "required"]),
            DataFormattingService.generate_row(["select", "speed", "Speed", $scope.speed, "required"]),
        ];
        $scope.port_list = [];
        $scope.port_dict = {};
        $http.get('/rest/unitedconnect').then(function (response) {
            angular.forEach(response.data['results'], function (value, key) {
                $scope.port_list.push({ short: value.product_uid, long: value.label });
                $scope.port_dict[value.product_uid] = value.id;
            });
        });
        $scope.customers = [];
        $http.get('/rest/org').then(function (response) {
            angular.forEach(response.data['results'], function (value, key) {
                $scope.customers.push({ short: value.id, long: value.name });
            });
        });
        $scope.private_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["select", "customer", "Customer", $scope.customers, "required"]),
            DataFormattingService.generate_row(["number", "bend_vlan", "Target VLAN", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit", "required"]),
        ];
        $scope.aws_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["select", "customer", "Customer", $scope.customers, "required"]),
            DataFormattingService.generate_row(["select", "target_cloud", "Target Cloud", $scope.aws_port_list, "required"]),
            DataFormattingService.generate_row(["number", "asn", "ASN", "required"]),
            DataFormattingService.generate_row(["text", "account_id", "Account Id", "required"]),
            DataFormattingService.generate_row(["password", "password", "Password", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit", "required"]),
        ];
        $scope.azure_vxc_rows = [
            DataFormattingService.generate_row(["text", "name", "Product Name", "required"]),
            DataFormattingService.generate_row(["select", "parent_port", "Parent Port", $scope.port_list, "required"]),
            DataFormattingService.generate_row(["number", "aend_vlan", "Source VLAN", "required"]),
            DataFormattingService.generate_row(["select", "customer", "Customer", $scope.customers, "required"]),
            DataFormattingService.generate_row(["text", "service_key", "Service Key", "required"]),
            DataFormattingService.generate_row(["number", "speed_limit", "Speed Limit", "required"]),
        ];
        $scope.location_row_options = [];
        $scope.load_locations = function (market) {
            if ($scope.market_location_dict[market['short']]) {
                $scope.location_row_options = $scope.market_location_dict[market['short']];
            }
        };
        $scope.load_target_port = function (port) {
            $scope.target_port_options = [];
            console.log("Selected Port:" + JSON.stringify(port.short));
            angular.forEach($scope.port_list, function (value, key) {
                if (value.short != port.short) {
                    $scope.target_port_options.push({ short: value.short, long: value.long });
                }
            });
        };
        $scope.disableButton = false;
        $scope.buy_port = function (obj) {
            var valid = ValidationService.validate_data(obj, $scope.port_rows);
            if (!valid.is_validated) {
                console.log("Not Validated : " + angular.toJson(valid));
                return valid;
            }
            delete obj.is_validated;
            var url = "/rest/unitedconnect/";
            var params = {
                "label": obj.name, "location": obj.location.long, "location_id": obj.location.short, "speed": obj.speed.short,
                "duration": obj.terms.short, "market": obj.market.short
            };
            $scope.show_loader = true;
            $scope.disableButton = true;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    AlertService2.addAlert({ msg: "Port Added Successfully", severity: 'success' });
                    $window.location.href = '/admin#/unitedconnect?t=Ports';
                }
                else {
                    $scope.show_loader = false;
                    AlertService2.addAlert({ msg: result.data, severity: 'danger' });
                    alert("Error:" + result.data);
                }
                $scope.disableButton = false;
            });
        };

        $scope.azure_target_port = function (obj) {
            RestService.send_modal_data({ "service_key": obj }, "/rest/vxc/get_azure_vxc/").then(function (response) {
                console.log("Response:" + JSON.stringify(response));
                $scope.azure_blan = response.data.data['vlan'];
                $scope.service_key = response.data.data['service_key'];
                if (response.data.data['megaports']) {
                    $scope.target_azure_list = [];
                    angular.forEach(response.data.data['megaports'], function (value, key) {
                        if (value.vxc === null) {
                            $scope.target_azure_list.push({ short: value.productUid, long: value.description });
                        }
                    });
                }
                else {
                    alert("Please Enter a Valid Azure Expressroute Service Key");
                }
//            if ($scope.target_azure_list == null){
//                alert("There is no remaining Port available for VXC connection with this Service Key");
//            }
                console.log("azure target:" + $scope.target_azure_list);
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
                console.log("Not Validated : " + angular.toJson(valid));
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
                    "customer": obj.customer.short,
                    "connection_type": type,
                    "parent_port": $scope.port_dict[obj.parent_port.short]
                };
            }
            else if (type == "AWS") {
                var params = {
                    "label": obj.name, "parent_port_uid": obj.parent_port.short, "target_port_uid": obj.target_cloud.short,
                    "aend_vlan": obj.aend_vlan, "speed_limit": obj.speed_limit, "target_port_label": obj.target_cloud.long,
                    "customer": obj.customer.short, "connection_type": type, "parent_port": $scope.port_dict[obj.parent_port.short],
                    "asn": obj.asn, "account_id": obj.account_id, "password": obj.password
                };
            }
            else if (type == "Azure") {
                var params = {
                    "label": obj.name, "parent_port_uid": obj.parent_port.short, "target_port_uid": obj.target_cloud.short,
                    "aend_vlan": obj.aend_vlan, "speed_limit": obj.speed_limit, "target_port_label": obj.target_cloud.long,
                    "customer": obj.customer.short, "connection_type": type, "parent_port": $scope.port_dict[obj.parent_port.short],
                    "bend_vlan": $scope.azure_blan, "service_key": $scope.service_key
                };
            }
            $scope.show_loader = true;
            $scope.disableButton = true;
            RestService.send_modal_data(params, url).then(function (result) {
                if (result.status == 201) {
                    AlertService2.addAlert({ msg: "VXC Created Successfully", severity: 'success' });
                    $window.location.href = '/admin#/unitedconnect?t=VXCs';
                }
                else {
                    $scope.show_loader = false;
                    AlertService2.addAlert({ msg: result.data, severity: 'danger' });
                    console.log("Error:" + JSON.stringify(result.data));
                    alert("Error:" + result.data);
                }
                $scope.disableButton = false;
            });
        };
    }
]);

app.controller('UnitedConnectController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$q',
    '$http',
    '$location',
    function ($scope, $rootScope, $routeParams, $q, $http, $location) {
        $scope.tabs = [
            { name: 'Ports', url: 'portlist.html' },
            { name: 'VXCs', url: 'vxclist.html' },
        ];

        $scope.intervals = {};
        // select the tab based on param
        $scope.activeTab = 0;
        var tab = $routeParams.t;
        if (tab) {
            $scope.tabs.forEach(function (e, i, arr) {
                if (e.name === tab) {
                    $scope.activeTab = i;
                }
            });
        }
        $scope.updateTab = function (idx) {
            $location.search({ t: $scope.tabs[idx].name });
            window.dispatchEvent(new Event('resize'));  // fixes charts in data
        };
        $http.get('/rest/unitedconnect/').then(function (response) {
            console.log("results:" + JSON.stringify(response));
            $scope.megaport_list = response["data"]["results"];
        });
        $http.get('/rest/vxc/').then(function (response) {
            $scope.vxc_list = response["data"]["results"];
        });
    }
]);
