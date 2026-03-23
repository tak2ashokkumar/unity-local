var app = angular.module('uldb');

// reusable alert factory
app.factory('AlertService', [
    function () {
        return function (alerts) {
            var addAlert = function (alert) {
                alerts.push(alert);
            };
            var closeAlert = function (index) {
                alerts.splice(index, 1);
            };
            return {
                addAlert: addAlert,
                closeAlert: closeAlert
            };
        };
    }
]);

// non-factory-factory version of the above
app.factory('AlertService3', [ //Replaced the name from AlertService2 to AlertService3
    '$mdToast',
    function ($mdToast) {
        var alerts = [];
        var addAlert = function (alert) {
            alerts.push(alert);
        };
        var closeAlert = function (index) {
            alerts.splice(index, 1);
        };
        var success = function (message) {
            addAlert({msg: message, severity: 'success'});
        };
        var danger = function (message) {
            addAlert({msg: message, severity: 'danger'});
        };
        var info = function (message) {
            addAlert({msg: message, severity: 'info'});
        };
        var showToast = function (message, delay) {
            $mdToast.hide();
            var _delay = 5000;
            if (angular.isDefined(delay)) {
                _delay = delay;
            }
            return $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .position('bottom right')
                    .hideDelay(_delay)
                    .parent(document.getElementById('wrapped'))

            );
        };
        return {
            alerts: alerts,
            addAlert: addAlert,
            closeAlert: closeAlert,
            success: success,
            danger: danger,
            info: info,
            showToast: showToast
        };
    }
]);

app.factory('AlertService2', [
    'ngNotify','$rootScope',
    function (ngNotify, $rootScope) {

        var customAlert = function (message, type, sticky) {
            ngNotify.set('&nbsp;' + message + '<i ng-show="ngNotify.notifyButton" class="ngn-dismiss" ng-click="dismiss()">×</i>', {
                type: type ? type : 'success',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? true : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
            });
            $rootScope.banner_active = true;
        };
        var info = function (message, sticky) {
            ngNotify.set('&nbsp;' + message + '<i ng-show="ngNotify.notifyButton" class="ngn-dismiss" ng-click="dismiss()">×</i>', {
                type: 'info',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? false : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
            });
            $rootScope.banner_active = true;
        };
        var success = function (message, sticky) {
            ngNotify.set('&nbsp;' + message + '<i ng-show="ngNotify.notifyButton" class="ngn-dismiss" ng-click="dismiss()">×</i>', {
                type: 'success',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? false : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
                // sticky: true,
            });
            $rootScope.banner_active = true;
        };
        var warning = function (message, sticky) {
            ngNotify.set('&nbsp;' + message + '<i ng-show="ngNotify.notifyButton" class="ngn-dismiss" ng-click="dismiss()">×</i>', {
                type: 'warn',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? false : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
                // sticky: true,
            });
            $rootScope.banner_active = true;
        };
        var danger = function (message, sticky) {
            ngNotify.set('&nbsp;' + message, {
                type: 'error',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? true : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
            });
            $rootScope.banner_active = true;
        };

        var addAlert = function (config, sticky) {
            ngNotify.set('&nbsp;' + config.msg + '<i ng-show="ngNotify.notifyButton" class="ngn-dismiss" ng-click="dismiss()">×</i>', {
                type: config.severity ? config.severity : 'success',
                target: '#notificationArea',
                position: 'top',
                html: true,
                sticky: (typeof(sticky) === "undefined" ? false : (typeof(sticky) === "boolean" ? sticky : false)),
                duration: (typeof(sticky) === "undefined" ? null : (typeof(sticky) !== "boolean" ? sticky : null))
            });
            $rootScope.banner_active = true;
        };

        return {
            info: info,
            success: success,
            warning: warning,
            danger: danger,
            customAlert: customAlert,
            addAlert: addAlert
        };
    }
]);

app.factory('BreadCrumbService', [
    '$rootScope',
    function ($rootScope) {
        var crumbs = [];
        var max_links = 3;
        var push = function (link) {
            crumbs.push(link);
            if (crumbs.length > max_links) {
                crumbs.splice(0, crumbs.length - max_links);
            }
        };
        var push_top = function (link, $scope) {
            if ($scope.$parent === $rootScope) {
                push(link);
            }
        };
        return {
            crumbs: crumbs,
            push: push,
            pushIfTop: push_top
        };
    }
]);

app.factory('IPv4AllocationService', [
    'PublicIPv4Allocation',
    'IPv4AllocationServiceFactory',
    function (PublicIPv4Allocation, IPv4AllocationServiceFactory) {
        return IPv4AllocationServiceFactory(PublicIPv4Allocation);
    }
]);

app.factory('PrivateIPv4AllocationService', [
    'PrivateIPv4Allocation',
    'IPv4AllocationServiceFactory',
    function (PrivateIPv4Allocation, IPv4AllocationServiceFactory) {
        return IPv4AllocationServiceFactory(PrivateIPv4Allocation);
    }
]);

app.factory('IPv4AssignmentService', [
    'PublicIPv4Assignment',
    'IPv4AssignmentServiceFactory',
    function (PublicIPv4Assignment, IPv4AssignmentServiceFactory) {
        return IPv4AssignmentServiceFactory(PublicIPv4Assignment);
    }
]);

app.factory('PrivateIPv4AssignmentService', [
    'PrivateIPv4Assignment',
    'IPv4AssignmentServiceFactory',
    function (PrivateIPv4Assignment, IPv4AssignmentServiceFactory) {
        return IPv4AssignmentServiceFactory(PrivateIPv4Assignment);
    }
]);

app.factory('IPv4AllocationServiceFactory', [
    '$q',
    '$http',
    'AbstractModelServiceFactory',
    function ($q, $http, AbstractModelServiceFactory) {
        return function (resourceClass) {
            var service = AbstractModelServiceFactory(resourceClass);
            service.create = function (obj) {
                // create new Resource...
                var alloc = new resourceClass(obj);

                // ...then POST it and return promise
                return alloc.$save();
            };
            service.update = function (obj) {
                return resourceClass.update(obj);
            };
            service.delete = function (id) {
                return new resourceClass({id: id}).$delete();
            };
            return service;
        };
    }
]);

app.factory('IPv4AssignmentServiceFactory', [
    '$q',
    '$http',
    'AbstractModelServiceFactory',
    function ($q, $http, AbstractModelServiceFactory) {
        return function (resourceClass) {
            var service = AbstractModelServiceFactory(resourceClass, 1000);
            service.splitter = function (assignment) {
                return $http.post(assignment.url + 'split/').then(function (response) {
                    service.expire();
                    return response.data;
                }).catch(function (error) {
                    return $q.reject(error);
                });
            };
            service.getSibling = function (assignment) {
                return $http.get(assignment.url + 'get_sibling/').then(function (response) {
                    // return sibling or null
                    return response.data;
                }).catch(function (error) {
                    return $q.reject(error);
                });
            };
            service.aggregator = function (assignment) {
                return $http.post(assignment.url + 'aggregate/').then(function (response) {
                    // return aggregated block
                    service.expire();
                    return response.data;
                }, function (error) {
                    return $q.reject(error.data);
                });
            };
            return service;
        };
    }
]);

app.factory('ULDBCustomerSearchService', [
    'Organization',
    function (Organization) {
        var orgSearch = function (val) {
            return Organization.query({'search': val, 'page_size': 1000}).$promise.then(function (response) {
                return response.results;
            });
        };

        return {
            orgSearch: orgSearch
        };
    }
]);

app.factory('SearchService', [
    function () {
        return function (resourceClass) {
            var search = function (val) {
                return resourceClass.query({search: val, page_size: 1000}).$promise.then(function (response) {
                    return response.results;
                }).catch(function (error) {
                    console.log(error);
                });
            };
            return  {
                search: search
            };
        };
    }
]);

app.factory('CustomSearchService', [
    function () {
        return function (resourceClass, custom, param_value) {
            var search = function (val) {
                var obj= {};
                obj['search'] = val;
                obj[custom] = param_value;
                obj['page_size'] = 1000;
                return resourceClass.query(obj).$promise.then(function (response) {
                    return response.results;
                }).catch(function (error) {
                    console.log(error);
                });
            };
            return  {
                search: search
            };
        };
    }
]);



app.factory('TabService', [
    '$location',
    function ($location) {
        /*
         * Requires the following set on scope:
         *  - tab
         *  - tabs
         * Sets:
         *  - activeTab
         */
        return {
            updateTab: function ($scope) {
                return function (idx) {
                    var tab = $scope.tab;
                    if (!angular.isDefined($scope.activeTab)) {
                        $scope.activeTab = 0;
                    }
                    if (tab) {
                        $scope.tabs.forEach(function (e, i, arr) {
                            if (e.name == tab) {
                                $scope.activeTab = i;
                            }
                        });
                    }
                    return $location.search({ t: $scope.tabs[idx].name });
                };
            }
        };
    }
]);


// Same was AbstractModelServiceFactory, but doesn't manually cache pages.
app.factory('AbstractModelServiceFactory2', [
    '$http',
    'PaginatedResultsModel',
    function ($http, PaginatedResultsModel) {
        return function (resourceClass, pageSize) {
            var pages = {};
            var count = 0;
            var currentPage = 1;
            var pageSize = pageSize === undefined ? 10 : pageSize;

            var loadPage = function (model) {
                return function (currentPage) {
                    return resourceClass.query({
                        page: currentPage,
                        page_size: pageSize
                    }).$promise.then(function (response) {
                        if (model.count == 0) {
                            model.count = response.count;
                        }
                        model.results = response.results;
                    });
                };
            };

            var expire = function () {
                // forget all pages?
                pages = {};
            };

            var getModel = function () {
                return new PaginatedResultsModel(count, currentPage, pageSize);
            };

            return {
                loadPage: loadPage,
                getModel: getModel,
                expire: expire
            };
        };
    }
]);




// simple factory for producing the model to hold results
app.factory('PaginatedResultsModel', function () {
    return function (count, page) {
        // this.results = null;  // Removed this to render graphic `loader` and `No records found` properly for AbsstractControllerFactory2
        this.count = 0;
        this.currentPage = page;
        this.currentServer = {
            data: null
        };
    };
});

