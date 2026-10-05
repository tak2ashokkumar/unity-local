from celery import shared_task
from django.utils.module_loading import import_string

from app.organization.models import Organization
from app.user2.models import User
from .models import ParentApp, MonitoredApp, APMTopology, TopologyCache, Log, Metric, Trace
from .utils import merge_topology_data, merge_across_apps, serialize_uuids
from uldb.celery_dynamic_conditions import task_config
from rest_framework.test import APIRequestFactory
from aiops.models import Event
import uuid as uuid_lib
from django.contrib.auth import get_user_model
from .models import ImpactAnalysisCache
from utils import apm_node_status_update
from constants import SEVERITY_MAPPING, STATUS_MAPPING
from integ.zabbix.models import ZabbixCustomer
from integ.zabbix.zabbix_backend_models import ZabbixItems, ZabbixHosts
from django.utils import timezone

import logging
logger = logging.getLogger(__name__)


APP_QUEUE = ['veryfast']
APP_AUTOSCALE = {
    'veryfast': '16,1',
}

@task_config(speed='veryfast')
@shared_task
def build_topology_data_task(user_id, app_id, layer="service", only_summary=False):
    """
    Celery task to build topology data in background.
    """
    from .serializers import APMTopologySerializer
    import logging
    
    logger = logging.getLogger(__name__)
    result = []
    
    try:
        user = User.objects.get(id=user_id)
        app = ParentApp.objects.filter(id=app_id, customer=user.org).first()
        
        if not app:
            logger.error("ParentApp not found for id: %s", app_id)
            return {}, layer
            
        app_data = {"app_name": app.name, layer: []}
        monitored_apps = MonitoredApp.objects.filter(parent_app=app, customer=user.org)
        logger.info('Monitored apps: %s', monitored_apps)
        
        for monitored in monitored_apps:
            service_app = MonitoredApp.objects.filter(name=monitored.name).last()
            latest_topology = APMTopology.objects.filter(app=monitored).last()
            alert_count = Event.objects.filter(application=monitored).count()
            logger.info('Latest topology exists: %s', latest_topology is not None)
            
            if not latest_topology or not latest_topology.topology_data:
                continue
                
            serializer = APMTopologySerializer(latest_topology, context={"user": user})
            topology_data = serializer.data.get("topology_data", None)
            
            if not topology_data:
                continue

            nodes = topology_data.get("nodes", [])
            links = topology_data.get("links", [])

            # Define layers to include based on requested layer
            include_layers = {
                "service": ("application", "service"),
                "component": ("service", "component"),
                "process": ("component", "process"),
                "database": ("process", "database"),
                "host": ("host/infrastructure",),
                "physical_layer": ("Cloud", "Data Center"),
            }.get(layer, ("application", "service"))

            filtered_nodes = []
            
            for n in nodes:
                if n.get("layer") in include_layers:
                    # Start with base node data
                    node_data = {
                        "name": n.get("name"),
                        "uuid": n.get("uuid"),
                        "icon": n.get("icon"),
                        "layer": n.get("layer"),
                        "type": n.get("type"),
                        "metadata": n.get("metadata", {}),
                        "monitored_id": str(monitored.uuid) if monitored.uuid else None,
                        "device_type": n.get("device_type"),
                        "alert_count": alert_count,
                        "app_id": app_id,
                    }
                    
                    # Apply status mapping logic for matching node
                    if n.get("name") == monitored.name:
                        try:
                            zabbix_customer = ZabbixCustomer.objects.filter(customer=user.org)
                            if zabbix_customer.exists():
                                zabbix_db_ip = zabbix_customer.first().zabbix_instance.ip_address
                            else:
                                zabbix_db_ip = None
                                
                            if zabbix_db_ip and service_app and service_app.device:
                                host_name = service_app.device.name + "-" + user.org.name
                                zabbix_host = ZabbixHosts.objects.using(zabbix_db_ip).filter(host=host_name).first()
                                
                                if not zabbix_host:
                                    logger.error("No Zabbix host found for app %s", app.name)
                                else:
                                    # Check if this is a service node
                                    if n.get("type") == "service":
                                        service_name = n.get("name")
                                        if service_name:
                                            # Construct Zabbix key dynamically
                                            key_pattern = 'docker.container_info.state.running["/{}"]'.format(service_name)
                                            
                                            # Find matching Zabbix Item
                                            container_item = ZabbixItems.objects.using(zabbix_db_ip).filter(
                                                host_id=zabbix_host.host_id,
                                                key=key_pattern
                                            ).first()
                                            
                                            if not container_item:
                                                logger.error("No Zabbix item found for service: %s", service_name)
                                            else:
                                                history_model = container_item.history_obj
                                                if history_model:
                                                    # Get latest value from Zabbix history
                                                    latest_entry = (
                                                        history_model.objects.using(zabbix_db_ip)
                                                        .filter(item=container_item)
                                                        .order_by("-clock")
                                                        .first()
                                                    )
                                                    if latest_entry:
                                                        running_state = int(latest_entry.value)
                                                        node_data["status"] = running_state
                                                        if "metadata" not in node_data:
                                                            node_data["metadata"] = {}
                                                        node_data["metadata"]["Status"] = running_state
                                                    else:
                                                        logger.warning("No Zabbix history for %s", service_name)
                                        else:
                                            node_data["status"] = n.get("status")
                                    else:
                                        node_data["status"] = n.get("status")
                            else:
                                node_data["status"] = n.get("status")
                        except Exception as e:
                            logger.error("Error updating topology status from Zabbix: %s", str(e))
                            node_data["status"] = n.get("status")
                    else:
                        # Keep original status for other nodes
                        node_data["status"] = n.get("status")
                    
                    filtered_nodes.append(node_data)
                    
            logger.info("Filtered nodes count: %s", len(filtered_nodes))
            
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
        data = serialize_uuids(merged)
        
        TopologyCache.objects.update_or_create(
            customer=user.org,
            app=app,
            layer=layer,
            defaults={"data": data},
        )

        return merged, layer
        
    except User.DoesNotExist:
        logger.error("User not found: %s", user_id)
        return {}, layer
    except Exception as e:
        logger.error("Unexpected error in build_topology_data_task: %s", str(e))
        return {}, layer


@task_config(speed='veryfast')
@shared_task
def topology_data_task(user_id, app_id):
    for service in ['service','component', 'process', 'database','host', 'physical_layer']:
        build_topology_data_task.delay(user_id, app_id, layer=service, only_summary=False)
        
@task_config(speed='veryfast')
@shared_task
@task_config(speed='veryfast')
@shared_task
def impact_analysis_task(user_id, app_id):
    from .serializers import APMTopologySerializer
    """
    Celery task to perform impact analysis by merging topology data from monitored apps.
    """
    import uuid as uuid_lib
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    SEVERITY_MAPPING = {
        3: 0,
        2: -1,
        1: 1,
    }
    STATUS_MAPPING = {
        0: "Critical",
        -1: "Unknown",
        1: "Healthy",
    }

    try:
        user = User.objects.get(id=user_id)
        parent_app = ParentApp.objects.get(id=app_id, customer=user.org)
    except User.DoesNotExist:
        return {"error": "User not found"}, 404
    except ParentApp.DoesNotExist:
        return {"error": "ParentApp with given id not found for this organization."}, 404

    monitored_apps = MonitoredApp.objects.filter(parent_app=parent_app)
    if not monitored_apps.exists():
        return {"error": "No monitored apps found."}, 404

    merged_nodes = {}
    uuid_map = {}
    merged_links = set()

    for app in monitored_apps:
        topology_instance = APMTopology.objects.filter(app=app).last()
        if not topology_instance or not topology_instance.topology_data:
            continue

        serializer = APMTopologySerializer(topology_instance, context={"user": user})
        topology_data = serializer.data.get("topology_data", None)
        
        if not topology_data:
            continue
            
        nodes = topology_data.get("nodes", [])
        
        # Process Zabbix updates for service nodes (if available)
        if app:
            try:
                zabbix_customer = ZabbixCustomer.objects.filter(customer=user.org)
                if zabbix_customer.exists():
                    zabbix_db_ip = zabbix_customer.first().zabbix_instance.ip_address
                else:
                    zabbix_db_ip = None
                    
                if zabbix_db_ip:
                    host_name = app.device.name + "-" + user.org.name
                    zabbix_host = ZabbixHosts.objects.using(zabbix_db_ip).filter(host=host_name).first()
                    
                    if not zabbix_host:
                        logger.error("No Zabbix host found for app {}".format(app.name))
                    else:
                        # Iterate through service nodes to update status from Zabbix
                        for node in nodes:
                            if node.get("type") != "service":
                                continue

                            service_name = node.get("name")
                            if not service_name:
                                continue

                            # Construct Zabbix key dynamically
                            key_pattern = 'docker.container_info.state.running["/{}"]'.format(service_name)

                            # Find matching Zabbix Item
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

                            # Get latest value from Zabbix history
                            latest_entry = (
                                history_model.objects.using(zabbix_db_ip).filter(item=container_item)
                                .order_by("-clock")
                                .first()
                            )
                            
                            if latest_entry:
                                running_state = int(latest_entry.value)
                                node["status"] = running_state
                                if "metadata" not in node:
                                    node["metadata"] = {}
                                node["metadata"]["Status"] = running_state
                            else:
                                logger.warning("No Zabbix history for {}".format(service_name))
                                
            except Exception as e:
                logger.error("Error updating topology status from Zabbix: {}".format(str(e)))
        
        # Merge nodes (for ALL nodes, not just services)
        for node in nodes:
            node_uuid = node.get("uuid")
            node_name = node.get("name") or node_uuid
            layer = node.get("layer", "unknown")
            key = '%s:%s' % (layer, node_name)
            
            if key not in merged_nodes:
                new_uuid = str(uuid_lib.uuid4())
                node["uuid"] = new_uuid
                merged_nodes[key] = node
                uuid_map[node_uuid] = new_uuid
            else:
                existing_meta = merged_nodes[key].get("metadata", {})
                new_meta = node.get("metadata", {})
                # Safe metadata merge
                if isinstance(existing_meta, dict) and isinstance(new_meta, dict):
                    existing_meta.update(new_meta)
                merged_nodes[key]["metadata"] = existing_meta
                uuid_map[node_uuid] = merged_nodes[key]["uuid"]

        # Process links (MOVED OUTSIDE Zabbix block to ensure links are always processed)
        for link in topology_data.get("links", []):
            src = link.get("source_uuid")
            tgt = link.get("target_uuid")

            new_src = uuid_map.get(src)
            new_tgt = uuid_map.get(tgt)

            if new_src and new_tgt:
                merged_links.add((new_src, new_tgt))

    final_nodes = list(merged_nodes.values())
    final_links = [{"source": s, "target": t} for s, t in merged_links]

    if not final_nodes:
        return {"message": "No valid topology data found to merge."}, 204

    final_topology = {
        "nodes": final_nodes,
        "links": final_links
    }
    
    # Cache the result
    ImpactAnalysisCache.objects.update_or_create(
        customer=user.org,
        app=parent_app,
        defaults={"data": final_topology},
    )

    return final_topology, 200

from celery import shared_task
from datetime import datetime, timedelta
from django.core.cache import cache

# preload_dashboard_cache runs every 30 minutes (see uldb/unity_celery.py), so
# the TTL only has to outlive one run for the keys to stay continuously warm.
DASHBOARD_CACHE_TTL = 2700
# Empty payloads are cached briefly so the next run retries them instead of
# leaving the endpoint answering 503 for a full TTL.
DASHBOARD_CACHE_EMPTY_TTL = 300


def _is_all_zero_payload(data):
    """
    True only if every numeric leaf in data is 0 and at least one numeric
    leaf was found. execute_parallel_queries/execute_throttled_queries
    silently map a per-query exception to 0, so a widget can come back as a
    truthy dict/list that's entirely zeros purely because its queries failed
    - not because the real value is 0. Non-numeric leaves (labels, dates,
    None) are ignored rather than counted against "all zero".
    """
    found_number = [False]

    def walk(node):
        if isinstance(node, dict):
            return all(walk(v) for v in node.values())
        if isinstance(node, (list, tuple)):
            return all(walk(v) for v in node)
        if isinstance(node, bool):
            return True
        if isinstance(node, (int, float)):
            found_number[0] = True
            return node == 0
        return True

    return walk(data) and found_number[0]


@task_config(speed='veryfast')
@shared_task
def preload_dashboard_cache():
    from .utils import (
        compute_funnels_data,
        compute_returning_customers_data,
        compute_new_customers_monthly_data,
        compute_new_vs_returning_data,
        compute_checkout_abandon_data,
        compute_conversion_rate_data,
        compute_orders_placed_data,
        compute_top_categories_data,
        compute_traffic_source_data,
        compute_revenue_category_data,
        compute_revenue_traffic_data,
        compute_boa_funnels_data,
        compute_boa_error_analysis_data,
        compute_boa_service_health_data,
        compute_boa_daily_active_users_data,
        compute_boa_user_journey_data,
        compute_boa_signup_failure_rate_data,
        compute_boa_success_rates_data,
        compute_boa_traffic_distribution_percentages

    )
    from apm.models import ParentApp
    from django.core.cache import cache
    
    try:
        # Get all unique customers (organizations) from ParentApp
        parent_apps = ParentApp.objects.select_related('customer').filter(
            customer__isnull=False
        ).distinct('customer')
        
        logger.info("[Task] Starting preload for {} organizations".format(parent_apps.count()))
        
        total_cached = 0
        total_failed = 0
        results_by_org = []
        
        for parent_app in parent_apps:
            org = parent_app.customer
            org_name = org.name if org.name else str(org.id)
            
            logger.info("[Task] Processing organization: {}".format(org_name))
            
            to_dt = datetime.utcnow()
            to_dt = to_dt.replace(hour=23, minute=59, second=59, microsecond=0)
            
            # Pre-cache for all supported ranges
            ranges = [1, 7, 30]  # days
            
            # Define all endpoints with their cache key prefixes and compute functions
            endpoints = [
                ("funnel_apm", compute_funnels_data),
                ("returning_customers", compute_returning_customers_data),
                ("new_customers_monthly", compute_new_customers_monthly_data),
                ("new_vs_returning", compute_new_vs_returning_data),
                ("checkout_abandon", compute_checkout_abandon_data),
                ("conversion_rate", compute_conversion_rate_data),
                ("orders_placed", compute_orders_placed_data),
                ("top_categories", compute_top_categories_data),
                ("traffic_source", compute_traffic_source_data),
                ("revenue_category", compute_revenue_category_data),
                ("revenue_traffic", compute_revenue_traffic_data),
                ("boa_funnels",compute_boa_funnels_data),
                ("boa_error_analysis",compute_boa_error_analysis_data),
                ("boa_service_health",compute_boa_service_health_data),
                ("boa_daily_active_users",compute_new_customers_monthly_data),
                ("boa_signup_failure_rate",compute_boa_signup_failure_rate_data),
                ("boa_success_rates",compute_boa_success_rates_data),
                ("boa_user_journey",compute_boa_user_journey_data),
                ("boa_traffic_percentages",compute_boa_traffic_distribution_percentages),       
            ]
            
            org_cached = 0
            org_failed = 0
            
            for days in ranges:
                from_dt = to_dt - timedelta(days=days)
                from_dt = from_dt.replace(hour=0, minute=0, second=0, microsecond=0)
                
                logger.info("[Task] Computing {}d data for organization {}".format(days, org_name))
                
                for cache_prefix, compute_fn in endpoints:
                    try:
                        cache_key = "{}_{}_{}_{}".format(
                            cache_prefix,
                            org_name,  # Use organization name instead of tenant_id
                            from_dt.strftime("%Y%m%d"),
                            to_dt.strftime("%Y%m%d")
                        )

                        # Recompute on every run instead of skipping live keys.
                        # Skipping never extended the TTL, so a key written at
                        # T died at T+DASHBOARD_CACHE_TTL while the run at T+30m
                        # left it untouched - every key spent the tail of its
                        # hour missing and the endpoints answered 503.
                        logger.info("[Task] Computing {} for {}d".format(cache_prefix, days))

                        # Compute fresh data for THIS specific range
                        # Pass org_name as the identifier to compute functions
                        data = compute_fn(org_name, from_dt, to_dt)

                        if data is None:
                            logger.warning("[Task] {} returned None for {}d".format(cache_prefix, days))
                            org_failed += 1
                        elif not data:
                            # Don't clobber a still-good previous payload with
                            # this run's empty result - the UI would read that
                            # as "data reset to 0" mid-refresh. Keep serving
                            # the last good value (refreshing its TTL) until a
                            # run actually finds new data; only write the
                            # short-lived empty marker if we've never had data.
                            existing = cache.get(cache_key)
                            if existing:
                                cache.set(cache_key, existing, DASHBOARD_CACHE_TTL)
                                logger.warning(
                                    "[Task] {} returned an empty payload for {}d - keeping previous cached data: {}".format(
                                        cache_prefix, days, cache_key
                                    )
                                )
                            else:
                                cache.set(cache_key, data, DASHBOARD_CACHE_EMPTY_TTL)
                                logger.warning(
                                    "[Task] {} returned an empty payload for {}d - cached for {}s: {}".format(
                                        cache_prefix, days, DASHBOARD_CACHE_EMPTY_TTL, cache_key
                                    )
                                )
                            org_cached += 1
                        elif _is_all_zero_payload(data):
                            # execute_parallel_queries/execute_throttled_queries
                            # silently turn a per-query exception into 0, so an
                            # all-zero payload here is more likely "the queries
                            # failed" than "the real value is 0". Don't clobber
                            # a still-good previous payload with it.
                            existing = cache.get(cache_key)
                            if existing:
                                cache.set(cache_key, existing, DASHBOARD_CACHE_TTL)
                                logger.warning(
                                    "[Task] {} returned an all-zero payload for {}d - keeping previous cached data: {}".format(
                                        cache_prefix, days, cache_key
                                    )
                                )
                            else:
                                cache.set(cache_key, data, DASHBOARD_CACHE_TTL)
                                logger.info(
                                    "[Task] Cached {} for {}d (all-zero, no prior data): {}".format(
                                        cache_prefix, days, cache_key
                                    )
                                )
                            org_cached += 1
                        else:
                            # Cache the data
                            cache.set(cache_key, data, DASHBOARD_CACHE_TTL)
                            org_cached += 1
                            logger.info("[Task] Cached {} for {}d: {}".format(cache_prefix, days, cache_key))

                    except Exception as e:
                        logger.error("[Task] Failed to compute {} for {}d: {}".format(cache_prefix, days, str(e)))
                        org_failed += 1
                        # Continue with next endpoint even if one fails
                        continue
            
            results_by_org.append({
                "organization": org_name,
                "cached": org_cached,
                "failed": org_failed
            })
            total_cached += org_cached
            total_failed += org_failed
            
            logger.info("[Task] Completed for organization {}: {} cached, {} failed".format(
                org_name, org_cached, org_failed
            ))
        
        logger.info("[Task] Overall completed: {} total cached, {} total failed across {} organizations".format(
            total_cached, total_failed, len(parent_apps)
        ))
        
        return {
            "status": "SUCCESS",
            "total_cached": total_cached,
            "total_failed": total_failed,
            "organizations_processed": len(parent_apps),
            "details": results_by_org
        }
        
    except Exception as e:
        logger.error("[Task] Preload cache failed: {}".format(str(e)))
        raise

@task_config(speed='veryfast')
@shared_task
def delete_old_apm_data_for_all_customers(days=30):
    """
    Delete all logs, traces, and metrics older than specified days
    for all monitored apps belonging to customers with parent_app = null
    
    Runs daily at 2 AM
    """
    try:
        cutoff_date = timezone.now() - timedelta(days=days)
        
        # Get all customers (organizations) that have parent_app = null
        # Using select_related to prefetch customer data
        parent_apps = ParentApp.objects.select_related('customer').filter(
            customer__isnull=False
        )
        
        total_stats = {
            'customers_processed': 0,
            'apps_processed': 0,
            'logs_deleted': 0,
            'traces_deleted': 0,
            'metrics_deleted': 0,
            'total_deleted': 0,
            'errors': []
        }
        
        logger.info("[Retention] Starting cleanup for {} customers with data older than {} days".format(
            parent_apps.count(), days))
        
        for parent_app in parent_apps:
            org = parent_app.customer
            org_name = org.name if org.name else str(org.id)
            
            logger.info("[Retention] Processing customer: {}".format(org_name))
            
            try:
                # Get all monitored apps for this customer
                # This gets apps where parent_app is this specific ParentApp
                monitored_apps = MonitoredApp.objects.filter(
                    parent_app=parent_app,customer=org
                )
                if not monitored_apps.exists():
                    logger.info("[Retention] No monitored apps found for customer {}".format(org_name))
                    continue
                
                logger.info("[Retention] Found {} monitored apps for customer {}".format(
                    monitored_apps.count(), org_name))
                
                org_stats = {
                    'apps_processed': 0,
                    'logs_deleted': 0,
                    'traces_deleted': 0,
                    'metrics_deleted': 0
                }
                
                # Process each monitored app for this customer
                for app in monitored_apps:
                    try:
                        # import pdb;pdb.set_trace()
                        # Delete old logs for this app
                        logs_deleted, _ = Log.objects.filter(
                            app=app,
                            timestamp__lt=cutoff_date
                        ).delete()
                        
                        # Delete old traces for this app
                        traces_deleted, _ = Trace.objects.filter(
                            app=app,
                            start_time__lt=cutoff_date
                        ).delete()
                        
                        # Delete old metrics for this app
                        metrics_deleted, _ = Metric.objects.filter(
                            app=app,
                            timestamp__lt=cutoff_date
                        ).delete()
                        
                        org_stats['apps_processed'] += 1
                        org_stats['logs_deleted'] += logs_deleted
                        org_stats['traces_deleted'] += traces_deleted
                        org_stats['metrics_deleted'] += metrics_deleted
                        
                        if logs_deleted > 0 or traces_deleted > 0 or metrics_deleted > 0:
                            logger.info(
                                "[Retention] App '{}' (ID: {}): "
                                "Deleted {} logs, {} traces, {} metrics".format(
                                    app.name, app.id, logs_deleted, traces_deleted, metrics_deleted)
                            )
                        
                    except Exception as e:
                        error_msg = "Failed to process app {} (ID: {}): {}".format(
                            app.name, app.id, str(e))
                        logger.error("[Retention] {}".format(error_msg))
                        total_stats['errors'].append({
                            'customer': org_name,
                            'app': app.name,
                            'app_id': app.id,
                            'error': str(e)
                        })
                        continue
                
                # Update total stats
                total_stats['customers_processed'] += 1
                total_stats['apps_processed'] += org_stats['apps_processed']
                total_stats['logs_deleted'] += org_stats['logs_deleted']
                total_stats['traces_deleted'] += org_stats['traces_deleted']
                total_stats['metrics_deleted'] += org_stats['metrics_deleted']
                
                logger.info(
                    "[Retention] Completed for customer {}: "
                    "Processed {} apps, "
                    "Deleted {} logs, "
                    "{} traces, "
                    "{} metrics".format(
                        org_name, org_stats['apps_processed'], 
                        org_stats['logs_deleted'], org_stats['traces_deleted'], 
                        org_stats['metrics_deleted'])
                )
                
            except Exception as e:
                error_msg = "Failed to process customer {}: {}".format(org_name, str(e))
                logger.error("[Retention] {}".format(error_msg))
                total_stats['errors'].append({
                    'customer': org_name,
                    'error': str(e)
                })
                continue
        
        # Calculate total deleted
        total_stats['total_deleted'] = (
            total_stats['logs_deleted'] + 
            total_stats['traces_deleted'] + 
            total_stats['metrics_deleted']
        )
        
        # Log final summary
        logger.info(
            "[Retention] Cleanup completed: "
            "Processed {} customers, "
            "{} apps, "
            "Deleted {} total records "
            "({} logs, "
            "{} traces, "
            "{} metrics)".format(
                total_stats['customers_processed'],
                total_stats['apps_processed'],
                total_stats['total_deleted'],
                total_stats['logs_deleted'],
                total_stats['traces_deleted'],
                total_stats['metrics_deleted'])
        )
        
        if total_stats['errors']:
            logger.warning("[Retention] Encountered {} errors during cleanup".format(len(total_stats['errors'])))
        
        return {
            'status': 'SUCCESS',
            'days_retained': days,
            'cutoff_date': cutoff_date.isoformat(),
            'statistics': total_stats
        }
        
    except Exception as e:
        logger.error("[Retention] Critical failure: {}".format(str(e)))
        return {
            'status': 'ERROR',
            'error': str(e),
            'days_retained': days
        }

