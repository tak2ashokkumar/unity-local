from rest_framework import serializers
from app.organization.models import OrganizationMonitoringConfig, UnityModules
from django.contrib.contenttypes.models import ContentType
from django.core.exceptions import ValidationError
from django.core.validators import URLValidator

from integ.jira.models import JiraInstance
from integ.jira.serializers import CustomerJiraInstanceSerializer
from rest.core.fields import OrganizationRelatedField, UserRelatedField
from rest_framework.validators import UniqueValidator

from .models import AlertNotificationGroup, OrganizationSettings
from integ.DynamicsCrm.models import CrmInstance
from integ.ServiceNow.models import ServiceNowAccount
from integ.ticketing.models import TicketOrganization
from integ.jira.models import JiraInstance
from integ.DynamicsCrm.serializers import CustomerCrmInstanceSerializer
from integ.ServiceNow.serializers import CustomerServiceNowAccountSerializer
from integ.ticketing.serializers import TicketOrganizationSerializer
from integ.jira.serializers import CustomerJiraInstanceSerializer
from app.user2.models import User
# todo: Move all organization serializers here


class OrgMonitoringConfigSerializer(serializers.ModelSerializer):
    org = OrganizationRelatedField(validators=[
        UniqueValidator(
            queryset=OrganizationMonitoringConfig.objects.all(),
            message='Organization already exsist'
        )])

    class Meta:
        model = OrganizationMonitoringConfig
        fields = ["id", "org"] + [device for device in model.MONITORABLE_DEVICES]

    def build_property_field(self, field_name, model_class):
        # overriding this method to make property field as ChoiceField instead of default ReadOnlyField
        field_class = serializers.ReadOnlyField
        field_kwargs = {}

        if field_name in model_class.MONITORABLE_DEVICES:
            field_class = serializers.ChoiceField
            field_kwargs = {'required': False, 'choices': ['observium', 'zabbix']}

        return field_class, field_kwargs

    def save(self, *args, **kwargs):
        if not self.instance:
            self.instance = self.Meta.model()

        for field, value in self.validated_data.items():
            setattr(self.instance, field, value)

        self.instance.save()


class AlertNotificationGroupSerializer(serializers.ModelSerializer): 
    created_by_name = serializers.SerializerMethodField()
    updated_by_name = serializers.SerializerMethodField()
    users = serializers.SerializerMethodField()

    class Meta:
        model = AlertNotificationGroup
        fields = (
            'uuid',
            'group_name',
            'mode',
            'module',
            'alert_type',
            'filter_type',
            'description',
            'is_enabled',
            'users',
            'webhook_url',
            'filter_rule_meta',
            'custom_filter_meta',
            'created_at',
            'updated_at',
            'created_by',
            'created_by_name',
            'updated_by',
            'updated_by_name',
            'notify',
            'module',
        )

    def __init__(self, *args, **kwargs):
        super(AlertNotificationGroupSerializer, self).__init__(*args, **kwargs)
        self.customer = self.context['customer']
        self.request = self.context['request']

    def get_created_by_name(self, instance):
        if instance.created_by:
            return instance.created_by.get_full_name()
        return None

    def get_updated_by_name(self, instance):
        if instance.updated_by:
            return instance.updated_by.get_full_name()
        return None

    def get_users(self, instance):
        return instance.users.all().values_list('email', flat=True)

    def add_users(self, instance, user_emails):
        users = User.objects.filter(email__in=user_emails)
        instance.users.set(users)

    def update_users(self, instance, user_emails):
        instance.users.clear()
        self.add_users(instance, user_emails)

    def validate(self, data):
        webhook_url = data.get('webhook_url', None)
        if webhook_url:
            try:
                validator = URLValidator()
                validator(webhook_url)
            except ValidationError:
                raise serializers.ValidationError({'webhook_url': 'Webhook URL is not valid'})
        name = data.get('group_name', None)
        instance_id = self.instance.id if self.instance else None
        if AlertNotificationGroup.objects.filter(group_name=name, customer=self.customer).exclude(id=instance_id).exists():
            raise serializers.ValidationError({'group_name': 'Group Name Already Exists.'})
        return data

    def save(self, *args, **kwargs):
        data = {
            'customer': self.customer
        }
        if self.instance:
            data['updated_by'] = self.request.user
        else:
            data['created_by'] = self.request.user
        return super(AlertNotificationGroupSerializer, self).save(**data)


# class TicketingInstanceRelatedField(serializers.RelatedField):

#     def to_representation(self, value):
#         if isinstance(value, CrmInstance):
#             return CustomerCrmInstanceSerializer(value).data
#         elif isinstance(value, ServiceNowAccount):
#             return CustomerServiceNowAccountSerializer(value).data
#         else:
#             return str(value)

#     # def get_queryset(self):
#     #     crm_content_type = ContentType.objects.get_for_model(CrmInstance)
#     #     service_now_content_type = ContentType.objects.get_for_model(ServiceNowAccount)
#     #     return ContentType.objects.filter(pk__in=[crm_content_type.pk, service_now_content_type.pk])


class CustomerOrganizationSettingsSerializer(serializers.ModelSerializer):
    ticketing_instance = serializers.SerializerMethodField()
    organization_name = serializers.SerializerMethodField()
    organization_uuid = serializers.SerializerMethodField()

    def get_ticketing_instance(self, obj):
        value = obj.ticketing_instance
        if isinstance(value, CrmInstance):
            data = CustomerCrmInstanceSerializer(value).data
            return {
                'default': data.get('is_default', None),
                'name': data.get('name'),
                'type': "DynamicsCrm",
                'uuid': data.get('uuid')
            }
        elif isinstance(value, ServiceNowAccount):
            data = CustomerServiceNowAccountSerializer(value).data
            return {
                'default': data.get('is_default', None),
                'name': data.get('name'),
                'type': "ServiceNow",
                'uuid': data.get('uuid')
            }
        elif isinstance(value, JiraInstance):
            data = CustomerJiraInstanceSerializer(value).data
            return {
                'default': data.get('is_default', None),
                'name': data.get('name'),
                'type': "Jira",
                'uuid': data.get('uuid')
            }
        else:
            return None

    def get_organization_name(self, obj):
        return obj.organization.name

    def get_organization_uuid(self, obj):
        return obj.organization.uuid

    class Meta:
        model = OrganizationSettings
        fields = '__all__'


class UnityModulesSerializer(serializers.ModelSerializer):
    class Meta:
        model = UnityModules
        fields = '__all__'
