# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from collections import OrderedDict

import ast
import urllib

from django.db.models import Q

from rest_framework import status, views, viewsets
from rest_framework.decorators import detail_route, list_route
from rest_framework.filters import SearchFilter
from rest_framework.response import Response

from app.rbac.models import (
    Module,
    RBACPermission,
    RBACEntityGroup,
    RBACEntityObject,
    RBACPermissionSet,
    RBACRole,
    RBACUserGroup
)
from app.rbac.serializers import (
    ModuleSerializer,
    RBACPermissionSerializer,
    RBACEntityGroupSerializer,
    RBACEntityGroupFastSerializer,
    RBACEntityObjectSerializer,
    RBACPermissionSetSerializer,
    RBACRoleSerializer,
    RBACUserGroupSerializer
)
from app.rbac.utils import RBACModelManager
from rest.customer.utils import convert_dates_to_timezone


class ListRegisteredRbacModels(views.APIView):

    def get(self, request, *args, **kwargs):
        unity_module = request.query_params.get("module", None)
        registered_models_data = RBACModelManager.get_registered_models_data()
        if unity_module:
            module = Module.objects.filter(name__icontains=unity_module).first()
            if not module:
                return Response({"error": "Invalid Module."}, status=status.HTTP_400_BAD_REQUEST)
            registered_models_data = RBACModelManager.get_module_registered_model_data(module.name)
        registered_models_data.sort(key=lambda x: x["name"])
        return Response(registered_models_data, status=status.HTTP_200_OK)


class ModuleViewSet(viewsets.ModelViewSet):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    lookup_field = "id"

    def get_serializer_context(self):
        context = super(ModuleViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        module_type = self.request.query_params.get("msp", None)
        queryset = self.queryset
        filters = {}
        if module_type:
            if str(module_type).lower() == "true":
                filters["is_msp"] = True
            else:
                filters["is_msp"] = False
        return queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class RBACPermissionViewSet(viewsets.ModelViewSet):
    queryset = RBACPermission.objects.select_related("module").all()
    serializer_class = RBACPermissionSerializer
    lookup_field = "id"

    def get_serializer_context(self):
        context = super(RBACPermissionViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        module_names = self.request.query_params.getlist("module", [])
        queryset = self.queryset
        filters = {}
        if module_names:
            filters["module__name__in"] = module_names
        return queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    @list_route(methods=["GET"])
    def permission_modules(self, request, *args, **kwargs):
        modules = Module.objects.filter(is_msp=False).order_by("name")
        permission_module_data = []
        for module in modules:
            permission_names = RBACPermission.objects.filter(module=module).values_list("name", flat=True)
            formatted_data = OrderedDict([
                ("module_name", module.name),
                ("permission_names", permission_names)
            ])
            permission_module_data.append(formatted_data)
        return Response(permission_module_data, status=status.HTTP_200_OK)


class RBACEntityGroupViewSet(viewsets.ModelViewSet):
    queryset = RBACEntityGroup.objects.all()
    serializer_class = RBACEntityGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "description"]
    lookup_field = "uuid"

    def _get_timezone(self):
        cookie_tz = self.request.COOKIES.get("unity-timezone")
        if cookie_tz:
            return ast.literal_eval(urllib.unquote(cookie_tz))
        return "UTC"

    def get_serializer_context(self):
        context = super(RBACEntityGroupViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        group_status = self.request.query_params.get("status", None)
        start_date = self.request.query_params.get("from", None)
        end_date = self.request.query_params.get("to", None)
        filters = {
            "customer": self.request.user.org
        }
        if group_status:
            if str(group_status).lower() == "true":
                filters["is_active"] = True
            else:
                filters["is_active"] = False
        if start_date and end_date:
            request_timezone = self._get_timezone()
            from_date, to_date = convert_dates_to_timezone(start_date, end_date, request_timezone)
            filters["created_at__range"] = (from_date, to_date)
        return self.queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        data = request.data
        model_objects = data.get("group_objects", [])
        module_models = data.get("module_models", [])
        serializer = self.get_serializer(data=data, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            if instance.entity_selection.lower() == "custom":
                instance.add_or_update_module_model_objects(model_objects)
            instance.add_content_types(module_models)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        old_entity_selection = instance.entity_selection
        data = request.data
        model_objects = data.get("group_objects", [])
        module_models = data.get("module_models", [])
        serializer = self.get_serializer(instance, data=data, partial=True, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            if instance.entity_selection != old_entity_selection:
                instance.rbac_model_group_objects.all().delete()
            if instance.entity_selection.lower() == "custom":
                instance.add_or_update_module_model_objects(model_objects)
            instance.update_content_types(module_models)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=["GET"])
    def toggle_status(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = not instance.is_active
        instance.save()
        return Response({"detail": "Status Updated Successfully."}, status=status.HTTP_200_OK)


class RBACEntityGroupFastViewSet(RBACEntityGroupViewSet):
    serializer_class = RBACEntityGroupFastSerializer

    def get_serializer_context(self):
        context = super(RBACEntityGroupFastViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class RBACEntityObjectViewSet(viewsets.ModelViewSet):
    queryset = RBACEntityObject.objects.all()
    serializer_class = RBACEntityObjectSerializer
    lookup_field = "id"

    def get_serializer_context(self):
        context = super(RBACEntityObjectViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        group_uuids = self.request.query_params.getlist("group_uuid", [])
        filters = {"group__customer": self.request.user.org}
        if group_uuids:
            filters["group__uuid__in"] = group_uuids
        queryset = self.queryset.select_related("group").filter(**filters)
        return queryset

    def create(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def update(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def destroy(self, request, *args, **kwargs):
        return Response({"detail": "Method not allowed."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class RBACPermissionSetViewSet(viewsets.ModelViewSet):
    queryset = RBACPermissionSet.objects.all()
    serializer_class = RBACPermissionSetSerializer
    filter_backends = [SearchFilter]
    search_fields = [
        "name", "description", "rbac_permissions__name",
        "rbac_permissions__module__name"
    ]
    lookup_field = "uuid"

    def _get_timezone(self):
        cookie_tz = self.request.COOKIES.get("unity-timezone")
        if cookie_tz:
            return ast.literal_eval(urllib.unquote(cookie_tz))
        return "UTC"

    def get_serializer_context(self):
        context = super(RBACPermissionSetViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        module_names = self.request.query_params.getlist("module", [])
        permission_set_status = self.request.query_params.get("status", None)
        is_default = self.request.query_params.get("is_default", None)
        start_date = self.request.query_params.get("from", None)
        end_date = self.request.query_params.get("to", None)
        queryset = self.queryset.filter(
            Q(customer=self.request.user.org) | Q(customer__isnull=True)
        )
        filters = {}
        if module_names:
            filters["rbac_permissions__module__name__in"] = module_names
        if permission_set_status:
            if str(permission_set_status).lower() == "true":
                filters["is_active"] = True
            else:
                filters["is_active"] = False
        if is_default is not None:
            if str(is_default).lower() == "true":
                filters["is_default"] = True
            else:
                filters["is_default"] = False
        if start_date and end_date:
            request_timezone = self._get_timezone()
            from_date, to_date = convert_dates_to_timezone(start_date, end_date, request_timezone)
            filters["created_at__range"] = (from_date, to_date)
        return queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        data = request.data
        serializer = self.get_serializer(data=data, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            serializer.add_or_update_permissions(instance, request.data.get("rbac_permissions", []))
            instance.add_or_update_entity_groups(data.get("entity_groups", []))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data
        serializer = self.get_serializer(instance, data=data, partial=True, context=self.get_serializer_context())
        if serializer.is_valid():
            instance = serializer.save()
            serializer.add_or_update_permissions(instance, request.data.get("rbac_permissions", []))
            instance.add_or_update_entity_groups(data.get("entity_groups", []))
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=["GET"])
    def toggle_status(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = not instance.is_active
        instance.save()
        return Response({"detail": "Status Updated Successfully."}, status=status.HTTP_200_OK)


class RBACRoleViewSet(viewsets.ModelViewSet):
    queryset = RBACRole.objects.all()
    serializer_class = RBACRoleSerializer
    filter_backends = [SearchFilter]
    search_fields = [
        "name", "description", "permissions__name",
        "permissions__rbac_permissions__module__name"
    ]
    lookup_field = "uuid"

    def _get_timezone(self):
        cookie_tz = self.request.COOKIES.get("unity-timezone")
        if cookie_tz:
            return ast.literal_eval(urllib.unquote(cookie_tz))
        return "UTC"

    def get_serializer_context(self):
        context = super(RBACRoleViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        permissions = self.request.query_params.getlist("permission", [])
        module_names = self.request.query_params.getlist("module", [])
        is_default = self.request.query_params.get("is_default", None)
        role_status = self.request.query_params.get("status", None)
        start_date = self.request.query_params.get("from", None)
        end_date = self.request.query_params.get("to", None)
        queryset = self.queryset.filter(
            Q(customer=self.request.user.org) | Q(customer__isnull=True)
        )
        filters = {}
        if permissions:
            filters["rbac_permissions__uuid__in"] = permissions
        if module_names:
            filters["permissions__rbac_permissions__module__name__in"] = module_names
        if role_status:
            if str(role_status).lower() == "true":
                filters["is_active"] = True
            else:
                filters["is_active"] = False
        if is_default is not None:
            if str(is_default).lower() == "true":
                filters["is_default"] = True
            else:
                filters["is_default"] = False
        if start_date and end_date:
            request_timezone = self._get_timezone()
            from_date, to_date = convert_dates_to_timezone(start_date, end_date, request_timezone)
            filters["created_at__range"] = (from_date, to_date)
        return queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            instance.add_or_update_permissions(request.data.get("permissions", []))
            instance.add_users(request.data.get("users", []))
            instance.add_user_groups(request.data.get("user_groups", []))
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            instance.add_or_update_permissions(request.data.get("permissions", []))
            instance.update_users(request.data.get("users", []))
            instance.update_user_groups(request.data.get("user_groups", []))
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=["GET"])
    def toggle_status(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = not instance.is_active
        instance.save()
        return Response({"detail": "Status Updated Successfully."}, status=status.HTTP_200_OK)


class RBACUserGroupViewSet(viewsets.ModelViewSet):
    queryset = RBACUserGroup.objects.all()
    serializer_class = RBACUserGroupSerializer
    filter_backends = [SearchFilter]
    search_fields = [
        "name", "description", "rbac_users__email", "rbac_roles__name"
    ]
    lookup_field = "uuid"

    def _get_timezone(self):
        cookie_tz = self.request.COOKIES.get("unity-timezone")
        if cookie_tz:
            return ast.literal_eval(urllib.unquote(cookie_tz))
        return "UTC"

    def get_serializer_context(self):
        context = super(RBACUserGroupViewSet, self).get_serializer_context()
        context.update({"customer": self.request.user.org, "request": self.request})
        return context

    def get_queryset(self):
        user_emails = self.request.query_params.getlist("user_email", [])
        role_names = self.request.query_params.getlist("role_name", [])
        group_status = self.request.query_params.get("status", None)
        start_date = self.request.query_params.get("from", None)
        end_date = self.request.query_params.get("to", None)
        filters = {
            "customer": self.request.user.org
        }
        if user_emails:
            filters["rbac_users__email__in"] = user_emails
        if role_names:
            filters["rbac_roles__email__in"] = role_names
        if group_status:
            if str(group_status).lower() == "true":
                filters["is_active"] = True
            else:
                filters["is_active"] = False
        if start_date and end_date:
            request_timezone = self._get_timezone()
            from_date, to_date = convert_dates_to_timezone(start_date, end_date, request_timezone)
            filters["created_at__range"] = (from_date, to_date)
        return self.queryset.filter(**filters).order_by("name")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            instance.add_or_update_group_roles(request.data.get("rbac_roles", []))
            instance.add_group_users(request.data.get("rbac_users", []))
            instance.add_user_roles(
                request.data.get("rbac_roles", []),
                request.data.get("rbac_users", [])
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True, context={"request": request})
        if serializer.is_valid():
            instance = serializer.save()
            instance.update_group_users(request.data.get("rbac_users", []))
            instance.add_or_update_group_roles(request.data.get("rbac_roles", []))
            instance.update_user_roles(
                request.data.get("rbac_roles", []),
                request.data.get("rbac_users", [])
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @detail_route(methods=["GET"])
    def toggle_status(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = not instance.is_active
        instance.save()
        return Response({"detail": "Status Updated Successfully."}, status=status.HTTP_200_OK)
