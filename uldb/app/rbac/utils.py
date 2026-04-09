# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from collections import OrderedDict
from django.apps import apps
from django.contrib.contenttypes.models import ContentType


class RBACModelManager:

    rbac_models = []
    module_model_map = OrderedDict()
    model_module_map = OrderedDict()

    class Modules:
        DATACENTER = "Datacenter"
        DASHBOARD = "Dashboard"

    @classmethod
    def register(cls, model_class, module_names):
        if model_class not in cls.rbac_models:
            cls.rbac_models.append(model_class)
        for module_name in module_names:
            if cls.module_model_map.get(module_name, []):
                if model_class not in cls.module_model_map[module_name]:
                    cls.module_model_map[module_name].append(model_class)
            else:
                cls.module_model_map[module_name] = [model_class]
            if cls.model_module_map.get(model_class, []):
                if module_name not in cls.model_module_map[model_class]:
                    cls.model_module_map[model_class].append(module_name)
            else:
                cls.model_module_map[model_class] = [module_name]

    @classmethod
    def get_content_type_for_model(cls, model):
        content_type = ContentType.objects.get(
            app_label=model._meta.app_label,
            model=model._meta.model_name
        )
        return content_type

    @classmethod
    def get_registered_models_content_type(cls):
        content_types = []
        for model in cls.rbac_models:
            content_type = cls.get_content_type_for_model(model)
            content_types.append(content_type)
        return content_types

    @classmethod
    def get_registered_models_data(cls, module_models=None):
        models = module_models if module_models is not None else cls.rbac_models
        if not models:
            return models
        registered_models_data = []
        for model in cls.rbac_models:
            content_type = cls.get_content_type_for_model(model)
            registered_models_data.append(OrderedDict([
                ("content_type_id", content_type.id),
                ("name", model._meta.verbose_name),
                ("app_label", content_type.app_label),
                ("model", content_type.model)
            ]))
        return registered_models_data

    @classmethod
    def get_module_registered_model_data(cls, module_name):
        models = cls.module_model_map.get(module_name, [])
        registered_models_data = cls.get_registered_models_data(module_models=models)
        return registered_models_data
