# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2017 UnitedLayer, LLC.
#
# All Rights Reserved.

from __future__ import absolute_import
from __future__ import unicode_literals

from django.db import IntegrityError
from rest_framework.filters import SearchFilter


from rest.core import *  # brings in rest_framework.status and all that good stuff
from rest.core.serializers import (
    CabinetSerializer,
    CabinetDetailSerializer,
    CageDetailSerializer,
    FirewallSerializer,
    FirewallDetailSerializer,
    LoadBalancerSerializer,
    LoadBalancerDetailSerializer,
    PDUSerializer,
    PDUDetailSerializer,
    ServerDetailSerializer,
    SwitchSerializer,
    SwitchDetailSerializer,
    SystemSerializer,
    VirtualMachineSerializer,
    UserRelatedSerializer,
    OrganizationSerializer,
    OrganizationDetailSerializer,
    StorageInventorySerializer,
)
from rest.customer.views import AbstractNonMetaCustomerModelViewSet

from integ.billing.models import (
    Invoice,
    SalesforceOpportunity
)
from integ.billing.serializers import (
    InvoiceSerializer,
    SalesforceOpportunitySerializer,
)

from rest.core.serpy_serializers import SystemSerializerSerpy

from integ.monitoring.tasks import (
    _observium_get,
    OBSERVIUM_HOSTS
)
from integ.ticketing.tasks import (
    create_zendesk_org,
    create_zendesk_request,
    get_comments,
    get_tickets,
    post_new_comment,
)

from app.inventory.models import (
    Server,
    Switch,
    PDU,
    LoadBalancer,
    Firewall,
    VirtualMachine,
)
from app.datacenter.models import (
    Cabinet,
    Cage,
)
from app.user2.models import (
    AccessType,
    User,
)
from integ.monitoring.models import GraphedPort
from integ.DynamicsCrm.models import CrmInstance
from integ.ServiceNow.models import ServiceNowAccount
from integ.jira.models import JiraInstance
from .models import Organization, AlertNotificationGroup, OrganizationSettings

from .models import OrganizationStorageInventory, OrganizationMonitoringConfig
from .serializers import OrgMonitoringConfigSerializer, AlertNotificationGroupSerializer, CustomerOrganizationSettingsSerializer

from integ.ticketing.models import TicketOrganization
from integ.ticketing.utils import get_zendesk_linked_users, export_user_zendesk

logger = logging.getLogger(__name__)


class OrganizationViewSet(AbstractNonMetaModelViewSet):
    queryset = Organization.objects.all().prefetch_related(
        'ticketorganization',
        'parent_org',
        'users'
    ).order_by('name')
    serializer_class = OrganizationSerializer

    search_fields = ('name', 'uuid')
    filter_fields = ('name', 'uuid')

    def get_serializer_class(self):
        if self.action == 'list':
            return OrganizationSerializer
        return OrganizationDetailSerializer

    @detail_route(methods=['GET'])
    def network_stats(self, request, *args, **kwargs):
        org = self.get_object()
        # synchronous for now
        stats = {
            'day': dict(),
            'week': dict(),
            'month': dict(),
            'year': dict(),
        }
        scales = ['day', 'week', 'month', 'year']
        ports = GraphedPort.objects.filter(organization=org)
        for p in ports:
            for scale in scales:
                stats[scale]['{0!s}:{1!s}'.format(p.switch.name, p.interface_name)] = _observium_get(
                    OBSERVIUM_HOSTS,
                    p.switch.name,
                    p.interface_name,
                    mode='stats',
                    scale=scale
                ).json()
        return Response(stats, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def get_related(self, request, *args, **kwargs):
        obj = self.get_object()
        related_type = request.query_params['related_type']
        type_lookup = {
            'servers': {'model': Server, 'serializer': SystemSerializer},
            'switches': {'model': Switch, 'serializer': SwitchSerializer},
            'pdus': {'model': PDU, 'serializer': PDUSerializer},
            'cabinets': {'model': Cabinet, 'serializer': CabinetSerializer},
            'loadbalancers': {'model': LoadBalancer, 'serializer': LoadBalancerSerializer},
            'firewalls': {'model': Firewall, 'serializer': FirewallSerializer},
        }
        object_set = type_lookup.get(related_type, None)
        if object_set is None:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        related_objects = object_set['model'].objects.filter(customer=obj)
        ctx = {'request': request}
        return Response(object_set['serializer'](related_objects, many=True, context=ctx).data,
                        status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def completeness(self, request, *args, **kwargs):
        obj = self.get_object()

        def _count(cls):
            return cls.objects.filter(customer=obj).count()

        recs = {
            'servers': _count(Server),
            'switches': _count(Switch),
            'pdus': _count(PDU),
            'cabinets': _count(Cabinet),
            'loadbalancers': _count(LoadBalancer),
            'firewalls': _count(Firewall),
        }
        return Response(recs, status=status.HTTP_200_OK)

    @detail_route(methods=['post'])
    def setup(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        logger.info("Creating Zendesk organization for org name: %s"
                    % org.name)
        # @formatter:off
        request_meta = {
            k: v for k, v in request.META.iteritems()
            if k in ('SERVER_NAME', 'SERVER_PORT')
        }
        # @formatter:on
        task = create_zendesk_org.delay(org.name,
                                        org.id,
                                        request_meta=request_meta)
        return TaskResponse(task)

    @detail_route(methods=['get'])
    def get_tickets(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        task = get_tickets.delay(org.ticketorganization.remote_id, org.email)
        return TaskResponse(task)

    @detail_route(methods=['post'])
    def create_request(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        subject = self.request.data['subject']
        description = self.request.data['description']
        task = create_zendesk_request.delay(org.email,
                                            subject,
                                            description)
        return TaskResponse(task)

    @detail_route(methods=['get'])
    def get_comments(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        ticket_id = self.request.query_params.get('ticket_id', None)
        task = get_comments.delay(ticket_id, org.email)
        return TaskResponse(task)

    @detail_route(methods=['post'])
    def post_comment(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        body = self.request.data['body']
        ticket_id = self.request.data['ticket_id']
        task = post_new_comment.delay(ticket_id, org.email, body)
        return TaskResponse(task)

    @detail_route(methods=['get'])
    def get_user_details(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        ctx = {'request': request}
        # @formatter:off
        details = {
            'org': OrganizationSerializer(org, context=ctx, ).data,
            'users': [
                UserRelatedSerializer(user, context=ctx).data
                for user in User.objects.filter(org=org)
            ],
        }
        # @formatter:on
        return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def assets(self, request, pk=None, *args, **kwargs):
        org = self.get_object()
        if org is None:
            details = {"detail": "Not found."}
            return Response(details, status=status.HTTP_404_NOT_FOUND)
        else:
            servers = Server.objects.filter(customer=org)  # .exclude(system_type__system_type='SAN')
            # sans = Server.objects.filter(customer=org).filter(system_type__system_type='SAN')
            virtual_servers = VirtualMachine.objects.filter(customer=org)
            firewalls = Firewall.objects.filter(customers=org)
            load_balancers = LoadBalancer.objects.filter(customers=org)
            switches = Switch.objects.filter(customers=org)
            cabinets = Cabinet.objects.filter(customers=org)
            cages = Cage.objects.filter(customer=org)
            pdus = PDU.objects.filter(customer=org)
            opportunities = SalesforceOpportunity.objects.filter(customer=org)
            invoices = Invoice.objects.filter(opportunity__customer=org)

        ctx = {'request': request}
        _kwargs = dict(context=ctx, many=True)
        details = {
            'servers': ServerDetailSerializer(servers, **_kwargs).data,
            # 'sans': SystemSerializerSerpy(sans, **_kwargs).data,
            'virtual_servers': VirtualMachineSerializer(virtual_servers, **_kwargs).data,
            'firewalls': FirewallDetailSerializer(firewalls, **_kwargs).data,
            'load_balancers': LoadBalancerDetailSerializer(load_balancers, **_kwargs).data,
            'switches': SwitchDetailSerializer(switches, **_kwargs).data,
            'cabinets': CabinetDetailSerializer(cabinets, **_kwargs).data,
            'cages': CageDetailSerializer(cages, **_kwargs).data,
            'pdus': PDUDetailSerializer(pdus, **_kwargs).data,
            'opportunities': SalesforceOpportunitySerializer(opportunities, **_kwargs).data,
            'invoices': InvoiceSerializer(invoices, **_kwargs).data,
        }
        return Response(details, status=status.HTTP_200_OK)

    def _import_user(self, org, data, access_types):
        u = User(**data)
        u.org = org
        u.save(force_insert=True)
        for a in access_types:
            try:
                at = AccessType.objects.get(name=a)
                u.access_types.add(at)
            except AccessType.DoesNotExist:
                logger.error("Attempted to add non-existent access type %s to user %s" % (a, u.email))
        return u

    @detail_route(methods=['POST'])
    def import_salesforce_user(self, request, *args, **kwargs):
        org = self.get_object()
        ctx = {'request': request}
        data = request.data['data']
        logger.debug("Creating user from data: %s" % data)
        access_types = data.pop('access_types')
        try:
            u = self._import_user(org, data, access_types)
        except IntegrityError:
            return Response({'detail': 'User already exists.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as error:
            return Response({'detail': error.message}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserRelatedSerializer(u, context=ctx).data, status=status.HTTP_201_CREATED)

    @detail_route(methods=['POST'])
    def export_user_zendesk(self, request, *args, **kwargs):
        org = self.get_object()
        ctx = {'request': request}
        data = request.data['data']
        try:
            ticket_org = TicketOrganization.objects.get(organization=org)
            export = export_user_zendesk(ticket_org, data)
            u = User.objects.get(email=data.get('email'))
            if export:
                return Response(UserRelatedSerializer(u, context=ctx).data, status=status.HTTP_201_CREATED)
            else:
                return Response({'detail': 'Error while exporting to Zendesk.'}, status=status.HTTP_400_BAD_REQUEST)
        except TicketOrganization.DoesNotExist:
            return Response({'detail': 'Zendesk not linked in Unity.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(UserRelatedSerializer(u, context=ctx).data, status=status.HTTP_201_CREATED)

    @detail_route(methods=['GET'])
    def zendesk_unlinked_users(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        ctx = {'request': request}
        # @formatter:off
        try:
            ticket_org = TicketOrganization.objects.get(organization=org)
            zendesk_users = get_zendesk_linked_users(ticket_org)
            details = {
                'users': [
                    UserRelatedSerializer(user, context=ctx).data
                    for user in User.objects.filter(org=org).exclude(email__in=zendesk_users)
                ],
            }
        except TicketOrganization.DoesNotExist:
            return Response({'detail': 'Zendesk not linked in Unity.'}, status=status.HTTP_400_BAD_REQUEST)
        # @formatter:on
        return Response(details, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def zendesk_linked(self, request, *args, **kwargs):
        org = self.get_object()
        assert isinstance(org, Organization)
        # ctx = {'request': request}
        if org.ticketorganization.remote_id:
            return True
        else:
            return False

    @detail_route(methods=['POST'])
    def manage_logo(self, request, *args, **kwargs):
        try:
            org = self.get_object()
            logo_file = request.FILES.get('logo')
            if logo_file:
                org.logo = logo_file.read()
                org.save()
            return Response({}, status=status.HTTP_200_OK)
        except Exception as error:
            return Response({'error': 'Error while adding company logo.'}, status=status.HTTP_400_BAD_REQUEST)


class OrgStorageViewSet(AbstractNonMetaModelViewSet):
    queryset = OrganizationStorageInventory.objects.all().order_by('storage')
    serializer_class = StorageInventorySerializer


class OrgMonitoringConfigViewSet(AbstractNonMetaModelViewSet):
    queryset = OrganizationMonitoringConfig.objects.all()
    serializer_class = OrgMonitoringConfigSerializer


class AlertNotificationGroupViewSet(AbstractNonMetaCustomerModelViewSet):
    queryset = AlertNotificationGroup.objects.all()
    serializer_class = AlertNotificationGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ['group_name']

    def _filtered_notification_data(self, data, instance=None):
        mode = data.get('mode') or (instance.mode if instance else None)
        if mode in ['email', 'sms']:
            data['webhook_url'] = None
        elif mode == 'ms_teams':
            data['users'] = []
        filter_type = data.get('filter_type') or (instance.filter_type if instance else None)
        if filter_type == 'all':
            data['custom_filter_meta'] = None
            data['filter_rule_meta'] = None
            data['description'] = None
        elif filter_type == 'custom':
            data['filter_rule_meta'] = None
            data['description'] = None
        elif filter_type == 'filters':
            data['custom_filter_meta'] = None
        return data

    def get_serializer_context(self):
        context = super(AlertNotificationGroupViewSet, self).get_serializer_context()
        context.update({'customer': self.request.user.org, 'request': self.request})
        return context

    def get_queryset(self):
        alert_types = self.request.query_params.getlist('alert_type', [])
        group_statuses = self.request.query_params.getlist('status', [])
        notification_modes = self.request.query_params.getlist('mode', [])
        filters = {
            "customer": self.request.user.org
        }
        if alert_types:
            filters["alert_type__overlap"] = alert_types
        if group_statuses:
            status_mapping = {
                'enabled': True,
                'disabled': False
            }
            group_statuses = [status_mapping[group_status] for group_status in group_statuses if group_status.lower() in status_mapping]
            filters["is_enabled__in"] = group_statuses
        if notification_modes:
            filters["mode__in"] = notification_modes
        queryset = self.queryset.filter(**filters)
        return queryset.order_by('group_name')

    def create(self, request, *args, **kwargs):
        data = self._filtered_notification_data(request.data)
        serializer = self.get_serializer(data=data, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            serializer.add_users(instance, data.get('users', []))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = self._filtered_notification_data(request.data, instance)
        serializer = self.get_serializer(instance, data=data, partial=True, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            serializer.update_users(instance, data.get('users', []))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @list_route(methods=['PUT'])
    def toggle_all_notification(self, request, *args, **kwargs):
        toggle_status_value = request['disable']
        uuids = request.data.get('uuids', [])
        toggle_status_map = {
            'true': True,
            'false': False
        }
        toggle_status = toggle_status_map[str(toggle_status_value).lower()]
        AlertNotificationGroup.objects.filter(
            uuid__in=uuids,
            customer=request.user.org
        ).update(is_enabled=toggle_status)
        msg = "All notifications {} successfully".format("enabled" if toggle_status else "disabled")
        return Response(msg, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def toggle_status(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_enabled = not instance.is_enabled
        instance.save()
        return Response({'detail': 'Status Updated Successfully.'}, status=status.HTTP_200_OK)


class CustomerOrganizationSettingsViewSet(AbstractNonMetaCustomerModelViewSet):
    queryset = OrganizationSettings.objects.all()
    serializer_class = CustomerOrganizationSettingsSerializer

    def get_queryset(self):
        return self.queryset.filter(
            organization=self.request.user.org
        )

    def update(self, request, *args, **kwargs):
        ticketing_data = request.data.pop('ticketing_instance', None)
        obj = self.get_object()
        serializer = CustomerOrganizationSettingsSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            instance = serializer.save()

            # Handle the nested ticketing_instance data
            if ticketing_data:
                ticketing_type = ticketing_data.get('type')
                ticketing_uuid = ticketing_data.get('uuid')
                if ticketing_type == "DynamicsCrm":
                    ticketing_obj = CrmInstance.objects.get(uuid=ticketing_uuid)
                elif ticketing_type == "ServiceNow":
                    ticketing_obj = ServiceNowAccount.objects.get(uuid=ticketing_uuid)
                elif ticketing_type == "Jira":
                    ticketing_obj = JiraInstance.objects.get(uuid=ticketing_uuid)
                else:
                    ticketing_obj = None
                instance.ticketing_instance = ticketing_obj
                instance.save()
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.data, status=status.HTTP_200_OK)
