# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.shortcuts import get_object_or_404
from orchestration.agentic_workflow.models import AgenticWorkflow, NodeTypes, WorkflowNode
from rest_framework.decorators import list_route, detail_route
from rest_framework.response import Response
from rest_framework import status, viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework import viewsets, mixins
from rest_framework import generics
from django.db.models import F, Count, Case, When, Value, IntegerField, Q, OuterRef, Subquery, F, Max, Sum
from rest_framework.views import APIView
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.forms.models import model_to_dict
from app.common.utils import EDate
from app.task.response import TaskResponse
from cloud.CloudService.models import PrivateCloudData
from cloud.OpenstackAdapter.models import Tasks
from integ.zabbix.models import ZabbixCustomer
from aiops.constants import EventSeverity, EventStatus

from llm.utils import CustomConditionDetailSerializer
from orchestration.models import OrchestrationTask, Workflow
from private_cloud_cost.resources.models import PrivateCloudDayViceUsage
from .models import BusinessModel, TopologyNode, TopologyCache, ImpactAnalysisCache, Grouped_graph
from integ.zabbix.zabbix_backend_models import ZabbixItems, ZabbixHosts
import time
from django.utils import timezone
from .models import Log, Trace, Metric, MonitoredApp, APMTopology, BusinessService, LicenseCostCenter, ParentApp, BusinessModelLicenseCostCentre
from rest_framework.pagination import PageNumberPagination
from .serializers import AppLogSerializer, AppMetricSerializer, AppTraceSerializer, CustomWorkflowSerializer, MonitoredAppSerializer, \
    AppGoupedTraceSerializer, AppGroupedLogSerializer, APMTopologySerializer, BusinessModelSerializer, \
    BusinessServiceSerializer, LicenseCostCenterSerializer, OtelDataSerializer, ParentAppSerializer, \
    BusinessModelListSerializer, BusinessModelMinLicenseCostCentreSerializer, EventFailureSerializer, MinimalHealthSerializer
from .tasks import build_topology_data_task, impact_analysis_task
from .utils import build_device_contenttype_qs, get_or_create_monitored_app, get_cpu_and_memory_metrics, find_connected_nodes, aggregate, \
    compute_stats, clean_metric_value, merge_topology_data, get_status_summary, build_topology_data, serialize_uuids, filter_topology, \
    get_funnel_data_in_datetime_range, get_returning_customers_categorywise, \
    get_checkout_abandon_rate_by_category, get_customers_kpis, \
    get_new_customers_per_month, get_conversion_rate_per_month, get_total_orders_per_month, \
    get_top_categories_by_product_views, get_traffic_source_row_percentage, get_revenue_by_traffic_source, \
    get_revenue_by_top_category, get_metric_timeseries, get_operational_anomaly_kpis, get_endpoint_from_item, \
    parse_input_datetime, apm_node_status_update
import calendar
import requests
import json
import re
import datetime
from calendar import monthrange
from collections import defaultdict
from django.http import JsonResponse
from aiops.models import Event, InboundDedupAlerts
from aiops.models.correlation import Condition
from aiops.constants import EventStatus
from monitoringtools.models import MonitoringTool
from app.organization.models import Organization
from .constants import (
    get_severity_value,
    OTEL_STATUS_MAP,
    FUNNEL_DATA_CACHE_EASYTRADE,
    OPERATIONAL_ANOMALY_KPIS_DATA,
    SESSIONS,
    NEW_USERS,
    ORDER_SUCCESS_RATE,
    CONVERSION_RATE_EASYTRADE,
    ORDER_PLACED_EASYTRADE,
    ACTIVE_USERS_VS_EVENTS_EASYTRADE,
    SUM_ORDERS_SUBMITTED_EASYTRADE,
    SUM_ORDERS_EXECUTED_REGION_EASYTRADE,
    UNIQUE_CUSTOMERS_EASYTRADE,
    APPLICATION_RESP_EASYTRADE,
    ERROR_RATE_EASYTRADE,
    FAILURE_RATE_EASYTRADE,
    LATENCY_EASYTRADE,
    REVENUE_BY_MARKETING_SOURCE_EASYTRADE,
    REVENUE_BY_REGION_EASYTRADE,
    KPIS_USD_EASYTRADE
)
from dateutil.relativedelta import relativedelta
import pytz
from datetime import datetime, timedelta
from app.inventory.models import BMServer
from aiops.serializers.event_serializers import EventListSerializer
from aiops.serializers.correlation_serializers import ConditionListSerializer, ConditionWebhookSerializer
from aiops.constants import EventSeverity
from rest.customer.utils import (
    get_cpu_utilization_history_timeseries_data,
    get_mem_usage_history_timeseries_data,
    get_disk_read_write_history_timeseries_data,
    get_sys_load_history_timeseries_data
)
from django.contrib.contenttypes.models import ContentType
from rest.customer.utils import device_status
from orchestration.serializers import OrchestrationTaskSerializer, PlaybookDetailSerializer, PlaybookListSerializer
from django.db.models import Prefetch

from django.db.models import (
    F, Value, Case, When, Sum, Q,
    CharField, IntegerField, BooleanField, OuterRef, Subquery
)
from django.core.cache import cache
from rest_framework import status, viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from .models import ParentApp
from .serializers import ParentAppSerializer
from .utils import (
    parse_datetime, get_duration, get_grouping,
    get_grouping_and_slots, build_query, build_query_chunks,
    build_slots, execute_parallel_queries,
    query_loki_range_chunks, query_loki_slot_key_val,
    query_loki_unique_users, calc_conversion_rate, calc_percentages, execute_throttled_queries
)

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import timedelta
REQUEST_TIMEOUT = 90

QUERY_TEMPLATES = {
        "sessions": 'sum(count_over_time({job="load-generator"}[__DUR__]))',
        "carts":    'sum(count_over_time({job="cart"} |~ "(?i)cart"[__DUR__]))',
        "orders":   'sum(count_over_time({job="accounting"} |~ "(?i)order details"[__DUR__]))',
    }
PRODUCT_QUERIES = {
    "Telescopes":  'sum(count_over_time({job="product-catalog"} | json |~ "(?i)telescope"[__WIN__]))',
    "Star Maps":   'sum(count_over_time({job="product-catalog"} | json |~ "(?i)star"[__WIN__]))',
    "Posters":     'sum(count_over_time({job="product-catalog"} | json |~ "(?i)posters"[__WIN__]))',
    "Apparel":     'sum(count_over_time({job="product-catalog"} | json |~ "(?i)apparel"[__WIN__]))',
    "Books":       'sum(count_over_time({job="product-catalog"} | json |~ "(?i)books"[__WIN__]))',
    "Binoculars":  'sum(count_over_time({job="product-catalog"} | json |~ "(?i)binoculars"[__WIN__]))',
    "Gadgets":     'sum(count_over_time({job="product-catalog"} | json |~ "(?i)gadgets"[__WIN__]))',
}
CURRENCY_QUERIES = {
    "CAD": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*CAD"[__WIN__]))',
    "USD": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*USD"[__WIN__]))',
    "INR": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*INR"[__WIN__]))',
    "NZD": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*NZD"[__WIN__]))',
    "CZK": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*CZK"[__WIN__]))',
    "CNY": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "currencyCode.*CNY"[__WIN__]))',
}
TOTAL_QUERY     = 'sum(count_over_time({job="load-generator"}[__WIN__]))'
CONVERTED_QUERY  = 'sum(count_over_time({job="currency"} |~ "Convert conversion"[__WIN__]))'
ORDER_PLACED_QUERY = 'sum(count_over_time({job="checkout"} |~ "order placed"[__WIN__]))'
COUNTRY_QUERIES = {
    "United States": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "country.*United States"[__WIN__]))',
    "Canada": 'sum by (currencyCode) (count_over_time({job="accounting"} |~ "country.*Canada"[__WIN__]))',
}
TRAFFIC_QUERIES = {
    "organic":     'sum(count_over_time({job="load-generator"} |~ "User browsing product:"[__WIN__]))',
    "paid_search": 'sum(count_over_time({job="load-generator"} |~ "User getting ads for category:"[__WIN__]))',
}

import logging
logger = logging.getLogger(__name__)

BASE_DT = (datetime.now() - timedelta(days=25)).replace(
    hour=0, minute=0, second=0, microsecond=0
)  # Remove when Application Data is being saved in Database
MAX_DAYS = 30  # Remove when Application Data is being saved in Database


class APMDataViewSet(viewsets.ViewSet):
    authentication_classes = [TokenAuthentication]
    permission_classes = (IsAuthenticated,)

    @list_route(methods=['POST'], url_path='data_ingest')
    def data_ingestion(self, request):
        """
        Handle incoming monitoring data (logs, metrics, traces)
        Expected payload structure:
        {
            "type": "log|metric|trace",
            "service": "service_name",
            "data": {...},  # The actual monitoring data
            "tenant": "tenant_id",  # Optional tenant identifier
            "time_range": {  # Optional time range
                "start": "isoformat",
                "end": "isoformat"
            }
        }
        """
        data = request.DATA if hasattr(request, 'DATA') else request.data
        data_type = data.get('type')
        if unicode(data.get('tenant')) == unicode(request.user.org):
            if not data_type:
                return Response(
                    {"error": "Missing 'type' field in payload"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            try:
                # Process based on data type
                if data_type == 'log':
                    return self._process_log_data(data)
                elif data_type == 'metric':
                    return self._process_metric_data(data)
                elif data_type == 'trace':
                    return self._process_trace_data(data)
                elif data_type == 'topology':
                    return self._process_topology_data(data)
                else:
                    return Response(
                        {"error": "Unknown data type: {}".format(data_type)},
                        status=status.HTTP_400_BAD_REQUEST
                    )

            except Exception as e:
                return Response(
                    {"error": "Failed to process {} data: {}".format(data_type, str(e))},
                    status=status.HTTP_400_BAD_REQUEST
                )

    def _process_log_data(self, data):
        """Process incoming log data"""
        raw_log_data = data.get('data')
        service = data.get('service')
        tenant = data.get('tenant')
        if not raw_log_data:
            return Response(
                {"error": "Missing log data"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            # Parse the log data (assuming it's a JSON string)
            if isinstance(raw_log_data, (str, unicode)):
                log_entry = json.loads(raw_log_data)
            else:
                log_entry = raw_log_data

            # Extract timestamp - convert from nanoseconds to datetime if needed
            # timestamp_str = log_entry[0]
            # if timestamp_str:
            #     try:
            #         # If timestamp is in nanoseconds
            #         timestamp = datetime.datetime.fromtimestamp(int(timestamp_str) / 1e9)
            #     except ValueError:
            #         # Try ISO format
            #         timestamp = datetime.datetime.fromisoformat(timestamp_str)
            # else:
            timestamp = timezone.now()
            # Create the log entry
            log_json = json.loads(log_entry[1])
            
            device_name = log_json.get('resources', {}).get('device.name', 'unknown')
            device_ip = log_json.get('resources', {}).get('device.ip', 'unknown')
            device_type = log_json.get('resources', {}).get('device.type', 'unknown')
            service_name = service or log_json.get('resources', {}).get('service.name', 'unknown')
            app_name = service or log_json.get('resources', {}).get('application.name', 'unknown')
            app = get_or_create_monitored_app(service_name, device_ip, device_type, device_name, tenant, app_name)

            log = Log.objects.create(
                timestamp=timestamp,
                service_name=service_name,
                tenant_id=log_json.get('resources', {}).get('tenant_id', 'unknown'),
                message=log_json.get('body', ''),
                severity=log_json.get('severity', 'INFO').upper(),
                trace_id=log_json.get('traceid'),
                span_id=log_json.get('spanid'),
                file_path=log_json.get('attributes', {}).get('code.filepath'),
                function_name=log_json.get('attributes', {}).get('code.function'),
                line_number=log_json.get('attributes', {}).get('code.lineno'),
                attributes=log_json.get('attributes', {}),
                resources=log_json.get('resources', {}),
                flags=log_json.get('flags'),
                app=app,
            )
            if log_json.get('severity').upper() == 'ERROR':
                customer = Organization.objects.get(name=log_json.get('resources', {}).get('tenant_id', 'unknown'))
                source = MonitoringTool.unity.get()
                severity_value = get_severity_value(log_json.get('severity').upper())
                Event.objects.update_or_create(
                    customer=customer,
                    event_id=log.id,
                    source=source,
                    source_account_name=source.name,
                    defaults={
                        'device': app.device,
                        'severity': severity_value,
                        'device_name': device_name,
                        'device_type': device_type,
                        'ip_address': app.hostname,
                        'status': EventStatus.open,
                        'description': log.message,
                        'application_name': app.name,
                        'application': app,
                        # 'trigger_id': data['trigger_id'],
                        # 'category_meta': data['application'],
                        'event_datetime': log.timestamp,
                        'apm_log': log,
                        # 'recovered_datetime': recovery_time,
                        # 'event_metric':replace_metric_name(data.get('metric'))
                    }
                )

            return Response(
                {
                    "status": "log processed",
                    "service": service,
                    "log_id": str(log.id),
                    "timestamp": timestamp.isoformat()
                },
                status=status.HTTP_201_CREATED
            )

        except Exception as e:
            return Response(
                {"error": "Failed to process log data: {}".format(str(e))},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_metric_data(self, data):
        from datetime import datetime
        """Process incoming metric data"""
        metric_data = data.get('data')
        service = data.get('service')
        tenant = data.get('tenant')
        if not metric_data:
            return Response(
                {"error": "Missing metric data"},
                status=400
            )

        metric_name = metric_data.get('metric', {}).get('__name__')
        labels_dict = metric_data.get('metric', {})
        device_name = metric_data.get('metric', {}).get('device_name')
        device_ip = metric_data.get('metric', {}).get('device_ip')
        device_type = metric_data.get('metric', {}).get('device_type')
        parent_app = metric_data.get('metric', {}).get('application_name')
        try:
            labels_json = json.dumps(labels_dict)
        except Exception as e:
            labels_json = "{}"  # fallback to empty

        # Define the metrics that should be marked as active
        active_metrics = {
            "system_cpu_utilization_ratio",
            "process_cpu_utilization_ratio",
            "process_memory_virtual_bytes",
            "system_network_connections",
        }

        count = 0
        for value in metric_data.get('values', []):
            try:
                # timestamp_unix = int(value[0])
                # timestamp = datetime.utcfromtimestamp(timestamp_unix)
                timestamp = timezone.now()
                metric_value = float(value[1])
            except Exception:
                continue

            app = get_or_create_monitored_app(service, device_ip, device_type, device_name, tenant, parent_app)

            # Determine if this metric should be active
            is_active_flag = metric_name in active_metrics

            # Create the Metric record
            Metric.objects.create(
                service=service,
                tenant=tenant,
                metric_name=metric_name,
                timestamp=timestamp,
                value=metric_value,
                labels=labels_json,
                app=app,
                is_active=is_active_flag
            )
            count += 1

        return Response(
            {"status": "metrics processed", "service": service, "metrics_received": count},
            status=200
        )

    def _process_trace_data(self, data):
        """Process incoming trace data"""
        trace_data = data.get('data')
        service = data.get('service')
        tenant = data.get('tenant')
        if not trace_data:
            return Response(
                {"error": "Missing trace data"},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            # Extract process tags (metadata)
            processes = trace_data.get('processes', {})
            process_tags = {}
            for process in processes.values():
                for tag in process.get('tags', []):
                    process_tags[tag['key']] = tag['value']

            # Get tenant_id from either request or process tags
            tenant_id = tenant or process_tags.get('tenant_id')
            if not tenant_id:
                return Response(
                    {"error": "Missing tenant information"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get service name from either request or process tags
            service_name = service or process_tags.get('serviceName')

            # Analyze spans to find root span and collect statistics
            spans = trace_data.get('spans', [])
            root_span = None
            error_count = 0
            http_info = {}

            for span in spans:
                # Check for errors
                if any(tag['key'] == 'error' and tag['value'] for tag in span.get('tags', [])):
                    error_count += 1

                # Find root span (no references or CHILD_OF to another trace)
                if not span.get('references'):
                    root_span = span
                elif all(ref['refType'] != 'CHILD_OF' for ref in span.get('references', [])):
                    root_span = span

                # Extract HTTP info from server spans
                if span.get('tags'):
                    for tag in span['tags']:
                        if tag['key'] == 'http.method':
                            http_info['method'] = tag['value']
                        elif tag['key'] == 'http.route':
                            http_info['route'] = tag['value']
                        elif tag['key'] == 'http.status_code':
                            http_info['status'] = tag['value']
                        elif tag['key'] == 'net.peer.ip':
                            http_info['hostip'] = tag['value']

            # Calculate timing information
            # if root_span:
            #     start_time = datetime.datetime.fromtimestamp(root_span['startTime'] / 1e6)
            #     end_time = datetime.datetime.fromtimestamp((root_span['startTime'] + root_span['duration']) / 1e6)
            #     duration_ms = root_span['duration'] / 1000
            #     root_operation = root_span.get('operationName', 'unknown')
            # else:
                # Fallback if no root span found
            start_time = timezone.now()
            end_time = timezone.now()
            duration_ms = 0
            root_operation = 'unknown'
            device_name = next(t['value'] for t in trace_data['processes']['p1']['tags'] if t['key'] == 'device.name')
            device_ip = next(t['value'] for t in trace_data['processes']['p1']['tags'] if t['key'] == 'device.ip')
            device_type = next(t['value'] for t in trace_data['processes']['p1']['tags'] if t['key'] == 'device.type')
            parent_app = next(t['value'] for t in trace_data['processes']['p1']['tags'] if t['key'] == 'application.name')
            # only do get create of app if log exists or else it will read child trace and create child trace app and device obj
            log_exist = Log.objects.filter(service_name=service_name, app__hostname=device_ip)
            if log_exist:
                app = get_or_create_monitored_app(service_name, device_ip, device_type, device_name, tenant, parent_app)
                
                trace = Trace.objects.create(
                    trace_id=trace_data['traceID'],
                    tenant_id=tenant_id,
                    service_name=service_name,
                    root_operation=root_operation,
                    start_time=start_time,
                    end_time=end_time,
                    duration_ms=duration_ms,
                    status_code=str(http_info.get('status')) if http_info.get('status') else None,
                    is_error=error_count > 0,
                    error_count=error_count,
                    http_method=http_info.get('method'),
                    http_route=http_info.get('route'),
                    http_status=http_info.get('status'),
                    service_version=process_tags.get('service.version'),
                    service_instance=process_tags.get('service.instance.id'),
                    sdk_language=process_tags.get('telemetry.sdk.language'),
                    span_count=len(spans),
                    error_span_count=error_count,
                    resources=process_tags,
                    raw_data=trace_data,
                    app=app,
                )
                log_data = Log.objects.filter(trace_id=trace_data['traceID']).first()
                if log_data:
                    source = MonitoringTool.unity.get()
                    severity_str = log_data.severity  # e.g., 'INFO', 'ERROR'
                    severity_value = get_severity_value(severity_str)
                    customer = Organization.objects.get(name=tenant_id)
                    Event.objects.update_or_create(
                        customer=customer,
                        event_id=trace_data['traceID'],
                        source=source,
                        source_account_name=source.name,
                        defaults={
                            'device': app.device,
                            'severity': severity_value,
                            'device_name': device_name,
                            'device_type': device_type,
                            'ip_address': app.hostname,
                            'status': EventStatus.open,
                            'description': log_data.message,
                            'application_name': app.name,
                            'application': app,
                            # 'trigger_id': data['trigger_id'],
                            # 'category_meta': data['application'],
                            'event_datetime': log_data.timestamp,
                            'apm_log': log_data,
                            'apm_trace': trace,
                            # 'recovered_datetime': recovery_time,
                            # 'event_metric':replace_metric_name(data.get('metric'))
                        }
                    )
                return Response(
                    {
                        "status": "trace processed",
                        "trace_id": trace.trace_id,
                        "service": service_name,
                        "tenant": tenant_id,
                        "span_count": len(spans),
                        "error_count": error_count,
                        "duration_ms": duration_ms
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {
                        "status": "Couldn't create Trace instance without log",
                    },
                    status=status.HTTP_200_OK
                )

        except Exception as e:
            return Response(
                {"error": "Failed to process trace data: {}".format(str(e))},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def _process_topology_data(self, data):
        topology_data = data.get('topology')
        device_name = data.get('device_name')
        device_ip = data.get('device_ip')
        device_type = data.get('device_type')
        service = data.get('service')

        try:
            app = MonitoredApp.objects.get(name=service, hostname=device_ip, customer=self.request.user.org)
        except MonitoredApp.DoesNotExist:
            logger.error("No MonitoredApp found for name={}, hostname={}".format(service, device_ip))
            app = None
        zabbix_customer = ZabbixCustomer.objects.filter(customer=self.request.user.org)
        if zabbix_customer.exists():
            zabbix_db_ip = zabbix_customer.first().zabbix_instance.ip_address
        else:
            zabbix_db_ip = None
        # Zabbix Override Step (before saving topology)
        if zabbix_db_ip and topology_data:
            try:
                zabbix_items = ZabbixItems.objects.using(zabbix_db_ip).filter(
                    key='docker.container_info.state.running'
                ).values('host_id', 'value_type', 'unit', 'name', 'item_id', 'host_id', 'key')

                host_ids = [item['host_id'] for item in zabbix_items]
                zabbix_hosts = ZabbixHosts.objects.using(zabbix_db_ip).filter(host_id__in=host_ids).values('host_id', 'host')

                host_map = {h['host_id']: h['host'].lower() for h in zabbix_hosts}

                zabbix_map = {}
                for item in zabbix_items:
                    host_name = host_map.get(item['host_id'])
                    if not host_name:
                        continue

                    last_value = getattr(item, 'lastvalue', None)
                    if last_value is None:
                        continue

                    try:
                        zabbix_map[host_name] = int(last_value)
                    except ValueError:
                        pass

                for node in topology_data.get('nodes', []):
                    if node.get('type') == 'service':
                        svc_name = node.get('name', '').lower()
                        if svc_name in zabbix_map:
                            new_status = zabbix_map[svc_name]
                            node['status'] = new_status
                            node.setdefault('metadata', {})['Status'] = new_status
                            logger.info("Updated status for service {} - {}".format(svc_name, new_status))

            except Exception as e:
                logger.error("Zabbix override failed: {}".format(str(e)))
        if data.get('topology').get('nodes')[0].get('layer') == 'application':
            parent_app = app.parent_app
            parent_app.latency = data.get('topology').get('nodes')[0].get('metadata').get('P95 Latency')
            parent_app.response_time = data.get('topology').get('nodes')[0].get('metadata').get('P95 Response Time')
            parent_app.throughput = data.get('topology').get('nodes')[0].get('metadata').get('Throughput')
            parent_app.save()
        if app:
            topology = APMTopology.objects.create(app=app, topology_data=topology_data)

            # Update parent_app latency and throughput if parent_app exists
            if app.parent_app:
                # Extract latency and throughput from topology_data
                nodes = topology_data.get('nodes', [])
                for node in nodes:
                    metadata = node.get('metadata', {})

                    # Look for latency and throughput in metadata
                    latency = metadata.get('Latency')
                    response_time = metadata.get('P95 Latency') or metadata.get('P95 Response Time')
                    throughput = metadata.get('Throughput')
                    status_code = metadata.get('Status')
                    availability = metadata.get('Availability')
                    # Update parent_app if values are found
                    if latency:
                        app.latency = latency
                    if throughput:
                        app.throughput = throughput
                    if status_code:
                        app.parent_app.status_code = OTEL_STATUS_MAP[status_code]
                        app.status_code = OTEL_STATUS_MAP[status_code]
                    if availability:
                        app.availability = availability
                    if response_time:
                        app.response_time = response_time
                    # If we found values, save and break (assuming first node with data is the relevant one)
                    if latency or throughput:
                        app.parent_app.save()
                        app.save()
                        break

            return Response(
                {
                    "status": "topology successfully processed",
                    "service": service,
                    "topology_id": topology.id
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    "status": "Topology can't be processed without app",
                },
                status=status.HTTP_200_OK
            )


class MetricGroupPagination(PageNumberPagination):
    page_size = 5  # default size
    page_size_query_param = 'page_size'

class MonitoringViewSet(viewsets.ViewSet):

    @list_route(methods=['get'])
    def parent_app_list(self, request):
        queryset = ParentApp.objects.filter(customer=self.request.user.org)
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(hostname__icontains=search)
            )
        serializer = ParentAppSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def applist(self, request):
        app_id = request.GET.get('app_id')
        if app_id:
            queryset = MonitoredApp.objects.filter(customer=self.request.user.org, parent_app=app_id)
        else:
            queryset = MonitoredApp.objects.filter(customer=self.request.user.org)
        search = request.GET.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(hostname__icontains=search)
            )

        def parse_value(value):
            if not value:
                return 0.0
            try:
                match = re.findall(r"[\d.]+", str(value))
                if match:
                    return float(match[0])
                return 0.0
            except Exception:
                return 0.0

        # --- Build numeric lists ---
        throughputs = [parse_value(obj.throughput) for obj in queryset]
        latencies = [parse_value(obj.latency) for obj in queryset]

        availabilities = []
        for obj in queryset:
            try:
                if hasattr(obj, 'availability'):
                    availabilities.append(parse_value(obj.availability))
                else:
                    availabilities.append(0.0)
            except Exception:
                availabilities.append(0.0)
        # --- Compute averages safely (use float division for Python 2) ---
        def avg(values):
            return round(sum(values) / float(len(values)), 2) if values else 0.0

        avg_throughput = avg(throughputs)
        avg_latency = avg(latencies)
        avg_availability = avg(availabilities)

        # --- Serialize data ---
        serializer = MonitoredAppSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        response = paginator.get_paginated_response(paginated_data)

        # --- Add averages to response (string formatting for Py2) ---
        response.data['avg_throughput'] = "%.2f rps" % avg_throughput
        response.data['avg_latency'] = "%.2f ms" % avg_latency
        response.data['avg_availability'] = "%.2f %%" % avg_availability
        return response

    @list_route(methods=['get'])
    def logs(self, request):  # complete logs
        app_id = request.GET.get('uuid')
        queryset = Log.objects.all()
        if app_id:
            queryset = queryset.filter(app__uuid=app_id)
        serializer = AppLogSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def grouped_logs(self, request):   # grouped logs
        app_id = request.GET.get('uuid')
        severity = request.GET.get('severity')
        search = request.GET.get('search')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = Log.objects.filter(app__uuid=app_id)
        if severity:
            queryset = queryset.filter(severity__iexact=severity)
        if search:
            queryset = queryset.filter(
                Q(service_name__icontains=search) | Q(message__icontains=search)
            )

        serializer = AppGroupedLogSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def traces_data(self, request):  # complete traces
        app_id = request.GET.get('uuid')
        trace_id = request.GET.get('trace_id')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = Trace.objects.filter(app__uuid=app_id)
        if trace_id:
            queryset = queryset.filter(trace_id__icontains=trace_id)
        serializer = AppTraceSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def traces(self, request):  # grouped traces
        app_id = request.GET.get('uuid')
        search = request.GET.get('search')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = Trace.objects.filter(app__uuid=app_id)
        if search:
            queryset = queryset.filter(
                Q(service_name__icontains=search) | Q(trace_id__iexact=search)
            )
        serializer = AppGoupedTraceSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def metrics(self, request):  # complete metrics
        app_id = request.GET.get('uuid')
        queryset = Metric.objects.filter(app__uuid=app_id)
        serializer = AppMetricSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    @list_route(methods=['get'])
    def grouped_metrics(self, request):  # grouped metrics
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        queryset = Metric.objects.filter(app__uuid=app_id)

        # Group by metric_name
        grouped_data = defaultdict(list)
        for metric in queryset:
            grouped_data[metric.metric_name].append({
                "timestamp": metric.timestamp,
                "value": metric.value
            })

        # Convert to list of dicts
        grouped_list = [
            {
                "metric_name": metric_name,
                "data": sorted(data, key=lambda x: x["timestamp"])
            }
            for metric_name, data in grouped_data.items()
        ]

        # Paginate grouped metric_name entries
        paginator = MetricGroupPagination()
        paginated = paginator.paginate_queryset(grouped_list, request)
        return paginator.get_paginated_response(paginated)

    @list_route(methods=['get'])
    def topology(self, request):
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        topology_instance = APMTopology.objects.filter(app__uuid=app_id).last()
        if not topology_instance:
            return Response({"error": "No topology found for this app"}, status=status.HTTP_404_NOT_FOUND)

        app = topology_instance.app
        topology_data = model_to_dict(topology_instance)
        if isinstance(topology_data.get("topology_data"), str):
            try:
                topology_data["topology_data"] = json.loads(topology_data["topology_data"])
            except json.JSONDecodeError:
                pass

        nodes = topology_data["topology_data"].get("nodes", [])
        if app:
            node_update = apm_node_status_update(request.user.id,nodes)
            try:
                zabbix_customer = ZabbixCustomer.objects.filter(customer=self.request.user.org)
                if zabbix_customer.exists():
                    zabbix_db_ip = zabbix_customer.first().zabbix_instance.ip_address
                else:
                    zabbix_db_ip = None
                if zabbix_db_ip:
                    host_name = app.device.name + "-" +self.request.user.org.name
                    zabbix_host = ZabbixHosts.objects.using(zabbix_db_ip).filter(host=host_name).first()
                    if not zabbix_host:
                        logger.error("No Zabbix host found for app {}".format(app.name))
                    else:
                        # --- Step 2: Iterate through service nodes ---
                        for node in nodes:
                            if node.get("type") != "service":
                                continue

                            service_name = node.get("name")
                            if not service_name:
                                continue

                            # Construct Zabbix key dynamically
                            key_pattern = 'docker.container_info.state.running["/{}"]'.format(service_name)

                            # --- Step 3: Find matching Zabbix Item ---
                            container_item = ZabbixItems.objects.using(zabbix_db_ip).filter(
                                host_id=zabbix_host.host_id,
                                key=key_pattern
                            ).first()

                            if not container_item:
                                logger.error("No Zabbix item found for service: {}".format(service_name))
                                continue

                            history_model = container_item.history_obj
                            if not history_model:
                                continue

                            # --- Step 4: Get latest value from Zabbix history ---
                            latest_entry = (
                                history_model.objects.using(zabbix_db_ip).filter(item=container_item)
                                .order_by("-clock")
                                .first()
                            )
                            if latest_entry:
                                running_state = int(latest_entry.value)
                                node["status"] = running_state
                                node["metadata"]["Status"] = running_state
                            else:
                                logger.warning("No Zabbix history for {}".format(service_name))
            except Exception as e:
                logger.error("Error updating topology status from Zabbix: {}".format(str(e)))

        # --- Step 5: Return updated topology ---
        topology_data["topology_data"]["nodes"] = nodes
        return Response(topology_data, status=status.HTTP_200_OK)


    @list_route(methods=['get'])
    def server_data(self, request):  # server details
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        trace = Trace.objects.filter(app__uuid=app_id).last()
        logs = Log.objects.filter(app__uuid=app_id)
        total_logs = logs.count()
        error_logs = logs.filter(severity__in=["ERROR", "FATAL"]).count()

        error_rate = round((error_logs / total_logs) * 100, 2) if total_logs > 0 else 0.0
        if not trace:
            return Response({
                "server_name": None,
                "host_ip": None,
                "latency": None,
                "throughput": None,
                "user_agent": None,
                "http_flavor": None,
                "http_target": None,
                "sdk_language": None,
                "service_version": None,
                "port": None,
                "filepath": None,
                "error_rate": None,
                "app_status": None,
            })

        # Extract general SDK info from processes["p1"]
        proc_tags = trace.raw_data.get("processes", {}).get("p1", {}).get("tags", [])
        proc_tag_map = {tag.get("key"): tag.get("value") for tag in proc_tags}

        # Find first span with processID == "p1"
        matching_span = next(
            (span for span in trace.raw_data.get("spans", []) if span.get("processID") == "p1"),
            None
        )

        span_tag_map = {}
        if matching_span:
            span_tags = matching_span.get("tags", [])
            span_tag_map = {tag.get("key"): tag.get("value") for tag in span_tags}
        device = trace.app.device
        if isinstance(device, BMServer):
            device_name = device.server.name
        else:
            device_name = device.name
        return Response({
            "server_name": device_name,
            "host_ip": trace.app.hostname,
            "latency": trace.app.latency,
            "throughput": trace.app.throughput,
            "user_agent": span_tag_map.get("http.user_agent"),
            "http_flavor": span_tag_map.get("http.flavor"),
            "http_target": span_tag_map.get("http.target"),
            "sdk_language": proc_tag_map.get("telemetry.sdk.language"),
            "service_version": proc_tag_map.get("telemetry.sdk.version"),
            "port": span_tag_map.get("net.host.port"),
            "filepath": span_tag_map.get("http.route"),
            "error_rate": "{}%".format(error_rate),
            "app_status": 200,
        })

    @list_route(methods=['get'])  # To do this has to be changed after UI integration of grouped metrics
    def app_metrics_list(self, request):  # list of metrics anme for the queried app
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        distinct_names = Metric.objects.filter(app__uuid=app_id).values_list('metric_name', flat=True).distinct()

        return Response(
            {"metric_names": list(distinct_names)},  # convert queryset to list
            status=status.HTTP_200_OK
        )

    @list_route(methods=['get'])
    def app_grouped_metrics_list(self, request):  # list of metrics anme for the queried app
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        distinct_names = Grouped_graph.objects.filter(metrics_group__app__uuid=app_id).values_list('name', flat=True).distinct()

        return Response(
            {"metric_names": list(distinct_names)},  # convert queryset to list
            status=status.HTTP_200_OK
        )

    @list_route(methods=['get'])
    def cpu_memory_utilization(self, request):
        from datetime import datetime, timedelta
        import pytz
        from collections import defaultdict
        app_uuid = request.GET.get('uuid')
        if not app_uuid:
            return Response({'error': 'Missing uuid'}, status=400)

        to_date_str = request.GET.get('to')
        from_date_str = request.GET.get('from')
        from datetime import datetime, timedelta

        import pytz  # already in your project

        UTC = pytz.UTC  # shortcut
        DATE_FMT = "%Y-%m-%d %H:%M:%S"  # 2025-06-30 23:59:59
        ISO_FMT = "%Y-%m-%dT%H:%M:%SZ"  # 2025-06-30T12:49:44Z

        try:
            if from_date_str:
                from_date = UTC.localize(datetime.strptime(from_date_str, DATE_FMT))
            if to_date_str:
                to_date = UTC.localize(datetime.strptime(to_date_str, DATE_FMT))

            if from_date and to_date:
                date_difference = (to_date - from_date).days
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use '%Y-%m-%d %H:%M:%S'."},
                status=400
            )

        data = get_cpu_and_memory_metrics(app_uuid)

        def ensure_dt(ts):
            """Accept a datetime or an ISO string, return an aware datetime (UTC)."""
            if isinstance(ts, datetime):
                return ts if ts.tzinfo else UTC.localize(ts)
            return UTC.localize(datetime.strptime(ts, ISO_FMT))

        from collections import defaultdict, OrderedDict

        def bucket_key(ts, grouping):
            """
            Return (key, label) based on grouping: 'day', 'week', 'month', 'quarter'
            """
            if grouping == "day":
                label = ts.strftime("%a")  # 'Mon', 'Tue', etc.
                key = ts.date()
            elif grouping == "week":
                year, week, _ = ts.isocalendar()
                key = (year, week)
                label = "Week %d" % week
            elif grouping == "month":
                key = (ts.year, ts.month)
                label = ts.strftime("%b")  # 'Jan', 'Feb', etc.
            else:  # 'quarter'
                quarter = (ts.month - 1) // 3 + 1
                key = (ts.year, quarter)
                label = "Q%d-%d" % (quarter, ts.year)
            return key, label

        def iter_period_keys(grouping, start_dt, end_dt):
            current = start_dt
            while current <= end_dt:
                key, label = bucket_key(current, grouping)
                yield key, label
                if grouping == "day":
                    current += timedelta(days=1)
                elif grouping == "week":
                    current += timedelta(days=7 - current.weekday() or 7)
                elif grouping == "month":
                    year = current.year + (current.month // 12)
                    month = 1 if current.month == 12 else current.month + 1
                    current = current.replace(year=year, month=month, day=1)
                else:  # quarter
                    month = ((current.month - 1) // 3 + 1) * 3 + 1
                    year = current.year
                    if month > 12:
                        month = 1
                        year += 1
                    current = current.replace(year=year, month=month, day=1)

        def aggregate(points, grouping, start_date, end_date):
            sums = defaultdict(float)
            counts = defaultdict(int)
            labels = {}

            for p in points:
                ts = p["timestamp"]
                if not isinstance(ts, datetime):
                    ts = datetime.strptime(ts, ISO_FMT)
                    ts = UTC.localize(ts)
                elif ts.tzinfo is None:
                    ts = UTC.localize(ts)

                key, label = bucket_key(ts, grouping)
                sums[key] += float(p["value"])
                counts[key] += 1
                labels[key] = label

            all_keys = []
            for key, label in iter_period_keys(grouping, start_date, end_date):
                all_keys.append(key)
                if key not in labels:
                    labels[key] = label

            if grouping == "week":
                seq_map = OrderedDict()
                seq_num = 1
                for key in all_keys:
                    orig = labels[key]
                    if orig not in seq_map:
                        seq_map[orig] = "Week %d" % seq_num
                        seq_num += 1
                    labels[key] = seq_map[orig]

            result = []
            for key in all_keys:
                total = sums.get(key, 0.0)
                count = counts.get(key, 0)
                avg = round(total / count, 2) if count else 0.0
                result.append({"range": labels[key], "average": avg})
            return result

        def compute_stats(points, grouping, start_date):
            """
            Return (avg, current, peak_with_label) for the given raw point list.
            - avg      : mean of all raw values (0 if list empty)
            - current  : value with the latest timestamp (0 if empty)
            - peak_lbl : "value@label" where label uses the same bucket names
            """
            if not points:
                return 0.0, 0.0, "0@-"

            # ---- average over every raw value ---------------------------------------
            total = sum(float(p["value"]) for p in points)
            avg = round(total / len(points), 2)

            # ---- current (latest timestamp) -----------------------------------------
            latest = max(points, key=lambda p: ensure_dt(p["timestamp"]))
            current = round(float(latest["value"]), 2)

            # ---- peak value + its bucket label --------------------------------------
            peak = max(points, key=lambda p: float(p["value"]))
            peak_ts = ensure_dt(peak["timestamp"])
            _, peak_label = bucket_key(peak_ts, grouping)  # reuse same naming logic
            peak_str = "%s@%s" % (round(float(peak["value"]), 2), peak_label)
            return avg, current, peak_str

        if from_date and to_date:
            now_utc = datetime.now(timezone.utc)
            start_utc = now_utc - timedelta(days=date_difference)
            cpu_data_filtered = [
                p for p in data.get("cpu", [])
                if from_date <= ensure_dt(p["timestamp"]) <= to_date
            ]
            memory_data_filtered = [
                p for p in data.get("memory", [])
                if from_date <= ensure_dt(p["timestamp"]) <= to_date
            ]
        if not from_date and not to_date:
            grouping = "year"
        elif date_difference <= 7:
            grouping = "day"
        elif date_difference <= 30:
            grouping = "week"
        elif date_difference < 364:
            grouping = "month"
        else:
            grouping = "quarter"
        cpu_grouped = aggregate(cpu_data_filtered, grouping, from_date, to_date)
        mem_grouped = aggregate(memory_data_filtered, grouping, from_date, to_date)
        avg_cpu, cur_cpu, peak_cpu = compute_stats(cpu_data_filtered, grouping, from_date)
        avg_mem, cur_mem, peak_mem = compute_stats(memory_data_filtered, grouping, from_date)
        return Response({
            "cpu_utilization": cpu_grouped,
            "memory_utilization": mem_grouped,
            "current_memory_utilization": cur_mem,
            "peak_memory_utilization": peak_mem,
            "average_cpu_utilization": avg_cpu,
            "current_cpu_utilization": cur_cpu,
            "peak_cpu_utilization": peak_cpu,
            "average_memory_utilization": avg_mem,
            "grouping:": grouping
        })

    @list_route(methods=['get'])
    def active_graphs(self, request):
        from datetime import datetime, timedelta
        import dateutil.parser
        from collections import defaultdict
        from django.db.models import Avg
        from rest_framework.response import Response
        from rest_framework import status

        app_id = request.GET.get('uuid')
        if not app_id:
            return Response({'error': 'Missing uuid'}, status=status.HTTP_400_BAD_REQUEST)

        time_range = request.GET.get('range', 'last_24_hours')
        from_str = request.GET.get('from')
        to_str = request.GET.get('to')
        metric_names = request.GET.getlist('metric_names')
        now = datetime.utcnow()
        start_time = None
        end_time = now
        grouping_type = "custom"

        try:
            if time_range == 'last_24_hours':
                start_time = now - timedelta(hours=24)
                grouping_type = "hourly"
            elif time_range == 'yesterday':
                today = now.date()
                start_time = datetime.combine(today - timedelta(days=1), datetime.min.time())
                end_time = datetime.combine(today, datetime.min.time())
                grouping_type = "hourly"
            elif time_range == 'last_week':
                start_time = now - timedelta(days=6)
                grouping_type = "daily"
            elif time_range == 'last_year':
                import pytz
                utc = pytz.UTC
                this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                if this_month.tzinfo is None:
                    this_month = utc.localize(this_month)
                start_time = this_month - relativedelta(months=11)
                end_time = this_month + relativedelta(months=1)
                grouping_type = "monthly"
            elif time_range == 'custom':
                if not from_str or not to_str:
                    return Response({'error': 'Missing "from" or "to" for custom range'}, status=400)
                start_time = dateutil.parser.parse(from_str)
                end_time = dateutil.parser.parse(to_str)
                diff = end_time - start_time
                if diff.days > 365:
                    grouping_type = "yearly"
                elif diff.days > 90:
                    grouping_type = "monthly"
                elif diff.days > 7:
                    grouping_type = "daily"
                elif diff.days > 1:
                    grouping_type = "hourly"
                else:
                    grouping_type = "minute"
        except Exception as e:
            return Response({'error': 'Invalid time range: ' + str(e)}, status=400)

        queryset = Metric.objects.filter(app__uuid=app_id)
        if metric_names:
            queryset.exclude(metric_name__in=metric_names).update(is_active=False)
            queryset.filter(metric_name__in=metric_names).update(is_active=True)
            queryset = queryset.filter(metric_name__in=metric_names, is_active=True)

        else:
            queryset = queryset.filter(is_active=True)
        if start_time:
            queryset = queryset.filter(timestamp__range=(start_time, end_time))
        grouped_data = defaultdict(list)
        for metric in queryset:
            grouped_data[metric.metric_name].append({
                "timestamp": metric.timestamp,
                "value": metric.value
            })
        grouped_list = []
        for metric_name, data in grouped_data.items():
            averaged_data = []
            import pytz
            utc = pytz.UTC
            if grouping_type == "hourly":
                hourly_data = defaultdict(list)

                # Normalize all timestamps to UTC-aware
                for point in data:
                    ts = point['timestamp']
                    if ts.tzinfo is None:
                        ts = utc.localize(ts)
                    hour = ts.replace(minute=0, second=0, microsecond=0)
                    hourly_data[hour].append(point['value'])

                # Ensure start_time and current_hour are also UTC-aware
                if start_time.tzinfo is None:
                    start_time = utc.localize(start_time)
                if end_time.tzinfo is None:
                    end_time = utc.localize(end_time)

                current_hour = start_time.replace(minute=0, second=0, microsecond=0)

                while current_hour < end_time:
                    values = hourly_data.get(current_hour, [])
                    averaged_data.append({
                        "timestamp": current_hour,
                        "value": sum(values) / len(values) if values else 0
                    })
                    current_hour += timedelta(hours=1)

            elif grouping_type == "daily":
                daily_data = defaultdict(list)
                for point in data:
                    ts = point['timestamp']
                    if ts.tzinfo is None:
                        ts = utc.localize(ts)
                    day = ts.date()
                    daily_data[day].append(point['value'])

                # ensure range bounds are aware
                if start_time.tzinfo is None:
                    start_time = utc.localize(start_time)
                if end_time.tzinfo is None:
                    end_time = utc.localize(end_time)

                current_day = start_time.date()
                while current_day <= end_time.date():
                    values = daily_data.get(current_day, [])
                    ts_bucket = utc.localize(datetime.combine(current_day, datetime.min.time()))
                    averaged_data.append({
                        "timestamp": ts_bucket,
                        "value": sum(values) / len(values) if values else 0
                    })
                    current_day += timedelta(days=1)

            elif grouping_type in ["monthly", "yearly"]:
                    monthly_data = defaultdict(list)
                    for point in data:
                        ts = point['timestamp']
                        if ts.tzinfo is None:
                            ts = utc.localize(ts)
                        month_key = ts.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                        monthly_data[month_key].append(point['value'])

                    current_month = start_time
                    if current_month.tzinfo is None:
                        current_month = utc.localize(current_month)

                    # iterate while *before* the exclusive upper bound
                    while current_month < end_time:
                        values = monthly_data.get(current_month, [])
                        averaged_data.append({
                            "timestamp": current_month,
                            "value": sum(values) / len(values) if values else 0
                        })
                        current_month += relativedelta(months=1)

            else:  # Custom or unknown grouping
                data_sorted = sorted(data, key=lambda x: x["timestamp"])
                averaged_data = data_sorted

            grouped_list.append({
                "metric_name": metric_name,
                "grouping_type": grouping_type,
                "data": averaged_data
            })

        return Response(grouped_list)

    @list_route(methods=['get'])
    def top_recent_logs_trace(self, request):  # recent logs and traces
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response({'error': 'Missing uuid'}, status=status.HTTP_400_BAD_REQUEST)
        traces = Trace.objects.filter(app__uuid=app_id).order_by('-end_time')[:10]
        logs = Log.objects.filter(app__uuid=app_id).order_by('-timestamp')[:10]

        trace_data = AppGoupedTraceSerializer(traces, many=True).data
        log_data = AppGroupedLogSerializer(logs, many=True).data

        return Response({
            "top_traces": trace_data,
            "top_logs": log_data
        }, status=status.HTTP_200_OK)

    @list_route(methods=['get'])
    def app_metrics_enabled_list(self, request):
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: uuid"},
                status=status.HTTP_400_BAD_REQUEST
            )

        metric_names = Metric.objects.filter(app__uuid=app_id).filter(Q(is_active=True) | Q(is_created=True)).values_list("metric_name", flat=True).distinct()

        return Response(
            {"app_metrics_enabled_list": list(metric_names)},
            status=status.HTTP_200_OK
        )

    @list_route(methods=['get'])
    def metrics_application_information(self, request):
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: uuid"},
                status=status.HTTP_400_BAD_REQUEST
            )
        from django.db.models import Max  # Add this import at the top

        latest_metrics = Metric.objects.filter(
            app__uuid=app_id
        ).distinct('metric_name').order_by('metric_name', '-timestamp')[:10]

        response_data = [
            {
                'metric_name': m.metric_name,
                'latest_value': m.value,
                'latest_timestamp': m.timestamp,
            }
            for m in latest_metrics
        ]
        return Response(response_data)

    @list_route(methods=['get'])
    def service_events(self, request):
        app_id = request.GET.get('uuid')
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )
        search_key = self.request.GET.get('search_query', None)
        queryset = Event.objects.filter(application__uuid=app_id)
        if search_key:
            search_key = str(search_key).lower().capitalize()
            queryset = queryset.filter(
                Q(description__icontains=search_key) |
                Q(id__icontains=search_key) |
                Q(source__name__icontains=search_key)
            )
        serializer = EventListSerializer(queryset, many=True)
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)
        return paginator.get_paginated_response(paginated_data)

    # Failure Tab
    @list_route(methods=['get'])
    def failure_events(self, request):
        app_id = request.GET.get("app_id")
        search = request.GET.get("search", None)

        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parent_app = ParentApp.objects.get(
                id=app_id,
                customer=self.request.user.org
            )
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with id {} not found".format(app_id)},
                status=status.HTTP_404_NOT_FOUND
            )

        monitoring_data = MonitoredApp.objects.filter(
            parent_app=parent_app,
            customer=self.request.user.org
        )

        if not monitoring_data.exists():
            return Response(
                {"error": "No monitored apps found"},
                status=status.HTTP_404_NOT_FOUND
            )

        device_ids = monitoring_data.values_list(
            'device_id',
            flat=True
        ).distinct()

        # Base event query
        events = Event.objects.filter(
            device_id__in=device_ids,
            customer=self.request.user.org
        ).filter(
            Q(severity=2) | Q(severity=3)
        )

        # Search filter
        if search:
            events = events.filter(
                Q(description__icontains=search) |
                Q(application__name__icontains=search)
            )

            # Return error if search result not found
            if not events.exists():
                return Response(
                    {"error": "No associated events were found!"},
                )

        events = events.values(
            "application_id",
            "description",
            "application__name",
            "event_datetime",
            "apm_log__attributes"
        ).order_by('-event_datetime')

        grouped_events = defaultdict(list)

        for event in events:
            clean_desc = event['description'].strip()
            grouped_events[clean_desc].append(event)

        all_results = []

        for clean_desc, event_list in grouped_events.iteritems():
            latest_event = event_list[0]

            all_results.append({
                "monitored_app": latest_event["application_id"],
                "service": latest_event["application__name"]
                        if latest_event["application__name"]
                        else "UnityOne events",
                "description": clean_desc,
                "timestamp": latest_event["event_datetime"],
                "count": len(event_list),
            })

        # Sort latest first
        all_results.sort(
            key=lambda x: x['timestamp'],
            reverse=True
        )

        page_size = request.GET.get('page_size', 10)
        page = request.GET.get('page', 1)

        paginator = Paginator(all_results, page_size)

        try:
            paginated_results = paginator.page(page)
        except (EmptyPage, PageNotAnInteger):
            paginated_results = paginator.page(1)

        base_url = request.build_absolute_uri().split("?")[0]

        next_url = None
        previous_url = None

        if paginated_results.has_next():
            next_url = '{}?app_id={}&page={}&page_size={}'.format(
                base_url,
                app_id,
                paginated_results.next_page_number(),
                page_size
            )

            if search:
                next_url += '&search={}'.format(search)

        if paginated_results.has_previous():
            previous_url = '{}?app_id={}&page={}&page_size={}'.format(
                base_url,
                app_id,
                paginated_results.previous_page_number(),
                page_size
            )

            if search:
                previous_url += '&search={}'.format(search)

        return Response({
            'count': paginator.count,
            'next': next_url,
            'previous': previous_url,
            'results': list(paginated_results)
        })


    @list_route(methods=['get'])
    def failure_logs(self, request):
        app_id = request.GET.get('app_id')
        search = request.GET.get('search', None)

        # Validate app_id
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get Parent App
        try:
            parent_app = ParentApp.objects.get(
                id=app_id,
                customer=self.request.user.org
            )
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with id {} not found".format(app_id)},
                status=status.HTTP_404_NOT_FOUND
            )

        # Get monitored apps
        monitored_apps = MonitoredApp.objects.filter(
            parent_app=parent_app,
            customer=self.request.user.org
        )

        if not monitored_apps.exists():
            return Response(
                {"error": "No monitored apps found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Base queryset
        queryset = Log.objects.filter(
            app__in=monitored_apps,
            severity__in=["WARN", "ERROR"]
        )

        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(message__icontains=search) |
                Q(severity__icontains=search)
            )

        # Order queryset
        queryset = queryset.order_by("-id")

        # If no logs found
        if not queryset.exists():
            return Response(
                {
                    "count": 0,
                    "results": [],
                    "message": "No associated logs were found!"
                },
                status=status.HTTP_200_OK
            )

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_qs = paginator.paginate_queryset(queryset, request)

        serializer = AppLogSerializer(paginated_qs, many=True)

        return paginator.get_paginated_response(serializer.data)

    @list_route(methods=['get'])
    def failure_analysis(self, request):
        UTC = pytz.UTC
        DATE_FMT = "%Y-%m-%d %H:%M:%S"

        app_id = request.GET.get('app_id')
        if not app_id:
            return Response({"error": "Missing required parameter: app_id"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            parent_app = ParentApp.objects.get(id=app_id, customer=self.request.user.org)
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with id {} not found".format(app_id)},
                status=status.HTTP_404_NOT_FOUND
            )

        monitored_apps = MonitoredApp.objects.filter(parent_app=parent_app, customer=self.request.user.org)
        if not monitored_apps.exists():
            return Response({"error": "No monitored apps found"}, status=status.HTTP_404_NOT_FOUND)

        filter_option = request.GET.get("filter", "last_24_hours")
        from_date_str = request.GET.get("from")
        to_date_str = request.GET.get("to")

        now = datetime.now(UTC)
        from_date = None
        to_date = None
        use_custom_dates = False

        # Handle date range selection
        if from_date_str and to_date_str:
            try:
                from_date = UTC.localize(datetime.strptime(from_date_str, DATE_FMT))
                to_date = UTC.localize(datetime.strptime(to_date_str, DATE_FMT))
                use_custom_dates = True
            except ValueError:
                return Response({"error": "Invalid date format. Use '{}'.".format(DATE_FMT)}, status=400)
        else:
            if filter_option == "last_30_minutes":
                from_date = now - timedelta(minutes=30)
            elif filter_option == "last_1_hour":
                from_date = now - timedelta(hours=1)
            elif filter_option == "last_2_hours":
                from_date = now - timedelta(hours=2)
            elif filter_option == "last_30_hours":
                from_date = now - timedelta(hours=30)
            elif filter_option == "last_24_hours":
                from_date = now - timedelta(days=1)
            elif filter_option == "last_1_week":
                from_date = now - timedelta(weeks=1)
            elif filter_option == "last_1_month":
                from_date = now - timedelta(days=30)
            elif filter_option == "last_30_days":
                from_date = now - timedelta(days=30)
            elif filter_option == "last_60_days":
                from_date = now - timedelta(days=60)
            elif filter_option == "last_90_days":
                from_date = now - timedelta(days=90)
            elif filter_option == "last_1_year":
                from_date = now - timedelta(days=365)
            else:
                return Response({"error": "Invalid filter option: {}".format(filter_option)}, status=400)
            to_date = now

        def create_intervals(start, end, filter_opt, custom_dates=False):
            intervals = []
            
            if custom_dates:
                total_duration = (end - start).total_seconds()
                
                if total_duration <= 3600:  # Up to 1 hour
                    interval_minutes = 5
                    total_minutes = total_duration / 60
                    num_intervals = int(total_minutes / interval_minutes) or 1
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(minutes=i * interval_minutes)
                        interval_end = min(interval_start + timedelta(minutes=interval_minutes), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': interval_start.strftime("%H:%M")
                        })
                        
                elif total_duration <= 86400:  # Up to 1 day
                    total_hours = total_duration / 3600
                    interval_hours = max(1, int(total_hours / 24))  # At most 24 intervals
                    num_intervals = int(total_hours / interval_hours) or 1
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(hours=i * interval_hours)
                        interval_end = min(interval_start + timedelta(hours=interval_hours), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': interval_start.strftime("%H:00")
                        })
                        
                elif total_duration <= 604800:  # Up to 1 week
                    total_days = total_duration / 86400
                    num_intervals = min(7, int(total_days))  # At most 7 intervals
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(days=i)
                        interval_end = min(interval_start + timedelta(days=1), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': interval_start.strftime("%a")
                        })
                        
                elif total_duration <= 2592000:  # Up to 30 days
                    total_weeks = total_duration / 604800
                    num_intervals = min(4, int(total_weeks))  # At most 4 intervals
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(weeks=i)
                        interval_end = min(interval_start + timedelta(weeks=1), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': "Week {}".format(i + 1)
                        })
                        
                elif total_duration <= 7776000:  # Up to 90 days
                    total_months = total_duration / 2592000
                    num_intervals = min(3, int(total_months))  # At most 3 intervals
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(days=30 * i)
                        interval_end = min(interval_start + timedelta(days=30), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': interval_start.strftime("%B")
                        })
                        
                else:  # More than 90 days
                    total_months = total_duration / 2592000
                    num_intervals = min(12, int(total_months))  # At most 12 intervals
                    
                    for i in range(num_intervals):
                        interval_start = start + timedelta(days=30 * i)
                        interval_end = min(interval_start + timedelta(days=30), end)
                        intervals.append({
                            'start': interval_start,
                            'end': interval_end,
                            'label': interval_start.strftime("%b")
                        })
                
                return intervals
            
            if filter_opt == "last_30_minutes":
                interval_minutes = 5
                for i in range(6):
                    interval_start = start + timedelta(minutes=i * interval_minutes)
                    interval_end = interval_start + timedelta(minutes=interval_minutes)
                    if interval_end > end:
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%H:%M")
                    })

            elif filter_opt in ["last_1_hour", "last_2_hours"]:
                num_intervals = 12
                total_seconds = (end - start).total_seconds()
                total_minutes = total_seconds / 60
                interval_minutes = total_minutes / num_intervals

                for i in range(num_intervals):
                    interval_start = start + timedelta(minutes=i * interval_minutes)
                    interval_end = interval_start + timedelta(minutes=interval_minutes)
                    if i == num_intervals - 1:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%H:%M")
                    })

            elif filter_opt in ["last_24_hours", "last_30_hours"]:
                total_hours = int((end - start).total_seconds() / 3600)
                for i in range(total_hours):
                    interval_start = start + timedelta(hours=i)
                    interval_end = interval_start + timedelta(hours=1)
                    if i == total_hours - 1:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%H:00")
                    })

            elif filter_opt == "last_1_week":
                for i in range(7):
                    interval_start = start + timedelta(days=i)
                    interval_end = interval_start + timedelta(days=1)
                    if i == 6:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%a")
                    })

            elif filter_opt in ["last_1_month", "last_30_days"]:
                for i in range(4):
                    interval_start = start + timedelta(days=7 * i)
                    interval_end = interval_start + timedelta(days=7)
                    if i == 3:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': "Week {}".format(i + 1)
                    })

            elif filter_opt == "last_60_days":
                for i in range(2):
                    interval_start = start + timedelta(days=30 * i)
                    interval_end = interval_start + timedelta(days=30)
                    if i == 1:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%B")
                    })

            elif filter_opt == "last_90_days":
                for i in range(3):
                    interval_start = start + timedelta(days=30 * i)
                    interval_end = interval_start + timedelta(days=30)
                    if i == 2:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%B")
                    })

            elif filter_opt == "last_1_year":
                for i in range(12):
                    interval_start = start + timedelta(days=30 * i)
                    interval_end = interval_start + timedelta(days=30)
                    if i == 11:  # Last interval
                        interval_end = end
                    intervals.append({
                        'start': interval_start,
                        'end': interval_end,
                        'label': interval_start.strftime("%b")
                    })

            return intervals

        intervals = create_intervals(from_date, to_date, filter_option, use_custom_dates)

        aggregated_intervals = []
        
        for interval in intervals:
            interval_throughputs = []
            interval_error_rates = []
            total_warning_count = 0
            total_error_count = 0
            total_logs_count = 0

            for app in monitored_apps:
                interval_logs = Log.objects.filter(
                    app=app,
                    timestamp__gte=interval['start'],
                    timestamp__lt=interval['end']
                ).filter(Q(severity="WARN") | Q(severity="ERROR"))

                midpoint_time = interval['start'] + (interval['end'] - interval['start']) / 2
                nearest_topology = (
                    APMTopology.objects.filter(app=app, created_at__lte=midpoint_time)
                    .order_by("-created_at")
                    .first()
                )
                if not nearest_topology:
                    nearest_topology = (
                        APMTopology.objects.filter(app=app, created_at__gte=midpoint_time)
                        .order_by("created_at")
                        .first()
                    )

                throughput_value = None
                metadata = {}

                if nearest_topology:
                    topology_data = nearest_topology.topology_data or {}
                    nodes = topology_data.get("nodes", [])
                    for node in nodes:
                        if node.get("type") == "application":
                            metadata = node.get("metadata", {}) or {}
                            throughput_str = metadata.get("Throughput")
                            if throughput_str:
                                try:
                                    # Extract numeric value from "1380.0 req/min"
                                    throughput_value = float(throughput_str.split()[0])
                                    interval_throughputs.append(throughput_value)
                                except (ValueError, IndexError):
                                    pass
                            break

                total_requests = metadata.get("Total Requests")
                error_count = Log.objects.filter(
                    app=app,
                    severity="ERROR",
                    timestamp__gte=interval['start'],
                    timestamp__lt=interval['end']
                ).count()

                if total_requests and float(total_requests) > 0:
                    error_rate = (float(error_count) / float(total_requests)) * 100
                    interval_error_rates.append(error_rate)

                warning_count = interval_logs.filter(severity="WARN").count()
                error_count = interval_logs.filter(severity="ERROR").count()

                total_warning_count += warning_count
                total_error_count += error_count
                total_logs_count += interval_logs.count()

            avg_throughput = None
            avg_error_rate = 0.0
            
            if interval_throughputs:
                avg_throughput = sum(interval_throughputs) / len(interval_throughputs)
            
            if interval_error_rates:
                avg_error_rate = sum(interval_error_rates) / len(interval_error_rates)
            else:
                avg_error_rate = 0.0

            throughput_display = None
            if avg_throughput is not None:
                throughput_display = "{:.1f} req/min".format(avg_throughput)

            aggregated_interval = {
                "error_rate": avg_error_rate,
                "end_time": interval['end'].isoformat(),
                "throughput": throughput_display,
                "error_count": total_error_count,
                "total_logs": total_logs_count,
                "start_time": interval['start'].isoformat(),
                "warning_count": total_warning_count,
                "label": interval['label']
            }

            aggregated_intervals.append(aggregated_interval)

        response_data = [
            {
                "intervals": aggregated_intervals
            }
        ]

        return Response(response_data)
    
    @list_route(methods=['get'])
    def problems_summary(self, request):
        app_id = request.GET.get('app_id')
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')

        if not app_id:
            return Response({"error": "Missing required parameter: app_id"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Validate ParentApp ---
        try:
            parent_app = ParentApp.objects.get(id=app_id, customer=self.request.user.org)
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with id {} not found".format(app_id)},
                status=status.HTTP_404_NOT_FOUND
            )

        # --- Get all monitored apps under this parent ---
        monitoring_data = MonitoredApp.objects.filter(parent_app=parent_app, customer=self.request.user.org)
        if not monitoring_data.exists():
            return Response(
                {"error": "No monitored apps found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # --- Base queryset ---
        device_ct_q = build_device_contenttype_qs(monitoring_data)
        events = Event.objects.filter(
            customer=self.request.user.org
        ).filter(
            Q(application__in=monitoring_data) | device_ct_q
        ).distinct()

        alerts = InboundDedupAlerts.objects.filter(
            customer=self.request.user.org
        ).filter(
            Q(dedup_list__application__in=monitoring_data) | device_ct_q
        ).distinct()
        
        device_ct_q = build_device_contenttype_qs(monitoring_data,
            device_field='alerts__device_id',
            content_type_field='alerts__content_type'
        )
        conditions = Condition.objects.filter(
            customer=self.request.user.org
        ).filter(
            Q(alerts__dedup_list__application__in=monitoring_data) | device_ct_q
        ).distinct()

        # --- Optional date filtering ---
        if start_date and end_date:
            events = events.filter(
                event_datetime__gte=start_date,
                event_datetime__lte=end_date
            )
            alerts = alerts.filter(
                first_event_datetime__gte=start_date,
                last_event_datetime__lte=end_date
            )
            conditions = conditions.filter(
                first_alert_datetime__gte=start_date,
                last_alert_datetime__lte=end_date
            )
        else:
            # Use custom queryset helpers if no date range provided
            events = events.get_only_open_and_recently_resolved()
            alerts = alerts.get_only_open_and_recently_resolved()
            conditions = conditions.get_only_open_and_recently_resolved()

        events = events.distinct()
        alerts = alerts.distinct()
        conditions = conditions.distinct()
        # --- Counts ---
        event_count = events.count()
        alert_count = alerts.count()
        condition_count = conditions.count()

        severity_count = {
            'critical': conditions.filter(severity=EventSeverity.critical).distinct().count(),
            'warning': conditions.filter(severity=EventSeverity.warning).distinct().count(),
            'information': conditions.filter(severity=EventSeverity.information).distinct().count(),
        }

        # --- Reduction calculations ---
        noise_reduced_count = float(event_count - alert_count)
        correlation_reduced_count = float(alert_count - condition_count)

        noise_reduction = 0.0
        correlation_reduction = 0.0

        if event_count:
            noise_reduction = (noise_reduced_count / float(event_count)) * 100.0
        if alert_count:
            correlation_reduction = (correlation_reduced_count / float(alert_count)) * 100.0

        result = {
            'event_count': event_count,
            'alert_count': alert_count,
            'condition_count': condition_count,
            'critical': severity_count.get('critical', 0),
            'warning': severity_count.get('warning', 0),
            'information': severity_count.get('information', 0),
            'noise_reduction': round(noise_reduction, 2),
            'correlation_reduction': round(correlation_reduction, 2),
        }

        return Response(result)

    @list_route(methods=['get'])
    def problems_conditions(self, request):
        app_id = request.GET.get('app_id')

        if not app_id:
            return Response({"error": "Missing required parameter: app_id"}, status=status.HTTP_400_BAD_REQUEST)

        # --- Validate ParentApp ---
        try:
            parent_app = ParentApp.objects.get(id=app_id, customer=self.request.user.org)
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with id {} not found".format(app_id)},
                status=status.HTTP_404_NOT_FOUND
            )

        # --- Get all monitored apps under this parent ---
        monitoring_data = MonitoredApp.objects.filter(parent_app=parent_app, customer=self.request.user.org)
        if not monitoring_data.exists():
            return Response(
                {"error": "No monitored apps found"},
                status=status.HTTP_404_NOT_FOUND
            )
        search_key = self.request.GET.get('search_key', None)
        device_ct_q = build_device_contenttype_qs(
            monitoring_data,
            device_field='alerts__device_id',
            content_type_field='alerts__content_type'
        )
        query = Condition.objects.filter(
                customer=self.request.user.org
            ).filter(
                Q(alerts__dedup_list__application__in=monitoring_data) | device_ct_q
            ).distinct().\
            get_only_open_and_recently_resolved().order_by('-last_alert_datetime')
        if search_key:
            search_key = str(search_key).lower().capitalize()
            if search_key in EventSeverity.CHOICES_BY_NAME.keys():
                search_filter = EventSeverity.CHOICES_BY_NAME[search_key]
                query = query.filter(
                    severity=search_filter
                )
            elif search_key in EventStatus.CHOICES_BY_NAME.keys():
                search_filter = EventStatus.CHOICES_BY_NAME[search_key]
                query = query.filter(
                    status=search_filter
                )
            else:
                query = query.filter(
                    Q(id__icontains=search_key) |
                    Q(sources__icontains=search_key) |
                    Q(correlation_rule__correlators__icontains=search_key)
                )
        query = query.distinct()
        paginator = PageNumberPagination()
        paginator.page_size = 10
        paginator.page_size_query_param = 'page_size'
        paginated_queryset = paginator.paginate_queryset(query, request)
        serializer = ConditionListSerializer(paginated_queryset, many=True)
        return paginator.get_paginated_response(serializer.data)

    @list_route(methods=['get'])
    def impact_analysis(self, request):
        app_id = request.GET.get("app_id")
        if not app_id:
            return Response(
                {"error": "Missing required parameter: app_id"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            parent_app = ParentApp.objects.get(id=app_id, customer=request.user.org)
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "ParentApp with given id not found for this organization."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check cache first
        cache_entry = ImpactAnalysisCache.objects.filter(customer=request.user.org, app=parent_app).first()
        if cache_entry:
            # trigger task and return processing message
            impact_analysis_task.delay(request.user.id, app_id)
            return Response(cache_entry.data, status=status.HTTP_200_OK)
        else:
            # If not in cache, trigger task and return processing message
            impact_analysis_task.delay(request.user.id, app_id)

        return Response(
            {"message": "Impact analysis task has been queued. Please check back later for results."},
            status=status.HTTP_202_ACCEPTED
        )


class CreateGraphAPM(viewsets.ViewSet):

    @list_route(methods=['post'])
    def enable_graphs(self, request):
        data = request.data
        app_uuid = data.get("uuid")
        metric_names = data.get("metric_names", [])

        if not app_uuid or not metric_names:
            return Response(
                {"error": "Missing 'uuid' or 'metric_names' in request"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            app = MonitoredApp.objects.only('id', 'name').get(uuid=app_uuid, customer=self.request.user.org)
        except MonitoredApp.DoesNotExist:
            return Response(
                {"error": "App with given UUID not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        metrics = list(
            Metric.objects.filter(app=app, metric_name__in=metric_names)
            .only('id', 'metric_name', 'app')
        )
        if not metrics:
            return Response(
                {"error": "No matching metrics found for provided names"},
                status=status.HTTP_404_NOT_FOUND
            )

        metric_ids = [m.id for m in metrics]

        Metric.objects.filter(id__in=metric_ids).update(is_created=True)
        existing_graph_metric_ids = set(
            Grouped_graph.objects.filter(metrics_group_id__in=metric_ids)
            .values_list('metrics_group_id', flat=True)
        )

        new_graphs = []
        for metric in metrics:
            if metric.id not in existing_graph_metric_ids:
                new_graphs.append(
                    Grouped_graph(
                        name="{}_{}".format(app.name, metric.metric_name),
                        metrics_group=metric,
                        customer=self.request.user.org
                    )
                )

        if new_graphs:
            Grouped_graph.objects.bulk_create(new_graphs, batch_size=500)

        return Response(
            {
                "message": "Metrics enabled successfully",
                "app": app.name,
                "enabled_count": len(metrics),
                "new_graphs_created": len(new_graphs),
                "skipped_existing": len(metrics) - len(new_graphs),
                "enabled_metrics": metric_names
            },
            status=status.HTTP_200_OK
        )


class BusinessModelViewSet(viewsets.ModelViewSet):
    queryset = BusinessModel.objects.order_by("-created_at")
    filter_backends = [filters.SearchFilter]
    search_fields = ['business_service_name__name']  # Search by business name

    def get_queryset(self):
        qs = self.queryset.filter(Q(created_by=self.request.user, visibility='Private') | Q(visibility='Organization', created_by__org=self.request.user.org))
        return qs

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return BusinessModelListSerializer
        return BusinessModelSerializer


class BusinessModelListCreateView(generics.ListCreateAPIView):
    serializer_class = BusinessModelSerializer
    queryset = BusinessService.objects.all()

    def get_queryset(self):
        qs = self.queryset.filter(Q(created_by=self.request.user, visibility='Private') | Q(visibility='Organization', created_by__org=self.request.user.org))
        return qs


class BusinessServiceModelViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessServiceSerializer

    def get_queryset(self):
        qs = LicenseCostCenter.objects.all()
        if getattr(self.request.user, "org", None):
            return qs.filter(customer=self.request.user.org)
        return qs.none()


class LicenseCostCenterModelViewSet(viewsets.ModelViewSet):
    serializer_class = LicenseCostCenterSerializer

    def get_queryset(self):
        qs = LicenseCostCenter.objects.all()
        if getattr(self.request.user, "org", None):
            return qs.filter(customer=self.request.user.org)
        return qs.none()


class AppListViewSet(viewsets.ModelViewSet):
    serializer_class = ParentAppSerializer

    def get_queryset(self):
        return ParentApp.objects.exclude(name__isnull=True).filter(
            customer=self.request.user.org
        )
    def normalize_range(self, from_dt, to_dt):
        from_dt = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        to_dt   = to_dt.replace(hour=23, minute=59, second=59, microsecond=0)
        return from_dt, to_dt

    def _make_cache_key(self, prefix, from_dt, to_dt):
        tenant_id = str(self.request.user.org)
        from_dt, to_dt = self.normalize_range(from_dt, to_dt)
        return "{}_{}_{}_{}_{}".format(
            prefix,
            tenant_id,
            from_dt.strftime("%Y%m%d"),
            to_dt.strftime("%Y%m%d"),
        )

    def _get_cached_data(self, prefix, tenant_id, from_dt, to_dt):
        # Exact key
        cache_key = "{}_{}_{}_{}".format(
            prefix,
            tenant_id,
            from_dt.strftime("%Y%m%d"),
            to_dt.strftime("%Y%m%d")
        )

        logger.info("[Cache] Looking for key: {}".format(cache_key))
        data = cache.get(cache_key)

        # 30-day fallback
        if data is None:
            fallback_from = to_dt - timedelta(days=30)
            fallback_key = "{}_{}_{}_{}".format(
                prefix,
                tenant_id,
                fallback_from.strftime("%Y%m%d"),
                to_dt.strftime("%Y%m%d")
            )

            logger.info("[Cache] Trying fallback: {}".format(fallback_key))
            data = cache.get(fallback_key)

        # Wildcard fallback (latest available)
        if data is None and hasattr(cache, "keys"):
            pattern = "{}_{}_*".format(prefix, tenant_id)
            all_keys = cache.keys(pattern)
            valid_keys = [k for k in all_keys if not k.endswith("_stale")]

            if valid_keys:
                valid_keys.sort(reverse=True)
                latest_key = valid_keys[0]
                logger.info("[Cache] Found fallback: {}".format(latest_key))
                data = cache.get(latest_key)

        return data
        

    def _cached_response(self, cache_key, compute_fn, ttl=3600, retries=2, allow_stale=True):
        """
        Improved caching with stale-while-revalidate pattern
        
        Args:
            cache_key: Cache key
            compute_fn: Function to compute result
            ttl: Time to live in seconds
            retries: Number of retries
            allow_stale: Return stale cache on failure
        """
        # Try to get cached data
        cached = cache.get(cache_key)
        
        # If cache exists and is fresh, return immediately
        if cached is not None:
            logger.info("[Cache HIT] {}".format(cache_key))
            return Response(cached, status=status.HTTP_200_OK)
        
        # Check for stale cache key
        stale_key = "{}_stale".format(cache_key)
        stale_cached = cache.get(stale_key) if allow_stale else None
        
        # Cache miss - compute new result
        last_exception = None
        
        for attempt in range(retries + 1):
            try:
                logger.info("[Cache MISS] Attempt {}/{} for {}".format(
                    attempt + 1, retries + 1, cache_key))
                
                result = compute_fn()
                
                if result is not None:
                    # Cache successful result
                    cache.set(cache_key, result, ttl)
                    # Keep stale copy for longer
                    cache.set(stale_key, result, ttl * 24)  # 24x longer
                    logger.info("[Cache SET] {}".format(cache_key))
                    return Response(result, status=status.HTTP_200_OK)
                else:
                    logger.warning("[Compute] Attempt {} returned None".format(attempt + 1))
                    
            except Exception as e:
                logger.error("[Compute] Attempt {} failed: {}".format(attempt + 1, str(e)))
                last_exception = e
            
            # Backoff before retry
            if attempt < retries:
                time.sleep(2 * (attempt + 1))
        
        # All retries failed - try to return stale data
        if stale_cached is not None:
            logger.warning("[Cache] Returning STALE data for {}".format(cache_key))
            return Response(
                stale_cached,
                status=status.HTTP_200_OK,
                headers={'X-Cache-Status': 'STALE'}
            )
        
        # No stale data available - return error
        logger.error("[Cache] All attempts failed for {}".format(cache_key))
        return Response(
            {
                "error": "Service temporarily unavailable",
                "detail": "Unable to fetch data from Loki. Please try again later.",
                "debug": str(last_exception) if last_exception else "No response"
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    def _parse_date_range(self, request):
        from_str = request.query_params.get("from")
        to_str   = request.query_params.get("to")
        if not from_str or not to_str:
            raise ValueError("Please provide both from and to in format YYYY-MM-DD HH:MM:SS")
        from_dt = parse_datetime(from_str)
        to_dt   = parse_datetime(to_str)
        if not from_dt or not to_dt:
            raise ValueError("Invalid date format")
        return from_dt, to_dt

    def _validate_and_chunk_date_range(self, from_dt, to_dt):
        """Split date ranges longer than 30 days into multiple chunks"""
        MAX_RANGE_DAYS = 30
        delta = to_dt - from_dt
        total_days = delta.days + (delta.seconds / 86400)
        
        if total_days <= MAX_RANGE_DAYS:
            return [(from_dt, to_dt)]
        
        chunks = []
        current = from_dt
        while current < to_dt:
            chunk_end = min(current + timedelta(days=MAX_RANGE_DAYS), to_dt)
            chunks.append((current, chunk_end))
            current = chunk_end
        
        return chunks

    # ------------------------------------------------------------------ #
    # 1. funnels (ALREADY FIXED)
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def funnels(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant_id = str(self.request.user.org)
               
        data = self._get_cached_data("funnel_apm", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )            # ------------------------------------------------------------------ #
    # 2. returning_customers (FIXED)
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def returning_customers(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
               
        data = self._get_cached_data("returning_customers", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 3. new_customers_monthly
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def new_customers_monthly(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
               
        data = self._get_cached_data("new_customers_monthly", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)

        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 4. new_vs_returning_customers
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def new_vs_returning_customers(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("new_vs_returning", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)

        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 5. checkout_abandon_rate
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def checkout_abandon_rate(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("checkout_abandon", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 6. conversion_rate_monthly
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def conversion_rate_monthly(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("conversion_rate", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)

        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 7. orders_placed_by_month
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def orders_placed_by_month(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("orders_placed", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 8. top_categories_by_product_views
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def top_categories_by_product_views(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)

        data = self._get_cached_data("top_categories", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 9. traffic_source_row_percentage
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def traffic_source_row_percentage(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("traffic_source", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        

        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 10. revenue_by_top_category
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def revenue_by_top_category(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)

        data = self._get_cached_data("revenue_category", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 11. revenue_by_traffic_source
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def revenue_by_traffic_source(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("revenue_traffic", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 12. metric_timeseries (NO CHANGES - DB only)
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def metric_timeseries(self, request, pk=None, *args, **kwargs):

        METRIC_MAP = {
            "payment_failure_rate":    ["Throughput"],
            "avg_response_time": ["P95 Response Time", "Response Time (P95)"],
            "error_rate":    ["Error Rate"],
            "cpu_usage":     ["CPU Usage (Avg)"],
            "availability":  ["Availability"],
            "duration":      ["duration"],
            "health_count":  ["health_count"],
            "total_queries": ["Total Queries"],
            "payment_gateway_latency": ["Latency"],
        }

        def get_metric_key(metric_key, metric_map):
            for key, aliases in metric_map.items():
                all_aliases = [key] + aliases
                for alias in all_aliases:
                    if alias.lower() == metric_key.lower():
                        return aliases[0]
            return None

        app_id = pk
        try:
            parent_app = ParentApp.objects.get(pk=app_id, customer=request.user.org)
        except ParentApp.DoesNotExist:
            return Response(
                {"error": "App not found or access denied."},
                status=status.HTTP_404_NOT_FOUND
            )

        metric_key = request.query_params.get("metric")
        node_type  = request.query_params.get("type", "application")

        if not metric_key:
            return Response(
                {"error": "Please provide a metric name. Allowed: {}".format(", ".join(METRIC_MAP.keys()))},
                status=status.HTTP_400_BAD_REQUEST,
            )

        metric = get_metric_key(metric_key, METRIC_MAP)
        if not metric:
            allowed = ", ".join(
                ["{} ({})".format(k, ", ".join(v)) for k, v in METRIC_MAP.items()]
            )
            return Response(
                {"error": "Invalid metric. Allowed: {}".format(allowed)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        import pytz
        UTC = pytz.UTC

        if from_dt.tzinfo is None:
            from_dt = UTC.localize(from_dt)
        if to_dt.tzinfo is None:
            to_dt = UTC.localize(to_dt)

        delta_days = (to_dt - from_dt).days + 1
        if delta_days <= 1:
            grouping = "hour"
        elif delta_days <= 7:
            grouping = "day"
        else:
            grouping = "week"

        def build_time_slots(from_dt, to_dt, grouping):
            slots = []
            if grouping == "hour":
                cursor = from_dt.replace(minute=0, second=0, microsecond=0)
                while cursor <= to_dt:
                    slot_end = cursor + timedelta(hours=1)
                    slots.append((cursor.strftime("%H:00"), cursor, slot_end))
                    cursor = slot_end
            elif grouping == "day":
                cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
                while cursor <= to_dt:
                    slot_end = cursor + timedelta(days=1)
                    slots.append((cursor.strftime("%a"), cursor, slot_end))
                    cursor = slot_end
            else:
                cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
                week_num = 1
                while cursor <= to_dt:
                    slot_end = min(cursor + timedelta(days=7), to_dt)
                    slots.append(("Week {}".format(week_num), cursor, slot_end))
                    cursor += timedelta(days=7)
                    week_num += 1
            return slots

        slots = build_time_slots(from_dt, to_dt, grouping)

        monitored_ids = list(
            parent_app.monitoredapp_set.values_list("id", flat=True)
        )
        if not monitored_ids:
            return Response([], status=status.HTTP_200_OK)

        topo_cache_key = "apm:topology_rows:{}:{}:{}".format(
            "-".join(str(i) for i in sorted(monitored_ids)),
            from_dt.isoformat(),
            to_dt.isoformat(),
        )
        topo_rows = cache.get(topo_cache_key)
        if topo_rows is None:
            topologies = APMTopology.objects.filter(
                app_id__in=monitored_ids,
                created_at__gte=from_dt,
                created_at__lte=to_dt,
            ).select_related("app")
            topo_rows = [
                {
                    "nodes": topo.topology_data.get("nodes", []),
                    "created_at": topo.created_at,
                    "app_name": topo.app.name,
                }
                for topo in topologies
            ]
            cache.set(topo_cache_key, topo_rows, 30)

        all_records = []
        for topo in topo_rows:
            nodes = topo["nodes"]
            for node in nodes:
                if node.get("type") != node_type:
                    continue
                metadata = node.get("metadata", {})
                val      = metadata.get(metric)
                cleaned  = clean_metric_value(val)
                if cleaned is None:
                    continue

                created_at = topo["created_at"]
                if created_at.tzinfo is None:
                    created_at = UTC.localize(created_at)

                all_records.append({
                    "value":      cleaned,
                    "created_at": created_at,
                    "name":       node.get("name"),
                    "app":        topo["app_name"],
                })

        if not all_records:
            return Response(
                [{"sum": 0.0, "range": label} for label, _, _ in slots],
                status=status.HTTP_200_OK,
            )

        def calc_slot_value(slot_records):
            values = []
            for r in slot_records:
                try:
                    values.append(float(r["value"]))
                except (TypeError, ValueError):
                    continue
            return round(sum(values) / len(values), 2) if values else 0.0

        results_map = {}
        for label, slot_start, slot_end in slots:
            slot_records = [
                r for r in all_records
                if slot_start <= r["created_at"] < slot_end
            ]
            if not slot_records:
                slot_records = all_records
            results_map[label] = calc_slot_value(slot_records)

        response_data = [
            {"sum": results_map.get(label, 0.0), "range": label}
            for label, _, _ in slots
        ]

        return Response(response_data, status=status.HTTP_200_OK)

    # ------------------------------------------------------------------ #
    # 13. operational_anomaly_kpis (unchanged  static data)
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def operational_anomaly_kpis(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = OPERATIONAL_ANOMALY_KPIS_DATA.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def funnels_easy_trade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        if from_dt < (BASE_DT - timedelta(days=MAX_DAYS)) or to_dt < BASE_DT:
            return Response({"sessions": 0, "order_submitted": 0, "order_executed": 0}, status=status.HTTP_200_OK)

        diff_days = (to_dt - BASE_DT).days
        diff_days = min(max(diff_days, 1), MAX_DAYS)

        key = "{}_day".format(diff_days)
        data = FUNNEL_DATA_CACHE_EASYTRADE.get(key, {"sessions": 0, "order_submitted": 0, "order_executed": 0})
        return Response(data, status=status.HTTP_200_OK)




    @detail_route(methods=['GET'])
    def session_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = SESSIONS.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def new_users_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = NEW_USERS.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def order_success_rate_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = ORDER_SUCCESS_RATE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def conversion_rate_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = CONVERSION_RATE_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def order_placed_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = ORDER_PLACED_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def unique_customers_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = UNIQUE_CUSTOMERS_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def application_resp_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = APPLICATION_RESP_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def error_rate_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = ERROR_RATE_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def failure_rate_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = FAILURE_RATE_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def latency_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = LATENCY_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def kpis_usd_easytrade(self, request, *args, **kwargs):

        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)
        
        diff_days = (to_dt - from_dt).days + 1
        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [{"total": 0, "range": to_dt.strftime('%a')}]},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            new_customers = []
            for i in range(7):
                day = (to_dt - timedelta(days=i)).strftime('%a')
                new_customers.append({"range": day, "total": 0})
            return Response(
                {"grouping": "day", "new_customers": new_customers},
                status=status.HTTP_200_OK
            )
        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)
        if from_dt < cache_start or to_dt > cache_end:
            if (to_dt.year == from_dt.year) and (to_dt.month - from_dt.month == 1):
                weeks = []
                week_count = (to_dt - from_dt).days // 7 + 1
                for i in range(week_count):
                    week = "Week {}".format(i+1)
                    weeks.append({"range": week, "total": 0})

                return Response(
                    {"grouping": "week", "new_customers": weeks},
                    status=status.HTTP_200_OK
                )
            elif (to_dt.year != from_dt.year) or (to_dt.month - from_dt.month > 1):
                months = []
                start_month = from_dt.month
                start_year = from_dt.year

                while start_month <= to_dt.month and (start_year < to_dt.year or (start_year == to_dt.year)):
                    month_name = calendar.month_abbr[start_month]
                    months.append({"range": month_name, "total": 0})

                    if start_month == 12:
                        start_month = 1
                        start_year += 1
                    else:
                        start_month += 1

                return Response(
                    {"grouping": "month", "new_customers": months},
                    status=status.HTTP_200_OK
                )
        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)
        key = "{}_day".format(diff_days_from_base)
        data = KPIS_USD_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)





    @detail_route(methods=['GET'])
    def active_users_vs_events_easytrade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        diff_days = (to_dt - from_dt).days + 1

        if diff_days == 1:
            return Response(
                {"grouping": "day", "new_customers": [], "returning_customers": []},
                status=status.HTTP_200_OK
            )
        elif diff_days == 7:
            return Response(
                {"grouping": "week", "new_customers": [], "returning_customers": []},
                status=status.HTTP_200_OK
            )

        cache_start = BASE_DT - timedelta(days=MAX_DAYS)
        cache_end = BASE_DT + timedelta(days=MAX_DAYS)

        if from_dt < cache_start or to_dt > cache_end:
            return Response(
                {"grouping": "month", "new_customers": [], "returning_customers": []},
                status=status.HTTP_200_OK
            )

        diff_days_from_base = (to_dt - BASE_DT).days
        diff_days_from_base = min(max(diff_days_from_base, 1), MAX_DAYS)

        key = "{}_day".format(diff_days_from_base)
        data = ACTIVE_USERS_VS_EVENTS_EASYTRADE.get(key, {
            "grouping": "week",
            "new_customers": [],
            "returning_customers": []
        })
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def sum_orders_submitted_easytrade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        diff_days = (to_dt - BASE_DT).days
        diff_days = min(max(diff_days, 1), MAX_DAYS)

        key = "{}_day".format(diff_days)
        data = SUM_ORDERS_SUBMITTED_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def revenue_by_marketsource_easytrade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        diff_days = (to_dt - BASE_DT).days
        diff_days = min(max(diff_days, 1), MAX_DAYS)

        key = "{}_day".format(diff_days)
        data = REVENUE_BY_MARKETING_SOURCE_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def revenue_by_region_easytrade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        diff_days = (to_dt - BASE_DT).days
        diff_days = min(max(diff_days, 1), MAX_DAYS)

        key = "{}_day".format(diff_days)
        data = REVENUE_BY_REGION_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)


    @detail_route(methods=['GET'])
    def sum_orders_executed_region_easytrade(self, request, *args, **kwargs):
        from_str = request.query_params.get("from")
        to_str = request.query_params.get("to")
        if not from_str or not to_str:
            return Response(
                {"error": "Please provide both 'from' and 'to' in format YYYY-MM-DD HH:MM:SS"},
                status=status.HTTP_400_BAD_REQUEST
            )

        from_dt = parse_input_datetime(from_str)
        to_dt = parse_input_datetime(to_str)
        if not from_dt or not to_dt:
            return Response({"error": "Invalid date format"}, status=status.HTTP_400_BAD_REQUEST)

        diff_days = (to_dt - BASE_DT).days
        diff_days = min(max(diff_days, 1), MAX_DAYS)

        key = "{}_day".format(diff_days)
        data = SUM_ORDERS_EXECUTED_REGION_EASYTRADE.get(key, {})
        return Response(data, status=status.HTTP_200_OK)

    @detail_route(methods=['GET'])
    def boa_funnels(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        tenant_id = str(self.request.user.org)
               
        data = self._get_cached_data("boa_funnels", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        ) 

    # ------------------------------------------------------------------ #
    # 2. BOA Error Analysis
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def boa_error_analysis(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
               
        data = self._get_cached_data("boa_error_analysis", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    # ------------------------------------------------------------------ #
    # 4. BOA Daily Active Users
    # ------------------------------------------------------------------ #
    @detail_route(methods=['GET'])
    def boa_daily_active_users(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
               
        data = self._get_cached_data("boa_daily_active_users", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    @detail_route(methods=['GET'])
    def boa_signup_failure_rate(self, request, *args, **kwargs):
        """
        Get signup failure rate for Bank of Anthos
        Matches conversion_rate_monthly exactly
        """
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("boa_signup_failure_rate", tenant_id, from_dt, to_dt)
        
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)

        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    @detail_route(methods=['GET'])
    def boa_success_rates(self, request, *args, **kwargs):
        """
        Get ALL success rates for Bank of Anthos in ONE endpoint
        Returns: {
            "login_success_rate": 85.5,
            "signup_success_rate": 92.3,
            "payment_success_rate": 94.7,
            "balance_success_rate": 98.2,
            "transaction_success_rate": 96.8
        }
        """
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        # Check cache first
        data = self._get_cached_data("boa_success_rates", tenant_id, from_dt, to_dt)

        # This endpoint can compute on miss, so an empty cache entry falls
        # through to a fresh computation rather than being served as-is.
        if data:
            return Response(data, status=status.HTTP_200_OK)

        # Compute all success rates
        result = compute_boa_success_rates_data(tenant_id, from_dt, to_dt)
        
        return Response(result, status=status.HTTP_200_OK)
    
    # 8. BOA User Journey
    @detail_route(methods=['GET'])
    def boa_user_journey(self, request, *args, **kwargs):
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        data = self._get_cached_data("boa_user_journey", tenant_id, from_dt, to_dt)
        # An empty payload is a real answer, not a cache miss: treating {} as
        # missing made these endpoints answer 503 until the entry expired.
        if data is not None:
            return Response(data, status=status.HTTP_200_OK)
        
        return Response(
            {"error": "Data not ready. Please try after some time."},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

    @detail_route(methods=['GET'])
    def boa_traffic_percentages(self, request, *args, **kwargs):
        """
        Get traffic distribution percentages for Bank of Anthos services
        Returns: {
            "frontend_percentage": 35.2,
            "payment_percentage": 8.0,
            "balance_percentage": 20.6,
            "contacts_percentage": 5.4,
            "userservice_percentage": 16.0
        }
        """
        try:
            from_dt, to_dt = self._parse_date_range(request)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = str(request.user.org)
        
        # Check cache
        data = self._get_cached_data("boa_traffic_percentages", tenant_id, from_dt, to_dt)

        # This endpoint can compute on miss, so an empty cache entry falls
        # through to a fresh computation rather than being served as-is.
        if data:
            return Response(data, status=status.HTTP_200_OK)

        # Compute percentages
        result = compute_boa_traffic_distribution_percentages(tenant_id, from_dt, to_dt)
        
        return Response(result, status=status.HTTP_200_OK)


class DetailTopologyViewSet(viewsets.ViewSet):
    @list_route(methods=['get'])
    def business_unit(self, request):
        business_id = request.GET.get('business_id')
        license_ids = request.GET.getlist('license_id')
        data = []
        if business_id:
            if license_ids:
                data = list(
                    BusinessModelLicenseCostCentre.objects.filter(
                        business_service__customer=request.user.org,
                        license_centre_id__in=license_ids
                    ).distinct().values(
                        'app_name_id',
                        'app_name__name'
                    )
                )
            else:
                data = list(
                    BusinessModelLicenseCostCentre.objects.filter(
                        business_service__customer=request.user.org,
                        business_service=business_id
                    ).distinct().values(
                        'license_centre_id',
                        'license_centre__name'
                    )
                )
            return JsonResponse(data, safe=False)
        queryset = BusinessModelLicenseCostCentre.objects.filter(
            business_service__customer=request.user.org
        ).distinct('business_service_id')

        serializer = BusinessModelMinLicenseCostCentreSerializer(queryset, many=True)
        return JsonResponse(serializer.data, safe=False)

    @list_route(methods=['get'])  # this is hold for now. UI hasn't developed yet
    def app_topology_node_map(self, request):
        parent_service_id = request.GET.get('service_id')
        node_id = request.GET.get('node_id')
        service_obj = MonitoredApp.objects.get(uuid=parent_service_id)
        topology_info = APMTopology.objects.filter(app=service_obj).last()
        serializer = APMTopologySerializer(topology_info, context={"request": request})
        topology_data = serializer.data.get("topology_data", None)
        connection_info = find_connected_nodes(topology_data, node_id)
        return JsonResponse(connection_info, safe=False)

    @list_route(methods=['get'])
    def app_service_topology_details(self, request):
        """Return full topology details including nodes and links."""

        layer = request.GET.get("layer", "service")
        app_ids = request.GET.getlist("app_id")
        if not app_ids:
            app_id_param = request.GET.get("app_id")
            if app_id_param:
                app_ids = app_id_param.split(",")
        app_ids = [aid.strip() for aid in app_ids if aid.strip()]
        apps = ParentApp.objects.filter(id__in=app_ids, customer=request.user.org)
        if not apps.exists():
            return JsonResponse({"error": "No apps found"}, status=404)
        results = []
        for app in apps:
            cache_entry = app.topology_cache_data.filter(layer=layer).first()
            if cache_entry:
                results.append(cache_entry.data)
            else:
                merged, _ = build_topology_data(request, only_summary=False)
                results = [merged]
            build_topology_data_task.delay(request.user.id, app.id, layer)
        return JsonResponse(results, safe=False)


GRAPH_METRIC_TYPES = (
    "cpu_utilization",
    "mem_usage",
    "disk_read_write",
    "sys_load",
)

GRAPH_EMPTY_MESSAGES = {
    "no_monitored_apps": "The application has no monitored services.",
    "no_topology": "No topology has been generated for the monitored services yet.",
    "topology_has_no_nodes": (
        "A topology exists but none of its revisions store topology nodes, "
        "so no device could be resolved."
    ),
    "nodes_not_linked_to_devices": (
        "Topology nodes exist but none of them is linked to an inventory device."
    ),
    "devices_not_monitored_by_zabbix": (
        "The topology devices are not monitored by Zabbix, so no metrics can be read."
    ),
    "unknown_graph_type": (
        "Unknown graph_type. Use one of: {0}.".format(
            ", ".join(GRAPH_METRIC_TYPES)
        )
    ),
    "no_history_in_window": (
        "No metric history was recorded for the selected time range."
    ),
}


def select_topology_with_nodes(app):
    """Return the newest topology of ``app`` that actually stores nodes.

    The ingest path persists a topology as JSON on ``topology_data`` without
    creating ``TopologyNode`` rows, so the newest revision is routinely empty
    while older revisions still carry the device links these graphs need.
    Picking the newest populated revision keeps the endpoint working; callers
    surface ``topology_as_of`` so the snapshot age stays visible.
    """
    return (
        APMTopology.objects
        .filter(app=app)
        .annotate(node_count=Count("nodes"))
        .filter(node_count__gt=0)
        .order_by("-id")
        .first()
    )


def graph_empty_reason(stats, graph_type=None):
    """Explain which link of the topology -> device -> metric chain broke."""
    if graph_type is not None and graph_type not in GRAPH_METRIC_TYPES:
        reason = "unknown_graph_type"
    elif not stats.get("monitored_apps"):
        reason = "no_monitored_apps"
    elif not stats.get("apps_with_topology"):
        reason = "no_topology"
    elif not stats.get("apps_with_populated_topology"):
        reason = "topology_has_no_nodes"
    elif not stats.get("nodes_with_device"):
        reason = "nodes_not_linked_to_devices"
    elif not stats.get("devices_with_zabbix"):
        reason = "devices_not_monitored_by_zabbix"
    else:
        reason = "no_history_in_window"
    return reason, GRAPH_EMPTY_MESSAGES[reason]


class BusinessSummaryViewSet(viewsets.ViewSet):

    METRIC_MAP = {
        "throughput": ["Throughput"],
        "response_time": ["P95 Response Time", "Response Time (P95)"],
        "error_rate": ["Error Rate"],
        "cpu_usage": ["CPU Usage (Avg)"],
        "availability": ["Availability"],
        "duration": ["duration"],
        "health_count": ["health_count"],
        "total_queries": ["Total Queries"],
    }

    @list_route(methods=["get"])
    def data(self, request):
    
        def get_metric_key(metric_key, metric_map):
            for key, aliases in metric_map.iteritems():
                all_aliases = [key] + aliases
                for alias in all_aliases:
                    if alias.lower() == metric_key.lower():
                        return aliases[0]
            return None

        def parse_date(date_str):
            try:
                return UTC.localize(datetime.strptime(date_str, DATE_FMT))
            except Exception:
                return None

        def get_grouping(days):
            if days <= 7:
                return "day"
            elif days <= 30:
                return "week"
            elif days < 364:
                return "month"
            return "quarter"

        app_ids = request.GET.getlist("app_id") or []
        if not app_ids:
            app_id_param = request.GET.get("app_id")
            if app_id_param:
                app_ids = [a.strip() for a in app_id_param.split(",") if a.strip()]

        metric_key = request.GET.get("key")
        node_type = request.GET.get("type", "application")
        from_str, to_str = request.GET.get("from"), request.GET.get("to")

        if not metric_key:
            return Response({"detail": "Please provide a metric name"}, status=status.HTTP_400_BAD_REQUEST)

        metric = get_metric_key(metric_key, self.METRIC_MAP)
        if not metric:
            allowed = ", ".join(
                ["{} ({})".format(k, ", ".join(v)) for k, v in self.METRIC_MAP.iteritems()]
            )
            return Response({"detail": "Invalid metric. Allowed: {}".format(allowed)},
                            status=status.HTTP_400_BAD_REQUEST)

        # Dates
        UTC = pytz.UTC
        DATE_FMT = "%Y-%m-%d %H:%M:%S"
        from_dt, to_dt = parse_date(from_str), parse_date(to_str)

        parent_apps = ParentApp.objects.filter(id__in=app_ids).prefetch_related("monitoredapp_set")
        if not parent_apps.exists():
            return Response({"detail": "No valid applications found"}, status=status.HTTP_404_NOT_FOUND)

        # Prefetch all topology data once
        all_monitored_ids = [ma.id for p in parent_apps for ma in p.monitoredapp_set.all()]

        topo_by_app = None
        topo_cache_key = None
        if from_dt and to_dt:
            topo_cache_key = "apm:business_summary_topo:{}:{}:{}".format(
                "-".join(str(i) for i in sorted(all_monitored_ids)),
                from_dt.isoformat(),
                to_dt.isoformat(),
            )
            topo_by_app = cache.get(topo_cache_key)

        if topo_by_app is None:
            topologies = APMTopology.objects.filter(app_id__in=all_monitored_ids)
            if from_dt and to_dt:
                topologies = topologies.filter(created_at__range=(from_dt, to_dt))
            topologies = topologies.select_related("app")

            topo_by_app = defaultdict(list)
            for t in topologies:
                topo_by_app[t.app_id].append(t)

            if topo_cache_key:
                cache.set(topo_cache_key, topo_by_app, 30)

        data, ind_avg = [], []

        for parent_app in parent_apps:
            parent_data = {
                "app_id": parent_app.id,
                "app_name": parent_app.name,
                "customer": str(request.user.org),
                "services": []
            }

            up_count = down_count = unknown_count = 0

            for monitored_app in parent_app.monitoredapp_set.all():
                topo_list = topo_by_app.get(monitored_app.id, [])
                if not topo_list:
                    continue

                if not (from_dt and to_dt):
                    from_dt = min(t.created_at for t in topo_list)
                    to_dt = max(t.created_at for t in topo_list)

                grouping = get_grouping((to_dt - from_dt).days)

                result = []
                for topo in topo_list:
                    nodes = topo.topology_data.get("nodes", [])
                    for node in nodes:
                        if node.get("type") != node_type:
                            continue
                        metadata = node.get("metadata", {})
                        val = metadata.get(metric)
                        result.append({
                            "app": topo.app.name,
                            "name": node.get("name"),
                            "value": clean_metric_value(val),
                            "created_at": topo.created_at,
                        })

                last_topo = max(topo_list, key=lambda t: t.created_at)
                for node in last_topo.topology_data.get("nodes", []):
                    if node.get("type") == node_type and node.get("layer") == "component":
                        status_val = node.get("status")
                        if status_val == 1:
                            up_count += 1
                        elif status_val == 0:
                            down_count += 1
                        elif status_val == -1:
                            unknown_count += 1
                grouped_data = aggregate(result, grouping, from_dt, to_dt)
                avg, cur, peak = compute_stats(result, grouping, from_dt)
                ind_avg.append(avg)

                parent_data["services"].append({
                    "avg": avg,
                    "data": grouped_data,
                    "grouping": grouping,
                    "service": monitored_app.name,
                    "service_id": monitored_app.uuid,
                })
            if parent_data["services"]:
                if metric_key == "availability" and node_type == "component":
                    parent_data.update({
                        "up_count": up_count,
                        "down_count": down_count,
                        "unknown_count": unknown_count,
                    })
                    ind_avg.append(int(up_count) + int(down_count) + int(unknown_count))
                data.append(parent_data)

        total_avg = {"total_avg": float(sum(ind_avg)) / len(ind_avg)} if ind_avg else 0
        data.append(total_avg)

        if not data:
            return Response({"detail": "No data found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"data": data}, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def graph(self, request, *args, **kwargs):
        import datetime
        import pytz
        from collections import defaultdict

        UTC = pytz.UTC
        DATE_FMT = "%Y-%m-%d %H:%M:%S"

        app_id = request.GET.get("app_id")
        start_str = request.GET.get("from")
        end_str = request.GET.get("to")
        graph_type = request.GET.get("graph_type")

        # Parse or fallback
        if start_str and end_str:
            try:
                start = datetime.datetime.strptime(start_str.replace("+", " "), DATE_FMT)
                end = datetime.datetime.strptime(end_str.replace("+", " "), DATE_FMT)
            except ValueError:
                return Response(
                    {"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            end = datetime.datetime.utcnow()
            start = end - datetime.timedelta(hours=1)

        from_ts = int(EDate(start).get_utc_timestamp())
        to_ts = int(EDate(end).get_utc_timestamp())

        parent = ParentApp.objects.get(id=app_id, customer=request.user.org)
        monitor_apps = MonitoredApp.objects.filter(parent_app=parent)

        # Keep per-device data
        per_device_data = {}
        data = []
        zabbix_db_ip = request.user.org.zabbixcustomer.zabbix_instance.ip_address
        # Counters so an empty response can name the broken link instead of
        # returning a bare {"devices": []}.
        stats = {
            "monitored_apps": monitor_apps.count(),
            "apps_with_topology": 0,
            "apps_with_populated_topology": 0,
            "nodes": 0,
            "nodes_with_device": 0,
            "devices_with_zabbix": 0,
            "devices_with_history": 0,
        }
        topology_timestamps = []

        for app in monitor_apps:
            topology = select_topology_with_nodes(app)
            if not topology:
                if APMTopology.objects.filter(app=app).exists():
                    stats["apps_with_topology"] += 1
                continue
            stats["apps_with_topology"] += 1
            stats["apps_with_populated_topology"] += 1
            if topology.created_at:
                topology_timestamps.append(topology.created_at)
            nodes = TopologyNode.objects.filter(topology=topology).distinct('uuid')

            for node in nodes:
                stats["nodes"] += 1
                device = node.device
                # device_id/content_type are nullable, so service nodes that
                # were never linked to inventory resolve to None here.
                if not device:
                    continue
                stats["nodes_with_device"] += 1
                if not device.zabbix:
                    continue
                stats["devices_with_zabbix"] += 1

                # Fetch metric safely
                if graph_type == "cpu_utilization":
                    # v = device.zabbix.get_cpu_utilization(start, end)
                    v = get_cpu_utilization_history_timeseries_data(
                        [device.zabbix.host_id],
                        zabbix_db_ip,
                        from_ts,
                        to_ts
                    )
                elif graph_type == "mem_usage":
                    # v = device.zabbix.get_mem_usage(start, end)
                    v = get_mem_usage_history_timeseries_data(
                        [device.zabbix.host_id],
                        zabbix_db_ip,
                        from_ts,
                        to_ts
                    )
                elif graph_type == "disk_read_write":
                    # v = device.zabbix.get_disk_io(start, end)
                    v = get_disk_read_write_history_timeseries_data(
                        [device.zabbix.host_id],
                        zabbix_db_ip,
                        from_ts,
                        to_ts
                    )
                elif graph_type == "sys_load":
                    # v = device.zabbix.get_sys_load(start, end)
                    v = get_sys_load_history_timeseries_data(
                        [device.zabbix.host_id],
                        zabbix_db_ip,
                        from_ts,
                        to_ts
                    )
                else:
                    v = None   # unknown graph_type

                # --- Handle None / empty case ---
                if not v or not v.get("history"):
                    from_dt = UTC.localize(datetime.datetime.strptime(start_str, DATE_FMT)) if start_str else start
                    to_dt = UTC.localize(datetime.datetime.strptime(end_str, DATE_FMT)) if end_str else end
                    date_diff = (to_dt - from_dt).days

                    if date_diff <= 7:
                        grouping = "day"
                    elif date_diff <= 30:
                        grouping = "week"
                    elif date_diff < 364:
                        grouping = "month"
                    else:
                        grouping = "quarter"

                    # Create 0-filled ranges using aggregate() helper
                    grouped_data = aggregate([], grouping, from_dt, to_dt)

                    # overwrite averages with 0
                    for d in grouped_data:
                        d["average"] = 0.0

                    per_device_data[device.name] = {
                        "avg": 0.0,
                        "cur": 0.0,
                        "peak": "0.0@" + (grouped_data[-1]["range"] if grouped_data else ""),
                        "data": grouped_data,
                        "grouping": grouping
                    }

                    if per_device_data not in data:
                        data.append(per_device_data)
                    continue
                # --- Normal case below ---

                combined_data = defaultdict(list)
                for h in v.get("history", []):
                    ts = h.get("clock")
                    val = float(h.get("value", 0))

                    if isinstance(ts, datetime.datetime):
                        ts_dt = ts.replace(tzinfo=UTC) if ts.tzinfo is None else ts.astimezone(UTC)
                    else:
                        ts_dt = datetime.datetime.utcfromtimestamp(int(ts)).replace(tzinfo=UTC)

                    combined_data[ts_dt].append(val)

                points = []
                for ts_dt, values in combined_data.items():
                    avg_val = sum(values) / len(values)
                    points.append({
                        "created_at": ts_dt,
                        "value": avg_val
                    })

                if not points:
                    continue

                stats["devices_with_history"] += 1
                from_dt = UTC.localize(datetime.datetime.strptime(start_str, DATE_FMT)) if start_str else start
                to_dt = UTC.localize(datetime.datetime.strptime(end_str, DATE_FMT)) if end_str else end
                date_diff = (to_dt - from_dt).days

                if date_diff <= 7:
                    grouping = "day"
                elif date_diff <= 30:
                    grouping = "week"
                elif date_diff < 364:
                    grouping = "month"
                else:
                    grouping = "quarter"

                grouped_data = aggregate(points, grouping, from_dt, to_dt)
                avg, cur, peak = compute_stats(points, grouping, from_dt)

                per_device_data[device.name] = {
                    "avg": avg,
                    "cur": cur,
                    "peak": peak,
                    "data": grouped_data,
                    "grouping": grouping
                }
                if per_device_data not in data:
                    data.append(per_device_data)

        all_values = []

        for device_stats in per_device_data.values():
            # Collect all data points
            for point in device_stats["data"]:
                all_values.append(point["average"])

        total_avg = sum(all_values) / len(all_values) if all_values else 0
        topology_as_of = (
            max(topology_timestamps) if topology_timestamps else None
        )
        payload = {
            "devices": data,
            "total_avg": total_avg,
            # The newest topology revision that still stores nodes may be old,
            # so the snapshot age travels with the data instead of being
            # presented as current.
            "topology_as_of": (
                topology_as_of.isoformat() if topology_as_of else None
            ),
        }

        if not data or graph_type not in GRAPH_METRIC_TYPES:
            reason, message = graph_empty_reason(stats, graph_type)
            payload["reason"] = reason
            payload["message"] = message
            payload["diagnostics"] = stats

        return Response(payload, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def cloud_list(self, request):
        app_ids = request.GET.getlist('app_id')
        if not app_ids:
            app_id_param = request.GET.get('app_id')
            if app_id_param:
                app_ids = app_id_param.split(',')

        parent_apps = ParentApp.objects.filter(id__in=app_ids) if app_ids else ParentApp.objects.none()
        if not parent_apps.exists():
            return Response({"detail": "No valid applications found"}, status=status.HTTP_404_NOT_FOUND)

        monitored_apps = MonitoredApp.objects.filter(
            customer=request.user.org, parent_app__in=parent_apps
        )

        if not monitored_apps.exists():
            return Response([], status=status.HTTP_200_OK)

        # Require nodes: the ingest path stores a topology as JSON without
        # creating TopologyNode rows, so the newest revision is routinely
        # empty while older revisions still carry the cloud nodes.  The join
        # duplicates rows, which is harmless because [:1] keeps one.
        latest_topology_subq = APMTopology.objects.filter(
            app=OuterRef('id'),
            nodes__isnull=False
        ).order_by('-created_at').values('id')[:1]

        monitored_apps = monitored_apps.annotate(
            latest_topology_id=Subquery(latest_topology_subq)
        ).filter(latest_topology_id__isnull=False)

        topology_ids = monitored_apps.values_list('latest_topology_id', flat=True)

        cloud_nodes_qs = (
            TopologyNode.objects.filter(
                topology_id__in=topology_ids,
                node_id="Cloud",
            )
            .annotate(
                platform_type=F("type"),
                # The selected revision can be older than the newest one, so
                # each node reports the snapshot it came from.  Kept on the
                # node because callers consume this endpoint as a plain list.
                topology_as_of=F("topology__created_at")
            )
            .exclude(uuid__isnull=True)
            .values(
                "uuid",
                "platform_type",
                "name",
                "status",
                "topology_as_of"
            )
        )

        seen_uuids = set()
        data = []
        for node in cloud_nodes_qs:
            if node['uuid'] not in seen_uuids:
                seen_uuids.add(node['uuid'])
                data.append(node)

        return Response(data, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def app_info(self, request):
        from datetime import datetime

        app_ids = request.GET.getlist('app_id')
        if not app_ids:
            app_id_param = request.GET.get('app_id')
            if app_id_param:
                app_ids = app_id_param.split(',')
        parent_apps = ParentApp.objects.filter(id__in=app_ids, customer=self.request.user.org) if app_ids else ParentApp.objects.none()

        if not parent_apps.exists():
            return Response({"detail": "No valid applications found"}, status=status.HTTP_404_NOT_FOUND)

        all_metrics = {
            "throughput": [],
            "latency": [],
            "total_requests": [],
            "app_memory": [],
            "response_time": [],
            "availability": [],
            "up_count": [],
            "down_count": []
        }

        for parent_app in parent_apps:
            monitored_apps = MonitoredApp.objects.filter(customer=self.request.user.org, parent_app=parent_app)
            if not monitored_apps.exists():
                continue
            ud_count = 0
            for monitored_app in monitored_apps:
                ud_count+=1
                topology_qs = APMTopology.objects.filter(app=monitored_app).last()
                if topology_qs:
                    nodes = topology_qs.topology_data.get("nodes", [])
                    for node in nodes:
                        if node.get("type") == "service":
                            if node.get("status") == 1:
                                all_metrics["up_count"].append(1)
                                all_metrics["down_count"].append(0)
                            else:
                                all_metrics["up_count"].append(0)
                                all_metrics["down_count"].append(1)
                        metadata = node.get("metadata", {})

                        # Parse numeric values
                        def parse_float(value):
                            if not value:
                                return None
                            # remove non-numeric characters if needed
                            import re
                            try:
                                return float(re.sub(r'[^\d.]', '', str(value)))
                            except:
                                return None
                        all_metrics["throughput"].append(parse_float(metadata.get("Throughput")))
                        all_metrics["latency"].append(parse_float(metadata.get("Latency")))
                        all_metrics["total_requests"].append(metadata.get("Total Requests"))
                        all_metrics["app_memory"].append(parse_float(metadata.get("Memory Usage (Avg)")))
                        all_metrics["response_time"].append(parse_float(metadata.get("P95 Latency")))
                        all_metrics["availability"].append(parse_float(metadata.get("Availability")))
        # Compute averages
        def average(lst):
            lst = [x for x in lst if x is not None]
            return sum(lst) / len(lst) if lst else None
        aggregated_data = {
            "throughput": "{} req/min".format(round(average(all_metrics["throughput"]) or 0, 2)),
            "latency": "{} ms".format(round(average(all_metrics["latency"]) or 0, 2)),
            "total_requests": "{}".format(int(round(average(all_metrics["total_requests"]) or 0, 2))),
            "app_memory": "{} MB".format(round(average(all_metrics["app_memory"]) or 0, 2)),
            "response_time": "{} ms".format(round(average(all_metrics["response_time"]) or 0, 2)),
            "availability": "{} %".format(int(round(average(all_metrics["availability"]) or 0, 2))),
            "up_count": ud_count,
            "down_count": round(sum(all_metrics["down_count"])/ud_count),
        }

        return Response(aggregated_data, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def disabled_list(self, request):
        # business names as list of strings
        business_list = list(
            BusinessModel.objects
            .filter(customer=request.user.org)
            .values_list("business_service_name__name", flat=True)
            .distinct()
        )

        # license names as list of strings
        license_list = list(
            BusinessModelLicenseCostCentre.objects
            .filter(business_service__customer=request.user.org)
            .values_list("license_centre__name", flat=True)
            .distinct()
        )

        data = {
            "business_list": business_list,
            "license_list": license_list,
        }
        return Response(data, status=status.HTTP_200_OK)

    @list_route(methods=['GET'])
    def top_business_events(self, request):
        app_ids = request.GET.getlist('app_id')
        if not app_ids:
            app_id_param = request.GET.get('app_id')
            if app_id_param:
                app_ids = app_id_param.split(',')

        # Filter parent apps
        parent_apps = ParentApp.objects.filter(
            id__in=app_ids, customer=self.request.user.org
        ) if app_ids else ParentApp.objects.none()

        # All monitored apps under these parent apps
        monitored_apps = MonitoredApp.objects.filter(
            parent_app__in=parent_apps,
            customer=self.request.user.org
        )

        all_events = []
        for app in monitored_apps:
            events = Event.objects.filter(
                application=app
            ).order_by('-event_datetime')[:2]
            all_events.extend(events)

        # Serialize all collected events
        serializer = EventListSerializer(all_events, many=True)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size_query_param = 'page_size'
        paginated_data = paginator.paginate_queryset(serializer.data, request)

        return paginator.get_paginated_response(paginated_data)

def get_apm_metrics_data(app_id, key, node_type, from_dt, to_dt, user, METRIC_MAP):
    def get_metric_key(metric_key, metric_map):
        for main_key, aliases in metric_map.iteritems():
            if not isinstance(aliases, (list, tuple)):
                aliases = [aliases] if aliases else []
            
            all_aliases = [main_key] + list(aliases)
            for alias in all_aliases:
                if alias and str(alias).lower() == str(metric_key).lower():
                    return main_key
        return None

    def get_grouping(days):
        if days <= 7:
            return "day"
        elif days <= 30:
            return "day"
        elif days < 364:
            return "day"
        else:  
            return "quarter"

    def clean_metric_value(val):
        if val is None:
            return 0
        try:
            return float(val)
        except:
            return 0

    if not key:
        return {"detail": "Please provide a metric name"}

    metric = get_metric_key(key, METRIC_MAP)
    if not metric:
        allowed_parts = []
        for k, v in METRIC_MAP.iteritems():
            if isinstance(v, (list, tuple)):
                v_str = ", ".join([str(item) for item in v])
            else:
                v_str = str(v)
            allowed_parts.append("{} ({})".format(k, v_str))
        allowed = ", ".join(allowed_parts)
        return {"detail": "Invalid metric. Allowed: {}".format(allowed)}

    parent_app = ParentApp.objects.filter(id=app_id).prefetch_related("monitoredapp_set").first()
    if not parent_app:
        return {"detail": "Parent application not found"}

    monitored_apps = parent_app.monitoredapp_set.all()
    if not monitored_apps.exists():
        return {"detail": "No monitored applications found"}

    monitored_app_ids = list(monitored_apps.values_list('id', flat=True))

    topologies = APMTopology.objects.filter(app_id__in=monitored_app_ids)
    topologies = topologies.filter(created_at__range=(from_dt, to_dt))
    topologies = topologies.select_related("app")

    topo_by_app = defaultdict(list)
    for topology in topologies:
        topo_by_app[topology.app_id].append(topology)

    data = {
        "app_id": parent_app.id,
        "app_name": parent_app.name,
        "customer": str(user.org),
        "services": []
    }

    up_count = down_count = unknown_count = 0
    service_averages = []

    for monitored_app in monitored_apps:
        topo_list = topo_by_app.get(monitored_app.id, [])
        if not topo_list:
            continue

        days_range = (to_dt - from_dt).days
        grouping = get_grouping(days_range)

        result = []
        for topology in topo_list:
            nodes = topology.topology_data.get("nodes", [])
            for node in nodes:
                if node.get("type") != node_type:
                    continue
                metadata = node.get("metadata", {})
                val = metadata.get(metric)
                result.append({
                    "app": topology.app.name,
                    "name": node.get("name"),
                    "value": clean_metric_value(val),
                    "created_at": topology.created_at,
                })

        last_topo = max(topo_list, key=lambda t: t.created_at)
        for node in last_topo.topology_data.get("nodes", []):
            if node.get("type") == node_type and node.get("layer") == "component":
                status_val = node.get("metadata", {}).get("Availability")
                if status_val == 1:
                    up_count += 1
                elif status_val == 0:
                    down_count += 1
                elif status_val == -1:
                    unknown_count += 1

        grouped_data = aggregate(result, grouping, from_dt, to_dt, uai_data=True)
        avg, cur, peak = compute_stats(result, grouping, from_dt)
        service_averages.append(avg)

        data["services"].append({
            "avg": avg,
            "current": cur,
            "peak": peak,
            "data": grouped_data,
            "grouping": grouping,
            "service": monitored_app.name,
            "service_id": monitored_app.uuid,
        })

    if key == "availability" and node_type == "component":
        data.update({
            "up_count": up_count,
            "down_count": down_count,
            "unknown_count": unknown_count,
        })

    if service_averages:
        data["average_across_services"] = float(sum(service_averages)) / len(service_averages)

    if not data["services"]:
        return {"detail": "No data found"}

    return {"data": data}

def graph_data(request):
    import datetime
    import pytz
    from collections import defaultdict

    UTC = pytz.UTC
    DATE_FMT = "%Y-%m-%d %H:%M:%S"

    app_id = request.data.get("app_id")
    start_str = request.GET.get("from")
    end_str = request.GET.get("to")
    graph_type = request.GET.get("graph_type")
    end = datetime.datetime.utcnow()
    start = end - datetime.timedelta(days=90)

    from_ts = int(EDate(start).get_utc_timestamp())
    to_ts = int(EDate(end).get_utc_timestamp())

    parent = ParentApp.objects.get(id=app_id)
    monitor_apps = MonitoredApp.objects.filter(parent_app=parent)

    # Keep per-device data
    per_device_data = {}
    data = []
    zabbix_db_ip = request.user.org.zabbixcustomer.zabbix_instance.ip_address
    # Counters so an empty response can name the broken link instead of
    # returning a bare {"devices": []}.
    stats = {
        "monitored_apps": monitor_apps.count(),
        "apps_with_topology": 0,
        "apps_with_populated_topology": 0,
        "nodes": 0,
        "nodes_with_device": 0,
        "devices_with_zabbix": 0,
        "devices_with_history": 0,
    }
    topology_timestamps = []

    for app in monitor_apps:
        topology = select_topology_with_nodes(app)
        if not topology:
            if APMTopology.objects.filter(app=app).exists():
                stats["apps_with_topology"] += 1
            continue
        stats["apps_with_topology"] += 1
        stats["apps_with_populated_topology"] += 1
        if topology.created_at:
            topology_timestamps.append(topology.created_at)
        nodes = TopologyNode.objects.filter(topology=topology).distinct('uuid')

        for node in nodes:
            stats["nodes"] += 1
            device = node.device
            # device_id/content_type are nullable, so service nodes that were
            # never linked to inventory resolve to None here.
            if not device:
                continue
            stats["nodes_with_device"] += 1
            if not device.zabbix:
                continue
            stats["devices_with_zabbix"] += 1

            # Fetch metric safely
            if graph_type == "cpu_utilization":
                # v = device.zabbix.get_cpu_utilization(start, end)
                v = get_cpu_utilization_history_timeseries_data(
                    [device.zabbix.host_id],
                    zabbix_db_ip,
                    from_ts,
                    to_ts
                )
            elif graph_type == "mem_usage":
                # v = device.zabbix.get_mem_usage(start, end)
                v = get_mem_usage_history_timeseries_data(
                    [device.zabbix.host_id],
                    zabbix_db_ip,
                    from_ts,
                    to_ts
                )
            elif graph_type == "disk_read_write":
                # v = device.zabbix.get_disk_io(start, end)
                v = get_disk_read_write_history_timeseries_data(
                    [device.zabbix.host_id],
                    zabbix_db_ip,
                    from_ts,
                    to_ts
                )
            elif graph_type == "sys_load":
                # v = device.zabbix.get_sys_load(start, end)
                v = get_sys_load_history_timeseries_data(
                    [device.zabbix.host_id],
                    zabbix_db_ip,
                    from_ts,
                    to_ts
                )
            else:
                v = None   # unknown graph_type

            # --- Handle None / empty case ---
            if not v or not v.get("history"):
                from_dt = UTC.localize(datetime.datetime.strptime(start_str, DATE_FMT)) if start_str else start
                to_dt = UTC.localize(datetime.datetime.strptime(end_str, DATE_FMT)) if end_str else end
                date_diff = (to_dt - from_dt).days

                if date_diff <= 7:
                    grouping = "day"
                elif date_diff <= 30:
                    grouping = "day"
                elif date_diff < 364:
                    grouping = "day"
                else:
                    grouping = "quarter"

                # Create 0-filled ranges using aggregate() helper
                grouped_data = aggregate([], grouping, from_dt, to_dt, uai_data=True)

                # overwrite averages with 0
                for d in grouped_data:
                    d["average"] = 0.0

                per_device_data[device.name] = {
                    "avg": 0.0,
                    "cur": 0.0,
                    "peak": "0.0@" + str(grouped_data[-1]["range"] if grouped_data else ""),
                    "data": grouped_data,
                    "grouping": grouping
                }

                if per_device_data not in data:
                    data.append(per_device_data)
                continue
            # --- Normal case below ---

            combined_data = defaultdict(list)
            for h in v.get("history", []):
                ts = h.get("clock")
                val = float(h.get("value", 0))

                if isinstance(ts, datetime.datetime):
                    ts_dt = ts.replace(tzinfo=UTC) if ts.tzinfo is None else ts.astimezone(UTC)
                else:
                    ts_dt = datetime.datetime.utcfromtimestamp(int(ts)).replace(tzinfo=UTC)

                combined_data[ts_dt].append(val)

            points = []
            for ts_dt, values in combined_data.items():
                avg_val = sum(values) / len(values)
                points.append({
                    "created_at": ts_dt,
                    "value": avg_val
                })

            if not points:
                continue

            stats["devices_with_history"] += 1
            from_dt = UTC.localize(datetime.datetime.strptime(start_str, DATE_FMT)) if start_str else start
            to_dt = UTC.localize(datetime.datetime.strptime(end_str, DATE_FMT)) if end_str else end
            date_diff = (to_dt - from_dt).days

            if date_diff <= 7:
                grouping = "day"
            elif date_diff <= 30:
                grouping = "day"
            elif date_diff < 364:
                grouping = "day"
            else:
                grouping = "quarter"

            grouped_data = aggregate(points, grouping, from_dt, to_dt, uai_data=True)
            avg, cur, peak = compute_stats(points, grouping, from_dt)

            per_device_data[device.name] = {
                "avg": avg,
                "cur": cur,
                "peak": peak,
                "data": grouped_data,
                "grouping": grouping
            }
            if per_device_data not in data:
                data.append(per_device_data)

    all_values = []

    for device_stats in per_device_data.values():
        # Collect all data points
        for point in device_stats["data"]:
            all_values.append(point["average"])

    total_avg = sum(all_values) / len(all_values) if all_values else 0
    topology_as_of = max(topology_timestamps) if topology_timestamps else None
    payload = {
        "devices": data,
        "total_avg": total_avg,
        # The newest topology revision that still stores nodes may be old, so
        # the snapshot age travels with the data instead of being presented as
        # current.
        "topology_as_of": (
            topology_as_of.isoformat() if topology_as_of else None
        ),
    }

    if not data or graph_type not in GRAPH_METRIC_TYPES:
        reason, message = graph_empty_reason(stats, graph_type)
        payload["reason"] = reason
        payload["message"] = message
        payload["diagnostics"] = stats

    return payload


class APMDataPassView(APIView):
    authentication_classes = (SessionAuthentication, TokenAuthentication)
    permission_classes = (IsAuthenticated,)


    def get(self, request, *args, **kwargs):
        from app.organization.models import Organization
        data_type = request.query_params.get("type")
        app_id = request.query_params.get("app_id", '7')
        customer_id = request.query_params.get("customer_id", '417')
        parent_app = ParentApp.objects.filter(id=int(app_id)).first()
        org = Organization.objects.get(id=int(customer_id))
        monitoring_apps = MonitoredApp.objects.filter(parent_app=parent_app)
        to_dt = datetime.now(pytz.UTC)
        from_dt = to_dt - timedelta(days=1)

        app_id = parent_app.id

        data = []

        if data_type == "otel_data":
            apps = monitoring_apps.prefetch_related('metric_set', 'log_set', 'trace_set')[:2]
            serializer = OtelDataSerializer(apps, many=True)

            data = serializer.data

        if data_type == 'health' and monitoring_apps:
            serializer = MinimalHealthSerializer(monitoring_apps, many=True)
            data = serializer.data

        if data_type == 'conditions':
            device_ct_q = build_device_contenttype_qs(
            monitoring_apps,
            device_field='alerts__device_id',
            content_type_field='alerts__content_type'
            )

            conditions = Condition.objects.filter(
                    customer=self.request.user.org
                ).filter(
                    Q(alerts__dedup_list__application__in=monitoring_apps) | device_ct_q
                ).distinct().get_only_open_and_recently_resolved().order_by('-last_alert_datetime')

            if conditions.count() > 25:
                conditions = conditions[:25]

            query = (conditions)
            data = ConditionWebhookSerializer(query, many=True).data


        if data_type == 'condition_detail':
            condition_uuid = request.query_params.get("condition_uuid")

            if not condition_uuid:
                return Response(
                    {"error": "condition_id is required"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            condition = get_object_or_404(Condition, uuid=condition_uuid)
            data = CustomConditionDetailSerializer(condition).data

        if data_type == 'device':
            data = []
            ct_cache = {}
            pairs = monitoring_apps.values_list('content_type_id', 'device_id').distinct()
            for ct_id, dev_id in pairs:
                if not ct_id or not dev_id:
                    continue
                if ct_id not in ct_cache:
                    ct_cache[ct_id] = ContentType.objects.get(id=ct_id).model_class()
                model = ct_cache[ct_id]
                device = model.objects.filter(id=dev_id).first()
                if not device:
                    continue
                device_uuid = getattr(device, "uuid", None)
                device_node = {
                    "layer": "host/infrastructure",
                    "type": "host/infrastructure",
                    "name": device.name,
                    "uuid": device_uuid,
                    "device_type": getattr(device, "PLATFORM_TYPE", ""),
                    "status": device_status(device),
                    "metadata": {
                        "Disk Space": getattr(device, "disk_space", 0),
                        "CPU speed": getattr(device, "cpu_speed", 0),
                        "Memory Used": getattr(device, "used_memory", 0),
                        "Storage": getattr(device, "storage", 0),
                        "IP address": getattr(device, "ip_address", ""),
                    }
                }

                data.append(device_node)

        if data_type == "device_summary":
            request.data["app_id"] = app_id

            graph_types = ["cpu_utilization", "mem_usage", "disk_read_write", "sys_load"]

            data = {}

            for gtype in graph_types:
                request.data["graph_type"] = gtype
                data[gtype] = graph_data(request)

        if data_type == 'tasks':
            script_uuid = request.query_params.get("script_uuid")
            ip_to_find = monitoring_apps.first().device.ip_address or monitoring_apps.first().device.management_ip
            # tasks = OrchestrationTask.objects.filter(
            #     target_type="Host",
            #     config__targets__contains=[{"ip_address": ip_to_find}])

            tasks = OrchestrationTask.objects.filter(customer=self.request.user.org, status=0)
            if script_uuid:
                tasks = tasks.filter(script__uuid=script_uuid)
            else:
                tasks = tasks.order_by('id')[:50]

            serializer = OrchestrationTaskSerializer(tasks, many=True)
            data = serializer.data

        if data_type == 'condition_otel_data':
            condition_uuid = request.query_params.get("condition_uuid")
            condition = Condition.objects.get(uuid=condition_uuid)
            event_logs_ids = Event.objects.filter(
                deduped_events__conditions=condition
            ).exclude(apm_log__isnull=True).values_list("apm_log", flat=True)

            event_traces_ids = Event.objects.filter(
                deduped_events__conditions=condition
            ).exclude(apm_trace__isnull=True).values_list("apm_trace", flat=True)

            logs = Log.objects.filter(id__in=event_logs_ids)
            traces = Trace.objects.filter(id__in=event_traces_ids)

            data ={
                "logs": AppLogSerializer(logs, many=True).data,
                "traces": AppTraceSerializer(traces, many=True).data,
                }
            
        if data_type == 'workflows':
            TRIGGER_TYPES = ["Manual Trigger", "AIML Event Trigger"]

            FIELDS = (
                "uuid",
                "w_name",
                "w_description",
                "w_category",
                "w_trigger_type",
                "w_status",
            )

            trigger_node_subquery = WorkflowNode.objects.filter(
                workflow_version=OuterRef("active_version_id"),
                node_type__in=NodeTypes.trigger_nodes()
            ).values("node_type")[:1]

            agentic_wf_qs = (
                AgenticWorkflow.active_objects
                .filter(customer=org)
                .annotate(
                    w_name=F("name"),
                    w_description=F("description"),
                    w_category=Value("Agentic", output_field=CharField()),
                    w_status=Case(
                        When(is_enabled=True, then=Value("Enabled")),
                        default=Value("Disabled"),
                        output_field=CharField(),
                    ),
                    w_trigger_type=Subquery(trigger_node_subquery, output_field=CharField()),
                )
                .filter(w_trigger_type__in=TRIGGER_TYPES)
                .values(*FIELDS) 
            )

            workflows_qs = (
                Workflow.objects
                .filter(status=0, customer=org,  target_type__in=TRIGGER_TYPES)
                .annotate(
                    w_name=F("workflow_name"),
                    w_description=F("description"),
                    w_category=F("category"),
                    w_status=F("workflow_status"),
                    w_trigger_type=F("target_type")
                )
                .values(*FIELDS)  
            )

            workflows = agentic_wf_qs.union(workflows_qs)
            data = CustomWorkflowSerializer(workflows, many=True).data


        if data_type == "summary":
            METRIC_MAP = {
                "throughput": ["Throughput"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "error_rate": ["Error Rate"],
                "cpu_usage": ["CPU Usage (Avg)"],
                "availability": ["Availability"],
                "duration": ["duration"],
                "health_count": ["health_count"],
                "total_queries": ["Total Queries"],
            }
            to_dt = datetime.now(pytz.UTC)
            from_dt = to_dt - timedelta(days=30)

            result = get_apm_metrics_data(
                app_id=parent_app.id,
                key='availability',
                node_type="componenets",
                from_dt=from_dt,
                to_dt=to_dt,
                user=request.user,
                METRIC_MAP=METRIC_MAP
            )

            data =result

        if data_type == "component_summary":
            # Component summary: throughput, response_time, duration
            METRIC_MAP = {
                "throughput": ["Throughput"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "duration": ["duration"],
            }
            
            summary_data = {}
            
            # Get each metric for component summary
            for metric_key, metric_aliases in METRIC_MAP.iteritems():
                result = get_apm_metrics_data(
                    app_id=app_id,
                    key=metric_key,
                    node_type="component",
                    from_dt=from_dt,
                    to_dt=to_dt,
                    user=request.user,
                    METRIC_MAP={metric_key: metric_aliases}
                )
                
                if "data" in result:
                    summary_data[metric_key] = result["data"]
            
            data = summary_data
    
        if data_type == "application_summary":
            # Application summary: throughput, response_time, availability
            METRIC_MAP = {
                "throughput": ["Throughput"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "availability": ["Availability"],
            }
            
            summary_data = {}
            
            for metric_key, metric_aliases in METRIC_MAP.iteritems():
                result = get_apm_metrics_data(
                    app_id=app_id,
                    key=metric_key,
                    node_type="application",
                    from_dt=from_dt,
                    to_dt=to_dt,
                    user=request.user,
                    METRIC_MAP={metric_key: metric_aliases}
                )
                
                if "data" in result:
                    summary_data[metric_key] = result["data"]
            
            data = summary_data
        
        if data_type == "service_summary":
            # Service summary: throughput, response_time, availability
            METRIC_MAP = {
                "throughput": ["Throughput"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "availability": ["Availability"],
            }
            
            summary_data = {}
            
            for metric_key, metric_aliases in METRIC_MAP.iteritems():
                result = get_apm_metrics_data(
                    app_id=app_id,
                    key=metric_key,
                    node_type="service",
                    from_dt=from_dt,
                    to_dt=to_dt,
                    user=request.user,
                    METRIC_MAP={metric_key: metric_aliases}
                )
                
                if "data" in result:
                    summary_data[metric_key] = result["data"]
            
            data = summary_data
        
        if data_type == "process_summary":
            # Process summary: throughput, response_time, availability
            METRIC_MAP = {
                "throughput": ["Throughput"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "availability": ["Availability"],
            }
            
            summary_data = {}
            
            for metric_key, metric_aliases in METRIC_MAP.iteritems():
                result = get_apm_metrics_data(
                    app_id=app_id,
                    key=metric_key,
                    node_type="process",
                    from_dt=from_dt,
                    to_dt=to_dt,
                    user=request.user,
                    METRIC_MAP={metric_key: metric_aliases}
                )
                
                if "data" in result:
                    summary_data[metric_key] = result["data"]
            
            data = summary_data
        
        if data_type == "database_summary":
            # Database summary: availability, response_time, total_queries
            METRIC_MAP = {
                "availability": ["Availability"],
                "response_time": ["P95 Response Time", "Response Time (P95)"],
                "total_queries": ["Total Queries"],
            }
            
            summary_data = {}
            
            for metric_key, metric_aliases in METRIC_MAP.iteritems():
                result = get_apm_metrics_data(
                    app_id=app_id,
                    key=metric_key,
                    node_type="database",
                    from_dt=from_dt,
                    to_dt=to_dt,
                    user=request.user,
                    METRIC_MAP={metric_key: metric_aliases}
                )
                
                if "data" in result:
                    summary_data[metric_key] = result["data"]
            
            data = summary_data
        
        if data_type == 'scripts':
            from orchestration.models import Playbook
            queryset = (
                Playbook.objects
                .filter(status=0)
                .filter(Q(customer=request.user.org) | Q(is_default=True))
                .order_by('-id')[:100] # latest 30 records
            )
            data = PlaybookListSerializer(queryset, many=True).data

        if data_type == 'topology':
            layers = ["service", "component", "process", "database", "host", "physical_layer"]
            if parent_app:
                cache_entries = TopologyCache.objects.filter(app=parent_app, layer__in=layers).order_by('id')
                data = {
                    "app_id": parent_app.id,
                    "app_name": parent_app.name,
                    "layers": {}
                }
                for layer in layers:
                    entry = next((c for c in cache_entries if c.layer == layer), None)
                    if entry:
                        layer_data = entry.data
                        if isinstance(layer_data, dict) and layer in layer_data:
                            layer_data = layer_data[layer]
                        data["layers"][layer] = layer_data
                    else:
                        data["layers"][layer] = None

        if data_type =='impact_topology':
            cache_entry = ImpactAnalysisCache.objects.filter(customer=request.user.org, app=parent_app).first()
            if cache_entry:
                data=cache_entry.data

        if data_type == 'failure_data':
            parent_app = ParentApp.objects.get(id=app_id)
            monitoring_data = MonitoredApp.objects.filter(
                parent_app=parent_app
            )
            if not monitoring_data.exists():
                return Response(
                    {"error": "No monitored apps found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            base_logs_qs = Log.objects.filter(app__in=monitoring_data).filter(
                Q(severity="WARN") | Q(severity="ERROR")).order_by("-id")

            if base_logs_qs.count() > 50:
                last_id = base_logs_qs[50].id
                base_logs_qs = base_logs_qs.filter(id__gte=last_id)

            failure_events = (
                base_logs_qs
                .values("app_id", "message", "app__name", "attributes", "created_at")
                .annotate(count=Count("id"))
                .order_by("-count")
            )

            event_data = [
                {
                    "monitored_app": item["app_id"],
                    "service": item["app__name"],
                    "description": item["message"],
                    "timestamp": item["created_at"],
                    "count": item["count"],
                    # "endpoint": get_endpoint_from_item(item),
                }
                for item in failure_events.iterator()
            ]
            failure_logs = base_logs_qs.order_by("-id")

            logs_data = AppLogSerializer(failure_logs, many=True).data

            data = {
                "events": event_data,
                "logs": logs_data
            }

        if data_type == "infrastructure":
            latest_topology_subq = (
                APMTopology.objects
                .filter(app=OuterRef("pk"))
                .order_by("-created_at")
                .values("pk")[:1]
            )

            topology_ids = (
                monitoring_apps
                .annotate(latest_topology_id=Subquery(latest_topology_subq))
                .filter(latest_topology_id__isnull=False)
                .values_list("latest_topology_id", flat=True)
            )

            cloud_uuids = (
                TopologyNode.objects
                .filter(
                    topology_id__in=topology_ids,
                    node_id="Cloud",
                    uuid__isnull=False,
                )
                .values_list("uuid", flat=True)
                .distinct()
            )

            current_date = datetime.today()
            current_month = current_date.month
            current_year = current_date.year

            data = []

            for uuid in cloud_uuids:
                try:
                    cloud_obj = (
                        PrivateCloudData.objects
                        .select_related("private_cloud")
                        .get(private_cloud__uuid=uuid)
                    )

                    usage_cost = (
                        PrivateCloudDayViceUsage.objects
                        .filter(
                            private_cloud__uuid=uuid,
                            date__year=current_year,
                            date__month=current_month,
                        )
                        .aggregate(total=Sum("usage_cost"))
                        .get("total") or 0.0
                    )

                    cloud_data = cloud_obj.data
                    cloud_data["month_to_date_cost"] = usage_cost

                    data.append({
                        "uuid": cloud_obj.private_cloud.uuid,
                        "name": cloud_obj.private_cloud.name,
                        "data": cloud_data,
                    })

                except PrivateCloudData.DoesNotExist:
                    continue

        return Response(data, status=status.HTTP_200_OK)



from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import APMOnboarding
from .serializers import APMOnboardingSerializer
from unity_discovery.models import DiscoveryCredential

# class APMOnboardingViewSet(viewsets.ModelViewSet):
#     queryset = APMOnboarding.objects.all()
#     serializer_class = APMOnboardingSerializer
#     authentication_classes = (SessionAuthentication, TokenAuthentication)
#     permission_classes = (IsAuthenticated,)


#     RUNTIME_TASK_MAP = {
#         "java": "Otel_Instrumentation_Setup_Java",
#         # future:
#         # "dotnet": "Otel_Instrumentation_Setup_Dotnet",
#         # "php": "Otel_Instrumentation_Setup_PHP",
#     }

#     def get_orchestration_base_url(self):
#         return "%s://%s/rest/orchestration/tasks/" % (
#             self.request.scheme,
#             self.request.get_host()
#         )

#     def get_queryset(self):
#         queryset = super(APMOnboardingViewSet, self).get_queryset()

#         application_name = self.request.query_params.get("application_name")
#         if application_name:
#             queryset = queryset.filter(application_name__icontains=application_name)

#         service_name = self.request.query_params.get("service_name")
#         if service_name:
#             queryset = queryset.filter(service_name__icontains=service_name)

#         language = self.request.query_params.get("language")
#         if language:
#             queryset = queryset.filter(language__iexact=language)

#         status_value = self.request.query_params.get("status")
#         if status_value:
#             queryset = queryset.filter(status=status_value)

#         return queryset

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)

#         self.perform_create(serializer)
#         instance = serializer.instance

#         onboarding_data = serializer.data
#         orchestration_results = []

#         runtimes = onboarding_data.get("runtime") or []

#         for runtime in runtimes:
#             runtime = str(runtime).lower()

#             task_name = self.RUNTIME_TASK_MAP.get(runtime)

#             if not task_name:
#                 orchestration_results.append({
#                     "runtime": runtime,
#                     "status": "skipped",
#                     "reason": "No orchestration task mapped"
#                 })
#                 continue

#             try:
#                 task_uuid = self.get_task_uuid_by_name(task_name, request)
#                 import pdb;pdb.set_trace()  
#             except Exception as e:
#                 orchestration_results.append({
#                     "runtime": runtime,
#                     "status": "failed",
#                     "reason": "Failed to fetch task UUID",
#                     "error": str(e)
#                 })
#                 continue

#             if not task_uuid:
#                 orchestration_results.append({
#                     "runtime": runtime,
#                     "status": "failed",
#                     "reason": "Task not found: %s" % task_name
#                 })
#                 continue

#             payload = self.build_orchestration_payload(runtime, instance)

#             try:
#                 execute_response = self.execute_task(task_uuid, payload, request)
#                 orchestration_results.append({
#                     "runtime": runtime,
#                     "status": "submitted",
#                     "task_name": task_name,
#                     "task_uuid": task_uuid,
#                     "execute_response": execute_response
#                 })
#             except Exception as e:
#                 orchestration_results.append({
#                     "runtime": runtime,
#                     "status": "failed",
#                     "task_name": task_name,
#                     "task_uuid": task_uuid,
#                     "error": str(e)
#                 })

#         response_data = dict(onboarding_data)
#         response_data["orchestration_results"] = orchestration_results

#         headers = self.get_success_headers(serializer.data)
#         return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

#     def get_orchestration_headers(self, request):
#         headers = {
#             "Content-Type": "application/json"
#         }

#         auth_header = request.META.get("HTTP_AUTHORIZATION")
#         if auth_header:
#             headers["Authorization"] = auth_header

#         cookie = request.META.get("HTTP_COOKIE")
#         if cookie:
#             headers["Cookie"] = cookie

#         csrf_token = request.META.get("CSRF_COOKIE")
#         if csrf_token:
#             headers["X-CSRFToken"] = csrf_token

#         return headers

#     def get_task_uuid_by_name(self, task_name, request):
#         url = self.get_orchestration_base_url()
#         headers = self.get_orchestration_headers(request)

#         print("TASK SEARCH URL:", url)
#         print("TASK NAME:", task_name)

#         while url:
#             response = requests.get(url, headers=headers, timeout=30)

#             print("TASK API STATUS:", response.status_code)
#             print("TASK API RESPONSE:", response.text[:500])

#             response.raise_for_status()
#             data = response.json()
#             for task in data.get("results", []):
#                 if task.get("name") == task_name:
#                     print("FOUND TASK UUID:", task.get("uuid"))
#                     return task.get("uuid")

#             url = data.get("next")

#         print("TASK NOT FOUND:", task_name)
#         return None
        

#     def execute_task(self, task_uuid, payload, request):
#         url = "%s%s/execute/" % (
#             self.get_orchestration_base_url(),
#             task_uuid
#         )

#         headers = self.get_orchestration_headers(request)

#         print("EXECUTE URL:", url)
#         print("EXECUTE PAYLOAD:", payload)
#         task_detail = requests.get(
#         "%s%s/" % (
#             self.get_orchestration_base_url(),
#             task_uuid
#         ),
#         headers=headers
#         ).json()

#         task_params = set([
#             x["param_name"]
#             for x in task_detail.get("inputs", [])
#         ])

#         payload_params = set([
#             x["param_name"]
#             for x in payload.get("inputs", [])
#         ])

#         print("TASK PARAM COUNT:", len(task_params))
#         print("PAYLOAD PARAM COUNT:", len(payload_params))

#         print("MISSING PARAMS:")
#         print(task_params - payload_params)

#         print("EXTRA PARAMS:")
#         print(payload_params - task_params)

#         # Empty values check
#         for item in payload.get("inputs", []):
#             if item.get("default_value") in [None, ""]:
#                 print("EMPTY PARAM:", item.get("param_name"))

#         response = requests.post(
#             url,
#             json=payload,
#             headers=headers,
#             timeout=60
#         )

#         print("EXECUTE STATUS:", response.status_code)
#         print("EXECUTE RESPONSE:", response.text)

#         try:
#             response_body = response.json()
#         except Exception:
#             response_body = response.text

#         return {
#             "status_code": response.status_code,
#             "response": response_body
#         }

#     def build_orchestration_payload(self, runtime, instance):
#         if runtime != "java":
#             raise Exception("Unsupported runtime: %s" % runtime)

#         cred_obj = DiscoveryCredential.objects.get(pk=instance.credentials_id)
#         credential_uuid = str(cred_obj.uuid)
#         target = {
#             "uuid": "08b9b43c-bb8a-48eb-955a-92d3ecae1b52",
#             "ctype_id": 325,
#             "device_type": "vmware",
#             "name": "alpha-collector-MTPdemo1_New01",
#             "device_type": "vmware",
#             "ip_address": "10.192.25.24"
#         }

#         return {
#             "cred": "local",
#             "credentials": credential_uuid,
#             "targets": [target],
#             "inputs": [
#                 self.input_param("project_path", instance.project_dir),
#                 self.input_param("compose_file", "{{ project_path }}/docker-compose.yml"),
#                 self.input_param("compose_override_file", "{{ project_path }}/docker-compose.otel.yml"),
#                 self.input_param("env_file", "{{ project_path }}/.env"),
#                 self.input_param("environment_format", "dict"),
#                 self.input_param("runtime", "java"),
#                 self.input_param("target_services", instance.service_name),
#                 self.input_param("java_agent_dir", instance.java_agent_dir),
#                 self.input_param("java_agent_path", "{{ java_agent_dir }}/opentelemetry-javaagent.jar"),
#                 self.input_param("java_logging_dir", "{{ java_agent_dir }}/java-logging"),
#                 self.input_param("slf4j_version", "2.0.13"),
#                 self.input_param("logback_version", "1.5.16"),
#                 self.input_param("java_tools_option_detials", instance.java_tool_option),
#                 self.input_param("device_name", getattr(instance.device, "name", str(instance.device_id))),
#                 self.input_param("device_ip", instance.host),
#                 self.input_param("device_type", "vmware"),
#                 self.input_param("application_name", instance.application_name),
#                 self.input_param("otel_endpoint", "http://10.192.18.31:4317"),
#                 self.input_param("otel_protocol", "grpc"),
#                 self.input_param("OTEL_EXPORTER_OTLP_ENDPOINT", "{{ otel_endpoint }}"),
#                 self.input_param("OTEL_EXPORTER_OTLP_PROTOCOL", "{{ otel_protocol }}"),
#                 self.input_param("OTEL_EXPORTER_OTLP_INSECURE", "true"),
#                 self.input_param("OTEL_LOGS_EXPORTER", "otlp"),
#                 self.input_param("OTEL_TRACES_EXPORTER", "otlp"),
#                 self.input_param("OTEL_METRICS_EXPORTER", "otlp"),
#                 self.input_param("OTEL_LOG_LEVEL", "DEBUG"),
#                 self.input_param("OTEL_JAVA_AGENT_VERSION", "2.25.0"),
#                 self.input_param(
#                     "OTEL_RESOURCE_ATTRIBUTES",
#                     "device.name={{ device_name }},device.ip={{ device_ip }},device.type={{ device_type }},application.name={{ application_name }}"
#                 ),
#                 self.input_param("runtime_envs", "{\"java\":{\"OTEL_JAVAAGENT_ENABLED\":\"true\",\"OTEL_INSTRUMENTATION_KAFKA_EXPERIMENTAL_SPAN_ATTRIBUTES\":\"true\",\"JAVA_TOOL_OPTIONS\":\"{{ java_tools_option_detials }}\",\"OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED\":\"true\"}}", "Dictionary"),
#                 self.input_param("missing_java_logging_files", "{{\n  java_logging_files.results\n  | selectattr('stat.exists', 'equalto', false)\n  | list\n}}"),
#                 self.input_param("compose_data", "{{ compose_raw.content | b64decode | from_yaml }}"),
#                 self.input_param("existing_override", "{\"services\":{}}", "Dictionary"),
#                 self.input_param("override_services", "{{\n  override_services | combine(\n    {\n      item.key: {\n        'volumes': (\n          override_services.get(item.key, {}).get('volumes', [])\n          + [java_agent_path ~ ':/otel/opentelemetry-javaagent.jar:ro']\n          + [java_logging_dir ~ ':/otel/java-logging:ro']\n        ) | unique | list\n      }\n    },\n    recursive=True\n  )\n}}"),
#                 self.input_param("selected_services", "{{\n  (\n    compose_data.services.keys() | list\n  ) | difference(excluded_services)\n  if target_services == \"\"\n  else target_services.split(',')\n}}"),
#                 self.input_param("common_env", "{\"OTEL_EXPORTER_OTLP_INSECURE\":\"{{ OTEL_EXPORTER_OTLP_INSECURE }}\",\"OTEL_LOG_LEVEL\":\"{{ OTEL_LOG_LEVEL }}\",\"OTEL_TRACES_EXPORTER\":\"{{ OTEL_TRACES_EXPORTER }}\",\"OTEL_EXPORTER_OTLP_ENDPOINT\":\"{{ OTEL_EXPORTER_OTLP_ENDPOINT }}\",\"OTEL_METRICS_EXPORTER\":\"{{ OTEL_METRICS_EXPORTER }}\",\"OTEL_EXPORTER_OTLP_PROTOCOL\":\"{{ OTEL_EXPORTER_OTLP_PROTOCOL }}\",\"OTEL_LOGS_EXPORTER\":\"{{ OTEL_LOGS_EXPORTER }}\",\"OTEL_RESOURCE_ATTRIBUTES\":\"{{ OTEL_RESOURCE_ATTRIBUTES }}\"}", "Dictionary"),
#                 self.input_param("override_services_final", "{{ override_services }}"),
#                 self.input_param("java_logging_files", instance.java_agent_dir),
#                 self.input_param("compose_raw", instance.java_agent_dir),
#                 self.input_param("existing_override_raw", instance.java_agent_dir),
#                 self.input_param("(\n    compose_data", instance.java_agent_dir),
#             ]
#         }

#     def input_param(self, name, value, param_type="String"):
#         if value is None:
#             value = ""

#         return {
#             "param_name": name,
#             "param_type": param_type,
#             "default_value": str(value),
#             "attribute": "",
#             "template": "",
#             "template_name": ""
#         }

class APMOnboardingViewSet(viewsets.ModelViewSet):
    queryset = APMOnboarding.objects.all()
    serializer_class = APMOnboardingSerializer
    authentication_classes = (SessionAuthentication, TokenAuthentication)
    permission_classes = (IsAuthenticated,)

    RUNTIME_TASK_MAP = {
        "java": "Otel_Instrumentation_Setup_Java",
        "python": "Otel_Instrumentation_Setup_Python",
        "php": "Otel_Instrumentation_Setup_PHP",
        "cpp": "Otel_Instrumentation_Setup_Cpp",
        "dotnet": "Otel_Instrumentation_Setup_Dotnet",
    }

    def get_orchestration_base_url(self):
        return "%s://%s/rest/orchestration/tasks/" % (
            self.request.scheme,
            self.request.get_host()
        )

    def get_queryset(self):
        queryset = super(APMOnboardingViewSet, self).get_queryset()

        application_name = self.request.query_params.get("application_name")
        if application_name:
            queryset = queryset.filter(application_name__icontains=application_name)

        service_name = self.request.query_params.get("service_name")
        if service_name:
            queryset = queryset.filter(service_name__icontains=service_name)

        language = self.request.query_params.get("language")
        if language:
            queryset = queryset.filter(language__iexact=language)

        status_value = self.request.query_params.get("status")
        if status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        self.perform_create(serializer)
        instance = serializer.instance

        onboarding_data = serializer.data
        orchestration_results = self.run_orchestration(onboarding_data, instance, request)

        response_data = dict(onboarding_data)
        response_data["orchestration_results"] = orchestration_results

        headers = self.get_success_headers(serializer.data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        self.perform_update(serializer)
        if getattr(instance, "_prefetched_objects_cache", None):
            instance._prefetched_objects_cache = {}

        onboarding_data = serializer.data
        orchestration_results = self.run_orchestration(onboarding_data, instance, request)

        response_data = dict(onboarding_data)
        response_data["orchestration_results"] = orchestration_results

        return Response(response_data)

    def run_orchestration(self, onboarding_data, instance, request):
        orchestration_results = []

        runtimes = onboarding_data.get("runtime") or []

        for runtime in runtimes:
            runtime = str(runtime).lower()

            task_name = self.RUNTIME_TASK_MAP.get(runtime)

            if not task_name:
                orchestration_results.append({
                    "runtime": runtime,
                    "status": "skipped",
                    "reason": "No orchestration task mapped"
                })
                continue

            try:
                task_uuid = self.get_task_uuid_by_name(task_name, request)
            except Exception as e:
                orchestration_results.append({
                    "runtime": runtime,
                    "status": "failed",
                    "reason": "Failed to fetch task UUID",
                    "error": str(e)
                })
                continue

            if not task_uuid:
                orchestration_results.append({
                    "runtime": runtime,
                    "status": "failed",
                    "reason": "Task not found: %s" % task_name
                })
                continue

            try:
                payload = self.build_orchestration_payload(runtime, instance)
                execute_response = self.execute_task(task_uuid, payload, request)
                execute_succeeded = 200 <= execute_response["status_code"] < 300

                result = {
                    "runtime": runtime,
                    "status": "submitted" if execute_succeeded else "failed",
                    "task_name": task_name,
                    "task_uuid": task_uuid,
                    "execute_response": execute_response,
                }
                if not execute_succeeded:
                    result["error"] = (
                        "Orchestration execute endpoint returned HTTP %s" %
                        execute_response["status_code"]
                    )
                orchestration_results.append(result)

            except Exception as e:
                orchestration_results.append({
                    "runtime": runtime,
                    "status": "failed",
                    "task_name": task_name,
                    "task_uuid": task_uuid,
                    "error": str(e)
                })

        return orchestration_results

    def get_orchestration_headers(self, request):
        headers = {
            "Content-Type": "application/json"
        }

        auth_header = request.META.get("HTTP_AUTHORIZATION")
        if auth_header:
            headers["Authorization"] = auth_header

        cookie = request.META.get("HTTP_COOKIE")
        if cookie:
            headers["Cookie"] = cookie

        csrf_token = request.META.get("CSRF_COOKIE")
        if csrf_token:
            headers["X-CSRFToken"] = csrf_token

        return headers

    def get_task_uuid_by_name(self, task_name, request):
        url = self.get_orchestration_base_url()
        headers = self.get_orchestration_headers(request)

        while url:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()

            data = response.json()

            for task in data.get("results", []):
                if task.get("name") == task_name:
                    return task.get("uuid")

            url = data.get("next")

        return None

    def execute_task(self, task_uuid, payload, request):
        url = "%s%s/execute/" % (
            self.get_orchestration_base_url(),
            task_uuid
        )

        headers = self.get_orchestration_headers(request)

        print("EXECUTE URL:", url)
        print("EXECUTE PAYLOAD:", payload)

        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=60
        )

        print("EXECUTE STATUS:", response.status_code)
        print("EXECUTE RESPONSE:", response.text)

        try:
            response_body = response.json()
        except Exception:
            response_body = response.text

        return {
            "status_code": response.status_code,
            "response": response_body
        }

    def build_orchestration_payload(self, runtime, instance):
        cred_obj = DiscoveryCredential.objects.get(pk=instance.credentials_id)
        credential_uuid = str(cred_obj.uuid)

        target = self.build_target(instance)

        return {
            "cred": "local",
            "credentials": credential_uuid,
            "targets": [target],
            "inputs": self.build_runtime_inputs(runtime, instance)
        }

    def build_target(self, instance):
        device = instance.device
        if not device or not instance.content_type_id:
            raise ValueError("device_id and content_type are required to execute APM onboarding")

        device_uuid = getattr(device, "uuid", None)
        if not device_uuid:
            raise ValueError("The selected device does not have a UUID for orchestration")

        device_name = getattr(device, "name", None) or str(device)
        device_ip = (
            instance.host
            or getattr(device, "management_ip", None)
            or getattr(device, "ip_address", None)
            or getattr(device, "public_ip", None)
            or ""
        )

        return {
            "uuid": str(device_uuid),
            "name": device_name,
            "device_type": instance.content_type.model,
            "ctype_id": instance.content_type_id,
            "ip_address": device_ip,
        }

    def build_runtime_inputs(self, runtime, instance):
        device = instance.device
        project_path = instance.project_dir
        service_name = instance.service_name
        device_name = getattr(device, "name", None) or str(device or instance.device_id)
        device_ip = (
            instance.host
            or getattr(device, "management_ip", None)
            or getattr(device, "ip_address", None)
            or getattr(device, "public_ip", None)
            or ""
        )
        device_type = instance.content_type.model if instance.content_type_id else ""
        application_name = instance.application_name

        inputs = [
            self.input_param("project_path", project_path),
            self.input_param("compose_file", "{{ project_path }}/docker-compose.yml"),
            self.input_param("compose_override_file", "{{ project_path }}/docker-compose.otel.yml"),
            self.input_param("env_file", "{{ project_path }}/.env"),
            self.input_param("environment_format", self.get_environment_format(runtime)),
            self.input_param("runtime", runtime),
            self.input_param("target_services", service_name),
        ]

        if runtime == "java":
            inputs.extend(self.java_inputs(instance))

        if runtime == "python":
            inputs.extend(self.python_inputs())

        if runtime == "php":
            inputs.extend(self.php_inputs())

        if runtime == "cpp":
            inputs.extend(self.cpp_inputs())

        if runtime == "dotnet":
            inputs.extend(self.dotnet_inputs(instance))

        inputs.extend([
            self.input_param("device_name", device_name),
            self.input_param("device_ip", device_ip),
            self.input_param("device_type", device_type),
            self.input_param("application_name", application_name),
            self.input_param("otel_endpoint", "http://10.192.18.31:4317"),
            self.input_param("otel_protocol", "grpc"),
            self.input_param("OTEL_EXPORTER_OTLP_ENDPOINT", "{{ otel_endpoint }}"),
            self.input_param("OTEL_EXPORTER_OTLP_PROTOCOL", "{{ otel_protocol }}"),
            self.input_param("OTEL_EXPORTER_OTLP_INSECURE", "true"),
            self.input_param("OTEL_LOGS_EXPORTER", "otlp"),
            self.input_param("OTEL_TRACES_EXPORTER", "otlp"),
            self.input_param("OTEL_METRICS_EXPORTER", "otlp"),
            self.input_param("OTEL_LOG_LEVEL", "DEBUG"),
            self.input_param(
                "OTEL_RESOURCE_ATTRIBUTES",
                "device.name={{ device_name }},device.ip={{ device_ip }},device.type={{ device_type }},application.name={{ application_name }}"
            ),
            self.input_param("runtime_envs", self.runtime_envs(runtime), "Dictionary"),
            self.input_param(
                "missing_java_logging_files",
                "{{\n"
                "  java_logging_files.results\n"
                "  | selectattr('stat.exists', 'equalto', false)\n"
                "  | list\n"
                "}}"
            ),
            self.input_param("compose_data", "{{ compose_raw.content | b64decode | from_yaml }}"),
            self.input_param("existing_override", {"services": {}}, "Dictionary"),
            self.input_param(
                "override_services",
                "{{\n"
                "  override_services | combine(\n"
                "    {\n"
                "      item.key: {\n"
                "        'volumes': (\n"
                "          override_services.get(item.key, {}).get('volumes', [])\n"
                "          + [java_agent_path ~ ':/otel/opentelemetry-javaagent.jar:ro']\n"
                "          + [java_logging_dir ~ ':/otel/java-logging:ro']\n"
                "        ) | unique | list\n"
                "      }\n"
                "    },\n"
                "    recursive=True\n"
                "  )\n"
                "}}"
            ),
            self.input_param(
                "selected_services",
                "{{\n"
                "  (\n"
                "    compose_data.services.keys() | list\n"
                "  ) | difference(excluded_services)\n"
                "  if target_services == \"\"\n"
                "  else target_services.split(',')\n"
                "}}"
            ),
            self.input_param("common_env", self.common_env(), "Dictionary"),
            self.input_param("override_services_final", "{{ override_services }}"),
            self.input_param("java_logging_files", "test"),
            self.input_param("compose_raw", "test"),
            self.input_param("existing_override_raw", "test"),
            self.input_param("(\n    compose_data", "test"),
        ])

        return inputs

    def java_inputs(self, instance):
        java_agent_dir = instance.java_agent_dir or "{{ project_path }}/otel"
        java_tool_option = instance.java_tool_option or (
            "-XX:-OmitStackTraceInFastThrow "
            "-javaagent:/otel/opentelemetry-javaagent.jar "
            "-Dotel.instrumentation.logback-appender.enabled=true "
            "-Dlogback.configurationFile=/otel/java-logging/logback.xml "
            "-Xbootclasspath/a:/otel/java-logging/slf4j-api-2.0.13.jar:"
            "/otel/java-logging/logback-core-1.5.16.jar:"
            "/otel/java-logging/logback-classic-1.5.16.jar"
        )

        return [
            self.input_param("java_agent_dir", java_agent_dir),
            self.input_param("java_agent_path", "{{ java_agent_dir }}/opentelemetry-javaagent.jar"),
            self.input_param("java_logging_dir", "{{ java_agent_dir }}/java-logging"),
            self.input_param("slf4j_version", "2.0.13"),
            self.input_param("logback_version", "1.5.16"),
            self.input_param("java_tools_option_detials", java_tool_option),
            self.input_param("OTEL_JAVA_AGENT_VERSION", "2.25.0"),
        ]

    def python_inputs(self):
        return [
            self.input_param("python_start_command", "opentelemetry-instrument python app.py"),
        ]

    def php_inputs(self):
        return []

    def cpp_inputs(self):
        return []

    def dotnet_inputs(self, instance):
        dotnet_runtime_dir = instance.dotnet_runtime_dir
        return [
            self.input_param("dotnet_zip", "{{ project_path }}/opentelemetry-dotnet-instrumentation-linux-glibc-x64.zip"),
            self.input_param("dotnet_otel_dir", dotnet_runtime_dir),
        ]

    def get_environment_format(self, runtime):
        if runtime == "python":
            return "list"
        return "dict"

    def runtime_envs(self, runtime):
        env_map = {
            "java": {
                "java": {
                    "OTEL_JAVAAGENT_ENABLED": "true",
                    "OTEL_INSTRUMENTATION_KAFKA_EXPERIMENTAL_SPAN_ATTRIBUTES": "true",
                    "JAVA_TOOL_OPTIONS": "{{ java_tools_option_detials }}",
                    "OTEL_INSTRUMENTATION_COMMON_DEFAULT_ENABLED": "true"
                }
            },
            "python": {
                "python": {
                    "OTEL_PYTHON_LOG_CORRELATION": "true",
                    "PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION": "python",
                    "OTEL_PYTHON_START_COMMAND": "{{ python_start_command }}",
                    "OTEL_PYTHON_LOGGING_AUTO_INSTRUMENTATION_ENABLED": "true"
                }
            },
            "php": {
                "php": {
                    "OTEL_PHP_AUTOLOAD_ENABLED": "true",
                    "OTEL_PHP_TRACES_ENABLED": "true",
                    "OTEL_PHP_METRICS_ENABLED": "true",
                    "OTEL_PHP_LOGS_ENABLED": "true",
                    "OTEL_PHP_INTERNAL_METRICS_ENABLED": "true",
                    "OTEL_PHP_LOG_LEVEL": "DEBUG",
                    "OTEL_EXPORTER_OTLP_PROTOCOL": "http/protobuf",
                    "OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE": "CUMULATIVE",
                    "OTEL_BLP_SCHEDULE_DELAY": "10000",
                    "OTEL_EXPORTER_OTLP_TIMEOUT": "5000",
                    "OTEL_BSP_MAX_QUEUE_SIZE": "500",
                    "OTEL_BSP_SCHEDULE_DELAY": "10000",
                    "OTEL_BSP_EXPORT_TIMEOUT": "10000",
                    "OTEL_BSP_MAX_EXPORT_BATCH_SIZE": "100",
                    "OTEL_PHP_TRACES_PROCESSOR": "batch",
                    "OTEL_PHP_LOGS_PROCESSOR": "batch",
                    "OTEL_TRACES_SAMPLER": "parentbased_traceidratio",
                    "OTEL_TRACES_SAMPLER_ARG": "0.1",
                    "OTEL_PHP_LOG_DESTINATION": "errorlog"
                }
            },
            "cpp": {
                "cpp": {
                    "OTEL_CPP_LOG_LEVEL": "debug",
                    "OTEL_CPP_DISABLE_METRICS": "false"
                }
            },
            "dotnet": {
                "dotnet": {
                    "OTEL_DOTNET_AUTO_LOGS_ENABLED": "true",
                    "OTEL_DOTNET_AUTO_LOGS_INCLUDE_FORMATTED_MESSAGE": "true",
                    "OTEL_DOTNET_AUTO_ENABLED": "true",
                    "OTEL_DOTNET_AUTO_TRACES_ENABLED": "true",
                    "OTEL_DOTNET_AUTO_METRICS_ENABLED": "true",
                    "OTEL_DOTNET_AUTO_HOME": "/otel",
                    "CORECLR_ENABLE_PROFILING": "1",
                    "CORECLR_PROFILER": "{918728DD-259F-4A6A-AC2B-B85E1B658318}",
                    "CORECLR_PROFILER_PATH": "/otel/linux-x64/OpenTelemetry.AutoInstrumentation.Native.so",
                    "DOTNET_STARTUP_HOOKS": "/otel/net/OpenTelemetry.AutoInstrumentation.StartupHook.dll"
                }
            }
        }

        return env_map.get(runtime, {})

    def common_env(self):
        return {
            "OTEL_EXPORTER_OTLP_INSECURE": "{{ OTEL_EXPORTER_OTLP_INSECURE }}",
            "OTEL_LOG_LEVEL": "{{ OTEL_LOG_LEVEL }}",
            "OTEL_TRACES_EXPORTER": "{{ OTEL_TRACES_EXPORTER }}",
            "OTEL_EXPORTER_OTLP_ENDPOINT": "{{ OTEL_EXPORTER_OTLP_ENDPOINT }}",
            "OTEL_METRICS_EXPORTER": "{{ OTEL_METRICS_EXPORTER }}",
            "OTEL_EXPORTER_OTLP_PROTOCOL": "{{ OTEL_EXPORTER_OTLP_PROTOCOL }}",
            "OTEL_LOGS_EXPORTER": "{{ OTEL_LOGS_EXPORTER }}",
            "OTEL_RESOURCE_ATTRIBUTES": "{{ OTEL_RESOURCE_ATTRIBUTES }}"
        }

    def input_param(self, name, value, param_type="String"):
        if value is None:
            value = ""

        if param_type == "Dictionary" and isinstance(value, (dict, list)):
            default_value = value
        else:
            default_value = str(value)

        return {
            "param_name": name,
            "param_type": param_type,
            "default_value": default_value,
            "attribute": "",
            "template": "",
            "template_name": ""
        }
