'use strict';
var app = angular.module('uldb');

app.factory('OpenstackAdapterAuth', function() {
    var openstack_adapter_id;

    return {
        setAdapter: function(adapter_id) {
            openstack_adapter_id = adapter_id;
        },
        getAdapter: function() {
            return (openstack_adapter_id) ? openstack_adapter_id : false;
        }
    };
});



app.factory('RestService', [
    '$timeout',
    '$http',
    'TaskService',
    'AdminApi',
    'DataFormattingService',
    'AlertService2',
    function(
        $timeout,
        $http,
        TaskService,
        AdminApi,
        DataFormattingService,
        AlertService2) {

        var _post_data = function save_modal_data(params, url) {
            return $http({
                method: "POST",
                url: url,
                data: params
            }).then(function(response) {
                return response;
            }).catch(function(error) {
                return error;
            });
        };

        var _update_data = function save_modal_data(params, url) {
            return $http({
                method: "PUT",
                url: url,
                data: params
            }).then(function(response) {
                return response;
            }).catch(function(error) {
                return error;
            });
        };


        var _retrieve_data = function(path) {
            return $http({
                method: "GET",
                url: path
            }).then(function(result) {
                var obj = {
                    data: null
                };

                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function(celery_response) {
                        if (celery_response.hasOwnProperty('data')) {
                            obj = celery_response.result;
                        } else {
                            obj.data = celery_response.result;
                        }
                    }, function(error) {
                        return error;
                    });
                } else {
                    if (result.hasOwnProperty('data')) {
                        if (result.data.hasOwnProperty('results')) {
                            obj = result.data;
                            obj.data = result.data.results;
                            // console.log(angular.toJson(result));
                        }
                        else{
                            obj = result;
                            obj.data = result.data;
                            // console.log(angular.toJson(result));
                        }
                    } else {
                        obj.data = result;
                    }
                }
                return obj;
            }).catch(function(error) {
                return error;
            });
        };

        var _delete_data = function(path) {
            return $http({
                method: "DELETE",
                url: path
            }).then(function(result) {
                return result;
            }).catch(function(error) {
                return error;
            });
        };

        var _rebuild_data = function(path) {
            return $http({
                method: "POST",
                url: path
            }).then(function(result) {
                return result;
            }).catch(function(error) {
                return error;
            });
        };

        return {

            //Get Requests
            get_data: function(url) {
                return _retrieve_data(url);
            },

            //For Post requests
            send_modal_data: function(params, url) {
                return _post_data(params, url);
            },

            //For Put requests
            update_modal_data: function(params, url) {
                return _update_data(params, url);
            },

            //For Delete Requests
            delete_data: function(url) {
                return _delete_data(url);
            },

            //For Rebuild Requests
            rebuild_data: function(url) {
                return _rebuild_data(url);
            },

            process_response: function(response, load_data, scope){
                if (response.state === "SUCCESS") {
                    if (response.result.hasOwnProperty("error")) {
                        if (load_data){
                            scope.load_data;
                        }
                        AlertService2.danger(response.result.message);
                    } else {
                        if (load_data){
                            scope.load_data;
                        }
                        AlertService2.success(response.result.message);
                    }
                } else {
                    if (load_data){
                        scope.load_data;
                    }
                    AlertService2.danger(response.result.message);
                }
            }
        };
    }
]);
