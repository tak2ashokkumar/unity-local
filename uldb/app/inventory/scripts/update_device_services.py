import traceback
import logging
from django.contrib.contenttypes.models import ContentType
from django.db import models

from app.inventory.models import Device
from app.organization.models import Organization
from cloud.VmwareAdapter.models import VmwareVmMigration
from rest.customer.utils import check_template_name_for_host, check_linux_connection, check_windows_connection
from rest.customer.tasks import (process_services_from_zabbix, sync_device_service_data, get_linux_services,
                                 get_windows_services)

logger = logging.getLogger(__name__)


def update_services(device_class, platform_type, customer_id):
    model = VmwareVmMigration
    qs = model.objects.filter(cloud__organization_id=customer_id)
    for obj in qs:
        try:
            operating_system = None
            template_check = None
            obj_content_type = obj.__class__.__name__.lower()
            content_type_obj = ContentType.objects.get_for_model(obj)
            app_label = content_type_obj.app_label
            device_id = obj.id
            customer = Organization.objects.get(id=customer_id)
            if obj.DEVICE_TYPE == 'baremetal':
                obj = obj.server
            if hasattr(obj, 'os'):
                operating_system = obj.os
                if isinstance(operating_system, models.Model):
                    operating_system = operating_system.name
            if hasattr(obj, 'os_name'):
                operating_system = obj.os_name
            if hasattr(obj, 'guest_os'):
                operating_system = obj.guest_os
            if obj.zabbix and obj.connection_type == 'Agent':
                host_id = obj.zabbix.host_id
                template_check = check_template_name_for_host(customer, host_id)
                if template_check:
                    process_services_from_zabbix.delay(
                        device_name=obj.name,
                        device_id=device_id,
                        app_label=app_label,
                        obj_content_type=obj_content_type,
                        customer_id=customer_id,
                        host_id=host_id,
                        template_check=template_check
                    )
            if not obj.zabbix or obj.connection_type != 'Agent' or not template_check:
                if obj.credentials_m2m.exists():
                    ip_address = obj.ip_address
                    windows_cred = obj.credentials_m2m.filter(connection_type='Windows').first()
                    ssh_cred = obj.credentials_m2m.filter(connection_type='SSH').first()
                    if windows_cred:
                        username = windows_cred.username
                        password = windows_cred.password
                        if not check_windows_connection(ip_address, username, password):
                            sync_device_service_data.delay(
                                obj_content_type=obj_content_type,
                                app_label=app_label,
                                device_name=obj.name,
                                ip_address=ip_address,
                                device_id=device_id,
                                customer_id=customer_id,
                                operating_system=operating_system
                            )
                        else:
                            get_windows_services.delay(customer_id, ip_address, username, password, obj_content_type,
                                                              app_label, device_id)
                    elif ssh_cred:
                        username = ssh_cred.username
                        password = ssh_cred.password
                        if not check_linux_connection(ip_address, username, password):
                            sync_device_service_data.delay(
                                obj_content_type=obj_content_type,
                                app_label=app_label,
                                device_name=obj.name,
                                ip_address=ip_address,
                                device_id=device_id,
                                customer_id=customer_id,
                                operating_system=operating_system
                            )
                        else:
                            get_linux_services.delay(customer_id, ip_address, username, password, obj_content_type,
                                                            app_label, device_id)
                else:
                    sync_device_service_data.delay(
                        obj_content_type=obj_content_type,
                        app_label=app_label,
                        device_name=obj.name,
                        ip_address=obj.ip_address,
                        device_id=device_id,
                        customer_id=customer_id,
                        operating_system=operating_system
                    )

        except Exception as e:
            print('Error while updating services for {}'.format(obj.id))
            logger.error(traceback.format_exc())

def run():
    dev_class = str(input("Enter device class: "))
    platform_type = str(input("Enter platform type: "))
    customer_id = int(input("Enter customer id: "))
    update_services(dev_class, platform_type, customer_id)
