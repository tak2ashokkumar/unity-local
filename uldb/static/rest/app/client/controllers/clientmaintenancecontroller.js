var app = angular.module('uldb');

'use strict';
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
                        if (value.name == 'email') {
                            var validateEmail = function (email) {
                                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                                return re.test(email);
                            };
                            if (validateEmail(params[value.name])) {
                                params[value.name + "err"] = false;
                                params[value.name + "Msg"] = "";
                            } else {
                                params.is_validated = false;
                                params[value.name + "err"] = true;
                                params[value.name + "Msg"] = "Enter a valid email address";
                            }
                        } else {
                            params[value.name + "err"] = false;
                            params[value.name + "Msg"] = "";
                        }
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
    }]);


app.factory('RestService', [
    '$timeout',
    '$http',
    'TaskService',
    'ClientApi',
    'DataFormattingService',
    'AlertService2',
    function ($timeout,
              $http,
              TaskService,
              ClientApi,
              DataFormattingService,
              AlertService2) {

        var _post_data = function save_modal_data(params, url) {
            return $http({
                method: "POST",
                url: url,
                data: params
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return error;
            });
        };

        var _update_data = function save_modal_data(params, url) {
            return $http({
                method: "PUT",
                url: url,
                data: params
            }).then(function (response) {
                return response;
            }).catch(function (error) {
                return error;
            });
        };


        var _retrieve_data = function (path) {
            return $http({
                method: "GET",
                url: path
            }).then(function (result) {
                var obj = {
                    data: null
                };

                if (result.data.hasOwnProperty('celery_task')) {
                    TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                        if (celery_response.hasOwnProperty('data')) {
                            obj = celery_response.result;
                        } else {
                            obj.data = celery_response.result;
                        }
                    }, function (error) {
                        return error;
                    });
                } else {
                    if (result.hasOwnProperty('data')) {
                        if (result.data.hasOwnProperty('results')) {
                            obj = result.data;
                            obj.data = result.data.results;
                            // console.log(angular.toJson(result));
                        }
                        else {
                            obj = result;
                            obj.data = result.data;
                            // console.log(angular.toJson(result));
                        }
                    } else {
                        obj.data = result;
                    }
                }
                return obj;
            }).catch(function (error) {
                return error;
            });
        };

        var _delete_data = function (path) {
            return $http({
                method: "DELETE",
                url: path
            }).then(function (result) {
                return result;
            }).catch(function (error) {
                return error;
            });
        };

        var _rebuild_data = function (path) {
            return $http({
                method: "POST",
                url: path
            }).then(function (result) {
                return result;
            }).catch(function (error) {
                return error;
            });
        };

        return {

            //Get Requests
            get_data: function (url) {
                return _retrieve_data(url);
            },

            //For Post requests
            send_modal_data: function (params, url) {
                return _post_data(params, url);
            },

            //For Put requests
            update_modal_data: function (params, url) {
                return _update_data(params, url);
            },

            //For Delete Requests
            delete_data: function (url) {
                return _delete_data(url);
            },

            //For Rebuild Requests
            rebuild_data: function (url) {
                return _rebuild_data(url);
            },

            process_response: function (response, load_data, scope) {
                if (response.state == "SUCCESS") {
                    if (response.result.hasOwnProperty("error")) {
                        if (load_data) {
                            scope.load_data;
                        }
                        AlertService2.danger(response.result.message);
                    } else {
                        if (load_data) {
                            scope.load_data;
                        }
                        AlertService2.success(response.result.message);
                    }
                } else {
                    if (load_data) {
                        scope.load_data;
                    }
                    AlertService2.danger(response.result.message);
                }
            }
        };
    }
]);


app.controller('ClientMaintenanceController', [
    '$scope',
    '$http',
    '$q',
    '$filter',
    '$rootScope',
    'AlertService2',
    'ClientDashboardService',
    'TableHeaders',
    'CustomerDatacenter',
    'DataFormattingService',
    'MaintenanceService',
    'ValidationService',
    'ClientApi',
    'RestService',
    function ($scope,
              $http,
              $q,
              $filter,
              $rootScope,
              AlertService2,
              ClientDashboardService,
              TableHeaders,
              CustomerDatacenter,
              DataFormattingService,
              MaintenanceService,
              ValidationService,
              ClientApi,
              RestService) {

        $scope.title = {
            singular: 'Maintenance Schedule',
            plural: 'Maintenance Schedule'
        };

        $scope.$root.title = $scope.title;


        $scope.alertService = AlertService2;
        $scope.mschedules_headers = TableHeaders.mschedules_headers;
        $scope.default_error_msg = "Something went wrong, please try again later.";

        var status_list = [
            {short: "F", long: "Future Plan"},
            {short: "O", long: "Ongoing"},
            {short: "C", long: "Completed"}
        ];

        $scope.datacenters = [];
        CustomerDatacenter.query().$promise.then(function (success) {
            angular.forEach(success.results, function (value, key) {
                $scope.datacenters.push({short: value.id, long: value.name});
            });
        }).catch(function (error) {
            console.log(error);
        });

        var get_mschedules_template = function (name) {
            return ClientApi.create_modal.replace(":name", name);
        };
        var status_dict = {
            "C": "Completed",
            "F": "Future Plan",
            "O": "Ongoing"
        };
        var load_dashboard = function load_dashboard() {
            $scope.$on('$destroy', function () {
                $scope.bread.pushIfTop({name: "Maintenance Dashboard", url: '#/maintenance-schedules'}, $scope);
            });
            MaintenanceService.get_mschedules_content_data().then(function (result) {
                angular.forEach(result.data, function (value, key) {
                    if (value.status in status_dict) {
                        value.status = status_dict[value.status];
                    }
                });
                $scope.mschedules_content = result;
                $scope.mschedules_content.actions = [
                    {"name": "Edit", "button": "Edit"},
                    {"name": "Delete", "button": "Delete"},
                    {"name": "Mark As Completed", "button": "Complete"}

                ];

                $scope.mschedules_content_rows = [
                    DataFormattingService.generate_row(["text", "description", "Description", "required"]),
                    DataFormattingService.generate_row(["select", "status", "Status", status_list, "required"]),
                    DataFormattingService.generate_row(["select", "datacenter", "Datacenter", $scope.datacenters, "required"]),
                    DataFormattingService.generate_row(["date", "start_date", "Start Date", "required"]),
                    DataFormattingService.generate_row(["date", "end_date", "End Date", "required"]),

                ];
            });
        };


        load_dashboard();

        $scope.mschedules_add = function (params) {

            var valid = ValidationService.validate_data(params, $scope.mschedules_content_rows);

            if (!valid.is_validated) {
                console.log("Not Validated : " + angular.toJson(valid));
                return valid;
            }
            delete params.is_validated;

            var datacenter = params.datacenter;
            delete params.datacenter;

            var status = params.status;
            delete params.status;


            params.datacenter = datacenter.short;
            params.status = status.short;

            var url = ClientApi.create_mschedules;

            RestService.send_modal_data(params, url).then(function (result) {
                if (result.data.data == "Saved Successfully") {

                    AlertService2.addAlert({msg: "Account Added Successfully", severity: 'success'});
                    $scope.mschedules_content = "";
                    load_dashboard();

                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success": "Added Successfuly"};
            return response_obj;
        };

        $scope.mschedules_edit = function (params) {
            var valid = ValidationService.validate_data(params, $scope.mschedules_content_rows);
            if (!valid.is_validated) {
                return valid;
            }
            delete params.is_validated;

            var datacenter = params.datacenter;
            delete params.datacenter;

            var status = params.status;
            delete params.status;

            params.datacenter = datacenter.short;
            params.status = status.short;

            var url = ClientApi.edit_mschedules.replace(":schedule_id", params.id);

            RestService.update_modal_data(params, url).then(function (result) {
                if (result.data.data == "Saved Successfully") {

                    AlertService2.addAlert({msg: "Account updated Successfully", severity: 'success'});
                    $scope.mschedules_content = "";
                    load_dashboard();

                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success": "Updated Successfuly"};
            return response_obj;
        };

        $scope.mschedules_delete = function (params) {

            var url = ClientApi.delete_mschedules.replace(":schedule_id", params.id);

            RestService.delete_data(url).then(function (result) {

                if (result.data.data == "Deleted Successfully") {

                    AlertService2.addAlert({msg: "Account updated Successfully", severity: 'success'});
                    $scope.mschedules_content = "";
                    load_dashboard();

                }
                else {

                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success": "Updated Successfuly"};
            return response_obj;
        };
        $scope.mschedules_complete = function (params) {
            var url = ClientApi.mark_as_completed_mschedules.replace(":schedule_id", params.id);
            RestService.update_modal_data(params, url).then(function (result) {
                if (result.data.data == "Deleted Successfully") {
                    AlertService2.addAlert({msg: "Account updated Successfully", severity: 'success'});
                    $scope.mschedules_content = "";
                    load_dashboard();
                }
                else {
                    load_dashboard();
                    AlertService2.addAlert({msg: result.data[0], severity: 'danger'});
                }
            });
            var response_obj = {"success": "Updated Successfuly"};
            return response_obj;
        };


        $scope.mschedules_content_modeldata = {
            "title": "Add Maintenance Schedules",
            "page": "/static/rest/app/templates/v3/schedules/schedules_create.html"
        };

        $scope.mschedules_delete_modal = {
            "title": "Delete Maintenance Schedules",
            "alertMsg": "Are you Sure you want to delete?"
        };

    }
]);

// app.controller('ClientMaintenanceController', [
//     '$scope',
//     '$routeParams',
//     '$location',
//     'CustomerMaintenance',
//     'AlertService2',
//     'AbstractControllerFactory2',
//     function ($scope, $routeParams, $location, CustomerMaintenance, AlertService2, AbstractControllerFactory2) {
//         $scope.resourceClass = CustomerMaintenance;
//         $scope.breadCrumb = { name: "Customer Maintenance Schedules", url: "#/maintenance-schedules" };
//         $scope.title = {
//             plural: "Maintenance Schedules",
//             singular: "Maintenance Schedule"
//         };
//         $scope.ctrl = new AbstractControllerFactory2($scope.resourceClass, $scope, "name");
//         $scope.p.then(function () {
//             $scope.loaded = true;
//         });
//         $scope.rows = [
//             {
//                 name: "datacenter", description: "Datacenter", required: true,
//                 // opaque: 'link',
//                 opaque: 'string',
//                 read: function (result) {
//                     return {
//                         url: '#/datacenter/' + result.datacenter.id,
//                         innerText: result.datacenter.name
//                     }
//                 }
//             },
//             { name: "description", description: "Description", required: true },
//             { name: "status", description: "Status", required: true },
//             { name: "start_date", description: "Start Date", required: true },
//             { name: "end_date", description: "End Date", required: true },
//         ];

//     }
// ]);
