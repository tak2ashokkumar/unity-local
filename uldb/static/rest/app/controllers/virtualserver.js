var app = angular.module('uldb');
app.controller('Vmware', [
    '$scope',
    'CustomDataService',
    function ($scope, CustomDataService) {
        $scope.customers_data = CustomDataService.get_aws_customers_data();
        //vmware dashboard data
    }
]);
app.controller('VMwareAdmin', [
    '$scope',
    function ($scope) {
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.test = 'hello';
        $scope.DCheaders = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.DCtabledata = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];
        $scope.Clusterheaders = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.ClusterTabledata = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];


        $scope.headers = ['Customer Name', 'AWS Account Identifier', 'Region', 'Created Date', 'Field I', 'Field J', 'Field K'];
        $scope.selectednamess = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego'];

    }
]);


app.controller('VirtualMachineController', [
    '$scope',
    '$rootScope',
    'VirtualMachine',
    '$http',
    '$location',
    '$uibModal',
    '$window',
    'VirtualServerService',
    'URLService',
    'BreadCrumbService',
    'AbstractControllerFactory2',
    'ULDBService',
    'AbstractControllerFactory3',
    'ULDBService2',
    function ($scope, $rootScope, VirtualMachine, $http, $location, $uibModal,
              $window, VirtualServerService, URLService, BreadCrumbService, AbstractControllerFactory2,
              ULDBService, AbstractControllerFactory3, ULDBService2) {

        // if ($location.$$search.param) {
        //     var alertmsg = $location.$$search.param;
        //     $location.search({});
        //     $scope.alertMsg = alertmsg;
        //     $scope.message = true;
        //     window.locationModified = false;
        // }

        // $scope.closeAlert = function () {
        //     $scope.message = false;
        // };

        // $scope.handler = {
        //     modifiable: true
        // };
        // $scope.config = {
        //     shownFields: ['name', 'num_cores', 'memory_mb', 'capacity_gb', 'ethports', 'hypervisor', 'customer']
        // };
        $scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.virtualMachine());


        // $scope.openSingleton = function (event) {
        //     // If we filter a list down to exactly one element, press enter to visit the link.
        //     if (event.which === 13 && $scope.filtered.length === 1) {
        //         $location.path('/vm/' + $scope.filtered[0].id);
        //     }
        // };

        // $scope.current_system = {
        //     data: null
        // };

        // $scope.current_customer = {
        //     data: null
        // };
    }
]);


app.controller('VServerDeleteAlertModalCtrl', [
    '$scope',
    '$http',
    'VirtualServer',
    '$uibModalInstance',
    '$locationm',
    '$window',
    function ($scope, $http, VirtualServer, $uibModalInstance, $location, $window) {

        $scope.ConfirmDelete = function () {

            if (window.dellist) {

                var dellist = JSON.parse(window.dellist);

                window.dellist = "";
                window.delStatus = "";

                var delsyslist = JSON.parse(window.syslist);

                for (var j = 0; j <= delsyslist.length - 1; j++) {
                    window.delStatus = window.delStatus + " Server " + delsyslist[j] + " deleted";
                }

                for (var i = 0; i <= dellist.length - 1; i++) {

                    $http.delete(dellist[i]).success(function (data, status, headers) {

                        $uibModalInstance.close();
                        $location.path("/virtualservers/").search({ param: window.delStatus });
                    });


                }
            }
        };

        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }
]);

app.controller('DeleteVServerConnectionAlertModalCtrl', [
    '$scope',
    '$http',
    '$uibModalInstance',
    '$location',
    '$window',
    function ($scope, $http, $uibModalInstance, $location, $window) {
        $scope.ConfirmDelete = function () {

            if (window.vserconnectionurl && window.vserconnectionurl != "") {
                window.vserdelStatus = "";
                window.vserdelStatus = window.vserconname + " Connection details deleted";

                $http.delete(window.vserconnectionurl).success(function (data, status, headers) {


                    $uibModalInstance.close();
                    $location.path("/virtualservers/").search({ param: window.vserdelStatus });
                });

                window.vserconnectionurl = "";

            }
        };

        $scope.cancel = function () {
            window.instanceurl = "";
            $uibModalInstance.close();
        };
    }
]);

// services/factory -> state control
app.factory('VirtualServerService', [
    '$http',
    'VirtualMachine',
    'PaginatedResultsModel',
    function ($http, VirtualMachine, PaginatedResultsModel) {

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
                    VirtualMachine.query({ page: currentPage }).$promise.then(function (response) {
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

        // TODO: NEVER DO THIS
        // var selectServer = function (current_system) {
        //     return function (sys) {
        //         $http.get(sys.url + "related_details/").then(function (result) {
        //
        //             current_system.data = result.data;
        //
        //             var detailsview = angular.element(document.querySelector('#detailsview'));
        //             detailsview.removeClass('details').addClass('details_shrink');
        //             $("#custdetailsview").fadeOut(300);
        //             $("#detailsview").fadeOut(300);
        //             $("#detailsview").fadeIn(300);
        //         });
        //     };
        // };
        //
        // var selectCustomer = function (current_customer) {
        //     return function (sys) {
        //         $http.get(sys.url + "get_customer_details/").then(function (result) {
        //
        //             current_customer.data = result.data;
        //
        //             var detailsview = angular.element(document.querySelector('#custdetailsview'));
        //             detailsview.removeClass('details').addClass('details_shrink');
        //             $("#detailsview").fadeOut(300);
        //             $("#custdetailsview").fadeOut(300);
        //             $("#custdetailsview").fadeIn(300);
        //         });
        //     };
        // };

        return {
            model: model,
            loadPage: loadPage,
            currentPage: currentPage,
            // selectServer: selectServer,
            // selectCustomer: selectCustomer
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
    };
});



