var app = angular.module('uldb');

app.controller('ServerDetailController', [
    '$scope',
    '$routeParams',
    'CustomerServer',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerServer, AlertServer2, SearchService, AbstractControllerFactory) {
        $scope.uuid = $routeParams.uuid;
        $scope.result = CustomerServer.get({uuid: $scope.uuid});
        $scope.resourceClass = CustomerServer;

        $scope.rows = [];
        $scope.result.$promise.then(function (response) {
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;

            // $scope.breadCrumb = {name: $scope.result.name, url:"#/servers/" + $scope.uuid};
            $scope.rows = [
                { name: "instance", description: "Hostname", required: true,
                opaque: 'stringTransform',
                subfield: "functional_hostname",
                read: function(result) {
                    if (result.instance !== null) {
                        return result.instance.functional_hostname;
                    }
                    return "";
                }
            },
            { name: "name", description: "Internal Identifier", required: true },
            // { name: "manufacturer", description: "Manufacturer", required: true },
            { name: "instance", description: "Instance Name", required: true,
                opaque: 'link',
                subfield: "name",
                read: function(result) {
                    return {
                        url: "#/instance/" + result.instance.uuid,
                        innerText: result.instance.name
                    };
                }
            },
            { name: "instance", description: "Instance Type", required: true,
                opaque: 'stringTransform',
                subfield: "instance_type",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.instance.instance_type;
                    }
                    return "";
                }
            },
            { name: "instance", description: "Operating System", required: true,
                opaque: 'stringTransform',
                subfield: "os",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.instance.os.name + " " + result.instance.os.version;
                    }
                    return "";
                }
            },
            { name: "manufacturer", description: "Manufacturer", required: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.manufacturer;
                    }
                    return "";
                }
            },
            { name: "last_known_state", description: "State", required: true },
            // { name: "cpus", description: "CPUs", required: true },
            // { name: "memory", description: "Memory", required: true,
            //     opaque: 'stringTransform',
            //     read: function (result) {
            //         return result.memory + " GB";
            //     }
            // },
            // { name: "storage", description: "Storage", required: true,
            //     opaque: 'stringTransform',
            //     read: function (result) {
            //         return result.disk + " GB";
            //     }
            // },

        ];
        });

        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        //$scope.vms = null;

        //$scope.rows = [


        $scope.relatedObjects = [
            // {
            //     name: 'instance',
            //     description: 'Instances',
            //     columns: [
            //         { idField: 'name', description: 'Name', urlPath: "#/vms/", opaque: 'link' },
            //         { idField: 'os', description: "Operating System",
            //             opaque: 'stringTransform',
            //             read: function(result) {
            //                 return result.os.name + " " + result.os.version;
            //             }
            //         }
            //     ]
            // }
        ];
    }
]);


app.controller('InstanceDetailController', [
    '$scope',
    '$routeParams',
    'Instance',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $routeParams, Instance, AlertServer2, SearchService, AbstractControllerFactory) {
        $scope.uuid = $routeParams.uuid;
        $scope.result = Instance.get({uuid: $scope.uuid});
        $scope.resourceClass = Instance;

        $scope.rows = [];
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/instance/" + $scope.uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            $scope.rows = [
            { name: "name", description: "Instance Name", required: true },
            { name: "instance_type", description: "Instance Type", required: true},
            { name: "os_name", description: "Operating System", required: true},
            { name: "os_version", description: "Operating System Version", required: true},
            { name: "state", description: "State", required: true },
        ];
        });

        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.relatedObjects = [
        ];
    }
]);

app.controller('SANDetailController', [
    '$scope',
    '$routeParams',
    'CustomerSAN',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerSAN, AlertServer2, SearchService, AbstractControllerFactory) {
        $scope.uuid = $routeParams.uuid;
        $scope.result = CustomerSAN.get({uuid: $scope.uuid});

        $scope.resourceClass = CustomerSAN;
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/sans/" + $scope.uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });

        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        //$scope.vms = null;

        $scope.rows = [
            { name: "instance", description: "Hostname", required: true,
                opaque: 'stringTransform',
                subfield: "hostname",
                read: function(result) {
                    if (result.instance !== null) {
                        return result.instance.hostname;
                    }
                    return "";
                }
            },
            { name: "name", description: "Internal Identifier", required: true },
            // { name: "manufacturer", description: "Manufacturer", required: true },
            { name: "type", description: "System Type", required: true,
                opaque: 'stringTransform',
                subfield: "instance_type",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.instance.instance_type;
                    }
                    return "";
                }
            },
            { name: "os", description: "Operating System", required: true,
                opaque: 'stringTransform',
                subfield: "os",
                read: function (result) {
                    if (result.instance !== null) {
                        var os = [result.instance.os_name, result.instance.os_version];
                        return os.join(" ");
                    }
                    return "";
                }
            },
            { name: "last_known_state", description: "State", required: true },
            { name: "disk", description: "Storage", required: true },
            // { name: "cpus", description: "CPUs", required: true },
            // { name: "memory", description: "Memory", required: true }
        ];

        $scope.relatedCols = [
            { name: "name", description: "Name",
                opaque: 'link',
                read: function(result) {
                    return {
                        url: "#/vms/" + result.uuid,
                        innerText: result.name
                    };
                }
            },
            { name: "os", description: "Operating System",
                opaque: 'stringTransform',
                read: function(result) {
                    return result.os_name + " " + result.os_version;
                }
            }
        ];

    }
]);


app.controller('VirtualMachineDetailController', [
    '$scope',
    '$routeParams',
    'CustomerVirtualMachine',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerVirtualMachine, AlertServer2, SearchServer, AbstractControllerFactory) {
        $scope.resourceClass = CustomerVirtualMachine;



        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.uuid = $routeParams.uuid;
        $scope.result = CustomerVirtualMachine.get({uuid: $scope.uuid});
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/vms/" + $scope.uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "vm_type", description: "Type", required: true },
            { name: "os", description: "Operating System", required: true,
                opaque: 'stringTransform',
                subfield: "os",
                read: function (result) {
                    var os = [result.os_name, result.os_version];
                    return os.join(" ");
                }
            },
            { name: "server", description: "Host", required: true,
                opaque: 'link',
                subfield: "name",
                read: function(result) {
                    return {
                        url: "#/servers/" + result.server.uuid,
                        innerText: result.server.name
                    };
                }
            },
            { name: "instance", description: "Host Operating System", required: true,
                opaque: 'stringTransform',
                subfield: "os",
                read: function (result) {
                    var os = [result.server.instance.os.name, result.server.instance.os.version];
                    return os.join(" ");
                }
            },
            { name: "disk", description: "Storage", required: true,
                opaque: 'stringTransform',
                read: function (result) {
                    var disk = [result.disk, result.disk_unit];
                    return disk.join(" ");
                }
            },
            { name: "vcpus", description: "VCPUs", required: true },
            { name: "memory", description: "Memory", required: true,
                opaque: 'stringTransform',
                read: function (result) {
                    var memory = [result.memory, result.memory_unit];
                    return memory.join(" ");
                }
            },
            { name: "nics", description: "Network Controllers", required: true },
            { name: "last_known_state", description: "Status", required: true }
        ];
    }
]);


app.controller('CabinetDetailController', [
    '$scope',
    '$location',
    'CustomerCabinet',
    'AbstractControllerFactory',
    function ($scope, $location, CustomerCabinet, AbstractControllerFactory) {
        $scope.resourceClass = CustomerCabinet;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "type", description: "Type", required: true },
            { name: "model", description: "Model", required: true },
            { name: "cage", description: "Cage",
                opaque: 'link',
                read: function(result) {
                    if (angular.isUndefined(result) || (result.cage == null)) {
                        return {};
                    }
                    return {
                        uuid: result.cage.uuid,
                        type: "Cage",
                        innerText: result.cage.name
                    };
                },
                hasValue: function(result) {
                    return Object.keys(this.read(result)).length > 0;
                }
            },
            { name: "datacenter", description: "Data Center",
                opaque: 'stringTransform',
                read: function(result) {
                    if (result.datacenter !== undefined) {
                        return result.datacenter.name;
                    }
                }
            }
        ];

        $scope.relatedObjects = [
            {
                name: 'pdus',
                description: 'PDUs',
                type: 'PDU',
                columns: [
                    { idField: 'name', description: 'Name', urlPath: "#/pdus/", opaque: 'link' },
                    { idField: 'pdu_model', description: 'Model' }
                ]
            }
        ];

        var manageCabinetDetails = function(){
            $scope.result = CustomerCabinet.get({uuid: $scope.uuid});
            $scope.result.$promise.then(function (response) {
                $scope.title = {
                    plural: $scope.result.name,
                    singular: this.plural
                };
                if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            });
        };

        manageCabinetDetails();
        $scope.$watch(function(){
            return $location.path();
        }, function(url){
            // $scope.uuid = $scope.uuid;
            // manageCabinetDetails();
        });
    }
]);


app.controller('CageDetailController', [
    '$scope',
    '$location',
    'CustomerCage',
    'AbstractControllerFactory',
    function ($scope, $location, CustomerCage, AbstractControllerFactory) {

        $scope.resourceClass = CustomerCage;
        
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "datacenter", description: "Data Center",
                opaque: 'stringTransform',
                read: function(result) {
                    if (angular.isDefined(result.datacenter)) {
                        return result.datacenter.name;
                    }
                }
            }
        ];

        $scope.relatedObjects = [
            {
                name: 'cabinets',
                description: 'Cabinets',
                type: 'Cabinet',
                columns: [
                    { idField: 'name', description: 'Name', urlPath: "#/cabs/", opaque: 'link' },
                    { idField: 'model', description: 'Model' }
                ]
            }
        ];

        var manageCageDetails = function(){
            $scope.result = CustomerCage.get({uuid: $scope.uuid});
            $scope.result.$promise.then(function (response) {
                $scope.title = {
                    plural: $scope.result.name,
                    singular: this.plural
                };
                if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            });
        };

        manageCageDetails();
        $scope.$watch(function(){
            return $location.path();
        }, function(url){
            // $scope.uuid = $scope.uuid;
            // manageCageDetails();
        });
    }
]);


app.controller('PDUDetailController', [
    '$scope',
    '$location',
    'CustomerPDU',
    'AbstractControllerFactory',
    function ($scope, $location, CustomerPDU, AbstractControllerFactory) {

        $scope.resourceClass = CustomerPDU;
        $scope.ctrl = AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name" },
            { name: "serial_number", description: "Serial Number" },
            { name: "pdu_model", description: "Model" },
            { name: "cabinet", description: "Cabinet",
                opaque: 'link',
                read: function(result) {
                    if (angular.isUndefined(result) || (result.cabinet == null)) {
                        return {};
                    }
                    return {
                        uuid: result.cabinet.uuid,
                        type: "Cabinet",
                        innerText: result.cabinet.name
                    };
                }
            },
            { name: "ip_address", description: "IP Address" },
            { name: "max_amps",  description: "Useable Amps",
                opaque: 'stringTransform',
                read: function(result) {
                    return (result.max_amps * .8).toFixed(2);
                }
            },
            { name: "voltage", description: "Voltage" },
            { name: "outlet_count", description: "Outlet Count" }
        ];

        $scope.relatedObjects = [
            { name: 'cabinet', description: 'Cabinet', type: 'Cabinet', idField: 'name', urlPath: "#/cabs/" }
        ];

        var managePDUDetails = function(){
            if ($scope.uuid1){
                var obj_uuid = $scope.uuid1;
            }
            else{
                var obj_uuid = $scope.uuid;
            }
            $scope.result = CustomerPDU.get({uuid: obj_uuid});
            $scope.result.$promise.then(function (response) {
                $scope.title = {
                    plural: $scope.result.name,
                    singular: this.plural
                };
                if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
            });
        };

        $scope.$watch(function(){
            return $location.path();
        }, function(url){
//            $scope.uuid = $scope.uuid;
            managePDUDetails();

        });
    }
]);


app.controller('SwitchDetailController', [
    '$scope',
    '$routeParams',
    'CustomerSwitch',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerSwitch, AbstractControllerFactory) {
        var uuid = $routeParams.uuid;
        $scope.result = CustomerSwitch.get({uuid: uuid});

        $scope.resourceClass = CustomerSwitch;
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/switches/" + uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });
        $scope.ctrl = AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name" },
            { name: "manufacturer", description: "Manufacturer" },
            { name: "model", description: "Model" },
            //{ name: "ip_address", description: "IP Address"}
        ];

    }
]);


app.controller('FirewallDetailController', [
    '$scope',
    '$routeParams',
    'CustomerFirewall',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerFirewall, AbstractControllerFactory) {
        var uuid = $routeParams.uuid;
        $scope.result = CustomerFirewall.get({uuid: uuid});

        $scope.resourceClass = CustomerFirewall;
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/firewalls/" + uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });
        $scope.ctrl = AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name" },
            { name: 'asset_tag', description: 'Asset Tag', required: true },
            { name: "model", description: "Model", required: true},
            {
                name: "cabinet", description: "Cabinet", required: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if ($scope.result.cabinet === null) {
                        return "";
                    }
                    return $scope.result.cabinet.name;
                }
            },
            { name: 'serial_number', description: 'Serial Number', required: true },
            // { name: 'private_ipaddress', description: 'Private IP Address', required: true },
            // { name: 'public_ipaddress', description: 'Public IP Address', required: true },
            // {
            //     name: "status", description: "Status", required: true,
            //     opaque: 'stringTransform',
            //     subfield: "status_type",
            //     read: function (result) {
            //         if ($scope.result.status === null) {
            //             return "";
            //         }
            //         return $scope.result.status.status_type;
            //     }
            // },
            // { name: 'is_vdc', description: 'VDC', required: true },
            // { name: 'is_allocated', description: 'Allocated', required: true },
            { name: 'salesforce_id', description: 'Salesforce ID', required: true },
        ];

    }
]);


app.controller('FirewallModelDetailController', [
    '$scope',
    '$routeParams',
    'FirewallModel',
    'AbstractControllerFactory',
    function ($scope, $routeParams, FirewallModel, AbstractControllerFactory) {
        var uuid = $routeParams.uuid;
        $scope.result = FirewallModel.get({uuid: uuid});

        $scope.title = {
            plural: "Firewalls",
            singular: "Firewall"
        };
        $scope.resourceClass = FirewallModel;
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url:"#/firewalls/" + uuid};
        });
        $scope.ctrl = AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name" },
            { name: "manufacturer", description: "Manufacturer", required: true,
                opaque: 'stringTransform',
                subfield: "name",
                read: function (result) {
                    if (result.instance !== null) {
                        return result.name;
                    }
                    return "";
                }
            },
            { name: "operating_system", description: "Operating System" },
            { name: "num_ports", description: "Total Ports" },
            { name: "num_uplink_port", description: "Total Uplink Ports" },
        ];

    }
]);

app.controller('LoadBalancerDetailController', [
    '$scope',
    '$routeParams',
    'CustomerLoadBalancer',
    'AbstractControllerFactory',
    function ($scope, $routeParams, CustomerLoadBalancer, AbstractControllerFactory) {
        var uuid = $routeParams.uuid;
        $scope.result = CustomerLoadBalancer.get({ uuid: uuid });

        $scope.resourceClass = CustomerLoadBalancer;
        $scope.result.$promise.then(function (response) {
            // $scope.breadCrumb = {name: $scope.result.name, url: "#/load_balancers/" + uuid};
            $scope.title = {
                plural: $scope.result.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });
        $scope.ctrl = AbstractControllerFactory($scope.resourceClass, $scope, "name");

        $scope.rows = [
            { name: "name", description: "Name" },
            { name: "manufacturer", description: "Manufacturer" },
            { name: "model", description: "Model" },
            //{ name: "pub_ipaddress", description: "Public IP Address" },
            //{ name: "priv_ipaddress", description: "Private IP Address" }
        ];
    }
]);
