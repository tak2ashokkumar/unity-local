/**
 * Created by rt on 11/10/16.
 */
var searchKey;
var sortKey;
var app = angular.module('uldb');
app.factory('AbstractModelServiceFactory', [
    '$http',
    '$q',
    'PaginatedResultsModel',
    function ($http, $q, PaginatedResultsModel) {
        return function (resourceClass, pageSize) {
            var pages = [];
            var count = 0;
            var currentPage = 1;
            // var pageSize = pageSize === undefined ? 10 : pageSize;

            var getSearchKeyObject = function(searchKey,currentPage,pageSize,sortKey){
                var urlObj = {};
                if (pageSize !== undefined) {
                    if((sortKey !== undefined) && (sortKey !== null) && (sortKey !== '')){
                        urlObj.ordering = sortKey;
                    }
                    urlObj.page =  currentPage;
                    urlObj.page_size = pageSize;
                    if((searchKey !== undefined) && (searchKey !== null) && (searchKey !== '')){
                        urlObj.search = searchKey;
                    }
                    
                }
                return urlObj;
            };

            var loadPage = function (model) {
                return function () {
                    currentPage = model.currentPage;
                    console.log('currentPage : ', currentPage);
                    if (currentPage in pages) {
                        // return any promise here
                        // not truly necessary because the other condition always runs on first load
                        model.results = pages[currentPage];
                        return $q.resolve(model.results = pages[currentPage]);
                    } else {
                        // return the promise from the resource function
                        var _q = getSearchKeyObject(searchKey,currentPage,pageSize,sortKey);
                        return resourceClass.query(_q).$promise.then(function (response) {
                            model.count = response.count;
                            pages[currentPage] = response.results;

                            if(currentPage === 1){
                                model.results = response.results;
                                console.log('model count : ', model.count);
                                console.log('model results length : ', model.results.length);
                            }else {
                                // for(var i = 0; i < response.results.length; i++){
                                //     model.results.push(response.results[i]);
                                // }
                                angular.forEach(response.results, function(resultitem){
                                    model.results.push(resultitem);
                                });
                            }
                            
                        });
                    }
                };
            };

            var expire = function () {
                // forget all pages?
                pages = [];
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

            if(!angular.isDefined(ULDBServiceClass)){
                ULDBServiceClass = null;
            }

            var modal;
            searchKey = '';
            sortKey = '';

            if (ULDBServiceClass.hasOwnProperty('resource')) {
                var resourceClass = ULDBServiceClass.resource;
            }else{
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

            modal = {  "templateUrl":"/static/rest/app/templates/modal/master_modal.html",
                       "size":"lg",
                       "controller":"MasterModalController",
                       "scope":"$SCOPE"
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
            // console.log('$scope.model  : ', $scope.model);
            
            $scope.p = ($scope.pageChanged = $scope.svc.loadPage($scope.model))();
            $scope.reloadPage = function () {
                //$scope.model.currentPage = 1;
                $scope.svc.expire();
                $scope.pageChanged();
            };

            $scope.alertMsg = function(response, msg) {
                if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                    var primaryField = ULDBServiceClass.primaryField;
                    var alert_msg = msg + ' "'+response[primaryField]+ '"'+ ' successfully';
                }
                else{
                    var alert_msg = msg + ' successfully';
                }
                AlertService2.success(alert_msg);
            };
           
            $scope.getSearchResults = function(){
                $scope.model.currentPage = 1;
                searchKey = $scope.searchKeyword;
                $scope.reloadPage();
            };

            $scope.sort = {
                sortingColumn: '',
                reverse: false
            };

            $scope.getSortingResults = function(sortObj){
                console.log('scope.sort : ', angular.toJson(sortObj));
                sortKey = sortObj.sortingColumn;
                $scope.getSearchResults();
            };

            var add = function () {
                $scope.obj = {};
                $scope.method = 'Add';
                console.log('modal : ', angular.toJson(modal));
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
                console.log('selection : ', angular.toJson(selection));
                console.log('$scope.selection : ', angular.toJson($scope.selection));
                // todo: do we need to .get() here?
                $http.get($scope.selection.selected.url).then(function (response) {
                    $scope.obj = JSON.parse(JSON.stringify(response.data));
                });
                var modalInstance = $uibModal.open(modal);
                modalInstance.result.then();
            };


            $scope.dailog = {
                templateUrl: '/static/rest/app/templates/snippets/confirm_deletion_modal.html',
                scope: $scope,
                size: 'md',
            };


            var dailog_box= function (selection, idx) {
                $scope.selection = selection;
                $scope.idx = idx;
                $scope.delete_confirmation_msg = "Are you sure you want to delete?";
                if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                    var delete_label = ULDBServiceClass.primaryField;
                    $scope.delete_confirmation_msg = 'Are you sure you want to delete ' + $scope.selection[delete_label] + ' ?';
                }
                else if ($scope.selection && $scope.selection.name){
                    $scope.delete_confirmation_msg = 'Are you sure you want to delete ' + $scope.selection.name + ' ?';
                }
                $scope.confirm_box = $uibModal.open($scope.dailog);
                $scope.confirm_box.result.then();
            };

            var modalSupport = null;
            var showModal = function(template, controller){
                if(modalSupport !== null){
                    modalSupport.dismiss('cancel');
                }
                $scope.loader = false;
                modalSupport = $uibModal.open({
                    templateUrl: template,
                    controller: controller,
                    scope: $scope,
                });

                modalSupport.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };


            var manage_request = function(device_name, device_type, model_name, model_type){
                $scope.device_type = device_type;
                $scope.device_name = device_name;
                $scope.model_name = model_name;
                $scope.model_type = model_type;
                $scope.description = '\n \n ##- Please type your description above this line -##\n'+
                                        "===============\n" +
                                        "Device Type: " + device_type + "\n" +
                                        "Device Name: " + device_name + "\n" +
                                        "Model Type: " + model_type + "\n" +
                                        "Model Name: " + model_name + "\n" +
                                        "===============\n";
                $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

            };

            var remove = function (selection, idx) {
                var objId = selection[idField];
                //var resource = new ;
                var resource = new resourceClass({ uuid: objId });
                resource.$delete().then(function (response) {
                    // remove from model list
                    //$scope.model.results.splice(idx, 1);
                    //$scope.model.count--;
                    var delete_msg = "Deleted Successfully";
                    if (ULDBServiceClass.hasOwnProperty('primaryField')) {
                        var delete_label = ULDBServiceClass.primaryField;
                        delete_msg = 'Deleted ' + $scope.selection[delete_label] + ' successfully';
                    }
                    else if ($scope.selection && $scope.selection.name){
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
                showModal: showModal,
                manage_request: manage_request,
                confirm_cancel: confirm_cancel
            };
        };
    }
]);


app.factory('DeviceManageRequestFactory', [
    '$uibModal',
    function ($uibModal) {
        return function ($scope) {


            var modalSupport = null;
            var showModal = function(template, controller){
                if(modalSupport !== null){
                    modalSupport.dismiss('cancel');
                }
                $scope.loader = false;
                modalSupport = $uibModal.open({
                    templateUrl: template,
                    controller: controller,
                    scope: $scope,
                });

                modalSupport.result.then(function (selectedItem) {
                    $scope.selected = selectedItem;
                }, function () {
                    console.log('Modal dismissed at: ' + new Date());
                });
            };


            var manage_request = function(device_name, device_type, model_name, model_type){
                $scope.device_type = device_type;
                $scope.device_name = device_name;
                $scope.model_name = model_name;
                $scope.model_type = model_type;
                $scope.description =    "Device Type: " + device_type + "\n" + 
                                        "Device Name: " + device_name + "\n" +
                                        "Model Type: " + model_type + "\n" +
                                        "Model Name: " + model_name;

                $scope.ctrl.showModal('static/rest/app/client/templates/manage_request.html', 'ManageRequestController');

            };


            return {
                showModal: showModal,
                manage_request: manage_request,
            };
        };
    }
]);

// I provide a utility class for preloading image objects.
app.factory(
    "preloader",
    function( $q, $rootScope ) {
        // I manage the preloading of image objects. Accepts an array of image URLs.
        function Preloader( imageLocations ) {
            // I am the image SRC values to preload.
            this.imageLocations = imageLocations;
            // As the images load, we'll need to keep track of the load/error
            // counts when announing the progress on the loading.
            this.imageCount = this.imageLocations.length;
            this.loadCount = 0;
            this.errorCount = 0;
            // I am the possible states that the preloader can be in.
            this.states = {
                PENDING: 1,
                LOADING: 2,
                RESOLVED: 3,
                REJECTED: 4
            };
            // I keep track of the current state of the preloader.
            this.state = this.states.PENDING;
            // When loading the images, a promise will be returned to indicate
            // when the loading has completed (and / or progressed).
            this.deferred = $q.defer();
            this.promise = this.deferred.promise;
        }
        // ---
        // STATIC METHODS.
        // ---
        // I reload the given images [Array] and return a promise. The promise
        // will be resolved with the array of image locations.
        Preloader.preloadImages = function( imageLocations ) {
            var preloader = new Preloader( imageLocations );
            return( preloader.load() );
        };
        // ---
        // INSTANCE METHODS.
        // ---
        Preloader.prototype = {
            // Best practice for "instnceof" operator.
            constructor: Preloader,
            // ---
            // PUBLIC METHODS.
            // ---
            // I determine if the preloader has started loading images yet.
            isInitiated: function isInitiated() {
                return( this.state !== this.states.PENDING );
            },
            // I determine if the preloader has failed to load all of the images.
            isRejected: function isRejected() {
                return( this.state === this.states.REJECTED );
            },
            // I determine if the preloader has successfully loaded all of the images.
            isResolved: function isResolved() {
                return( this.state === this.states.RESOLVED );
            },
            // I initiate the preload of the images. Returns a promise.
            load: function load() {
                // If the images are already loading, return the existing promise.
                if ( this.isInitiated() ) {
                    return( this.promise );
                }
                this.state = this.states.LOADING;
                for ( var i = 0 ; i < this.imageCount ; i++ ) {
                    this.loadImageLocation( this.imageLocations[ i ] );
                }
                // Return the deferred promise for the load event.
                return( this.promise );
            },
            // ---
            // PRIVATE METHODS.
            // ---
            // I handle the load-failure of the given image location.
            handleImageError: function handleImageError( imageLocation ) {
                this.errorCount++;
                // If the preload action has already failed, ignore further action.
                if ( this.isRejected() ) {
                    return;
                }
                this.state = this.states.REJECTED;
                this.deferred.reject( imageLocation );
            },
            // I handle the load-success of the given image location.
            handleImageLoad: function handleImageLoad( imageLocation ) {
                this.loadCount++;
                // If the preload action has already failed, ignore further action.
                if ( this.isRejected() ) {
                    return;
                }
                // Notify the progress of the overall deferred. This is different
                // than Resolving the deferred - you can call notify many times
                // before the ultimate resolution (or rejection) of the deferred.
                this.deferred.notify({
                    percent: Math.ceil( this.loadCount / this.imageCount * 100 ),
                    imageLocation: imageLocation
                });
                // If all of the images have loaded, we can resolve the deferred
                // value that we returned to the calling context.
                if ( this.loadCount === this.imageCount ) {
                    this.state = this.states.RESOLVED;
                    this.deferred.resolve( this.imageLocations );
                }
            },
            // I load the given image location and then wire the load / error
            // events back into the preloader instance.
            // --
            // NOTE: The load/error events trigger a $digest.
            loadImageLocation: function loadImageLocation( imageLocation ) {
                var preloader = this;
                // When it comes to creating the image object, it is critical that
                // we bind the event handlers BEFORE we actually set the image
                // source. Failure to do so will prevent the events from proper
                // triggering in some browsers.
                var image = $( new Image() )
                    .load(
                        function( event ) {
                            // Since the load event is asynchronous, we have to
                            // tell AngularJS that something changed.
                            $rootScope.$apply(
                                function() {
                                    preloader.handleImageLoad( event.target.src );
                                    // Clean up object reference to help with the
                                    // garbage collection in the closure.
                                    preloader = image = event = null;
                                }
                            );
                        }
                    )
                    .error(
                        function( event ) {
                            // Since the load event is asynchronous, we have to
                            // tell AngularJS that something changed.
                            $rootScope.$apply(
                                function() {
                                    preloader.handleImageError( event.target.src );
                                    // Clean up object reference to help with the
                                    // garbage collection in the closure.
                                    preloader = image = event = null;
                                }
                            );
                        }
                    )
                    .prop( "src", imageLocation )
                ;
            }
        };
        // Return the factory instance.
        return( Preloader );
    }
);

