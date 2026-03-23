/**
 * Created by rt on 2/9/17.
 */
var app = angular.module('uldb');

app.factory('FieldFactory', [
    function () {
        return function (name, func) {
            return { name: name, resolve: func };
        };
    }
]);



app.factory('CoreService', [
    function () {
        var fieldFactory = function (name, func) {
            return { name: name, resolve: func };
        };
        var dereference_subfields = function (obj, readArray) {
            var arr = readArray;
            if (!angular.isObject(obj)) {
                return null;
            }
            if (!(obj.hasOwnProperty(arr[0]))) {
                return null;
            }
            var curr = obj[arr[0]];

            if (arr.length > 0) {
                for (var i = 1; i < arr.length; i++) {
                    if (curr !== null && curr.hasOwnProperty(arr[i])) {
                        curr = curr[arr[i]];
                    } else {
                        return null;
                    }
                }
            }
            return curr;
        };

        var dereferenceWrapperFactory = function (readArray) {
            return function (obj) {
                return dereference_subfields(obj, readArray);
            };
        };

        return {
            dereference_subfields: dereference_subfields,
            dereferenceWrapperFactory: dereferenceWrapperFactory,
            fieldFactory: fieldFactory
        };
    }
]);
