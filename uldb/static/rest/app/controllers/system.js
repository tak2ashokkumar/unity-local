/**
 * Copyright (C) 2013-2016 UnitedLayer, LLC. All Rights Reserved.
 */
var app = angular.module('uldb');

app.controller('ServersController', [
    '$scope',
    '$routeParams',
    '$location',
    'AbstractControllerFactory3',
    'ULDBService2',
    function ($scope, $routeParams, $location, AbstractControllerFactory3, ULDBService2) {
        $scope.handler = {
            modifiable: true
        };
        $scope.config = {
            shownFields: ['name', 'asset_tag', 'manufacturer', 'num_cores', 'memory_mb', 'capacity_gb', 'salesforce_id']
        };
        $scope.ctrl = AbstractControllerFactory3($scope.handler, ULDBService2.server(), $scope.config);
    }
]);

app.controller('ServerDetailController', [
    '$scope',
    '$route',
    '$routeParams',
    '$filter',
    '$uibModal',
    'Server',
    'Instance',
    'ServerRelated',
    'AlertService2',
    'BreadCrumbService',
    'ColumnRegistry',
    'UnityIntegrations',
    'ULDBService2',
    'AbstractDetailControllerFactory3',
    function ($scope,
              $route,
              $routeParams,
              $filter,
              $uibModal,
              Server,
              Instance,
              ServerRelated,
              AlertService2,
              BreadCrumbService,
              ColumnRegistry,
              UnityIntegrations,
              ULDBService2,
              AbstractDetailControllerFactory3) {

        $scope.handler = {
            modifiable: true
        };
        $scope.config = {
            id: $routeParams.id
        };
        $scope.ctrl = AbstractDetailControllerFactory3($scope.handler, ULDBService2.server(), $scope.config);


        $scope.alertService = AlertService2;
        var serverresource = Server;
        var resourceClass = ServerRelated;
        var id = $routeParams.id;
        $scope.bread = BreadCrumbService;

        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "Server Details", url: '#/servers/' + id }, $scope);
        });

        var getTemplateUrl = function (name) {
            return '/static/rest/app/templates/server/' + name + ".html";
        };

        $scope.tabs = [
            { name: 'Core', url: getTemplateUrl('core') },
            { name: 'Hardware Info', url: getTemplateUrl('hardware') },
            { name: 'Location', url: getTemplateUrl('location') },
            { name: 'Networking', url: getTemplateUrl('networking') },
            { name: 'Power and IPMI', url: getTemplateUrl('power') },
        ];

        $scope.sysresult = serverresource.get({ id: id });
        $scope.sysresult.$promise.then(function (response) {
            $scope.title = {
                plural: 'Server: ' + response.name,
                singular: this.plural
            };
            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;
        });

        resourceClass.get({ id: id }).$promise.then(function (response) {
            $scope.insresult = response.server.instance;
            $scope.cabresult = response.server.cabinet;
            $scope.swresult = response.server.switch;
            $scope.pduresult = response.server.pdu;
            $scope.ethdet = response.server.conn_details;
            $scope.chassisdet = response.server.chassis;
//            $scope.mbdet = {
//                assettag: response.motherboard.assettag,
//                mb_model: response.motherboard.mb_model,
//                serialnumber: response.motherboard.serialnumber,
//                is_allocated: response.motherboard.is_allocated,
//                total_cpus: response.motherboard_models.total_cpus,
//                total_memory_slots: response.motherboard_models.total_memory_slots,
//                onboard_ipmi: response.motherboard_models.onboard_ipmi
//            };
            $scope.cpudet = response.server.cpu;
            $scope.memorydet = response.server.memory;
            $scope.nicdet = response.server.nic;
            $scope.diskdet = response.server.disks;
            $scope.ipmidet = response.server.ipmi_attributes;


        });

        $scope.syscols = ULDBService2.server();
        $scope.salesforceResolve = UnityIntegrations.getSalesforceLink;

        $scope.inscols = [
            { name: 'name', description: 'Instance Name', required: true },
            { name: 'os_rootuser', description: 'OS root User', required: true },
            { name: 'is_allocated', description: 'Is Allocated', required: true },
            { name: 'is_vdc', description: 'Is VDC', required: true },
            { name: 'uuid', description: 'UUID', required: true },
            { name: 'modified_user', description: 'Modified User', required: true },
            {
                name: 'ordered_date', description: 'Ordered Date', required: true,
                opaque: true,
                read: function (result) {
                    if (result && 'ordered_date' in result) {
                        return $filter('date')(result.ordered_date, 'medium');
                    }
                    return "";
                }
            }
        ];

        $scope.mbcols = [
            { name: 'assettag', description: 'Assettag', required: true },
            { name: "mb_model", description: "Model", required: true },
            { name: 'serialnumber', description: 'Serial Number', required: true },
            { name: 'is_allocated', description: 'Is Allocated', required: true },
            { name: "total_cpus", description: "Total CPU Slots", required: true },
            { name: "total_memory_slots", description: "Total Memory Slots", required: true },
            { name: "onboard_ipmi", description: "Onboard IPMI", required: true }
        ];

        $scope.cabcols = [
            { name: 'name', description: 'Name', required: true },
            {
                name: "model", description: "Model", required: true,
                opaque: true,
                subfield: "model",
                read: function () {
                    if ($scope.cabresult && $scope.cabresult.related != undefined) {
                        return $scope.cabresult.related.cabientmodel.model;
                    }
                    else {
                        return "";
                    }
                }

            },
            {
                name: "cagename", description: "Cage Name", required: true,
                opaque: true,
                subfield: "name",
                read: function () {
                    if ($scope.cabresult && $scope.cabresult.related != undefined) {
                        return $scope.cabresult.related.cage.name;
                    }
                    else {
                        return "";
                    }
                }

            },
            { name: 'salesforce_id', description: 'Salesforce ID', required: true }
        ];

        $scope.editSystem = function (system) {
            // original is a reference to the object
            // obj is a copy of original
            $scope.original = $scope.sysresult;
            $scope.obj = angular.copy($scope.sysresult);
            $scope.activeCols = $scope.syscols;
            $scope.resourceClass = Server;
            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'EditServerModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };

        $scope.modify_server_instance = function (instance) {
            console.log(JSON.stringify(instance));
            $scope.obj = {};
            if (instance != null) {
                $scope.obj = angular.extend({}, instance);
            }
            $scope.activeCols = $scope.inscols;
            $scope.resourceClass = Instance;
            if (angular.equals({}, $scope.obj)) {
                $scope.method = 'Add';
            } else {
                $scope.method = 'Edit';
            }

            var modalInstance = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/requestor.html',
                controller: 'ModifyInstanceModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                $route.reload();
            });
        };

        $scope.configRaid = function (system) {
            $scope.original = $scope.sysresult;
            $scope.obj = angular.copy($scope.sysresult);
            var modalInstance = $uibModal.open({
                templateUrl: 'configRaid.html',
                controller: 'CreateRaidModal',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then();
        };
    }
]);


app.controller('DeleteAlertModalCtrl', [
    '$scope',
    '$http',
    'Server',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, Server, $uibModalInstance, $location, $window) {

        $scope.ConfirmDelete = function () {

            if (window.dellist) {

                var dellist = JSON.parse(window.dellist);

                window.dellist = "";
                window.delStatus = "";

                var delsyslist = JSON.parse(window.syslist);

                for (var j = 0; j <= delsyslist.length - 1; j++) {
                    window.delStatus = window.delStatus + " System " + delsyslist[j] + " deleted successfully";
                }

                for (var i = 0; i <= dellist.length - 1; i++) {

                    $http.delete(dellist[i]).success(function (data, status, headers) {

                        $uibModalInstance.close();
                        $location.path('/servers/').search({ param: window.delStatus });
                    });


                }
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }
]);

app.controller('DeleteInstanceAlertModalCtrl', [
    '$scope',
    '$http',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, $uibModalInstance, $location, $window) {
        $scope.ConfirmDelete = function () {

            if (window.instanceurl && window.instanceurl != "") {
                window.delStatus = "";
                window.delStatus = "Server " + window.insname + " deleted successfully";

                $http.delete(window.instanceurl).success(function (data, status, headers) {


                    $uibModalInstance.close();
                    $location.path("/servers/").search({ param: window.delStatus });
                });

                window.instanceurl = "";

            }
        };

        $scope.cancel = function () {
            window.instanceurl = "";
            $uibModalInstance.close();
        };
    }
]);

app.controller('DeleteConnectionAlertModalCtrl', [
    '$scope',
    '$http',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, $uibModalInstance, $location, $window) {
        $scope.ConfirmDelete = function () {

            if (window.connectionurl && window.connectionurl != "") {
                window.delStatus = "";
                window.delStatus = window.conname + " Connection details deleted";

                $http.delete(window.connectionurl).success(function (data, status, headers) {


                    $uibModalInstance.close();
                    $location.path("/servers/").search({ param: window.delStatus });
                });

                window.connectionurl = "";

            }
        };

        $scope.cancel = function () {
            window.instanceurl = "";
            $uibModalInstance.close();
        };
    }
]);

app.controller('DeleteComponentAlertModalCtrl', [
    '$scope',
    '$http',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, $uibModalInstance, $location, $window) {
        $scope.ConfirmDelete = function () {

            if (window.componenturl && window.componenturl != "") {
                window.delStatus = "";
                window.delStatus = window.compname + " Component details deleted";

                $http.delete(window.componenturl).success(function (data, status, headers) {


                    $uibModalInstance.close();
                    $location.path("/servers/").search({ param: window.delStatus });
                });

                window.componenturl = "";

            }
        };

        $scope.cancel = function () {
            window.componenturl = "";
            $uibModalInstance.close();
        };
    }
]);


app.controller('CreateRaidModal', [
    '$scope',
    '$http',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, $http, $uibModalInstance, AlertService2) {
        $scope.createRaid = function (raid) {
            var obj = $scope.obj;
            console.log(raid);
            $http.post(obj.url + 'create_raid/', { options: raid }).then(function (response) {
                angular.extend($scope.original, response);
                $uibModalInstance.close();
            }).error(function (error) {
                AlertService2.danger(error);
                $scope.cancel();
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('EditServerModal', [
    '$scope',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, $uibModalInstance, AlertService2) {
        // probably a repeat of the generic modal
        // expects $scope.resourceClass to be set
        var resource = $scope.resourceClass;
        if ($scope.method === undefined) {
            $scope.method = 'Edit';
        }
        $scope.create = function (obj, list) {
            // mangle the object to set some defaults
            // usually customer
            obj = $scope.purge(obj);
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            var newObj = new resource(obj);
            newObj.$save().then(function (response) {
                list.push(response);
                $uibModalInstance.close();
            }).catch(function (error) {
                // AlertService2.danger(error);
                // $scope.cancel();
                $scope.attach_msg(obj, error);
            });
        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            obj = $scope.purge(obj);
            resource.update(obj).$promise.then(function (response) {
                angular.extend($scope.original, response);
                $uibModalInstance.close();
            }).catch(function (error) {
                // AlertService2.danger(error);
                // $scope.cancel();
                $scope.attach_msg(obj, error);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.attach_msg = function(obj, error){
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string')
            angular.forEach(error.data, function (value, key) {
                obj[key + "Msg"] = value[0];
            });
            return obj;
        };

        $scope.purge = function(obj){
            // Avoids posting of error msg
            if(!angular.equals({}, obj))
            angular.forEach(obj, function (value, key) {
                if(key.indexOf('Msg') != -1)
                delete obj[key];
            });
            return obj;
        };
    }
]);

app.controller('InfoModalController', [
    '$scope',
    '$uibModalInstance',
    'additional_fields',
    'results',
    'linkify',
    'custom_linkify',
    'desub',
    'header',
    function ($scope, $uibModalInstance, additional_fields, results, linkify, custom_linkify, desub, header) {
        $scope.additional_fields = additional_fields;
        $scope.results = results;
        $scope.linkify = linkify;
        $scope.custom_linkify = custom_linkify;
        $scope.desub = desub;
        $scope.header = header;
        $scope.ok = function () {
            $uibModalInstance.dismiss('ok');
        };
    }
]);
