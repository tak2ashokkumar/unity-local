# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2016 UnitedLayer, LLC.
#   All Rights Reserved.

"""views.py
"""

from __future__ import absolute_import
from __future__ import unicode_literals

import ast
import logging
import os
import urllib

from mimetypes import guess_type

from django.http import HttpResponse
from django.utils.dateparse import parse_datetime
from libraries.auditlog.models import LogEntry

from rest_framework import viewsets, status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

from rest.core import AbstractNonMetaModelViewSet
from rest.customer.utils import compare_files, convert_dates_to_timezone
from rest.customer.views import AbstractNonMetaCustomerModelViewSet

from rest.core.serializers import *
from rest.core.serpy_serializers import *

from cloud.vmware.models import ESXi, VM
from cloud.vmware.encoder import VmwareJSONEncoder
from cloud.vmware.tasks import get_by_moid

import cloud.f5.tasks as f5_tasks

from integ.monitoring.utils import get_model_obj
from integ.networking.models import VirtualLoadBalancerReverseProxy
from synchronize.mixins import JobResultViewSetMixin
from app.common.models import AIAgents
from app.common.serializers import AIAgentsSerializer

from .models import (
    DeviceConfigurationData,
    NetworkDevicesGroup,
    Server,
    VirtualLoadBalancer
)
from .serializers import (
    DeviceConfigurationDataSerializer,
    NetworkDevicesGroupSerializer,
    VirtualLoadBalancerSerializer,
    PDUSocketMappingsSerializer
)
from .tasks import restore_configuration_task
from .utils import NETWORK_DEVICES_DEFAULT_FILE_TYPE_MAP, delete_device_configurations
from rest_framework.views import APIView

logger = logging.getLogger(__name__)  # logger from settings.py


class ServerViewSet(AbstractNonMetaModelViewSet):
    queryset = Server.objects.select_related(
        'instance',
        'instance__os',
        'customer',
        'manufacturer',
        'chassis',
        'cabinet',
        'cluster',
        # 'private_cloud'
        # 'system_type',
        'stats',
    ).prefetch_related(
        'disk_set__model',
        'memory_set__model',
        'motherboards',
        # Prefetch('memory', queryset=MotherboardPeripheralMap.objects.all())
    ).all().order_by('name')

    serializer_class = ServerDetailSerializer
    filter_fields = ('name',)
    search_fields = ('name', 'asset_tag')

    def get_serializer_class(self):
        if self.action == 'list':
            return ServerSerializer
        return ServerDetailSerializer

    @detail_route(methods=['POST'])
    def create_raid(self, request, *args, **kwargs):
        """
        Takes a raid definition from request.data.
        """
        system = self.get_object()
        ctx = {'request': request}
        options = request.data['options']
        logger.debug("Creating raid for options: %s" % str(options))
        if options:
            with transaction.atomic():
                raid_config = RaidConfig(
                    type=options['type'],
                    server=system
                )
                raid_config.save()
                for disk in options['disks']:
                    disk_serializer = DiskSerializer(data=disk, context=ctx)
                    if disk_serializer.is_valid():
                        disk_inst = Disk.objects.get(pk=disk_serializer.initial_data['id'])
                        logger.debug("Assigning disk %s to raid_config %s" % (disk_inst, raid_config))
                        disk_inst.raid_config = raid_config
                        disk_inst.save()
                    else:
                        logger.debug("Could not update raid config for disk: %s" % disk)
                        continue
        return Response(self.get_serializer(instance=system, context=ctx).data,
                        status=status.HTTP_201_CREATED)

    @list_route(methods=['POST'])
    def import_from_salesforce(self, request, *args, **kwargs):
        """
        hack to transform requested system_manufacturer from string to a manufacturer
        """
        ctx = {'request': request}
        mfr_name = request.data['system_manufacturer']
        try:
            mfr = ServerManufacturer.objects.get(name=mfr_name)
        except ServerManufacturer.DoesNotExist as e:
            return Response({'details': "Could not find %s" % mfr_name},
                            status=status.HTTP_404_NOT_FOUND)
        sys_mfr_serializer = ServerManufacturerSerializer(mfr, context=ctx)
        request.data['system_manufacturer'] = sys_mfr_serializer.data['url']
        return self.create(request, *args, **kwargs)

    @list_route()
    def get_storage_servers(self, request, *args, **kwargs):
        logger.info('inside get_storage_servers method')
        sanid_list = Instance.objects.filter(instance_type='SAN').values_list('system_id', flat=True)
        if sanid_list:
            system = Server.objects.filter(id__in=sanid_list)
            ctx = {'request': request}
            if system:
                details = {
                    'system': SystemSerializer(system, context=ctx, many=True).data,
                }
                return Response(details, status=status.HTTP_200_OK)
        details = {'detail': 'Not found.'}
        return Response(details, status=status.HTTP_404_NOT_FOUND)

    @detail_route(methods=['GET'])
    def get_customer_details(self, request, *args, **kwargs):
        system = self.get_object()
        ctx = {'request': request}
        if not system.customer:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'customer': OrganizationSerializer(system.customer, context=ctx).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def get_motherboard(self, request, *args, **kwargs):
        system = self.get_object()
        ctx = {'request': request}
        motherboards = Motherboard.objects.all()
        if not motherboards:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'motherboards': MotherboardListSerializer(motherboards, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def system_spec_details(self, request, *args, **kwargs):
        system = self.get_object()

        # Collect total memory, disk and cpu spec details
        details = {
            'disk_spec': system.disk_specs,
            'mem_spec': system.mem_specs,
            'cpu_spec': system.cpu_specs,
        }
        return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_cpus(self, request, *args, **kwargs):
        cpu = CPU.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not cpu:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'cpu': CPUListSerializer(cpu, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_memories(self, request, *args, **kwargs):
        memory = Memory.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not memory:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'memory': MemoryRelatedSerializer(memory, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_nics(self, request, *args, **kwargs):
        nic = NIC.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not nic:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'nic': NICRelatedSerializer(nic, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_ipmis(self, request, *args, **kwargs):
        ipmi = IPMI.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not ipmi:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'ipmi': IPMISerializer(ipmi, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_raids(self, request, *args, **kwargs):
        raid = RAIDControllers.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not raid:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'raid': RAIDControllersSerializer(raid, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_disks(self, request, *args, **kwargs):
        disk = Disk.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not disk:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'disk': DiskListSerializer(disk, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @list_route()
    def avail_motherboards(self, request, *args, **kwargs):
        motherboard = Motherboard.objects.filter(is_allocated=False)
        ctx = {'request': request}
        if not motherboard:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'motherboard': MotherboardListSerializer(motherboard, context=ctx, many=True).data,
            }
            return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def get_virtual_servers(self, request, *args, **kwargs):
        system = self.get_object()
        ctx = {'request': request}
        vminstance = Instance.objects.filter(system_id=system, virtualsystem_id__gt=0)
        details = {"detail": "Not found."}
        if vminstance:
            # @formatter:off
            details = {
                'virtual_instances': [
                    InstanceDetailSerializer(instance, context=ctx).data
                    for instance in vminstance
                ],
            }
            # @formatter:on
            return Response(details, status=status.HTTP_200_OK)
        else:
            return Response(details, status=status.HTTP_404_NOT_FOUND)

    @detail_route(methods=['GET'])
    def virt_spec_details(self, request, *args, **kwargs):
        system = self.get_object()
        vminstance = Instance.objects.filter(system_id=system, virtualsystem_id__gt=0)
        if vminstance:
            virtsystem = VirtualMachine.objects.get(virtualsystem_id=vminstance[0].virtualsystem_id)
            # Collect total memory, disk and cpu spec details
            specs = 'vCPU: ' + str(virtsystem.vcpu) + ' - Memory: ' + str(virtsystem.memory) + ' ' + \
                    virtsystem.memory_measuretype + ' - Disk: ' + str(virtsystem.disk) + ' ' + \
                    virtsystem.disk_measuretype + ' - No of Eths: ' + str(virtsystem.ethports)

            details = {
                'specs': specs,
            }
            return Response(details, status=status.HTTP_200_OK)
        else:
            details = {
                'specs': 'Not found.'
            }
            return Response(details, status=status.HTTP_404_NOT_FOUND)

    @detail_route(methods=['POST'])
    def link_vmware(self, request, *args, **kwargs):
        """
        Attempts to link this object to a VMware object.  Requires at least a `moid` from the VM obj.
        """
        obj = self.get_object()
        choice = request.data
        ctx = {'request': request}
        vmware_esxi = ESXi(hostname=choice['hostname'],
                           moid=choice['moid'],
                           server=obj)
        vmware_esxi.save(force_insert=True)
        return Response(self._echo(context=ctx), status=status.HTTP_202_ACCEPTED)

    @detail_route(methods=['GET'])
    def related_details(self, request, *args, **kwargs):
        ctx = {'request': request}
        server = self.get_object()
        if not server:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            details = {
                'server': ServerDetailSerializer(server, context=ctx).data,
            }
            return Response(details, status=status.HTTP_200_OK)


class BMServerViewSet(AbstractNonMetaModelViewSet):
    queryset = BMServer.objects.select_related(
        'server',
    ).all().order_by('management_ip')
    serializer_class = BMServerSerializer
    filter_fields = ('management_ip',)
    search_fields = ('management_ip', 'port')


class SANViewSet(AbstractNonMetaModelViewSet):
    queryset = SAN.objects.select_related(
        'customer',
        'manufacturer',
        'cabinet',
        'os',
    ).all().order_by('name')

    serializer_class = SANSerializer
    filter_fields = ('name',)
    search_fields = ('name', 'asset_tag')


class VirtualLoadBalancerViewSet(AbstractNonMetaModelViewSet):
    serializer_class = VirtualLoadBalancerSerializer
    queryset = VirtualLoadBalancer.objects.select_related(
        'model',
        'hypervisor',
        'private_cloud',
    ).prefetch_related(
        'customer',
        'hypervisor__manufacturer',
        'service_contracts',
        'vms',
        'hypervisor__cabinet',
        'hypervisor__cabinet',
    ).all()
    lookup_field = 'id'

    def _get_vmo(self, obj, moid):
        vcenter = obj.private_cloud.vcenters.all().first()
        vmo = get_by_moid(vcenter.id, 'VirtualMachine', moid, None)
        return vmo

    def _try_link(self, request, func):
        obj = self.get_object()
        ctx = {'request': request}
        data = request.data
        try:
            func()
            self.get_serializer()
            return Response(self.get_serializer(self.get_object(), context=ctx).data, status=status.HTTP_202_ACCEPTED)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _data_or_404(self, request, func):
        try:
            data = func()
            return Response(data, status=status.HTTP_200_OK)
        except:
            return Response("No data", status=status.HTTP_404_NOT_FOUND)

    @detail_route(methods=['POST'])
    def link_vmware(self, request, *args, **kwargs):
        """
        Attempts to link this object to a VMware object.  Requires at least a `moid` from the VM obj.
        """
        obj = self.get_object()
        ctx = {'request': request}
        choice = request.data

        vmo = self._get_vmo(obj, choice['moid'])

        vmware_vm = VM(name=choice['name'],
                       moid=choice['moid'],
                       is_vlb=True,
                       config=vmo['summary'],
                       load_balancer=obj)
        vmware_vm.save()
        return Response(self._echo(context=ctx), status=status.HTTP_202_ACCEPTED)

    @detail_route(methods=['POST'])
    def refresh_vmware(self, request, *args, **kwargs):
        obj = self.get_object()
        ctx = {'request': request}
        if not hasattr(obj, 'vm'):
            return Response({'detail': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        vm = obj.vm
        vmo = self._get_vmo(obj, obj.vm.moid)
        vm.update_vmo(vmo)
        vm.save()
        return Response(self._echo(context=ctx), status=status.HTTP_202_ACCEPTED)

    @detail_route(methods=['POST'])
    def link_f5(self, request, *args, **kwargs):
        obj = self.get_object()

        def inner():
            data = request.data
            f5 = F5APIPortal(
                api_url=data['hostname'],
                username=data['username'],
                password=data['password'],
                virtual_load_balancer=obj
            )
            f5.save()

        return self._try_link(request, inner)

    @detail_route(methods=['POST'])
    def unlink_f5(self, request, *args, **kwargs):
        obj = self.get_object()

        def inner():
            f5 = obj.api_portal
            f5.delete()

        return self._try_link(request, inner)

    @detail_route(methods=['GET'])
    def f5_virtual_servers(self, request, *args, **kwargs):
        obj = self.get_object()
        portal = obj.api_portal

        def f():
            return f5_tasks.get_virtual_servers(portal.api_url,
                                                portal.username,
                                                portal.password)

        return self._data_or_404(request, f)

    @detail_route(methods=['GET'])
    def f5_info(self, request, *args, **kwargs):
        obj = self.get_object()
        portal = obj.api_portal

        def f():
            creds = (portal.api_url,
                     portal.username,
                     portal.password)
            vs = f5_tasks.get_virtual_servers(*creds)
            pools = f5_tasks.get_pools(*creds)
            nodes = f5_tasks.get_nodes(*creds)
            interfaces = f5_tasks.get_interfaces(*creds)
            self_ips = f5_tasks.get_self_ips(*creds)
            vlans = f5_tasks.get_vlans(*creds)
            result = {
                'virtual_servers': vs['items'],
                'pools': pools['items'],
                'nodes': nodes['items'],
                'interfaces': interfaces['items'],
                'self_ips': self_ips['items'],
                'vlans': vlans['items'],
            }
            return result

        return self._data_or_404(request, f)

    @detail_route(methods=['POST'])
    def configure_proxy(self, request, *args, **kwargs):
        obj = self.get_object()
        data = request.data

        def f():
            vlb_rp = VirtualLoadBalancerReverseProxy()
            vlb_rp.prepopulate(
                name=data['name'],
                backend_url=data['backend_url']
            )
            vlb_rp.virtual_load_balancer = obj
            vlb_rp.save()
            vlb_rp.write_config()

        return self._try_link(request, f)

    @detail_route(methods=['DELETE'])
    def deconfigure_proxy(self, request, *args, **kwargs):
        obj = self.get_object()
        logger.debug('Removing proxy for {0}'.format(obj.name))

        def f():
            rp = obj.vlb_proxy
            assert isinstance(rp, (VirtualLoadBalancerReverseProxy,))
            rp.erase_config()
            rp.delete()

        return self._try_link(request, f)


class VirtualMachineViewSet(AbstractNonMetaModelViewSet):
    queryset = VirtualMachine.objects.select_related(
        'server',
        'cluster',
        'customer',
    ).prefetch_related(
        'os',
        'instance',
        'instance__instanceconnectiondetails_set',
        'instance__os',
        'server__manufacturer'
    ).all()
    serializer_class = VirtualMachineSerializer
    filter_fields = ('name',)
    search_fields = ('name',)

    def get_serializer_class(self):
        if self.action == 'list':
            return VirtualMachineSerializer
        return VirtualMachineDetailSerializer

    @list_route()
    def get_uladmin(self, request, *args, **kwargs):
        """
        todo: remove and use a field
        """
        ulusers = User.objects.filter(org_id=1)
        ctx = {'request': request}
        if not ulusers:
            details = {'detail': 'Not found.'}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        details = {
            'admin_users': UserSerializer(ulusers, many=True, context=ctx).data,
        }
        return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def related_details(self, request, *args, **kwargs):
        """
        todo remove and use a related object
        """
        vsystem = self.get_object()
        # Get corresponding virtual instance
        instance = Instance.objects.get(virtualsystem_id=vsystem.virtualsystem_id)
        ctx = {'request': request}
        # Get Associtated Connection details
        con_list = InstanceConnectionDetails.objects.filter(instance_id=instance.instance_id).values_list('icd_id',
                                                                                                          flat=True)
        conobj = InstanceConnectionDetails.objects.filter(icd_id__in=con_list)
        # @formatter:off
        details = {
            'virtualsystem': VirtualMachineSerializer(vsystem, context=ctx).data,
            'instance': InstanceSerializer(instance, context=ctx).data,
            'conn_details': [
                InstanceConnectionDetailsSerializer(con, context=ctx).data
                for con in conobj
            ],
        }
        # @formatter:on
        return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def system_spec_details(self, request, *args, **kwargs):
        """
        todo remove
        """
        virtsystem = self.get_object()

        # Collect total memory, disk and cpu spec details
        specs = 'vCPU: ' + str(virtsystem.vcpu) + ' - Memory: ' + str(virtsystem.memory) + ' ' + \
                virtsystem.memory_measuretype + ' - Disk: ' + str(virtsystem.disk) + ' ' + \
                virtsystem.disk_measuretype + ' - No of Eths: ' + str(virtsystem.ethports)

        details = {
            'specs': specs,
        }
        return Response(details, status=status.HTTP_200_OK)


class CustomerPDUSocketMappingsViewSet(AbstractNonMetaCustomerModelViewSet):
    queryset = PDUSocketMappings.objects.all()
    serializer_class = PDUSocketMappingsSerializer

    def list(self, request, *args, **kwargs):
        pdu_id = request.GET.get('pdu_id')
        queryset = PDUSocketMappings.objects.filter(pdu_id=pdu_id)
        result = []

        for i in queryset:
            content_type = ContentType.objects.get(id=i.content_type_id)
            model_class = content_type.model_class()
            dev = model_class.objects.get(id=i.device_id)
            device_type = content_type.name.lower().replace(" ", "")

            # check if pdu's cabinet and device's cabinet are same
            if i.pdu.cabinet == dev.cabinet:
                d = {
                    'name': dev.name,
                    'device_type': device_type,
                    'socket_number': i.socket_number,
                    'id': dev.id,
                    'uuid': dev.uuid
                }
                result.append(d)
            else:
                # remove pdu socket mapping if cabinets are different
                i.delete()
        data = {'data': result}
        return Response(data)

    def get_device_object(self, device_type, device_id):
        if device_type == 'otherdevice':
            device_type = 'customdevice'

        content_type = ContentType.objects.get(model=device_type)
        model_class = content_type.model_class()
        device_object = model_class.objects.get(pk=device_id)
        return device_object

    @list_route(methods=['POST'])
    def update_mappings(self, request, *args, **kwargs):
        try:
            pdu_uuid = request.data.get("pdu_uuid", None)
            device_mappings = request.data.get("device_mappings", None
                                               )

            try:
                pdu = PDU.objects.get(uuid=pdu_uuid)
            except PDU.DoesNotExist:
                logger.error("PDU object does not exist")
                return Response('PDU does not exist!', status=status.HTTP_400_BAD_REQUEST)

            for dm in device_mappings:
                device_on_socket = 'id' in dm  # dm.has_key('id')
                try:
                    obj = PDUSocketMappings.objects.get(pdu=pdu, socket_number=dm['socket_number'])
                    if device_on_socket:
                        device_object = self.get_device_object(dm['device_type'], dm['id'])
                        obj.device_object = device_object
                        obj.save()
                        if device_object.DEVICE_TYPE == Device.mac_device:
                            pdu1 = device_object.pdu1
                            pdu2 = device_object.pdu2
                            if not pdu1 or not pdu2:
                                if not pdu1:
                                    device_object.pdu1 = pdu
                                else:
                                    device_object.pdu2 = pdu
                                device_object.save()
                            else:
                                raise Exception('This device is already connected to 2 PDU Sockets')

                    else:
                        device_object = obj.device_object
                        pdu = obj.pdu
                        obj.delete()
                        if device_object and device_object.DEVICE_TYPE == Device.mac_device:
                            pdu1 = device_object.pdu1
                            pdu2 = device_object.pdu2
                            if pdu in [pdu1, pdu2]:
                                if pdu1 == pdu:
                                    device_object.pdu1 = None
                                else:
                                    device_object.pdu2 = None
                                device_object.save()
                        continue
                except PDUSocketMappings.DoesNotExist:
                    if device_on_socket:
                        device_object = self.get_device_object(dm['device_type'], dm['id'])
                        device = PDUSocketMappings.objects.create(
                            pdu=pdu,
                            socket_number=dm['socket_number'],
                            device_object=device_object
                        )
                        logger.debug("PDU socket mapping added for %s", device)
            return Response('success', status=status.HTTP_201_CREATED)
        except Exception as e:
            msg = "Exception while updating pdu socket mapping - {}".format(e)
            logger.error(msg)
            return Response(msg, status=status.HTTP_400_BAD_REQUEST)


class NetworkDevicesGroupViewSet(JobResultViewSetMixin, viewsets.ModelViewSet):
    queryset = NetworkDevicesGroup.objects.all()
    serializer_class = NetworkDevicesGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "firewalls__name", "load_balancers__name", "switches__name"]
    lookup_field = "uuid"

    def _get_timezone(self):
        cookie_tz = self.request.COOKIES.get("unity-timezone")
        if cookie_tz:
            return ast.literal_eval(urllib.unquote(cookie_tz))
        return "UTC"

    def get_serializer_context(self):
        context = super(NetworkDevicesGroupViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        schedule = self.request.query_params.getlist("schedule", [])
        start_date = self.request.query_params.get("start_date", None)
        end_date = self.request.query_params.get("end_date", None)
        filters = {"customer": self.request.user.org}
        if start_date and end_date:
            request_timezone = self._get_timezone()
            from_date, to_date = convert_dates_to_timezone(start_date, end_date, request_timezone)
            filters["created_at__range"] = (from_date, to_date)
        if schedule:
            uuids = []
            for group in queryset:
                schedule_data = group.schedule_meta
                if schedule_data and schedule_data["schedule_type"] in schedule:
                    uuids.append(group.uuid)
            filters["uuid__in"] = uuids
        queryset = self.queryset.filter(**filters).order_by("name")
        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            serializer.add_devices_users_and_user_groups(
                instance,
                request.data.get("devices", []),
                request.data.get("notification", {}).get("email_notify_users", []),
                request.data.get("notification", {}).get("email_notify_groups", [])
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            serializer.update_devices_users_and_user_groups(
                instance,
                request.data.get("devices", []),
                request.data.get("notification", {}).get("email_notify_users", []),
                request.data.get("notification", {}).get("email_notify_groups", [])
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @list_route(methods=["GET"])
    def toggle_status(self, request, *args, **kwargs):
        group_uuid = request.query_params.get("uuid", None)
        group_status = request.query_params.get("status", None)
        if group_uuid and group_status:
            group_instance = NetworkDevicesGroup.objects.get(uuid=group_uuid)
            if str(group_status).lower() == "true":
                group_instance.is_active = True
                group_instance.save()
            else:
                group_instance.is_active = False
                group_instance.save()
            return Response({"detail": "Network Devices Group Status Updated Successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Group UUID or Status was not provided."}, status=status.HTTP_400_BAD_REQUEST)


class DeviceConfigurationDataViewSet(viewsets.ModelViewSet):
    queryset = DeviceConfigurationData.objects.all()
    serializer_class = DeviceConfigurationDataSerializer
    lookup_field = "uuid"

    def get_queryset(self):
        device_type = self.request.query_params.get("device_type", None)
        device_uuid = self.request.query_params.get("device_uuid", None)
        is_encrypted = self.request.query_params.get("is_encrypted", None)
        queryset = self.queryset.filter(customer=self.request.user.org)
        if device_type:
            queryset = queryset.filter(device_type=device_type)
        if device_uuid:
            device_model = get_model_obj(device_type)
            device = device_model.objects.get(uuid=device_uuid)
            queryset = queryset.filter(device_id=device.id)
        if str(is_encrypted).lower() != "none":
            if str(is_encrypted).lower() != "true":
                queryset = queryset.filter(file_password__isnull=True)
            else:
                queryset = queryset.filter(file_password__isnull=False)
        return queryset.order_by("-updated_at")

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @detail_route(methods=["GET"])
    def configuration(self, request, *args, **kwargs):
        instance = self.get_object()
        data = None
        is_valid = False
        device = instance.device_obj
        golden_configuration = self.queryset.filter(
            device_id=instance.device_id,
            device_type=instance.device_type,
            config_file__isnull=False,
            is_golden_config=True,
            customer=request.user.org
        ).order_by("-updated_at").first()
        if instance.config_file:
            path = instance.config_file
            if device.config_device_type in ["f5_ltm", "paloalto_panos"]:
                dir_path = os.path.dirname(path)
                if device.config_device_type == "f5_ltm":
                    path = dir_path + "/extracted-{}/config/bigip_base.conf".format(instance.uuid)
                else:
                    path = dir_path + "/extracted-{}/running-config.xml".format(instance.uuid)
            if golden_configuration:
                golden_config_path = golden_configuration.config_file
                if device.config_device_type in ["f5_ltm", "paloalto_panos"]:
                    dir_path = os.path.dirname(golden_config_path)
                    if device.config_device_type == "f5_ltm":
                        golden_config_path = dir_path + "/extracted-{}/config/bigip_base.conf".format(golden_configuration.uuid)
                    else:
                        golden_config_path = dir_path + "/extracted-{}/running-config.xml".format(golden_configuration.uuid)
                is_valid = compare_files(golden_config_path, path)
            with open(path, "r") as file:
                data = file.read()
        data = {
            "is_valid": is_valid,
            "data": data
        }
        changes = {"action": ["File Opened"]}
        LogEntry.objects.log_create(
            instance,
            action=LogEntry.Action.FILE_OPENED,
            changes=json.dumps(changes),
        )
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=["DELETE"])
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        device = instance.device_obj
        delete_device_configurations(
            request.user.org.id,
            instance.device_type,
            str(device.uuid),
            instance.uuid,
            instance.config_file,
            device.config_device_type,
        )
        instance.delete()
        return Response({"detail": "Device Configuration File Deleted Successfully."}, status=status.HTTP_200_OK)

    @detail_route(methods=["GET"])
    def download(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.config_file:
            return Response({"error": "No Config File Found."}, status=status.HTTP_400_BAD_REQUEST)
        changes = {"action": ["Downloaded Successfully"]}
        LogEntry.objects.log_create(
            instance,
            action=LogEntry.Action.DOWNLOAD,
            changes=json.dumps(changes),
        )
        return Response({"data": instance.config_file}, status=status.HTTP_200_OK)

    @detail_route(methods=["GET"])
    def get_configuration_file(self, request, *args, **kwargs):
        instance = self.get_object()
        if not instance.config_file:
            return Response({"error": "No Config File Found."}, status=status.HTTP_400_BAD_REQUEST)
        mime_type, _ = guess_type(instance.config_file)
        if not mime_type:
            mime_type = "application/octet-stream"
        response = HttpResponse(open(instance.config_file, "rb"), content_type=mime_type)
        config_file_type = NETWORK_DEVICES_DEFAULT_FILE_TYPE_MAP.get(instance.device_obj.config_device_type, None)
        if not config_file_type:
            return Response({"error": "File Type Not Supported."}, status=status.HTTP_400_BAD_REQUEST)
        if instance.device_obj.config_device_type == "cisco_ftd":
            file_name = os.path.basename(instance.config_file)
        else:
            timestamp = instance.created_at.strftime("%Y-%m-%d-%H-%M-%S-%f")
            backup_name = "{}_{}".format(instance.device_name, timestamp)
            backup_name = "_".join(backup_name.split())
            file_name = "{}.{}".format(backup_name, config_file_type)
        response["Content-Disposition"] = 'attachment; filename="{}"'.format(file_name)
        return response

    @list_route(methods=["GET"])
    def running_configuration(self, request, *args, **kwargs):
        device_type = request.query_params.get("device_type", None)
        device_uuid = request.query_params.get("device_uuid", None)
        if not device_type or not device_uuid:
            return Response({"error": "UUID or Device Type was not provided."}, status=status.HTTP_400_BAD_REQUEST)
        data = None
        is_valid = False
        device_model = get_model_obj(device_type)
        device = device_model.objects.get(uuid=device_uuid)
        if not device.is_ncm_enabled:
            return Response({"error": "Network Configuration not enabled for this device."}, status=status.HTTP_400_BAD_REQUEST)
        latest_configuration = self.queryset.filter(
            device_id=device.id,
            device_type=device_type,
            config_file__isnull=False,
            customer=request.user.org
        ).order_by("-updated_at").first()
        golden_configuration = self.queryset.filter(
            device_id=device.id,
            device_type=device_type,
            config_file__isnull=False,
            is_golden_config=True,
            customer=request.user.org
        ).order_by("-updated_at").first()
        if latest_configuration:
            path = latest_configuration.config_file
            if device.config_device_type in ["f5_ltm", "paloalto_panos"]:
                dir_path = os.path.dirname(path)
                if device.config_device_type == "f5_ltm":
                    path = dir_path + "/extracted-{}/config/bigip_base.conf".format(latest_configuration.uuid)
                else:
                    path = dir_path + "/extracted-{}/running-config.xml".format(latest_configuration.uuid)
            if golden_configuration:
                golden_file_path = golden_configuration.config_file
                if device.config_device_type in ["f5_ltm", "paloalto_panos"]:
                    dir_path = os.path.dirname(golden_file_path)
                    if device.config_device_type == "f5_ltm":
                        golden_file_path = dir_path + "/extracted-{}/config/bigip_base.conf".format(golden_configuration.uuid)
                    else:
                        golden_file_path = dir_path + "/extracted-{}/running-config.xml".format(golden_configuration.uuid)
                is_valid = compare_files(golden_file_path, path)
            with open(path, "r") as file:
                data = file.read()
        if data:
            changes = {"action": ["File Opened"]}
            LogEntry.objects.log_create(
                latest_configuration,
                action=LogEntry.Action.FILE_OPENED,
                changes=json.dumps(changes),
            )
        data = {
            "is_valid": is_valid,
            "data": data
        }
        return Response(data, status=status.HTTP_200_OK)

    @list_route(methods=["GET"])
    def startup_configuration(self, request, *args, **kwargs):
        """
            Currently only used for cisco ios and cisco nxos devices
        """
        device_type = request.query_params.get("device_type", None)
        device_uuid = request.query_params.get("device_uuid", None)
        if not device_type or not device_uuid:
            return Response({"error": "UUID or Device Type was not provided."}, status=status.HTTP_400_BAD_REQUEST)
        data = None
        is_valid = False
        device_model = get_model_obj(device_type)
        device = device_model.objects.get(uuid=device_uuid)
        if not device.is_ncm_enabled:
            return Response({"error": "Network Configuration not enabled for this device."}, status=status.HTTP_400_BAD_REQUEST)
        startup_configuration = self.queryset.filter(
            device_id=device.id,
            device_type=device_type,
            is_startup_config=True,
            config_file__isnull=False,
            customer=request.user.org
        ).order_by("-updated_at").first()
        if startup_configuration:
            path = startup_configuration.config_file
            with open(path, "r") as file:
                data = file.read()
                is_valid = True
        if data:
            changes = {"action": ["File Opened"]}
            LogEntry.objects.log_create(
                startup_configuration,
                action=LogEntry.Action.FILE_OPENED,
                changes=json.dumps(changes),
            )
        data = {
            "is_valid": is_valid,
            "data": data
        }
        return Response(data, status=status.HTTP_200_OK)

    @list_route(methods=["GET"])
    def golden_configuration(self, request, *args, **kwargs):
        device_type = request.query_params.get("device_type", None)
        device_uuid = request.query_params.get("device_uuid", None)
        if not device_type or not device_uuid:
            return Response({"error": "UUID or Device Type was not provided."}, status=status.HTTP_400_BAD_REQUEST)
        data = None
        is_valid = False
        device_model = get_model_obj(device_type)
        device = device_model.objects.get(uuid=device_uuid)
        if not device.is_ncm_enabled:
            return Response({"error": "Network Configuration is not enabled for this device."}, status=status.HTTP_400_BAD_REQUEST)
        golden_configuration = self.queryset.filter(
            device_id=device.id,
            device_type=device_type,
            is_golden_config=True,
            config_file__isnull=False,
            customer=request.user.org
        ).order_by("-updated_at").first()
        if golden_configuration:
            path = golden_configuration.config_file
            if device.config_device_type in ["f5_ltm", "paloalto_panos"]:
                dir_path = os.path.dirname(path)
                if device.config_device_type == "f5_ltm":
                    path = dir_path + "/extracted-{}/config/bigip_base.conf".format(golden_configuration.uuid)
                else:
                    path = dir_path + "/extracted-{}/running-config.xml".format(golden_configuration.uuid)
            with open(path, "r") as file:
                data = file.read()
                is_valid = True
        if data:
            changes = {"action": ["File Opened"]}
            LogEntry.objects.log_create(
                golden_configuration,
                action=LogEntry.Action.FILE_OPENED,
                changes=json.dumps(changes),
            )
        data = {
            "is_valid": is_valid,
            "data": data
        }
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=["GET"])
    def restore_configuration(self, request, *args, **kwargs):
        instance = self.get_object()
        device = instance.device_obj
        if not device.collector:
            return Response({"error": "Device has no collector"}, status=status.HTTP_400_BAD_REQUEST)
        if not device.is_ncm_enabled:
            return Response({"error": "Network Configuration not enabled for this device."}, status=status.HTTP_400_BAD_REQUEST)
        task = restore_configuration_task.delay(instance.uuid)
        return Response({"task_id": task.id}, status=status.HTTP_202_ACCEPTED)


class AgentDataFetch(APIView):
    def post(self, request, *args, **kwargs):
        data = request.data
        url = data.get('url', None)
        access_token = data.get('access_token', None)
        http_method = data.get('http_method', None)
        url_data = data.get('url_data', None)
        url_headers = data.get('headers', None)
        if not url or not access_token:
            return Response({'error': 'URL or Access Token was not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            headers = {'access_token': '{}'.format(access_token), 'Content-Type': 'application/json'}
            if url_headers:
                headers.update(url_headers)
            if http_method and http_method in ['PUT', 'PATCH', 'POST']:
                response = requests.post(url, data=url_data, headers=headers)
            else:
                response = requests.get(url, headers=headers)
            
            data = response.json()
        except Exception as e:
            import traceback
            location = traceback.format_exc()
            return Response({'error': str(e), 'location': location}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)


class AgentsListView(viewsets.ModelViewSet):
    queryset = AIAgents.objects.all()
    serializer_class = AIAgentsSerializer

    def get_queryset(self):
        return self.queryset.filter(org=self.request.user.org)