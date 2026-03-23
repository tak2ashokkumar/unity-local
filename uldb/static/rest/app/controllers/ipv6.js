var app = angular.module('uldb');

app.controller('IPv6AssignmentController', [
    '$scope',
    '$http',
    '$location',
    'IPv6AssignmentService',
    '$uibModal',
    'Organization',
    'ULDBCustomerSearchService',
    'AlertService',
    'BreadCrumbService',
    function ($scope, $http, $location, IPv6AssignmentService, $uibModal,
              Organization, ULDBCustomerSearchService, AlertService, BreadCrumbService) {

        $scope.AssignFromAllocation = false;
        window.locationModified = false;
        // load the model data and the first page
        $scope.model = IPv6AssignmentService.getModel();
        ($scope.pageChanged = IPv6AssignmentService.loadPage($scope.model))();

        // get a common function from a service (other ctrls can use this)
        $scope.getOrgs = ULDBCustomerSearchService.orgSearch;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "IPv6 Assignment", url: '#/ipv6assign/' }, $scope);
            window.orgfrom = "";
        });

        // a scope variable for alerts
        $scope.alerts = [];
        $scope.alertService = new AlertService($scope.alerts);

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
                    controller: 'IPv6CustomerAssignmentModalController'
                });
                modalInstance.result.then();
            };
        };

        $scope.formatIp = function (assignment) {
            return assignment.prefix + '/' + assignment.prefixlen;
        };

        $scope.Create64 = function (assignment) {

            var assign_id = assignment.id;
            var customer_id = assignment.customer.id;

            $http.post(assignment.url + 'create_64/').then(function (response) {

                $scope.alertService.addAlert({
                    'msg': "Created " + $scope.formatIp(assignment), 'severity': 'success'
                });
            });
            $scope.selectAssignment(null);
        };

        $scope.delete = function (assignment, index) {
            $http.delete(assignment.url).then(function (response) {

                window.locationModified = false;

                $scope.model = IPv6AssignmentService.getModel();
                ($scope.pageChanged = IPv6AssignmentService.loadPage($scope.model))();

                $scope.alertService.addAlert({
                    'msg': "Deleted " + $scope.formatIp(assignment), 'severity': 'success'
                });
            });
            $scope.selectAssignment(null);
        };

        $scope.ShowInterfaceDetails = function (assignment) {
            $location.path("/ipv6interface/" + assignment.id);
        };

    }
]);

app.controller('IPv6RegionAssignmentController', [
    '$scope',
    '$http',
    '$location',
    'IPv6AssignmentService',
    'IPv6AssignmentRegionWise',
    '$uibModal',
    'Organization',
    'ULDBCustomerSearchService',
    'AlertService',
    'BreadCrumbService',
    '$routeParams',
    function ($scope, $http, $location, IPv6AssignmentService, IPv6AssignmentRegionWise, $uibModal,
              Organization, ULDBCustomerSearchService, AlertService, BreadCrumbService, $routeParams) {


        $scope.AssignFromAllocation = true;

        $scope.routeid = $routeParams.id;

        // load the model data and the first page
        $scope.model = IPv6AssignmentService.getModel();
        ($scope.pageChanged = IPv6AssignmentService.loadRegionPage($scope.model))();

        // get a common function from a service (other ctrls can use this)
        $scope.getOrgs = ULDBCustomerSearchService.orgSearch;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({
                name: "IPv6 Assignment (" + $scope.model.location + ")",
                url: '#/ipv6assign/' + $scope.routeid + '/'
            }, $scope);

        });

        // a scope variable for alerts
        $scope.alerts = [];
        $scope.alertService = new AlertService($scope.alerts);

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
                    controller: 'IPv6CustomerAssignmentModalController'
                });
                modalInstance.result.then();
            };
        };

        $scope.formatIp = function (assignment) {
            return assignment.prefix + '/' + assignment.prefixlen;
        };

        $scope.Create48 = function (tier_id, msg) {
            $scope.model = IPv6AssignmentService.getModel();
            ($scope.pageChanged = IPv6AssignmentService.Create48CustomerInternal($scope.model, tier_id))();

            $scope.alertService.addAlert({
                'msg': "Created " + msg,
                'severity': 'success'
            });
            $scope.selectAssignment(null);

        };

        $scope.Create64 = function (assignment) {

            var assign_id = assignment.id;
            var customer_id = assignment.customer.id;

            $http.post(assignment.url + 'create_64/').then(function (response) {

                $scope.alertService.addAlert({
                    'msg': "Created " + $scope.formatIp(assignment), 'severity': 'success'
                });
            });
            $scope.selectAssignment(null);
        };

        $scope.delete = function (assignment, index) {
            $http.delete(assignment.url).then(function (response) {

                $scope.model = IPv6AssignmentService.getModel();
                ($scope.pageChanged = IPv6AssignmentService.loadRegionPage($scope.model))();

                $scope.alertService.addAlert({
                    'msg': "Deleted " + $scope.formatIp(assignment), 'severity': 'success'
                });
            });
            $scope.selectAssignment(null);
        };

        $scope.ShowInterfaceDetails = function (assignment) {
            $location.path("/ipv6interface/" + assignment.id);
        };
    }
]);

app.controller('IPv6InterfaceController', [
    '$scope',
    '$http',
    'IPv6AssignmentService',
    '$uibModal',
    'Organization',
    'ULDBCustomerSearchService',
    'AlertService',
    'BreadCrumbService',
    '$routeParams',
    function ($scope, $http, IPv6AssignmentService, $uibModal,
              Organization, ULDBCustomerSearchService, AlertService, BreadCrumbService, $routeParams) {

        $scope.routeid = $routeParams.id;

        $scope.AssignFromAllocation = false;
        window.locationModified = false;
        // load the model data and the first page
        $scope.model = IPv6AssignmentService.getModel();
        ($scope.pageChanged = IPv6AssignmentService.loadInterfacePage($scope.model))();

        // get a common function from a service (other ctrls can use this)
        $scope.getOrgs = ULDBCustomerSearchService.orgSearch;

        $scope.bread = BreadCrumbService;
        $scope.$on('$destroy', function () {
            $scope.bread.pushIfTop({ name: "IPv6 Interface", url: '#/ipv6interface/' + $scope.routeid }, $scope);
            window.orgfrom = "";
        });

        // a scope variable for alerts
        $scope.alerts = [];
        $scope.alertService = new AlertService($scope.alerts);

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
                    controller: 'IPv6CustomerAssignmentModalController'
                });
                modalInstance.result.then();
            };
        };

        $scope.formatIp = function (assignment) {
            return assignment.prefix + '/' + assignment.prefixlen;
        };

        $scope.delete = function (assignment, index) {
            $http.delete(assignment.url).then(function (response) {

                window.locationModified = false;

                $scope.model = IPv6AssignmentService.getModel();
                ($scope.pageChanged = IPv6AssignmentService.loadInterfacePage($scope.model))();

                $scope.alertService.addAlert({
                    'msg': "Deleted " + $scope.formatIp(assignment), 'severity': 'success'
                });
            });
            $scope.selectAssignment(null);
        };

    }
]);

app.controller('IPv6CustomerAssignmentModalController', [
    '$scope',
    '$http',
    '$uibModalInstance',
    function ($scope, $http, $uibModalInstance) {

        $scope.org = $scope.currentAssignment.customer;

        $scope.assign = function (org, currentAssignment) {

            // updates can easily be done with PUT
            currentAssignment.customer = org; //org.url;
            $http.put(currentAssignment.url, currentAssignment).then(function (response) {

                currentAssignment.related = response.data.related;
            }).then(function (a) {
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

app.factory('IPv6AssignmentService', [
    '$http',
    '$routeParams',
    'IPv6Assignment',
    'IPv6Interface',
    'IPv6Create48',
    'IPv6AssignmentRegionWise',
    'PaginatedResultsModel',
    function ($http, $routeParams, IPv6Assignment, IPv6Interface, IPv6Create48, IPv6AssignmentRegionWise, PaginatedResultsModel) {

        var pages = {};
        var count = 0;
        var currentPage = 1;

        var model = new PaginatedResultsModel(count, currentPage);

        var loadPage = function (model) {

            return function () {

                currentPage = model.currentPage;
                if (currentPage in pages && window.locationModified) {
                    model.results = pages[currentPage];
                } else {
                    IPv6Assignment.query({ page: currentPage, page_size: 1000 }).$promise.then(function (response) {
                        if (model.count == 0) {
                            model.count = response.count;
                        }
                        pages[currentPage] = response.results;
                        model.results = response.results;
                        window.locationModified = true;
                    });
                }
            };
        };

        var loadRegionPage = function (model) {

            return function () {

                IPv6AssignmentRegionWise.get({ id: $routeParams.id }).$promise.then(function (response) {

                    pages[currentPage] = response.assignments;
                    model.results = response.assignments;
                    model.int_tier_id = response.int_tier_id;
                    model.ext_tier_id = response.ext_tier_id;
                    model.location = response.region_external;
                    window.locationModified = true;
                });

            };
        };

        var loadInterfacePage = function (model) {

            return function () {

                IPv6Interface.get({ id: $routeParams.id }).$promise.then(function (response) {

                    pages[currentPage] = response.interfaces;
                    model.results = response.interfaces;
                    window.locationModified = true;
                });

            };
        };

        var Create48CustomerInternal = function (model, tier_id) {

            return function () {


                IPv6Create48.get({ id: tier_id }).$promise.then(function (response) {

                    pages[currentPage] = response.assignments;
                    model.results = response.assignments;
                    model.int_tier_id = response.int_tier_id;
                    model.ext_tier_id = response.ext_tier_id;
                    model.location = response.region_external;
                    window.locationModified = true;

                });


            };
        };

        var getModel = function () {
            return new PaginatedResultsModel(count, currentPage);
        };

        return {
            model: model,
            getModel: getModel,
            loadPage: loadPage,
            loadRegionPage: loadRegionPage,
            loadInterfacePage: loadInterfacePage,
            Create48CustomerInternal: Create48CustomerInternal,
            currentPage: currentPage
        };
    }
]);

// simple factory for producing the model to hold results
app.factory('PaginatedResultsModel', function () {

    return function (count, page) {

        this.results = [];
        this.count = 0;
        this.currentPage = page;
        this.currentServer = {
            data: null
        };
        this.int_tier_id = 0;
        this.ext_tier_id = 0;
        this.location = "";
    };
});
