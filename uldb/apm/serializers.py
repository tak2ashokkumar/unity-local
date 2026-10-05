from django.db import models
from rest_framework import serializers
from app.inventory.models import BMServer
from topology.models import AdvancedNeighborInformation
from app.common.utils import Device
from django.contrib.contenttypes.models import ContentType
from cloud.CloudService.models import PrivateCloudData
from unity_discovery.utils import UnityViewQuerysets
from .models import MonitoredApp,Trace, Metric, Log, APMTopology, BusinessService, BusinessModel, LicenseCostCenter,BusinessModelLicenseCostCentre, ParentApp, TopologyNode
from .utils import extract_status_code, get_status_label
from finops.models import BuildingBlock
from aiops.models import Event
from aiops.models.correlation import Condition
from rest.customer.utils import device_status


class MonitoredAppSerializer(serializers.ModelSerializer):
    parent_app_availability = serializers.SerializerMethodField()
    parent_app_status_code = serializers.SerializerMethodField()

    class Meta:
        model = MonitoredApp
        fields = [
            'id', 'name', 'uuid', 'hostname', 'latency', 'throughput',
            'device_id', 'content_type', 'parent_app', 'customer',
            'type_of_app', 'parent_app_availability', 'parent_app_status_code'
        ]

    def get_parent_app_availability(self, obj):
        if obj:
            return obj.availability
        return None

    def get_parent_app_status_code(self, obj):
        if obj:
            return obj.status_code
        return None
    

class MinimalHealthSerializer(serializers.ModelSerializer):
    """Minimal health serializer"""
    status = serializers.SerializerMethodField()
    components = serializers.SerializerMethodField()
    datetime = serializers.SerializerMethodField()
    
    class Meta:
        model = MonitoredApp
        fields = ['id', 'name', 'status', 'components', 'datetime']
    
    def get_status(self, obj):
        topology = obj.topology.last()
        if not topology or not topology.topology_data:
            return None

        matched_node = next(
            (node for node in topology.topology_data.get('nodes', [])
            if node.get('name') == obj.name),
            None
        )

        status = matched_node.get('status') if matched_node else None
        return get_status_label(status) if status else "Unknown"
    
    def get_datetime(self, obj):
        topology = obj.topology.last()
        if topology:
            return topology.created_at
        return None

    
    def get_components(self, obj):
        topology = obj.topology.last()
        if not topology or not topology.topology_data:
            return []
        
        components = []
        for node in topology.topology_data.get('nodes', []):
            metadata = node.get('metadata', {})
            status = node.get('status')
            
            components.append({
                "name": node.get('name'),
                "type": node.get('layer', node.get('type', 'unknown')),
                "status": get_status_label(status) if status else "Unknown",
                "availability": metadata.get('Availability'),
                "latency": metadata.get('Latency') or metadata.get('P95 Latency'),
                "error_rate": metadata.get('Error Rate')
            })
        
        return components

class OtelDataSerializer(serializers.ModelSerializer):
    metrics = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()
    traces = serializers.SerializerMethodField()
    
    class Meta:
        model = MonitoredApp
        fields = ['id', 'name', 'metrics', 'logs', 'traces']
    
    def get_metrics(self, obj):
        return AppMetricSerializer(obj.metric_set.all()[0:20], many=True).data
    
    def get_logs(self, obj):
        return AppLogSerializer(obj.log_set.all()[0:20], many=True).data
    
    def get_traces(self, obj):
        return AppTraceSerializer(obj.trace_set.all()[0:20], many=True).data


class LogEntrySerializer(serializers.Serializer):
    timestamp = serializers.CharField()
    line = serializers.CharField()

class AppGoupedTraceSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source='app.hostname', read_only=True)
    http_url = serializers.CharField(source='http_route', read_only=True)
    span_id = serializers.SerializerMethodField()
    user_agent = serializers.SerializerMethodField()
    host_port = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = Trace
        fields = [
            'trace_id',
            'service_name',
            'start_time',
            'end_time',
            'hostname',
            'http_url',
            'http_method',
            'sdk_language',
            'span_id',
            'status',
            'user_agent',
            'host_port',
            'status_code',
            
        ]

    def get_span_id(self, obj):
        try:
            spans = obj.raw_data.get("spans", [])
            # Return the first span ID (typically root or entry span)
            if spans:
                return spans[0].get("spanID")
        except Exception:
            pass
        return None

    def get_user_agent(self, obj):
            try:
                spans = obj.raw_data.get("spans", [])
                for span in spans:
                    for tag in span.get("tags", []):
                        if tag.get("key") == "http.user_agent":
                            return tag.get("value")
            except Exception:
                pass
            return None

    def get_host_port(self, obj):
        try:
            spans = obj.raw_data.get("spans", [])
            for span in spans:
                for tag in span.get("tags", []):
                    if tag.get("key") == "net.host.port":
                        return tag.get("value")
        except Exception:
            pass
        return None

    def get_status(self, obj):
        """
        Returns:
            1   success (status_code in 200 to 299)
            0   failure (status_code >= 400)
            -1  missing/None
        """
        try:
            status_code = obj.status_code
            if status_code is None:
                return -1
            elif 200 <= int(status_code) < 300:
                return 1
            else:
                return 0
        except Exception:
            return -1

class AppTraceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trace
        fields = '__all__'
     
class AppMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = Metric
        fields = '__all__'
        
class AppLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = Log
        fields = '__all__'
        
class AppGroupedLogSerializer(serializers.ModelSerializer):
    hostname = serializers.CharField(source='app.hostname', read_only=True)
    application = serializers.SerializerMethodField()
    http_route = serializers.SerializerMethodField()
    file_path = serializers.SerializerMethodField()
    status_code = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    class Meta:
        model = Log
        fields = [
            'status',
            'service_name',
            'created_at',
            'timestamp',
            'hostname',
            'message',
            'file_path',
            'http_route',
            'application',
            'id',
            'status_code'
        ]
        
    
    def get_application(self, obj):
        return obj.resources.get('telemetry.sdk.language') if obj.resources else None
    
    def get_http_route(self, obj):
        return obj.attributes.get('code.function.name') if obj.resources else None
    
    def get_file_path(self, obj):
        return obj.attributes.get('code.file.path') if obj.resources else None
    
    def get_status_code(self, obj):
        return extract_status_code(obj.message)
    
    def get_status(self, obj):
        return obj.severity if obj.severity else "Unknown"

class APMTopologySerializer(serializers.ModelSerializer):
    topology_data = serializers.SerializerMethodField()

    def health_status(self, stat):
        """Return health status string for given code (Python 2)."""
        if stat == 1:
            return "Healthy"
        elif stat == 0:
            return "Critical"
        elif stat == -1:
            return "Unknown"
        else:
            return "Unknown"
    
    def _add_device_node(self, uuid, device=None, all_devices_qs=None, topology_data=None):
        """
        Central helper: ensures node exists in topology_data,
        enriched from device or target_info.
        """
        uuid_str = str(uuid)
        try:
            device = all_devices_qs.filter(uuid=uuid).first()
        except Exception as e:
            return
        if any(str(node.get("uuid")) == uuid_str for node in topology_data.get("nodes", [])):
            return

        if not device:
            return

        if isinstance(device, BMServer):
            device = device.server

        # Get status
        status_value = -1
        status = getattr(device, "status", None)
        if isinstance(status, basestring):
            status = status.upper()
            status_value = 1 if status == "UP" else 0 if status == "DOWN" else -1
        else:
            fallback = device_status(device)
            if fallback is not None:
                status_value = int(fallback)

        node_info = {
            "layer": "host/infrastructure",
            "type": "host/infrastructure",
            "name": device.name,
            "uuid": uuid_str,
            "device_type": getattr(device, "DEVICE_TYPE", "Unknown"),
            "icon": getattr(device, "DEVICE_TYPE", "Unknown"),
            "status": status_value,
            "metadata": {
                "Disk Space": getattr(device, "disk_space", None),
                "CPU speed": getattr(device, "cpu_speed", 0),
                "Memory Used": getattr(device, "used_memory", 0),
                "Storage": getattr(device, "storage", 0),
                "IP address": getattr(device, "ip_address", None),
                "name": device.name,
                "Status": self.health_status(status_value),
            }
        }

        topology_data.setdefault("nodes", []).append(node_info)

        # DB sync
        content, device_id = self.device_obj(device)
        TopologyNode.objects.update_or_create(
            topology=self.instance,
            node_id="host/infrastructure",
            uuid=uuid_str,
            defaults={
                "name": device.name,
                "status": status_value,
                "device_id": device_id,
                "content_type": content,
            }
        )

    def _get_first_neighbors(self, device_uuid, all_devices_qs, topology_data, customer=None):
        """
        Get only first-level neighbors (direct connections).
        """
        device_uuid_str = str(device_uuid)
        
        # Find all direct neighbors
        neighbors = AdvancedNeighborInformation.objects.filter(
            customer=customer
        ).filter(
            models.Q(target_uuid=device_uuid_str) | models.Q(source_uuid=device_uuid_str)
        ).exclude(source_uuid=models.F("target_uuid")).distinct()
        
        for neighbor in neighbors:
            # Determine the neighbor's UUID (the one that's not our device)
            if str(neighbor.source_uuid) == device_uuid_str:
                neighbor_uuid_str = str(neighbor.target_uuid)
            else:
                neighbor_uuid_str = str(neighbor.source_uuid)
            
            # Add neighbor node
            self._add_device_node(
                uuid=neighbor_uuid_str,
                all_devices_qs=all_devices_qs,
                topology_data=topology_data
            )
            
            # Add link between device and neighbor
            link_exists = any(
                (link.get("source_uuid") == device_uuid_str and 
                 link.get("target_uuid") == neighbor_uuid_str) or
                (link.get("source_uuid") == neighbor_uuid_str and 
                 link.get("target_uuid") == device_uuid_str)
                for link in topology_data.get("links", [])
            )
            
            if not link_exists:
                topology_data.setdefault("links", []).append({
                    "source_uuid": device_uuid_str,
                    "target_uuid": neighbor_uuid_str
                })

    def device_obj(self, device):
        if isinstance(device, BMServer):
            device = device.server
        content_type = ContentType.objects.get_for_model(device.__class__)
        return content_type, device.id

    def get_topology_data(self, obj, user_id=None):
        request = self.context.get("request")
        user = None

        if request:
            user = request.user
        elif "user" in self.context:
            user = self.context["user"]

        topology_data = obj.topology_data
        if not topology_data:
            return topology_data

        device = obj.app.device
        if not device:
            return topology_data

        if isinstance(device, BMServer):
            device = device.server

        device_uuid = str(device.uuid)

        application_node = None
        for node in topology_data.get("nodes", []):
            if node.get("type") == "application":
                application_node = node
                break

        if not application_node:
            return topology_data
        
        application_uuid = application_node["uuid"]
        
        # Get device status
        status_value = -1
        status = getattr(device, "status", None)
        if isinstance(status, basestring):
            status = status.upper()
            status_value = 1 if status == "UP" else 0 if status == "DOWN" else -1
        else:
            fallback = device_status(device)
            if fallback is not None:
                status_value = int(fallback)

        # Create device node
        device_node = {
            "layer": "host/infrastructure",
            "type": "host/infrastructure",
            "name": device.name,
            "uuid": device_uuid,
            "device_type": getattr(device, "PLATFORM_TYPE", ""),
            "icon": getattr(device, "PLATFORM_TYPE", ""),
            "status": status_value,
            "metadata": {
                "Disk Space": getattr(device, "disk_space", 0),
                "CPU speed": getattr(device, "cpu_speed", 0),
                "Memory Used": getattr(device, "used_memory", 0),
                "Storage": getattr(device, "storage", 0),
                "IP address": getattr(device, "ip_address", 0),
                "name": device.name,
                "Status": self.health_status(status_value),
            }
        }
        
        # Save to DB
        content, device_id = self.device_obj(device)
        TopologyNode.objects.update_or_create(
            topology=self.instance,       
            node_id="host/infrastructure",
            uuid=device.uuid,
            defaults={     
                "name": device.name,
                "status": status_value,
                "device_id": device_id,
                "content_type": content,
            }
        )
        
        # Get first neighbors only
        all_devices_qs = (
            UnityViewQuerysets(customer=obj.app.customer, user=user, include="devices")
            .get_queryset_chain.annotate_querysets()
        )
        
        # Add first neighbors
        self._get_first_neighbors(
            device_uuid, 
            all_devices_qs, 
            topology_data, 
            customer=obj.app.customer
        )
        
        # Get cloud data (same as before)
        def get_cloud_attr(attr_path, default=None):
            paths = [
                ['cloud'] + attr_path.split('.'),
                ['private_cloud'] + attr_path.split('.')
            ]
            for path in paths:
                try:
                    result = device
                    for p in path:
                        result = getattr(result, p)
                    if result:
                        return result
                except AttributeError:
                    continue
            return default

        has_cloud = hasattr(device, 'cloud') or hasattr(device, 'private_cloud')

        cloud = None
        if has_cloud:
            content, device_id = self.device_obj(device)
            data = PrivateCloudData.objects.get(private_cloud__uuid=get_cloud_attr("uuid")).data
            cloud_status = get_cloud_attr("status") or 1
            cloud = {
                "name": get_cloud_attr("name"),
                "type": "Cloud",
                "layer": "Cloud",
                "device_type": "pccloud",
                "icon": "Cloud",
                "status": cloud_status,
                "uuid": get_cloud_attr("uuid"),
                "metadata": {
                    "Disk Utilization": "{}%".format(data.get('disk_utilization', {}).get('value', 0)),
                    'RAM Utilization': "{}%".format(data.get('ram_utilization', {}).get('value', 0)),
                    'vCPU Utilization': "{}%".format(data.get('vcpu_utilization', {}).get('value', 0)),
                    "Status": self.health_status(cloud_status),
                    'VMs': get_cloud_attr("vms_count"),
                    "name": get_cloud_attr("name"),
                }
            }
            TopologyNode.objects.update_or_create(
                topology=self.instance,       
                node_id="Cloud",
                uuid=get_cloud_attr("uuid"),
                defaults={     
                    "name": get_cloud_attr("name"),
                    "status": cloud_status,
                    "device_id": device_id,
                    "content_type": content,
                    "type": get_cloud_attr("platform_type")
                }
            )
            if not cloud["uuid"]:
                cloud = None

        # Get DC data (same as before)
        has_colocation = False
        if hasattr(device, 'cloud') and hasattr(device.cloud, 'colocation_cloud'):
            has_colocation = True
        elif hasattr(device, 'private_cloud') and hasattr(device.private_cloud, 'colocation_cloud'):
            has_colocation = True

        dc = None
        dc_status = 1
        if has_colocation:
            dc_name = get_cloud_attr("colocation_cloud.name")
            dc_uuid = get_cloud_attr("colocation_cloud.uuid")
            if dc_name and dc_uuid:
                dc = {
                    "name": dc_name,
                    "type": "Data Center",
                    "layer": "Data Center",
                    "device_type": "colocloud",
                    "icon": "colocloud",
                    "status": dc_status,
                    "uuid": dc_uuid,
                    "metadata": {
                        'location': get_cloud_attr("colocation_cloud.location"),
                        "name": dc_name,
                        "Status": self.health_status(dc_status),
                    }
                }
                if not dc["uuid"]:
                    dc = None

        # Prepare links
        device_links = [{
            "source_uuid": device_uuid,
            "target_uuid": application_uuid,
        }]

        # Add cloud link to device if cloud exists
        if cloud and cloud.get('uuid'):
            device_links.append({
                "source_uuid": cloud['uuid'],
                "target_uuid": device_uuid,
            })

        # Add DC link to cloud if both exist
        if dc and dc.get('uuid') and cloud and cloud.get('uuid'):
            device_links.append({
                "source_uuid": dc['uuid'],
                "target_uuid": cloud.get('uuid'),
            })

        # Add nodes if they don't exist
        if not any(node.get('uuid') == device_uuid for node in topology_data.get('nodes', [])):
            topology_data.setdefault('nodes', []).append(device_node)

        if cloud and cloud.get('uuid'):
            if not any(node.get('uuid') == cloud['uuid'] for node in topology_data.get('nodes', [])):
                topology_data.setdefault('nodes', []).append(cloud)

        if dc and dc.get('uuid'):
            if not any(node.get('uuid') == dc['uuid'] for node in topology_data.get('nodes', [])):
                topology_data.setdefault('nodes', []).append(dc)

        # Add links if they don't exist
        for link in device_links:
            if not any(
                    existing.get('source_uuid') == link['source_uuid'] and
                    existing.get('target_uuid') == link['target_uuid']
                    for existing in topology_data.get('links', [])
            ):
                topology_data.setdefault('links', []).append(link)

        return topology_data

    class Meta:
        model = APMTopology
        fields = ('topology_data',)
            
class BusinessServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessService
        fields = '__all__'
        read_only_fields = ('customer',)
        
    def create(self, validated_data):
        request = self.context.get('request')
        org = getattr(request.user, 'org', None) if request else None
        validated_data['customer'] = org
        return super(BusinessServiceSerializer, self).create(validated_data)
class LicenseCostCenterSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseCostCenter
        fields = '__all__'
        read_only_fields = ('customer',)

    def create(self, validated_data):
        request = self.context.get('request')
        org = getattr(request.user, 'org', None) if request else None
        validated_data['customer'] = org
        return super(LicenseCostCenterSerializer, self).create(validated_data)


class BusinessModelLicenseCostCentreSerializer(serializers.ModelSerializer):
    app_name_id = serializers.PrimaryKeyRelatedField(source='app_name', queryset=ParentApp.objects.all())
    app_name = serializers.CharField(source="app_name.name")
    license_centre = serializers.CharField(source="license_centre.name")
    building_block_code = serializers.CharField(source='building_blocks.building_block_code', default=None)
    building_block_code_id = serializers.PrimaryKeyRelatedField(source='building_blocks', queryset=BuildingBlock.objects.all())
    class Meta:
        model = BusinessModelLicenseCostCentre
        fields = [
            "id",
            "business_service",
            "license_centre",
            "app_name",
            "type_of_app", "business_criticality", "env",
            "deployment_model", "cloud_types", "app_name_id","building_block_code", "building_block_code_id"
        ]

     
class BusinessModelSerializer(serializers.ModelSerializer):
    license_cost_centers = BusinessModelLicenseCostCentreSerializer(many=True)
    business_service = serializers.CharField(source='business_service_name.name')
    
    class Meta:
        model = BusinessModel
        fields = ['description', 'license_cost_centers', 'business_service', 'visibility', 'status']
        
    def create(self, validated_data):
        from .tasks import topology_data_task
        cost_centers_data = validated_data.pop('license_cost_centers', [])
        request = self.context.get('request')
        org = getattr(request.user, 'org', None) if request else None

        # Business service setup
        service_data = validated_data.pop("business_service_name")
        service_obj, _ = BusinessService.objects.get_or_create(
            name=service_data["name"], customer=org
        )
        validated_data["business_service_name"] = service_obj
        validated_data["customer"] = org
        validated_data['created_by'] = request.user
        # Create BusinessModel
        business_service = BusinessModel.objects.create(**validated_data)
        # Create related license cost centres
        for cc_data in cost_centers_data:
            license_name = cc_data.get("license_centre", {}).get("name")

            # Handle license centre
            license_obj = None
            if license_name:
                license_obj, _ = LicenseCostCenter.objects.get_or_create(
                    name=license_name, customer=org
                )

            BusinessModelLicenseCostCentre.objects.create(
                business_service=business_service,
                license_centre=license_obj,
                building_blocks=cc_data.get("building_blocks", {}),
                app_name=cc_data.get("app_name", {}),
                type_of_app=cc_data.get("type_of_app", None),
                business_criticality=cc_data.get("business_criticality", None),
                env=cc_data.get("env", None),
                deployment_model=cc_data.get("deployment_model", None),
                cloud_types=cc_data.get("cloud_types", None),
            )
            parent_app = ParentApp.objects.get(name=cc_data["app_name"])
            topology_data_task.delay(request.user.id,parent_app.id )
        return business_service

    def update(self, instance, validated_data):
        # Extract nested license cost centers data
        from .tasks import topology_data_task
        cost_centers_data = validated_data.pop('license_cost_centers', [])

        # Handle business_service update
        request = self.context.get('request')
        org = getattr(request.user, 'org', None) if request else None

        if 'business_service_name' in validated_data:
            service_data = validated_data.pop('business_service_name')
            service_name = service_data.get('name')
            service_obj, _ = BusinessService.objects.get_or_create(name=service_name, customer=org)
            instance.business_service_name = service_obj

        # Update simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update license cost centers
        # First delete existing ones
        instance.license_cost_centers.all().delete()

        # Then create new ones
        for cc_data in cost_centers_data:
            license_name = cc_data.get('license_centre', {}).get('name')
            if license_name:
                license_obj, _ = LicenseCostCenter.objects.get_or_create(name=license_name, customer=org)
                BusinessModelLicenseCostCentre.objects.create(
                    business_service=instance,
                    license_centre=license_obj,
                    building_blocks=cc_data.get("building_blocks", {}),
                    app_name=cc_data.get('app_name', {}),
                    type_of_app=cc_data.get('type_of_app', None),
                    business_criticality=cc_data.get('business_criticality', None),
                    env=cc_data.get('env', None),
                    deployment_model=cc_data.get('deployment_model', None),
                    cloud_types=cc_data.get('cloud_types', None),
                )
            parent_app = ParentApp.objects.get(name=cc_data["app_name"])
            topology_data_task.delay(request.user.id, parent_app.id)

        return instance


class BusinessModelListSerializer(serializers.ModelSerializer):
    business_name = serializers.IntegerField(source='business_service_name_id')
    business = serializers.CharField(source='business_service_name.name', read_only=True)
    license_cost_centers = BusinessModelLicenseCostCentreSerializer(many=True, read_only=True)
    
    class Meta:
        model = BusinessModel
        fields = [
            'id',
            'business_name',
            'business',
            'license_cost_centers',
            'description',
            'visibility',
            'customer',
            'status',
        ]


class ParentAppSerializer(serializers.ModelSerializer):

    class Meta:
        model = ParentApp
        fields = ['name', 'id', 'customer', 'throughput', 'latency', 'status_code']


class BusinessModelMinLicenseCostCentreSerializer(serializers.ModelSerializer):
    business_unit_name = serializers.CharField(source='business_service.business_service_name.name')
    business_unit_id = serializers.CharField(source='business_service.id')

    class Meta:
        model = BusinessModelLicenseCostCentre
        fields = [
            'business_unit_id',
            'business_unit_name',
        ]

class EventFailureSerializer(serializers.ModelSerializer):
    service = serializers.CharField(source='application.name')
    class Meta:
        model = Event
        fields = (
            'id',
            'uuid',
            'service',
            'description'
        )

class CustomWorkflowSerializer(serializers.Serializer):
    uuid = serializers.UUIDField()
    w_name = serializers.CharField()
    w_description = serializers.CharField(allow_null=True, required=False)
    w_category = serializers.CharField(allow_null=True, required=False)
    w_trigger_type = serializers.CharField(allow_null=True, required=False)
    w_status = serializers.CharField()

from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from .models import APMOnboarding, Runtime

class RuntimeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Runtime
        fields = ['id', 'name', 'display_name']

class APMOnboardingSerializer(serializers.ModelSerializer):
    runtime = serializers.SlugRelatedField(
        many=True,
        queryset=Runtime.objects.all(),
        slug_field='name'
    )

    def validate(self, attrs):
        content_type = attrs.get('content_type')
        device_id = attrs.get('device_id')
        host = attrs.get('host')

        # Existing UI payload sends the selected target's ContentType ID in
        # device_id and its IP address in host. Resolve it here without changing
        # the request or response contract.
        if not content_type and device_id and host:
            try:
                content_type = ContentType.objects.get(pk=device_id)
            except ContentType.DoesNotExist:
                raise serializers.ValidationError({
                    'device_id': 'Invalid target content type.'
                })

            target_model = content_type.model_class()
            if not target_model:
                raise serializers.ValidationError({
                    'device_id': 'Invalid target content type.'
                })

            lookup_fields = []
            model_field_names = set(field.name for field in target_model._meta.get_fields())
            if 'management_ip' in model_field_names:
                lookup_fields.append('management_ip')
            if 'ip_address' in model_field_names:
                lookup_fields.append('ip_address')
            if 'server' in model_field_names:
                lookup_fields.append('server__management_ip')

            target = None
            for lookup_field in lookup_fields:
                target = target_model.objects.filter(**{lookup_field: host}).first()
                if target:
                    break

            if not target:
                raise serializers.ValidationError({
                    'host': 'No target device matches the selected device type and IP address.'
                })

            attrs['content_type'] = content_type
            attrs['device_id'] = target.pk

        if not attrs.get('content_type') or not attrs.get('device_id'):
            raise serializers.ValidationError({
                'device_id': 'A valid target device is required to execute onboarding.'
            })

        return attrs
    class Meta:
        model = APMOnboarding
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']
