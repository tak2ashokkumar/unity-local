# -*- coding: utf-8 -*-
#
# Copyright (C) 2013-2018 UnitedLayer, LLC.
#   All Rights Reserved.

"""
utils.py
"""
from __future__ import absolute_import

import json
import time
from itertools import chain
from django.db.models import Sum, Q
from integ.ObserviumBackend.api import ObserviumAPI
from concurrent.futures import ThreadPoolExecutor, as_completed
from app.common.threads import DeviceHandler
from hubservice.hub import OrgHub, DataCenterHub, CabinetHub
import logging

logger = logging.getLogger(__name__)


class CabinetWidget(object):

    def __init__(self, cabinet, org, request_user):
        self.request_user = request_user
        self.cabinet = cabinet
        self.org = org
        self._fetch_devices()
        devices = self.get_monitorable_devices()
        self.device_haldler = DeviceHandler(devices)

    def _fetch_devices(self):
        self.firewalls = self.cabinet.firewalls.for_user(self.request_user).filter(customers=self.org)
        self.switches = self.cabinet.switches.for_user(self.request_user).filter(customers=self.org, is_unitedconnect=False)
        self.load_balancers = self.cabinet.load_balancers.for_user(self.request_user).filter(customers=self.org)
        self.storage_devices = self.cabinet.storage_devices.filter(customer=self.org)
        self.servers = self.cabinet.servers.filter(customer=self.org)
        self.custom_devices = self.cabinet.customdevice.filter(customers=self.org)
        self.panel_devices = self.cabinet.paneldevice_set.filter(customer=self.org)
        self.mac_devices = self.cabinet.mac_devices.filter(customer=self.org)
        self.pdus = self.cabinet.pdu_set.filter(customer=self.org)

    def get_monitorable_devices(self):
        return list(
            chain(
                self.switches, self.firewalls,
                self.load_balancers, self.servers,
                self.storage_devices, self.pdus,
                self.mac_devices
            )
        )

    def get_devices(self):
        return list(
            chain(
                self.switches, self.firewalls,
                self.load_balancers, self.servers,
                self.storage_devices, self.pdus,
                self.mac_devices, self.panel_devices,
                self.custom_devices
            )
        )

    def get_occupied_size(self):
        self.fw_count = self.firewalls.for_user(self.request_user).filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.sw_count = self.switches.for_user(self.request_user).filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.lb_count = self.load_balancers.for_user(self.request_user).filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.sd_count = self.storage_devices.filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.sv_count = self.servers.filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.cd_count = self.custom_devices.filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.pd_count = self.panel_devices.filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.pdu_count = self.pdus.filter(~Q(position__in=['A', 'B', 'C', 'D']), position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        self.md_count = self.mac_devices.filter(position__gt=0).aggregate(Sum('size')).get("size__sum", 0)
        total_count = (self.fw_count, self.sw_count, self.lb_count, self.sd_count, self.sv_count, self.pdu_count,
                       self.cd_count, self.pd_count, self.md_count)
        total = sum(x for x in total_count if x is not None)
        return total

    def get_total_devices(self):
        total_count = [self.firewalls.count(), self.switches.count(), self.load_balancers.count(),
                       self.storage_devices.count(), self.servers.count(), self.self.pdus.count(),
                       self.custom_devices.count(), self.panel_devices.count(), self.mac_devices.count()]
        total = sum(x for x in total_count if x is not None)
        return total

    def get_power_capacity(self):
        power_capacity = 0
        for p in self.pdus:
            if p.power_circuit:
                result = float(
                    float(p.power_circuit.ampstype.amps_type[:-1]) *
                    float(p.power_circuit.voltagetype.voltage_type[:-1])
                ) / 1000
                power_capacity += result
        if power_capacity:
            power_capacity = float("{:.2f}".format(power_capacity))
        return power_capacity

    def get_power_utilization(self):
        if self.org.monitoring_config.is_all_by_zabbix():
            data_center = self.cabinet.colocloud_set.all()
            if len(data_center):
                data_center = data_center[0]
                org_hub = OrgHub(self.request_user)
                dc_hub = DataCenterHub(org_hub, data_center, self.request_user)
                cabinet_hub = CabinetHub(dc_hub, self.cabinet, self.request_user)
                return cabinet_hub.sustainability.get_co2_emission_summary()['power_consumed']
            else:
                return 0.0
        else:
            # Temporary fix to fetch power of pdu as cabinet power.
            if self.pdus:
                pdu_device_haldler = DeviceHandler(self.pdus)
                return pdu_device_haldler.get_power_sum_in_kw()
            else:
                return 0.0

    def get_status_count(self):
        up, down, unknown, non_configured = self.device_haldler.get_status_count()
        return up, down, unknown, non_configured

    def get_alerts_count(self):
        return self.device_haldler.get_alerts_count()

    def get_temperature(self):
        return self.device_haldler.get_temperature_max()

    def get_pdu_stats(self):
        stats = []
        for p in self.pdus:
            pdu = {}
            pdu['name'] = p.name
            pdu['uuid'] = str(p.uuid)
            pdu['sockets'] = p.pdusocketmappings_set.count()
            pdu['status'] = int(p.status) if p.status else 2
            stats.append(pdu)
        return stats

    def get_co2_emission_value(self):
        if self.org.monitoring_config.is_all_by_zabbix():
            data_center = self.cabinet.colocloud_set.all()
            if data_center:
                data_center = data_center[0]
                org_hub = OrgHub(self.request_user)
                dc_hub = DataCenterHub(org_hub, data_center, self.request_user)
                cabinet_hub = CabinetHub(dc_hub, self.cabinet, self.request_user)
                return cabinet_hub.sustainability.get_co2_emission_for_year()
        else:
            return self.cabinet.get_co2_emission_value()


# todo : this should be removed after mac integartion with zabbix
class DatacenterWidgetData(object):
    """docstring for DatacenterWidgetData"""

    def cabinet_devices_count(self, obj):
        fw_count = obj.firewalls.filter(position__gt=0
                                        ).aggregate(Sum('size')).get("size__sum", 0)
        sw_count = obj.switches.filter(position__gt=0
                                       ).aggregate(Sum('size')).get("size__sum", 0)
        lb_count = obj.load_balancers.filter(position__gt=0
                                             ).aggregate(Sum('size')).get("size__sum", 0)
        sd_count = obj.storage_devices.filter(position__gt=0
                                              ).aggregate(Sum('size')).get("size__sum", 0)
        sv_count = obj.servers.filter(position__gt=0
                                      ).aggregate(Sum('size')).get("size__sum", 0)
        pdu_count = obj.pdu_set.filter(~Q(position__in=['A', 'B', 'C', 'D']), position__gt=0).aggregate(
            Sum('size')).get("size__sum", 0)
        cd_count = obj.customdevice_set.filter(position__gt=0
                                               ).aggregate(Sum('size')).get("size__sum", 0)
        pd_count = obj.paneldevice_set.filter(position__gt=0
                                              ).aggregate(Sum('size')).get("size__sum", 0)
        total_count = [fw_count, sw_count, lb_count, sd_count, sv_count,
                       pdu_count, cd_count, pd_count]
        postioned_on_cab = sum(x for x in total_count if x is not None)
        return postioned_on_cab

    def _get_up_down_count(self, api, device_id, up, down):
        data = api.device_data(device_id)
        if data:
            device_data = json.loads(data).get('device', {})
            device_status = int(device_data.get('status', 2)) if device_data else 2
            if device_status == 1:
                up.append(device_status)
            elif device_status == 0:
                down.append(device_status)
        return up, down

    def _get_failed_alerts(self, api, device_id, alr_count):
        failed_alerts = api.alert_data(device_id, 'failed')
        if failed_alerts:
            alr_count = int(json.loads(failed_alerts).get('count', 0)) if failed_alerts else 0
            # logger.debug("Failed Alerts : %s -- %s",v, alert_count)
            alr_count += alr_count
        return alr_count

    def _get_temp_power_max(self, api, device_id, temp, pwr):
        sensor_data = json.loads(api.sensor_data(device_id)).get('sensors', {})
        if sensor_data:
            device_temps = []
            device_powers = []
            for sensor in sensor_data.values():
                sensor_class = sensor.get('sensor_class', None)
                # logger.debug("Sensor Data ---> %s -- %s", sensor_class, sensor_value)
                if sensor_class == 'temperature':
                    temp_value = round(float(sensor.get('sensor_value', 0)), 1)
                    # logger.debug("temperature value : %s",temp_value)
                    device_temps.append(temp_value)
                if sensor_class == 'power':
                    power_value = round(float(sensor.get('sensor_value', 0)) / 1000, 1)
                    logger.debug("power value : %s", power_value)
                    device_powers.append(power_value)
                # logger.debug("Temp - %s --- Power - %s", device_temps, device_powers)
            temp.append(max(device_temps) if device_temps else 0)
            pwr.append(max(device_powers) if device_powers else 0)
        return temp, pwr

    def _get_pdu_status(self, api, device_id, pdu_stats):
        data = api.device_data(device_id)
        if data:
            device_data = json.loads(data).get('device', {})
            pdu_stats[device_id] = int(device_data.get('status', 2)) if device_data else 2
        return pdu_stats

    def pool_datcenter_widget_data(self, total_devices):
        start_time = time.time()
        alerts_count = 0
        up_devices = []
        down_devices = []
        temperature_values = []
        power_values = []
        pdu_statuses = {}

        num_devices = len(total_devices)
        workers_devices = num_devices if num_devices > 0 else 1
        total_workers = workers_devices if workers_devices < 100 else 100
        pool = ThreadPoolExecutor(total_workers)
        futures_up_down = []
        futures_alerts = []
        futures_temp_power = []
        futures_pdu_stats = []

        for obs_instance, device_id, dtype in total_devices:
            api = ObserviumAPI(obs_instance)
            futures_up_down.append(
                pool.submit(self._get_up_down_count, api,
                            device_id, up_devices, down_devices))

            futures_alerts.append(
                pool.submit(self._get_failed_alerts, api,
                            device_id, alerts_count))
            futures_temp_power.append(
                pool.submit(self._get_temp_power_max, api,
                            device_id, temperature_values, power_values))

            if dtype == 'pdu':
                futures_pdu_stats.append(
                    pool.submit(self._get_pdu_status, api,
                                device_id, pdu_statuses))

        for ud in as_completed(futures_up_down):
            up_devices, down_devices = ud.result()

        for al in as_completed(futures_alerts):
            alerts_count = al.result()

        for tp in as_completed(futures_temp_power):
            temperature_values, power_values = tp.result()

        for pd in as_completed(futures_pdu_stats):
            pdu_statuses = pd.result()

        up_count = len(up_devices)
        down_count = len(down_devices)
        total_alerts_count = alerts_count
        temp_max = max(temperature_values) if temperature_values else 0
        power_max = max(power_values) if power_values else 0

        end_time = time.time() - start_time
        logger.debug("Time taken by pool : %s", end_time)
        return up_count, down_count, total_alerts_count, temp_max, power_max, pdu_statuses
