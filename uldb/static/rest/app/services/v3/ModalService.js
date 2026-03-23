'use strict';
var app = angular.module('uldb');

app.factory('AbstractControllerFactoryV3', [
    '$uibModal',
    '$http',
    'AlertService2',
    'DefaultAccess',
    'BreadCrumbService',
    function ($uibModal, $http, AlertService2, DefaultAccess, BreadCrumbService) {
        return function (resourceClass, $scope, idField, template_Url) {
            //var modalInstance;
            $scope.alertService = AlertService2;
            var templateUrl = (template_Url == "")? 'genericModal.html' : template_Url;

            /* Code related to listing table
            $scope.$root.bread = BreadCrumbService;
            $scope.bread = $scope.$root.bread;
            $scope.$on('$destroy', function () {
                if ($scope.breadCrumb !== undefined) {
                    $scope.bread.pushIfTop($scope.breadCrumb, $scope);
                }
            });

            if ($scope.$parent === $scope.$root) $scope.$root.title = $scope.title;

            if (!('pageSize' in $scope)) {
                $scope.pageSize = 9000;
            }
            $scope.svc = new AbstractModelServiceFactory($scope.resourceClass, $scope.pageSize);
            $scope.model = $scope.svc.getModel();*/
            $scope.modal = {
                templateUrl: template_Url,
                scope: $scope,
                size: 'md',
                controller: 'AbstractModalV3',
                resolve: {
                    idField: function () {
                        return idField;
                    }
                }
            };
            console.log("Printing modal");
            console.log($scope.modal);
            /* Code for listing table
            $scope.p = ($scope.pageChanged = $scope.svc.loadPage($scope.model))();

            $scope.reloadPage = function () {
                $scope.svc.expire();
                $scope.pageChanged();
            };

            $scope.selection = {
                selected: null,
                index: null
            };

            $scope.selectHook = function () {
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
            };*/

            var add = function () {

                $scope.DescriptionChange = false;

                //$scope.obj = {};
                $scope.method = $scope.row_params.method;
                if ($scope.grouplist && $scope.rolelist) {
                    $scope.grouplist = [];
                    $scope.rolelist = [];
                }
                if ($scope.accesslist) {
                    DefaultAccess.get().$promise.then(function (response) {
                        $scope.obj = { access_lists: response.access_list, password: 'password' };

                    });
                }

                var modalInstance = $uibModal.open($scope.modal);
                modalInstance.result.then();
            };

            var edit = function () {

                $scope.DescriptionChange = false;

                //$scope.obj = JSON.parse(JSON.stringify($scope.selection.selected));
                /*$http.get($scope.selection.selected.url).then(function (response) {
                    $scope.obj = JSON.parse(JSON.stringify(response.data));
                    if ($scope.obj.groups && $scope.obj.roles) {
                        $scope.getGroupssByOrg($scope.obj.org);

                    }

                    if ($scope.obj.password || $scope.obj.switch_model) {
                        $scope.DescriptionChange = true;
                        $scope.obj.password = undefined;
                    }

                    if ($scope.obj.config_password || $scope.obj.switch_model) {
                        $scope.DescriptionChange = true;
                        $scope.obj.config_password = undefined;
                    }
                });*/

                if ( !resourceClass.hasOwnProperty("edit_get")) {
                    $scope.obj = $scope.row_params.rowdata;
                } else {
                    //Rest Call to get edit data
                }

                $scope.method = 'Edit';
                var modalInstance = $uibModal.open($scope.modal);
                modalInstance.result.then();
            };

            var remove = function (selection, idx) {
                var objId = selection.id;
                //var resource = new ;
                var resource = new resourceClass({ id: objId });
                resource.$delete().then(function (response) {
                    // remove from model list
                    $scope.model.results.splice(idx, 1);
                    AlertService2.success(
                        'Deleted ' + $scope.selection.selected[idField]
                    );
                    $scope.selection.selected = null;
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("detail" in error.data) {
                        retval = error.data.detail;
                    }
                    AlertService2.danger(retval);
                });
            };

            return {
                add: add,
                edit: edit,
                remove: remove
            };
        };
    }
]);

app.controller('AbstractModalV3', [
    '$scope',
    '$uibModalInstance',
    'AbstractModalFactoryV3',
    'idField',
    function ($scope, $uibModalInstance, AbstractModalFactoryV3, idField) {
        if (idField === undefined) {
            idField = "name";
        }
        var modal = new AbstractModalFactoryV3($scope.resourceClass, $scope, $uibModalInstance, idField);
        $scope.add = modal.add;
        $scope.edit = modal.edit;
        $scope.cancel = modal.cancel;
    }
]);

app.factory('AbstractModalFactoryV3', [
    'RestService',
    'AlertService2',
    'ValidationService',
    'TaskService',
    function (RestService, AlertService2, ValidationService, TaskService) {
        return function (resourceClass, $scope, $uibModalInstance, idField) {
            var add = function (obj) {
                console.log("Inside AbstractModalFactoryV3");
                console.log(obj);
                /*var resource = new resourceClass(obj);
                var promise = resource.$save().then(function (response) {
                    // push response directly from DRF
                    $scope.model.results.push(response);
                    if ($scope.component && $scope.component.add !== undefined) {
                        $scope.component.add = false;
                        $scope.FillMotherboard(response.url);
                    }
                    AlertService2.success("Added " + response[idField]);
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("data" in error && "detail" in error.data) {
                        retval = error.data.detail;
                    } else if ("data" in error) {
                        retval = error.data;
                    }
                    AlertService2.danger(retval);
                });*/
                var valid = ValidationService.validate_data(obj, $scope.rows);
                console.log("Printing valid");
                console.log(valid);
                if(valid.is_validated) {
                    RestService.send_modal_data(obj,resourceClass.create).then(function (result) {
                        if (result.data.hasOwnProperty("celery_task")){
                            TaskService.processTaskv3(result.data.celery_task.task_id, function (celery_response) {
                                if (celery_response.state == "SUCCESS"){
                                    $scope.callback();
                                    console.log("Celery Response");
                                    console.log(celery_response);
                                    AlertService2.addAlert({msg: celery_response.result.message, severity: 'success'});
                                }
                                else{
                                    $scope.callback();
                                    AlertService2.addAlert({msg: celery_response.result.message, severity: 'danger'});
                                }
                            }, function (error) {
                                AlertService2.addAlert({msg: $scope.default_error_msg, severity: 'danger'});
                            });
                        }
                        else {
                            AlertService2.addAlert({msg: result.data.message, severity: 'success'});
                            $scope.callback();
                        }
                    });
                    $uibModalInstance.close();
                }

            };
            var edit = function (obj, idx) {
                if (obj.password !== undefined) {
                    obj.password = (obj.password == "" ? undefined : obj.password);
                }
                if (obj.config_password !== undefined) {
                    obj.config_password = (obj.config_password == "" ? undefined : obj.config_password);
                }
                AlertService2.success("Demo (Not fully functional)");
                /*resourceClass.update(obj).$promise.then(function (response) {

                    $scope.model.results.splice(idx, 1, response);
                    console.log(response[idField]);
                    console.log(idField);
                    AlertService2.success("Edited " + response[idField]);
                }).catch(function (error) {
                    var retval = error;
                    if ("detail" in error) {
                        retval = error.detail;
                    } else if ("data" in error && "detail" in error.data) {
                        retval = error.data.detail;
                    } else if ("data" in error) {
                        retval = error.data;
                    }
                    AlertService2.danger(retval);
                });*/
                $uibModalInstance.close();
            };
            var cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
            return {
                add: add,
                edit: edit,
                cancel: cancel
            };
        };
    }
]);
