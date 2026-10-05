from django.db import models
from django.contrib.postgres.fields import JSONField
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import json
import uuid
from django.utils import timezone
from app.user2.models import User
from agent.models import AgentConfig

STATUS_CHOICES = (
    ('active', 'Active'),
    ('inactive', 'Inactive'),
)

class Runtime(models.Model):
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Runtime'
        verbose_name_plural = 'Runtimes'
        ordering = ['name']
    
    def __str__(self):
        return self.display_name or self.name

class APMOnboarding(models.Model):
    
    application_name = models.CharField(max_length=200)
    service_name = models.CharField(max_length=200)
    host = models.CharField(max_length=100)
    deployed_date = models.DateTimeField(default=timezone.now)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='active')
    device_id = models.PositiveIntegerField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    device = GenericForeignKey('content_type', 'device_id')
    java_agent_dir = models.TextField(blank=True, default='')
    java_tool_option = models.TextField(blank=True, default='')
    dotnet_runtime_dir = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    tags = models.ManyToManyField('inventory.Tag', blank=True, related_name="apmonboarding_tags")
    runtime = models.ManyToManyField(Runtime, blank=True, related_name="apmonboarding_runtimes")
    project_dir = models.TextField(blank=True, default='')
    log_file_path = models.TextField(blank=True, default='')
    collector = models.ForeignKey(AgentConfig, blank=True, null=True)
    credentials = models.ForeignKey('unity_discovery.DiscoveryCredential',
                                    null=True, blank=True)
    
    class Meta:
        verbose_name = 'Application'
        ordering = ['-created_at']

class ParentApp(models.Model):
    name = models.CharField(max_length=100, default='Unknown')
    status_code = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    hostname = models.CharField(max_length=255, null=True, blank=True)
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)
    throughput = models.CharField(max_length=255, null=True, blank=True)
    latency = models.CharField(max_length=255, null=True, blank=True)
    availability = models.CharField(max_length=255, null=True, blank=True)
    response_time = models.CharField(max_length=255, null=True, blank=True)
    
    def __str__(self):
        return self.name

class MonitoredApp(models.Model):
    APPLICATION_TYPE_CHOICES = [
        ('WEB', 'Web'),
        ('MIDDLEWARE', 'Middleware'),
        ('CLOUD NATIVE APPS', 'Cloud Native Apps'),
        ('DATABASE & CACHE INTERACTIONS', 'Database & Cache Interactions'),
        ('MICROSERVICES & APIs', 'Microservices & APIs'),
    ]
    name = models.CharField(max_length=100)
    uuid = models.UUIDField(default=uuid.uuid4, unique=True)
    hostname = models.CharField(max_length=255, null=True, blank=True)
    latency = models.CharField(max_length=20, null=True, blank=True)
    throughput = models.CharField(max_length=20, null=True, blank=True)
    device_id = models.PositiveIntegerField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    device = GenericForeignKey('content_type', 'device_id')
    parent_app = models.ForeignKey(ParentApp, null=True, blank=True, on_delete=models.CASCADE)
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)
    type_of_app = models.CharField(max_length=50,choices=APPLICATION_TYPE_CHOICES,default='WEB')
    availability = models.CharField(max_length=20, null=True, blank=True)
    status_code = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    response_time = models.CharField(max_length=10, null=True, blank=True, db_index=True)

    class Meta:
        unique_together = ('name', 'content_type', 'device_id', 'parent_app')
    
    def __str__(self):
        return self.name

class Log(models.Model):
    SEVERITY_CHOICES = [
        ('TRACE', 'Trace'),
        ('DEBUG', 'Debug'),
        ('INFO', 'Info'),
        ('WARN', 'Warning'),
        ('ERROR', 'Error'),
        ('FATAL', 'Fatal'),
    ]

    # Core Fields
    timestamp = models.DateTimeField(db_index=True)
    service_name = models.CharField(max_length=255, db_index=True)
    tenant_id = models.CharField(max_length=255, db_index=True)
    message = models.TextField()
    severity = models.CharField(max_length=10, choices=SEVERITY_CHOICES, db_index=True)
    
    # Trace/span context
    trace_id = models.CharField(max_length=32, null=True, blank=True, db_index=True)
    span_id = models.CharField(max_length=16, null=True, blank=True)
    
    # Source context
    file_path = models.CharField(max_length=512, null=True, blank=True)
    function_name = models.CharField(max_length=255, null=True, blank=True)
    line_number = models.IntegerField(null=True, blank=True)
    
    # Additional metadata
    attributes = JSONField(default=dict)
    resources = JSONField(default=dict)
    flags = models.IntegerField(null=True, blank=True)
    
    # System fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    app = models.ForeignKey(MonitoredApp, null=True, blank=True, on_delete=models.CASCADE)
    
    
    class Meta:
        indexes = [
            models.Index(fields=['timestamp', 'severity']),
            models.Index(fields=['service_name', 'tenant_id']),
            models.Index(fields=['trace_id']),
        ]
        ordering = ['-timestamp']

        
        
class Trace(models.Model):
    # Core Fields
    trace_id = models.CharField(max_length=32, db_index=True)
    tenant_id = models.CharField(max_length=255, db_index=True)
    service_name = models.CharField(max_length=255, db_index=True)
    root_operation = models.CharField(max_length=255, db_index=True)
    
    # Timing Information
    start_time = models.DateTimeField(db_index=True)
    end_time = models.DateTimeField(db_index=True)
    duration_ms = models.FloatField(db_index=True)
    
    # Status Information
    status_code = models.CharField(max_length=10, null=True, blank=True, db_index=True)
    is_error = models.BooleanField(default=False, db_index=True)
    error_count = models.IntegerField(default=0)
    
    # HTTP Information (for root spans)
    http_method = models.CharField(max_length=10, null=True, blank=True)
    http_route = models.CharField(max_length=512, null=True, blank=True)
    http_status = models.IntegerField(null=True, blank=True)
    
    # Resource Information
    service_version = models.CharField(max_length=50, null=True, blank=True)
    service_instance = models.CharField(max_length=255, null=True, blank=True)
    sdk_language = models.CharField(max_length=50, null=True, blank=True)
    
    # Span Statistics
    span_count = models.IntegerField()
    error_span_count = models.IntegerField(default=0)
    
    # Additional Data
    attributes = JSONField(default=dict)
    resources = JSONField(default=dict)
    raw_data = JSONField(default=dict)  # Stores the complete trace data
    app = models.ForeignKey(MonitoredApp, null=True, blank=True, on_delete=models.CASCADE)
    
    class Meta:
        indexes = [
            models.Index(fields=['trace_id']),
            models.Index(fields=['tenant_id', 'service_name']),
            models.Index(fields=['start_time', 'end_time']),
            models.Index(fields=['duration_ms']),
            models.Index(fields=['is_error']),
        ]
        ordering = ['-start_time']

        
class Metric(models.Model):
    service = models.CharField(max_length=255)
    tenant = models.CharField(max_length=255)
    metric_name = models.CharField(max_length=255)
    timestamp = models.DateTimeField()
    value = models.FloatField()
    labels = models.TextField()  # Store JSON string here
    app = models.ForeignKey(MonitoredApp, null=True, blank=True, on_delete=models.CASCADE)
    is_active = models.BooleanField(default=False, db_index=True)
    is_created = models.BooleanField(default=False, db_index=True)

    def get_labels_dict(self):
        try:
            return json.loads(self.labels)
        except Exception:
            return {}

    def __unicode__(self):
        return u"{} | {} @ {}".format(self.service, self.metric_name, self.timestamp)
    
class APMTopology(models.Model):
    app = models.ForeignKey(MonitoredApp, null=True, blank=True, on_delete=models.CASCADE, related_name='topology')
    topology_data = JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    
    def __str__(self):
        return str(self.app)
    
class TopologyNode(models.Model):
    topology = models.ForeignKey(APMTopology, related_name='nodes', on_delete=models.CASCADE)
    node_id = models.CharField(max_length=255, db_index=True)  # e.g. service name or UUID
    type = models.CharField(max_length=50, default="service")  # service, db, frontend, etc.
    name = models.CharField(max_length=255)
    status = models.CharField(max_length=10, default="1")  # 1 = OK, 0 = erro, -1 = unknown
    uuid = models.UUIDField(default=uuid.uuid4, editable=False)
    device_id = models.PositiveIntegerField(null=True, blank=True)
    content_type = models.ForeignKey(ContentType, on_delete=models.SET_NULL, null=True, blank=True)
    device = GenericForeignKey('content_type', 'device_id')
    
    def __str__(self):
        return str(self.name)
        
class TopologyEdge(models.Model):
    topology = models.ForeignKey(APMTopology, related_name='edges', on_delete=models.CASCADE)
    edge_id = models.CharField(max_length=255, default=uuid.uuid4, editable=False, unique=True)
    source = models.ForeignKey(TopologyNode, related_name='outgoing_edges', on_delete=models.CASCADE)
    target = models.ForeignKey(TopologyNode, related_name='incoming_edges', on_delete=models.CASCADE)
    latency = models.FloatField(null=True, blank=True)
    throughput = models.FloatField(null=True, blank=True)
    error_rate = models.FloatField(null=True, blank=True)
    status = models.CharField(max_length=10, default="1")  # Optional

    class Meta:
        unique_together = ('topology', 'source', 'target')


## Business Service Name 1st row
class BusinessService(models.Model):
    name = models.CharField(max_length=255,null=True, blank=True)
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)
    metadata = JSONField(default=dict,null=True, blank=True)

    def __str__(self):
        return str(self.name)
    
    @property
    def organization_id(self):
        return self.customer.id
# License Cost

class LicenseCostCenter(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)
    metadata = JSONField(default=dict,null=True, blank=True)
    
    def __str__(self):
        return str(self.name)
    
    @property
    def organization_id(self):
        return self.customer.id

class BusinessModel(models.Model):
    
    visibility_types = (
        ('Private', 'Private'),
        ('Organization', 'Organization'),
    )
    STATUS_CHOICES = (
        ('ENABLE', 'Enable'),
        ('DISABLE', 'Disable'),
    )
    
    business_service_name = models.ForeignKey(BusinessService, on_delete=models.CASCADE)
    description = models.CharField(max_length=255, null=True, blank=True)
    visibility = models.CharField(max_length=50, choices=visibility_types, default=visibility_types[0][0])
    customer = models.ForeignKey('organization.Organization', null=True, blank=True)
    visibility = models.CharField(max_length=50, choices=visibility_types, default=visibility_types[0][0])
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='ENABLE')
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self):
        return str(self.business_service_name)
    
    @property
    def organization_id(self):
        return self.customer.id

class BusinessModelLicenseCostCentre(models.Model):
    
    APPLICATION_TYPE_CHOICES = [
        ('WEB', 'Web'),
        ('MIDDLEWARE', 'Middleware'),
        ('CLOUD NATIVE APPS', 'Cloud Native Apps'),
        ('DATABASE & CACHE INTERACTIONS', 'Database & Cache Interactions'),
        ('MICROSERVICES & APIs', 'Microservices & APIs'),
    ]
    BUSINESS_CRITICALITY = [
        ('CRITICAL', 'Critical'),
        ('HIGH', 'High'),
        ('MEDIUM', 'Medium'),
        ('LOW', 'Low'),
    ]
    APP_ENV = [
        ('PRODUCTION', 'Production'),
        ('PRE PROD', 'Pre-Prod'),
        ('STAGING', 'Staging'),
        ('UAT', 'UAT'),
        ('QA', 'QA'),
        ('TEST', 'Test'),
        ('DEV', 'Dev'),
    ]
    DEPLOYMENT_MODEL = [
        ('ON-PREM', 'On-Prem'),
        ('CLOUD', 'Cloud'),
        ('HYBRID', 'Hybrid'),
        ('MULTI-CLOUD', 'Multi-Cloud'),
    ]
    CLOUD_TYPES = [
        ('AZURE', 'Azure'),
        ('AWS', 'AWS'),
        ('GOOGLE CLOUD', 'Google'),
        ('ORACLE', 'Oracle'),
    ]
    business_service = models.ForeignKey(BusinessModel, related_name='license_cost_centers',null=True, blank=True)
    license_centre = models.ForeignKey(LicenseCostCenter, related_name='license_centers_ind',null=True, blank=True)
    app_name = models.ForeignKey(ParentApp, on_delete=models.CASCADE)
    type_of_app = models.CharField(max_length=50, choices=APPLICATION_TYPE_CHOICES)
    business_criticality = models.CharField(max_length=50, choices=BUSINESS_CRITICALITY)
    env = models.CharField(max_length=50, choices=APP_ENV)
    deployment_model = models.CharField(max_length=50, choices=DEPLOYMENT_MODEL)
    cloud_types = models.CharField(max_length=50, choices=CLOUD_TYPES)
    building_blocks = models.ForeignKey('finops.BuildingBlock', on_delete=models.CASCADE, null=True, blank=True,)

    def __str__(self):
        return str(self.app_name)
    
    @property
    def organization_id(self):
        return self.customer.id


class TopologyCache(models.Model):
    customer = models.ForeignKey("organization.Organization", on_delete=models.CASCADE)
    app = models.ForeignKey("ParentApp", on_delete=models.CASCADE, related_name='topology_cache_data' ,null=True, blank=True)
    layer = models.CharField(max_length=50)
    data = JSONField()
    updated_at = models.DateTimeField(auto_now=True)
    
    
class ImpactAnalysisCache(models.Model):
    customer = models.ForeignKey("organization.Organization", on_delete=models.CASCADE)
    app = models.ForeignKey(ParentApp, on_delete=models.CASCADE)
    data = JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('customer', 'app')
        
class Grouped_graph(models.Model):
    name = models.CharField(max_length=100, null=True, blank=True)
    metrics_group = models.ForeignKey(Metric, on_delete=models.CASCADE)
    customer = models.ForeignKey("organization.Organization", on_delete=models.CASCADE)
    
    def __str__(self):
        return str(self.name)