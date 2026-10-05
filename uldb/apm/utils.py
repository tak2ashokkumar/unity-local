
import uuid
import json
from django.contrib.contenttypes.models import ContentType
from pyasn1_modules.rfc2985 import contentType
from aiops.models import Event
from app.common.utils import Device
from app.inventory.models import BMServer
from app.organization.models import Organization
from .models import MonitoredApp, Trace, Metric, ParentApp, APMTopology
from django.utils import timezone
from datetime import datetime, timedelta
from collections import defaultdict, OrderedDict
import pytz
from uuid import uuid4, UUID
import re
import openpyxl
import calendar
import logging
from django.contrib.auth import get_user_model
from constants import SEVERITY_MAPPING, STATUS_MAPPING
import time
import threading
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed
from functools import wraps
import os

from django.core.cache import cache

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
LOKI_BASE_URL = os.getenv("LOKI_BASE_URL_ENV","")
LOKI_QUERY_RANGE_URL = LOKI_BASE_URL + "/loki/api/v1/query_range"

REQUEST_TIMEOUT = 90
MAX_LOKI_DAYS = 29
MAX_CHUNK_DAYS = 7
COUNT_WINDOW = "5m"
STEP_SECONDS = 300

MAX_RETRIES = 4
RETRY_BACKOFF = 2.0

# Reduced concurrency to avoid rate limiting
MAX_WORKERS_LOKI = 3  # Reduced from 4
MAX_WORKERS_SLOT = 2  # Reduced from 3
MAX_CHUNK_SECONDS = 3600

# Circuit breaker settings - IMPROVED
CIRCUIT_BREAKER_THRESHOLD = 5
CIRCUIT_BREAKER_TIMEOUT = 60
circuit_breaker_state = {
    'failures': 0,
    'last_failure_time': None,
    'is_open': False
}
UTC = pytz.UTC
DATE_FMT = "%Y-%m-%d %H:%M:%S"


def ensure_dt(ts):
    """Ensure datetime is timezone aware UTC."""
    if isinstance(ts, datetime):
        return ts if ts.tzinfo else UTC.localize(ts)
    return UTC.localize(datetime.strptime(ts, DATE_FMT))


def clean_metric_value(value):
    """Convert strings like '23 ms', '480.0 req/min', '0.00%' to float."""
    if value is None:
        return 0.0
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, basestring):
        match = re.search(r"[-+]?\d*\.?\d+", value)
        if match:
            return float(match.group())
    return 0.0


def get_label(created_at, from_dt, grouping):
    """Return label for aggregation."""
    if grouping == "day":
        # Use actual weekday names
        return created_at.strftime("%a")  # Thu, Fri, Sat, etc.
    elif grouping == "week":
        diff_days = (created_at.date() - from_dt.date()).days
        return "Week {}".format(diff_days // 7 + 1)
    elif grouping == "month":
        return created_at.strftime("%b")  # Jan, Feb, ...
    else:  # quarter
        quarter = (created_at.month - 1) // 3 + 1
        return "Q{}-{}".format(quarter, created_at.year)


def aggregate(points, grouping, from_dt, to_dt, uai_data=False):
    sums, counts = defaultdict(float), defaultdict(int)
    for p in points:
        ts = ensure_dt(p["created_at"])
        lbl = get_label(ts, from_dt, grouping)
        sums[lbl] += float(p["value"] or 0)
        counts[lbl] += 1

    result = []

    if grouping == "day":
        current = from_dt
        while current <= to_dt:
            lbl = current if uai_data else current.strftime("%a")  # Thu, Fri, Sat ...
            avg = round(sums[lbl] / counts[lbl], 2) if counts[lbl] else 0.0
            result.append({"range": lbl, "average": avg})
            current += timedelta(days=1)
    elif grouping == "week":
        current = from_dt
        week_num = 1
        while current <= to_dt:
            lbl = "Week {}".format(week_num)
            avg = round(sums[lbl] / counts[lbl], 2) if counts[lbl] else 0.0
            result.append({"range": lbl, "average": avg})
            current += timedelta(days=7)
            week_num += 1
    elif grouping == "month":
        current = from_dt
        while current <= to_dt:
            lbl = current.strftime("%b")  # Jan, Feb ...
            avg = round(sums[lbl] / counts[lbl], 2) if counts[lbl] else 0.0
            result.append({"range": lbl, "average": avg})
            # move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1, day=1)
            else:
                current = current.replace(month=current.month + 1, day=1)
    else:  # quarter
        current = from_dt
        while current <= to_dt:
            quarter = (current.month - 1) // 3 + 1
            lbl = "Q{}-{}".format(quarter, current.year)
            avg = round(sums[lbl] / counts[lbl], 2) if counts[lbl] else 0.0
            result.append({"range": lbl, "average": avg})
            # move to next quarter
            month = ((current.month - 1) // 3 + 1) * 3 + 1
            year = current.year
            if month > 12:
                month = 1
                year += 1
            current = current.replace(year=year, month=month, day=1)

    return result

def aggregate_sum(points, grouping, from_dt, to_dt):
    """
    Aggregate points by time period and return **sum** instead of average.
    points: list of {"created_at": datetime, "value": float}
    grouping: 'day', 'week', 'month', 'quarter'
    """
    sums = defaultdict(float)
    for p in points:
        ts = ensure_dt(p["created_at"])
        lbl = get_label(ts, from_dt, grouping)
        sums[lbl] += float(p["value"] or 0)

    result = []

    if grouping == "day":
        current = from_dt
        while current <= to_dt:
            lbl = current.strftime("%a")  # Thu, Fri, Sat ...
            val = round(sums[lbl], 2)
            result.append({"range": lbl, "sum": val})
            current += timedelta(days=1)
    elif grouping == "week":
        current = from_dt
        week_num = 1
        while current <= to_dt:
            lbl = "Week {}".format(week_num)
            val = round(sums[lbl], 2)
            result.append({"range": lbl, "sum": val})
            current += timedelta(days=7)
            week_num += 1
    elif grouping == "month":
        current = from_dt
        while current <= to_dt:
            lbl = current.strftime("%b")
            val = round(sums[lbl], 2)
            result.append({"range": lbl, "sum": val})
            # move to next month
            if current.month == 12:
                current = current.replace(year=current.year + 1, month=1, day=1)
            else:
                current = current.replace(month=current.month + 1, day=1)
    else:  # quarter
        current = from_dt
        while current <= to_dt:
            quarter = (current.month - 1) // 3 + 1
            lbl = "Q{}-{}".format(quarter, current.year)
            val = round(sums[lbl], 2)
            result.append({"range": lbl, "sum": val})
            # move to next quarter
            month = ((current.month - 1) // 3 + 1) * 3 + 1
            year = current.year
            if month > 12:
                month = 1
                year += 1
            current = current.replace(year=year, month=month, day=1)

    return result


def compute_stats(points, grouping, from_dt):
    if not points:
        return 0.0, 0.0, "0@-"

    total = sum(float(p["value"] or 0) for p in points)
    avg = round(total / len(points), 2)

    latest = max(points, key=lambda p: ensure_dt(p["created_at"]))
    current = round(float(latest["value"] or 0), 2)

    peak = max(points, key=lambda p: float(p["value"] or 0))
    peak_ts = ensure_dt(peak["created_at"])
    peak_label = get_label(peak_ts, from_dt, grouping)
    peak_str = "{}@{}".format(round(float(peak["value"] or 0), 2), peak_label)

    return avg, current, peak_str


def get_or_create_monitored_app(service_name, host_ip, device_type, device_name, tenant, app_name):
    customer = Organization.objects.get(name=tenant)
    if not service_name:
        return None
    if device_type in Device.get_device_model(Device.vm):
        DeviceModel = Device.get_device_model(Device.vm)[device_type]
    else:
        DeviceModel = Device.get_device_model(device_type)
    if hasattr(DeviceModel, 'customer'):
        customer_filter = {'customer': customer}
    elif hasattr(DeviceModel, 'cloud'):
        customer_filter = {'cloud__customer': customer}
    else:
        customer_filter = {}
    if isinstance(DeviceModel, BMServer):
        device = DeviceModel.objects.filter(management_ip=host_ip, server__name=device_name, server__customer=customer).first()
    elif hasattr(DeviceModel, 'management_ip'):
        device = DeviceModel.objects.filter(management_ip=host_ip, name=device_name, **customer_filter).first()
    elif hasattr(DeviceModel, 'ip_address'):
        device = DeviceModel.objects.filter(ip_address=host_ip, name=device_name, **customer_filter).first()

    content_type = ContentType.objects.get_for_model(device.__class__)
    parent_app, _ = ParentApp.objects.get_or_create(name=app_name, customer=customer)
    app, created = MonitoredApp.objects.get_or_create(
        customer=customer,
        name=service_name,
        parent_app = parent_app,
        content_type=content_type,
        device_id=device.id,
        defaults={
            'hostname': host_ip,
            'uuid': uuid4()
        }
    )

    # Fetch recent traces (e.g., past 5 minutes)
    recent_window = timezone.now() - timedelta(minutes=5)
    traces = Trace.objects.filter(app=app, start_time__gte=recent_window)

    trace_count = traces.count()
    if trace_count > 0:
        total_latency = sum([t.duration_ms for t in traces])
        avg_latency = total_latency / float(trace_count)
        latency_str = "{}ms".format(int(round(avg_latency)))

        earliest_trace = traces.earliest('start_time')
        latest_trace = traces.latest('start_time')
        timespan_sec = (latest_trace.start_time - earliest_trace.start_time).total_seconds()

        if timespan_sec > 0:
            rps = trace_count / timespan_sec
        else:
            rps = 0

        throughput_str = "{:.2f}rps".format(rps)

        app.latency = latency_str
        app.throughput = throughput_str
        app.save()

    return app

def get_cpu_and_memory_metrics(app_uuid):
    """
    Return CPU and memory utilization series for an app.
    """

    # Ordered metric priorities
    cpu_candidates = [
        "process_cpu_utilization_ratio",            # Python
        "jvm_cpu_recent_utilization_ratio",         # Java
        "go_processor_limit",                       # Go (proxy metric)
        "nodejs_eventloop_utilization_ratio",       # Node.js
        "process_cpu_time_seconds_total",           # Unknown fallback
    ]
    mem_used_candidates = [
        "process_memory_usage_bytes",               # Python
        "jvm_memory_used_bytes",                    # Java
        "go_memory_used_bytes",                     # Go
        "v8js_memory_heap_used_bytes",              # Node.js
        "process_memory_usage_bytes",               # Unknown fallback
    ]
    mem_limit_candidates = [
        "process_memory_limit_bytes",               # Python
        "jvm_memory_limit_bytes",                   # Java
        "jvm_memory_committed_bytes",               # Java alt
        "go_memory_limit_bytes",                    # Go
        "v8js_memory_heap_limit_bytes",             # Node.js
    ]

    # Fetch everything in one go
    all_metric_names = set(cpu_candidates + mem_used_candidates + mem_limit_candidates)
    metrics = Metric.objects.filter(app__uuid=app_uuid,
                                    metric_name__in=all_metric_names) \
                            .order_by('timestamp') \
                            .values('timestamp', 'metric_name', 'value')

    # Group by metric_name
    grouped = defaultdict(list)
    for m in metrics:
        grouped[m['metric_name']].append(m)

    # Pick first non-empty series by priority
    def pick_series(candidates):
        for name in candidates:
            if grouped.get(name):
                return grouped[name]
        return []

    cpu_qs = pick_series(cpu_candidates)
    mem_used_qs = pick_series(mem_used_candidates)
    mem_limit_qs = pick_series(mem_limit_candidates)

    # ---------- Build CPU series ----------
    cpu_series = []
    for row in cpu_qs:
        val = row['value']
        percent = round(float(val) * 100.0, 2) if val is not None else 0.0
        cpu_series.append({'timestamp': row['timestamp'], 'value': percent})

    # ---------- Build Memory series ----------
    limit_map = {row['timestamp']: row['value'] for row in mem_limit_qs}
    mem_series = []
    for row in mem_used_qs:
        used = row['value']
        limit = limit_map.get(row['timestamp'])
        percent = 0.0
        if used is not None and limit not in (None, 0):
            percent = round(float(used) / float(limit) * 100.0, 2)
        mem_series.append({'timestamp': row['timestamp'], 'value': percent})

    return {'cpu': cpu_series, 'memory': mem_series}

def extract_status_code(message):
    """
    Extracts status code (3-digit) from a variety of log formats.
    Returns an integer or None.
    """
    patterns = [
        r'Response:\s*(\d{3})',              # Matches: "Login Response: 401"
        r'\"\s*(\d{3})\s*-'                  # Matches: ... "GET ..." 401 -
    ]
    for pattern in patterns:
        match = re.search(pattern, message)
        if match:
            return int(match.group(1))
    return None


def find_connected_nodes(topology_data, query_uuid):
    query_uuid_str = str(query_uuid) if hasattr(query_uuid, 'hex') else query_uuid

    nodes = topology_data['nodes']
    links = topology_data['links']

    node_dict = {}
    layer_priority = {
        'application': 1,
        'service': 2,
        'component': 3,
        'process': 4,
        'database': 5,
        'host/infrastructure': 6,
        'Cloud': 7,
        'Data Center': 8,
    }
    
    for node in nodes:
        node_uuid = str(node['uuid']) if hasattr(node['uuid'], 'hex') else node['uuid']
        node_dict[node_uuid] = node

    query_node = node_dict.get(query_uuid_str)
    if not query_node:
        return {"nodes": [], "links": []}
    
    query_layer = query_node.get('layer', '').lower()
    
    skip_layers = []
    if query_layer == 'component':
        skip_layers = ['application', 'service']
    elif query_layer == 'process':
        skip_layers = ['application', 'service', 'component']
    elif query_layer == 'host/infrastructure':
        skip_layers = ['application', 'service', 'component', 'process']
    elif query_layer == 'Cloud':
        skip_layers = ['application', 'service', 'component', 'process', 'host/infrastructure']
    elif query_layer == 'service':
        skip_layers = ['application']
    elif query_layer == 'database':
        skip_layers = ['application', 'service', 'component', 'process']

    connected_nodes = set()
    connected_links = []

    queue = [query_uuid_str]
    connected_nodes.add(query_uuid_str)

    while queue:
        current_uuid = queue.pop(0)

        for link in links:
            source = str(link['source_uuid']) if hasattr(link['source_uuid'], 'hex') else link['source_uuid']
            target = str(link['target_uuid']) if hasattr(link['target_uuid'], 'hex') else link['target_uuid']

            if source == current_uuid and target in node_dict:
                if target not in connected_nodes:
                    connected_nodes.add(target)
                    queue.append(target)
                connected_links.append(link)
            elif target == current_uuid and source in node_dict:
                if source not in connected_nodes:
                    connected_nodes.add(source)
                    queue.append(source)
                connected_links.append(link)

    result_nodes = []
    for uuid in connected_nodes:
        if uuid in node_dict:
            node = node_dict[uuid]
            node_layer = node.get('layer', '').lower()
            
            if node_layer not in skip_layers:
                result_nodes.append(node)

    return {
        "nodes": result_nodes,
        "links": connected_links
    }


def merge_topology_data(app_layer_data):
    """Merge topology nodes and links into a unique list for a single app layer."""
    unique_nodes = {}
    unique_links = set()
    
    # First pass: collect all nodes and track latest status by service identity
    service_status = {}  # key: (name, layer, language, icon) -> (status, metadata_status, node_data)
    
    for entry in app_layer_data:
        for node in entry.get("nodes", []):
            uuid = node.get("uuid")
            
            # Create a service identity key using name, layer, and other identifying fields
            service_key = (
                node.get("name"),
                node.get("layer"),
                node.get("metadata", {}).get("language"),
                node.get("icon")
            )
            
            # Store the node with its UUID, but track status by service identity
            if uuid:
                unique_nodes[uuid] = node
                
                # Update service status tracking
                if service_key not in service_status:
                    service_status[service_key] = {
                        "status": node.get("status"),
                        "metadata_status": node.get("metadata", {}).get("Status"),
                        "latest_uuid": uuid,
                        "node_data": node
                    }
                else:
                    # This is a later occurrence, update status
                    service_status[service_key]["status"] = node.get("status")
                    service_status[service_key]["metadata_status"] = node.get("metadata", {}).get("Status")
                    service_status[service_key]["latest_uuid"] = uuid
                    service_status[service_key]["node_data"] = node

        for link in entry.get("links", []):
            key = (link.get("source_uuid"), link.get("target_uuid"), link.get("type"), link.get("edge_id"))
            unique_links.add(key)
    
    # Second pass: update all nodes with the latest status for their service
    for uuid, node in unique_nodes.items():
        service_key = (
            node.get("name"),
            node.get("layer"),
            node.get("metadata", {}).get("language"),
            node.get("icon")
        )
        
        if service_key in service_status:
            latest_status = service_status[service_key]["status"]
            latest_metadata_status = service_status[service_key]["metadata_status"]
            
            # Update the node's status
            node["status"] = latest_status
            
            # Update the metadata Status
            if "metadata" in node:
                node["metadata"]["Status"] = latest_metadata_status

    merged_links = [
        {"source_uuid": s, "target_uuid": t, "type": typ, "edge_id": eid}
        for (s, t, typ, eid) in unique_links
    ]

    return {"nodes": list(unique_nodes.values()), "links": merged_links}


def merge_across_apps(result, layer):
    """Merge nodes and links across apps with uuid deduplication first, then name deduplication."""

    global_nodes = {}
    global_links = set()

    # Step 1: Deduplicate by uuid
    for app in result:
        nodes = app[layer]["nodes"]
        links = app[layer]["links"]

        for node in nodes:
            uuid = node.get("uuid")
            if uuid and uuid not in global_nodes:
                global_nodes[uuid] = node

        for link in links:
            key = (link.get("source_uuid"), link.get("target_uuid"),
                   link.get("type"), link.get("edge_id"))
            global_links.add(key)

    # Step 2: Deduplicate by name (merge uuids that share same name)
    name_to_uuid = {}
    uuid_replacements = {}

    for uuid, node in list(global_nodes.items()):
        name = node.get("name")
        if name:
            if name not in name_to_uuid:
                name_to_uuid[name] = uuid  # first occurrence kept
            else:
                # Duplicate by name -> merge
                primary_uuid = name_to_uuid[name]
                uuid_replacements[uuid] = primary_uuid
                # remove duplicate node
                del global_nodes[uuid]

    # Step 3: Fix links to point to the primary uuid
    updated_links = set()
    for (s, t, typ, eid) in global_links:
        new_s = uuid_replacements.get(s, s)
        new_t = uuid_replacements.get(t, t)
        updated_links.add((new_s, new_t, typ, eid))

    merged_nodes = list(global_nodes.values())
    merged_links = [
        {"source_uuid": s, "target_uuid": t, "type": typ, "edge_id": eid}
        for (s, t, typ, eid) in updated_links
    ]
    return {
        layer: {
            "nodes": merged_nodes,
            "links": merged_links,
            "status_summary": get_status_summary(merged_nodes)
        }
    }


def get_status_summary(nodes):
    """Return active/inactive/unknown counts."""
    return {
        "active": sum(1 for n in nodes if n.get("status") == 1),
        "inactive": sum(1 for n in nodes if n.get("status") == 0),
        "unknown": sum(
            1 for n in nodes
            if n.get("status") == -1 or n.get("status") is None
        ),
    }


def build_topology_data(request, only_summary=False):
    """
    Shared logic to build topology data for apps.
    Set only_summary=True to skip including link data.
    """
    # Get multiple app_ids
    app_ids = request.GET.getlist('app_id')  # Handles ?app_id=1&app_id=2&app_id=3
    if not app_ids:
        app_id_param = request.GET.get('app_id')
        if app_id_param:
            app_ids = app_id_param.split(',')  # Handles ?app_id=1,2,3

    layer = request.GET.get('layer', 'service')
    result = []

    # Get apps for this customer
    apps_qs = ParentApp.objects.filter(monitoredapp__customer=request.user.org).distinct()
    if app_ids:
        apps_qs = apps_qs.filter(id__in=app_ids)

    for app in apps_qs:
        app_data = {"app_name": app.name, layer: []}

        monitored_apps = MonitoredApp.objects.filter(parent_app=app)
        for monitored in monitored_apps:
            latest_topology = APMTopology.objects.filter(app=monitored).last()
            if not latest_topology or not latest_topology.topology_data:
                continue
            from .serializers import APMTopologySerializer
            serializer = APMTopologySerializer(latest_topology, context={"request": request})
            topology_data = serializer.data.get("topology_data", None)
            if not topology_data:
                continue

            nodes = topology_data.get("nodes", [])
            links = topology_data.get("links", [])

            # Layer mapping
            include_layers = {
                "service": ("application", "service"),
                "component": ("service", "component"),
                "process": ("component", "process"),
                "database": ("process", "database"),
                "host": ("host/infrastructure",),
                "physical_layer": ("Cloud", "Data Center"),
            }.get(layer, ("application", "service"))

            # Filter nodes and links
            filtered_nodes = [
                {
                    "name": n.get("name"),
                    "uuid": n.get("uuid"),
                    "status": n.get("status"),
                    "icon": n.get("icon"),
                    "layer": n.get("layer"),
                    "type": n.get("type"),
                    "metadata": n.get("metadata", {}),
                    "monitored_id": monitored.uuid,
                    "device_type": n.get("device_type"),
                }
                for n in nodes if n.get("layer") in include_layers
            ]
            filtered_links = []
            if not only_summary:
                filtered_uuids = {n["uuid"] for n in filtered_nodes}
                filtered_links = [
                    {
                        "source_uuid": l.get("source_uuid"),
                        "target_uuid": l.get("target_uuid"),
                        "type": l.get("type"),
                        "edge_id": l.get("edge_id")
                    }
                    for l in links
                    if l.get("source_uuid") in filtered_uuids and l.get("target_uuid") in filtered_uuids
                ]

            app_data[layer].append({"nodes": filtered_nodes, "links": filtered_links})

        if app_data[layer]:
            app_data[layer] = merge_topology_data(app_data[layer])

        result.append(app_data)

    if not result:
        return {}, layer

    merged = merge_across_apps(result, layer)
    return merged, layer


def serialize_uuids(obj):
    if isinstance(obj, uuid.UUID):
        return str(obj)
    elif isinstance(obj, dict):
        return {k: serialize_uuids(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [serialize_uuids(v) for v in obj]
    return obj




def filter_topology(topology_data, valid_hierarchy=None):
    if not valid_hierarchy:
        valid_hierarchy = ["application", "service", "component", "process", "database"]

    nodes = topology_data.get("nodes", [])
    links = topology_data.get("links", [])

    # Filter nodes to only include those in valid hierarchy
    filtered_nodes = [n for n in nodes if n.get("layer") in valid_hierarchy]
    filtered_node_uuids = {n["uuid"] for n in filtered_nodes}

    # Filter links to only include connections between valid nodes
    filtered_links = []
    for link in links:
        src = link.get("source") or link.get("source_uuid")
        tgt = link.get("target") or link.get("target_uuid")
        if src in filtered_node_uuids and tgt in filtered_node_uuids:
            filtered_links.append(link)

    topology_data["nodes"] = filtered_nodes
    topology_data["links"] = filtered_links
    return topology_data

def load_excel_sheet(file_path):
    """Load Excel workbook and return active sheet."""
    try:
        wb = openpyxl.load_workbook(file_path, data_only=True)
        return wb.active
    except Exception as e:
        logger.error("Error loading Excel file: %s" % e)
        return None


def get_excel_headers(sheet):
    """Return headers from first row as a list of strings."""
    try:
        return [str(cell.value).strip() for cell in sheet[1]]
    except Exception as e:
        logger.error("Error reading headers: %s" % e)
        return []


def parse_datetime(date_cell, time_cell=None):
    """
    Converts Excel Date and Time cells to Python datetime.
    Handles:
      - Date format like 7/5/2025
      - Time with timezone suffix, e.g., 03:00:00+05:30
      - Missing time cells (defaults to 00:00:00)
    """
    from datetime import datetime, time

    date_value = None

    # Parse date
    if isinstance(date_cell, basestring):
        for fmt in ("%m/%d/%Y", "%d/%m/%Y", "%Y-%m-%d"):
            try:
                date_value = datetime.strptime(date_cell.strip(), fmt)
                break
            except:
                continue
    elif hasattr(date_cell, "year"):
        date_value = date_cell

    if not date_value:
        return None

    # Parse time
    time_value = None
    if time_cell:
        if isinstance(time_cell, basestring):
            time_str = time_cell.split('+')[0].split('-')[0].strip()
            for fmt in ("%H:%M:%S", "%H:%M"):
                try:
                    time_value = datetime.strptime(time_str, fmt).time()
                    break
                except:
                    continue
        elif hasattr(time_cell, "hour"):
            time_value = time_cell

    if not time_value:
        time_value = time(0, 0, 0)  # default midnight

    return datetime.combine(date_value.date(), time_value)


def parse_input_datetime(datetime_str):
    """Convert 'YYYY-MM-DD HH:MM:SS' string to datetime object."""
    try:
        return datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
    except Exception as e:
        logger.error("Invalid datetime format: %s" % e)
        return None


def filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
    """Yield rows that fall within the given datetime range."""
    try:
        date_col = headers.index("Date") + 1
        time_col = headers.index("Time") + 1
    except ValueError:
        logger.error("Missing Date or Time column")
        return

    for row in sheet.iter_rows(min_row=2):
        date_cell = row[date_col - 1].value
        time_cell = row[time_col - 1].value if len(row) >= time_col else None
        record_dt = parse_datetime(date_cell, time_cell)
        if record_dt and from_dt <= record_dt <= to_dt:
            yield row


def get_funnel_data_in_datetime_range(file_path, from_dt_str, to_dt_str):
    """Main public function to calculate sessions, carts, and orders within a datetime range."""
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return {"sessions": 0, "carts": 0, "orders": 0}

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return {"sessions": 0, "carts": 0, "orders": 0}

    headers = get_excel_headers(sheet)
    if not headers:
        return {"sessions": 0, "carts": 0, "orders": 0}

    # Column indices
    try:
        sessions_col = headers.index("sessions") + 1
        carts_col = headers.index("carts") + 1
        orders_col = headers.index("orders") + 1
    except ValueError:
        logger.warning("Required columns missing.")
        return {"sessions": 0, "carts": 0, "orders": 0}

    sum_sessions = 0
    sum_carts = 0
    sum_orders = 0

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        try:
            sum_sessions += float(row[sessions_col - 1].value or 0)
            sum_carts += float(row[carts_col - 1].value or 0)
            sum_orders += float(row[orders_col - 1].value or 0)
        except:
            continue

    return {
        "sessions": int(sum_sessions),
        "carts": int(sum_carts),
        "orders": int(sum_orders)
    }


def get_new_customers_per_month(file_path, from_dt_str, to_dt_str):
    UTC = pytz.UTC
    DATE_FMT = "%Y-%m-%d %H:%M:%S"

    try:
        from_dt = UTC.localize(datetime.strptime(from_dt_str, DATE_FMT))
        to_dt = UTC.localize(datetime.strptime(to_dt_str, DATE_FMT))
        date_difference = (to_dt - from_dt).days
    except Exception as e:
        logger.error("Invalid 'from' or 'to' format. Expected '%s'" % DATE_FMT)
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers or "new_customers" not in headers:
        logger.error("Missing column: 'new_customers'")
        return OrderedDict()

    date_idx = headers.index("Date")
    new_customers_idx = headers.index("new_customers")

    def ensure_dt(ts):
        if isinstance(ts, datetime):
            if ts.tzinfo:
                return ts
            return UTC.localize(ts)
        try:
            return UTC.localize(datetime.strptime(str(ts), "%Y-%m-%d %H:%M:%S"))
        except:
            try:
                return UTC.localize(datetime.strptime(str(ts), "%Y-%m-%d"))
            except:
                return None

    # Determine grouping
    if date_difference <= 7:
        grouping = "day"
    elif date_difference <= 30:
        grouping = "week"
    elif date_difference < 364:
        grouping = "month"
    else:
        grouping = "quarter"

    # ---- Helper: bucket key logic ----
    def bucket_key(ts, grouping):
        if grouping == "day":
            key = ts.date()
            label = ts.strftime("%a")  # Mon, Tue
        elif grouping == "week":
            start_of_week = ts - timedelta(days=ts.weekday())
            week_index = ((start_of_week - from_dt).days // 7) + 1
            key = week_index
            label = "Week {}".format(week_index)
        elif grouping == "month":
            key = (ts.year, ts.month)
            label = ts.strftime("%b")
        else:  # quarter
            quarter = (ts.month - 1) // 3 + 1
            key = (ts.year, quarter)
            label = "Q{}-{}".format(quarter, ts.year)
        return key, label

    # Aggregate
    sums = defaultdict(float)
    labels = {}

    for row in sheet.iter_rows(min_row=2):
        ts_val = ensure_dt(row[date_idx].value)
        if not ts_val or not (from_dt <= ts_val <= to_dt):
            continue
        try:
            new_customers = float(row[new_customers_idx].value or 0)
        except:
            new_customers = 0.0

        key, label = bucket_key(ts_val, grouping)
        sums[key] += new_customers
        labels[key] = label

    # Fill missing time buckets
    all_keys = []
    if grouping == "week":
        total_weeks = ((to_dt - from_dt).days // 7) + 1
        for i in range(1, total_weeks + 1):
            all_keys.append(i)
            if i not in labels:
                labels[i] = "Week {}".format(i)
    else:
        # original day/month/quarter logic
        def iter_period_keys(grouping, start_dt, end_dt):
            current = start_dt
            while current <= end_dt:
                key, label = bucket_key(current, grouping)
                yield key, label
                if grouping == "day":
                    current += timedelta(days=1)
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

        for key, label in iter_period_keys(grouping, from_dt, to_dt):
            all_keys.append(key)
            if key not in labels:
                labels[key] = label

    # Build result
    result = [{"range": labels[k], "total": int(sums.get(k, 0))} for k in all_keys]

    return OrderedDict([
        ("grouping", grouping),
        ("new_customers", result)
    ])


def get_conversion_rate_per_month(file_path, from_dt_str, to_dt_str):
    """
    Returns total (sum) conversion rate per month within the given date range.
    Format: {"Jul-2025": "82.64%", "Aug-2025": "79.52%", ...}
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    try:
        conv_rate_col = headers.index("conversion_rate") + 1
    except ValueError:
        logger.error("Required column missing: 'conversion_rate'")
        return OrderedDict()

    monthly_data = defaultdict(float)

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        rate_val = row[conv_rate_col - 1].value
        if not rate_val:
            continue

        try:
            # Handle text like "6.857%" or numeric value
            val_str = str(rate_val).strip()
            if val_str.endswith("%"):
                val_str = val_str.replace("%", "").strip()

            rate_num = float(val_str)
        except:
            rate_num = 0.0

        month_key = record_dt.strftime("%b-%Y")
        monthly_data[month_key] += rate_num

    result = OrderedDict()
    sorted_months = sorted(monthly_data.keys(),
                           key=lambda x: datetime.strptime(x, "%b-%Y"))

    for month in sorted_months:
        total_rate = monthly_data[month]
        result[month] = "%.3f%%" % total_rate

    return result


def get_returning_customers_categorywise(file_path, from_dt_str, to_dt_str):
    """
    Returns total returning customers per top_category within the given datetime range.
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return {}

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return {}

    headers = get_excel_headers(sheet)
    if not headers:
        return {}

    # Required columns
    try:
        category_col = headers.index("top_category") + 1
        returning_col = headers.index("returning_customers") + 1
    except ValueError:
        logger.error("Required columns missing: 'top_category' or 'returning_customers'")
        return {}

    category_map = {}

    # Iterate through filtered rows
    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        category = row[category_col - 1].value or "Unknown"
        try:
            returning_count = float(row[returning_col - 1].value or 0)
        except:
            returning_count = 0

        # Accumulate category totals
        if category not in category_map:
            category_map[category] = 0
        category_map[category] += returning_count

    # Convert float totals to integers
    for k in category_map.keys():
        category_map[k] = int(category_map[k])

    return category_map



def get_checkout_abandon_rate_by_category(file_path, from_dt_str, to_dt_str):
    """
    Returns a dict with top_category as key and average checkout_abandon_rate as a string percentage, e.g., "77.4%".
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return {}

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return {}

    headers = get_excel_headers(sheet)
    if not headers:
        return {}

    # Column indexes
    try:
        category_col = headers.index("top_category") + 1
        abandon_col = headers.index("checkout_abandon_rate") + 1
    except ValueError:
        logger.error("Required columns missing: 'top_category' or 'checkout_abandon_rate'")
        return {}

    category_totals = defaultdict(float)
    category_counts = defaultdict(int)

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        category = row[category_col - 1].value or "Unknown"

        value = row[abandon_col - 1].value or 0
        # Convert string percentages like '77.20%' to float 0.772
        if isinstance(value, basestring) and "%" in value:
            try:
                value = float(value.replace("%", "").strip()) / 100.0
            except:
                value = 0
        else:
            try:
                value = float(value)
            except:
                value = 0

        category_totals[category] += value
        category_counts[category] += 1

    # Compute average per category and format as percentage string
    avg_abandon_rate = {}
    for k in category_totals.keys():
        if category_counts[k] > 0:
            avg = category_totals[k] / category_counts[k]
            avg_abandon_rate[k] = "{0:.1f}%".format(avg * 100)  # e.g., "77.4%"
        else:
            avg_abandon_rate[k] = "0%"

    return avg_abandon_rate


def get_total_orders_per_month(file_path, from_dt_str, to_dt_str):
    """
    Returns total number of orders per month within the given date range.
    Format: {"Jul-2025": 1243, "Aug-2025": 1389, ...}
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    try:
        orders_col = headers.index("orders") + 1
    except ValueError:
        logger.error("Required column missing: 'orders'")
        return OrderedDict()

    monthly_data = defaultdict(int)

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        try:
            order_count = float(row[orders_col - 1].value or 0)
        except:
            order_count = 0

        month_key = record_dt.strftime("%b-%Y")
        monthly_data[month_key] += int(order_count)

    # Sort months chronologically
    sorted_months = sorted(monthly_data.keys(),
                           key=lambda x: datetime.strptime(x, "%b-%Y"))

    result = OrderedDict()
    for month in sorted_months:
        result[month] = monthly_data[month]

    return result


def get_top_categories_by_product_views(file_path, from_dt_str, to_dt_str):

    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    # Validate columns
    try:
        category_col = headers.index("top_category") + 1
        views_col = headers.index("product_views_top_category") + 1
    except ValueError:
        logger.error("Required columns missing: 'top_category' or 'product_views_top_category'")
        return OrderedDict()

    category_views = defaultdict(float)

    # Iterate through rows within date range
    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        try:
            category = str(row[category_col - 1].value or "").strip()
            views = float(row[views_col - 1].value or 0)
        except:
            continue

        if category:
            category_views[category] += views

    # Sort by total views (descending)
    sorted_data = sorted(category_views.items(), key=lambda x: x[1], reverse=True)

    # Convert to OrderedDict for clean output
    ordered_result = OrderedDict()
    for cat, total in sorted_data:
        ordered_result[cat] = int(total)

    return ordered_result




def get_traffic_source_row_percentage(file_path, from_dt_str, to_dt_str):
    """
    Returns percentage of rows per traffic source within the given datetime range.
    Example output:
    {"organic": "45.3%", "paid_search": "30.0%", "email": "24.7%"}
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    try:
        source_col = headers.index("traffic_source") + 1
    except ValueError:
        logger.error("Required column missing: 'traffic_source'")
        return OrderedDict()

    source_count = defaultdict(int)
    total_rows = 0

    # Iterate rows in date range
    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        try:
            source = str(row[source_col - 1].value or "").strip()
        except:
            continue

        if source:
            source_count[source] += 1
            total_rows += 1

    if total_rows == 0:
        return OrderedDict()

    # Calculate percentage
    source_percentage = OrderedDict()
    for source, count in sorted(source_count.items(), key=lambda x: x[1], reverse=True):
        percent = (count / float(total_rows)) * 100
        source_percentage[source] = "{:.3f}%".format(percent)

    return source_percentage


def get_revenue_by_top_category(file_path, from_dt_str, to_dt_str):
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    try:
        category_col = headers.index("top_category") + 1
        revenue_col = headers.index("revenue_usd") + 1
    except ValueError:
        logger.error("Required column missing: 'top_category' or 'revenue_usd'")
        return OrderedDict()

    revenue_by_category = defaultdict(float)

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        try:
            category = str(row[category_col - 1].value or "").strip()
            revenue = float(row[revenue_col - 1].value or 0)
        except:
            continue

        if category:
            revenue_by_category[category] += revenue

    # Sort descending by revenue
    sorted_data = sorted(revenue_by_category.items(), key=lambda x: x[1], reverse=True)
    ordered_result = OrderedDict()
    for cat, rev in sorted_data:
        ordered_result[cat] = round(rev, 2)

    return ordered_result

def get_revenue_by_traffic_source(file_path, from_dt_str, to_dt_str):
    """
    Returns total revenue per traffic_source within the given datetime range.
    Example output: {"organic": 12500, "paid_search": 9800, "email": 4500}
    """
    from_dt = parse_input_datetime(from_dt_str)
    to_dt = parse_input_datetime(to_dt_str)

    if not from_dt or not to_dt:
        return OrderedDict()

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return OrderedDict()

    headers = get_excel_headers(sheet)
    if not headers:
        return OrderedDict()

    try:
        source_col = headers.index("traffic_source") + 1
        revenue_col = headers.index("revenue_usd") + 1
    except ValueError:
        logger.error("Required column missing: 'traffic_source' or 'revenue_usd'")
        return OrderedDict()

    revenue_by_source = defaultdict(float)

    for row in filter_rows_by_datetime(sheet, headers, from_dt, to_dt):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue

        try:
            source = str(row[source_col - 1].value or "").strip()
            revenue = float(row[revenue_col - 1].value or 0)
        except:
            continue

        if source:
            revenue_by_source[source] += revenue

    # Sort descending by revenue
    sorted_data = sorted(revenue_by_source.items(), key=lambda x: x[1], reverse=True)
    ordered_result = OrderedDict()
    for src, rev in sorted_data:
        ordered_result[src] = round(rev, 2)

    return ordered_result


def get_metric_timeseries(file_path, column_name, from_dt_str, to_dt_str):
    from_dt_obj = parse_input_datetime(from_dt_str)
    to_dt_obj = parse_input_datetime(to_dt_str)
    if not from_dt_obj or not to_dt_obj:
        return []

    sheet = load_excel_sheet(file_path)
    if not sheet:
        return []

    headers = get_excel_headers(sheet)
    if not headers or column_name not in headers:
        return []

    col_index = headers.index(column_name) + 1
    points = []

    for row in filter_rows_by_datetime(sheet, headers, from_dt_obj, to_dt_obj):
        record_dt = parse_datetime(row[headers.index("Date")].value,
                                   row[headers.index("Time")].value)
        if not record_dt:
            continue
        try:
            value = float(row[col_index - 1].value or 0)
        except:
            value = 0.0
        points.append({"created_at": record_dt, "value": value})

    # Determine grouping automatically
    date_diff = (to_dt_obj - from_dt_obj).days
    if date_diff <= 7:
        grouping = "day"
    elif date_diff <= 30:
        grouping = "week"
    elif date_diff < 364:
        grouping = "month"
    else:
        grouping = "quarter"

    return aggregate_sum(points, grouping, from_dt_obj, to_dt_obj)

from collections import OrderedDict, defaultdict
from datetime import datetime, timedelta
import math

def parse_ts_value(ts_val):
    """Robust parser for various timestamp formats (Python 2 safe)."""
    if not ts_val:
        return None

    if isinstance(ts_val, basestring):
        ts_val = ts_val.strip()
        formats = [
            "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S",
            "%H:%M:%S%z",
            "%H:%M:%S"
        ]
        for fmt in formats:
            try:
                dt = datetime.strptime(ts_val, fmt)
                if fmt in ("%H:%M:%S", "%H:%M:%S%z"):
                    today = datetime.utcnow().date()
                    dt = datetime.combine(today, dt.time())
                return dt
            except Exception:
                continue
        return None

    # Excel datetime object
    if hasattr(ts_val, "year") and hasattr(ts_val, "month"):
        return ts_val

    return None


def aggregate_sum_kpis(points, grouping, from_dt_obj, to_dt_obj):
    """
    Aggregate a list of {'created_at': datetime, 'value': float}
    into groups (day/week/month/quarter)
    """
    grouped = defaultdict(float)
    for pt in points:
        dt = pt.get("created_at")
        val = pt.get("value", 0)
        if not dt:
            continue

        if grouping == "day":
            key = dt.strftime("%Y-%m-%d")
        elif grouping == "week":
            key = "%s-W%02d" % (dt.year, dt.isocalendar()[1])
        elif grouping == "month":
            key = dt.strftime("%Y-%m")
        else:  # quarter
            quarter = int(math.ceil(dt.month / 3.0))
            key = "%s-Q%d" % (dt.year, quarter)

        grouped[key] += val

    ordered = OrderedDict(sorted(grouped.items()))
    return [{"period": k, "sum": round(v, 2)} for k, v in ordered.items()]


def get_operational_anomaly_kpis(file_path, from_dt_str, to_dt_str):
    """
    Reads Excel file (Dynatrace Astronomy SHOP - 90d Metrics.xlsx)
    and computes time-grouped sum of 'revenue_usd' and 'revenue_24h_ma'
    based on the date difference.
    """
    from openpyxl import load_workbook

    try:
        from_dt_obj = datetime.strptime(from_dt_str, "%Y-%m-%d %H:%M:%S")
        to_dt_obj = datetime.strptime(to_dt_str, "%Y-%m-%d %H:%M:%S")
    except Exception:
        logger.error("Invalid datetime format. Expected: YYYY-MM-DD HH:MM:SS")
        return OrderedDict()

    wb = load_workbook(file_path, data_only=True)
    sheet = wb.active

    # Read headers
    headers = [str(c.value).strip() if c.value else "" for c in next(sheet.iter_rows(min_row=1, max_row=1))]
    if "revenue_usd" not in headers or "revenue_24h_ma" not in headers:
        logger.error("Required columns missing.")
        return OrderedDict()

    date_idx = 0  # Assuming first column is date or day
    rev_idx = headers.index("revenue_usd")
    rev_ma_idx = headers.index("revenue_24h_ma")

    revenue_points = []
    revenue_ma_points = []

    for row in sheet.iter_rows(min_row=2):
        dt_val = row[date_idx].value
        ts_val = parse_ts_value(dt_val)
        if not ts_val:
            continue

        if not (from_dt_obj <= ts_val <= to_dt_obj):
            continue

        try:
            revenue = float(row[rev_idx].value or 0)
            revenue_ma = float(row[rev_ma_idx].value or 0)
        except:
            continue

        revenue_points.append({"created_at": ts_val, "value": revenue})
        revenue_ma_points.append({"created_at": ts_val, "value": revenue_ma})

    # Determine grouping
    date_diff = (to_dt_obj - from_dt_obj).days
    if date_diff <= 7:
        grouping = "day"
    elif date_diff <= 30:
        grouping = "week"
    elif date_diff < 364:
        grouping = "month"
    else:
        grouping = "quarter"

    revenue_grouped = aggregate_sum_kpis(revenue_points, grouping, from_dt_obj, to_dt_obj)
    revenue_ma_grouped = aggregate_sum_kpis(revenue_ma_points, grouping, from_dt_obj, to_dt_obj)

    return OrderedDict([
        ("grouping", grouping),
        ("revenue_usd", revenue_grouped),
        ("revenue_24h_ma", revenue_ma_grouped)
    ])

def get_customers_kpis(file_path, from_dt_str, to_dt_str):
    """
    Reads Excel file (Dynatrace Astronomy SHOP - 90d Metrics.xlsx)
    and computes time-grouped sum of 'new_customers' and 'returning_customers'.
    """
    from openpyxl import load_workbook
    try:
        from_dt_obj = datetime.strptime(from_dt_str, "%Y-%m-%d %H:%M:%S")
        to_dt_obj = datetime.strptime(to_dt_str, "%Y-%m-%d %H:%M:%S")
    except Exception:
        raise Exception("Invalid datetime format. Expected: YYYY-MM-DD HH:MM:SS")

    wb = load_workbook(file_path, data_only=True)
    sheet = wb.active

    # Read headers
    headers = [str(c.value).strip() if c.value else "" for c in next(sheet.iter_rows(min_row=1, max_row=1))]

    if "new_customers" not in headers or "returning_customers" not in headers:
        raise Exception("Required columns 'new_customers' or 'returning_customers' not found in sheet")

    date_idx = 0  # Assuming first column is date
    new_cust_idx = headers.index("new_customers")
    returning_cust_idx = headers.index("returning_customers")

    new_cust_points = []
    returning_cust_points = []

    for row in sheet.iter_rows(min_row=2):
        dt_val = row[date_idx].value
        ts_val = parse_ts_value(dt_val)
        if not ts_val:
            continue

        if not (from_dt_obj <= ts_val <= to_dt_obj):
            continue

        try:
            new_val = float(row[new_cust_idx].value or 0)
            ret_val = float(row[returning_cust_idx].value or 0)
        except:
            continue

        new_cust_points.append({"created_at": ts_val, "value": new_val})
        returning_cust_points.append({"created_at": ts_val, "value": ret_val})

    # Determine grouping
    date_diff = (to_dt_obj - from_dt_obj).days
    if date_diff <= 7:
        grouping = "day"
    elif date_diff <= 30:
        grouping = "week"
    elif date_diff < 364:
        grouping = "month"
    else:
        grouping = "quarter"

    new_cust_grouped = aggregate_sum_kpis(new_cust_points, grouping, from_dt_obj, to_dt_obj)
    returning_cust_grouped = aggregate_sum_kpis(returning_cust_points, grouping, from_dt_obj, to_dt_obj)

    return OrderedDict([
        ("grouping", grouping),
        ("new_customers", new_cust_grouped),
        ("returning_customers", returning_cust_grouped)
    ])

def get_endpoint_from_item(item):
    """Extract endpoint from log item with fallback logic"""
    
    # Try to get code.function from attributes
    if "apm_log__attributes" in item and item["apm_log__attributes"]:
        try:
            attrs = json.loads(item["apm_log__attributes"]) if isinstance(item["apm_log__attributes"], (str, unicode)) else item["apm_log__attributes"]
            if attrs and isinstance(attrs, dict) and attrs.get("code.function"):
                return attrs.get("code.function")
        except:
            pass
    
    # Extract from stacktrace in attributes
    if "apm_log__attributes" in item and item["apm_log__attributes"]:
        try:
            attrs = json.loads(item["apm_log__attributes"]) if isinstance(item["apm_log__attributes"], (str, unicode)) else item["apm_log__attributes"]
            stacktrace = attrs.get('exception.stacktrace', '')
            if stacktrace:
                # Look for method calls in stacktrace
                method_match = re.search(r'at\s+([a-zA-Z0-9_\.]+)\.([a-zA-Z0-9_]+)\(', stacktrace)
                if method_match:
                    return method_match.group(1) + '.' + method_match.group(2) + '()'
                
                # Look for file paths in stacktrace
                file_match = re.search(r'in\s+(\/[^ ]+\.(cs|java|py)):line\s+(\d+)', stacktrace)
                if file_match:
                    return file_match.group(1) + ':' + file_match.group(3)
        except:
            pass
    
    # Extract from message
    if item["description"]:
        # Look for API endpoints
        api_match = re.search(r'(\/(?:api|v[0-9])\/[a-zA-Z0-9\-\._~\/]+)', item["description"])
        if api_match:
            return api_match.group(1)
        
        # Look for file paths
        file_match = re.search(r'(\/[a-zA-Z0-9_\-\.\/]+\.(cs|java|py))', item["description"])
        if file_match:
            return file_match.group(1)
    
    # Fallback to service-based endpoint
    service_name = item["application__name"].lower() if item["application__name"] else "UnityOne events" 
    if 'kafka' in service_name:
        return 'Kafka Service'
    elif 'database' in service_name or 'db' in service_name:
        return 'Database Operation'
    elif 'api' in service_name:
        return 'API Endpoint'
    else:
        return 'Application Service'
    

def get_status_label(stat):
    if stat == 1:
        return "Healthy"
    elif stat == 0:
        return "Critical"
    elif stat == -1:
        return "Unknown"
    else:
        return "Unknown"






def apm_node_status_update(user_id, nodes):
    User = get_user_model()
    user = User.objects.get(id=user_id)
    for node in nodes:

        if node.get("type") != "service":
            continue
        service_name = node.get("name")
        app = MonitoredApp.objects.filter(name=service_name,customer=user.org).first()
        latest_event = Event.objects.filter(application=app, customer=user.org).last()
        if app:
            if latest_event:
                event_severity = latest_event.severity if latest_event else None
                if node.get("name") == app.name and event_severity in SEVERITY_MAPPING:
                    mapped_status = SEVERITY_MAPPING[event_severity]
                    node["status"] = mapped_status
                    if "metadata" in node and isinstance(node["metadata"], dict):
                        node["metadata"]["Status"] = STATUS_MAPPING[mapped_status]

    return nodes



from django.db.models import Q


def build_device_contenttype_qs(
    monitoring_qs,
    device_field='device_id',
    content_type_field='content_type'
    ):
    """
    Builds a Q object matching exact (device_id, content_type) pairs
    from MonitoredApp queryset.

    Example output:
    Q(device_id=1, content_type=10) |
    Q(device_id=2, content_type=12)

    :param monitoring_qs: MonitoredApp queryset
    :param device_field: field name to match device_id
    :param content_type_field: field name to match content_type
    :return: Q object
    """

    pair_q = Q()

    for item in monitoring_qs.values('device_id', 'content_type'):
        pair_q |= Q(
            **{
                device_field: item['device_id'],
                content_type_field: item['content_type'],
            }
        )

    return pair_q


circuit_breaker_lock = threading.Lock()

thread_local = threading.local()

# ---------------------------------------------------------------------------
# Circuit Breaker - IMPROVED
# ---------------------------------------------------------------------------
def check_circuit_breaker():
    """Check if circuit breaker allows requests"""
    with circuit_breaker_lock:
        if not circuit_breaker_state['is_open']:
            return True
        
        # Check if timeout has passed
        if circuit_breaker_state['last_failure_time']:
            elapsed = time.time() - circuit_breaker_state['last_failure_time']
            if elapsed > CIRCUIT_BREAKER_TIMEOUT:
                # Reset circuit breaker
                circuit_breaker_state['is_open'] = False
                circuit_breaker_state['failures'] = 0
                logger.info("[Circuit Breaker] Reset - attempting requests")
                return True
        
        logger.warning("[Circuit Breaker] OPEN - blocking requests")
        return False

def record_success():
    """Record successful request"""
    with circuit_breaker_lock:
        circuit_breaker_state['failures'] = 0
        circuit_breaker_state['is_open'] = False

def record_failure(error_type="unknown"):
    """
    Record failed request and potentially open circuit
    Only trip on genuine failures, not rate limits or client errors
    """
    # Don't trip circuit breaker for:
    # - 429 (rate limiting) - expected under load
    # - 400 (bad request) - client error, not service failure
    if error_type in ["rate_limit", "client_error"]:
        logger.debug("[Circuit Breaker] Ignoring {} for circuit breaker".format(error_type))
        return
    
    with circuit_breaker_lock:
        circuit_breaker_state['failures'] += 1
        circuit_breaker_state['last_failure_time'] = time.time()
        
        if circuit_breaker_state['failures'] >= CIRCUIT_BREAKER_THRESHOLD:
            circuit_breaker_state['is_open'] = True
            logger.error("[Circuit Breaker] OPENED after {} failures".format(
                circuit_breaker_state['failures']))

# ---------------------------------------------------------------------------
# Session (one per thread)
# ---------------------------------------------------------------------------
def get_session():
    if not hasattr(thread_local, "session"):
        s = requests.Session()
        s.verify = False
        adapter = requests.adapters.HTTPAdapter(
            pool_connections=10,
            pool_maxsize=20,
            max_retries=0
        )
        s.mount('http://', adapter)
        s.mount('https://', adapter)
        thread_local.session = s
    return thread_local.session

# ---------------------------------------------------------------------------
# Date helpers
# ---------------------------------------------------------------------------
def parse_datetime(dt_str):
    try:
        return datetime.strptime(dt_str.strip(), "%Y-%m-%d %H:%M:%S")
    except (ValueError, AttributeError):
        return None

parse_input_datetime = parse_datetime

def dt_to_epoch(dt):
    epoch = datetime(1970, 1, 1)
    delta = dt - epoch
    return int(delta.days * 86400 + delta.seconds)

def _td_seconds(td):
    return td.days * 86400 + td.seconds + td.microseconds / 1e6

# ---------------------------------------------------------------------------
# Query builders
# ---------------------------------------------------------------------------
def build_query(template, duration, tenant_id=None):
    query = template.replace("__DUR__", duration)
    if tenant_id:
        query = query.replace(
            '| json',
            '| json | resources_tenant_id="{}"'.format(tenant_id),
            1
        )
    return query

def build_query_chunks(template, tenant_id=None):
    query = template.replace("__WIN__", COUNT_WINDOW)
    if tenant_id:
        query = query.replace(
            '| json',
            '| json | resources_tenant_id="{}"'.format(tenant_id),
            1
        )
    return query

QUERY_TEMPLATE = (
    'count(sum by (userid) ('
    'count_over_time({job="cart"} | regexp `userId=(?P<userid>[a-f0-9\\-]+)` [__WIN__])'
    '))'
)

def build_query_graph():
    return QUERY_TEMPLATE.replace("__WIN__", COUNT_WINDOW)

# ---------------------------------------------------------------------------
# Low-level Loki GET with IMPROVED retry logic
# ---------------------------------------------------------------------------
def _loki_get(params, retry_count=0):
    """
    Execute Loki query with exponential backoff and circuit breaker
    IMPROVED: Don't trip circuit breaker on 429 or 400 errors
    """
    if not check_circuit_breaker():
        logger.error("[Loki] Circuit breaker is OPEN - request blocked")
        return None
    
    delay = RETRY_BACKOFF * (2 ** retry_count)
    
    for attempt in range(MAX_RETRIES):
        try:
            logger.debug("[Loki] Request attempt {}/{} for query".format(
                attempt + 1, MAX_RETRIES))
            
            resp = get_session().get(
                LOKI_QUERY_RANGE_URL,
                params=params,
                timeout=REQUEST_TIMEOUT
            )
            
            if resp.status_code == 200:
                record_success()
                return resp.json()
            
            # Handle rate limiting - DON'T trip circuit breaker
            if resp.status_code == 429:
                retry_after = int(resp.headers.get('Retry-After', delay))
                logger.warning("[Loki] 429 Rate Limited - waiting {}s (attempt {}/{})".format(
                    retry_after, attempt + 1, MAX_RETRIES))
                if attempt < MAX_RETRIES - 1:
                    time.sleep(retry_after)
                    continue
                # Don't trip circuit breaker on rate limits
                record_failure("rate_limit")
                return None
            
            # Handle client errors (400-499) - DON'T trip circuit breaker
            if 400 <= resp.status_code < 500:
                logger.error("[Loki] HTTP {} : {}".format(
                    resp.status_code, resp.text[:300]))
                # Don't trip circuit breaker on client errors
                record_failure("client_error")
                return None
            
            # Handle server errors (500-599) - DO trip circuit breaker
            if resp.status_code >= 500:
                logger.error("[Loki] Server error {} (attempt {}/{})".format(
                    resp.status_code, attempt + 1, MAX_RETRIES))
                if attempt < MAX_RETRIES - 1:
                    time.sleep(delay)
                    delay *= 2
                    continue
                record_failure("server_error")
                return None
        
        except requests.exceptions.Timeout:
            logger.error("[Loki] Timeout on attempt {}/{}".format(
                attempt + 1, MAX_RETRIES))
            if attempt < MAX_RETRIES - 1:
                time.sleep(delay)
                delay *= 2
                continue
            record_failure("timeout")
            return None
        
        except requests.exceptions.ConnectionError as e:
            logger.error("[Loki] Connection error: {}".format(e))
            if attempt < MAX_RETRIES - 1:
                time.sleep(delay)
                delay *= 2
                continue
            record_failure("connection_error")
            return None
        
        except Exception as e:
            logger.error("[Loki] Unexpected exception: {}".format(e))
            record_failure("exception")
            return None
    
    record_failure("max_retries")
    return None

# ---------------------------------------------------------------------------
# Helper: build the list of (start, end) date chunks for a range
# ---------------------------------------------------------------------------
def _build_chunks(from_dt, to_dt, max_days=MAX_CHUNK_DAYS):
    """Split [from_dt, to_dt] into chunks of at most max_days each."""
    chunks = []
    max_delta = timedelta(days=max_days)
    cursor = from_dt
    while cursor < to_dt:
        chunk_end = min(cursor + max_delta, to_dt)
        chunks.append((cursor, chunk_end))
        cursor = chunk_end
    return chunks

# ---------------------------------------------------------------------------
# Core range query with better error handling
# ---------------------------------------------------------------------------
def _sum_series(data):
    """Safely sum series data"""
    if not data:
        return 0
    
    total = 0
    try:
        for series in data.get("data", {}).get("result", []):
            for _ts, val in series.get("values", []):
                try:
                    total += int(float(val))
                except (ValueError, TypeError) as e:
                    logger.warning("[Loki] Invalid value in series: {}".format(e))
                    continue
    except Exception as e:
        logger.error("[Loki] Error summing series: {}".format(e))
    
    return total

def _fetch_chunk(logql_query, chunk_start, chunk_end, chunk_id="unknown"):
    """Fetch a single date chunk from Loki and return its total."""
    params = {
        "query": logql_query,
        "start": str(dt_to_epoch(chunk_start)),
        "end": str(dt_to_epoch(chunk_end)),
        "step": str(STEP_SECONDS),
    }
    
    logger.info("[Loki] Chunk {} fetching {} - {}".format(
        chunk_id,
        chunk_start.strftime("%Y-%m-%d %H:%M"),
        chunk_end.strftime("%Y-%m-%d %H:%M")
    ))
    
    try:
        data = _loki_get(params)
        if data is None:
            logger.error("[Loki] Chunk {} returned None".format(chunk_id))
            return 0
        
        result = _sum_series(data)
        logger.info("[Loki] Chunk {} result: {}".format(chunk_id, result))
        return result
    
    except Exception as e:
        logger.error("[Loki] Chunk {} exception: {}".format(chunk_id, e))
        return 0

def query_loki_range(logql_query, from_dt, to_dt):
    """Query Loki over [from_dt, to_dt], firing chunks in parallel with limits."""
    chunks = _build_chunks(from_dt, to_dt)
    if not chunks:
        return 0
    
    if len(chunks) == 1:
        return _fetch_chunk(logql_query, chunks[0][0], chunks[0][1], "single")
    
    total = 0
    failed_chunks = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS_LOKI) as executor:
        futures = {
            executor.submit(
                _fetch_chunk, logql_query, s, e, "chunk_{}".format(i)
            ): (i, s, e)
            for i, (s, e) in enumerate(chunks)
        }
        
        for future in as_completed(futures):
            chunk_id, s, e = futures[future]
            try:
                result = future.result(timeout=REQUEST_TIMEOUT + 10)
                total += result
            except Exception as ex:
                logger.error("[Loki] Chunk {} ({} -> {}) failed: {}".format(
                    chunk_id, s, e, ex))
                failed_chunks.append((s, e))
    
    if failed_chunks:
        logger.warning("[Loki] {} of {} chunks failed".format(
            len(failed_chunks), len(chunks)))
    
    return total

query_loki_range_chunks = query_loki_range

def query_loki_slot_key_val(logql_query, slot_start, slot_end):
    return query_loki_range(logql_query, slot_start, slot_end)

# ---------------------------------------------------------------------------
# Unique-user query
# ---------------------------------------------------------------------------
def _build_unique_user_chunks(start_dt, end_dt):
    """Split the slot into fixed-size sub-chunks for unique-user counting."""
    chunks = []
    cursor = start_dt
    while cursor < end_dt:
        chunk_end = min(cursor + timedelta(seconds=MAX_CHUNK_SECONDS), end_dt)
        chunk_secs = int(_td_seconds(chunk_end - cursor))
        step = max(60, chunk_secs // 12)
        chunks.append((cursor, chunk_end, step))
        cursor = chunk_end
    return chunks

def _fetch_unique_chunk(start_dt, end_dt, step_seconds, tenant_id=None, chunk_id="unknown"):
    """Fetch unique user count for a single sub-chunk."""
    window_str = "{}s".format(step_seconds)
    tenant_filter = ''
    if tenant_id:
        tenant_filter = ' | json | resources_tenant_id="{}"'.format(tenant_id)
    
    query = (
        'count(sum by (userid) (count_over_time('
        '{{job="cart"}}{tenant_filter}'
        ' | regexp `userId=(?P<userid>[a-f0-9\\-]+)` [{window}]'
        ')))'.format(tenant_filter=tenant_filter, window=window_str)
    )
    
    params = {
        "query": query,
        "start": str(dt_to_epoch(start_dt)),
        "end": str(dt_to_epoch(end_dt)),
        "step": str(step_seconds),
    }
    
    try:
        data = _loki_get(params)
        if not data:
            logger.warning("[Loki] Unique chunk {} returned no data".format(chunk_id))
            return []
        
        results = data.get("data", {}).get("result", [])
        if not results:
            return []
        
        values = [float(val) for _, val in results[0].get("values", [])]
        logger.debug("[Loki] Unique chunk {} got {} values".format(
            chunk_id, len(values)))
        return values
    
    except Exception as e:
        logger.error("[Loki] Unique chunk {} error: {}".format(chunk_id, e))
        return []

def query_loki_unique_users(start_dt, end_dt, tenant_id=None):
    """Count unique users over a slot - all sub-chunks run in parallel."""
    chunks = _build_unique_user_chunks(start_dt, end_dt)
    if not chunks:
        return 0.0
    
    all_values = []
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS_LOKI) as executor:
        futures = {
            executor.submit(
                _fetch_unique_chunk, s, e, step, tenant_id, "unique_{}".format(i)
            ): (i, s, e)
            for i, (s, e, step) in enumerate(chunks)
        }
        
        for future in as_completed(futures):
            chunk_id, s, e = futures[future]
            try:
                values = future.result(timeout=REQUEST_TIMEOUT + 10)
                all_values.extend(values)
            except Exception as ex:
                logger.error("[Loki] Unique chunk {} ({} -> {}) failed: {}".format(
                    chunk_id, s, e, ex))
    
    return max(all_values) if all_values else 0.0

# ---------------------------------------------------------------------------
# Fanout executor - parallel named queries (ORIGINAL - for funnels)
# ---------------------------------------------------------------------------
def execute_parallel_queries(funnel_queries, from_dt, to_dt):
    """Execute multiple named queries in parallel with error handling"""
    results = {}
    
    def run(key, query):
        try:
            logger.info("[Query] Starting: {}".format(key))
            val = query_loki_range(query, from_dt, to_dt)
            logger.info("[Query] Completed: {} = {}".format(key, val))
            return key, val
        except Exception as e:
            logger.error("[Query] {} exception: {}".format(key, e))
            return key, 0
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS_SLOT) as executor:
        futures = {
            executor.submit(run, key, query): key
            for key, query in funnel_queries.items()
        }
        
        for future in as_completed(futures):
            key = futures[future]
            try:
                result_key, val = future.result(timeout=REQUEST_TIMEOUT * 2)
                results[result_key] = val
            except Exception as ex:
                logger.error("[Query] {} failed with exception: {}".format(key, ex))
                results[key] = 0
    
    return results

# ---------------------------------------------------------------------------
# NEW: Throttled executor for product/category queries
# ---------------------------------------------------------------------------
def execute_throttled_queries(queries, from_dt, to_dt, batch_size=2, delay_between_batches=1.0):
    """
    Execute queries in controlled batches to avoid overwhelming Loki
    
    Args:
        queries: Dict of {key: query_string}
        from_dt: Start datetime
        to_dt: End datetime
        batch_size: Number of queries to run concurrently (default 2)
        delay_between_batches: Seconds to wait between batches (default 1.0)
    
    Returns:
        Dict of {key: result}
    """
    all_results = {}
    query_items = list(queries.items())
    
    logger.info("[Throttled] Processing {} queries in batches of {}".format(
        len(query_items), batch_size))
    
    def run(key, query):
        try:
            logger.info("[Query] Starting: {}".format(key))
            val = query_loki_range(query, from_dt, to_dt)
            logger.info("[Query] Completed: {} = {}".format(key, val))
            return key, val
        except Exception as e:
            logger.error("[Query] {} exception: {}".format(key, e))
            return key, 0
    
    # Process in batches
    for batch_idx in range(0, len(query_items), batch_size):
        batch = query_items[batch_idx:batch_idx + batch_size]
        batch_num = (batch_idx // batch_size) + 1
        total_batches = (len(query_items) + batch_size - 1) // batch_size
        
        logger.info("[Throttled] Starting batch {}/{} with {} queries".format(
            batch_num, total_batches, len(batch)))
        
        # Run batch in parallel (but limited to batch_size)
        with ThreadPoolExecutor(max_workers=min(batch_size, 2)) as executor:
            futures = {
                executor.submit(run, key, query): key
                for key, query in batch
            }
            
            for future in as_completed(futures):
                key = futures[future]
                try:
                    result_key, val = future.result(timeout=REQUEST_TIMEOUT * 2)
                    all_results[result_key] = val
                except Exception as ex:
                    logger.error("[Query] {} failed with exception: {}".format(key, ex))
                    all_results[key] = 0
        
        # Add delay between batches (except for last batch)
        if batch_idx + batch_size < len(query_items):
            logger.debug("[Throttled] Waiting {}s before next batch".format(delay_between_batches))
            time.sleep(delay_between_batches)
    
    logger.info("[Throttled] Completed all {} queries".format(len(query_items)))
    return all_results

# ---------------------------------------------------------------------------
# Grouping and slot helpers
# ---------------------------------------------------------------------------
def get_duration(from_dt, to_dt):
    total_seconds = int(_td_seconds(to_dt - from_dt))
    MAX_WINDOW_SECONDS = 86400 * 2   # 2 days max

    total_seconds = min(total_seconds, MAX_WINDOW_SECONDS)

    if total_seconds < 3600:
        return "{}m".format(max(1, total_seconds // 60))
    elif total_seconds < 86400:
        return "{}h".format(max(1, total_seconds // 3600))
    else:
        return "{}d".format(max(1, total_seconds // 86400))

def get_grouping(from_dt, to_dt):
    delta_days = _td_seconds(to_dt - from_dt) / 86400.0
    if delta_days <= 1:
        return "3h"
    elif delta_days <= 7:
        return "day"
    else:
        return "week"

def build_slots(from_dt, to_dt, grouping):
    slots = []
    if grouping == "3h":
        cursor = from_dt.replace(minute=0, second=0, microsecond=0)
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(hours=3), to_dt)
            slots.append((cursor.strftime("%b %d %H:%M"), cursor, slot_end))
            cursor += timedelta(hours=3)
    elif grouping == "day":
        cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(days=1), to_dt)
            slots.append((cursor.strftime("%a"), cursor, slot_end))
            cursor += timedelta(days=1)
    else:
        cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        week_num = 1
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(days=7), to_dt)
            slots.append(("Week {}".format(week_num), cursor, slot_end))
            cursor += timedelta(days=7)
            week_num += 1
    return slots

def get_grouping_and_slots(from_dt, to_dt):
    delta_days = _td_seconds(to_dt - from_dt) / 86400.0
    slots = []
    if delta_days <= 1:
        grouping = "12h"
        cursor = from_dt
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(hours=12), to_dt)
            label = cursor.strftime("%Y-%m-%d") + (" 00:00" if cursor.hour < 12 else " 12:00")
            slots.append((label, cursor, slot_end))
            cursor = slot_end
    elif delta_days <= 7:
        grouping = "day"
        cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(days=1), to_dt)
            slots.append((cursor.strftime("%a"), cursor, slot_end))
            cursor += timedelta(days=1)
    else:
        grouping = "week"
        cursor = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
        week_num = 1
        while cursor < to_dt:
            slot_end = min(cursor + timedelta(days=7), to_dt)
            slots.append(("Week {}".format(week_num), cursor, slot_end))
            cursor += timedelta(days=7)
            week_num += 1
    return grouping, slots

# ---------------------------------------------------------------------------
# Calculation helpers
# ---------------------------------------------------------------------------
def calc_conversion_rate(converted, total):
    if total == 0:
        return "0.00%"
    return "{:.2f}%".format((float(converted) / float(total)) * 100.0)

def calc_percentages(raw_counts):
    total = sum(raw_counts.values())
    if total == 0:
        return dict((k, "0.000%") for k in raw_counts)
    return dict(
        (k, "{:.3f}%".format((v / float(total)) * 100))
        for k, v in raw_counts.items()
    )
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

BOA_TRAFFIC_QUERIES = {
    "frontend": 'sum(count_over_time({job="anthos-frontend"}[__WIN__]))',
    "payment": 'sum(count_over_time({job="anthos-transactionhistory"}[__WIN__]))',
    "balance": 'sum(count_over_time({job="anthos-balancereader"}[__WIN__]))',
    "contacts": 'sum(count_over_time({job="anthos-contacts"}[__WIN__]))',
    "userservice": 'sum(count_over_time({job="anthos-userservice"}[__WIN__]))',
}
BOA_TOTAL_SIGNUP_QUERY = 'sum(count_over_time({job="anthos-frontend"} |~ "Creating new user"[__WIN__]))'

# Failed signup query
BOA_FAILED_SIGNUP_QUERY = 'sum(count_over_time({job="anthos-userservice"} |~ "Error creating new user: database failure"[__WIN__]))'

BOA_QUERY_TEMPLATES = {
    "balance_checks": 'sum(count_over_time({job="anthos-balancereader"} |~ "GET.*balances"[__DUR__]))',
    "transactions": 'sum(count_over_time({job="anthos-transactionhistory"} |~ "GET.*transactions"[__DUR__]))',
    "contacts": 'sum(count_over_time({job="anthos-contacts"} |~ "Successfully retrieved contacts"[__DUR__]))',
    "user_logins": 'sum(count_over_time({job="anthos-userservice"} |~ "Login Successful"[__DUR__]))',
    "user_signups": 'sum(count_over_time({job="anthos-userservice"} |~ "Creating new user"[__DUR__]))',
    "payment_submissions": 'sum(count_over_time({job="anthos-frontend"} |~ "Submitting transaction"[__DUR__]))',
}

BOA_ERROR_QUERIES = {
    "payment_errors": 'sum(count_over_time({job="anthos-frontend"} |~ "Error submitting payment"[__DUR__]))',
    "user_creation_errors": 'sum(count_over_time({job="anthos-userservice"} |~ "Error creating new user: database failure"[__DUR__]))',
    "balance_reader_errors": 'sum(count_over_time({job="anthos-balancereader"} |~ "ERROR"[__DUR__]))',
    "transaction_errors": 'sum(count_over_time({job="anthos-transactionhistory"} |~ "ERROR"[__DUR__]))',
    "contacts_errors": 'sum(count_over_time({job="anthos-contacts"} |~ "ERROR"[__DUR__]))',
}

BOA_HEALTH_QUERIES = {
    "balancereader": 'sum(count_over_time({job="anthos-balancereader"} |~ "Completed 200 OK"[__DUR__]))',
    "transactionhistory": 'sum(count_over_time({job="anthos-transactionhistory"} |~ "Completed 200 OK"[__DUR__]))',
    "contacts": 'sum(count_over_time({job="anthos-contacts"} |~ "Successfully retrieved contacts"[__DUR__]))',
    "userservice": 'sum(count_over_time({job="anthos-userservice"} |~ "Login Successful"[__DUR__]))',
    "frontend": 'sum(count_over_time({job="anthos-frontend"} |~ "Logging in"[__DUR__]))',
}

BOA_TRANSACTION_STATUS_QUERIES = {
    "success": 'sum(count_over_time({job="anthos-transactionhistory"} |~ "Completed 200 OK"[__DUR__]))',
    "failed": 'sum(count_over_time({job="anthos-frontend"} |~ "Error submitting payment"[__DUR__]))',
}

BOA_USER_ACTIVITY_QUERIES = {
    "login_attempts": 'sum(count_over_time({job="anthos-userservice"} |~ "Login Successful"[__DUR__]))',
    "balance_views": 'sum(count_over_time({job="anthos-balancereader"} |~ "GET.*balances"[__DUR__]))',
    "transaction_views": 'sum(count_over_time({job="anthos-transactionhistory"} |~ "GET.*transactions"[__DUR__]))',
    "payment_submissions": 'sum(count_over_time({job="anthos-frontend"} |~ "Submitting transaction"[__DUR__]))',
    "contact_views": 'sum(count_over_time({job="anthos-contacts"} |~ "Successfully retrieved contacts"[__DUR__]))',
}

BOA_PAYMENT_METRICS = {
    "successful": 'sum(count_over_time({job="anthos-frontend"} |~ "Submitting transaction"[__DUR__]))',
    "failed": 'sum(count_over_time({job="anthos-frontend"} |~ "Error submitting payment"[__DUR__]))',
}

BOA_LATENCY_QUERIES = {
    "balancereader": 'avg_over_time({job="anthos-balancereader"} | json | unwrap duration [__DUR__])',
    "transactionhistory": 'avg_over_time({job="anthos-transactionhistory"} | json | unwrap duration [__DUR__])',
}

BOA_TOTAL_REQUESTS = {
    "balancereader": 'sum(count_over_time({job="anthos-balancereader"}[__DUR__]))',
    "transactionhistory": 'sum(count_over_time({job="anthos-transactionhistory"}[__DUR__]))',
    "contacts": 'sum(count_over_time({job="anthos-contacts"}[__DUR__]))',
    "userservice": 'sum(count_over_time({job="anthos-userservice"}[__DUR__]))',
    "frontend": 'sum(count_over_time({job="anthos-frontend"}[__DUR__]))',
}
BOA_COMPLETE_RATES_QUERIES = {

    "payment_success_rate": '''
        (
            (
                sum(
                    count_over_time(
                        {job="anthos-frontend"}
                        |= "Submitting transaction"
                        [__WIN__]
                    )
                )
                -
                (
                    sum(
                        count_over_time(
                            {job="anthos-frontend"}
                            |= "Error submitting payment"
                            [__WIN__]
                        )
                    )
                    or vector(0)
                )
            )
            /
            sum(
                count_over_time(
                    {job="anthos-frontend"}
                    |= "Submitting transaction"
                    [__WIN__]
                )
            )
        ) * 100
    ''',

    "login_success_rate": '''
        (
            sum(
                count_over_time(
                    {job="anthos-userservice"}
                    |= "Login Successful"
                    [__WIN__]
                )
            )
            /
            sum(
                count_over_time(
                    {job="anthos-frontend"}
                    |= "Logging in"
                    [__WIN__]
                )
            )
        ) * 100
    ''',

    "signup_success_rate": '''
        (
            (
                sum(
                    count_over_time(
                        {job="anthos-frontend"}
                        |= "Creating new user"
                        [__WIN__]
                    )
                )
                -
                (
                    sum(
                        count_over_time(
                            {job="anthos-userservice"}
                            |= "database failure"
                            [__WIN__]
                        )
                    )
                    or vector(0)
                )
            )
            /
            sum(
                count_over_time(
                    {job="anthos-frontend"}
                    |= "Creating new user"
                    [__WIN__]
                )
            )
        ) * 100
    ''',

    "balance_success_rate": '''
        (
            sum(
                count_over_time(
                    {job="anthos-balancereader"}
                    |~ "GET.*balances.*200"
                    [__WIN__]
                )
            )
            /
            sum(
                count_over_time(
                    {job="anthos-balancereader"}
                    |~ "GET.*balances"
                    [__WIN__]
                )
            )
        ) * 100
    ''',

    "transaction_success_rate": '''
        (
            (
                sum(
                    count_over_time(
                        {job="anthos-frontend"}
                        |= "Submitting transaction"
                        [__WIN__]
                    )
                )
                -
                (
                    sum(
                        count_over_time(
                            {job="anthos-frontend"}
                            |= "Error submitting payment"
                            [__WIN__]
                        )
                    )
                    or vector(0)
                )
            )
            /
            sum(
                count_over_time(
                    {job="anthos-frontend"}
                    |= "Submitting transaction"
                    [__WIN__]
                )
            )
        ) * 100
    ''',
}

def compute_funnels_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        duration = get_duration(chunk_from, chunk_to)
        funnel_queries = {
            key: build_query(tmpl, duration, tenant_id)
            for key, tmpl in QUERY_TEMPLATES.items()
        }
        chunk_results = execute_parallel_queries(
            funnel_queries, chunk_from, chunk_to
        )

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

# ------------------------------------------------------------------ #
# 2. Returning Customers
# ------------------------------------------------------------------ #
def compute_returning_customers_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            product: build_query_chunks(tmpl, tenant_id)
            for product, tmpl in PRODUCT_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

# ------------------------------------------------------------------ #
# 3. New Customers Monthly
# ------------------------------------------------------------------ #
def compute_new_customers_monthly_data(tenant_id, from_dt, to_dt):
    grouping, slots = get_grouping_and_slots(from_dt, to_dt)
    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        return label, query_loki_unique_users(slot_start, slot_end, tenant_id)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(fetch_slot, label, s, e): label
            for label, s, e in slots
        }
        for future in as_completed(futures):
            try:
                label, count = future.result(timeout=60)
                results_map[label] = count
            except Exception as ex:
                label = futures[future]
                logger.error("[Slot] {} failed: {}".format(label, ex))
                results_map[label] = 0

    new_customers = [
        {"total": results_map.get(label, 0), "range": label}
        for label, _, _ in slots
    ]
    return {"new_customers": new_customers, "grouping": grouping}

# ------------------------------------------------------------------ #
# 4. New vs Returning Customers
# ------------------------------------------------------------------ #
def compute_new_vs_returning_data(tenant_id, from_dt, to_dt):
    grouping, slots = get_grouping_and_slots(from_dt, to_dt)
    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        return label, query_loki_unique_users(slot_start, slot_end, tenant_id)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(fetch_slot, label, s, e): label
            for label, s, e in slots
        }
        for future in as_completed(futures):
            try:
                label, count = future.result(timeout=60)
                results_map[label] = count
            except Exception as ex:
                label = futures[future]
                logger.error("[Slot] {} failed: {}".format(label, ex))
                results_map[label] = 0

    new_customers = [
        {"sum": results_map.get(label, 0), "period": label}
        for label, _, _ in slots
    ]
    return {
        "new_customers": new_customers,
        "returning_customers": new_customers,  # TODO: replace with real returning customers query
        "grouping": grouping,
    }

# ------------------------------------------------------------------ #
# 5. Checkout Abandon Rate
# ------------------------------------------------------------------ #
def compute_checkout_abandon_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            key: build_query_chunks(tmpl, tenant_id)
            for key, tmpl in CURRENCY_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

# ------------------------------------------------------------------ #
# 6. Conversion Rate Monthly
# ------------------------------------------------------------------ #
def compute_conversion_rate_data(tenant_id, from_dt, to_dt):
    grouping = get_grouping(from_dt, to_dt)
    slots = build_slots(from_dt, to_dt, grouping)
    total_query = build_query_chunks(TOTAL_QUERY, tenant_id)
    converted_query = build_query_chunks(CONVERTED_QUERY, tenant_id)

    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        total_count = query_loki_slot_key_val(total_query, slot_start, slot_end)
        converted_count = query_loki_slot_key_val(converted_query, slot_start, slot_end)
        return label, calc_conversion_rate(converted_count, total_count)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(fetch_slot, label, s, e): label
            for label, s, e in slots
        }
        for future in as_completed(futures):
            try:
                label, rate = future.result(timeout=60)
                results_map[label] = rate
            except Exception as ex:
                label = futures[future]
                logger.error("[Slot] {} failed: {}".format(label, ex))
                results_map[label] = "0.00%"

    return results_map

# ------------------------------------------------------------------ #
# 7. Orders Placed by Month
# ------------------------------------------------------------------ #
def compute_orders_placed_data(tenant_id, from_dt, to_dt):
    grouping = get_grouping(from_dt, to_dt)
    slots = build_slots(from_dt, to_dt, grouping)
    total_query = build_query_chunks(ORDER_PLACED_QUERY, tenant_id)

    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        return label, query_loki_slot_key_val(total_query, slot_start, slot_end)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {
            executor.submit(fetch_slot, label, s, e): label
            for label, s, e in slots
        }
        for future in as_completed(futures):
            try:
                label, val = future.result(timeout=60)
                results_map[label] = val
            except Exception as ex:
                label = futures[future]
                logger.error("[Slot] {} failed: {}".format(label, ex))
                results_map[label] = 0

    return results_map

# ------------------------------------------------------------------ #
# 8. Top Categories by Product Views
# ------------------------------------------------------------------ #
def compute_top_categories_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            key: build_query_chunks(tmpl, tenant_id)
            for key, tmpl in COUNTRY_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

# ------------------------------------------------------------------ #
# 9. Traffic Source Row Percentage
# ------------------------------------------------------------------ #
def compute_traffic_source_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            key: build_query_chunks(tmpl, tenant_id)
            for key, tmpl in TRAFFIC_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return calc_percentages(aggregated_results)

# ------------------------------------------------------------------ #
# 10. Revenue by Top Category
# ------------------------------------------------------------------ #
def compute_revenue_category_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            product: build_query_chunks(tmpl, tenant_id)
            for product, tmpl in PRODUCT_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

# ------------------------------------------------------------------ #
# 11. Revenue by Traffic Source
# ------------------------------------------------------------------ #
def compute_revenue_traffic_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            key: build_query_chunks(tmpl, tenant_id)
            for key, tmpl in TRAFFIC_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results


# ================================================================== #
# BANK OF ANTHOS (BOA) UTILITY FUNCTIONS
# ================================================================== #

def get_duration_boa(from_dt, to_dt):
    """Calculate duration string for Loki query"""
    delta = to_dt - from_dt
    total_seconds = int(delta.total_seconds())
    
    if total_seconds < 60:
        return "{}s".format(total_seconds)
    elif total_seconds < 3600:
        return "{}m".format(total_seconds // 60)
    elif total_seconds < 86400:
        return "{}h".format(total_seconds // 3600)
    else:
        return "{}d".format(total_seconds // 86400)

def build_query_boa(template, duration, tenant_id):
    """Build Loki query with tenant_id and duration"""
    query = template.replace("__DUR__", duration)
    query = query.replace("{job=", '{{job=, tenant_id="{}", '.format(tenant_id))
    return query

def build_query_chunks_boa(template, tenant_id):
    """Build query for chunked execution"""
    return template.replace("{job=", '{{job=, tenant_id="{}", '.format(tenant_id))

def get_grouping_boa(from_dt, to_dt):
    """Determine grouping based on date range"""
    delta_days = (to_dt - from_dt).days
    if delta_days <= 1:
        return "hour"
    elif delta_days <= 7:
        return "day"
    else:
        return "week"

def build_slots_boa(from_dt, to_dt, grouping):
    """Build time slots based on grouping"""
    slots = []
    cursor = from_dt
    
    if grouping == "hour":
        while cursor <= to_dt:
            slot_end = cursor + timedelta(hours=1)
            label = cursor.strftime("%Y-%m-%d %H:00")
            slots.append((label, cursor, min(slot_end, to_dt)))
            cursor = slot_end
    elif grouping == "day":
        while cursor <= to_dt:
            slot_end = cursor + timedelta(days=1)
            label = cursor.strftime("%Y-%m-%d")
            slots.append((label, cursor, min(slot_end, to_dt)))
            cursor = slot_end
    else:  # week
        week_num = 1
        while cursor <= to_dt:
            slot_end = cursor + timedelta(days=7)
            label = "Week {}".format(week_num)
            slots.append((label, cursor, min(slot_end, to_dt)))
            cursor = slot_end
            week_num += 1
    
    return slots

def get_grouping_and_slots_boa(from_dt, to_dt):
    """Get grouping and time slots"""
    grouping = get_grouping_boa(from_dt, to_dt)
    slots = build_slots_boa(from_dt, to_dt, grouping)
    return grouping, slots

def execute_parallel_queries_boa(queries, from_dt, to_dt, tenant_id):
    """Execute multiple queries in parallel"""
    from concurrent.futures import ThreadPoolExecutor
    results = {}
    
    def execute_query(key, query):
        try:
            # This is a placeholder - implement your actual Loki query here
            # value = your_loki_query_function(query, from_dt, to_dt, tenant_id)
            value = 0  # Placeholder
            return key, value
        except Exception as e:
            logger.error("Query {} failed: {}".format(key, str(e)))
            return key, 0
    
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {}
        for key, query in queries.items():
            future = executor.submit(execute_query, key, query)
            futures[future] = key
        
        for future in futures:
            try:
                key, value = future.result(timeout=60)
                results[key] = value
            except Exception as e:
                key = futures[future]
                logger.error("Future for {} failed: {}".format(key, str(e)))
                results[key] = 0
    
    return results

def execute_throttled_queries_boa(queries, from_dt, to_dt, tenant_id, batch_size=2):
    """Execute queries with throttling"""
    results = {}
    keys = queries.keys()
    
    for i in range(0, len(keys), batch_size):
        batch_keys = keys[i:i+batch_size]
        batch_queries = {k: queries[k] for k in batch_keys}
        batch_results = execute_parallel_queries_boa(batch_queries, from_dt, to_dt, tenant_id)
        results.update(batch_results)
    
    return results

def query_loki_slot_boa(query, from_dt, to_dt, tenant_id):
    """Execute a single Loki query and return value"""
    # This is a placeholder - implement your actual Loki query here
    # value = your_loki_query_function(query, from_dt, to_dt, tenant_id)
    return 0

def query_loki_unique_users_boa(from_dt, to_dt, tenant_id):
    """Get unique user count from Loki"""
    # This is a placeholder - implement your actual Loki query here
    duration = get_duration_boa(from_dt, to_dt)
    query = '''
        count(
            sum by (username) (
                count_over_time(
                    {job="anthos-userservice", tenant_id="%s"}
                    |= "Login Successful"
                    | regexp "username=(?P<username>[^ ]+)"
                    [%s]
                )
            )
        )
    ''' % (tenant_id, duration)
    return query

def calc_percentages_boa(data):
    """Calculate percentages from raw counts"""
    total = sum(data.values())
    if total == 0:
        return {k: 0 for k in data.keys()}
    return {k: round((float(v) / float(total) * 100), 2) for k, v in data.items()}

def calc_conversion_rate_boa(converted, total):
    """Calculate conversion rate"""
    if total == 0:
        return "0.00%"
    rate = (float(converted) / float(total)) * 100
    return "{:.2f}%".format(rate)

def compute_boa_funnels_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        duration = get_duration(chunk_from, chunk_to)
        funnel_queries = {
            key: build_query(tmpl, duration, tenant_id)
            for key, tmpl in BOA_QUERY_TEMPLATES.items()
        }
        chunk_results = execute_parallel_queries(
            funnel_queries, chunk_from, chunk_to
        )

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

def compute_boa_error_analysis_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        duration = get_duration(chunk_from, chunk_to)
        funnel_queries = {
            key: build_query(tmpl, duration, tenant_id)
            for key, tmpl in BOA_ERROR_QUERIES.items()
        }
        chunk_results = execute_parallel_queries(
            funnel_queries, chunk_from, chunk_to
        )

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

def compute_boa_service_health_data(tenant_id, from_dt, to_dt):
    """Compute service health metrics for Bank of Anthos"""
    from .views import AppListViewSet
    viewset = AppListViewSet()
    chunks = viewset._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {}
        for key, tmpl in BOA_HEALTH_QUERIES.items():
            queries[key] = build_query_chunks_boa(tmpl, tenant_id)
        
        chunk_results = execute_throttled_queries_boa(queries, chunk_from, chunk_to, tenant_id, batch_size=2)

        for key, val in chunk_results.items():
            if key in aggregated_results:
                aggregated_results[key] = aggregated_results[key] + val
            else:
                aggregated_results[key] = val

    return aggregated_results

def compute_boa_daily_active_users_data(tenant_id, from_dt, to_dt):
    """Compute daily active users for Bank of Anthos"""
    grouping, slots = get_grouping_and_slots_boa(from_dt, to_dt)
    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        return label, query_loki_unique_users_boa(slot_start, slot_end, tenant_id)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for label, s, e in slots:
            future = executor.submit(fetch_slot, label, s, e)
            futures[future] = label
        
        for future in as_completed(futures):
            try:
                label, count = future.result(timeout=60)
                results_map[label] = count
            except Exception as ex:
                label = futures[future]
                logger.error("[BOA Slot] {} failed: {}".format(label, str(ex)))
                results_map[label] = 0

    active_users = []
    for label, _, _ in slots:
        active_users.append({
            "total": results_map.get(label, 0),
            "range": label
        })
    
    return {"active_users": active_users, "grouping": grouping}


def get_duration_for_chunk(chunk_from, chunk_to):
    """
    Calculate duration string for a specific chunk
    This should be the length of the chunk, not the total query range
    Python 2 compatible
    """
    delta = chunk_to - chunk_from
    total_seconds = int(delta.total_seconds())
    
    # Cap at 30 days (Loki limit)
    if total_seconds > 30 * 24 * 3600:
        total_seconds = 30 * 24 * 3600
    
    if total_seconds < 60:
        return "{}s".format(total_seconds)
    elif total_seconds < 3600:
        return "{}m".format(total_seconds // 60)
    elif total_seconds < 86400:
        return "{}h".format(total_seconds // 3600)
    else:
        days = total_seconds // 86400
        return "{}d".format(days)


def build_query_chunks_boa_with_duration(template, tenant_id, duration):
    """
    Build query with tenant_id and actual duration - Python 2 compatible
    """
    if not template or not template.strip():
        return template
    
    # First replace __WIN__ with duration
    query = template.replace("__WIN__", duration)
    
    # Replace {job="xxx" with {job="xxx", tenant_id="yyy"
    # Find the job pattern and add tenant_id
    import re
    # This pattern matches {job="something"
    query = re.sub(r'\{job="([^"]+)"', '{{job="\\1", tenant_id="{}"'.format(tenant_id), query)
    
    return query


def compute_boa_user_journey_data(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        duration = get_duration(chunk_from, chunk_to)
        funnel_queries = {
            key: build_query(tmpl, duration, tenant_id)
            for key, tmpl in BOA_USER_ACTIVITY_QUERIES.items()
        }
        chunk_results = execute_parallel_queries(
            funnel_queries, chunk_from, chunk_to
        )

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results

def calc_failure_rate(failed_count, total_count):
    """Calculate failure rate percentage - Python 2 compatible"""
    if total_count == 0:
        return "0.00%"
    rate = (float(failed_count) / float(total_count)) * 100
    return "{:.2f}%".format(rate)

def compute_boa_signup_failure_rate_data(tenant_id, from_dt, to_dt):
    """
    Compute signup failure rate for Bank of Anthos
    Matches compute_conversion_rate_data pattern exactly
    Python 2 compatible
    """
    grouping = get_grouping(from_dt, to_dt)
    slots = build_slots(from_dt, to_dt, grouping)
    total_query = build_query_chunks(BOA_TOTAL_SIGNUP_QUERY, tenant_id)
    failed_query = build_query_chunks(BOA_FAILED_SIGNUP_QUERY, tenant_id)

    results_map = {}

    def fetch_slot(label, slot_start, slot_end):
        total_count = query_loki_slot_key_val(total_query, slot_start, slot_end)
        failed_count = query_loki_slot_key_val(failed_query, slot_start, slot_end)
        return label, calc_failure_rate(failed_count, total_count)

    from concurrent.futures import ThreadPoolExecutor, as_completed
    with ThreadPoolExecutor(max_workers=3) as executor:
        futures = {}
        for label, s, e in slots:
            future = executor.submit(fetch_slot, label, s, e)
            futures[future] = label
        
        for future in as_completed(futures):
            try:
                label, rate = future.result(timeout=60)
                results_map[label] = rate
            except Exception as ex:
                label = futures[future]
                logger.error("[BOA Slot] {} failed: {}".format(label, str(ex)))
                results_map[label] = "0.00%"

    return results_map

def compute_boa_success_rates_data(tenant_id, from_dt, to_dt):
    """
    Compute ONLY success rates for Bank of Anthos
    Accumulates raw counts first, then calculates percentages
    Returns all success rates in one dictionary
    Python 2 compatible
    """
    from .views import AppListViewSet
    viewset = AppListViewSet()
    chunks = viewset._validate_and_chunk_date_range(from_dt, to_dt)
    
    # Accumulate raw counts
    raw_counts = {
        "login_success": 0,
        "login_attempts": 0,
        "signup_success": 0,
        "signup_attempts": 0,
        "payment_success": 0,
        "payment_attempts": 0,
        "balance_success": 0,
        "balance_attempts": 0,
        "transaction_success": 0,
        "transaction_failed": 0
    }
    
    for chunk_from, chunk_to in chunks:
        # Build raw count queries
        login_success_query = build_query_chunks('sum(count_over_time({job="anthos-userservice"} |~ "Login Successful"[__WIN__]))', tenant_id)
        login_attempts_query = build_query_chunks('sum(count_over_time({job="anthos-frontend"} |~ "Logging in"[__WIN__]))', tenant_id)
        
        signup_success_query = build_query_chunks('sum(count_over_time({job="anthos-userservice"} |~ "Creating new user" !~ "database failure"[__WIN__]))', tenant_id)
        signup_attempts_query = build_query_chunks('sum(count_over_time({job="anthos-frontend"} |~ "Creating new user"[__WIN__]))', tenant_id)
        
        payment_success_query = build_query_chunks('sum(count_over_time({job="anthos-transactionhistory"} |~ "Completed 200 OK"[__WIN__]))', tenant_id)
        payment_attempts_query = build_query_chunks('sum(count_over_time({job="anthos-frontend"} |~ "Submitting transaction"[__WIN__]))', tenant_id)
        
        balance_success_query = build_query_chunks('sum(count_over_time({job="anthos-balancereader"} |~ "Completed 200 OK"[__WIN__]))', tenant_id)
        balance_attempts_query = build_query_chunks('sum(count_over_time({job="anthos-balancereader"} |~ "GET.*balances"[__WIN__]))', tenant_id)
        
        transaction_failed_query = build_query_chunks('sum(count_over_time({job="anthos-frontend"} |~ "Error submitting payment"[__WIN__]))', tenant_id)
        
        # Execute queries for this chunk (you need to implement these functions)
        login_success = query_loki_slot_key_val(login_success_query, chunk_from, chunk_to)
        login_attempts = query_loki_slot_key_val(login_attempts_query, chunk_from, chunk_to)
        
        signup_success = query_loki_slot_key_val(signup_success_query, chunk_from, chunk_to)
        signup_attempts = query_loki_slot_key_val(signup_attempts_query, chunk_from, chunk_to)
        
        payment_success = query_loki_slot_key_val(payment_success_query, chunk_from, chunk_to)
        payment_attempts = query_loki_slot_key_val(payment_attempts_query, chunk_from, chunk_to)
        
        balance_success = query_loki_slot_key_val(balance_success_query, chunk_from, chunk_to)
        balance_attempts = query_loki_slot_key_val(balance_attempts_query, chunk_from, chunk_to)
        
        transaction_failed = query_loki_slot_key_val(transaction_failed_query, chunk_from, chunk_to)
        
        # Accumulate raw counts
        raw_counts["login_success"] = raw_counts["login_success"] + login_success
        raw_counts["login_attempts"] = raw_counts["login_attempts"] + login_attempts
        raw_counts["signup_success"] = raw_counts["signup_success"] + signup_success
        raw_counts["signup_attempts"] = raw_counts["signup_attempts"] + signup_attempts
        raw_counts["payment_success"] = raw_counts["payment_success"] + payment_success
        raw_counts["payment_attempts"] = raw_counts["payment_attempts"] + payment_attempts
        raw_counts["balance_success"] = raw_counts["balance_success"] + balance_success
        raw_counts["balance_attempts"] = raw_counts["balance_attempts"] + balance_attempts
        raw_counts["transaction_success"] = raw_counts["transaction_success"] + payment_success
        raw_counts["transaction_failed"] = raw_counts["transaction_failed"] + transaction_failed
    
    # Calculate all success rates from accumulated raw counts
    results = {}
    
    # Login success rate
    if raw_counts["login_attempts"] > 0:
        results["login_success_rate"] = round((float(raw_counts["login_success"]) / float(raw_counts["login_attempts"])) * 100, 2)
    else:
        results["login_success_rate"] = 0.0
    
    # Signup success rate
    if raw_counts["signup_attempts"] > 0:
        results["signup_success_rate"] = round((float(raw_counts["signup_success"]) / float(raw_counts["signup_attempts"])) * 100, 2)
    else:
        results["signup_success_rate"] = 0.0
    
    # Payment success rate
    if raw_counts["payment_attempts"] > 0:
        results["payment_success_rate"] = round((float(raw_counts["payment_success"]) / float(raw_counts["payment_attempts"])) * 100, 2)
    else:
        results["payment_success_rate"] = 0.0
    
    # Balance success rate
    if raw_counts["balance_attempts"] > 0:
        results["balance_success_rate"] = round((float(raw_counts["balance_success"]) / float(raw_counts["balance_attempts"])) * 100, 2)
    else:
        results["balance_success_rate"] = 0.0
    
    # Transaction success rate
    total_transactions = raw_counts["transaction_success"] + raw_counts["transaction_failed"]
    if total_transactions > 0:
        results["transaction_success_rate"] = round((float(raw_counts["transaction_success"]) / float(total_transactions)) * 100, 2)
    else:
        results["transaction_success_rate"] = 0.0
    
    return results

def get_chunk_duration(chunk_from, chunk_to):
    """
    Calculate the exact duration for a chunk
    This should be the actual length of the chunk, not the total range
    Python 2 compatible
    """
    delta = chunk_to - chunk_from
    total_seconds = int(delta.total_seconds())
    
    # For 7-day chunk, this should return 604800 seconds -> 7d
    # For 1-day chunk, this should return 86400 seconds -> 24h
    
    if total_seconds <= 3600:  # 1 hour
        return "1h"
    elif total_seconds <= 86400:  # 1 day
        return "24h"
    elif total_seconds <= 604800:  # 7 days
        return "7d"
    elif total_seconds <= 2592000:  # 30 days
        return "30d"
    else:
        return "30d"

def get_chunk_duration_hours(chunk_from, chunk_to):
    """
    Calculate duration in hours for a chunk
    Python 2 compatible
    """
    delta = chunk_to - chunk_from
    total_seconds = int(delta.total_seconds())
    hours = total_seconds // 3600
    
    # Ensure minimum 1 hour
    if hours < 1:
        hours = 1
    
    return hours


def compute_boa_traffic_distribution_percentages(tenant_id, from_dt, to_dt):
    from .views import AppListViewSet
    chunks = AppListViewSet()._validate_and_chunk_date_range(from_dt, to_dt)
    aggregated_results = {}

    for chunk_from, chunk_to in chunks:
        queries = {
            key: build_query_chunks(tmpl, tenant_id)
            for key, tmpl in BOA_TRAFFIC_QUERIES.items()
        }
        chunk_results = execute_throttled_queries(queries, chunk_from, chunk_to, batch_size=2)

        for key, val in chunk_results.items():
            aggregated_results[key] = aggregated_results.get(key, 0) + val

    return aggregated_results