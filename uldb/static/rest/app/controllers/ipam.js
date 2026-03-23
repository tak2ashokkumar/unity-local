/**
 * Created by rt on 1/27/16.
 */

var app = angular.module('uldb');
app.controller('IPv6ConfigController', [
    '$scope',
    '$location',
    '$uibModal',
    'IPv6Allocation',
    'IPv6Location',
    'AlertService2',
    'SearchService',
    'AbstractControllerFactory',
    function ($scope, $location, $uibModal, IPv6Allocation, IPv6Location,
        AlertService2, SearchService, AbstractControllerFactory) {
        $scope.tabs = [
            { name: 'IPv4 ARIN Allocations', url: 'ipv4_public/allocations' },
            { name: 'IPv6 Allocations', url: 'ipv6alloc' },
            { name: 'Private Allocations', url: 'ipv4_private/allocations' },
        ];

        $scope.activeTab = 1;
        $scope.updateTab = function (idx) {
            console.log("idx:"+idx);
            $location.path($scope.tabs[idx].url);
        };
        $scope.$root.title = {
            plural: "IPv6 Configuration",
            singular: "IPv6 Configuration"
        };

        // $scope.breadCrumb = { name: "IPv6 Config", url: "#/ipv6alloc" };
        $scope.resourceClass = IPv6Allocation;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");
        $scope.select = function (result, index) {
            $scope.selection.selected = result;
            $scope.selection.index = index;
        };

        $scope.rows = [
            { name: "name", description: "Name", required: true },
            { name: "prefix", description: "Prefix", required: true },
            { name: "prefixlen", description: "Prefix Len", required: true },
            { name: "description", description: "Description", required: true },
        ];

        $scope.createLocation = function (result) {
            $scope.result = result;
            var modalInstance = $uibModal.open({
                templateUrl: 'ipv6locationmodal.html',
                controller: 'IPv6LocationModalController',
                scope: $scope,
                size: 'md'
            });
            modalInstance.result.then(function () {
                console.log("modalInstance result then");
                $scope.result = null;
            });
        };

        $scope.selectedLocation = {
            location: null,
            index: null
        };

        $scope.selectLocation = function (location, index) {
            $scope.selectedLocation.location = location;
            $scope.selectedLocation.index = index;
        };

        $scope.deleteLocation = function (result, location, index) {
            var loc = new IPv6Location(location);
            loc.$delete().then(function (response) {
                result.locations.splice(index, 1);
                AlertService2.info("Deleted " + location.name + " (" + location.prefixlen + ")");
            });
        };
    }
]);

app.controller('IPv6LocationModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, AlertService2) {
        $scope.addLocation = function (newLocation) {
            $http.post($scope.result.url + "create_location/", newLocation).then(function (response) {
                // push response onto the array holding v6 locations (in parent scope)
                $scope.result.locations.push(response.data);
            }).catch(function (error) {
                // if there is an error, shout it
                AlertService2.danger(error);
            }).then(function () {
                // after everything, just close.
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }
]);

app.controller('IPv6BlockController', [
    '$scope',
    '$http',
    '$uibModal',
    'IPv6Block',
    'AbstractControllerFactory',
    'SearchService',
    'OrganizationFast',
    'AlertService2',
    function ($scope, $http, $uibModal, IPv6Block, AbstractControllerFactory, SearchService, OrganizationFast, AlertService2) {
        $scope.$root.title = {
            plural: "IPv6 Block Management",
            singular: "IPv6 Block Management"
        };

        // $scope.breadCrumb = { name: "IPv6 Block Management", url: "#/ipv6blocks" };
        $scope.resourceClass = IPv6Block;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "name");

        var orgSearch = new SearchService(OrganizationFast);
        $scope.getOrgs = orgSearch.search;
        $scope.selectedZone = {
            zone: null,
            index: null
        };

        $scope.selectedAssignment = {
            assignment: null,
            index: null,
            relatedZone: null
        };

        $scope.selectedInterface = {
            interface: null,
            index: null,
            relatedAssignment: null
        };

        var deselect = function () {
            $scope.selectedZone.zone = null;
            $scope.selectedZone.index = null;

            $scope.selectedAssignment.assignment = null;
            $scope.selectedAssignment.index = null;
            $scope.relatedZone = null;

            $scope.selectedInterface.interface = null;
            $scope.selectedInterface.index = null;
            $scope.selectedInterface.relatedAssignment = null;
        };

        $scope.appleCIDR = function (ipStructure) {
            return ipStructure.prefix + "/" + ipStructure.prefixlen;
        };
        $scope.appleCIDR2 = function (obj) {
            if (obj.assignment != null) {
                return $scope.appleCIDR(obj.assignment);
            } else if (obj.interface != null) {
                return $scope.appleCIDR(obj.interface);
            }
        };

        $scope.zoneType = function (zone) {
            return {1:'Internal', 2:'Customer'}[zone.purpose];
        };

        $scope.selectZone = function (zone, index) {
            deselect();
            $scope.selectedZone.zone = zone;
            $scope.selectedZone.index = index;
        };

        $scope.selectAssignment = function (assignment, index, relatedZone) {
            deselect();
            $scope.selectedAssignment.assignment = assignment;
            $scope.selectedAssignment.index = index;
            $scope.selectedAssignment.relatedZone = relatedZone;
        };

        $scope.selectInterface = function (intf, index, relatedAssignment) {
            deselect();
            $scope.selectedInterface.interface = intf;
            $scope.selectedInterface.index = index;
            $scope.selectedInterface.relatedAssignment = relatedAssignment;
        };

        $scope.isSelected = function (zone) {
            return $scope.selectedZone.zone === zone;
        };

        $scope.isSelectedAssignment = function (assignment) {
            return $scope.selectedAssignment.assignment === assignment;
        };

        $scope.isSelectedInterface = function (intf) {
            return $scope.selectedInterface.interface === intf;
        };

        $scope.selectionExists = function () {
            return $scope.selectedZone.zone !== null
                || $scope.selectedAssignment.assignment !== null
                || $scope.selectedInterface.interface !== null;
        };

        $scope.setCustomer = function () {
            // open a modal and ask for cust
            var modalInstance = $uibModal.open({
                templateUrl: 'customerModal.html',
                scope: $scope,
                size: 'md',
                controller: 'IPv6CustomerAssignmentModalController'
            });
            modalInstance.result.then();
        };

        $scope.create48 = function (selection) {
            $http.post(selection.zone.url + "create_48/").then(function (response) {
                selection.zone.assignments.push(response.data);
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };

        $scope.create64 = function (selection) {
            $http.post(selection.assignment.url + "create_interface/").then(function (response) {
                selection.assignment.interfaces.push(response.data);
            }).catch(function (error) {
                AlertService2.danger(error);
            });
        };

        var delete_with_index = function(url, obj, index) {
            return $http.delete(url).then(function (response) {
                obj.splice(index, 1);
            }).catch(function (error) {
                AlertService2.danger(error.data);
            });
        };

        $scope.deleteIntf = function () {
            return delete_with_index(
                $scope.selectedInterface.interface.url,
                $scope.selectedInterface.relatedAssignment.interfaces,
                $scope.selectedInterface.index
            );
        };

        $scope.delete48 = function () {
            return delete_with_index(
                $scope.selectedAssignment.assignment.url,
                $scope.selectedAssignment.relatedZone.assignments,
                $scope.selectedAssignment.index
            );
        };

        $scope.setDesc = function (obj) {
            $scope.obj = obj;
            var modalInstance = $uibModal.open({
                templateUrl: 'descModal.html',
                scope: $scope,
                size: 'md',
                controller: 'IPv6DescriptionController'
            });
            modalInstance.result.then();
        };
    }
]);

app.controller('IPv6DescriptionController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    'AlertService2',
    function ($scope, $http, $uibModalInstance, AlertService2) {
        $scope.setDescription = function (obj, desc) {
            var p = $http.post(obj.url + "set_desc/", {desc:desc}).then(function (response) {
                console.log(response);
                obj.description = response.data.description;
            }).catch(function (error) {
                AlertService2.danger(error.data);
            });
            $uibModalInstance.close();
            return p;
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);

app.controller('IPv6CustomerAssignmentModalController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    function ($scope, $http, $uibModalInstance) {
        // get org from either assignment or interface

        if ($scope.selectedAssignment.assignment != null) {
            $scope.obj = $scope.selectedAssignment.assignment;
        } else if ($scope.selectedInterface.interface != null) {
            $scope.obj = $scope.selectedInterface.interface;
        }

        $scope.org = $scope.obj.customer;

        $scope.assign = function (object, org) {
            $http.post(object.url + "assign_org/", {org:org}).then(function (response) {
                object.customer = response.data.customer;
            }).catch(function (error) {
                // todo
                $scope.currentAssignment = null;
            });

            $uibModalInstance.close();
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
