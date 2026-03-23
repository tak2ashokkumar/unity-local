/**
 * Created by rt on 11/1/16.
 */
'use strict';
var rest_app = angular.module('uldbapi');

rest_app.factory('InfoModalService', [
    '$uibModal',
    'ULDBService2',
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
                    custom_linkify: function () {
                        return ULDBService2[base_func]().generate_custom_link;
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
    'TitleProvider',
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
            if (angular.isObject(curr)) {
                curr = curr.name;
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
                console.log('Field is missing uriPrefix');
                console.log(field);
            }
            return {
                // url: field.uriPrefix + obj[field.idField] + '/',
                // url: field.uriPrefix + obj[field.name][field.idField] + '/',
                url: field.uriPrefix + dereference_sub_idField(obj, field) + '/',
                text: dereference_subfields(obj, field)
            };
        };

        var generate_custom_link = function (obj, field) {
            if (!field.hasOwnProperty('uriPrefix')) {
                console.log('Field is missing uriPrefix');
                console.log(field);
            }
            return {
                // For generating links with different URI prefix and id/uuid without invoker method
                url: field.uriPrefix + obj[field.idField] + '/',
                text: obj[field.name]
            };
        };

        var _filter = function (list, iterable) {
            if (list !== undefined && list.length > 0) {
                return iterable.filter(function (e, i, arr) {
                    return (list.indexOf(e.name) !== -1);
                });
            }
            // $(iterable).each(function(i,item){
            //     iterable[i] =  $.extend(item,{err_msg: item.name +"Msg"});
            // });
            angular.forEach(iterable, function (item, i) {
                iterable[i] = angular.extend(item, { err_msg: item.name + 'Msg' });
            });
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

        var custom_search = function (api, val, field, field_val) {
            var args = { search: val };
            args[field] = field_val;
            return api.get(args).$promise.then(function (response) {
                return response.results;
            });
        };

        var search_zabbix_instance = function (api, val) {
            return api.get({ search: val }).$promise.then(function (response) {
                var results = [];
                for (var i = 0; i < response.results.length; i++) {
                    var obj = {};
                    var obj = Object.assign({}, response.results[i]);
                    obj.customer_zabbix_name = obj.customer.name + ' - ' + obj.zabbix_instance.account_name;
                    results.push(obj);
                }
                return results;
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
                obj['idField'] = 'id';
            }
            return angular.extend(obj, {
                dereference_subfields: dereference_subfields,
                dereference_sub_idField: dereference_sub_idField,
                generate_link: generate_link,
                generate_custom_link: generate_custom_link,
                title: TitleProvider(obj['resource'])
            });
        };

        return {
            dereference_subfields: dereference_subfields,
            dereference_sub_idField: dereference_sub_idField,
            generate_link: generate_link,
            generate_custom_link: generate_custom_link,
            search: search,
            custom_search: custom_search,
            inner_factory: inner_factory,
            gen_fields: gen_fields,
            filter: _filter,
            default_modal: default_modal,
            search_zabbix_instance: search_zabbix_instance
        };
    }
]);

rest_app.factory('TitleProvider', [
    function () {
        var _tgen = function (singular, plural) {
            var _p = plural;
            if (plural === undefined) {
                _p = singular + 's';
            }
            return { singular: singular, plural: _p };
        };
        var titles = {
            'Manufacturer': _tgen('Manufacturer'),
            'ServerManufacturer': _tgen('Server Manufacturer'),
            'Organization': _tgen('Organization'),
            'User': _tgen('User'),
            'Server': _tgen('Server'),
            'Virtual Machine': _tgen('Virtual Machine'),
            'Switch': _tgen('Switch', 'Switches'),
            'Firewall': _tgen('Firewall'),
            'LoadBalancer': _tgen('Load Balancer'),
            'VirtualLoadBalancer': _tgen('Virtual Load Balancer'),
            'CPU': _tgen('CPU'),
            'CPUType': _tgen('CPU Model'),
            'Memory': _tgen('Memory', 'Memory'),
            'MemoryType': _tgen('Memory Model'),
            'PublicIPv4Assignment': _tgen('Public IPv4 Assignment'),
            'DiskType': _tgen('Disk Type'),
            'NICType': _tgen('NIC Type'),
            'IPMIModel': _tgen('IPMI Model'),
            'MotherboardModel': _tgen('Motherboard Model'),
            'SwitchModel': _tgen('Switch Model'),
            'LoadBalancerModel': _tgen('Load Balancer Model'),
            'FirewallModel': _tgen('Firewall Model'),
            'PDUModel': _tgen('PDU Model'),
            'TerminalServerModel': _tgen('Terminal Server Model'),
            'DataCenter': _tgen('Data Center'),
            'OpenStackInstance': _tgen('OpenStack Instance'),
            'HostMonitor': _tgen('Nagios Host'),
            'OrganizationHostMonitor': _tgen('Nagios Host'),
            'GraphedPort': _tgen('Graphed Port'),
            'ObserviumHost': _tgen('Observium Host'),
            'TransitPort': _tgen('Transit Port'),
            'ServiceContract': _tgen('Service Contract'),
            'SalesforceOpportunity': _tgen('Opportunity', 'Opportunities'),
            'Invoice': _tgen('Invoice', 'Invoices')
        };
        return function (resourceClass) {
            return titles[resourceClass.reflect.resourceName];
        };
    }
]);

rest_app.factory('FieldProvider', [
    '$compile',
    'Location',
    'Manufacturer',
    'ServerManufacturer',
    'MobileDeviceManufacturer',
    'StorageManufacturer',
    'PDUManufacturer',
    'ServerFast',
    'Motherboard',
    'Organization',
    'DiskControllerTypes',
    'CPUSocketType',
    'NICType',
    'IPMIModel',
    'Instance',
    'OS',
    'Cabinet',
    'CabinetFast',
    'UnityIntegrations',
    'OrganizationFast',
    'ZabbixInstance',
    'InstanceFast',
    function ($compile,
        Location,
        Manufacturer,
        ServerManufacturer,
        MobileDeviceManufacturer,
        StorageManufacturer,
        PDUManufacturer,
        ServerFast,
        Motherboard,
        Organization,
        DiskControllerTypes,
        CPUSocketType,
        NICType,
        IPMIModel,
        Instance,
        OS,
        Cabinet,
        CabinetFast,
        UnityIntegrations,
        OrganizationFast,
        ZabbixInstance,
        InstanceFast) {

        var uuidField = function (resourceClass) {
            return {
                name: 'uuid',
                description: 'uuid',
                required: true,
                opaque: 'link',
                readArray: [],
                uriPrefix: '#/' + resourceClass.reflect.uri + '/',
                idField: 'uuid'
            };
        };

        var manufacturer_field = {
            name: 'manufacturer',
            description: 'Manufacturer',
            required: true,
            // opaque: 'link',
            opaque: 'stringTransform',
            idField: 'id',
            subfield: 'name',
            readArray: ['name'],
            uriPrefix: '#/manufacturers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(Manufacturer, val);
                },
                accessor: 'name'
            }
        };

        var server_manufacturer_field = {
            name: 'manufacturer',
            description: 'Manufacturer',
            required: true,
            // opaque: 'link',
            opaque: 'stringTransform',
            idField: 'id',
            subfield: 'name',
            readArray: ['name'],
            uriPrefix: '#/server_manufacturers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(ServerManufacturer, val);
                },
                accessor: 'name'
            }
        };

        var storage_manufacturer_field = {
            name: 'manufacturer',
            description: 'Manufacturer',
            required: true,
            // opaque: 'link',
            opaque: 'stringTransform',
            idField: 'id',
            subfield: 'name',
            readArray: ['name'],
            uriPrefix: '#/storage_manufacturers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(StorageManufacturer, val);
                },
                accessor: 'name'
            }
        };

        var pdu_manufacturer_field = {
            name: 'manufacturer',
            description: 'Manufacturer',
            required: true,
            // opaque: 'link',
            opaque: 'stringTransform',
            idField: 'id',
            subfield: 'name',
            readArray: ['name'],
            uriPrefix: '#/pdu_manufacturers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(PDUManufacturer, val);
                },
                accessor: 'name'
            }
        };

        var mobile_manufacturer_field = {
            name: 'manufacturer',
            description: 'Manufacturer',
            required: true,
            // opaque: 'link',
            opaque: 'stringTransform',
            idField: 'id',
            subfield: 'name',
            readArray: ['name'],
            uriPrefix: '#/mobile_manufacturers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(MobileDeviceManufacturer, val);
                },
                accessor: 'name'
            }
        };

        var os_field = {
            name: 'os',
            description: 'Operating System',
            transform: 'accessor',
            access: function (item) {
                if (item && item.os != null) {
                    return item.os.full_name;
                }
                return "";
            },
            inputMethod: {
                type: 'typeahead',
                accessor: 'full_name',
                invoker: function (val) {
                    return search(OS, val);
                }
            }
        };

        var server_field = {
            name: 'server',
            description: 'Server',
            required: true,
            opaque: 'link',
            subfield: 'name',
            idField: 'id',
            readArray: ['name'],
            uriPrefix: '#/servers/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(ServerFast, val);
                },
                accessor: 'name'
            }
        };

        var motherboard_field = {
            name: 'motherboard',
            description: 'Motherboard',
            required: true,
            opaque: 'link',
            subfield: 'asset_tag',
            idField: 'id',
            readArray: ['asset_tag'],
            uriPrefix: '#/motherboard/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(Motherboard, val);
                },
                accessor: 'asset_tag'
            }
        };

        var salesforce_id_field = {
            name: "salesforce_id",
            description: "Salesforce ID",
            required: true,
            opaque: 'link',
            // subfield: 'name',
            idField: 'id',
            readArray: [],
            uriPrefix: '#/motherboard/',
            inputMethod: {
                type: 'typeahead',
                invoker: function (val) {
                    return search(Motherboard, val);
                },
                accessor: 'name'
            }
        };

        var customer_field = function (customer_field_name, desc) {
            var _c = customer_field_name;
            var _desc = 'Customer';
            if (customer_field_name === undefined) {
                _c = 'customer';
            }
            if (desc !== undefined) {
                _desc = desc;
            }
            var x = {
                name: _c,
                description: _desc,
                required: true,
                opaque: 'link',
                subfield: 'name',
                readArray: ['name'],
                idField: 'id',
                uriPrefix: '#/organization/',
                inputMethod: {
                    type: 'typeahead',
                    invoker: function (val) {
                        return search(OrganizationFast, val);
                    },
                    accessor: 'name'
                }
            };
            return x;
        };

        var zabbix_instance_field = function () {
            var x = {
                name: 'zabbix_instance',
                description: 'Zabbix Instance',
                required: true,
                opaque: 'link',
                subfield: 'account_name',
                readArray: ['account_name'],
                idField: 'id',
                uriPrefix: '#//zabbix/instance/',
                inputMethod: {
                    type: 'typeahead',
                    invoker: function (val) {
                        return search(ZabbixInstance, val);
                    },
                    accessor: 'account_name'
                }
            };
            return x;
        };

        var proxy_url_field = function (fieldName) {
            return {
                name: 'proxy_url',
                description: 'Proxy URL',
                opaque: 'newType',
                required: false,
                template: '/static/rest/app/templates/dynamic/link_field.html'
            };
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
                description: 'Name',
                required: true,
                opaque: 'link',
                subfield: 'name',
                readArray: [],
                uriPrefix: '#/' + resourceClass.reflect.uri + '/',
                idField: 'id'
            };
        };

        var formatDesc = function (desc) {
            if (desc.endsWith('Fast')) {
                return desc.substring(0, desc.length - 4);
            }
            else if (desc.endsWith('Model')) {
                return 'Model'; // Added this because LoadBalancerModel is not fitting in col-sm-2 (changing to col-sm-3 ui looks bad)
            }
            return desc;
        };

        var formatReadArray = function (readArray) {
            var _readArray = ['name'];
            if (readArray !== undefined && readArray.length !== undefined && readArray.length > 0) {
                _readArray = readArray;
            }
            return _readArray;
        };

        var gen_link_field = function (resourceClass, related_name, idField, resourceClassFast, readArray) {
            var _n = resourceClass.reflect.uri;
            var _id = 'id';
            var _search = resourceClass;
            var _readArray = formatReadArray(readArray);

            if (related_name !== undefined) {
                _n = related_name;
            }
            if (idField !== undefined) {
                _id = idField;
            }
            if (resourceClassFast !== undefined) {
                _search = resourceClassFast;
            }


            return {
                name: _n,
                description: formatDesc(resourceClass.reflect.resourceName),
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

        var choice_field = function (name, desc, choice_array, hide) {
            return {
                name: name,
                description: desc,
                required: true,
                hide: hide,
                inputMethod: {
                    type: 'choices',
                    choices: choice_array,
                }
            };
        };

        var obj_arr_choice_field = function (name, desc, choice_array, displayAccessor, valueAccessor) {
            return {
                name: name,
                description: desc,
                required: true,
                opaque: 'obj_choices',
                // subfield: accessor,
                // idField: 'id',
                inputMethod: {
                    type: 'obj_choices',
                    choices: choice_array,
                    displayAccessor: displayAccessor,
                    valueAccessor: valueAccessor
                }
            };
        };

        var boolean_field = function (name, desc) {
            return choice_field(name, desc, [true, false]);
        };

        var instance_field = gen_link_field(Instance, 'instance', 'id', InstanceFast);

        return {
            uuidField: uuidField,
            manufacturer_field: manufacturer_field,
            server_manufacturer_field: server_manufacturer_field,
            storage_manufacturer_field: storage_manufacturer_field,
            pdu_manufacturer_field: pdu_manufacturer_field,
            mobile_manufacturer_field: mobile_manufacturer_field,
            server_field: server_field,
            os_field: os_field,
            motherboard_field: motherboard_field,
            customer_field: customer_field,
            zabbix_instance_field: zabbix_instance_field,
            disk_controller_field: gen_subattr_field(DiskControllerTypes, 'disk_controller', 'Disk Controller', ['controller']),
            cpu_socket_type_field: gen_subattr_field(CPUSocketType, 'cpu_socket_type', 'CPU Socket Type', ['name']),
            nic_model_field: gen_subattr_field(NICType, 'nic_model', 'NIC Model', ['controller']),
            ipmi_controller_field: gen_subattr_field(IPMIModel, 'ipmi_controller', 'IPMI Controller', ['controller']),
            location_field: gen_link_field(Location),
            self_name_field: self_name_field,
            gen_link_field: gen_link_field,
            choice_field: choice_field,
            obj_arr_choice_field: obj_arr_choice_field,
            boolean_field: boolean_field,
            instance_field: instance_field,
            proxy_url_field: proxy_url_field,
            cabinet_field: gen_link_field(Cabinet, 'cabinet', 'id', CabinetFast)
        };
    }
]);
