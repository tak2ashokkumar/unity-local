var app = angular.module('uldb');
app.controller('DeviceReportsController', [
    '$scope',
    '$routeParams',
    '$location',
    '$uibModal',
    '$http',
    'OrganizationFast',
    '$window',
    '$httpParamSerializer',
    function ($scope, $routeParams, $location, $uibModal, $http, OrganizationFast, $window, $httpParamSerializer) {

        $scope.model = {};
        $scope.model.results = [];
        $scope.loader = false;
        $scope.getOrgs = function (val) {
            return OrganizationFast.query({ 'search': val }).$promise.then(function (response) {
                return response.results;
            });
        };

        $scope.datePicker = {};
        $scope.datePicker.date = {
            startDate: moment().subtract(30, "days"),
            endDate: moment()
        };

        $scope.get_customer_device_count = function () {
            $scope.loader = true;
            $scope.model.results = [];

            var organization_id = null;

            var date_range = $scope.datePicker.date;
            if ($scope.org) {
                organization_id = $scope.org.id;
            }

            var start_date = date_range.startDate.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
            var end_date = date_range.endDate.set({ hour: 23, minute: 59, second: 59, millisecond: 0 });

            var params = {
                'start_date': start_date.format(),
                'end_date': end_date.format(),
                'user_organization': organization_id,
            };
            var serialized_params = $httpParamSerializer(params);
            var url = '/rest/devicereport/get_device_report/?' + serialized_params;
            $scope.downloadUrl = '/rest/devicereport/download/?' + serialized_params;
            $http.get(url).then(function (response) {
                $scope.loader = false;
                $scope.model.results = response.data;
            }).catch(function (error) {
                console.log(error);
                $scope.loader = false;
                $scope.model = {};
                $scope.model.results = [];
            });

        };

        $scope.options = {
            locale: {
                applyClass: 'btn-green',
                applyLabel: "Apply",
                fromLabel: "From",
                format: "DD-MMM-YYYY",
                toLabel: "To",
                cancelLabel: 'Cancel',
                customRangeLabel: 'Custom range',
            },
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    $scope.get_customer_device_count();
                },
            }
        };
    }
]);