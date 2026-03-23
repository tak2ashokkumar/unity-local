
var app = angular.module('uldb');
app.factory('NovaService', [
    '$http',
    'RestService',
    function(
        $http,
        RestService) {
            return {
                get_nova_data: function (url) {
                    return RestService.get_data(url);
                },
            };
    }
]);
