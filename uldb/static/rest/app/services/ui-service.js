/**
 * Created by rt on 11/4/16.
 */
var app = angular.module('uldb');

app.factory('UIService', [
    '$rootScope',
    function ($rootScope) {
        var setTitle = function (title) {
            if ($rootScope.hasOwnProperty('title')) {
                $rootScope.title.plural = title;
            } else {
                $rootScope.title = {
                    singular: title,
                    plural: title
                };
            }
        };

        // var

        return {
            setTitle: setTitle
        };
    }
]);


app.factory('SimpleModalService', [
    function () {
        var openSimpleModal = function (config) {

        };
        return {
            openSimpleModal: openSimpleModal
        };
    }
]);
