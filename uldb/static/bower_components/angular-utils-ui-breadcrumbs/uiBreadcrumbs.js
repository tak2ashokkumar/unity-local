/**
 * uiBreadcrumbs automatic breadcrumbs directive for AngularJS & Angular ui-router.
 *
 * https://github.com/michaelbromley/angularUtils/tree/master/src/directives/uiBreadcrumbs
 *
 * Copyright 2014 Michael Bromley <michael@michaelbromley.co.uk>
 */


(function() {

    /**
     * Config
     */
    var moduleName = 'angularUtils.directives.uiBreadcrumbs';
    var templateUrl = 'directives/uiBreadcrumbs/uiBreadcrumbs.tpl.html';

    /**
     * Module
     */
    var module;
    try {
        module = angular.module(moduleName);
    } catch(err) {
        // named module does not exist, so create one
        module = angular.module(moduleName, ['ui.router']);
    }

    module.directive('uiBreadcrumbs', ['$interpolate','$transitions', '$state', '$rootScope', function($interpolate, $transitions, $state, $rootScope) {
            return {
                restrict: 'E',
                templateUrl: function(elem, attrs) {
                    return attrs.templateUrl || templateUrl;
                },
                scope: {
                    displaynameProperty: '@',
                    abstractProxyProperty: '@?'
                },
                link: function(scope) {
                    scope.breadcrumbs = [];
                    if ($state.$current.name !== '') {
                        updateBreadcrumbsArray();
                    }
                    $transitions.onSuccess({}, function($transitions) {
                        updateBreadcrumbsArray();
                    });
                    /**
                     * Start with the current state and traverse up the path to build the
                     * array of breadcrumbs that can be used in an ng-repeat in the template.
                     */
                    function updateBreadcrumbsArray() {
                        var workingState;
                        var displayName;
                        var breadcrumbs = [];
                        var currentState = $state.$current;

                        while(currentState && currentState.name !== '') {
                            workingState = getWorkingState(currentState);
                            if (workingState) {

                                var getPrivateCloudlink = function(stateObject){
                                    var statenamelist = stateObject.name.split('.');
                                    var level = statenamelist.length;
                                    switch(level) {
                                        case 1 : 
                                            return  $rootScope.selectedSubMenuItem.href;
                                        case 2 : 
                                            for(var i = 0; i < $rootScope.selectedSubMenuItem.submenu.length; i++){
                                                if(($rootScope.selectedSubMenuItem.submenu[i].name.toLowerCase()).split(' ').join('') === statenamelist[level-1]){
                                                    return $rootScope.selectedSubMenuItem.submenu[i].href
                                                }
                                            }
                                            break;
                                        case 3 : 
                                            for(var i = 0; i < $rootScope.selectedSubMenuItem.submenu.length; i++){
                                                if($rootScope.selectedSubMenuItem.submenu[i].name === statenamelist[level-2]){
                                                    for(var j = 0; j < $rootScope.selectedSubMenuItem.submenu[i].submenu.length; j++){
                                                        if($rootScope.selectedSubMenuItem.submenu[i].submenu[j].uuid === (statenamelist[level-1] + 's')){
                                                            return $rootScope.selectedSubMenuItem.submenu[i].submenu[j].href
                                                        }
                                                    }
                                                }
                                            }
                                            return stateObject.data.href;
                                            break;
                                        default :
                                            return stateObject.data.href;
                                    };
                                };

                                var getBreadcrumbObject = function(stateObj){
                                    var  obj = {};
                                    obj.displayName =  getDisplayName(stateObj);
                                    obj.route = stateObj.name;
                                    if(stateObj.name.match(/private_cloud/) !== null){
                                        obj.link = getPrivateCloudlink(stateObj);
                                    }else{
                                        obj.link  = stateObj.data.href;
                                    }
                                    obj.index = stateObj.data.index;
                                    obj.index1 = stateObj.data.index1;
                                    if (obj.displayName && !stateAlreadyInBreadcrumbs(stateObj, breadcrumbs)) {
                                        breadcrumbs.push(obj);
                                    }
                                };

                                var getMenuBreadcrumbObject = function(stateObj){
                                    if(stateObj.data.mainMenuItem){
                                        var  obj = {};
                                        obj.displayName =  stateObj.data.mainMenuItem;
                                        obj.route = stateObj.data.mainMenuItem;
                                        obj.name = stateObj.data.mainMenuItem;
                                        obj.disabled  = true;
                                        if (!stateAlreadyInBreadcrumbs(obj, breadcrumbs)) {
                                            breadcrumbs.push(obj);
                                        }
                                    }
                                };

                                getBreadcrumbObject(workingState);
                                if((workingState.parent !== null) && (workingState.parent.name !== '')){
                                    getBreadcrumbObject(workingState.parent);
                                    if((workingState.parent.parent !== null) && (workingState.parent.parent.name !== '')){
                                        getBreadcrumbObject(workingState.parent.parent);
                                        var pstate_arr = workingState.parent.parent.name.split('.');
                                        if(pstate_arr.length > 1){
                                            getBreadcrumbObject(workingState.parent.parent.parent);
                                        }
                                        // getBreadcrumbObject(workingState.parent.parent);
                                        getMenuBreadcrumbObject(workingState.parent.parent);
                                    }else{
                                        getMenuBreadcrumbObject(workingState.parent);
                                    }
                                }else{
                                    getMenuBreadcrumbObject(workingState);
                                }
                            }
                            currentState = currentState.parent;
                        }
                        breadcrumbs.reverse();
                        // scope.breadcrumbs = angular.copy(breadcrumbs);
                        $rootScope.breadCrumbArray = angular.copy(breadcrumbs);
                    }

                    /**
                     * Get the state to put in the breadcrumbs array, taking into account that if the current state is abstract,
                     * we need to either substitute it with the state named in the `scope.abstractProxyProperty` property, or
                     * set it to `false` which means this breadcrumb level will be skipped entirely.
                     * @param currentState
                     * @returns {*}
                     */
                    function getWorkingState(currentState) {
                        var proxyStateName;
                        var workingState = currentState;
                        if (currentState.abstract === true) {
                            if (typeof scope.abstractProxyProperty !== 'undefined') {
                                proxyStateName = getObjectValue(scope.abstractProxyProperty, currentState);
                                if (proxyStateName) {
                                    workingState = angular.copy($state.get(proxyStateName));
                                    if (workingState) {
                                        workingState.locals = currentState.locals;
                                    }
                                } else {
                                    workingState = false;
                                }
                            } else {
                                workingState = false;
                            }
                        }
                        return workingState;
                    }

                    /**
                     * Resolve the displayName of the specified state. Take the property specified by the `displayname-property`
                     * attribute and look up the corresponding property on the state's config object. The specified string can be interpolated against any resolved
                     * properties on the state config object, by using the usual {{ }} syntax.
                     * @param currentState
                     * @returns {*}
                     */
                    function getDisplayName(currentState) {
                        var interpolationContext;
                        var propertyReference;
                        var displayName;

                        if (!scope.displaynameProperty) {
                            // if the displayname-property attribute was not specified, default to the state's name
                            return currentState.name;
                        }
                        propertyReference = getObjectValue(scope.displaynameProperty, currentState);

                        if (propertyReference === false) {
                            return false;
                        } else if (typeof propertyReference === 'undefined') {
                            return currentState.name;
                        } else {
                            // use the $interpolate service to handle any bindings in the propertyReference string.
                            interpolationContext =  (typeof currentState.locals !== 'undefined') ? currentState.locals.globals : currentState;
                            displayName = $interpolate(propertyReference)(interpolationContext);
                            return displayName;
                        }
                    }

                    /**
                     * Given a string of the type 'object.property.property', traverse the given context (eg the current $state object) and return the
                     * value found at that path.
                     *
                     * @param objectPath
                     * @param context
                     * @returns {*}
                     */
                    function getObjectValue(objectPath, context) {
                        var i;
                        var propertyArray = objectPath.split('.');
                        var propertyReference = context;

                        for (i = 0; i < propertyArray.length; i ++) {
                            if (angular.isDefined(propertyReference[propertyArray[i]])) {
                                propertyReference = propertyReference[propertyArray[i]];
                            } else {
                                // if the specified property was not found, default to the state's name
                                return undefined;
                            }
                        }
                        return propertyReference;
                    }

                    /**
                     * Check whether the current `state` has already appeared in the current breadcrumbs array. This check is necessary
                     * when using abstract states that might specify a proxy that is already there in the breadcrumbs.
                     * @param state
                     * @param breadcrumbs
                     * @returns {boolean}
                     */
                    function stateAlreadyInBreadcrumbs(state, breadcrumbs) {
                        var i;
                        var alreadyUsed = false;
                        for(i = 0; i < breadcrumbs.length; i++) {
                            if (breadcrumbs[i].route === state.name) {
                                alreadyUsed = true;
                            }
                        }
                        return alreadyUsed;
                    }

                    scope.getActiveTab = function(breadcrumb){
                        $rootScope.getActiveTabSelection(breadcrumb);
                    }

                    $rootScope.$watch('breadCrumbArray', function (newValue, oldValue) {
                        scope.breadcrumbs = $rootScope.breadCrumbArray;
                    }, true)
                }
            };
        }]);
})();
