/**
 * Created by rt on 2/21/17.
 */
var app = angular.module('uldb');

app.directive('defaultField', function () {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            item: '='
        },
        link: function (scope, elem, attrs) {
            scope.resultant = scope.field.resolve(scope.item);
        },
        template: '{{ resultant }}'
    };
});

app.directive('linkField', function () {
    return {
        restrict: 'E',
        scope: {
            field: '=',
            item: '='
        },
        link: function (scope, elem, attrs) {
            // console.log(scope.field);
            // console.log(scope.item);
            // console.log(scope.field.resolve(scope.item).href(scope.item));
        },
        template: '<div><a href="{{ field.resolve(item).href(item) }}"'
        + 'target="_blank">{{ field.resolve(item).text(item) }}</a></div>'
    };
});

app.directive('organizationInput', [
    'OrganizationFast',
    'SearchService',
    function (OrganizationFast, SearchService) {
        return {
            restrict: 'E',
            scope: {
                modelContainer: '='
            },
            link: function (scope, elem, attrs) {
                scope.searcher = SearchService(OrganizationFast).search;
            },
            template: '<input class="form-control"'
            + 'ng-model="modelContainer"'
            + 'uib-typeahead="result as result.name for result in searcher($viewValue)"'
            + '>'
        };
    }
]);
