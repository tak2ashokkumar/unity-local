var app = angular.module('uldb');

app.controller('IPv4AllocationController', [
    '$scope',
    '$location',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope,
              $location,
              AbstractControllerFactory2,
              ULDBService2) {
        $scope.tabs = [
            { name: 'IPv4 ARIN Allocations', url: 'ipv4_public/allocations' },
            { name: 'IPv6 Allocations', url: 'ipv6alloc' },
            { name: 'Private Allocations', url: 'ipv4_private/allocations' },
        ];

        $scope.activeTab = 0;
        $scope.updateTab = function (idx) {
            // console.log("idx:"+idx);
            $location.path($scope.tabs[idx].url);
        };
        $scope.ctrl = AbstractControllerFactory2($scope,
            ULDBService2.publicIPv4Allocation());
        $scope.fields = ULDBService2.publicIPv4Allocation().fields();

    }
]);

app.controller('PrivateIPv4AllocationController', [
    '$scope',
    '$location',
    'PrivateIPv4AllocationService',
    'AlertService2',
    'IPAllocControllerFactory',
    function ($scope, $location, PrivateIPv4AllocationService, AlertService2, IPAllocControllerFactory) {
        $scope.tabs = [
            { name: 'IPv4 ARIN Allocations', url: 'ipv4_public/allocations' },
            { name: 'IPv6 Allocations', url: 'ipv6alloc' },
            { name: 'Private Allocations', url: 'ipv4_private/allocations' },
        ];

        $scope.activeTab = 2;
        $scope.updateTab = function (idx) {
            console.log("idx:"+idx);
            $location.path($scope.tabs[idx].url);
        };
        $scope.model = PrivateIPv4AllocationService.getModel();
        ($scope.pageChanged = PrivateIPv4AllocationService.loadPage($scope.model))();
        $scope.alertService = AlertService2;

        $scope.selection = {
            selected: null,
            index: null
        };
        $scope.modal = {
            templateUrl: 'newPrivateBlockModal.html',
            scope: $scope,
            size: 'md',
            controller: 'PrivateIPv4AddBlockModalController'
        };

        var ctrl = new IPAllocControllerFactory(PrivateIPv4AllocationService, $scope);
        $scope.addBlock = ctrl.add;
        $scope.edit = ctrl.edit;
        $scope.delete = ctrl.remove;
    }
]);

app.controller('IPv4AddBlockModalController', [
    '$scope',
    '$uibModalInstance',
    'IPv4AllocationService',
    'IPModalFactory',
    function ($scope, $uibModalInstance, IPv4AllocationService, IPModalFactory) {
        var base = new IPModalFactory(IPv4AllocationService, $scope, $uibModalInstance);
        $scope.add = base.add;
        $scope.edit = base.edit;
        $scope.cancel = base.cancel;
    }
]);

app.controller('PrivateIPv4AddBlockModalController', [
    '$scope',
    '$uibModalInstance',
    'PrivateIPv4AllocationService',
    'IPModalFactory',
    function ($scope, $uibModalInstance, PrivateIPv4AllocationService, IPModalFactory) {
        var base = new IPModalFactory(PrivateIPv4AllocationService, $scope, $uibModalInstance);
        $scope.add = base.add;
        $scope.edit = base.edit;
        $scope.cancel = base.cancel;
    }
]);

app.controller('IPv4AssignmentController', [
    '$scope',
    'IPv4AssignmentService',
    '$uibModal',
    'Organization',
    'ULDBCustomerSearchService',
    'AlertService',
    'AbstractControllerFactory2',
    'ULDBService2',
    function ($scope, IPv4AssignmentService, $uibModal,
              Organization, ULDBCustomerSearchService, AlertService,
              AbstractControllerFactory2, ULDBService2) {
        $scope.ctrl = AbstractControllerFactory2($scope,
            ULDBService2.public_ipv4_assignment()
        );
        $scope.fields = ULDBService2.public_ipv4_assignment().fields();


        $scope.classSelectors = function (result) {
            return {
                'success': result === $scope.selection.selected,
                // 'success': result === $scope.sibling,
                'warning': $scope.relatedTo(result)
            };
        };
        $scope.selectActions = function (result) {
            $scope.selectAssignment(result);
        };

        $scope.getOrgs = ULDBCustomerSearchService.orgSearch;

        $scope.currentAssignment = null;
        $scope.sibling = null;

        $scope.relatedTo = function (assignment) {
            if ($scope.currentAssignment == null) {
                return false;
            }
            var pfx = $scope.currentAssignment.prefixlen - 1;
            var assignParents = assignment.parents;
            var currParents = $scope.currentAssignment.parents;
            var matches = (
                assignment !== $scope.currentAssignment
                && pfx in assignParents
                && pfx in currParents
                && assignParents[pfx] == currParents[pfx]
            );
            return matches;
        };

        $scope.selectAssignment = function (assignment) {
            // this is the row
            $scope.currentAssignment = assignment;

            // determine the sibling arithmetically
            if (assignment != null) {
                // optimization is to look "left and right"
                var currentIdx = $scope.model.results.indexOf(assignment);
                var attempts = [];
                // left
                if (currentIdx > 0) {
                    attempts.push(currentIdx - 1);
                }
                // right
                if (currentIdx < $scope.model.results.length - 1) {
                    attempts.push(currentIdx + 1);
                }
                $scope.sibling = attempts.map(function (e, i, arr) {
                    return $scope.model.results[e];
                }).find(function (e, i, arr) {
                    if (e.network_int == assignment.sibling_network_int
                        && e.prefixlen == assignment.prefixlen) {
                        return true;
                    }
                });

            } else {
                $scope.sibling = null;
            }
        };
        // $scope.setCustomer2 = function (result) {
        //     console.log(result);
        //     $scope.selectAssignment(result);
        //     var modalInstance = $uibModal.open({
        //         templateUrl: '/static/rest/app/templates/ipam/assign_cust.html',
        //         scope: $scope,
        //         size: 'md',
        //         controller: 'IPv4CustomerAssignmentModalController'
        //     });
        //     modalInstance.result.then();
        // };

        $scope.formatIp = function (assignment) {
            return assignment.prefix + '/' + assignment.prefixlen;
        };

        $scope.split = function (assignment) {
            // ask the service to split
            IPv4AssignmentService.splitter(assignment).then(function (response) {
                // replace the now-invalid row with the two child blocks from the split
                $scope.model.results.splice($scope.model.results.indexOf(assignment), 1, response[0], response[1]);

                // add an alert to inform the user
                $scope.alertService.addAlert({
                    'msg': "Split " + $scope.formatIp(assignment) + " into "
                    + $scope.formatIp(response[0]) + ", " + $scope.formatIp(response[1]),
                    'severity': 'success'
                });
                $scope.selectAssignment(null); // clear selected user
            });
        };

        $scope.aggregate = function () {
            // ask the service to aggregate
            IPv4AssignmentService.aggregator($scope.currentAssignment).then(function (response) {
                // remove siblings from the table
                $scope.model.results.splice(
                    $scope.model.results.indexOf($scope.currentAssignment), 1);
                $scope.model.results.splice(
                    $scope.model.results.indexOf($scope.sibling), 1, response);

                // add an alert to inform the user
                $scope.alertService.addAlert({
                    'msg': "Merged "
                    + $scope.formatIp($scope.currentAssignment)
                    + " and "
                    + $scope.formatIp($scope.sibling)
                    + " to: "
                    + $scope.formatIp(response),
                    'severity': 'success'
                });
                $scope.selectAssignment(null);  // clear selected user
            }, function (error) {
                // alert the user about the error
                $scope.alertService.addAlert(error);
            });
        };

        $scope.additional_actions = [
            {
                name: 'Split',
                func: $scope.split
            },
            {
                name: 'Aggregate',
                func: $scope.aggregate
            }
            // {
            //     name: "Set Customer",
            //     func: $scope.setCustomer2
            // }
        ];
    }
]);


app.controller('PrivateIPv4AssignmentController', [
    '$scope',
    'PrivateIPv4AssignmentService',
    '$uibModal',
    'Organization',
    'ULDBCustomerSearchService',
    'AlertService',
    function ($scope, PrivateIPv4AssignmentService, $uibModal,
              Organization, ULDBCustomerSearchService, AlertService) {
        // load the model data and the first page
        $scope.model = PrivateIPv4AssignmentService.getModel();
        ($scope.pageChanged = PrivateIPv4AssignmentService.loadPage($scope.model))();

        // get a common function from a service (other ctrls can use this)
        $scope.getOrgs = ULDBCustomerSearchService.orgSearch;

        // a scope variable for alerts
        $scope.alerts = [];
        $scope.alertService = new AlertService($scope.alerts);

        //  handle selected block here for now here, since the $uibModal does some custom stuff
        //  with currentAssignment.related
        $scope.currentAssignment = null;
        $scope.sibling = null;

        $scope.relatedTo = function (assignment) {
            if ($scope.currentAssignment == null) {
                return false;
            }
            var pfx = $scope.currentAssignment.prefixlen - 1;
            var assignParents = assignment.related.parents;
            var currParents = $scope.currentAssignment.related.parents;
            var matches = (
                assignment !== $scope.currentAssignment
                && pfx in assignParents
                && pfx in currParents
                && assignParents[pfx] == currParents[pfx]
            );
            return matches;
        };

        $scope.selectAssignment = function (assignment) {
            // this is the row
            $scope.currentAssignment = assignment;

            // determine the sibling arithmetically
            if (assignment != null) {
                // optimization is to look "left and right"
                var currentIdx = $scope.model.results.indexOf(assignment);
                var attempts = [];
                // left
                if (currentIdx > 0) {
                    attempts.push(currentIdx - 1);
                }
                // right
                if (currentIdx < $scope.model.results.length - 1) {
                    attempts.push(currentIdx + 1);
                }
                $scope.sibling = attempts.map(function (e, i, arr) {
                    return $scope.model.results[e];
                }).find(function (e, i, arr) {
                    if (e.network_int == assignment.sibling_network_int
                        && e.prefixlen == assignment.prefixlen) {
                        return true;
                    }
                });

            } else {
                $scope.sibling = null;
            }
        };

        $scope.setCustomer = function (assignment) {
            return function () {
                // select the row
                $scope.selectAssignment(assignment);

                // open a modal and ask for cust
                var modalInstance = $uibModal.open({
                    templateUrl: 'customerModal.html',
                    scope: $scope,
                    size: 'md',
                    controller: 'IPv4CustomerAssignmentModalController'
                });
                modalInstance.result.then();
            };
        };

        $scope.formatIp = function (assignment) {
            return assignment.prefix + '/' + assignment.prefixlen;
        };

        $scope.split = function (assignment) {
            // ask the service to split
            PrivateIPv4AssignmentService.splitter(assignment).then(function (response) {
                // replace the now-invalid row with the two child blocks from the split
                $scope.model.results.splice($scope.model.results.indexOf(assignment), 1, response[0], response[1]);

                // add an alert to inform the user
                $scope.alertService.addAlert({
                    'msg': "Split " + $scope.formatIp(assignment) + " into "
                    + $scope.formatIp(response[0]) + ", " + $scope.formatIp(response[1]),
                    'severity': 'success'
                });
                $scope.selectAssignment(null); // clear selected user
            });
        };

        $scope.aggregate = function () {
            // ask the service to aggregate
            PrivateIPv4AssignmentService.aggregator($scope.currentAssignment).then(function (response) {
                // remove siblings from the table
                $scope.model.results.splice(
                    $scope.model.results.indexOf($scope.currentAssignment), 1);
                $scope.model.results.splice(
                    $scope.model.results.indexOf($scope.sibling), 1, response);

                // add an alert to inform the user
                $scope.alertService.addAlert({
                    'msg': "Merged "
                    + $scope.formatIp($scope.currentAssignment)
                    + " and "
                    + $scope.formatIp($scope.sibling)
                    + " to: "
                    + $scope.formatIp(response),
                    'severity': 'success'
                });
                $scope.selectAssignment(null);  // clear selected user
            }, function (error) {
                // alert the user about the error
                $scope.alertService.addAlert(error);
            });
        };
    }
]);


app.controller('IPv4AssignmentDetailController', [
    '$scope',
    '$routeParams',
    '$uibModal',
    'PublicIPv4Assignment',
    'AbstractControllerFactory',
    'SearchService',
    'InstanceFast',
    function ($scope, $routeParams, $uibModal, PublicIPv4Assignment, AbstractControllerFactory,
              SearchService, InstanceFast) {
        $scope.ipBlock = $routeParams.ipBlock;
        $scope.block = null;

        $scope.$root.title = {
            plural: "IPv4 Assignment Details",
            singular: "IPv4 Assignment Details"
        };

        $scope.resourceClass = PublicIPv4Assignment;
        $scope.ctrl = new AbstractControllerFactory($scope.resourceClass, $scope, "ipBlock");
        // $scope.breadCrumb = { name: $scope.ipBlock, url: "#/ipv4_public/assignments/" + $scope.ipBlock };

        PublicIPv4Assignment.query({ prefix: $scope.ipBlock }).$promise.then(function (results) {
            $scope.block = results.results[0];
            //$scope.block.sort(function (a, b) { return a.address_int - b.address_int});
        });

        // var instanceSearch = new SearchService(InstanceFast);
        // $scope.getInstances = instanceSearch.search;

        $scope.selectedAddress = {
            address: null,
            index: null
        };

        var deselect = function () {
            $scope.selectedAddress.address = null;
            $scope.selectedAddress.index = null;
        };

        $scope.selectAddress = function (address, index) {
            deselect();
            $scope.selectedAddress.address = address;
            $scope.selectedAddress.index = index;
        };

        $scope.isSelectedAddress = function (address) {
            return $scope.selectedAddress.address === address;
        };

        $scope.selectionExists = function () {
            return $scope.selectedAddress.address !== null;
        };

        $scope.setDevice = function () {
            // open a modal and ask for device
            var modalInstance = $uibModal.open({
                templateUrl: 'deviceModal.html',
                scope: $scope,
                size: 'md',
                controller: 'IPv4DeviceModalController'
            });
            modalInstance.result.then();
        };
    }
]);


app.controller('PrivateIPv4AssignmentDetailController', [
    '$scope',
    '$routeParams',
    'PrivateIPv4Assignment',
    function ($scope, $routeParams, PrivateIPv4Assignment) {
        $scope.ipBlock = $routeParams.ipBlock;
        $scope.block = null;
        PrivateIPv4Assignment.query({ prefix: $scope.ipBlock }).$promise.then(function (results) {
            $scope.block = results.results[0];
            //$scope.block.sort(function (a, b) { return a.address_int - b.address_int});
        });
    }
]);


app.controller('IPv4CustomerAssignmentModalController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    function ($scope, $http, $uibModalInstance) {

        $scope.org = $scope.currentAssignment.customer;

        $scope.assign = function (obj) {
            // updates can easily be done with PUT
            $http.put($scope.original.url, obj).then(function (response) {
                angular.extend($scope.original, response.data);
                $uibModalInstance.close();
            });
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);


app.controller('IPv4DeviceModalController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    function ($scope, $http, $uibModalInstance) {

        $scope.currentObject = $scope.selectedAddress.address;

        if ($scope.currentObject.device != null) {
            $scope.device = $scope.currentObject.device;
        }
        else {
            $scope.device = null;
        }

        $scope.assign = function (object, device) {
            $http.post(object.url + "assign_device/", device).then(function (response) {
                // $scope.selectedAddress.address = response.data;
            }).catch(function (error) {
                // todo
            });

            $uibModalInstance.close();
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }
]);
