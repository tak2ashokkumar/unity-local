/**
 * Created by rt on 11/13/15.
 */

var app = angular.module('uldb');


app.factory('GraphingService', [
    '$http',
    '$q',
    'TaskService2',
    function ($http, $q, TaskService2) {

        var DEFAULT_HEIGHT = 450;
        var DEFAULT_TICKS = 5;

        var getGraph2 = function (port, val) {
            return $http.get(port.url + 'raw_data/', {params: {scale: val}, cache: false}).then(function (response) {
                if (response.data.cached_result !== undefined) {
                    return $q.resolve(response.data.result.result);
                } else {
                    return TaskService2.processTask(response.data.task_id);
                }
            });
        };

        var getOptions = function (height, _chartType, _ticks) {
            if (height === undefined || height === null) {
                height = DEFAULT_HEIGHT;
            }
            var chartType = 'lineWithFocusChart';
            if (angular.isDefined(_chartType)) {
                chartType = _chartType;
            }
            var ticks = DEFAULT_TICKS;
            if (angular.isDefined(_ticks)) {
                ticks = _ticks;
            }
            var options = {
                chart: {
                    type: chartType,
                    height: height,
                    isArea: function (val) {
                        return val.key !== undefined && val.key != '95th Percentile';
                    },
                    margin: {
                        top: 20,
                        right: 20,
                        bottom: 40,
                        left: 100
                    },
                    x: function (d) {
                        return d[0] * 1000;
                    },
                    y: function (d) {
                        return d[1];
                    },
                    useInteractiveGuideline: true,
                    dispatch: {
                        stateChange: function (e) {
                            //console.log("stateChange");
                        },
                        changeState: function (e) {
                            //console.log("changeState");
                        },
                        tooltipShow: function (e) {
                            //console.log("tooltipShow");
                        },
                        tooltipHide: function (e) {
                            //console.log("tooltipHide");
                        }
                    },
                    xAxis: {
                        //axisLabel: 'Datetime',
                        tickFormat: function (d) {
                            return d3.time.format('%Y-%m-%d %I:%M%p')(new Date(d));
                        },
                        axisLabelDistance: 30,
                        showMaxMin: false,
                        ticks: ticks
                    },

                    yAxis: {
                        axisLabel: 'bits per second (bps)',
                        tickFormat: function (d) {
                            return d3.format('.4s')(d);
                        },
                        axisLabelDistance: 30,
                        showMaxMin: false
                    },
                    x2Axis: {
                        tickFormat: function (d) {
                            return d3.time.format('%Y-%m-%d %I:%M%p')(new Date(d));
                        },
                        axisLabelDistance: 30,
                        showMaxMin: false,
                        ticks: ticks
                    },
                    y2Axis: {
                        //    axisLabel: 'bits per second (bps)',
                        tickFormat: function (d) {
                            return d3.format('.02f')(d);
                        },
                        axisLabelDistance: 30,
                        showMaxMin: false
                    },
                    callback: function (chart) {
                        //console.log("!!! lineChart callback !!!");
                    }
                },
                title: {
                    //enable: true,
                    //text: 'Title for Line Chart'
                }

            };
            return options;
        };

        var processResult = function (result, name) {
            //$scope.debug_graph = result;
            var data = [
                {
                    key: 'Inbound Traffic',
                    color: '#ff7f0e',
                    values: result['inbound_traffic']
                },
                {
                    key: 'Outbound Traffic',
                    //color: '#7777ff',
                    color: '#18bc9c',
                    values: result['outbound_traffic']
                },
                {
                    key: '95th Percentile',
                    color: '#47A3FF',
                    values: result['outbound_traffic'].map(function (e, i, arr) {
                        return [e[0], result['percentile']];
                    })
                }
            ];
            return data;
        };

        return {
            graph: getGraph2,
            getOptions: getOptions,
            processResult: processResult
        };
    }
]);
