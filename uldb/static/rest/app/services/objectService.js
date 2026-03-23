/**
 * Created by rt on 2/9/17.
 */
var app = angular.module('uldb');

app.factory('VirtualLoadBalancerService', [
    'FieldFactory',
    'CoreService',
    function (CoreService) {
        var _dwf =  CoreService.dereferenceWrapperFactory;
        var fields = [
            CoreService.fieldFactory('Host Name', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'hostname'])),
            CoreService.fieldFactory('ipAddress', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'ipAddress'])),
            CoreService.fieldFactory('VMware Tools Running', _dwf(['vmware_vm', 'config', 'summary', 'guest', 'toolsStatus']))
        ];
        return {
            fields: fields
        };
    }
]);
