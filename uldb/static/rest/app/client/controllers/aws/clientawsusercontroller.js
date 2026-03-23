var app = angular.module('uldb');
app.controller('CustomerAwsUserController', [
    '$scope',
    '$rootScope',
    'TableHeaders',
    function (
        $scope,
        $rootScope,
        TableHeaders) {

        $scope.aws_userdetails_headers = TableHeaders.aws_userdetails_headers;
        $scope.default_error_msg = "Something went wrong, please try again later.";
        $scope.title = {
            plural: "AWS",
            singular: "AWS"
        };
        console.log('in CustomerAwsUserController');
        if ($scope.$parent === $rootScope) $scope.$root.title = $scope.title;
    }
]);
