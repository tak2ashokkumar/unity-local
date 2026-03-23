/**
 * Created by rt on 11/1/16.
 */
'use strict';
var rest_app = angular.module('customerAPI');
var app = angular.module('uldb');

rest_app.factory('InfoModalService', [
    '$uibModal',
    'CustomerULDBService2',
    function ($uibModal, ULDBService2) {
        return function (response, $scope, name, field_func, field_list, base_func) {
            var modal = $uibModal.open({
                templateUrl: '/static/rest/app/templates/modal/related.html',
                scope: $scope,
                size: 'lg',
                controller: 'InfoModalController',
                resolve: {
                    additional_fields: function () {
                        return ULDBService2[field_func]().fields(field_list);
                    },
                    results: function () {
                        return response.data;
                    },
                    linkify: function () {
                        return ULDBService2[base_func]().generate_link;
                    },
                    desub: function () {
                        return ULDBService2[base_func]().dereference_sublinks;
                    },
                    header: function () {
                        return name;
                    }
                }
            });
            return modal.result;
        };
    }
]);

rest_app.factory('ServiceFunctionProvider', [
    'CustomerTitleProvider',
    function (TitleProvider) {
        // begin function
        var dereference_subfields = function (obj, field) {
            var arr = field.readArray;
            var result = null;
            if (!(obj.hasOwnProperty(field.name))) {
                return null;
            }
            var curr = obj[field.name];

            for (var i = 0; i < arr.length; i++) {
                if (curr !== null && curr.hasOwnProperty(arr[i])) {
                    curr = curr[arr[i]];
                } else {
                    return null;
                }
            }
            return curr;
        };

        //Fixes HyperLink ID Field reference for sub fields
        var dereference_sub_idField = function (obj, field) {
            if (!(obj.hasOwnProperty(field.name))) {
                return null;
            }

            var curr = obj[field.name];

            if (curr !== null && curr.hasOwnProperty(field.idField)) {
                curr = curr[field.idField];
            } else {
                return obj[field.idField];
            }

            return curr;
        };

        var generate_link = function (obj, field) {
            if (!field.hasOwnProperty('uriPrefix')) {
                console.log("Field is missing uriPrefix");
                console.log(field);
            }
            return {
                // url: field.uriPrefix + obj[field.idField] + '/',
                url: field.uriPrefix + dereference_sub_idField(obj, field) + '/',
                text: dereference_subfields(obj, field)
            };
        };

        var _filter = function (list, iterable) {
            if (list !== undefined && list.length > 0) {
                return iterable.filter(function (e, i, arr) {
                    return (list.indexOf(e.name) !== -1);
                });
            }
            angular.forEach(iterable, function(item,i){
                iterable[i] =  angular.extend(item,{err_msg: item.name +'Msg'});
            });
            console.log('iterable : ', iterable);
            return iterable;
        };

        var gen_fields = function (fields) {
            return function (list) {
                return _filter(list, fields);
            };
        };

        var search = function (api, val) {
            return api.get({ search: val }).$promise.then(function (response) {
                return response.results;
            });
        };

        var default_modal = {
            templateUrl: '/static/rest/app/templates/modal/master_modal.html',
            size: 'md',
            controller: 'MasterModalController'
        };

        var inner_factory = function (obj) {
            if (!(obj.hasOwnProperty('modal'))) {
                obj['modal'] = default_modal;
            }
            if (!(obj.hasOwnProperty('idField'))) {
                console.log("setting idField to id");
                console.log(obj);
                obj['idField'] = 'id';
            }
            return angular.extend(obj, {
                dereference_subfields: dereference_subfields,
                dereference_sub_idField: dereference_sub_idField,
                generate_link: generate_link,
                title: TitleProvider(obj['resource'])
            });
        };

        return {
            dereference_subfields: dereference_subfields,
            dereference_sub_idField: dereference_sub_idField,
            generate_link: generate_link,
            search: search,
            inner_factory: inner_factory,
            gen_fields: gen_fields,
            filter: _filter,
            default_modal: default_modal
        };
    }
]);

rest_app.factory('CustomerTitleProvider', [
    function () {
        var _tgen = function (singular, plural) {
            var _p = plural;
            if (plural === undefined) {
                _p = singular + "s";
            }
            return { singular: singular, plural: _p };
        };
        var titles = {
            'CustomerServer': _tgen('Server'),
            'CustomerVirtualMachine': _tgen('Virtual Machine'),
            'CustomerSwitch': _tgen('Switch', 'Switches'),
            'CustomerFirewall': _tgen('Firewall'),
            'CustomerLoadBalancer': _tgen('Load Balancer'),
            'CustomerHostMonitor': _tgen('Nagios Host Check'),
            'CustomerGraphedPort': _tgen('Monitored Port'),
            'CustomerCabinet': _tgen('Cabinet'),
            'CustomerPDU': _tgen('PDU'),
            'CustomerCage': _tgen('Cage'),
            'CustomerSAN': _tgen('SAN'),
            'CustomerOrganization': _tgen('Organization'),

            'CustomerInvoice': _tgen('Invoice'),
            'CustomerOpenStackInstance': _tgen('OpenStack Instance'),

            'CustomerVcenter': _tgen('vCenter Server'),
            'CustomerEsxi': _tgen('ESXi', 'ESXi'),
            'CustomerOpenstack': _tgen('OpenStack Controller'),
            'CustomerF5LB': _tgen('F5 Load Balancer'),
            'CustomerCisco': _tgen('Cisco Switch', 'Cisco Switches'),
            'CustomerCitrix': _tgen('Citrix NetScaler', 'Citrix NetScaler'),
            'CustomerJuniper': _tgen('Juniper Device'),
        };
        return function (resourceClass) {
            return titles[resourceClass.reflect.resourceName];
        };
    }
]);

rest_app.factory('CustomerFieldProvider', [
    'CustomerServer',
    'Instance',
    // 'Organization',
    //
    // 'Instance',
    // 'UnityIntegrations',
    // 'OrganizationFast',
    function (Server,
              Instance
              // Organization,
              // Instance,
              // UnityIntegrations,
              // OrganizationFast
    ) {
        var uuidField = function (resourceClass) {
            return {
                name: "uuid",
                description: "uuid",
                required: true,
                opaque: 'link',
                readArray: [],
                uriPrefix: '#/' + resourceClass.reflect.uri + '/',
                idField: 'uuid'
            };
        };

        var server_field = {
            name: "server",
            description: "Server",
            required: true,
            opaque: 'link',
            subfield: 'name',
            idField: 'id',
            readArray: ['name'],
            uriPrefix: '#/servers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(Server, val);
                },
                accessor: 'name'
            }
        };


        var search = function (api, val) {
            return api.get({ search: val }).$promise.then(function (response) {
                return response.results;
            });
        };

        var self_name_field = function (resourceClass, optionalName) {
            var _n = 'name';
            if (optionalName !== undefined) {
                _n = optionalName;
            }
            return {
                name: _n,
                description: "Name",
                required: true,
                opaque: 'link',
                subfield: 'name',
                readArray: [],
                uriPrefix: '#/' + resourceClass.reflect.uri + '/',
                idField: 'id'
            };
        };

        var gen_link_field = function (resourceClass, related_name, idField, resourceClassFast, readArray) {
            var _n = resourceClass.reflect.uri;
            var _id = 'id';
            var _search = resourceClass;
            var _readArray = ['name'];

            if (related_name !== undefined) {
                _n = related_name;
            }
            if (idField !== undefined) {
                _id = idField;
            }
            if (resourceClassFast !== undefined) {
                _search = resourceClassFast;
            }
            if (readArray !== undefined && readArray.length !== undefined && readArray.length > 0) {
                _readArray = readArray;
            }
            return {
                name: _n,
                description: resourceClass.reflect.resourceName,
                required: true,
                opaque: 'link',
                subfield: 'name',
                readArray: _readArray,
                uriPrefix: '#/' + resourceClass.reflect.uri + '/',
                idField: _id,
                inputMethod: {
                    type: 'typeahead',
                    invoker: function (val) {
                        return search(_search, val);
                    },
                    accessor: _readArray[0]
                }
            };
        };

        var gen_subattr_field = function (resourceClass, name, desc, readArray) {
            var _name = 'name';
            if (readArray !== undefined && readArray.length !== undefined && readArray.length > 0) {
                _name = readArray[0];
            }
            return {
                name: name,
                description: desc,
                required: true,
                opaque: 'stringTransform',
                readArray: readArray,
                inputMethod: {
                    type: 'typeahead',
                    invoker: function (val) {
                        return search(resourceClass, val);
                    },
                    accessor: _name
                }
            };
        };

        var gen_arbitrary_link = function (name, desc) {
            return function (f) {
                return {
                    name: name,
                    description: desc,
                    required: true,
                    opaque: 'arbitraryLink',
                    readArray: [],
                    func: f
                };
            };
        };

        var gen_readonly_subattr_field = function (name, desc, readArray) {
            var _name = 'name';
            if (readArray !== undefined && readArray.length !== undefined && readArray.length > 0) {
                _name = readArray[0];
            }
            return {
                name: name,
                description: desc,
                required: true,
                opaque: 'stringTransform',
                readArray: readArray
            };
        };

        var choice_field = function (name, desc, choice_array) {
            return {
                name: name,
                description: desc,
                required: true,
                inputMethod: {
                    type: 'choices',
                    choices: choice_array
                }
            };
        };

        var boolean_field = function (name, desc) {
            return choice_field(name, desc, [true, false]);
        };
        // var instance_field = gen_readonly_subattr_field('instance', 'Instance', ['hostname']);
        var instance_field = gen_link_field(Instance, 'instance', 'uuid', Instance);


        return {
            uuidField: uuidField,
            server_field: server_field,
            instance_field: instance_field,
            self_name_field: self_name_field,
            gen_link_field: gen_link_field,
            choice_field: choice_field,
            boolean_field: boolean_field
        };
    }
]);

app.factory('UserOrgLogoService', [
    '$http',
    'RestService',
    function (
              $http,
              RestService) {
        return {
            get_org_logo: function () {
                return RestService.get_data('/customer/organization/get_org_logo/');
            }
        };
    }
]);