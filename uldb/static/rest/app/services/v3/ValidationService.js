'use strict';
var app = angular.module('uldb');
app.factory('ValidationService', [
    '$timeout',
    '$http',
    function ($timeout,
              $http) {

        var _validate_form = function (params, form_rows) {
            params.is_validated = true;
            angular.forEach(form_rows, function (value, key) {
                if (value.hasOwnProperty("required")) {
                    if (!params.hasOwnProperty(value.name) || params[value.name] == undefined || params[value.name] == '') {
                        params.is_validated = false;
                        params[value.name + "err"] = true;
                        params[value.name + "Msg"] = value.description + " is required";
                    }
                    else {
                        params[value.name + "err"] = false;
                        params[value.name + "Msg"] = "";
                    }
                }
            });
            return params;
        };
        return {
            validate_data: function (params, rows) {
                return _validate_form(params, rows);
            }
        };
    }
]);
