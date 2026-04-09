from concurrent.futures import ThreadPoolExecutor, as_completed
from django.db import connections

import logging

logger = logging.getLogger(__name__)


def close_connections(*args, **kwargs):
    for connection in connections.all():
        connection.close_if_unusable_or_obsolete()


class UldbThreadPoolExecutor(ThreadPoolExecutor):
    def submit(self, *args, **kwargs):
        f = super(UldbThreadPoolExecutor, self).submit(*args, **kwargs)
        f.add_done_callback(close_connections)
        return f


class DeviceHandler(object):

    def __init__(self, devices):
        self.devices = devices
        workers = min(len(self.devices), 25) or 2
        self.pool = UldbThreadPoolExecutor(workers)

    def get_status_count(self):
        bare_metal_status_func = lambda dev: str(dev.server.watch.status) if dev.server.watch.status is not None else dev.running_status()

        status_func = lambda dev: str(dev.watch.status) if dev.watch.status is not None else dev.running_status()

        futures = [self.pool.submit(lambda dev=device: bare_metal_status_func(dev) if dev.DEVICE_TYPE == 'baremetal' else status_func(dev)) for device in self.devices]
        up, down, unknown, non_configured = 0, 0, 0, 0

        for record in as_completed(futures):
            result = str(record.result())
            if result == "1":
                up += 1
            elif result == "0":
                down += 1
            elif result == "-1":
                unknown += 1
            else:
                non_configured += 1

        return up, down, unknown, non_configured

    def get_device_status(self):
        def get_status(dev):
            if dev.DEVICE_TYPE == 'baremetal':
                if dev.server.watch.status is not None:
                    return str(dev.server.watch.status)
                return dev.running_status()
            else:
                if dev.watch.status is not None:
                    return str(dev.watch.status)
                return dev.running_status()

        futures = {
            self.pool.submit(get_status, device): device
            for device in self.devices
        }

        results = []
        for future in as_completed(futures):
            device = futures[future]
            try:
                status = str(future.result())
            except Exception:
                status = "unknown"

            if device.DEVICE_TYPE == 'baremetal':
                device_name = device.server.name if device.server else None
                ip_address = device.management_ip
            else:
                device_name = getattr(device, "name", None)
                ip_address = getattr(device, "ip_address", None)
            results.append({
            "device_name": device_name,
            "status": status,
            "ip_address": ip_address,
        })

        return results

    def get_alerts_count(self):
        futures = [self.pool.submit(device.monitoring_alerts, 'failed') for device in self.devices]
        logger.debug("threded alert count request ")
        alerts_count = 0
        for record in as_completed(futures):
            result = record.result()
            logger.debug("alerts %s", result)
            if result:
                alerts_count += len(record.result())
        return alerts_count

    def get_temperature_max(self):
        temp_values = []
        futures = [self.pool.submit(device.sensor_data) for device in self.devices]
        for record in as_completed(futures):
            result = record.result()
            if result:
                device_temps = []
                for temp_data in result.get('temperature', []):
                    for item in temp_data.itervalues():
                        device_temps.append(item['sensor_value'])
                max_temp = max(device_temps) if device_temps else 0
                temp_values.append(max_temp)

        return max(temp_values) if temp_values else 0

    def get_power_sum_in_kw(self):
        power_value = 0.0
        futures = [self.pool.submit(device.power_in_kw) for device in self.devices]
        for record in as_completed(futures):
            result = record.result()
            if result:
                power_value += result

        return round(power_value, 2)

    @staticmethod
    def get_temperature(sensor_data):
        if sensor_data:
            device_temps = []
            device_powers = []
            for temp_data in sensor_data.get('temperature', []):
                for item in temp_data.itervalues():
                    device_temps.append(item['sensor_value'])

            for power_data in sensor_data.get('power', []):
                for item in power_data.itervalues():
                    device_powers.append(item['sensor_value'])

            return max(device_temps) if device_temps else 0, max(device_powers) if device_powers else 0
