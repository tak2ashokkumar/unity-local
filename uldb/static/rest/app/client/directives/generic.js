var app = angular.module('uldb');

var getPartials = function (name) {
    return '/static/rest/app/client/templates/partials/' + name + '.html';
};

var getSnippet = function (name) {
    return '/static/rest/app/templates/snippets/' + name + '.html';
};

app.directive('generictable', [
    '$http',
    'ClientApi',
    function ($http,
              ClientApi) {
        return {
            priority: 100,
            restrict: 'E',
            transclude: true,
            scope: {
                heading: '@',
                addbutton: '@',
                headers: '=',
                tabledata: '=',
                modeldata: '=',
                modeldata1: '=',
                modeldata2: '=',
                modeldata3: '=',
                modeldata4: '=',
                modeldata5: '=',
                modeldata6: '=',
                modeldata7: '=',
                modeldata8: '=',
                modeldatavmtenant: '=',
                rows: '=',
                rows1: '=',
                rows2: '=',
                rows3: '=',
                rows4: '=',
                rows5: '=',
                rows6: '=',
                rows7: '=',
                rows8: '=',
                rowsvmtenant: '=',
                actions: '=',
                click: '&',
                addclick: '&',
                addclick1: '&',
                addclick2: '&',
                addclick3: '&',
                addclick4: '&',
                addclick5: '&',
                addclick6: '&',
                addclick7: '&',
                addclick8: '&',
                addclickvmtenant: '&',
                delete_info: '&deleteOperation',
                navigate_to: '&navigateOperation',
                download_sshfile: '&downloadSsh',
                switches: '&',
                paginationsettings: '=',
                show_nova_inventory: '&showInventory'
            },
            templateUrl: getPartials('generictable'),
            link: function postLink(scope, element, attrs) {
                scope.obj = {};

                scope.decorate = function (method, obj) {
                    if (method == "count")
                        return obj.count;
                };
                scope.openModal = function (method, optional) {
                    scope.obj = {};
                    if (method == "remove_keypair") {
                        optional.table_name = "keypairs";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "remove_flavor") {
                        optional.table_name = "flavors";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "remove_credential") {
                        optional.table_name = "credentials";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "remove_region") {
                        optional.table_name = "regions";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "remove_general_tenant") {
                        optional.table_name = "general_tenants";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "access_information") {
                        optional.link_name = "get_access_information";
                        scope.navigate_to({args: optional});
                    }
                    else if (method == "download_ssh") {
                        optional.table_name = "keypairs";
                        scope.download_sshfile({args: optional});
                    }
                    else if (method == "power_on") {
                        optional.switche = "power_on";
                        scope.switches({args: optional});
                    }
                    else if (method == "power_off") {
                        optional.switche = "power_off";
                        scope.switches({args: optional});
                    }
                    else if (method == "delete_vm") {
                        optional.switche = "delete_vm";
                        scope.switches({args: optional});
                    }
                    else if (method == "delete_resourcepool") {
                        optional.switche = "delete_resourcepool";
                        scope.switches({args: optional});
                    }
                    else if (method == "navigate_to_vmware") {
                        optional.switche = "navigate_to_vmware";
                        scope.switches({args: optional});
                    }
                    else if (method == "remove_images") {
                        optional.table_name = "images_list";
                        scope.delete_info({args: optional});
                    }
                    else if (method == "create_hypervisor") {
                        scope.method = 'Add';
                        scope.switches({args: optional});
                        scope.showModal1 = !scope.showModal1;
                    }
                    else if (method == "edit_tenant") {
                        scope.method = 'Add';
                        scope.obj = {
                            name: optional.name,
                            description: optional.description,
                            id: optional.id
                        };
                        if (optional.enabled.toLowerCase() == "true") {
                            scope.obj.enabled = true;
                        }
                        scope.showModal2 = !scope.showModal2;
                    }
                    else if (method == "create_cluster") {
                        scope.method = 'Add';
                        scope.switches({args: optional});
                        scope.showModal3 = !scope.showModal3;
                    }
                    else if (method == "create_snapshot") {
                        scope.method = 'Add';
                        scope.switches({args: optional});
                        scope.showModal4 = !scope.showModal4;
                    }
                    else if (method == "create_vm") {
                        scope.method = 'Add';
                        scope.switches({args: optional});
                        scope.showModal5 = !scope.showModal5;
                    }
                    else if (method == "create_resource_pool") {
                        scope.rows6[4].options[3].value = "";
                        scope.rows6[9].options[3].value = "";
                        scope.method = 'Add';
                        scope.switches({args: optional});
                        scope.showModal6 = !scope.showModal6;
                    }
                    else if (method == "edit_vcenter") {
                        scope.method = 'Add';
                        scope.obj = {
                            vcenter_name: optional.name,
                            server_ip: optional.server.split('.')[0],
                            ip2: optional.server.split('.')[1],
                            ip3: optional.server.split('.')[2],
                            ip4: optional.server.split('.')[3],
                            location: "Ashburn",
                            port: optional.port,
                            username: optional.username,
                            password: '',
                            id: optional.id
                        };
                        scope.showModal7 = !scope.showModal7;
                    }
                    else if (method == "add_volume") {
                        scope.method = 'Add';
                        scope.obj = {
                            tenant_id: optional.id,
                        };
                        scope.showModal8 = !scope.showModal8;
                    }
                    else if (method == "list_snapshot") {
                        optional.switche = "list_snapshot";
                        scope.switches({args: optional});
                    }
                    else if (method == "show_nova_inventory") {
                        scope.show_nova_inventory({args: optional});
                    }
                    // else if(method == "add_vm"){
                    // scope.method = method;
                    // adapter_id = OpenstackAdapterAuth.getAdapter();
                    // scope.obj = {
                    //     tenant_id: optional.id,
                    // };
                    // tenant_flavors_url = ClientApi.get_tenant_flavors.replace(':adapter_id', adapter_id).replace(':tenant_id', optional.id);
                    // tenant_images_url = ClientApi.get_tenant_images.replace(':adapter_id', adapter_id).replace(':tenant_id', optional.id);
                    // $http.get(tenant_flavors_url).then(function (response) {
                    //     scope.obj.new_flist = response.data.data;
                    // });
                    // $http.get(tenant_images_url).then(function (response) {
                    //     scope.obj.new_image_list = response.data.data;
                    // });
                    // scope.showModal_vm_tenant = !scope.showModal_vm_tenant;
                    // }
                    else {
                        scope.obj = {};
                        if (scope.heading == "vCenter Servers") {
                            scope.obj = {port: "443"};
                        }
                        if (scope.heading == "Tenant") {
                            scope.obj = {enabled: true};
                        }
                        if (scope.heading == "Subnet") {
                            scope.obj = {enable_dhcp: true};
                        }
                        if (scope.heading == "Flavors") {
                            scope.obj = {is_public: true};
                        }
                        if (!$("#min_disk_msg_id").text("")) {
                            $("#min_disk_msg_id").text("");
                        }
                        if (!$("#min_ram_msg_id").text("")) {
                            $("#min_ram_msg_id").text("");
                        }
                        scope.method = method;
                        scope.showModal = !scope.showModal;
                    }

                };
                scope.add = function () {
                    scope.obj = scope.addclick({data: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {

                        scope.cancel();
                    }
                };
                scope.add1 = function () {
                    scope.obj = scope.addclick1({data1: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {

                        scope.cancel1();
                    }
                };
                scope.add2 = function () {
                    scope.obj = scope.addclick2({args: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {
                        scope.cancel2();
                    }
                };
                scope.add3 = function () {
                    scope.obj = scope.addclick3({data3: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {

                        scope.cancel3();
                    }
                };
                scope.add4 = function () {
                    scope.obj = scope.addclick4({data4: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {

                        scope.cancel4();
                    }
                };
                scope.add5 = function () {
                    scope.obj = scope.addclick5({data5: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {

                        scope.cancel5();
                    }
                };
                scope.add6 = function () {
                    scope.obj = scope.addclick6({data6: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {
                        scope.cancel6();
                    }
                };
                scope.add7 = function () {
                    scope.obj = scope.addclick7({data7: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {
                        scope.cancel7();
                    }
                };
                scope.add8 = function () {
                    scope.obj = scope.addclick8({data: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {
                        scope.cancel8();
                    }
                };
                scope.add_vm = function () {
                    scope.obj = scope.addclickvmtenant({data: scope.obj});
                    if (scope.obj.hasOwnProperty("success")) {
                        scope.cancel_vm_tenant();
                    }
                };
                scope.cancel = function (method) {
                    var message = document.getElementById('confirmMessage');
                    if (message != null) {
                        message.innerHTML = "";
                    }
                    scope.showModal = !scope.showModal;
                };
                scope.cancel1 = function () {
                    scope.showModal1 = !scope.showModal1;
                };
                scope.cancel2 = function () {
                    scope.showModal2 = !scope.showModal2;
                };
                scope.cancel3 = function () {
                    scope.showModal3 = !scope.showModal3;
                };
                scope.cancel4 = function () {
                    scope.showModal4 = !scope.showModal4;
                };
                scope.cancel5 = function () {
                    scope.showModal5 = !scope.showModal5;
                };
                scope.cancel6 = function () {
                    scope.showModal6 = !scope.showModal6;
                };
                scope.cancel7 = function () {
                    scope.showModal7 = !scope.showModal7;
                };
                scope.cancel8 = function () {
                    scope.showModal8 = !scope.showModal8;
                };
                scope.cancel_vm_tenant = function () {
                    scope.showModal_vm_tenant = !scope.showModal_vm_tenant;
                };
            }
        };
    }]);

app.directive('mschedules', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rows: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            completeclick: '&',
            switches: '&'
        },
        templateUrl: getPartials('scheduled_maintenance'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Complete') {
                    scope.obj = {
                        description: optional.description,
                        status: "C",
                        datacenter: optional.datacenter,
                        impacted_customer: optional.impacted_customer,
                        start_date: optional.start_date,
                        end_date: optional.end_date,
                        id: optional.id
                    };
                    scope.method = method;
                    scope.completeclick({data: scope.obj});
                }
                else if (method == 'Edit') {
                    scope.selectedCustomers = [];
                    angular.forEach(optional.impacted_customer, function (value, key) {
                        scope.selectedCustomers.push({short: value.id, long: value.name});
                    });
                    scope.obj = {
                        description: optional.description,
                        status: {short: optional.status, long: optional.status},
                        datacenter: {short: optional.datacenter.id, long: optional.datacenter.name},
                        impacted_customer: scope.selectedCustomers,
                        start_date: optional.start_date,
                        end_date: optional.end_date,
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };

            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };
        }
    };
});

app.directive('vcentertable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rebuildconfirm: '=',
            rows: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            rebuildclick: '&',
            switches: '&'
        },
        templateUrl: getPartials('vmware_vcentertable'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        id: optional.id,
                        name: optional.name,
                        vcenter_host: optional.vcenter_host,
                        proxy_url: optional.proxy_url,
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method === 'Rebuild') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showRebuildConfirm = !scope.showRebuildConfirm;
                }
                else {
                    console.log("Else Block");
                }
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.rebuild = function () {
                scope.obj = scope.rebuildclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_rebuild();
                }
            };
            scope.cancel_rebuild = function (method) {
                scope.showRebuildConfirm = !scope.showRebuildConfirm;
            };

            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
        }
    };
});

app.directive('vesxitable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rebuildconfirm: '=',
            rows: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            rebuildclick: '&',
            switches: '&'
        },
        templateUrl: getPartials('vmware_esxitable'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        id: optional.id,
                        name: optional.name,
                        esxi_host: optional.esxi_host,
                        proxy_url: optional.proxy_url,
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method === 'Rebuild') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showRebuildConfirm = !scope.showRebuildConfirm;
                }
                else {
                    console.log("Else Block");
                }
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.rebuild = function () {
                scope.obj = scope.rebuildclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_rebuild();
                }
            };
            scope.cancel_rebuild = function (method) {
                scope.showRebuildConfirm = !scope.showRebuildConfirm;
            };

            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
        }
    };
});


app.directive('openstacktable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rebuildconfirm: '=',
            rows: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            rebuildclick: '&',
            switches: '&'
        },
        templateUrl: getPartials('openstack_table'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid,
                        name: optional.name,
                        openstack_host: optional.openstack_host,
                        proxy_url: optional.proxy_url,

                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method === 'Rebuild') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showRebuildConfirm = !scope.showRebuildConfirm;
                }
                else {
                    console.log("Else Block");
                }
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.rebuild = function () {
                scope.obj = scope.rebuildclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_rebuild();
                }
            };
            scope.cancel_rebuild = function (method) {
                scope.showRebuildConfirm = !scope.showRebuildConfirm;
            };

            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
        }
    };
});

app.directive('f5lbtable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rebuildconfirm: '=',
            rows: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            rebuildclick: '&',
            switches: '&'
        },
        templateUrl: getPartials('f5loadbalancer_table'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid,
                        name: optional.name,
                        f5lb_host: optional.f5lb_host,
                        proxy_url: optional.proxy_url,
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method === 'Rebuild') {
                    scope.obj = {
                        id: optional.id,
                        uuid: optional.uuid
                    };
                    scope.method = method;
                    scope.showRebuildConfirm = !scope.showRebuildConfirm;
                }
                else {
                    console.log("Else Block");
                }
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_delete();
                }
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.rebuild = function () {
                scope.obj = scope.rebuildclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_rebuild();
                }
            };
            scope.cancel_rebuild = function (method) {
                scope.showRebuildConfirm = !scope.showRebuildConfirm;
            };

            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };

        }
    };
});

app.directive('datacenterwidget', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('data-center-widgets')
    };
});

app.directive('dbcustomerwidget', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('customer-widget')
    };
});

app.directive('removeOnClick', ['$http', function ($http) {
    return {
        link: function ($scope, elt, attrs) {
            $scope.remove = function (selname) {
                var idx = $scope.selectednames.indexOf(selname);
                if (window.confirm("Are you sure want to unpin this customer?")) {
                    return $http({
                        url: '/rest/customers/' + selname.id + '/get_mapped_object/',
                        method: "GET",
                    })
                        .then(function (response) {
                                return $http({
                                    url: '/rest/pinned_customers/' + response['data']['mapped_object_id'] + '/',
                                    method: "DELETE",
                                })
                                    .then(function (response) {

                                            $scope.selectednames.splice(idx, 1);
                                            $scope.load_customer_widget();
                                            console.log("Organization mapping deleted successfully:" + response.status);
                                        },
                                        function (response) {
                                            console.log("Organization mapping deletion failed:" + response.status);
                                        });
                            },
                            function (response) {
                                console.log("Organization mapping id error:" + response.status);
                            });
                }
            };
        }
    };
}]);

app.directive('autoComplete', [
    '$timeout',
    function ($timeout) {
        return function ($scope, iElement, iAttrs) {
            $('#autocomDash').autocomplete({
                source: $scope[iAttrs.uiItems],
                select: function (event, ui) {
                    $('#autocomDash').val(ui.item.value);
                    $scope.selected = ui.item.value;
                    $timeout(function () {
                        $('#autocomDash').trigger('input');
                    }, 0);

                },
                messages: {
                    noResults: '',
                    results: function () {
                    }
                }
            });
        };
    }
]);

app.directive('maintanenceshedule', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            headers: "=",
            tabledata: "="
        },
        templateUrl: getPartials('maintanence-shedule')
    };
});

app.directive('tickets', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            headers: "=",
            tabledata: "="
        },
        templateUrl: getPartials('tickets')
    };
});

app.directive('calerts', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            headers: "=",
            tabledata: "="
        },
        templateUrl: getPartials('alerts')
    };
});

app.directive('publicclouds', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('public-clouds')
    };
});


app.directive('privateclouds', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('private-clouds')
    };
});

app.directive('colocations', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('co-locations')
    };
});

app.directive('datacenterArea', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('datacenter-area')
    };
});

app.directive('datacenterall', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('datacenter-all')
    };
});

app.directive('admindashboardwidgets', function () {
    return {
        priority: 1000,
        restrict: 'E',
        templateUrl: getPartials('admin-dashboard-widgets')
    };
});

app.directive('maintenancedashboard', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            addbutton: '@',
            headers: '=',
            tabledata: '='
        },
        templateUrl: getPartials('maintence-dashboard-table')
    };
});

app.directive('monitor', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '='
        },
        templateUrl: getPartials('lm-monitor')
    };
});

app.directive('zendeskticketsdetail', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            getsearch: '&',
            infinteload: '&',
            createticket: '&',
        },
        templateUrl: getPartials('zendesk-tickets'),
        link: function (scope, attrs, elem) {
            scope.searchkey = '';
            scope.getSearchResults = function () {
                scope.getsearch({args: scope.searchkey});
            };
        }
    };
});

// app.directive('zendeskticketsdetails', function(){
//     priority: 1000,
//     restrict: 'E',
//     replace: true,
//     templateUrl: getPartials('zendesk-tickets'),
//     link: function (scope, attrs, elem) {
//         // scope.searchkey = '';
//         // scope.getsearchoutput = function () {
//         //     scope.getSearchResults(scope.searchkey);
//         // };
//     }
// });

app.directive('zendeskticketsdetails', function () {
    return {
        priority: 1000,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('zendesk-tickets'),
        link: function (scope, element, attrs) {
            scope.searchkey = '';
            scope.getsearchoutput = function () {
                scope.getSearchResults(scope.searchkey);
            };
        }
    };
});

app.directive('deviceslist', function () {
    return {
        priority: 1000,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('devices_overview'),
        link: function (scope, element, attrs) {
            
        }
    };
});

app.directive('uib-progressbar', function () {
    return {
        priority: 1000,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@'
        },
        templateUrl: getPartials('alerts')
    };
});

app.directive('mapview', [
    '$injector',
    function ($injector) {
        return {
            priority: 100,
            restrict: 'E',
            transclude: true,
            scope: {
                heading: '@',
                map: '=',
                map_loaded: '='
                // map_markers: '='
            },
            templateUrl: getPartials('mapview')
        };
    }
]);

app.directive('clientmapview', [
    '$injector',
    function ($injector) {
        return {
            priority: 100,
            restrict: 'E',
            transclude: true,
            scope: {
                heading: '@'
            },
            templateUrl: getPartials('clientmapview')
        };
    }
]);

app.directive('modal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">&nbsp;{{modeldata.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-buttons">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel()">Cancel</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add()">Create</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal1', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog" style="width:50%">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata1.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-buttons">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel1()">Close</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add1();">Create</button>' +
            '<button ng-if="method === \'Attach\'" class="btn btn-default" type="submit" ng-click="add1(data);">Attach</button>' +
            '<button ng-if="method === \'Copy\'" class="btn btn-default" type="submit" ng-click="add1();">Create Copy</button>' +
            '<button ng-if="method === \'change_password\'" class="btn btn-default" type="submit" ng-click="add1(data);">Change Password</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);


app.directive('modal2', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata2.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel2()">Close</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add2();">Create</button>' +
            '<button ng-if="method === \'Attach\'" class="btn btn-default" type="submit" ng-click="add2(obj);">Attach</button>' +
            '<button ng-if="method === \'Copy\'" class="btn btn-default" type="submit" ng-click="add2();">Create Copy</button>' +
            '<button ng-if="method === \'change_password\'" class="btn btn-default" type="submit" ng-click="add2(data);">Change API Keys</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit2(obj, selection.index)">Save changes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal3', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata3.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel3()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add3()">Create!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal4', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata4.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel4()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add4();">Create!</button>' +
            '<button ng-if="method === \'Attach\'" class="btn btn-default" type="submit" ng-click="add4()">Attach!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal5', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata5.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel5()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add5();">Create!</button>' +
            '<button ng-if="method === \'Attach\'" class="btn btn-default" type="submit" ng-click="add5()">Attach!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal6', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata6.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel6()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-default" type="submit" ng-click="add6();">Create!</button>' +
            '<button ng-if="method === \'Attach\'" class="btn btn-default" type="submit" ng-click="add6()">Attach!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-default" type="submit" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal7', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata7.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer">' +
            '<button class="btn btn-danger" type="button" ng-click="cancel7()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-primary" type="button" ng-click="add7();">Update!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-primary" type="button" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('modal8', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">{{modeldata8.title}}</h4>' +
            '</div>' +
            '<div class="modal-body" ng-transclude></div>' +
            '<div class="modal-footer">' +
            '<button class="btn btn-danger" type="button" ng-click="cancel8()">No, not right now.</button>' +
            '<button ng-if="method === \'Add\'" class="btn btn-primary" type="button" ng-click="add8()">Create!</button>' +
            '<button ng-if="method === \'Edit\'" class="btn btn-primary" type="button" ng-click="edit(obj, selection.index)">Save changes!</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: true,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);

app.directive('notifications', function () {
    return {
        priority: 100,
        restrict: 'E',
        templateUrl: getPartials('notifications'),
        scope: {
            sectionAlerts: "="
        }
    };
});

app.directive('footprintStats', function () {
    return {
        restrict: 'E',
        scope: {
            footprint: '=footprint'
        },
        link: function ($scope, element, attrs) {
            var min_width = 10;
            var sum_hosts = $scope.footprint.host_stats.normal + $scope.footprint.host_stats.warning + $scope.footprint.host_stats.critical;
            var sum_services = $scope.footprint.service_stats.normal + $scope.footprint.service_stats.warning + $scope.footprint.service_stats.critical;

            var compute_pct = function (val, total) {
                if (!angular.isDefined(total) || total === 0) {
                    return 0;
                }
                return 100 * (val / total);
            };

            $scope.host_widths = {
                'normal': compute_pct($scope.footprint.host_stats.normal, sum_hosts),
                'warning': compute_pct($scope.footprint.host_stats.warning, sum_hosts),
                'critical': compute_pct($scope.footprint.host_stats.critical, sum_hosts)
            };

            $scope.serv_widths = {
                'normal': compute_pct($scope.footprint.service_stats.normal, sum_services),
                'warning': compute_pct($scope.footprint.service_stats.warning, sum_services),
                'critical': compute_pct($scope.footprint.service_stats.critical, sum_services)
            };

            var reshuffle = function (obj, ignored, difference) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (ignored.indexOf(key) !== -1 && ignored.length < 3) {
                            obj[key] = obj[key] - difference / (3 - ignored.length);
                        }
                    }
                }
            };

            $scope.round_throughput = function (val) {
                var _precision = 3;
                if (val > 1000000000) {
                    return (val / 1000000000.0).toFixed(_precision) + ' Gbit/s';
                } else if (val > 1000000) {
                    return (val / 1000000.0).toFixed(_precision) + ' Mbit/s';
                } else if (val > 1000) {
                    return (val / 1000.0).toFixed(_precision) + ' Kbit/s';
                } else {
                    return (val).toFixed(_precision) + ' bit/s';
                }
            };

            var normalize = function (obj) {
                var extra = 0.0;
                var longest = 10.0;
                var longest_key = null;
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] > longest) {
                            longest = obj[key];
                            longest_key = key;
                        }
                        if (obj[key] < min_width && obj[key] > 0.0) {
                            var difference = min_width - obj[key];
                            extra += difference;
                            obj[key] = min_width;
                            // reshuffle(obj, ignored, difference);
                        }
                    }
                }
                obj[longest_key] -= extra;
            };
            ['host_widths', 'serv_widths'].forEach(function (e) {
                normalize($scope[e]);
            });
        },
        templateUrl: getPartials('footprint-stats')
    };
});

app.directive('tableArray', function () {
    // this directive takes an array along with list of properties to render?
    return {
        restrict: 'E',
        scope: {
            arr: '=arr',
            elems: '=elems'
        },
        templateUrl: getPartials('table-array')
    };
});

app.directive('datacenterWidget', function () {
    return {
        restrict: 'E',
        scope: {
            dcenter: '=dcenter'
        },
        transclude: true,
        templateUrl: getPartials('datacenter-widget')
    };
});

app.directive('iframeSetDimensionsOnload', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('load', function () {
                var iFrameHeight = element[0].contentWindow.document.body.scrollHeight + 'px';
                var iFrameWidth = '100%';

                element.css('width', iFrameWidth);
                element.css('height', iFrameHeight);
            });
        }
    };
}
]);

app.directive('colocationWidget', function () {
    return {
        restrict: 'E',
        scope: {
            colo: '=colo'
        },
        transclude: true,
        link: function ($scope, element, attrs) {
            var min_width = 10;
            var sum_hosts = $scope.colo.host_stats.normal + $scope.colo.host_stats.warning + $scope.colo.host_stats.critical;
            var sum_services = $scope.colo.service_stats.normal + $scope.colo.service_stats.warning + $scope.colo.service_stats.critical;

            var compute_pct = function (val, total) {
                if (!angular.isDefined(total) || total === 0) {
                    return 0;
                }
                return 100 * (val / total);
            };

            $scope.host_widths = {
                'normal': compute_pct($scope.colo.host_stats.normal, sum_hosts),
                'warning': compute_pct($scope.colo.host_stats.warning, sum_hosts),
                'critical': compute_pct($scope.colo.host_stats.critical, sum_hosts)
            };

            $scope.serv_widths = {
                'normal': compute_pct($scope.colo.service_stats.normal, sum_services),
                'warning': compute_pct($scope.colo.service_stats.warning, sum_services),
                'critical': compute_pct($scope.colo.service_stats.critical, sum_services)
            };

            var reshuffle = function (obj, ignored, difference) {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (ignored.indexOf(key) !== -1 && ignored.length < 3) {
                            obj[key] = obj[key] - difference / (3 - ignored.length);
                        }
                    }
                }
            };

            $scope.round_throughput = function (val) {
                var _precision = 3;
                if (val > 1000000000) {
                    return (val / 1000000000.0).toFixed(_precision) + " Gbit/s";
                } else if (val > 1000000) {
                    return (val / 1000000.0).toFixed(_precision) + " Mbit/s";
                } else if (val > 1000) {
                    return (val / 1000.0).toFixed(_precision) + " Kbit/s";
                } else {
                    return (val).toFixed(_precision) + " bit/s";
                }
            };

            var normalize = function (obj) {
                var extra = 0.0;
                var longest = 10.0;
                var longest_key = null;
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (obj[key] > longest) {
                            longest = obj[key];
                            longest_key = key;
                        }
                        if (obj[key] < min_width && obj[key] > 0.0) {
                            var difference = min_width - obj[key];
                            extra += difference;
                            obj[key] = min_width;
                            // reshuffle(obj, ignored, difference);
                        }
                    }
                }
                obj[longest_key] -= extra;
            };
            ['host_widths', 'serv_widths'].forEach(function (e) {
                normalize($scope[e]);
            });
        },
        templateUrl: getPartials('colocation-widget')
    };
});


app.directive('awsgenerictable', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            selectedregion: '=?',
            displayheading: '@',
            addbuttonname: '@',
            headers: '=',
            tabledata: '=',
            modelheaders: '=?',
            modelheaders1: '=?',
            modeldata: '=',
            modeldata1: '=',
            modeldata2: '=',
            modeldata3: '=',
            modeldata4: '=',
            modeldata5: '=',
            modeldata6: '=',
            rows: '=',
            rows1: '=',
            rows2: '=',
            rows3: '=',
            rows4: '=',
            rows5: '=',
            rows6: '=',
            actions: '=',
            keypairlistgenerated: '=',
            click: '&',
            addclick: '&',
            addclick1: '&',
            addclick2: '&',
            addclick3: '&',
            addclick4: '&',
            addclick5: '&',
            addclick6: '&',
            addclick7: '&',
            support: '&',
            load_keypair: '&',
            switches: '&',
            deleteclick: '&',
            deleteconfirm: '=',
            getobserviumdetails: '&',
            showobserviumstats: '&',
        },
        templateUrl: getPartials('awsgenerictable'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.keypair_list_show = false;
            scope.popoverobj = {
                content: 'Hello, World!',
                templateUrl: 'instancedetailstemplate.html',
                title: 'Title'
            };
            scope.instance_details = null;
            scope.decorate = function (method, obj) {
                if (method == "count")
                    return obj.count;
                else if (method == "results")
                    return obj.results;
            };
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == "awspoweron") {
                    optional.method = "awspoweron";
                    // scope.switches({ args: optional });
                    scope.obj = {
                        instance_id: optional.instance_id,
                        method: optional.method
                    };
                    console.log('deleteconfirm : ', angular.toJson(scope.deleteconfirm));
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;

                } else if (method == "awspoweroff") {
                    optional.method = "awspoweroff";
                    scope.obj = {
                        instance_id: optional.instance_id,
                        method: optional.method
                    };
                    // scope.switches({ args: optional });
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                } else if (method == "awsterminate") {
                    optional.method = "awsterminate";
                    scope.obj = {
                        instance_id: optional.instance_id,
                        method: optional.method
                    };
                    // scope.switches({ args: optional });
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                } else if (method == "showentities") {
                    optional.method = "showentities";
                    scope.switches({args: optional});
                } else if (method == "cloneinstance") {
                    scope.method = 'Add';
                    scope.isClone = true;
                    optional.method = "cloneinstance";
                    scope.switches({args: optional});
                    scope.obj = {max_count: 1, instance_type: "t2.micro"};
                    scope.obj.image_id = scope.rows.image_id;
                    scope.showModal1 = !scope.showModal1;
                } else if (method == "createimage") {
                    //scope.switches({ args: optional });
                    scope.method = 'Add';
                    optional.method = "createimage";
                    scope.obj.instance_id = optional.instance_id;
                    scope.showModal3 = !scope.showModal3;
                } else if (method == "attachinstance") {
                    scope.method = 'Attach';
                    optional.method = "attachinstance";
                    scope.obj.instance_id = optional.instance_id;
                    scope.showModal4 = !scope.showModal4;
                    scope.switches({args: optional});
                } else if (method == "attachinterface") {
                    scope.method = 'Attach';
                    optional.method = "attachinterface";
                    scope.obj.instance_id = optional.instance_id;
                    scope.showModal5 = !scope.showModal5;
                    scope.switches({args: optional});
                } else if (method == "attachloadbalancer") {
                    scope.method = 'Attach';
                    optional.method = "attachloadbalancer";
                    scope.obj.instance_id = optional.instance_id;
                    scope.showModal6 = !scope.showModal6;
                    scope.switches({args: optional});
                } else if (method == "snapshot") {
                    scope.method = 'Copy';
                    optional.method = "snapshot";
                    scope.obj.SnapshotId = optional.SnapshotId;
                    scope.showModal1 = !scope.showModal1;
                } else if (method == ("showusergroups")) {
                    scope.addclick1({data1: optional});
                } else if (method == "showuserdetails") {
                    scope.addclick2({data2: optional});
                } else if (method == "showinstancedetails") {
                    scope.method = 'Show';
                    optional.method = "showinstancedetails";
                    scope.obj.instance_id = optional.instance_id;
                    scope.switches({args: optional});
                }
                else if (method == 'manage_support') {
                    scope.support({region: optional.availability_zone, instance_id: optional.instance_id});
                }
                else if (method == "observiumdetails") {
                    scope.showobserviumstats({device: optional});
                }
                else {
                    if (scope.heading == "Instances") {
                        scope.obj = {max_count: 1, instance_type: "t2.micro"};
                    }
                    scope.method = method;
                    scope.isClone = false;
                    scope.keypair_list_show = false;
                    scope.showModal = !scope.showModal;
                }
            };
            scope.add = function () {
                if (scope.obj.keypair_behavior !== undefined && scope.obj.keypair_behavior == 'b') {
                    if (scope.obj.keypairname === undefined) {
                        scope.obj.keypairnameMsg = 'Key Pair name is required.';
                        return;
                    }
                    else {
                        scope.obj.keypairname = scope.obj.keypairname['KeyName'];
                    }
                }
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.add1 = function () {
                scope.obj = scope.addclick1({data1: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel1();
                }
            };
            scope.add2 = function () {
                scope.obj = scope.addclick2({data2: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel2();
                }
            };
            scope.add3 = function () {
                scope.obj = scope.addclick3({data3: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel3();
                }
            };
            scope.add4 = function () {
                scope.obj = scope.addclick4({data4: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel4();
                }
            };
            scope.add5 = function () {
                scope.obj = scope.addclick5({data5: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel5();
                }
            };
            scope.add6 = function () {
                scope.obj = scope.addclick6({data6: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel6();
                }
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
            scope.cancel1 = function () {
                scope.showModal1 = !scope.showModal1;
            };
            scope.cancel2 = function () {
                scope.showModal2 = !scope.showModal2;
            };
            scope.cancel3 = function () {
                scope.showModal3 = !scope.showModal3;
            };
            scope.cancel4 = function () {
                scope.showModal4 = !scope.showModal4;
            };
            scope.cancel5 = function () {
                scope.showModal5 = !scope.showModal5;
            };
            scope.cancel6 = function () {
                scope.showModal6 = !scope.showModal6;
            };

            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                scope.cancel_delete();
                // if (scope.obj.hasOwnProperty("success")) {
                //     scope.cancel_delete();
                // }
            };

            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.get_observium_config = function (instance) {
                scope.getobserviumdetails({device: instance});
            };

            scope.show_observium_details = function (instance) {
                scope.instance_details = instance.observium_details;
                console.log('instancedetails : ', angular.toJson(scope.instance_details));
            };

            scope.varone = [];
            scope.load_keypair = function (params) {
                if (params !== undefined) {
                    if (params == 'b') {
                        scope.keypair_list_show = true;
                        scope.addclick7({data: scope.obj});
                        console.log(scope.obj);
                    }
                    else {
                        scope.keypair_list_show = false;
                    }
                }
            };
        }
    };
});

app.directive('awsinstancelist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_instance_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awss3buckets', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_s3_buckets'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awssnapshotlist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_snapshot_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awsvolumeslist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_volumes_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awspolicieslist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_policies_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awsautoscalinggrplist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_auto_scaling_grp_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awssecuritygrplist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_security_groups_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awslblist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_load_balancer_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awsnwinterfacelist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_nw_interface_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awsuserlist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('aws_user_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('awsaccounts', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            modeldata1: '=',
            modeldata2: '=',
            rows: '=',
            rows1: '=',
            rows2: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            addclick1: '&',
            addclick2: '&',
            support: '&',
            deleteclick: '&',
            deleteconfirm: '=',
            switches: '&',
            listall: '&?',
            listvms: '&?'
        },
        templateUrl: getPartials('aws_accounts'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == "addregion") {
                    scope.switches({args: optional});
                    scope.method = 'Add';
                    optional.method = "addregion";
                    scope.obj.id = optional.id;
                    scope.obj.customer = optional.customer;
                    scope.obj.aws_user = optional.aws_user;
                    scope.showModal1 = !scope.showModal1;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        aws_user: optional.aws_user,
                        email: optional.email,
                        customer: optional.customer,
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'delete') {

                    scope.obj = {
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method == 'manage_support') {
                    scope.support({awsaccount: optional.aws_user});
                }
                else if (method == 'change_password') {
                    scope.method = method;
                    scope.obj = {
                        access_key: optional.access_key,
                        id: optional.id
                    };
                    scope.showModal2 = !scope.showModal2;
                }
                else {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
            };
            scope.listall1 = function (args) {
                scope.listall({details: args});
            };
            scope.listvms1 = function (args) {
                scope.listvms({details: args});
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.add1 = function () {
                scope.obj = scope.addclick1({data1: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel1();
                }
            };
            scope.add2 = function () {
                scope.obj = scope.addclick2({data2: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel2();
                }
            };
            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
            scope.cancel1 = function () {
                scope.showModal1 = !scope.showModal1;
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };
            scope.cancel2 = function (method) {
                scope.showModal2 = !scope.showModal2;
            };
        }
    };
});

app.directive('deletemodal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">&nbsp;{{deleteconfirm.title}}</h4>' +
            '</div>' +
            '<div class="modal-body">{{deleteconfirm.alertMsg}}</div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel_delete()">No</button>' +
            '<button class="btn btn-default" type="submit" ng-click="delete()">Yes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: false,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);


app.directive('confirmationmodal', function () {
        return {
            template: '<div class="modal fade">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
            '<h4 class="modal-title">&nbsp;{{deleteconfirm.title}}</h4>' +
            '</div>' +
            '<div class="modal-body">{{deleteconfirm.alertMsg}}</div>' +
            '<div class="modal-footer modal-button">' +
            '<button class="btn btn-cancel" type="button" ng-click="cancel_delete()">No</button>' +
            '<button class="btn btn-default" type="submit" ng-click="delete()">Yes</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>',
            restrict: 'E',
            transclude: false,
            replace: true,
            scope: true,
            link: function postLink(scope, element, attrs) {
                scope.title = attrs.title;
                scope.$watch(attrs.visible, function (value) {
                    if (value == true) $(element).modal('show');
                    else $(element).modal('hide');
                });

                $(element).on('shown.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = true;
                    });
                });

                $(element).on('hidden.bs.modal', function () {
                    scope.$apply(function () {
                        scope.$parent[attrs.visible] = false;
                    });
                });
            }
        };
    }
);


//---------------Azure directive for customer app---------------------------------------------------------


app.directive('azurecustomerlist', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            modeldata1: '=',
            deleteconfirm: '=',
            addbuttonname: '=?',
            rows: '=',
            rows1: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            addclick1: '&',
            editclick: '&',
            deleteclick: '&',
            resourcegroup: '&',
            switches: '&'
        },

        templateUrl: getPartials('azure_customer'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;

                } else if (method == 'Edit') {
                    scope.obj = {
                        account_name: optional.account_name,
                        //customer: optional.customer,
                        customer: {short: optional.customer},
                        location: optional.location,
                        user_name: optional.user_name,
                        secret_key: optional.secret_key,
                        subscription_id: optional.subscription_id,
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                } else if (method == 'Delete') {
                    scope.obj = {
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                } else if (method == 'View_resource') {

                    scope.obj = {
                        id: optional.id
                    };
                    scope.redirect({data: scope.obj});
                } else if (method == 'change_password') {

                    scope.method = method;
                    scope.obj = {
                        id: optional.id
                    };
                    scope.showModal1 = !scope.showModal1;

                    //scope.redirect({ data: scope.obj });
                }
            };
            scope.resource_grps = function (args) {
                scope.obj = scope.resourcegroup({data: args});
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel();
                }
            };
            scope.add1 = function () {
                var result = scope.addclick1({data: scope.obj});
                if (result.hasOwnProperty("success")) {
                    scope.cancel1();
                }
            };

            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };

            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };
            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };


            scope.cancel1 = function () {
                scope.showModal1 = !scope.showModal1;
            };
        }
    };
});


app.directive('azureresourcegrouplist', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            showclosebutton: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            modeldata1: '=',
            modeldata2: '=',
            deleteconfirm: '=',
            rows: '=',
            rows1: '=',
            rows2: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            addclick1: '&',
            addclick2: '&',
            editclick: '&',
            deleteclick: '&',
            viewresource: '&',
            switches: '&',
            hideresourcetable: '&',
            viewvirtualmachine: '&',
            loadnic: '&',
            displayerror: '&',
            loadvnet: '&',
            loadsubnet: '&'
        },
        templateUrl: getPartials('azure_customer'),
        link: function postLink(scope, element, attrs) {

            scope.obj = {};
            scope.searchKeyword = '';
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Edit') {
                    scope.obj = {
                        account_name: optional.account_name,
                        //customer: optional.customer,
                        customer: {short: optional.customer},
                        location: optional.location,
                        user_name: optional.user_name,
                        secret_key: optional.secret_key,
                        subscription_id: optional.subscription_id,
                        id: optional.id
                    };
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'Delete') {
                    scope.obj = {
                        account_id: optional.account_id,
                        name: optional.name,
                        id: optional.id,
                    };
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method == 'view_resource') {
                    scope.searchKeyword = '';
                    scope.obj = {
                        id: optional.id,
                        name: optional.name
                    };
                    scope.method = method;
                    scope.obj = scope.viewresource({data: scope.obj});
                }
                else if (method == 'create_vm') {
                    scope.obj = {
                        resource_name: optional.name
                    };
                    scope.loadnic({data: optional.name});

                    scope.method = 'Add';
                    scope.showModal1 = !scope.showModal1;

                }
                else if (method == 'view_vm') {
                    scope.searchKeyword = '';
                    scope.obj = {
                        id: optional.id,
                        name: optional.name
                    };
                    scope.method = method;
                    scope.obj = scope.viewvirtualmachine({data: scope.obj});
                }
                else if (method == 'create_nic') {
                    scope.obj = {
                        resource_grp_name: optional.name
                    };
                    scope.loadvnet({data: optional.name});
                    scope.method = 'Add';
                    scope.showModal2 = !scope.showModal2;
                }
            };
            scope.loadsubnetlist = function (args, optional) {

                scope.loadsubnet({data: scope.obj});
            };
            scope.add = function () {
                scope.obj = scope.addclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };

            scope.add1 = function () {
                var create_vm_result = scope.addclick1({data: scope.obj});
                if (create_vm_result.hasOwnProperty("error")) {
                    scope.displayerror({data: create_vm_result.error});
                    return false;
                }
                scope.obj = create_vm_result;
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel1();
                }
            };

            scope.add2 = function () {
                var create_nic_result = scope.addclick2({data: scope.obj});

                if (create_nic_result.hasOwnProperty("error")) {
                    return false;
                }

                if (create_nic_result.hasOwnProperty("success")) {
                    scope.cancel2();
                    return false;

                }
            };

            scope.edit = function () {
                scope.obj = scope.editclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel();
                }
            };
            scope.delete = function () {
                scope.obj = scope.deleteclick({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {

                    scope.cancel_delete();
                }
            };
            scope.cancel = function (method) {
                scope.showModal = !scope.showModal;
            };

            scope.cancel1 = function (method) {
                scope.showModal1 = !scope.showModal1;
            };
            scope.cancel2 = function (method) {
                scope.showModal2 = !scope.showModal2;
            };


            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };
        }
    };
});

app.directive('azurevmlist', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            showclosebutton: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            modeldata1: '=',
            modeldata2: '=',
            deleteconfirm: '=',
            rows: '=',
            rows1: '=',
            rows2: '=',
            actions: '=',
            click: '&',
            addclick: '&',
            editclick: '&',
            deleteclick: '&',
            viewresource: '&',
            attachloadbalancer: '&',
            fetchloadbalancer: '&',
            hidevirtualmachine: '&',
            viewvirtualmachine: '&',
            deletevirtualmachine: '&',
            loadbackendpool: '&'
        },
        templateUrl: getPartials('azure_customer'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.searchKeyword = '';
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'Add') {
                    scope.method = method;
                    scope.showModal = !scope.showModal;
                }
                else if (method == 'start_vm') {
                    alert('start');
                }
                else if (method == 'stop_vm') {
                    alert('stop_vm');
                }
                else if (method == 'attach_lb') {
                    scope.method = 'Attach';
                    scope.obj = optional;
                    scope.fetchloadbalancer({data: optional});
                    scope.showModal2 = !scope.showModal2;
                }
                else if (method == 'delete') {
                    scope.obj = optional;
                    scope.method = method;
                    scope.showDeleteConfirm = !scope.showDeleteConfirm;
                }
                else if (method == 'close') {
                    scope.method = method;
                    scope.obj = scope.hidevirtualmachine();
                }

            };
            scope.add2 = function (data) {
                scope.obj = scope.attachloadbalancer({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel2();
                }

            };

            scope.delete = function () {
                scope.obj = scope.deletevirtualmachine({data: scope.obj});
                if (scope.obj.hasOwnProperty("success")) {
                    scope.cancel_delete();
                }
            };

            scope.cancel_delete = function (method) {
                scope.showDeleteConfirm = !scope.showDeleteConfirm;
            };

            scope.cancel2 = function (method) {
                scope.showModal2 = !scope.showModal2;
            };
            scope.list_resources = function (args) {
                scope.obj = scope.viewresource({data: args});
            };
            scope.loadbackendpooladdress = function (args) {
                scope.loadbackendpool({data: args});
            };
        }
    };
});

app.directive('viewazurevmlist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('azure_vm_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});


app.directive('azureresourcelist', function () {
    return {
        priority: 100,
        restrict: 'E',
        transclude: true,
        scope: {
            heading: '@',
            showclosebutton: '@',
            headers: '=',
            tabledata: '=',
            modeldata: '=',
            deleteconfirm: '=',
            rows: '=',
            hideresource: '&'
        },
        templateUrl: getPartials('azure_customer'),
        link: function postLink(scope, element, attrs) {
            scope.obj = {};
            scope.searchKeyword = '';
            scope.openModal = function (method, optional) {
                scope.obj = {};
                if (method == 'close') {
                    scope.method = method;
                    scope.obj = scope.hideresource();
                }
            };
        }
    };
});

app.directive('viewazureresourcelist', function () {
    return {
        priority: 100,
        restrict: 'E',
        replace: true,
        templateUrl: getPartials('azure_resource_list'),
        link: function postLink(scope, element, attrs) {
        }
    };
});

app.directive('noRecordsFound', function () {
    return {
        priority: 1000,
        restrict: 'E',
        scope: {
            message: '@',
        },
        templateUrl: getPartials('no-records-found')
    };
});

app.directive('observiumGraphDetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'static/rest/app/client/templates/observium/graphdetails.html',
        replace: true,
        link: function (scope, element, attrs) {
        }
    };
});

app.directive('observiumPortDetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'static/rest/app/client/templates/observium/port_details.html',
        replace: false,
        link: function (scope, element, attrs) {
        }
    };
});

app.directive('observiumStatsPopup', function () {
    return {
        restrict: 'E',
        templateUrl: 'static/rest/app/client/templates/observium/observium_stats_popup.html',
        replace: true,
        link: function (scope, element, attrs) {
        }
    };
});

app.directive('assetsDevicesPage', function () {
    return {
        restrict: 'E',
        templateUrl: 'static/rest/app/client/templates/generic-tab.html',
        replace: true,
        link: function (scope, element, attrs) {
        }
    };
});