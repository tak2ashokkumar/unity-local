var app = angular.module('uldb');

app.controller('GenericModal', [
    '$scope',
    '$uibModalInstance',
    'AbstractModalFactory2',
    'obj',
    'resourceClass',
    'array',
    'idField',
    'rows',
    function ($scope, $uibModalInstance, AbstractModalFactory2, obj, resourceClass, array, idField, rows) {
        var modal = new AbstractModalFactory2(resourceClass, array, $uibModalInstance, idField);
        $scope.obj = obj;
        $scope.array = array;
        $scope.rows = rows;
        $scope.add = modal.add;
        $scope.edit = modal.edit;
        $scope.cancel = modal.cancel;
    }
]);


app.controller('AbstractModal', [
    '$scope',
    '$uibModalInstance',
    'AbstractModalFactory',
    'idField',
    function ($scope, $uibModalInstance, AbstractModalFactory, idField) {
        if (idField === undefined) {
            idField = 'name';
        }
        var modal = new AbstractModalFactory($scope.resourceClass, $scope, $uibModalInstance, idField);
        $scope.add = modal.add;
        $scope.edit = modal.edit;
        $scope.cancel = modal.cancel;
    }
]);

app.factory('AbstractControllerFactory', [
    '$uibModal',
    '$http',
    '$location',
    'AlertService2',
    'AbstractModelServiceFactory',
    'DefaultAccess',
    'BreadCrumbService',
    function ($uibModal, $http, $location, AlertService2, AbstractModelServiceFactory,
        DefaultAccess, BreadCrumbService) {
        return function (resourceClass, $scope, idField, path) {
            //var modalInstance;
            $scope.alertService = AlertService2;

            $scope.openSingleton = function (event) {
                // If we filter a list down to exactly one element, press enter to visit the link.
                if (event.which === 13 && $scope.filtered.length === 1) {
                    $location.path(path + $scope.filtered[0].id);
                }
            };

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
            $scope.model = $scope.svc.getModel();
            $scope.modal = {
                templateUrl: 'genericModal.html',
                scope: $scope,
                size: 'md',
                controller: 'AbstractModal',
                resolve: {
                    idField: function () {
                        return idField;
                    }
                }
            };
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
            };

            var add = function () {

                $scope.DescriptionChange = false;

                $scope.obj = {};
                $scope.method = 'Add';
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
                $http.get($scope.selection.selected.url).then(function (response) {
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
                });

                $scope.method = 'Edit';
                var modalInstance = $uibModal.open($scope.modal);
                modalInstance.result.then();
            };

            var remove = function (selection, idx) {
                var objId = selection.id;
                //var resource = new ;
                // console.log("Delete Method ===> "+objId)
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

var searchKey;
var sortKey;
app.factory('AbstractModelServiceFactory', [
    '$http',
    '$q',
    'PaginatedResultsModel',
    function ($http, $q, PaginatedResultsModel) {
        return function (resourceClass, pageSize) {
            var pages = {};
            var count = 0;
            var currentPage = 1;
            // var pageSize = pageSize === undefined ? 10 : pageSize;

            var getSearchKeyObject = function (searchKey, currentPage, pageSize, sortKey) {
                var urlObj = {};
                if (pageSize !== undefined) {
                    if ((sortKey !== undefined) && (sortKey !== null) && (sortKey !== '')) {
                        urlObj.ordering = sortKey;
                    }
                    urlObj.page = currentPage;
                    urlObj.page_size = pageSize;
                    if ((searchKey !== undefined) && (searchKey !== null) && (searchKey !== '')) {
                        urlObj.search = searchKey;
                    }

                }
                return urlObj;
            };

            var loadPage = function (model) {
                return function () {
                    currentPage = model.currentPage;
                    // console.log('currentPage : ', currentPage);
                    if (currentPage in pages) {
                        // return any promise here
                        // not truly necessary because the other condition always runs on first load
                        model.results = pages[currentPage];
                        return $q.resolve(model.results = pages[currentPage]);
                    } else {
                        // return the promise from the resource function
                        var _q = getSearchKeyObject(searchKey, currentPage, pageSize, sortKey);
                        return resourceClass.query(_q).$promise.then(function (response) {
                            if (pageSize !== undefined) {
                                model.count = response.count;
                                pages[currentPage] = response.results;

                                if (currentPage === 1) {
                                    model.results = response.results;
                                    console.log('model count : ', model.count);
                                    console.log('model results length : ', model.results.length);
                                } else {
                                    angular.forEach(response.results, function (resultitem) {
                                        model.results.push(resultitem);
                                    });
                                }
                            } else {
                                if (model.count == 0) {
                                    model.count = response.count;
                                }
                                pages[currentPage] = response.results;
                                model.results = response.results;
                            }

                        });
                    }
                };
            };

            // var loadPage = function (model) {
            //     return function () {
            //         currentPage = model.currentPage;
            //         if (currentPage in pages) {
            //             // return any promise here
            //             // not truly necessary because the other condition always runs on first load
            //             model.results = pages[currentPage];
            //             return $q.resolve(model.results = pages[currentPage]);
            //         } else {
            //             // return the promise from the resource function
            //             var _q;
            //             if (pageSize === undefined) {
            //                 _q = {};
            //             } else {
            //                 _q = {
            //                     page: currentPage,
            //                     page_size: pageSize
            //                 };
            //             }
            //             return resourceClass.query(_q).$promise.then(function (response) {
            //                 if (model.count == 0) {
            //                     model.count = response.count;
            //                 }
            //                 pages[currentPage] = response.results;
            //                 model.results = response.results;
            //             });
            //         }
            //     };
            // };

            var expire = function () {
                // forget all pages?
                pages = {};
            };

            var getModel = function () {
                return new PaginatedResultsModel(count, currentPage, pageSize);
            };

            var loadSearchResults = function (queryResults) {
                expire();

            };

            return {
                loadPage: loadPage,
                getModel: getModel,
                expire: expire,
                pageSize: pageSize
            };
        };
    }
]);

app.factory('AbstractControllerFactory2', [
    '$uibModal',
    '$http',
    '$location',
    'AlertService2',
    'AbstractModelServiceFactory',
    'DefaultAccess',
    'BreadCrumbService',
    function ($uibModal, $http, $location, AlertService2, AbstractModelServiceFactory,
        DefaultAccess, BreadCrumbService) {
        return function ($scope, ULDBServiceClass, configObject) {

            var modal;
            searchKey = '';
            sortKey = '';

            if (ULDBServiceClass.hasOwnProperty('resource')) {
                var resourceClass = ULDBServiceClass.resource;
            } else {
                var resourceClass = ULDBServiceClass;
            }
            if (ULDBServiceClass.hasOwnProperty('idField')) {
                var idField = ULDBServiceClass.idField;
            }
            if (ULDBServiceClass.hasOwnProperty('path')) {
                var path = ULDBServiceClass.path;
            }
            // if deference_subfields and generate_link are presented,
            // bind them to $scope
            if (ULDBServiceClass.hasOwnProperty('dereference_subfields')) {
                $scope.desub = ULDBServiceClass.dereference_subfields;
            }
            if (ULDBServiceClass.hasOwnProperty('generate_link')) {
                $scope.linkify = ULDBServiceClass.generate_link;
            }
            if (ULDBServiceClass.hasOwnProperty('generate_link')) {
                $scope.fields = ULDBServiceClass.fields();
            }
            if (ULDBServiceClass.hasOwnProperty('generate_custom_link')) {
                $scope.custom_linkify = ULDBServiceClass.generate_custom_link;
            }

            //var modalInstance;
            $scope.resourceClass = resourceClass;
            $scope.alertService = AlertService2;

            // override on calling controller

            $scope.openSingleton = function (event) {
                // If we filter a list down to exactly one element, press enter to visit the link.
                if (event.which === 13 && $scope.filtered.length === 1) {
                    $location.path(path + $scope.filtered[0].id);
                }
            };

            if (angular.isDefined($scope.$root)) {
                $scope.$root.bread = BreadCrumbService;
                $scope.bread = $scope.$root.bread;
                $scope.$on('$destroy', function () {
                    if ($scope.breadCrumb !== undefined) {
                        $scope.bread.pushIfTop($scope.breadCrumb, $scope);
                    }
                });
            }

            modal = {
                "templateUrl": "/static/rest/app/templates/modal/master_modal.html",
                "size": "lg",
                "controller": "MasterModalController",
                "scope": "$SCOPE"
            };

            if (modal !== undefined) {
                modal['scope'] = $scope;
            }

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
            };

            $scope.classSelectors = function (result) {
                return { 'success': result === $scope.selection.selected };
            };

            $scope.selectActions = function () {
                return true;
            };

            var paginate = false;
            if (angular.isDefined(configObject)) {
                if (configObject.hasOwnProperty('paginate')) {
                    paginate = configObject['paginate'];
                }
            }

            if (paginate) {
                if (configObject.hasOwnProperty('page_size')) {
                    $scope.pageSize = configObject['page_size'];
                }
            }

            $scope.svc = new AbstractModelServiceFactory($scope.resourceClass, $scope.pageSize);
            $scope.model = $scope.svc.getModel();
            // setTimeout(function() {
            //     console.log('$scope.model  : ', $scope.model);
            // }, 1000);

            $scope.p = ($scope.pageChanged = $scope.svc.loadPage($scope.model))();
            $scope.reloadPage = function () {
                //$scope.model.currentPage = 1;
                $scope.svc.expire();
                $scope.pageChanged();
            };

            $scope.alertMsg = function (response, msg) {
                if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                    var primaryField = ULDBServiceClass.primaryField;
                    var alert_msg = msg + ' "' + response[primaryField] + '"' + ' successfully';
                }
                else {
                    var alert_msg = msg + ' successfully';
                }
                AlertService2.success(alert_msg);
            };

            $scope.getSearchResults = function () {
                $scope.model.currentPage = 1;
                searchKey = $scope.searchKeyword;
                $scope.reloadPage();
            };

            $scope.sort = {
                sortingColumn: '',
                reverse: false
            };

            $scope.getSortingResults = function (sortObj) {
                console.log('scope.sort : ', angular.toJson(sortObj));
                sortKey = sortObj.sortingColumn;
                $scope.getSearchResults();
            };

            var add = function () {
                $scope.obj = {};
                $scope.method = 'Add';
                // console.log('modal : ', angular.toJson(modal));

                var modalInstance = $uibModal.open(modal);
                // console.log("Modal Instance : "+angular.toJson(modalInstance));
                modalInstance.result.then();
            };

            var edit2 = function (selection, idx) {
                $scope.method = 'Edit';
                $scope.original = selection;
                var objId = selection.id;
                var resource = new resourceClass({ id: objId });
                resource.$get().then(function (response) {
                    $scope.obj = JSON.parse(JSON.stringify(response));
                });
                var modalInstance = $uibModal.open(modal);

                modalInstance.result.then();
            };

            var edit = function (selection, idx) {
                $scope.method = 'Edit';
                $scope.original = selection;
                // console.log('selection : ', (selection));
                // console.log('$scope.selection : ', angular.toJson($scope.selection));
                // todo: do we need to .get() here?
                $http.get($scope.selection.selected.url).then(function (response) {
                    $scope.obj = JSON.parse(JSON.stringify(response.data));
                    // console.log('$scope.obj : ', ($scope.obj));
                });
                var modalInstance = $uibModal.open(modal);
                // console.log("modal instansce result :", modalInstance.result);
                modalInstance.result.then();
            };


            $scope.dailog = {
                templateUrl: '/static/rest/app/templates/snippets/confirm_deletion_modal.html',
                scope: $scope,
                size: 'md',
            };


            var dailog_box = function (selection, idx) {
                $scope.selection = selection;
                $scope.idx = idx;
                $scope.delete_confirmation_msg = "Are you sure you want to delete?";
                if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                    var delete_label = ULDBServiceClass.primaryField;
                    $scope.delete_confirmation_msg = 'Are you sure you want to delete ' + $scope.selection[delete_label] + ' ?';
                }
                else if ($scope.selection && $scope.selection.name) {
                    $scope.delete_confirmation_msg = 'Are you sure you want to delete ' + $scope.selection.name + ' ?';
                }
                $scope.confirm_box = $uibModal.open($scope.dailog);
                $scope.confirm_box.result.then();
            };

            var remove = function (selection, idx) {
                var objId = selection[idField];
                //var resource = new ;
                console.log("ID Field :" + objId);
                if (idField === 'uuid') {
                    var resource = new resourceClass({ uuid: objId });
                }
                else {
                    var resource = new resourceClass({ id: objId });
                }
                resource.$delete().then(function (response) {
                    // remove from model list
                    //$scope.model.results.splice(idx, 1);
                    //$scope.model.count--;
                    var delete_msg = "Deleted Successfully";
                    if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                        var delete_label = ULDBServiceClass.primaryField;
                        delete_msg = 'Deleted ' + $scope.selection[delete_label] + ' successfully';
                    }
                    else if ($scope.selection && $scope.selection.name) {
                        delete_msg = 'Deleted ' + $scope.selection.name + ' successfully';
                    }
                    AlertService2.success(delete_msg);
                    $scope.selection.selected = null;
                    $scope.model.currentPage = 1;
                    $scope.reloadPage();
                }).catch(function (error) {
                    var retval = error;
                    if (error.hasOwnProperty('detail')) {
                        retval = error.detail;
                    }
                    else if (error.hasOwnProperty('data')) {
                        if (error.data.hasOwnProperty('detail')) {
                            retval = error.data.detail;
                        }
                    }
                    AlertService2.danger(retval);
                });

                $scope.confirm_box.close();
            };


            var confirm_cancel = function () {
                $scope.confirm_box.dismiss('cancel');
            };

            return {
                add: add,
                edit: edit,
                edit2: edit2,
                remove: remove,
                dailog_box: dailog_box,
                confirm_cancel: confirm_cancel
            };
        };
    }
]);

/*
 Same as above, except it does not require $scope passed to it, allowed multiple to be used in the same page.
 */
app.factory('AbstractControllerFactory3', [
    '$uibModal',
    '$http',
    '$location',
    'AlertService2',
    'AbstractModelServiceFactory',
    'DefaultAccess',
    'BreadCrumbService',
    function ($uibModal,
        $http,
        $location,
        AlertService2,
        AbstractModelServiceFactory,
        DefaultAccess,
        BreadCrumbService) {
        return function (handler, ULDBServiceClass, configObject) {
            var resourceClass = ULDBServiceClass.resource;
            var idField = ULDBServiceClass.idField;
            var path = ULDBServiceClass.path;
            var modal;

            //var modalInstance;
            handler.resourceClass = resourceClass;
            handler.alertService = AlertService2;

            // if deference_subfields and generate_link are presented,
            // bind them to $scope
            if (ULDBServiceClass.hasOwnProperty('dereference_subfields')) {
                handler.desub = ULDBServiceClass.dereference_subfields;
            }
            if (ULDBServiceClass.hasOwnProperty('generate_link')) {
                handler.linkify = ULDBServiceClass.generate_link;
            }

            handler.fields = ULDBServiceClass.fields();  // override on calling controller
            //
            // handler.openSingleton = function (event) {
            //     // If we filter a list down to exactly one element, press enter to visit the link.
            //     if (event.which === 13 && $scope.filtered.length === 1) {
            //         $location.path(path + $scope.filtered[0].id);
            //     }
            // };

            // if (!('pageSize' in $scope)) {
            //     $scope.pageSize = 9000;
            // }
            // $scope.svc = new AbstractModelServiceFactory($scope.resourceClass, $scope.pageSize);
            var paginate = false;
            if (angular.isDefined(configObject)) {
                if (configObject.hasOwnProperty('paginate')) {
                    paginate = configObject['paginate'];
                }

            }
            if (paginate) {
                if (configObject.hasOwnProperty('page_size')) {
                    handler.pageSize = configObject['page_size'];
                }
            }
            handler.svc = new AbstractModelServiceFactory(handler.resourceClass, handler.pageSize);
            handler.model = handler.svc.getModel();

            modal = ULDBServiceClass.modal;
            if (modal !== undefined) {
                // modal['scope'] = handler;

                modal['resolve'] = {
                    ExtraConfig: function () {
                        return {
                            'resourceClass': ULDBServiceClass,
                            'handler': handler
                        };
                    }
                };
            }

            handler.p = (handler.pageChanged = handler.svc.loadPage(handler.model))();
            handler.reloadPage = function () {
                handler.svc.expire();
                handler.pageChanged();
            };

            handler.selection = {
                selected: null,
                index: null
            };

            handler.selectHook = function () {
            };
            handler.unselectHook = function () {
            };

            handler.unselect = function (result, $index) {
                handler.selection.index = null;
                handler.selection.selected = null;
                handler.unselectHook(result, $index);
            };

            handler.select = function (result, $index) {
                if (result === handler.selection.selected) {
                    handler.unselect(result, $index);
                } else {
                    handler.selection.selected = result;
                    handler.selection.index = $index;
                    handler.selectHook(result, $index);
                }
            };

            handler.classSelectors = function (result) {
                return { 'success': result === handler.selection.selected };
            };
            handler.selectActions = function () {
                return true;
            };

            var add = function () {
                handler.obj = {};
                handler.method = 'Add';
                var modalInstance = $uibModal.open(modal);
                modalInstance.result.then();
            };

            var edit = function (selection, idx) {
                // requires url to be a property
                handler.method = 'Edit';
                handler.original = selection;
                handler.qq = $http.get(selection.url).then(function (response) {
                    handler.obj = JSON.parse(JSON.stringify(response.data));
                });
                var modalInstance = $uibModal.open(modal);
                modalInstance.result.then();
            };

            var remove = function (selection, idx) {
                var objId = selection.id;

                // var objId = selection[idField];  // Could not implement because Server(uldbservice) has idField as `name`

                //var resource = new ;
                var resource = new resourceClass({ id: objId });
                resource.$delete().then(function (response) {
                    // remove from model list
                    handler.model.results.splice(idx, 1);
                    var delete_msg = "Deleted Successfully";
                    if (handler.selection.selected.name) {
                        delete_msg = 'Deleted ' + handler.selection.selected.name + ' successfully';
                    }
                    AlertService2.success(delete_msg);
                    // AlertService2.showToast(
                    //     'Deleted ' + handler.selection.selected[idField]
                    // );
                    handler.unselect();
                }).catch(function (error) {
                    var retval = error;
                    if (error.hasOwnProperty('detail')) {
                        retval = error.detail;
                    }
                    else if (error.hasOwnProperty('data')) {
                        if (error.data.hasOwnProperty('detail')) {
                            retval = error.data.detail;
                        }
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

app.factory('AbstractDetailControllerFactory3', [
    '$uibModal',
    '$http',
    '$location',
    'AlertService2',
    'AbstractModelServiceFactory',
    'DefaultAccess',
    'BreadCrumbService',
    function ($uibModal,
        $http,
        $location,
        AlertService2,
        AbstractModelServiceFactory,
        DefaultAccess,
        BreadCrumbService) {
        return function (handler, ULDBServiceClass, configObject) {
            ULDBServiceClass.resource
                .get({ id: configObject.id })
                .$promise
                .then(function (response) {
                    handler.obj = response;
                });
            handler.fields = ULDBServiceClass.fields();

            var modal = ULDBServiceClass.modal;
            if (modal !== undefined) {
                modal['resolve'] = {
                    ExtraConfig: function () {
                        return {
                            'resourceClass': ULDBServiceClass,
                            'handler': handler
                        };
                    }
                };
            }

            var edit = function (selection) {
                // requires url to be a property
                handler.method = 'Edit';
                handler.original = selection;
                handler.qq = $http.get(selection.url).then(function (response) {
                    handler.obj = JSON.parse(JSON.stringify(response.data));
                });
                var modalInstance = $uibModal.open(modal);
                modalInstance.result.then();
            };

            return {
                edit: edit
            };
        };
    }
]);


app.controller('MasterModalController', [
    '$scope',
    '$uibModalInstance',
    '$http',
    'AlertService2',
    function ($scope, $uibModalInstance, $http, AlertService2) {
        // probably a repeat of the generic modal
        // expects $scope.resourceClass to be set
        var resource = $scope.resourceClass;
        if ($scope.method === undefined) {
            $scope.method = 'Edit';
        }

        var upload_logo_file = function (obj, formdata) {
            $http.post(obj.url + 'manage_logo/', formdata,
                {
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                }).then(function (response) {
                    $scope.reloadPage();
                }).catch(function (error) {
                    console.log('error : ', angular.toJson(error));
                });
        };

        $scope.create = function (obj, list) {
            // mangle the object to set some defaults
            // usually customer
            obj = $scope.purge(obj);
            if ($scope.mangle !== undefined) {
                $scope.mangle(obj);
            }
            var newObj = new resource(obj);
            if (angular.isDefined(newObj.email) && (newObj.email !== null)) {
                newObj.email = newObj.email.trim().toLowerCase();
            }
            newObj.$save().then(function (response) {
                if (obj.logo) {
                    var formdata = new FormData();
                    formdata.append('logo', obj.logo);
                    upload_logo_file(response, formdata);
                } else {
                    $scope.reloadPage();
                }
                $uibModalInstance.close();
                $scope.model.currentPage = 1;
                $scope.alertMsg(response, "Added");
            }).catch(function (error) {
                $scope.attach_msg(obj, error);
            });
        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            obj = $scope.purge(obj);

            resource.update(obj).$promise.then(function (response) {
                if (obj.logo) {
                    var formdata = new FormData();
                    formdata.append('logo', obj.logo);
                    upload_logo_file(obj, formdata);
                }
                if (obj.zabbix_customer) {
                    $scope.reloadPage();
                } else {
                    angular.extend($scope.original, response);
                }
                $uibModalInstance.close();
                $scope.alertMsg(response, "Updated");
            }).catch(function (error) {
                // AlertService2.danger(error);
                // $scope.cancel();
                $scope.attach_msg(obj, error);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.wrap = function (obj, list) {
            if ($scope.method === 'Add') {
                return $scope.create(obj, list);
            } else if ($scope.method === 'Edit') {
                return $scope.update(obj);
            }
        };

        $scope.attach_msg = function (obj, error) {
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string')
                angular.forEach(error.data, function (value, key) {
                    obj[key + "Msg"] = value[0];
                });
            return obj;
        };

        $scope.purge = function (obj) {
            // Avoids posting of error msg
            if (!angular.equals({}, obj))
                angular.forEach(obj, function (value, key) {
                    if (key.indexOf('Msg') != -1)
                        delete obj[key];
                });
            return obj;
        };
    }
]);

// same as AbstractModalFactory2, but without $scope manipulation
// instead a generic array is passed
app.factory('AbstractModalFactory2', [
    'AlertService2',
    function (AlertService2) {
        return function (resourceClass, arr, $uibModalInstance, idField) {
            var add = function (obj) {
                var resource = new resourceClass(obj);
                resource.$save().then(function (response) {
                    // push response directly from DRF
                    arr.push(response);
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
                });
                $uibModalInstance.close();
            };
            var edit = function (obj, idx) {

                resourceClass.update(obj).$promise.then(function (response) {

                    arr.splice(idx, 1, response);
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
                });
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

app.factory('AbstractModalFactory', [
    'AlertService2',
    function (AlertService2) {
        return function (resourceClass, $scope, $uibModalInstance, idField) {
            var add = function (obj) {
                var resource = new resourceClass(obj);
                var promise = resource.$save().then(function (response) {
                    // push response directly from DRF
                    $scope.model.results.push(response);
                    if ($scope.component && $scope.component.add !== undefined) {
                        $scope.component.add = false;
                        $scope.FillMotherboard(response.url);
                    }
                    AlertService2.success("Added " + response[idField]);
                }).catch(function (error) {
                    console.log("error:" + JSON.stringify(error));
                    //                    var retval = error;
                    //                    if ("detail" in error) {
                    //                        retval = error.detail;
                    //                    } else if ("data" in error && "detail" in error.data) {
                    //                        retval = error.data.detail;
                    //                    } else if ("data" in error) {
                    //                        retval = error.data;
                    //                    }
                    //                    AlertService2.danger(retval);
                    $scope.attach_msg(obj, error);
                });
                $uibModalInstance.close();
                return promise;
            };
            var edit = function (obj, idx) {
                if (obj.password !== undefined) {
                    obj.password = (obj.password == "" ? undefined : obj.password);
                }
                if (obj.config_password !== undefined) {
                    obj.config_password = (obj.config_password == "" ? undefined : obj.config_password);
                }
                resourceClass.update(obj).$promise.then(function (response) {

                    $scope.model.results.splice(idx, 1, response);
                    // console.log(response[idField]);
                    // console.log(idField);
                    AlertService2.success('Edited ' + response[idField]);
                }).catch(function (error) {
                    var retval = error;
                    if ('detail' in error) {
                        retval = error.detail;
                    } else if ('data' in error && 'detail' in error.data) {
                        retval = error.data.detail;
                    } else if ('data' in error) {
                        retval = error.data;
                    }
                    AlertService2.danger(retval);
                });
                $uibModalInstance.close();
            };
            $scope.attach_msg = function (obj, error) {
                // Attaches Error msg to obj to display validation error
                if (error.hasOwnProperty('data') && typeof error.data !== 'string')
                    angular.forEach(error.data, function (value, key) {
                        obj[key + "Msg"] = value[0];
                    });
                return obj;
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

app.controller('YetAnotherModalController', [
    '$scope',
    '$uibModalInstance',
    'AlertService2',
    'ExtraConfig',
    function ($scope, $uibModalInstance, AlertService2, ExtraConfig) {
        $scope.fields = ExtraConfig.handler.fields;
        $scope.method = ExtraConfig.handler.method;
        var resource = ExtraConfig.resourceClass.resource;

        $scope.obj = {};
        // conditionally handle a bit of async
        if (ExtraConfig.handler.hasOwnProperty('qq')) {
            ExtraConfig.handler.qq.then(function () {
                angular.extend($scope.obj, ExtraConfig.handler.obj);
            });
        }

        $scope.create = function (obj, list) {
            obj = $scope.purge(obj);
            var newObj = new resource(obj);
            newObj.$save().then(function (response) {
                // $scope.model.results.push(response);
                ExtraConfig.handler.model.results.push(response);
                // TODO: update
                $uibModalInstance.close();
            }).catch(function (error) {
                $scope.attach_msg(obj, error);
            });
        };

        $scope.update = function (obj) {
            // obj: a Resource object in JSON
            obj = $scope.purge(obj);
            resource.update(obj).$promise.then(function (response) {
                angular.extend(ExtraConfig.handler.original, response);
                $uibModalInstance.close();
            }).catch(function (error) {
                // AlertService2.danger(error);
                // $scope.cancel();
                $scope.attach_msg(obj, error);
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.wrap = function (obj, list) {
            if ($scope.method === 'Add') {
                return $scope.create(obj, list);
            } else if ($scope.method === 'Edit') {
                return $scope.update(obj);
            }
        };

        $scope.attach_msg = function (obj, error) {
            // Attaches Error msg to obj to display validation error
            if (error.hasOwnProperty('data') && typeof error.data !== 'string') {
                angular.forEach(error.data, function (value, key) {
                    obj[key + "Msg"] = value[0];
                });
                if (error.data.hasOwnProperty('non_field_errors')) {
                    AlertService2.showToast('Error: {non_field_errors}'.fmt(error.data), 10000);
                    $uibModalInstance.dismiss();
                }
                return obj;
            }

        };

        $scope.purge = function (obj) {
            // Avoids posting of error msg
            if (!angular.equals({}, obj))
                angular.forEach(obj, function (value, key) {
                    if (key.indexOf('Msg') != -1)
                        delete obj[key];
                });
            return obj;
        };
    }
]);
