var app = angular.module('uldb');

app.directive('confirm', [function () {
    return {
        priority: 100,
        restrict: 'A',
        link: {
            pre: function (scope, element, attrs) {
                var msg = attrs.confirm || 'Are you sure?';
                element.bind('click', function (e) {
                    if (!confirm(msg)) {
                        e.stopImmediatePropagation();
                        e.preventDefault();
                    }
                });
            }
        }
    };
}]);

var getDashboardWidget = function (name) {
    return '/static/rest/app/templates/dashboard-items/' + name + '.html';
};

var getSnippet = function (name) {
    return '/static/rest/app/templates/snippets/' + name + '.html';
};

var getVmwareDashboardWidget = function (name) {
    return '/static/rest/app/templates/vmware-dashboard/' + name + '.html';
};

var getCloudPartial = function (name) {
    return '/static/rest/app/templates/cloud/partials/' + name + '.html';
};

app.directive('motherboard', function () {
    return {
        priority: 100,
        restrict: 'C', // A, E, C -> attribute, element, or class
        template: '<pre>{{ model.currentServer.data.motherboard | json }}</pre>'
        //, templateUrl: '/static/app/whatever.html'
    };
});

app.directive('listviewsearch', function () {
    return {
        priority: 100,
        restrict: 'E',
        scope: {
            ngModel: '='
        },
        templateUrl: getSnippet('listviewsearch')
    };
});

app.directive('customerselect', function () {
    return {
        priority: 100,
        restrict: 'E',
        scope: {
            customer: '=',
            func: '&'
        },
        templateUrl: getSnippet('customerselect')
    };
});

app.directive('gettable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            rows: '=',
            addclick: '&'
        },
        templateUrl: getSnippet('gettable'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method) {
                scope.method = method;
                scope.showModal = !scope.showModal;
                scope.obj.method = scope.method;
                console.log(scope.showModal);
                console.log(scope.modeldata);
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
                scope.obj = { "call": scope.heading };
            };
        }
    };
});


app.directive('searchInput', function () {
    return {
        priority: 100,
        restrict: 'AC',
        scope: {
            func: '&'
        },
        template: '<input type="text" class="form-control" model="result[row.name]" ' +
        'placeholder="" uib-typeahead="obj as obj.name for obj in row.render($viewValue)">'
    };
});

app.directive('detailtable', function () {
    return {
        priority: 100,
        restrict: 'E',
        scope: {
            cols: '=',
            result: '='
        },
        templateUrl: getSnippet('detailtable')
    };
});

app.directive('alerts', function () {
    return {
        priority: 100,
        restrict: 'E',
        templateUrl: getSnippet('alert2')
    };
});

app.directive('inheritedtable', function () {
    return {
        priority: 100,
        restrict: 'E',
        scope: {
            cols: '=',
            model: '='
        },
        templateUrl: getSnippet('inheritedtable')
    };
});

app.directive('panelhalf', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@'
        },
        templateUrl: getSnippet('panelhalf')
    };
});

app.directive('breadcrumbs', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getSnippet('breadcrumb')
    };
});

app.directive('card', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '='
        },
        template: '<div class="card"><h3>{{ heading }}</h3><div ng-transclude></div></div>'
    };
});


app.directive('forceNull', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            force_null: '=forceNull'
        },
        link: function (scope, elem, attrs, ctrl) {
            ctrl.$parsers.push(function (viewValue) {
                if (viewValue === "" && scope.force_null !== false) {
                    return null;
                }
                return viewValue;
            });
        }
    };
});

app.directive('salesforceLink', function () {
    return {};
});

app.directive('typeahead', function () {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: {
            obj: '=obj',
            col: '=col'
        },
        // link: function (scope, elem, attrs, ctrl) {
        //     ctrl.$parsers.push(function (viewValue) {
        //         if (viewValue === "" && scope.col.nullify !== false) {
        //             return null;
        //         }
        //         return viewValue;
        //     });
        // },
        template: '<input class="form-control"'
        + ' ng-model="obj[col.name]"'
        + ' uib-typeahead="rel as rel[col.inputMethod.accessor] for rel in col.inputMethod.invoker($viewValue)"'
        + ' force-null="col.nullify">'
    };
});

app.directive('modelResultsProxy', function () {
    /* A table for ULDB results, currently assumes $parentScope */
    return {
        restrict: 'E',
        // scope: {
        //     fields: '=fields',
        //     model: '=model',
        //     selection: '=selection',
        //     classSelectors: '&classSelectors',
        //     selectActions: '&selectActions',
        //     ctrl: '=ctrl',
        //     additional_actions: '=additional_actions'
        // },
        templateUrl: getSnippet('model-results-proxy')
    };
});

app.directive('modelResultsPrivatecloud', function () {
    /* A table for ULDB results, currently assumes $parentScope */
    return {
        restrict: 'E',
        // scope: {
        //     fields: '=fields',
        //     model: '=model',
        //     selection: '=selection',
        //     classSelectors: '&classSelectors',
        //     selectActions: '&selectActions',
        //     ctrl: '=ctrl',
        //     additional_actions: '=additional_actions'
        // },
        templateUrl: getSnippet('model-results-cloud')
    };
});

app.directive('modelResults', function () {
    /* A table for ULDB results, currently assumes $parentScope */
    return {
        restrict: 'E',
        // scope: {
        //     fields: '=fields',
        //     model: '=model',
        //     selection: '=selection',
        //     classSelectors: '&classSelectors',
        //     selectActions: '&selectActions',
        //     ctrl: '=ctrl',
        //     additional_actions: '=additional_actions'
        // },
        templateUrl: getSnippet('model-results')
    };
});

app.directive('modelResultsAdmin', function () {
    /* A table for ULDB results, currently assumes $parentScope */
    return {
        restrict: 'E',
        // scope: {
        //     fields: '=fields',
        //     model: '=model',
        //     selection: '=selection',
        //     classSelectors: '&classSelectors',
        //     selectActions: '&selectActions',
        //     ctrl: '=ctrl',
        //     additional_actions: '=additional_actions'
        // },
        templateUrl: getSnippet('model-results-admin')
    };
});

app.directive('nestedModelResults', function () {
    return {
        restrict: 'E',
        scope: {
            handler: '=handler',
            ctrl: '=ctrl',
            config: '=config'
        },
        link: function (scope, element, attrs) {
            // if the user hasn't passed a filter function, let's add a default one
            if (scope.hasOwnProperty('config')) {
                if (angular.isDefined(scope.config) && !scope.config.hasOwnProperty('filterFunc')) {
                    scope.config.filterFunc = function (fieldList) {
                        return fieldList;
                    };
                }
                // todo: make compatible with filterFunc
                if (angular.isDefined(scope.config) && scope.config.hasOwnProperty('shownFields')) {
                    scope.config.filterFunc = function (fieldList) {
                        return fieldList.filter(function (e) {
                            if (angular.isDefined(e)) {
                                return scope.config.shownFields.indexOf(e.name) !== -1;
                            }
                        });
                    };
                }
            }
        },
        templateUrl: getSnippet('model-results-isolated')
    };
});

app.directive('genericPanel', function () {
    return {
        restrict: 'E',
        transclude: {
            body: 'panelBody',
            footer: 'panelFooter'
        },
        scope: {
            heading: '@heading',
            panelType: '=?panelType',  // <-- the '?' makes it optional
            add: '=add'
        },
        link: function ($scope, elem, attrs) {
            if (!angular.isDefined($scope.panelType)) {
                $scope.panelType = 'default';
            }
            $scope.panelClass = 'panel-' + $scope.panelType;
        },
        template: '<div class="panel panel-primary" ng-class="panelClass">' +
        '<div class="panel-heading">{{heading}}</div>' +
        '<div class="panel-body"><div ng-transclude="body"></div></div>' +
        '<div class="panel-footer"><div ng-transclude="footer"></div></div>' +
        '</div>'
    };
});


app.directive('nagiosHostSummary', [
    'NagiosService',
    function (NagiosService) {
        return {
            restrict: 'E',
            scope: {
                interval: '=interval'
            },
            link: function ($scope, elem, attrs) {
                $scope.options = {
                    chart: {
                        type: 'multiBarChart',
                        height: 450,
                        duration: 500,
                        stacked: true,
                        x: function (d) {
                            return new Date(d.x);
                        },
                        xAxis: {
                            tickFormat: function (d) {
                                return d3.time.format('%Y-%m-%d \n %I:%M%p')(new Date(d));
                            },
                            axisLabelDistance: 50,
                            showMaxMin: false,
                            ticks: 3
                        },
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 45,
                            left: 45
                        },
                        transitionDuration: 500,
                        showLegend: true,
                        showControls: true,
                        useInteractiveGuideline: false,
                        wrapLabels: true,
                        deepWatchData: false
                    },
                    title: {
                        //enable: true,
                        //text: 'Title for Line Chart'
                    }
                };
                // NagiosService.hostHistory().then(function (data) {
                //     $scope.data = data;
                // });
                $scope.$watch('interval', function (newValue, oldValue) {
                    console.log({ time: $scope.interval });
                    NagiosService.hostHistory({ time: $scope.interval }).then(function (data) {
                        $scope.data = data;
                    });
                });
            },
            template: '<nvd3 options="options" data="data"></nvd3>'
        };
    }
]);


app.directive('nagiosServiceSummary', [
    'NagiosService',
    function (NagiosService) {
        return {
            restrict: 'E',
            scope: {
                interval: '=interval'
            },
            link: function ($scope, elem, attrs) {
                $scope.options = {
                    chart: {
                        type: 'multiBarChart',
                        height: 450,
                        duration: 500,
                        stacked: true,
                        x: function (d) {
                            return new Date(d.x);
                        },
                        xAxis: {
                            tickFormat: function (d) {
                                return d3.time.format('%Y-%m-%d \n %I:%M%p')(new Date(d));
                            },
                            axisLabelDistance: 50,
                            showMaxMin: false,
                            ticks: 3
                        },
                        margin: {
                            top: 20,
                            right: 20,
                            bottom: 45,
                            left: 45
                        },
                        transitionDuration: 500,
                        showLegend: true,
                        showControls: true,
                        useInteractiveGuideline: false,
                        wrapLabels: true,
                        deepWatchData: false
                    },
                    title: {
                        //enable: true,
                        //text: 'Title for Line Chart'
                    }
                };
                $scope.$watch('interval', function (newValue, oldValue) {
                    console.log('triggered');
                    console.log({ time: $scope.interval });
                    NagiosService.serviceHistory({ time: $scope.interval }).then(function (data) {
                        $scope.data = data;
                    });
                });
            },
            template: '<nvd3 options="options" data="data"></nvd3>'
        };
    }
]);


app.directive('donut', [
    function () {
        return {
            restrict: 'E',
            scope: {
                data: '=data'
            },
            link: function ($scope, elem, attrs) {
                $scope.options = {
                    chart: {
                        type: 'pieChart',
                        // donut: true,
                        height: 400,
                        x: function (d) {
                            return d.label;
                        },
                        y: function (d) {
                            return parseInt(d.value);
                        },
                        margin: {
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0
                        },
                        showLabels: true,
                        labelThreshold: 0.05,
                        labelType: 'value',
                        transitionDuration: 500,
                        padAngle: 0.0,
                        //donut: true,
                        showLegend: true
                    }
                };
            },
            template: '<nvd3 options="options" data="data"></nvd3>'
        };
    }
]);


app.directive('isolatedTabSet', [
    '$location',
    function ($location) {
        return {
            restrict: 'E',
            // scope: {
            //     tabs: '=tabs',
            //     tab: '=tab'
            // },
            // transclude: true,
            link: function ($scope, elem, attrs) {
                var tab = $scope.tab;
                $scope.activeTab = 0;
                if (tab) {
                    $scope.tabs.forEach(function (e, i, arr) {
                        if (e.name == tab) {
                            $scope.activeTab = i;
                        }
                    });
                }
                $scope.updateTab = function (idx) {
                    $location.search({ t: $scope.tabs[idx].name });
                };
            },
            template: '<uib-tabset active="activeTab" type="pills">'
            + '<uib-tab ng-repeat="tab in tabs" index="$index" heading="{{ tab.name }}" ng-click="updateTab($index)">'
            + '<ng-transclude></ng-transclude>'
            + '</uib-tab>'
            + '</uib-tabset>'
        };
    }
]);


app.directive('observiumGraph', [
    'GraphingService',
    function (GraphingService) {
        return {
            restrict: 'E',
            scope: {
                port: '=port',
                val: '=val',
                chartType: '=chartType',
                ticks: '=ticks'
            },
            link: function ($scope, elem, attrs) {
                $scope.graphHeight = 500;
                $scope.options = GraphingService.getOptions($scope.graphHeight, $scope.chartType, $scope.ticks);
                $scope.data = null;
                $scope.$watchGroup(['port', 'val'], function (newValues, oldValues) {
                    var port = newValues[0];
                    var val = newValues[1];
                    if (port !== null && val !== null) {
                        GraphingService.graph(port, val).then(function (success) {
                            $scope.data = GraphingService.processResult(success);
                        });
                    } else {
                        $scope.data = null;
                    }
                });
            },
            template: '<nvd3 options="options" data="data" ng-if="data !== null"></nvd3>'
        };
    }
]);


app.directive('observiumIntervalPicker', [
    function () {
        return {
            scope: {
                interval: '=interval'
            },
            link: function ($scope, elem, attrs) {
                $scope.interval = 'month';
                $scope.set_interval = function (interval) {
                    $scope.interval = interval;
                };
            },
            template: ''
            + '  <ul class="nav nav-pills nav-stacked">'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'day\'}">'
            + '      <a href="" ng-click="set_interval(\'day\')">Day</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'week\'}">'
            + '      <a href="" ng-click="set_interval(\'week\')">Week</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'month\'}">'
            + '      <a href="" ng-click="set_interval(\'month\')">Month</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'year\'}">'
            + '      <a href="" ng-click="set_interval(\'year\')">Year</a>'
            + '    </li>'
            + '  </ul>'
        };
    }
]);


app.directive('graphControlPanel', [
    'GraphingService',
    function (GraphingService) {
        return {
            scope: {
                subscope: '=',
                ports: '='
            },
            link: function ($scope, elem, attrs) {
                $scope.pageSize = 5;
                $scope.port = null;
                $scope.graph = function (port, val) {
                    $scope.port = port;
                    $scope.interval = val;
                    // GraphingService.graph(port, val).then(function (success) {
                    //     $scope.data = GraphingService.processResult(success);
                    // });
                };
                $scope.data = null;
                $scope.graphHeight = 500;

                $scope.currentName = null;
                $scope.setHeight = function (height) {
                    $scope.options.chart.height = height;
                    if (height < $scope.graphHeight) {
                        $scope.options.chart.type = 'lineChart';
                        $scope.options.chart.xAxis.ticks = 3;
                    }
                };
                $scope.rows = [
                    {
                        name: 'switch_name', description: 'Switch',
                        opaque: true,
                        read: function (result) {
                            return result.switch.name;
                        }
                    },
                    { name: 'interface_name', description: 'Interface' }
                ];
                $scope.selection = {
                    selected: null,
                    index: null
                };
                $scope.interval = 'month';
                $scope.set_interval = function (interval) {
                    $scope.interval = interval;
                    $scope.graph($scope.selection.selected, $scope.interval);
                };
                $scope.selectHook = function (result) {
                    $scope.currentName = result.switch.name + " " + result.interface_name;
                    $scope.graph(result, $scope.interval);
                };

                $scope.unselectHook = function () {
                };
                $scope.unselect = function (result, $index) {
                    $scope.selection.index = null;
                    $scope.selection.selected = null;
                    $scope.unselectHook(result, $index);
                };

                $scope.select = function (result, $index) {
                    if (result === $scope.selection.selected) {
                        $scope.unselect(result, $index);
                    } else {
                        $scope.selection.selected = result;
                        $scope.selection.index = $index;
                        $scope.selectHook(result, $index);
                    }
                };
                $scope.$watch('ports', function (newValue, oldValue) {
                    if (angular.equals(newValue, [])) {
                        $scope.data = null;
                    } else {
                        // $scope.setHeight(490);
                        $scope.select($scope.ports[0], 0);
                    }
                });
                // $scope.p.then(function () {
                //     $scope.setHeight(490);
                //     $scope.select($scope.model.results[0], 0);
                // });
            },
            template: ''
            + '<div class="row">'
            + '<div class="col-sm-8">'
            + '  <h3>{{ currentName }}</h3>'
            + '  <observium-graph port="port" val="interval"></observium-graph>'
            + '</div>'
            + '<div class="col-sm-4">'
            + '  <h4>Interfaces</h4>'
            + '  <table class="table table-hover">'
            + '  <thead>'
            + '  <tr>'
            + '  <th ng-repeat="row in rows">{{ row.description }}</th>'
            + '  </tr>'
            + '  </thead>'
            + '  <tbody>'
            + '  <tr ng-repeat="result in ports"'
            + '      ng-click="select(result, $index)"'
            + '      ng-class="{\'active success\': result === selection.selected}">'
            + '  <td ng-repeat="row in rows">'
            + '  <div ng-if="row.opaque === undefined">{{ result[row.name] }}</div>'
            + '  <div ng-if="row.opaque !== undefined">'
            + '    {{ row.read(result) }}'
            + '  </div>'
            + '  </td>'
            + '  </tr>'
            + '  </tbody>'
            + '  </table>'
            + '  <uib-pagination total-items="model.count" items-per-page="pageSize"'
            + '                  ng-model="model.currentPage" ng-change="pageChanged()"></uib-pagination>'
            + '  <h4>Time Interval</h4>'
            + '  <ul class="nav nav-pills nav-stacked">'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'day\'}">'
            + '      <a href="" ng-click="set_interval(\'day\')">Day</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'week\'}">'
            + '      <a href="" ng-click="set_interval(\'week\')">Week</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'month\'}">'
            + '      <a href="" ng-click="set_interval(\'month\')">Month</a>'
            + '    </li>'
            + '    <li role="presentation" ng-class="{\'active\': interval === \'year\'}">'
            + '      <a href="" ng-click="set_interval(\'year\')">Year</a>'
            + '    </li>'
            + '  </ul>'
            + '</div>'
            + '</div>'
        };
    }
]);

app.directive('uldbField', [
    function () {
        return {
            scope: {
                result: '=result',
                field: '=field'
            },
            link: function ($scope, elem, attrs) {
                if ($scope.field.hasOwnProperty('template')) {
                    $scope.template = $scope.field.template;
                }
            },
            template: '<ng-include src="template"></ng-include>'
        };

    }
]);

app.directive('spinner', [
    function () {
        return {
            template: '<img src="/static/img/v3/loading_icon.gif" class="ajax-loader-block">'
        };
    }
]);

app.directive('loading', ['$http', '$rootScope', '$q', function ($http, $rootScope, $q) {
    // var html = '<img src="/static/img/v3/loading_icon.gif" class="ajax-loader">';
    return {
        restrict: 'E',
        scope: {
            loader: '@',
            object: '@'
        },
        replace: true,
        link: function (scope, element, attrs) {
            $rootScope.routeDeferred = null;
            attrs.$observe('loader', function (loader) {
                if (loader) {
                    if (loader === 'true') {
                        // console.log("Loader===>"+loader);
                        $rootScope.routeDeferred = $q.defer();
                        $rootScope.myPromise = $rootScope.routeDeferred.promise;
                    }
                    else {
                        // console.log("Loader False ==>"+loader);
                        $rootScope.myPromise = null;
                        if ($rootScope.routeDeferred) {
                            $rootScope.routeDeferred.resolve();
                        }
                    }
                }

            });

            attrs.$observe('object', function (object) {
                if (object) {
                    // console.log("object False ==>"+object);
                    $rootScope.myPromise = null;
                    if ($rootScope.routeDeferred) {
                        $rootScope.routeDeferred.resolve();
                    }

                }
                else {
                    // console.log("object===>"+object);
                    $rootScope.routeDeferred = $q.defer();
                    $rootScope.myPromise = $rootScope.routeDeferred.promise;
                }

            });

        }
    };
}]);

app.directive('selectableRow', [
    function () {
        return {
            restrict: 'A',
            transclude: true,
            replace: true,
            scope: {
                func: '&',
                state: '=state'
                // iterable: '=iterable'
            },
            link: function (scope, elem, attrs, ctrl, transclude) {
                scope.vlb = scope.$parent.vlb;
                scope.$index = scope.$parent.$index;
            },
            template: '<tr ng-click="func(vlb, index)"' +
            ' ng-class="{\'success\': $index === state.idx}" ng-transclude></tr>'
        };
    }
]);


app.directive('vlbInfo', [
    function () {
        return {
            restrict: 'E',
            templateUrl: getCloudPartial('vlb-info')
        };
    }
]);


app.directive('basicDropdown', [
    function () {
        return {
            restrict: 'E',
            transclude: true,
            replace: true,
            link: function (scope, elem, attrs, ctrls, transcludeFn) {
                transcludeFn(function (clone) {
                    elem.find('ng-transclude').replaceWith(clone);
                });
            },
            template: '<div class="btn-group">'
            + '<button type="button" class="btn btn-dropdown btn-default" data-toggle="dropdown" aria-haspopup="true"'
            + ' aria-expanded="false">'
            + '<span class="caret"></span>'
            + '</button>'
            + '<ul class="dropdown-menu action-button">'
            + ' <ng-transclude></ng-transclude>'
            + '</ul>'
            + '</div>'
        };
    }
]);

app.directive('cloudProxyLink', [
    function () {
        return {
            restrict: 'E',
            scope: {
                cloud: '='
            },
            replace: true,
            link: function (scope, elem, attrs) {
                scope.proxy_link = function (cloud) {
                    if (angular.isDefined(cloud)) {
                        if (cloud.platform_type === 'VMware') {
                            if (cloud.vcenter_proxy.length > 0) {
                                return cloud.vcenter_proxy;
                            }
                        } else if (cloud.platform_type === 'OpenStack') {
                            if (cloud.openstack_proxy.length > 0) {
                                return cloud.openstack_proxy;
                            }
                        }
                    }
                    return null;
                };
            },
            template: '<a href="{{ proxy_link(cloud)[0].proxy_url }}" target="_blank">{{ proxy_link(cloud)[0].proxy_url }}</a>'
        };
    }
]);

app.directive('cloudManageListItem', [
    function () {
        return {
            restrict: 'E',
            scope: {
                cloud: '=',
                managecloud: '&',
                updateActivity: '&'
            },
            replace: true,
            transclude: true,
            link: function (scope, elem, attrs, ctrls, transcludeFn) {
                scope.manage_request = function (cloud) {
                    console.log("create ticket........");
                    scope.managecloud({ data: cloud });
                };
                scope.update_activity_log = function (cloud, link) {
                    scope.updateActivity({ data: cloud });
                };
            },
            controller: function ($scope, $element) {
                $scope.proxy_link = function (cloud) {
                    if (angular.isDefined(cloud)) {
                        if (cloud.platform_type === 'VMware') {
                            if (cloud.vcenter_proxy.length > 0) {
                                return cloud.vcenter_proxy[0].proxy_fqdn;
                            }
                        } else if (cloud.platform_type === 'OpenStack') {
                            if (cloud.openstack_proxy.length > 0) {
                                return cloud.openstack_proxy[0].proxy_fqdn;
                            }
                        }
                    }
                    return null;
                };

                $scope.proxy_platform_link = function (cloud) {
                    if (angular.isDefined(cloud)) {
                        if (cloud.platform_type === 'VMware') {
                            if (cloud.vcenter_proxy.length > 0) {
                                return "#/vmware-vcenter/"+ cloud.vcenter_proxy[0].uuid + "/";
                            }
                        } else if (cloud.platform_type === 'OpenStack') {
                            if (cloud.openstack_proxy.length > 0) {
                                return "#/openstack-proxy/"+ cloud.openstack_proxy[0].uuid + "/";
                            }
                        }
                    }
                    return null;
                };

                $scope.proxy_notify = function () {
                    alert('Not Manageable !!');
                };
            },
            template: '<div class="action-icons">' +
            '<a ng-if="proxy_link(cloud)" tooltip-class="customClass" uib-tooltip="Manage in Same Tab" class="fa fa-external-link-square blue-text" ng-href="{{ proxy_platform_link(cloud) }}"></a>' +
            '<a ng-if="proxy_link(cloud)" tooltip-class="customClass" uib-tooltip="Manage in New Tab" ng-click="update_activity_log(cloud)" href="{{ proxy_link(cloud) }}" target="_blank" class="fa fa-external-link blue-text"></a>'+
            '<a tooltip-class="customClass" uib-tooltip="Manage by creating support ticket" ng-click="manage_request(cloud)" class="fa fa-ticket blue-text"></a>' +
            '</div>'
        };
    }
]);

app.directive("dynamicName",[function(){
    return {
        restrict:"A",
        require: ['ngModel', '^form'],
        link:function(scope,element,attrs,ctrls){
            ctrls[0].$name = scope.$eval(attrs.dynamicName) || attrs.dynamicName;
            ctrls[1].$addControl(ctrls[0]);
        }
    };
}]);

app.directive('tableSearchWidget', [
    function () {
        return {
            restrict: 'E',
            replace: true,
            template: '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 content-wrapper bg-color top_shadow">' +
                '<div class="col-xs-8 col-sm-8 col-md-8 col-lg-8 search-widget">' +
                    '<form class="navbar-form">' +
                        '<div class="form-group width100">' +
                            '<input class="form-control" type="text" ng-model="searchKeyword" ng-model-options="{debounce: 1000}" id="searchKeyword" placeholder="Enter keyword" ng-change="getSearchResults()">' +
                            '<button class="btn btn-search" type="submit" style="top: 4px;">' +
                               '<i class="fa fa-search"></i>' +
                            '</button>' +
                        '</div>' +
                    '</form>' +
                '</div>' +
                '<div class="col-xs-4 col-sm-4 col-md-4 col-lg-4" ng-class="{' +"'padding_top15px'" + ' : disable_action_btn}">' +
                    '<div class="action-bar pull-right" ng-class="{' + "'table-button'" + ' : !disable_action_btn}">' +
                        '<span class="count">{{ model.count }}</span>' +
                        '<span class="count-text" ng-if="model.count === 1 || model.count === 0"> {{title.singular}}</span>' +
                        '<span class="count-text" ng-if="model.count > 1"> {{title.plural}}</span>' +
                        '<button ng-if="!disable_action_btn" class="btn btn-default" type="button" ng-click="ctrl.add()"> + Add</button>' +
                    '</div>' +
                '</div>' +
            '</div>',
            link:function(scope,element,attrs,ctrls){
                scope.searchKeyword = '';
                console.log('in tableSearchWidget link function with count');
            }
        };
    }
]);

app.directive('pageTitle', [
    function () {
        return {
            restrict: 'AE',
            replace: true,
            template: 
            '<div class="row tabs-level1">' +
                '<div class="col-xs-9 col-sm-9 col-md-9 col-lg-9">' +
                    '<div class="ui-selectee">' +
                        '<nav class="column">' +
                            '<ul class="nav nav-tabs">' +
                                '<span class="ulheading">{{title}}</span>'+
                            '</ul>'+
                        '</nav>' +
                    '</div>' +
                '</div>' +
                '<div class="col-xs-3 col-sm-3 col-md-3 col-lg-3 company-name" style="padding-right: 15px !important;">' +
                    '<a href="" class="no_pointer_events" ng-if="showSettingsIcon"><i class="fa fa-cog" aria-hidden="true"></i></a>'+
                    '<label ng-show="showCheckBox"><input type="checkbox" ng-model="enable_welcome_page" ng-change="changeWelcomePage()"> Show Next Time</label>' + 
                '</div>' +
                '<div class="col-xs-12" id="notificationArea" style="width:100%">'+
                '</div>'+
            '</div>',
            link:function(scope,element,attrs,ctrls){
                scope.title = attrs.title;
                scope.showSettingsIcon = false;
                if(scope.title === 'Dashboard'){
                    scope.showSettingsIcon = true;
                } else if(scope.title === 'Welcome to Unity'){
                    scope.showCheckBox = true;
                }
            }
        };
    }
]);

app.directive('subTitle', [
    function () {
        return {
            restrict: 'AE',
            replace: true,
            scope : {},
            template: 
            '<div class="row">' +
                '<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 subtitleclass">' +
                    '<div class="ui-selectee">' +
                        '<nav class="column">' +
                            '<ul class="nav nav-tabs">' +
                                '<span class="ulsubheading">{{title}}</span>'+
                            '</ul>'+
                        '</nav>' +
                    '</div>' +
                '</div>' +
            '</div>',
            link:function(scope,element,attrs,ctrls){
                scope.title = attrs.title;
            }
        };
    }
]);

app.directive("customSort", function() {
    return {
        restrict: 'A',
        transclude: true,
        template: '<a ng-click="sort_by(order)" style="color: #555555;" ng-class="{no_pointer_events : is_sort_disabled}">' +
            '    <span ng-transclude></span>' +
            '    <i ng-class="selectedCls(order)"></i>' +
            '</a>',
        link: function(scope, elm, attr) {

            scope.order = attr.order;
            scope.is_sort_disabled = attr.sortdisabled;

            scope.sort_by = function(newSortingColumn) {
                if(scope.is_sort_disabled){
                    return;
                }
                
                if (scope.sort.sortingColumn === newSortingColumn) {
                    scope.sort.reverse = !scope.sort.reverse;
                    console.log('scope.sort.reverse : ', scope.sort.reverse);
                }
                scope.sort.sortingColumn = newSortingColumn;
                var sort = {};
                if(scope.sort.reverse){
                    sort.sortingColumn = '-' + newSortingColumn;
                }else{
                    sort.sortingColumn = newSortingColumn;
                }
                scope.getSortingResults(sort);
            };

            scope.selectedCls = function(column) {
                if(scope.is_sort_disabled){
                    return;
                }

                if (column == scope.sort.sortingColumn) {
                    return ('fa fa-' + ((scope.sort.reverse) ? 'sort-desc' : 'sort-asc'));
                } else {
                    return 'fa fa-sort';
                }
            };
        }
    };
});

app.directive('deviceUp', [
    function () {
        return {
            restrict: 'AE',
            replace: true,
            scope : {},
            template:
                '<span><i class="fa fa-arrow-circle-up green"></i> Up</span>',
            link:function(scope,element,attrs,ctrls){
            }
        };
    }
]);

app.directive('deviceDown', [
    function () {
        return {
            restrict: 'AE',
            replace: true,
            scope : {},
            template:
                '<span><i class="fa fa-arrow-circle-down red"></i> Down</span>',
            link:function(scope,element,attrs,ctrls){
            }
        };
    }
]);

app.directive('deviceNotConfigured', [
    function () {
        return {
            restrict: 'AE',
            replace: true,
            scope : {},
            template:
                '<span><i class="fa fa-warning yellow" aria-hidden="true"></i> Not Configured</span>',
            link:function(scope,element,attrs,ctrls){
            }
        };
    }
]);

app.directive('sglclick', ['$parse', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attr) {
          var fn = $parse(attr['sglclick']);
          var delay = 300, clicks = 0, timer = null;
          element.on('click', function (event) {
            clicks++;  //count clicks
            if(clicks === 1) {
              timer = setTimeout(function() {
                scope.$apply(function () {
                    fn(scope, { $event: event });
                }); 
                clicks = 0;  //after action performed, reset counter
              }, delay);
              } else {
                clearTimeout(timer);  //prevent single-click action
                clicks = 0;  //after action performed, reset counter
              }
          });
        }
    };
}]);
