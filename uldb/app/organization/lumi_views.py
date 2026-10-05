# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import unicode_literals

from rest_framework import filters, viewsets

from app.organization.lumi_serializers import (
    LumiOrganizationSerializer,
    LumiOrganizationUserSerializer,
)
from app.organization.models import Organization
from app.user2.models import User
from rest.core.permissions import IsULAdmin


class LumiOrganizationViewSet(viewsets.ModelViewSet):
    permission_classes = (IsULAdmin,)
    serializer_class = LumiOrganizationSerializer
    queryset = Organization.objects.filter(is_lumi_org=True).order_by('name')
    filter_backends = (filters.SearchFilter,)
    search_fields = ('name', 'company', 'email', 'uuid')


class LumiOrganizationUserViewSet(viewsets.ModelViewSet):
    permission_classes = (IsULAdmin,)
    serializer_class = LumiOrganizationUserSerializer
    queryset = User.objects.filter(org__is_lumi_org=True).select_related(
        'org').order_by('email')
    filter_backends = (filters.SearchFilter,)
    search_fields = ('email', 'first_name', 'last_name', 'org__name')

    def get_queryset(self):
        queryset = super(LumiOrganizationUserViewSet, self).get_queryset()
        organization_id = self.request.query_params.get('organization_id')
        if organization_id:
            queryset = queryset.filter(org_id=organization_id)
        return queryset
