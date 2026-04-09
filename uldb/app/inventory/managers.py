# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import re
from datetime import timedelta

from django.db import models
from django.utils import timezone

from app.rbac.managers import RBACManager, RBACQuerySetMixin
from django.contrib.contenttypes.models import ContentType


class DeviceBaseQuerySet(RBACQuerySetMixin):
    def delete(self):
        from unity_discovery.models import (
            DeviceInterfaceRemoteData, DeviceInterfaceMacAddress, DeviceIPAddress, DeviceOperatingSystem,
            DeviceProcessor, DeviceProductDetails, DeviceSoftwareServer, NetworkDeviceHardwareDetails,
            DeviceResourcePool, DeviceLogicalSystem, DeviceLocalFileSystem, DeviceHardwarePort
        )
        from app.inventory.models import StorageDevice
        device_ct = ContentType.objects.get_for_model(self.model)
        device_ids = list(self.values_list("id", flat=True))
        # Interfaces
        if_qs = DeviceInterfaceRemoteData.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        )
        if_qs.update(is_deleted=True)
        # Mac Addresses
        DeviceInterfaceMacAddress.all_objects.filter(
            content_type=ContentType.objects.get_for_model(DeviceInterfaceRemoteData),
            object_id__in=list(if_qs.values_list("id", flat=True))
        ).update(is_deleted=True)
        # IP Addresses
        DeviceIPAddress.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Operating Systems
        DeviceOperatingSystem.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Processors
        DeviceProcessor.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Products
        DeviceProductDetails.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Software Servers
        DeviceSoftwareServer.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Device Hardware Data
        NetworkDeviceHardwareDetails.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids,
            # name__iregex=r'power|psu'
        ).update(is_deleted=True)
        # Resource Pools
        DeviceResourcePool.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Logical Systems
        DeviceLogicalSystem.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Local File Systems
        DeviceLocalFileSystem.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        # Hardware Ports
        DeviceHardwarePort.all_objects.filter(
            content_type=device_ct,
            device_id__in=device_ids
        ).update(is_deleted=True)
        if self.model._meta.model == StorageDevice:
            from integ.ontap.models import Cluster, Node
            Cluster.all_objects.filter(
                cluster__id__in=device_ids
            ).update(is_deleted=True)
            Node.all_objects.filter(
                cluster__id__in=device_ids
            ).update(is_deleted=True)
        # Add more below if required
        return super(DeviceBaseQuerySet, self).update(is_deleted=True)

    def hard_delete(self):
        return super(DeviceBaseQuerySet, self).delete()

    def alive(self):
        return self.filter(is_deleted=False)

    def deleted(self):
        return self.filter(is_deleted=True)


class AllObjectsManager(models.Manager):
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db)
    

class ManufactureModelBaseManager(models.Manager):
    def get_or_create_by_names(self, names):
        names = set(names)
        name_id_map = {}
        for name in names:
            obj, created = self.get_or_create(name=name)
            name_id_map[name] = obj
        return name_id_map

    def get_by_names(self, names):
        names = set(names)
        name_id_map = {}
        for name in names:
            try:
                obj = self.get(name=name)
            except:
                pass
            else:
                name_id_map[name] = obj
        return name_id_map


class OperatingSystemManager(models.Manager):
    def get_or_create_by_name(self, name, version, platform_type=None):
        if not name or not version:
            return None
        try:
            return self.get(name=name, version=version)
        except:
            if not platform_type:
                lower_case_name = name.lower()
                for _type, _ in self.model.OS_TYPES:
                    if _type.lower() in lower_case_name:
                        platform_type = _type
                        return self.create(name=name, version=version, platform_type=platform_type)

    def get_by_names(self, names):
        names = set(names)
        name_id_map = {}
        for name in names:
            try:
                obj = self.get(name=name)
            except:
                pass
            else:
                name_id_map[name] = obj
        return name_id_map


class DeviceBaseManager(models.Manager):
    # Inherit from RBACManager once RBAC is implemented for all device types

    @property
    def _OS_MODEL(self):
        return self.model._meta.get_field('os').related_model

    @property
    def _MODEL_MODEL(self):
        return self.model._meta.get_field('model').related_model

    @property
    def _MANUFACTURE_MODEL(self):
        try:
            return self.model._meta.get_field('manufacturer').related_model
        except:
            return self._MODEL_MODEL._meta.get_field('manufacturer').related_model

    def _get_or_create_its_manufacture_and_model_by_name(self, manufacturer_name, model_name):
        manufacturer, model = None, None
        if model_name:
            try:
                model = self._MODEL_MODEL.objects.get(name__icontains=model_name)
                manufacturer = model.manufacturer
            except:
                pass
        if not manufacturer and manufacturer_name:
            manufacturer = self._MANUFACTURE_MODEL.objects.filter(name__icontains=manufacturer_name).first()

        if manufacturer and not model and model_name:
            model = self._MODEL_MODEL.objects.filter(manufacturer=manufacturer, name=model_name).first()

        if not manufacturer:
            manufacturer = self._MANUFACTURE_MODEL.objects.create(name=manufacturer_name)
        if manufacturer and not model:
            model = self._MODEL_MODEL.objects.create(manufacturer=manufacturer, name=model_name)

        return manufacturer, model

    def _get_or_create_its_os_by_name(self, os_name, os_version):
        return self._OS_MODEL.objects.get_or_create_by_name(name=os_name, version=os_version)

    def extract_version(self, version_string):
        # Match versions with optional 'v' or 'Version', allowing hyphens
        match = re.search(r'(?:v|Version\s*)?([\d.]+(?:-[\dA-Za-z]+)?)', version_string)
        if match:
            return match.group(1)  # Extracted version
        return ''.join(re.findall(r'\d+', version_string))  # Extract only numeric characters if no match

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        discovery = discovered_resource.discovery
        manufacturer, model = self._get_or_create_its_manufacture_and_model_by_name(discovered_resource.manufacturer, discovered_resource.model)
        firmware_version = self.extract_version(discovered_resource.details.get('version')) or discovered_resource.details.get('FirmwareVersion')
        uptime = discovered_resource.details.get('uptime')
        last_rebooted = None
        if uptime:
            match = re.match(r'(\d+) days?, (\d+):(\d+):(\d+)\.(\d+)', uptime)
            if match:
                days, hours, minutes, seconds, milliseconds = map(int, match.groups())
                last_rebooted = timezone.now() - timedelta(days=days, hours=hours, minutes=minutes, seconds=seconds,
                                                           milliseconds=milliseconds)
        data = {
            "uuid": discovered_resource.uuid,
            "name": discovered_resource.name,
            "collector": discovery.collector,
            # "datacenter": discovery.default_datacenter,
            # "cabinet": discovery.default_cabinet,
            "serial_number": discovered_resource.serial_number,
            "system_object_oid": discovered_resource.system_object_oid,
            "management_ip": discovered_resource.ip_address,
            "dns_name": discovered_resource.dns_name,
            "description": discovered_resource.details.get('SysDescription'),
            "discovery_method": ','.join(discovered_resource.discovered_methods),
            "uptime": uptime,
            "cpu": discovered_resource.details.get('CPU') or None,
            "memory": discovered_resource.details.get('Memory') or None,
            "first_discovered": discovered_resource.first_discovered,
            "last_discovered": discovered_resource.last_discovered,
            "model": model,
            "firmware_version": firmware_version,
            "last_rebooted": last_rebooted,
            'fan': discovered_resource.details.get('fan_count') or 0,
            # "os_name": discovered_resource.operating_system,
            # "version_number": discovered_resource.details.get('version'),
            'flash_memory': discovered_resource.details.get('FlashMemory'),
            'boot_rom_supported': bool(discovered_resource.details.get('BootROMSupported', False)),
        }

        if discovery.update_location:
            if onboarded_resource:
                if hasattr(onboarded_resource, 'datacenter') and onboarded_resource.datacenter is None:
                    data["datacenter"] = discovery.default_datacenter
                if hasattr(onboarded_resource, 'cabinet') and onboarded_resource.cabinet is None:
                    data["cabinet"] = discovery.default_cabinet
            else:
                data["datacenter"] = discovery.default_datacenter
                data["cabinet"] = discovery.default_cabinet

        return data

    def get_device_if_exsist(self, discovered_resource):
        try:
            return self.model.objects.get(name=discovered_resource.name, customer=discovered_resource.discovery.customer)
        except:
            pass

    def create_update_related_data(self, device, discovered_resource):
        from unity_discovery.models import (
            DeviceIPAddress, DeviceOperatingSystem, DeviceInterfaceMacAddress, DeviceInterfaceRemoteData,
            NetworkDeviceHardwareDetails
        )
        content_type = ContentType.objects.get_for_model(device.__class__)
        device_id = device.id
        details = discovered_resource.details
        now = timezone.now()

        # ------------------ IP ADDRESS ------------------
        ip_address = details.get("ip_address")
        not_deleted_ip_ids = []
        if ip_address:
            existing_ip = DeviceIPAddress.all_objects.filter(
                content_type=content_type,
                device_id=device_id,
                address=ip_address
            ).first()
            first_discovered_ip = existing_ip.first_discovered if existing_ip else now
            last_discovered_ip = details.get("last_scan_date") or now

            ip_obj, created = DeviceIPAddress.all_objects.update_or_create(
                content_type=content_type,
                device_id=device_id,
                address=ip_address,
                defaults={
                    "name": details.get("name") or ip_address,
                    "name_format": details.get("ip_name_format", "IP"),
                    "address_type": details.get("ip_protocol_type", "IPv4"),
                    "subnet_mask": details.get("ip_subnet_mask"),
                    "protocol_type": details.get("protocol_type"),
                    "short_description": details.get("short_description") or ip_address,
                    "description": details.get("description") or ip_address,
                    "first_discovered": first_discovered_ip,
                    "last_discovered": last_discovered_ip,
                    "updated_at": details.get("last_modified_date") or now,
                },
            )
            if created:
                ip_obj.first_discovered = last_discovered_ip
                ip_obj.last_discovered = last_discovered_ip
            else:
                ip_obj.is_deleted = False  # Entry Found so update the obj state - This handles duplication of records
            ip_obj.save()
            not_deleted_ip_ids.append(ip_obj.id)
        DeviceIPAddress.all_objects.filter(
            content_type=content_type,
            device_id=device_id
        ).exclude(id__in=not_deleted_ip_ids).delete()  # Soft Delete

        # ------------------ OPERATING SYSTEM ------------------
        os_name = details.get("OS_Name") or details.get("os")
        not_deleted_os_ids = []
        if os_name:
            existing_os = DeviceOperatingSystem.all_objects.filter(
                content_type=content_type,
                device_id=device_id,
                name=os_name
            ).first()
            first_discovered_os = existing_os.first_discovered if existing_os else now
            last_discovered_os = now

            os_obj, created = DeviceOperatingSystem.all_objects.update_or_create(
                content_type=content_type,
                device_id=device_id,
                name=os_name,
                defaults={
                    "short_description": details.get("OS_Name_Format") or os_name,
                    "manufacturer": details.get("OS_Manufacturer"),
                    "model": details.get("OS_ModelVersion") or details.get("model"),
                    "version_number": details.get("version") or details.get("OS_VersionNumber"),
                    "build_number": details.get("OS_BuildNumber"),
                    "build_type": details.get("OS_BuildType"),
                    "service_pack": details.get("OS_ServicePack"),
                    "name_format": details.get("OS_Name_Format", "OSName"),
                    "patch_number": details.get("OS_PatchNumber"),
                    "serial_number": details.get("SerialNumber"),
                    "system_directory": details.get("OS_SystemDirectory"),
                    "os_type": details.get("OS_Type") or details.get("OStype"),
                    "market_version": details.get("OS_Market_Version"),
                    "product_type": details.get("OS_ProductType") or details.get("OS_Product_Type"),
                    "description": details.get("description") or os_name,
                    "first_discovered": first_discovered_os,
                    "last_discovered": last_discovered_os,
                    "updated_at": now,
                },
            )
            if created:
                os_obj.first_discovered = last_discovered_os
                os_obj.last_discovered = last_discovered_os
            else:
                os_obj.is_deleted = False  # Entry Found so update the obj state - This handles duplication of records
            os_obj.save()
            not_deleted_os_ids.append(os_obj.id)
        DeviceOperatingSystem.all_objects.filter(
            content_type=content_type,
            device_id=device_id
        ).exclude(id__in=not_deleted_os_ids).delete()  # Soft Delete

        # ------------------ INTERFACES AND MAC ADDRESSES ------------------
        not_deleted_if_ids = []
        for index, iface in enumerate(details.get("Interfaces", []), start=1):
            interface_name = iface.get("name")
            if not interface_name:
                continue

            existing_iface = DeviceInterfaceRemoteData.all_objects.filter(
                content_type=content_type,
                device_id=device_id,
                name=interface_name
            ).first()
            first_discovered_iface = existing_iface.first_discovered if existing_iface else now
            last_discovered_iface = now

            iface_instance, created = DeviceInterfaceRemoteData.all_objects.update_or_create(
                content_type=content_type,
                device_id=device_id,
                name=interface_name,
                defaults={
                    "index": index,
                    "description": iface.get("description"),
                    "physical_description": iface.get("physical_description"),
                    "interface_id": iface.get("interface_id"),
                    "ip_address": iface.get("ip_address"),
                    "mac_address": iface.get("mac_address"),
                    "type": iface.get("type"),
                    "status": iface.get("status"),
                    "speed": iface.get("speed"),
                    "remote_devices": iface.get("remote_devices"),
                    "auto_sense": iface.get("auto_sense", False),
                    "full_duplex": iface.get("full_duplex", False),
                    "manufacturer": iface.get("manufacturer"),
                    "max_speed": iface.get("max_speed"),
                    "speed_configured": iface.get("speed_configured"),
                    "name_format": iface.get("name_format"),
                    "first_discovered": first_discovered_iface,
                    "last_discovered": last_discovered_iface,
                    "updated_at": now,
                },
            )
            if created:
                iface_instance.first_discovered = last_discovered_iface
                iface_instance.last_discovered = last_discovered_iface
            else:
                iface_instance.is_deleted = False  # Entry Found so update the obj state - This handles duplication of records
            iface_instance.save()
            not_deleted_if_ids.append(iface_instance.id)

            # Save MAC address in DeviceInterfaceMacAddress table
            mac_address = iface.get("mac_address")
            if mac_address:
                existing_mac = DeviceInterfaceMacAddress.all_objects.filter(
                    content_type=ContentType.objects.get_for_model(iface_instance),
                    object_id=iface_instance.id
                ).first()
                first_discovered_mac = existing_mac.first_discovered if existing_mac else now
                last_discovered_mac = now

                mac_obj, created = DeviceInterfaceMacAddress.all_objects.update_or_create(
                    content_type=ContentType.objects.get_for_model(iface_instance),
                    object_id=iface_instance.id,
                    name=mac_address,
                    defaults={
                        "description": iface.get("description"),
                        "short_description": iface.get("description") or interface_name,
                        "name_format": "MAC",
                        "first_discovered": first_discovered_mac,
                        "last_discovered": last_discovered_mac,
                        "updated_at": now,
                    },
                )
                if created:
                    mac_obj.first_discovered = last_discovered_mac
                    mac_obj.last_discovered = last_discovered_mac
                else:
                    mac_obj.is_deleted = False  # Entry Found so update the obj state - This handles duplication of records
                mac_obj.save()
                DeviceInterfaceMacAddress.all_objects.filter(
                    content_type=ContentType.objects.get_for_model(iface_instance),
                    object_id=iface_instance.id,
                ).exclude(id=mac_obj.id).delete()  # Soft Delete

        all_device_interfaces = DeviceInterfaceRemoteData.all_objects.filter(
            content_type=content_type,
            device_id=device_id
        )
        all_device_interface_macs = DeviceInterfaceMacAddress.all_objects.filter(
            content_type=ContentType.objects.get_for_model(DeviceInterfaceRemoteData),
            object_id__in=list(all_device_interfaces.values_list("id", flat=True))
        )
        deleted_device_interfaces = all_device_interfaces.exclude(id__in=not_deleted_if_ids)
        deleted_device_interface_macs = all_device_interface_macs.filter(
            content_type=ContentType.objects.get_for_model(DeviceInterfaceRemoteData),
            object_id__in=list(deleted_device_interfaces.values_list("id", flat=True))
        )
        deleted_device_interface_macs.delete()  # Soft Delete
        deleted_device_interfaces.delete()  # Soft Delete

        # ------------------ HARDWARE DETAILS ------------------
        hw_components = details.get("HardwareInfo", [])
        not_deleted_hw_ids = []

        for hw in hw_components:
            hw_name = hw.get("name")
            manufacturer = hw.get("manufacturer")
            version = hw.get("version")
            serial_number = hw.get("serial_number")
            model = hw.get("model")
            short_description = hw.get("short_description") or hw_name

            # Check if existing record exists
            existing_hw = NetworkDeviceHardwareDetails.all_objects.filter(
                content_type=content_type,
                device_id=device_id,
                serial_number=serial_number
            ).first()

            first_discovered_hw = existing_hw.first_discovered if existing_hw else now
            last_discovered_hw = now

            nw_hw_obj, created = NetworkDeviceHardwareDetails.all_objects.update_or_create(
                content_type=content_type,
                device_id=device_id,
                serial_number=serial_number,
                defaults={
                    "name": hw_name,
                    "manufacturer": manufacturer,
                    "version": version,
                    "market_version": hw.get("market_version"),
                    "short_description": short_description,
                    "model": model,
                    "first_discovered": first_discovered_hw,
                    "last_discovered": last_discovered_hw,
                    "updated_at": now,
                }
            )
            if created:
                nw_hw_obj.first_discovered = last_discovered_hw
                nw_hw_obj.last_discovered = last_discovered_hw
            else:
                nw_hw_obj.is_deleted = False  # Entry Found so update the obj state - This handles duplication of records
            nw_hw_obj.save()
            not_deleted_hw_ids.append(nw_hw_obj.id)
        NetworkDeviceHardwareDetails.all_objects.filter(
            content_type=content_type,
            device_id=device_id
        ).exclude(id__in=not_deleted_hw_ids).delete()  # Soft Delete

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        # if update and discovered_resource.onboarded_device:
        #     self.model.objects.filter(
        #         id=discovered_resource.onboarded_device.id
        #     ).update(**self.get_field_mapped_with_discovery(
        #         discovered_resource,
        #         onboarded_resource=discovered_resource.onboarded_device
        #     ))
        #     return discovered_resource.onboarded_device, False
        device = self.get_device_if_exsist(discovered_resource)
        if update and device:
            data = self.get_field_mapped_with_discovery(discovered_resource, onboarded_resource=device)
            self.model.objects.filter(id=device.id).update(**data)
            return device, False
        if create and not device:
            data = self.get_field_mapped_with_discovery(discovered_resource)
            device = self.model.objects.create(**data)
            return device, True

        return None, None


class NetworDeviceManager(DeviceBaseManager):

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        field_map = super(NetworDeviceManager, self).get_field_mapped_with_discovery(discovered_resource, onboarded_resource=onboarded_resource)
        field_map['os_name'] = discovered_resource.operating_system
        field_map['os_type'] = discovered_resource.os_type
        field_map['version_number'] = discovered_resource.details.get('version', '').strip().title() or None

        # Additional fields from your model based on response
        details = discovered_resource.details or {}

        field_map.update({
            "short_description": details.get("ShortDescription"),
            "host_name": details.get("hostname"),
            "primary_capability": details.get("Primary_Capability"),
            "capability_list": details.get("Capability_List"),
            "flash_memory": details.get("FlashMemory"),
            "supported": True,  # default to True if not provided
            "physical_memory": details.get("Memory"),
            "boot_rom_supported": details.get("BootROMSupported") == "Yes",
            "dhcp_use": True,  # default True
            "system_type": details.get("SystemType") or details.get("device_type"),
            "integrity": True,  # default True
            "expansion": details.get("Expansion"),
            "frequency": details.get("CPUFrequency"),
            "input_current": details.get("InputCurrent"),
            "input_voltage": details.get("InputVoltage"),
            "reset_limit": details.get("ResetCapability"),
            "ports_per_slot": details.get("PortsPerSlot"),
            "max_consumption": details.get("MaxConsumption"),
            "number_of_slots": details.get("NumberOfSlots"),
            "configuration_options": details.get("ConfigurationOptions"),
            "reset_count": details.get("ResetCount"),
            "data_rate": details.get("DataRate"),
            "chassis_bootup_state": details.get("ChassisBootupState"),
            "thermal_state": details.get("ThermalState"),
        })
        return field_map

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        device, created = super(NetworDeviceManager, self).update_or_create_from_discovery(discovered_resource, create=create, update=update)
        if device:
            device.customers.add(discovered_resource.discovery.customer)
            credentials = [cred for cred in
                           [discovered_resource.redfish_credential, discovered_resource.snmp_credential] if cred]
            if credentials:
                device.credentials_m2m.add(*credentials)

            self.create_update_related_data(device, discovered_resource)

        return device, created

    def get_device_if_exsist(self, discovered_resource):
        try:
            return self.model.objects.get(name=discovered_resource.name, customers=discovered_resource.discovery.customer)
        except:
            pass


class SwitchManager(NetworDeviceManager, RBACManager):
    
    # below method needs to move to DeviceBaseManager
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        field_map = super(SwitchManager, self).get_field_mapped_with_discovery(
            discovered_resource,
            onboarded_resource=onboarded_resource
        )
        memory_value = field_map.pop('memory', None)
        if memory_value is not None:
            if isinstance(memory_value, (int, float)):
                field_map['memory'] = float(memory_value) * 1024
            else:
                field_map['memory'] = float(str(memory_value).split()[0]) * 1024
        if 'REDFISH' in discovered_resource.discovered_methods:
            field_map['redfish'] = True
        return field_map

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        device, created = super(SwitchManager, self).update_or_create_from_discovery(discovered_resource, create=create, update=update)
        if device:
            if device.redfish:
                device.create_update_component_proxy()

        return device, created


class FirewallManager(NetworDeviceManager, RBACManager):
    
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()


class LoadBalancerManager(NetworDeviceManager, RBACManager):
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()


class StorageDeviceManager(DeviceBaseManager):

    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()


    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        field_map = super(StorageDeviceManager, self).get_field_mapped_with_discovery(
            discovered_resource,
            onboarded_resource=onboarded_resource
        )
        field_map['customer'] = discovered_resource.discovery.customer
        memory_value = field_map.pop('memory', None)
        field_map['memory'] = float(memory_value.split()[0]) * 1024 if memory_value is not None else None
        field_map['cpu'] = field_map.pop('cpu')
        disk_size = discovered_resource.details.get('DiskSize')
        field_map['storage_capacity'] = int(disk_size.split()[0]) if disk_size and disk_size.split()[
            0].isdigit() else None
        if field_map.get('model'):
            field_map['manufacturer'] = field_map.get('model').manufacturer
        version = discovered_resource.details.get('version', '').strip().title() if discovered_resource.details.get(
            'version') else None
        os = self._get_or_create_its_os_by_name(discovered_resource.operating_system, version)
        field_map['os'] = os
        if 'REDFISH' in discovered_resource.discovered_methods:
            field_map['redfish'] = True
        return field_map

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        device, created = super(StorageDeviceManager, self).update_or_create_from_discovery(discovered_resource, create=create, update=update)
        if device:
            credentials = [cred for cred in
                           [discovered_resource.redfish_credential, discovered_resource.snmp_credential] if cred]
            if credentials:
                device.credentials_m2m.add(*credentials)

            if device.redfish:
                device.create_update_component_proxy()

        return device, created


class ServerDeviceManager(DeviceBaseManager):
    
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        field_map = super(ServerDeviceManager, self).get_field_mapped_with_discovery(discovered_resource, onboarded_resource=onboarded_resource)
        field_map['customer'] = discovered_resource.discovery.customer
        field_map['num_cpus'] = field_map.pop('cpu')
        memory_value = field_map.pop('memory', None)
        field_map['num_cores'] = discovered_resource.details.get('cpu_core') or 0
        field_map['memory_mb'] = float(memory_value.split()[0]) * 1024 if memory_value is not None else None
        field_map['capacity_gb'] = float(discovered_resource.details['DiskSize'].split()[0]) if discovered_resource.details.get('DiskSize') else None
        if field_map.get('model'):
            field_map['manufacturer'] = field_map.get('model').manufacturer
        version = discovered_resource.details.get('version', '').strip().title() if discovered_resource.details.get('version') else None
        os = self._get_or_create_its_os_by_name(discovered_resource.operating_system, version)
        field_map['os'] = os
        if 'REDFISH' in discovered_resource.discovered_methods:
            field_map['redfish'] = True
        return field_map

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        device, created = super(ServerDeviceManager, self).update_or_create_from_discovery(discovered_resource, create=create, update=update)
        if device:
            credentials = [cred for cred in [discovered_resource.redfish_credential, discovered_resource.snmp_credential] if cred]
            if credentials:
                device.credentials_m2m.add(*credentials)

            if device.redfish:
                device.create_update_component_proxy()

        return device, created


class PDUManager(DeviceBaseManager):
    def _get_or_create_its_manufacture_and_model_by_name(self, manufacturer_name, model_name):
        manufacturer, model = None, None

        if model_name:
            try:
                model = self._MODEL_MODEL.objects.get(name__icontains=model_name)
                manufacturer = model.manufacturer
            except:
                pass
        if not manufacturer and manufacturer_name:
            manufacturer = self._MANUFACTURE_MODEL.objects.filter(name__icontains=manufacturer_name).first()

        if manufacturer and not model and model_name:
            model = self._MODEL_MODEL.objects.filter(manufacturer=manufacturer, model_number=model_name).first()

        if not manufacturer:
            manufacturer = self._MANUFACTURE_MODEL.objects.create(name=manufacturer_name)
        if manufacturer and not model:
            model = self._MODEL_MODEL.objects.create(manufacturer=manufacturer, model_number=model_name)

        return manufacturer, model

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        discovery = discovered_resource.discovery
        manufacturer, model = self._get_or_create_its_manufacture_and_model_by_name(discovered_resource.manufacturer, discovered_resource.model)
        data = {
            "uuid": discovered_resource.uuid,
            "name": discovered_resource.name,
            "collector": discovery.collector,
            "serialnumber": discovered_resource.serial_number,
            "system_object_oid": discovered_resource.system_object_oid,
            "management_ip": discovered_resource.ip_address,
            "description": discovered_resource.details.get('SysDescription'),
            "discovery_method": ','.join(discovered_resource.discovered_methods),
            "first_discovered": discovered_resource.first_discovered,
            "last_discovered": discovered_resource.last_discovered,
            "model": model,
            "manufacturer": manufacturer,
            "customer": discovered_resource.discovery.customer,
            "sockets": 0,
            "os_name": discovered_resource.operating_system
        }
        if discovery.update_location:
            if onboarded_resource:
                if hasattr(onboarded_resource, 'cabinet') and onboarded_resource.cabinet is None:
                    data["cabinet"] = discovery.default_cabinet
            else:
                data["cabinet"] = discovery.default_cabinet

        return data


class CustomDeviceManager(NetworDeviceManager):

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        discovery = discovered_resource.discovery
        # manufacturer, model = self._get_or_create_its_manufacture_and_model_by_name(discovered_resource.manufacturer,
        #                                                                             discovered_resource.model)
        name = discovered_resource.name or discovered_resource.ip_address
        return {
            "uuid": discovered_resource.uuid,
            "name": name,
            "collector": discovery.collector,
            "serial_number": discovered_resource.serial_number,
            "management_ip": discovered_resource.ip_address,
            "description": discovered_resource.details.get('SysDescription'),
            "datacenter": discovery.default_datacenter,
            "cabinet": discovery.default_cabinet,
            "ip_address": discovered_resource.ip_address,
            # "discovery_method": ','.join(discovered_resource.discovered_methods),
            # "first_discovered": discovered_resource.first_discovered,
            # "last_discovered": discovered_resource.last_discovered,
            # "model": model,
            # "manufacturer": manufacturer,
            # "customers": discovered_resource.discovery.customer,
            # "os_name": discovered_resource.operating_system
        }


class SmartPDUManager(DeviceBaseManager):

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        discovery = discovered_resource.discovery
        manufacturer, model = self._get_or_create_its_manufacture_and_model_by_name(discovered_resource.manufacturer, discovered_resource.model)
        firmware_version = self.extract_version(discovered_resource.details.get('version')) or discovered_resource.details.get('FirmwareVersion')
        uptime = discovered_resource.details.get('uptime')
        last_rebooted = None
        if uptime:
            match = re.match(r'(\d+) days?, (\d+):(\d+):(\d+)\.(\d+)', uptime)
            if match:
                days, hours, minutes, seconds, milliseconds = map(int, match.groups())
                last_rebooted = timezone.now() - timedelta(
                    days=days,
                    hours=hours,
                    minutes=minutes,
                    seconds=seconds,
                    milliseconds=milliseconds
                )
        pdu_object_id = discovered_resource.system_object_oid
        fan_count = discovered_resource.details.get('fan_count', 0)
        try:
            fan_count = int(fan_count)
        except (TypeError, ValueError):
            fan_count = 0
        data = {
            "uuid": discovered_resource.uuid,
            "name": discovered_resource.name,
            "collector": discovery.collector,
            "serial_number": discovered_resource.serial_number,
            "pdu_object_oid": pdu_object_id if pdu_object_id else None,
            "ip_address": discovered_resource.ip_address,
            "dns_name": discovered_resource.dns_name,
            "description": discovered_resource.details.get('SysDescription'),
            "discovery_method": ','.join(discovered_resource.discovered_methods),
            "uptime": uptime,
            "first_discovered": discovered_resource.first_discovered,
            "last_discovered": discovered_resource.last_discovered,
            "model": model,
            "firmware": firmware_version,
            "last_rebooted": last_rebooted,
            'fan': fan_count,
            "os_name": discovered_resource.operating_system,
            "customer": discovery.customer
        }
        if discovery.update_location:
            if onboarded_resource:
                if hasattr(onboarded_resource, 'datacenter') and onboarded_resource.datacenter is None:
                    data["datacenter"] = discovery.default_datacenter
                if hasattr(onboarded_resource, 'cabinet') and onboarded_resource.cabinet is None:
                    data["cabinet"] = discovery.default_cabinet
            else:
                data["datacenter"] = discovery.default_datacenter
                data["cabinet"] = discovery.default_cabinet
        return data

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        from app.inventory.models import Sensor
        device = self.get_device_if_exsist(discovered_resource)
        if update and device:
            data = self.get_field_mapped_with_discovery(discovered_resource, onboarded_resource=device)
            self.model.objects.filter(id=device.id).update(**data)
            return device, False
        if create and not device:
            data = self.get_field_mapped_with_discovery(discovered_resource)
            device = self.model.objects.create(**data)
            if discovered_resource.snmp_credential:
                device.credentials_m2m.add(discovered_resource.snmp_credential)
            if discovered_resource.ssh_credential:
                device.credentials_m2m.add(discovered_resource.ssh_credential)
            if discovered_resource.windows_credential:
                device.credentials_m2m.add(discovered_resource.windows_credential)
            if discovered_resource.redfish_credential:
                device.credentials_m2m.add(discovered_resource.redfish_credential)
            related_sensors = Sensor.objects.filter(ip_address=data["ip_address"])
            if related_sensors:
                related_sensors.update(smart_pdu=device)
            return device, True
        return None, None


class SensorManager(DeviceBaseManager):

    def get_field_mapped_with_discovery(self, discovered_resource, onboarded_resource=None):
        discovery = discovered_resource.discovery
        manufacturer, model = self._get_or_create_its_manufacture_and_model_by_name(discovered_resource.manufacturer, discovered_resource.model)
        firmware_version = self.extract_version(discovered_resource.details.get('version')) or discovered_resource.details.get('FirmwareVersion')
        uptime = discovered_resource.details.get('uptime')
        last_rebooted = None
        if uptime:
            match = re.match(r'(\d+) days?, (\d+):(\d+):(\d+)\.(\d+)', uptime)
            if match:
                days, hours, minutes, seconds, milliseconds = map(int, match.groups())
                last_rebooted = timezone.now() - timedelta(
                    days=days,
                    hours=hours,
                    minutes=minutes,
                    seconds=seconds,
                    milliseconds=milliseconds
                )
        sensor_object_id = discovered_resource.system_object_oid
        fan_count = discovered_resource.details.get('fan_count', 0)
        try:
            fan_count = int(fan_count)
        except (TypeError, ValueError):
            fan_count = 0
        data = {
            "uuid": discovered_resource.uuid,
            "name": discovered_resource.name,
            "collector": discovery.collector,
            "serial_number": discovered_resource.serial_number,
            "sensor_object_oid": sensor_object_id if sensor_object_id else None,
            "ip_address": discovered_resource.ip_address,
            "description": discovered_resource.details.get('SysDescription'),
            "discovery_method": ','.join(discovered_resource.discovered_methods),
            "uptime": uptime,
            "first_discovered": discovered_resource.first_discovered,
            "last_discovered": discovered_resource.last_discovered,
            "model": model,
            "last_rebooted": last_rebooted,
            "customer": discovery.customer
        }
        if data.get("model", None) and "DX-2" in data.get("model").name:
            data["sensor_type"] = "Environment Sensor"
        if discovery.update_location:
            if onboarded_resource:
                if hasattr(onboarded_resource, 'datacenter') and onboarded_resource.datacenter is None:
                    data["datacenter"] = discovery.default_datacenter
                if hasattr(onboarded_resource, 'cabinet') and onboarded_resource.cabinet is None:
                    data["cabinet"] = discovery.default_cabinet
            else:
                data["datacenter"] = discovery.default_datacenter
                data["cabinet"] = discovery.default_cabinet
        return data

    def update_or_create_from_discovery(self, discovered_resource, create=True, update=True):
        from app.inventory.models import SmartPDU
        device = self.get_device_if_exsist(discovered_resource)
        if update and device:
            data = self.get_field_mapped_with_discovery(discovered_resource, onboarded_resource=device)
            self.model.objects.filter(id=device.id).update(**data)
            return device, False
        if create and not device:
            data = self.get_field_mapped_with_discovery(discovered_resource)
            device = self.model.objects.create(**data)
            if discovered_resource.snmp_credential:
                device.credentials_m2m.add(discovered_resource.snmp_credential)
            if discovered_resource.ssh_credential:
                device.credentials_m2m.add(discovered_resource.ssh_credential)
            if discovered_resource.windows_credential:
                device.credentials_m2m.add(discovered_resource.windows_credential)
            if discovered_resource.redfish_credential:
                device.credentials_m2m.add(discovered_resource.redfish_credential)
            related_smart_pdu = SmartPDU.objects.filter(ip_address=data["ip_address"], customer=device.customer).first()
            if related_smart_pdu:
                device.smart_pdu = related_smart_pdu
                device.save()
            return device, True
        return None, None

class DeviceCommonBaseManager(models.Manager):
    def get_queryset(self):
        return DeviceBaseQuerySet(self.model, using=self._db).alive()
