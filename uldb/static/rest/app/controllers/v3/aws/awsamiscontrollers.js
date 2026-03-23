var app = angular.module('uldb');
app.controller('AWSAmisController', [
	'$scope',
	'ULDBService2',
	'AbstractControllerFactory2',
	'$uibModal',
	'$http',
	function ($scope, ULDBService2, AbstractControllerFactory2, $uibModal, $http) {
		$http.get('/rest/aws_ami_regions/').then(function (response) {
			$scope.resp = response.data;
			$scope.ctrl = AbstractControllerFactory2($scope, ULDBService2.aws_amis($scope.resp));
		}).catch(function (error) {});
	}
]);