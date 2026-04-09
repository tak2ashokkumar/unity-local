# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
from copy import deepcopy
from django.shortcuts import render

from .models import DatacenterBillingAccount
from .serializers import *
from rest.customer.views import AbstractNonMetaCustomerModelViewSet

from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import detail_route, list_route

from cloud.CloudService.models import ColoCloud

logger = logging.getLogger(__name__)


class DatacenterBillingAccountViewSet(AbstractNonMetaCustomerModelViewSet):
    queryset = DatacenterBillingAccount.objects.all()
    serializer_class = DatacenterBillingAccountSerializer
    lookup_field = 'uuid'
    ordering = ('-created_at')

    def get_queryset(self):
        return self.queryset.filter(
            datacenter__customer=self.request.user.org
        )

    def create(self, request, *args, **kwargs):
        if hasattr(request.data, '_mutable'):
            request.data._mutable = True
        request.data['created_by'] = request.user.id
        datacenters = request.data.pop('datacenters')
        for dc in datacenters:
            dc_uuid = dc.get('dc_uuid')
            dc_billing_obj = DatacenterBillingAccount.objects.filter(datacenter__uuid=dc_uuid)
            if not dc_billing_obj.exists():
                billing_data = deepcopy(request.data)
                billing_data['datacenter'] = {'id': ColoCloud.objects.get(uuid=dc_uuid).id}
                logger.debug("Billing Data : %s", billing_data)
                serializer = DatacenterBillingAccountSerializer(data=billing_data)
            else:
                data = deepcopy(request.data)
                data['datacenter'] = {'id': dc_billing_obj[0].datacenter.id}
                data['redundant_power'] = data['redundant_power'] == 'true'
                logger.debug("Data : %s", data)
                serializer = DatacenterBillingAccountSerializer(dc_billing_obj[0], data=data, partial=True)
            logger.debug(serializer)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return Response({'msg': 'sucess'}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        if hasattr(request.data, '_mutable'):
            request.data._mutable = True
        datacenters = request.data.pop('datacenters')
        request.data['created_by'] = request.user.id
        for dc in datacenters:
            dc_uuid = dc.get('dc_uuid')
            dc_billing_obj = DatacenterBillingAccount.objects.filter(datacenter__uuid=dc_uuid)
            if not dc_billing_obj.exists():
                billing_data = deepcopy(request.data)
                billing_data['datacenter'] = {'id': ColoCloud.objects.get(uuid=dc_uuid).id}
                logger.debug("Billing data : %s", billing_data)
                serializer = DatacenterBillingAccountSerializer(data=billing_data)
            else:
                data = deepcopy(request.data)
                data['datacenter'] = {'id': dc_billing_obj[0].datacenter.id}
                data['redundant_power'] = data['redundant_power'] == 'true'
                logger.debug("Data : %s", data)
                serializer = DatacenterBillingAccountSerializer(dc_billing_obj[0], partial=True, data=data)
            logger.debug(serializer)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({'msg': 'sucess'}, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
        except Exception as e:
            logger.error("Exception while deleting : %s", str(e))
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)
