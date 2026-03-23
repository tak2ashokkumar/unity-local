/**
 * Created by rt on 9/23/15.
 */
var app = angular.module('uldb');

app.factory('HostMonitorService', [
    'TaskService',
    function (TaskService) {
        // let's save each host monitor for each inst?
        var _host_monitors = {};

        return {
            processTask: TaskService.processTask,
            setHostState: function (instance_id, host_state, host_output) {
                if (_host_monitors[instance_id] === undefined) {
                    _host_monitors[instance_id] = {};
                }
                _host_monitors[instance_id].host_state = host_state;
                _host_monitors[instance_id].host_output = host_output;
            },
            getHostState: function (instance_id) {
                return _host_monitors[instance_id];
            },
            setHostServices: function (instance_id, services) {
                if (_host_monitors[instance_id] === undefined) {
                    _host_monitors[instance_id] = {};
                }
                _host_monitors[instance_id].services = services;
                //console.log(_host_monitors);
            },
            getHostServices: function (instance_id) {
                var services = [];
                if (_host_monitors[instance_id] !== undefined) {
                    services = _host_monitors[instance_id].services;
                }
                return services;
            }
        };
    }
]);

app.factory('HostMonitorService2', [
    'TaskService2',
    function (TaskService2) {
        return {
            processTask: TaskService2.processTask
        };
    }
]);
