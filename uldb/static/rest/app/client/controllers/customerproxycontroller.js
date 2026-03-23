var app = angular.module('uldb');

app.controller('CustomerVmwareVcenterController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerVcenter',
    function ($scope, $routeParams, $location, CustomerVcenter) {

        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Private Cloud', url: 'cloud' },
            { name: 'Manage Vcenter', url: 'vmware-vcenter' },
            { name: 'Manage ESXi', url: 'vmware-esxi' },
            { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];
        CustomerVcenter.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "VMware vCenter Servers (Management Interfaces)",
            singular: "VMware vCenter Server (Management Interface)"
        };

        $scope.heading = "VMware vCenter";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerVmwareEsxiController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerEsxi',
    function ($scope, $routeParams, $location, CustomerEsxi) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Private Cloud', url: 'cloud' },
            { name: 'Manage Vcenter', url: 'vmware-vcenter' },
            { name: 'Manage ESXi', url: 'vmware-esxi' },
            { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];

        CustomerEsxi.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "VMware ESXi Servers (Management Interfaces)",
            singular: "VMware ESXi Server (Management Interface)"
        };

        $scope.heading = "VMware ESXi";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerOpenStackProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerOpenstack',
    function ($scope, $routeParams, $location, CustomerOpenstack) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Private Cloud', url: 'cloud' },
            { name: 'Manage Vcenter', url: 'vmware-vcenter' },
            { name: 'Manage ESXi', url: 'vmware-esxi' },
            { name: 'Manage Openstack', url: 'openstack-proxy' }
        ];

        $scope.activeTab = 3;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerOpenstack.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "OpenStack Controllers (Management Interfaces)",
            singular: "OpenStack Controller (Management Interface)"
        };

        $scope.heading = "OpenStack Controller";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerF5LoadBalancerProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerF5LB',
    function ($scope, $routeParams, $location, CustomerF5LB) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancer', url: 'load_balancers' },
            { name: 'Manage NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'Manage F5 Load Balancer', url: 'f5-lb-proxy' },
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerF5LB.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "F5 Load Balancers (Management Interfaces)",
            singular: "F5 Load Balancer (Management Interface)"
        };

        $scope.heading = "F5 Load Balancer";

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerCiscoFirewallProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerCiscoFirewall',
    function ($scope, $routeParams, $location, CustomerCiscoFirewall) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Firewall', url: 'current.html' },
            { name: 'Juniper Firewall', url: 'juniperFirewallData.html' },
            { name: 'Cisco Firewall', url: 'ciscoFirewallData.html' },
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerCiscoFirewall.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Cisco Servers (Management Interfaces)",
            singular: "Cisco Servers (Management Interface)"
        };

        $scope.heading = "Cisco";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);

app.controller('CustomerJuniperFirewallProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerJuniperFirewall',
    function ($scope, $routeParams, $location, CustomerJuniperFirewall) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Firewall', url: 'current.html' },
            { name: 'Juniper Firewall', url: 'juniperFirewallData.html' },
            { name: 'Cisco Firewall', url: 'ciscoFirewallData.html' },
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerJuniperFirewall.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Juniper Firewall (Management Interfaces)",
            singular: "Juniper Firewall (Management Interface)"
        };

        $scope.heading = "Juniper Firewall";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);

app.controller('CustomerCitrixVPXDeviceProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerCitrix',
    function ($scope, $routeParams, $location, CustomerCitrix) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Load Balancer', url: 'load_balancers' },
            { name: 'Manage NetScaler VPX', url: 'citrix-vpx-device' },
            { name: 'Manage F5 Load Balancer', url: 'f5-lb-proxy' },
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerCitrix.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Citrix Netscaler VPX devices (Management Interfaces)",
            singular: "Citrix Netscaler VPX device (Management Interface)"
        };

        $scope.heading = "Citrix VPX";

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerJuniperSwitchProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerJuniperSwitch',
    function ($scope, $routeParams, $location, CustomerJuniperSwitch) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Switches', url: 'current.html' },
            { name: 'Manage Cisco Switch', url: 'ciscoSwitchData.html' },
            { name: 'Manage Juniper Switch', url: 'juniperSwitchData.html' },
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerJuniperSwitch.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Juniper Switches (Management Interfaces)",
            singular: "Juniper Switch (Management Interface)"
        };

        $scope.heading = "Juniper Switch";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);

app.controller('CustomerCiscoSwitchProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerCiscoSwitch',
    function ($scope, $routeParams, $location, CustomerCiscoSwitch) {
        //  TAB CONTROL : Temporary for Demo
        $scope.tabs = [
            { name: 'Switches', url: 'current.html' },
            { name: 'Manage Cisco Switch', url: 'ciscoSwitchData.html' },
            { name: 'Manage Juniper Switch', url: 'juniperSwitchData.html' },
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            $location.path($scope.tabs[idx].url);
        };
        //  END TAB CONTROL FUNCTIONALITY

        $scope.tableData = [];


        CustomerCiscoSwitch.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Cisco Switches (Management Interfaces)",
            singular: "Cisco Switch (Management Interface)"
        };

        $scope.heading = "Cisco Switch";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);


app.controller('CustomerTenableProxyController', [
    '$scope',
    '$routeParams',
    '$location',
    'CustomerTenable',
    function ($scope, $routeParams, $location, CustomerTenable) {

        $scope.tableData = [];


        CustomerTenable.query().$promise.then(function (response) {
            $scope.tableData = response.results;
        });

        $scope.title = {
            plural: "Tenable Security Manager",
            singular: "Tenable Security Manager"
        };

        $scope.heading = "Tenable Security Manager";

        $scope.access_name = $location.path();

        $scope.$root.title = $scope.title;
    }
]);
